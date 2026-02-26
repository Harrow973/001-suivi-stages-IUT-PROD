import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimit, chatRateLimiter } from "@/lib/rate-limit";

// Route segment config
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route pour le chat avec Groq Cloud
 *
 * POST /api/chat
 * Body: { message: string, history?: Array<{role: string, content: string}> }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit(request, chatRateLimiter);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const body = await request.json();
    const { message, history = [] } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Le message est requis" },
        { status: 400 }
      );
    }

    // Limite de longueur pour mitiger prompt injection et abus
    const MAX_MESSAGE_LENGTH = 2000;
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Filtrage basique des tentatives de prompt injection évidentes
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
      /disregard\s+(all\s+)?(previous|prior)/i,
      /you\s+are\s+now\s+/i,
      /pretend\s+you\s+are/i,
      /act\s+as\s+if\s+you/i,
      /system\s*:\s*/i,
      /\[INST\]/i,
    ];
    if (injectionPatterns.some((p) => p.test(trimmedMessage))) {
      return NextResponse.json(
        { error: "Votre message contient des instructions non autorisées. Reformulez votre question." },
        { status: 400 }
      );
    }

    // Limiter l'historique à 4 derniers messages (2 échanges) pour rester sous la limite TPM Groq (6K/min)
    const limitedHistory = Array.isArray(history)
      ? history.slice(-4)
      : [];

    // Configuration Groq Cloud
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        {
          error: "La clé API Groq n'est pas configurée",
          isServiceUnavailable: true,
          hint: "Configurez GROQ_API_KEY dans vos variables d'environnement",
        },
        { status: 503 }
      );
    }
    const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    // System prompt condensé pour rester sous la limite TPM Groq (6K/min) et permettre plusieurs échanges
    const systemPrompt = `Tu es un assistant pour les étudiants de l'IUT de la Martinique (Université des Antilles) : stages, conventions, candidatures. Réponds en français, ton clair et concis.

PÉRIMÈTRE : Réponds UNIQUEMENT sur l'IUT de la Martinique (campus Schoelcher), ses formations et stages. Départements : INFO, GEA, HSE, MLT, TC. Si la question sort du cadre, dis poliment que tu es dédié à l'IUT et aux stages, et invite à reformuler.

COORDONNÉES : IUT Martinique – Campus Schoelcher, BP 7029, 97275 Schoelcher Cedex. Tél. 05 96 72 73 65. Sites : https://iut-martinique.univ-antilles.fr/ et https://www.univ-antilles.fr. En cas de doute (calendrier, responsable), oriente vers le site ou le secrétariat du département.

FORMATIONS : BUT (3 ans, grade Licence) et licences pro. Durées de stage variables par département (ex. MLT : 4 + 8 + 16 semaines). Détails maquette/ECTS → livret pédagogique, site IUT, responsable de BUT.

FICHE DE VALIDATION : Obligatoire avant la convention. L'étudiant décrit sujet, missions, objectifs, organisme, période. L'enseignant référent valide. Convention seulement après cette validation. Délais/format → secrétariat du département.

CONVENTION (résumé) : Établissement (Université des Antilles, IUT Martinique), organisme d'accueil (nom, adresse, SIRET, signataire), stagiaire (formation, sujet, dates), encadrement (référent IUT, tuteur entreprise). Points clés : gratification obligatoire si stage > 2 mois (15 % plafond horaire SS, à vérifier selon l'année) ; assurance RC ; confidentialité ; fin de stage = attestation, évaluation, rapport/soutenance. Pour le détail des articles, oriente vers les documents officiels ou le secrétariat.

TON RÔLE : Aider sur recherche de stage, CV, lettres de motivation, entretiens, démarches (convention, validation). Pour une info très précise ou qui peut changer, redirige vers le site IUT, le secrétariat ou l'enseignant référent.`;

    // Limiter la longueur de chaque message dans l'historique
    const maxHistoryMsgLength = 1000;
    const sanitizedHistory = limitedHistory.map((m: { role?: string; content?: string }) => ({
      role: m.role === "assistant" || m.role === "user" ? m.role : "user",
      content: typeof m.content === "string" ? m.content.slice(0, maxHistoryMsgLength) : "",
    })).filter((m: { content: string }) => m.content.length > 0);

    // Construire les messages pour Groq avec historique limité
    const messages = [
      { role: "system", content: systemPrompt },
      ...sanitizedHistory,
      { role: "user", content: trimmedMessage },
    ];

    // Appeler Groq Cloud API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Timeout de 60 secondes
    
    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: messages,
          temperature: 0.6,
          max_tokens: 512,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Timeout lors de la connexion à Groq. Le service peut être surchargé.');
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      // Gestion explicite du rate limit Groq (429) : renvoyer retry-after pour que l'utilisateur réessaie
      if (response.status === 429) {
        let retryAfterSec = 20;
        try {
          const retryHeader = response.headers.get("retry-after");
          if (retryHeader) retryAfterSec = Math.ceil(Number(retryHeader)) || 20;
          else {
            const parsed = JSON.parse(errorText) as { error?: { message?: string } };
            const msg = parsed?.error?.message ?? "";
            const match = msg.match(/try again in ([\d.]+)s/i);
            if (match) retryAfterSec = Math.ceil(Number(match[1])) || 20;
          }
        } catch {
          /* garder 20s par défaut */
        }
        return NextResponse.json(
          {
            error: `Trop de requêtes pour le moment. Veuillez réessayer dans ${retryAfterSec} secondes.`,
            isServiceUnavailable: true,
            retryAfterSeconds: retryAfterSec,
          },
          {
            status: 429,
            headers: { "Retry-After": String(retryAfterSec) },
          }
        );
      }
      throw new Error(`Erreur Groq: ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();
    const assistantMessage = result.choices?.[0]?.message?.content || "";

    if (!assistantMessage) {
      throw new Error('Aucune réponse générée par Groq');
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      model: groqModel,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    logger.error(
      "Erreur lors du chat",
      error instanceof Error ? error : new Error(errorMessage)
    );

    // Rate limit Groq (429) : message déjà renvoyé dans le bloc if (!response.ok)
    if (
      errorMessage.includes("rate_limit") ||
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("429")
    ) {
      return NextResponse.json(
        {
          error:
            "Limite de requêtes atteinte. Veuillez patienter quelques secondes puis réessayer.",
          isServiceUnavailable: true,
        },
        { status: 429 }
      );
    }
    // Autres erreurs Groq / indisponibilité
    if (
      errorMessage.includes("Groq") ||
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("API key")
    ) {
      return NextResponse.json(
        {
          error:
            "Le service de chat n'est pas disponible actuellement. Veuillez réessayer plus tard.",
          isServiceUnavailable: true,
          hint: "Vérifiez que GROQ_API_KEY est correctement configurée dans vos variables d'environnement",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Erreur lors du chat: ${errorMessage}` },
      { status: 500 }
    );
  }
}

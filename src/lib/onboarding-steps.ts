import { Tour } from 'nextstepjs'

export const etudiantsOnboardingSteps: Tour[] = [
  {
    tour: "etudiantsTour",
    steps: [
      {
        icon: "📝",
        title: "Déclarer un nouveau stage",
        content: "Cliquez ici pour déclarer un nouveau stage. Vous pouvez remplir le formulaire manuellement ou préremplir automatiquement depuis une convention PDF.",
        selector: "#onboarding-nouveau-stage",
        side: "top",
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🏢",
        title: "Consulter les entreprises",
        content: "Accédez à la liste des entreprises partenaires de l'IUT de la Martinique, filtrées par département. Vous pouvez voir les détails de chaque entreprise et les stages associés.",
        selector: "#onboarding-entreprises",
        side: "top",
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "💬",
        title: "Besoin d'aide ? Assistant virtuel",
        content: "  Découvrez notre assistant virtuel spécialisé sur l'IUT de la Martinique ! Il peut vous aider à :\n\n• Trouver des stages adaptés à votre formation\n• Comprendre les démarches administratives\n• Préparer votre candidature (CV, lettre de motivation)\n• Répondre à vos questions sur les conventions de stage\n• Donner des conseils sur la recherche d'entreprises en Martinique\n• Expliquer les processus de validation\n\n   Posez-lui toutes vos questions, il est disponible 24/7 et spécialement formé pour l'IUT de la Martinique !",
        selector: "#onboarding-aide",
        side: "top",
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🧭",
        title: "Navigation",
        content: "Utilisez le menu de navigation à gauche pour accéder rapidement aux différentes sections : Tableau de bord, Nouveau stage, Entreprises et Besoin d'aide.",
        selector: "#onboarding-navigation",
        side: "right",
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "✨",
        title: "Fonctionnalités disponibles",
        content: "Retrouvez ici un résumé des fonctionnalités principales : déclaration de stage, préremplissage depuis PDF, consultation des entreprises et chat avec l'assistant.",
        selector: "#onboarding-fonctionnalites",
        side: "top",
        pointerPadding: 4,
        pointerRadius: 8,
      },
    ],
  }
]


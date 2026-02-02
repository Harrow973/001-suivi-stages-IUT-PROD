import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local ou .env
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '../src/generated/client'

const prisma = new PrismaClient()

// Données à importer depuis le dump SQL MySQL
// Le secteur contient maintenant le code du département (INFO, GEA, HSE, MLT, TC)
// Les IDs commencent à 1
const entreprisesData = [
  { id: 1, nom: 'IUT de la Martinique', adresse: 'Campus de Schoelcher, Université des Antilles BP 7029', secteur: 'INFO', telephone: '0596727340', email: 'ste-scolarite@univ-antilles.fr' },
  { id: 2, nom: 'BEEPWAY.COM', adresse: 'rue de la cour campoche 97220 FORT DE FRANCE FRANCE', secteur: 'INFO', telephone: '05696429401', email: 'administratif@beepway.com' },
  { id: 3, nom: 'DIGITAL FREEDOM CARAIBE', adresse: 'SI RUE LAMARTINE 97200 FORT DE FRANCE FRANCE', secteur: 'INFO', telephone: '0596582298', email: 'contact@digitalfreedomcaraibe.com' },
  { id: 4, nom: 'TELDATAFLOW', adresse: '60 rue des eaux découpées 97200 FORT-DE-FRANCE MARTINIQUE', secteur: 'INFO', telephone: '0696221442', email: 'jerrytelle@gmail.com' },
  { id: 5, nom: 'YOOZ', adresse: 'Immeuble le sequoia, Parc d\'Andron 30470 AIMARGUES FRANCE', secteur: 'INFO', telephone: '+33 1 73 60 96 69', email: 'vincent.poulaindandecy@getyooz.com' },
  { id: 6, nom: 'PIL-MEDIA', adresse: 'Centre commercial place d\'arme 46 97232 LAMENTIN MARTINIQUE', secteur: 'INFO', telephone: '0596375185', email: 'secretariat@pil-media.com' },
  { id: 7, nom: 'CESAME ANTILLES', adresse: 'Immeuble albizia RD3 97232 LAMENTIN FRANCE', secteur: 'INFO', telephone: '0596512004', email: 'Didier.legier@socipar.com' },
  { id: 8, nom: 'KWEEVO', adresse: 'IMMEUBLE EULALIE APPARTEMENT 5 RESIDENCE LA AGNES 97290 MARIN MARTINIQUE', secteur: 'INFO', telephone: '0696718253', email: 'audrey.limery@kweevo.com' },
  { id: 9, nom: 'OUTREMER TELECOM', adresse: 'ZI DE LA JAMBETTE ZONE DE GROS DE LA JAMBETTE 97200 FORT DE FRANCE FRANCE', secteur: 'INFO', telephone: '0596896914', email: 's.bazire@outremer-telecom.fr' },
  { id: 10, nom: 'AMAZONIE INNOVATION', adresse: '17 LOTISSEMENT COTONNIERE EST 97351 MATOURY FRANCE', secteur: 'INFO', telephone: '0610824625', email: 'contact@amazonie-innovation.com' },
  { id: 11, nom: 'XTRALOG', adresse: '24 rue Raymond Berger - ZA La Marie 97224 DUCOS MARTINIQUE', secteur: 'INFO', telephone: '0696329203', email: 'd.largange@xtralog.com' },
]

const tuteursData = [
  { id: 1, nom: 'DUCLOS', prenom: 'Damien', telephone: '0596375185', email: 'dduclos@pil-media.com', id_entreprise: 6, etudiants_actuels: '8,6', etudiants_historique: null },
  { id: 2, nom: 'LIMERY', prenom: 'Audrey', telephone: '0696718253', email: 'audrey.limery@kweevo.com', id_entreprise: 8, etudiants_actuels: '10', etudiants_historique: null },
  { id: 3, nom: 'NICOLAS', prenom: 'Hervé', telephone: '0596892315', email: 'hnicolas@outremer-telecom.fr', id_entreprise: 9, etudiants_actuels: '11', etudiants_historique: null },
  { id: 4, nom: 'GRAND-BOIS', prenom: 'Malick', telephone: '0610824625', email: 'contact@amazonie-innovation.com', id_entreprise: 10, etudiants_actuels: '13', etudiants_historique: null },
  { id: 5, nom: 'LEGIER', prenom: 'Didier', telephone: '0696374867', email: 'Didier.legier@socipar.com', id_entreprise: 7, etudiants_actuels: '7', etudiants_historique: null },
  { id: 6, nom: 'JEAN', prenom: 'Christophe', telephone: '0590483030', email: 'christophe.jean@univ-antilles.fr', id_entreprise: 1, etudiants_actuels: '12,2,9', etudiants_historique: null },
  { id: 7, nom: 'ELISABETH', prenom: 'Erol', telephone: '05696429401', email: 'administratif@beepway.com', id_entreprise: 2, etudiants_actuels: '1', etudiants_historique: null },
  { id: 8, nom: 'FILIN', prenom: 'Aurélien', telephone: '0615603124', email: 'aurelien@digitalfreedomcaraibe.com', id_entreprise: 3, etudiants_actuels: '3', etudiants_historique: null },
  { id: 9, nom: 'TELLE', prenom: 'Jerry', telephone: '0696221442', email: 'jerrytelle@gmail.com', id_entreprise: 4, etudiants_actuels: '4', etudiants_historique: null },
  { id: 10, nom: 'POULAIN D\'ANDECY', prenom: 'Vincent', telephone: null, email: 'vincent.poulaindandecy@getyooz.com', id_entreprise: 5, etudiants_actuels: '5', etudiants_historique: null },
  { id: 11, nom: 'LARGANGE', prenom: 'Didier', telephone: '0696329203', email: 'd.largange@xtralog.com', id_entreprise: 11, etudiants_actuels: '15,14', etudiants_historique: null },
]

const etudiantsData = [
  { id: 1, nom: 'LOUISY-LOUIS', prenom: 'Rhonny', email: 'Rhonny.Louisy-Louis@etu.univ-antilles.fr', id_tuteur: 7 },
  { id: 2, nom: 'MORNET-HELOISE', prenom: 'Matthieu', email: 'Matthieu.Mornet-Heloise@enu.univ-antilles.fr', id_tuteur: 6 },
  { id: 3, nom: 'PAJOUL', prenom: 'Steven', email: 'Steven.Pajoul@etu.univ-antilles.fr', id_tuteur: 8 },
  { id: 4, nom: 'RETORY', prenom: 'Quentin', email: 'Quentin.Retory@etu.univ-antilles.fr', id_tuteur: 9 },
  { id: 5, nom: 'TRAQUE', prenom: 'Talia', email: 'Talia.Traque@etu.univ-antilles.fr', id_tuteur: 10 },
  { id: 6, nom: 'BELLAY', prenom: 'Krystal', email: 'Krystal.Bellay@etu.univ-antilles.fr', id_tuteur: 1 },
  { id: 7, nom: 'CESTO', prenom: 'Yanis', email: 'Yanis.Cesto@etu.univ-antilles.fr', id_tuteur: 5 },
  { id: 8, nom: 'CLIO', prenom: 'Kendrick', email: 'Kendrick.Clio@cru.univ-antilles.fr', id_tuteur: 1 },
  { id: 9, nom: 'DEPLANQUE', prenom: 'Clement', email: 'Clement.Deplanque@etu.univ-antilles.fr', id_tuteur: 6 },
  { id: 10, nom: 'DESIRE', prenom: 'Renald', email: 'Renald.Desire@etu.univ-antilles.fr', id_tuteur: 2 },
  { id: 11, nom: 'DRAPIN', prenom: 'Thimothee', email: 'Thimothee.Drapin@etu.univ-antilles.fr', id_tuteur: 3 },
  { id: 12, nom: 'GUSTAVE', prenom: 'Andy', email: 'Andy.Gustave@etu.univ-antilles.fr', id_tuteur: 6 },
  { id: 13, nom: 'HARROW', prenom: 'Jean-Michel', email: 'Jean-Michel.Harrow@etu.univ-antilles.fr', id_tuteur: 4 },
  { id: 14, nom: 'LEGENDRE', prenom: 'Alexis', email: 'Alexis.Legendre@etu.univ-antilles.fr', id_tuteur: 11 },
  { id: 15, nom: 'LOUIS-SIDNEY', prenom: 'Jahyna', email: 'Jahyna.Louissidney@etu.univ-antilles.fr', id_tuteur: 11 },
]

const stagesData = [
  { id: 1, sujet: 'Développement de logiciel en Python pour l\'analyse, le traitement et l\'exploitation de données', description: 'Conception d\'applications Python pour le nettoyage, l\'analyse et la visualisation de données. Compétences: Programmation Python DataOps Data Science', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 8, id_etudiant: 10, id_tuteur: 2 },
  { id: 2, sujet: 'Mise à niveau de l\'interfacades ordres missions en mode web responsive', description: 'Programmation web. Compétences: Framework VueJS, PHP, MySQL', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 9, id_etudiant: 11, id_tuteur: 3 },
  { id: 3, sujet: 'Développement d\'un interface web pour la gestion de machine virtuelle sous proximox', description: 'Conception et planification, Développement de l\'interface web, Sécurité et gestion des accès, Tests et validation, Documentation et finalisation', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 1, id_etudiant: 12, id_tuteur: 6 },
  { id: 4, sujet: 'Développement mobile frontend (react native)', description: '1) Intégration du formulaire d\'inscription dans l\'application 2) Développement d\'une interface permettant aux pros de trouver des pros. Compétences: Analyse & Conception d\'architecture d\'une application, Développement mobile frontend (react native)', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 10, id_etudiant: 13, id_tuteur: 4 },
  { id: 5, sujet: 'Amélioration d\'une application pilote en Laravel / php', description: 'Assistant développement PHP /Laravel/ mariadb', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 2, id_etudiant: 1, id_tuteur: 7 },
  { id: 6, sujet: 'Développement d\'un outil d\'apprentissage personnalisé basé sur l\'intelligence artificielle', description: 'Analyser les besoins pédagogiques et fonctionnels. Concevoir l\'architecture logicielle. Développer les modules IA (recommandation, adaptation). Tester et valider les fonctionnalités. Documenter et assurer le suivi du projet.', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 1, id_etudiant: 2, id_tuteur: 6 },
  { id: 7, sujet: 'Création de site web administratif', description: 'Assistant Webdesign - web design, Wordpress, css, javascript', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 3, id_etudiant: 3, id_tuteur: 8 },
  { id: 8, sujet: 'gestion et suivi de projet applicatif', description: 'Gestion et suivi de projet applicatif. Compétences à acquérir: gestion de projets; notions de programmation', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 7, id_etudiant: 7, id_tuteur: 5 },
  { id: 9, sujet: 'Développement d\'application web', description: 'Design et Développement informatique', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 6, id_etudiant: 8, id_tuteur: 1 },
  { id: 10, sujet: 'Développement d\'un système de génération de formulaires papier pour QCM, avec correction automatique', description: 'Conception d\'un module de génération dynamique de feuilles de QCM, développement d\'un outil de lecture/scan, système de correction automatique et reporting des résultats', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 1, id_etudiant: 9, id_tuteur: 6 },
  { id: 11, sujet: 'La conception (analyse de besoin, modélisation) Le développement (codage, implémentation) La validat', description: 'Conception d\'application. Développement logiciel (JavaScript, Python). Utilisation de frameworks (Angular). Test de validation et gestion de base de données (SQL, NoSQL).', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 4, id_etudiant: 4, id_tuteur: 9 },
  { id: 12, sujet: 'Automatisation des post-traitements de détection de Fraude pour réduire les fausses-alertes', description: 'Étudier les modules JSCRIPT existants. Proposer une solution pour intégrer ces modules dans un seul processus de post-traitement. Développer un prototype pour automatiser ce processus. Tester le prototype pour s\'assurer qu\'il réduit les fausses alertes.', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 5, id_etudiant: 5, id_tuteur: 10 },
  { id: 13, sujet: 'Développement d\'application web', description: 'Design et Développement informatique', date_debut: '2025-04-14', date_fin: '2025-06-07', id_entreprise: 6, id_etudiant: 6, id_tuteur: 1 },
  { id: 14, sujet: 'Développement d\'une application web de prise de notes géolocalisées', description: 'Backend rest PostgreSQL (supabase) et frontend web&mobile (Weweb). Conception de la base de données avec Supabase, développement du backend REST, frontend avec WeWeb', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 7, id_etudiant: 15, id_tuteur: 11 },
  { id: 15, sujet: 'Réfonte d\'un site d\'entreprise en utilisant Strapi comme CMS headless', description: 'Refonte site web - CMS headless - Intégration frontend - Migration données. Modélisation contenus (Strapi), création API, intégration Weweb, formulaires, import données', date_debut: '2025-04-14', date_fin: '2025-06-06', id_entreprise: 7, id_etudiant: 14, id_tuteur: 11 },
]

async function importData() {
  try {
    console.log('🚀 Début de l\'importation des données...\n')

    // 1. Import des entreprises (avec IDs spécifiques)
    console.log('📦 Importation des entreprises...')
    for (const entreprise of entreprisesData) {
      try {
        await prisma.$executeRaw`
          INSERT INTO entreprises (id, nom, adresse, secteur, telephone, email, departement, created_at, updated_at)
          VALUES (${entreprise.id}, ${entreprise.nom}, ${entreprise.adresse || null}, ${entreprise.secteur || null}, ${entreprise.telephone || null}, ${entreprise.email || null}, ${entreprise.secteur}::"Departement", NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
          nom = EXCLUDED.nom,
          adresse = EXCLUDED.adresse,
          secteur = EXCLUDED.secteur,
          telephone = EXCLUDED.telephone,
          email = EXCLUDED.email,
          departement = EXCLUDED.departement,
          updated_at = NOW()
        `
      } catch (error) {
        console.error(`Erreur pour entreprise ${entreprise.id}:`, error)
      }
    }
    console.log(`✅ ${entreprisesData.length} entreprises importées\n`)

    // 2. Import des tuteurs
    console.log('👨‍🏫 Importation des tuteurs...')
    for (const tuteur of tuteursData) {
      try {
        await prisma.$executeRaw`
          INSERT INTO tuteurs (id, nom, prenom, telephone, email, id_entreprise, etudiants_actuels, etudiants_historique, created_at, updated_at)
          VALUES (${tuteur.id}, ${tuteur.nom}, ${tuteur.prenom}, ${tuteur.telephone || null}, ${tuteur.email || null}, ${tuteur.id_entreprise || null}, ${tuteur.etudiants_actuels || null}, ${tuteur.etudiants_historique || null}, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
          nom = EXCLUDED.nom,
          prenom = EXCLUDED.prenom,
          telephone = EXCLUDED.telephone,
          email = EXCLUDED.email,
          id_entreprise = EXCLUDED.id_entreprise,
          etudiants_actuels = EXCLUDED.etudiants_actuels,
          etudiants_historique = EXCLUDED.etudiants_historique,
          updated_at = NOW()
        `
      } catch (error) {
        console.error(`Erreur pour tuteur ${tuteur.id}:`, error)
      }
    }
    console.log(`✅ ${tuteursData.length} tuteurs importés\n`)

    // 3. Import des étudiants
    console.log('👥 Importation des étudiants...')
    for (const etudiant of etudiantsData) {
      try {
        await prisma.$executeRaw`
          INSERT INTO etudiants (id, nom, prenom, email, id_tuteur, promotion, "anneeUniversitaire", departement, created_at, updated_at)
          VALUES (${etudiant.id}, ${etudiant.nom}, ${etudiant.prenom}, ${etudiant.email || null}, ${etudiant.id_tuteur || null}, ${2}, ${'2024-2025'}, ${'INFO'}::"Departement", NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
          nom = EXCLUDED.nom,
          prenom = EXCLUDED.prenom,
          email = EXCLUDED.email,
          id_tuteur = EXCLUDED.id_tuteur,
          promotion = EXCLUDED.promotion,
          "anneeUniversitaire" = EXCLUDED."anneeUniversitaire",
          departement = EXCLUDED.departement,
          updated_at = NOW()
        `
      } catch (error) {
        console.error(`Erreur pour étudiant ${etudiant.id}:`, error)
      }
    }
    console.log(`✅ ${etudiantsData.length} étudiants importés\n`)

    // 4. Import des stages
    console.log('📋 Importation des stages...')
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Pour comparer uniquement la date
    
    for (const stage of stagesData) {
      try {
        // Déterminer le statut en fonction de la date de fin
        const dateFin = new Date(stage.date_fin)
        dateFin.setHours(0, 0, 0, 0)
        const statut = dateFin < today ? 'TERMINE' : 'ACTIF'
        
        await prisma.$executeRaw`
          INSERT INTO stages (id, sujet, description, date_debut, date_fin, id_entreprise, id_etudiant, id_tuteur, statut, departement, promotion, "anneeUniversitaire", created_at, updated_at)
          VALUES (${stage.id}, ${stage.sujet}, ${stage.description || null}, ${stage.date_debut}::date, ${stage.date_fin}::date, ${stage.id_entreprise || null}, ${stage.id_etudiant || null}, ${stage.id_tuteur || null}, ${statut}::"StatutStage", ${'INFO'}::"Departement", ${2}, ${'2024-2025'}, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
          sujet = EXCLUDED.sujet,
          description = EXCLUDED.description,
          date_debut = EXCLUDED.date_debut,
          date_fin = EXCLUDED.date_fin,
          id_entreprise = EXCLUDED.id_entreprise,
          id_etudiant = EXCLUDED.id_etudiant,
          id_tuteur = EXCLUDED.id_tuteur,
          statut = EXCLUDED.statut,
          departement = EXCLUDED.departement,
          promotion = EXCLUDED.promotion,
          "anneeUniversitaire" = EXCLUDED."anneeUniversitaire",
          updated_at = NOW()
        `
      } catch (error) {
        console.error(`Erreur pour stage ${stage.id}:`, error)
      }
    }
    console.log(`✅ ${stagesData.length} stages importés\n`)

    // 5. Réinitialiser les séquences PostgreSQL
    console.log('🔄 Réinitialisation des séquences PostgreSQL...')
    const maxEntrepriseId = Math.max(...entreprisesData.map(e => e.id))
    const maxTuteurId = Math.max(...tuteursData.map(t => t.id))
    const maxEtudiantId = Math.max(...etudiantsData.map(e => e.id))
    const maxStageId = Math.max(...stagesData.map(s => s.id))

    await prisma.$executeRawUnsafe(
      `SELECT setval('entreprises_id_seq', GREATEST(${maxEntrepriseId}, (SELECT MAX(id) FROM entreprises)))`
    )
    await prisma.$executeRawUnsafe(
      `SELECT setval('tuteurs_id_seq', GREATEST(${maxTuteurId}, (SELECT MAX(id) FROM tuteurs)))`
    )
    await prisma.$executeRawUnsafe(
      `SELECT setval('etudiants_id_seq', GREATEST(${maxEtudiantId}, (SELECT MAX(id) FROM etudiants)))`
    )
    await prisma.$executeRawUnsafe(
      `SELECT setval('stages_id_seq', GREATEST(${maxStageId}, (SELECT MAX(id) FROM stages)))`
    )
    console.log('✅ Séquences réinitialisées\n')

    console.log('🎉 Importation terminée avec succès!')
    console.log(`\n📊 Résumé:`)
    console.log(`   - ${entreprisesData.length} entreprises`)
    console.log(`   - ${tuteursData.length} tuteurs`)
    console.log(`   - ${etudiantsData.length} étudiants`)
    console.log(`   - ${stagesData.length} stages`)
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter l'importation
importData()
  .then(() => {
    console.log('\n✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })


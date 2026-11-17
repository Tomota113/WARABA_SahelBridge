# Brief codex — Calculs, rapport interne, dossier jury, fiche orale

Tu travailles dans `/home/ibrahim-tomota/Projects/HOTLINE_MK-II`. Langue : français, ton clair.
Contexte : robot 4WD bas HOTLINE MK-II, catégorie Robots Battle du MaliBots Challenge 2026 (Bamako). Équipe de 5 étudiants (Membre 1 à 5, noms non fournis). **L'entretien/présentation devant le jury a lieu demain matin, 17 octobre 2026.** L'équipe demande des documents **plus courts** que les versions R1/R1.1 (15–16 pages) : va à l'essentiel.

## Lis d'abord (intégralement)
- `config/geometry.json` — **source unique** des cotes, masses, hypothèses de calcul et règles publiées (vérifiées le 16/10/2026 à 23 h 28 GMT). NE LE MODIFIE PAS ; signale les incohérences.
- `sources/HOTLINE_MK-II_Rapport_final.txt` (R1) et `sources/HOTLINE_MK-II_Dossier_R1-1.txt` (R1.1, la plus récente). Ce sont des documents de travail : ils contiennent des hypothèses ; ne les prends pas pour des preuves.
- `sources/web/*.txt` — texte des pages officielles malibotschallenge.com (catégorie, règlement, calendrier, FAQ) consultées le 16/10/2026 23:28 GMT.

## Tu écris UNIQUEMENT dans `docs/`
1. `docs/calculs.mjs` (Node ESM, sans dépendance) → lit `../config/geometry.json` et produit `docs/calculs.json` + `docs/calculs.md` :
   autonomie idéale, avec 20 % de réserve, courant moyen admissible pour 5 min, capacité nécessaire à 18 A, courant par voie, énergie nominale, vitesse sans glissement, adhérence requise pour 45 N, somme du budget de masse et marge à 4 000 g, part de chaque poste, CG estimé (XG, ZG) avec et sans module avant à partir de `masse.postes[].position`, charge sur essieu avant = (XG − x_arrière)/empattement. Chaque ligne : formule, résultat arrondi, statut (F/H/E), portée/limite. Compare ton CG au « (172 ; 0 ; 37) E » publié en R1.1 et explique l'écart (placements différents, non documentés en R1.1). Vérifie aussi les calculs repris de R1/R1.1 (5,00 min ; 4,00 min ; 14,4 A ; 1,875 Ah ; 22,2 Wh ; 1,73 m/s ; µ ≈ 1,19 ; 41,2 % ; 480 s = 8 min) et note toute erreur.
2. `docs/build_docs.mjs` (Node ESM, sans dépendance) → génère les trois HTML ci-dessous en injectant les tableaux de cotes, masses et calculs **depuis `geometry.json` et `calculs.json`** (pas de valeur recopiée à la main dans les tableaux). Le texte rédigé peut être dans le script ou dans des fichiers `docs/contenu/*.md|html` que tu crées.
3. `docs/rapport_interne.html` — **≤ 8 pages A4**. Pour l'équipe, pédagogique et concret : architecture et rôle des composants ; justification des choix ; hypothèses et **contradictions entre R1, R1.1 et la mission** (table) ; calculs vérifiables et limites ; matériel envisagé + alternatives ; contenu du kit inconnu ; budget à compléter **sans prix inventé** (grille) ; risques et validations (V1–V6) ; répartition des tâches des 5 membres ; prochaines décisions ; guide court « utiliser et modifier la visualisation » (modifier `config/geometry.json` → `npm run build` dans `app/` → `node plans/generer_plans.mjs` → `node docs/build_docs.mjs`).
4. `docs/dossier_jury.html` — **≤ 8 pages A4**. Professionnel, synthétique, défendable, qui met en valeur le projet et la méthode : concept ; architecture mécanique ; architecture électronique fonctionnelle (schéma bloc simple en SVG inline : batterie → sectionnement → distribution protégée → contrôleurs G/D → 2 moteurs chacun ; récepteur ← émetteur ; régulateur ; option levage P3) — **aucun brochage, calibre, section de câble** ; belles vues 3D (images ci-dessous) ; plans 2D légendés ; faisabilité au Mali ; matériel envisagé ; organisation des 5 membres ; méthode de réalisation et validation (jalons jusqu'au 7 nov.). Les incertitudes sont expliquées **au bon endroit**, une fois, sans répéter d'avertissement à chaque page. Ne présente aucun prototype, essai, pesée, stock ou homologation comme acquis.
5. `docs/fiche_orale.html` — ≤ 3 pages A4 : résumé d'une minute ; exposé d'environ 3 minutes réparti entre les 5 membres (avec le moment où l'on montre l'application 3D : vue perspective → capot retiré → vue éclatée → cotes) ; 5 questions difficiles + réponses courtes.
6. `docs/registre_points_a_confirmer.md` — registre : ID, sujet, valeur actuelle + statut, source, qui confirme (Membre n / DoniFab / encadrant), quand, impact si différent.
7. `docs/budget_grille.csv` — grille FCFA sans prix (colonnes : poste, désignation, qté, fourni par kit (inconnu), prix unitaire (vide), source/devis, date, statut).

## Images et plans à référencer (chemins relatifs depuis `docs/`)
Je (Claude) produis ces rendus 3D : `../renders/01_perspective.png`, `../renders/02_interieur.png` (capot retiré, sous-ensembles internes), `../renders/03_eclatee.png`, `../renders/04_dessus.png`, `../renders/05_face.png`, `../renders/06_cote.png`, `../renders/07_levage.png` (option levage P3), `../renders/08_cotes.png` (dimensions générales). codex0 produit les plans : `../plans/svg/vue_dessus.svg`, `../plans/svg/vue_cote.svg`, `../plans/svg/vue_face.svg`, `../plans/svg/vue_ensemble.svg`, `../plans/svg/planche_A3.svg`. Ils n'existent peut-être pas encore : référence-les quand même avec ces noms exacts.

## Mise en page (impression PDF par Chrome, que je lancerai moi-même)
`@page { size: A4; margin: 16mm 15mm 18mm }`, `break-inside: avoid` sur tableaux/figures, en-tête/pied sobres, palette documentaire sobre (bleu nuit #1b2a41, accent #d0352b avec parcimonie, gris), polices système (`Inter, 'DejaVu Sans', Arial, sans-serif`), aucune ressource distante. Figures `max-width:100%` avec légendes. Cartouche de statut discret en couverture : « Conception préliminaire R2 — 16 octobre 2026 ».

## Règles de fond
- Règles officielles : citer `regles_publiees` du JSON avec la date de consultation. Ne pas déduire le contenu du kit ni des prescriptions absentes (dimensions max, batteries admises, mécanismes autorisés…).
- Mécanisme actif : uniquement « volume réservé 08 », aucun détail de fabrication/optimisation/activation d'arme rotative ; l'option P3 est un levage lent non coupant.
- Aucun prix inventé. Aucun stock supposé acquis.
- Note : l'équipe pensait que le site s'appelait « malibotchallenge » ; le domaine sans « s » ne répond pas, le site officiel est malibotschallenge.com.
- Note : aucun « récapitulatif Antigravity » séparé n'a été trouvé sur le poste ; le dossier R1.1 (généré à partir d'une géométrie unique et de scripts) est considéré comme le travail le plus abouti du coéquipier. Le signaler dans le rapport interne.

## Validation
Exécute `node docs/calculs.mjs` puis `node docs/build_docs.mjs`. Termine par un court rapport : fichiers produits, erreurs relevées dans les sources, incohérences du JSON, ce qui reste à compléter.

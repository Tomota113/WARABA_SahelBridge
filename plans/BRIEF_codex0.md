# Brief codex0 — Plans 2D vectoriels, révision R2 (robot WARABA, équipe SahelBridge)

Dossier : `/home/ibrahim-tomota/Projects/WARABA_SahelBridge`. Langue : français. Présentation au jury **demain matin**.

## Ce qui a changé depuis ta première passe
Ta première passe (archivée dans `archive_R1-1/plans/`) reposait sur la géométrie R1.1 (320 × 280 × 100, protections en U). **Elle est abandonnée.** Le coéquipier a fourni une maquette et des photos de référence qui montrent l'intention réelle : châssis noir bas et plat, flancs noirs à 3 stries blanches, 4 rouleaux roses apparents, 2 arceaux triangulaires à l'avant portant un module avant, 2 pods rouges, 2 fourches passives, pare-chocs arrière bleu, capot plat noir.
Le robot ne s'appelle plus HOTLINE (nom d'un robot existant) : nom provisoire **`meta.nom`** = WARABA, équipe **`meta.equipe`** = SahelBridge. Lis toujours le nom dans le JSON (il peut encore changer).

## Lis d'abord
- `config/geometry.json` — **nouvelle source unique** (mm ; origine au sol, plan de symétrie, arrière du pare-chocs ; X avant, Y gauche, Z haut). Ne le modifie pas ; signale les incohérences. Les profils `profil_xz` (flancs, arceaux, pods implicites, fourches) sont des polygones dans le plan XZ, extrudés selon Y sur `y_abs` (symétriques ±).
- Photos : `sources/coequipier/Photos_Reference_Hotline/*.jpg|png`, `sources/coequipier/Hotline_Reference.png` (regarde-les pour le style).
- La maquette du coéquipier `sources/coequipier/Maquette_Detaillee_Bot.html` (onglet « Plans 2D ») : le coéquipier demande de **corriger ses vues 2D**. Relève ce qui est faux ou incohérent dans ses planches (cotes, vues contradictoires, interférences) et liste-le dans `plans/controle_coherence.md` ; nos nouvelles planches les remplacent.
- Tu peux réutiliser ton code de `archive_R1-1/plans/` comme point de départ.

## Tu écris UNIQUEMENT dans `plans/`
1. `plans/generer_plans.mjs` (Node ESM, sans dépendance) : lit `../config/geometry.json` → SVG. Aucune cote codée en dur.
2. `plans/svg/vue_dessus.svg` — dessus, capot retiré : plancher, rails intérieurs, flancs, 4 roues, courroies/poulies, 2 motoréducteurs + support, batterie 04, commande 05, distribution 05, contrôleurs 06 G/D, arceaux 11 (vus en bout), pods 07, fourches 12, enveloppe 08 (rectangle hachuré = projection du cylindre), coupe-circuit 09 (pointillé). Cotes : L 334 et 273, l 217, empattement 120, voie 182, axes X 44 / 164.
3. `plans/svg/vue_cote.svg` — côté droit : flanc au premier plan (profil incliné), roues (parties visibles sous/au-dessus du flanc + cachées en interrompu), arceau (profil avec évidement), pod, fourche, enveloppe 08 (cercle hachuré Ø96, axe en trait mixte), 09, pare-chocs. Cotes : hauteur 110 (08), 95 (arceaux), 44 (caisse), Ø55, garde 7,5 / pods 8 / flancs 12, axes 44 et 164, axe 08 (225 ; 62).
4. `plans/svg/vue_face.svg` — face : flancs, roues, rails, arceaux, pods, fourches, enveloppe 08 (rectangle hachuré 112 × 96). Cotes : 217, 182 voie, 146 (entre faces externes des rails, = 2 × 73), 112 largeur 08, hauteurs.
5. `plans/svg/vue_ensemble.svg` — axonométrie propre, capot retiré, bulles 01–12.
6. `plans/svg/variante_levage.svg` — petite vue de côté de l'option P3 (palette arrondie, pivot, angles 0° et 25°) à la place de 08.
7. `plans/svg/planche_A3.svg` — A3 paysage (viewBox en mm 420 × 297) : 4 vues à échelle commune 1:2 (ajuste si besoin), encart variante P3, légende repères 01–12, légende statuts (`meta.statuts`), cartouche (nom, équipe, compétition, « Plans R2 », date 16/10/2026, échelle, mm, « Modèle conceptuel — cotes provisoires — non destiné à la fabrication »), cadre, axes. Chaque cote principale porte son statut (ex. « 120 M », « Ø55 H »).
8. `plans/planche_A3.html` — affiche la planche en A3 paysage (`@page { size: A3 landscape; margin: 0 }`). Ne lance pas Chrome.
9. `plans/controle_coherence.mjs` + `.md` : enveloppe atteinte (334 × 217 × 110), jeux roue/pod (1,5), roue/rail int., roue/flanc, poulie/roue, enveloppe 08 / arceaux (11 mm par côté), 08 / capot (13 mm), 08 / sol (14 mm), interférences entre volumes (boîtes/cylindres approchés), gardes au sol. Recouvrement volontaire fourche/pod (fourche engagée dans le pod) à signaler comme tel. Section « Corrections apportées à la maquette du coéquipier » (pods vs roue avant, planchers latéraux dans les roues, poulies dans les roues, arceaux dans les rails, batterie dans les moteurs, capot incliné) + section « Erreurs relevées dans ses plans 2D ».

## Repères
01 châssis · 02 roues + transmission · 03 flancs + pare-chocs · 04 batterie · 05 commande + distribution · 06 contrôleurs · 07 pods · 08 module avant (enveloppe) · 09 coupe-circuit · 10 capot · 11 arceaux · 12 fourches.

## Style (identique à la 3D en mode « par sous-ensemble »)
Trait ISO (0,5 / 0,25 / 0,18 mixte), police `Inter, 'DejaVu Sans', Arial, sans-serif`. Remplissages :
01 #cfd5dc · 02 roues #e9a197, poulies/courroies #6b7280, moteurs #9aa3ad · 03 #8c939b · 04 #9fb8d6 · 05 #b9c7b0 · 06 #b9c7b0 · 07 #e57373 · 08 hachures #c0392b · 09 #d0352b · 10 contour seul · 11 #4b5563 · 12 #a7adb4 · pare-chocs #6f9ad8.

## Interdits
Aucun détail du mécanisme du module 08 (seulement l'enveloppe hachurée « module avant — enveloppe réservée, non détaillé ») ; fourches sans harpon ni pointe ; aucune cote inventée hors JSON ; aucun fichier hors `plans/`.

## Validation
`node plans/generer_plans.mjs && node plans/controle_coherence.mjs`, `xmllint --noout plans/svg/*.svg`. Rapport final court : fichiers, résultats, incohérences du JSON.

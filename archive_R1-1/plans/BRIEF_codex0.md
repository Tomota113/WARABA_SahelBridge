# Brief codex0 — Plans 2D vectoriels HOTLINE MK-II

Tu travailles dans `/home/ibrahim-tomota/Projects/HOTLINE_MK-II`. Langue : français.
Contexte : robot 4WD bas pour la catégorie Robots Battle du MaliBots Challenge 2026. Présentation au jury demain matin (17 oct.). Le chef de projet (Claude Code) construit l'application 3D à partir de la même base.

## Lis d'abord
- `config/geometry.json` — **source unique** des cotes (mm, origine au sol, plan de symétrie, arrière de l'enveloppe ; X avant, Y gauche, Z haut). NE LE MODIFIE PAS. Si tu trouves une incohérence, signale-la dans ton rapport.
- `sources/HOTLINE_MK-II_Dossier_R1-1.txt` (§2 et §4) et `sources/HOTLINE_MK-II_Rapport_final.txt` (R1) pour le contexte.

## Tu écris UNIQUEMENT dans `plans/`
1. `plans/generer_plans.mjs` — script Node (ESM, sans dépendance npm) qui lit `../config/geometry.json` et génère tous les SVG. Aucune cote codée en dur dans le dessin : tout dérive du JSON (seules des constantes de mise en page sont permises).
2. `plans/svg/vue_dessus.svg` — dessus, capot retiré, implantation interne : caisson 01 (parois 3 mm), roues 02 + enveloppes motoréducteurs, protections en U 03 (flancs + arrière), batterie 04, commande 05, contrôleurs 06 G/D, pods 07 (coins R10), volume 08 hachuré, 09 en pointillé (sur capot). Axes de roues, plan de symétrie, CG cible (croix) et CG estimé R1.1 (disque) marqués. Cotes : 320, 280, 230 caisson (X), 200 caisson (Y), empattement 165, voie 230, axes X=70 / X=235.
3. `plans/svg/vue_cote.svg` — côté droit : protection latérale au premier plan, roues/motoréducteurs cachés en traits interrompus, capot, 09, pods, 08 hachuré. Cotes : hauteur 100 hors tout, capot 65, Ø55, garde plancher 6 / pods 8 / protections 10, axes 70 et 235, longueur 320.
4. `plans/svg/vue_face.svg` — face avant : protections, roues, pods, 08 hachuré, capot. Cotes : 200 caisson, 255 roues hors tout, 280 protections, 100 hauteur, jeu roue/caisson 2,5 et roue/protection 6,5 (cotes de détail).
5. `plans/svg/vue_ensemble.svg` — vue d'ensemble : une axonométrie (isométrie ou cavalière) simple et propre, capot retiré, avec bulles repères 01 à 10.
6. `plans/svg/planche_A3.svg` — planche A3 paysage (420 × 297 mm, viewBox en mm) qui assemble les 4 vues à échelle commune (1:2 ou 1:2,5 pour les orthogonales), avec : légende des repères 01–10, légende des statuts (F/H/P/PV/E/V selon `meta.statuts`), cartouche (projet, titre, révision « R2-visu », date 16/10/2026, échelle, unité mm, mention « Modèle conceptuel — cotes provisoires P — non destiné à la fabrication »), cadre, repère d'axes. Chaque cote porte son statut (ex. « 165 P », « Ø55 H »).
7. `plans/planche_A3.html` — page HTML minimale qui affiche `svg/planche_A3.svg` en pleine page A3 paysage (`@page { size: A3 landscape; margin: 0 }`) pour l'export PDF. Ne lance PAS Chrome toi-même : je ferai l'export PDF.
8. `plans/controle_coherence.mjs` + `plans/controle_coherence.md` — contrôles automatiques calculés depuis le JSON : enveloppe atteinte exactement (320 × 280 × 100), jeux roue/caisson, roue/protection, motoréducteur avant/paroi avant (R1.1 annonce 4,5 mm), interférences entre volumes englobants (boîtes et cylindres approximés par boîtes), gardes au sol. Tableau résultat + commentaire. Liste aussi les divergences R1 ↔ R1.1 que tu relèves (empattement 170→165, flancs, contrôleurs, etc.).

## Style graphique
Trait technique net (noir/gris foncé), épaisseurs ISO (0,5 contour, 0,25 cotes, 0,18 axes en trait mixte), hachures pour 08, police sans-serif système (`font-family: Inter, 'DejaVu Sans', Arial, sans-serif`). Couleurs de remplissage légères et cohérentes par sous-ensemble, identiques dans toutes les vues :
01 #dfe5ec · 02 roues #3b4654 · 03 #c9a978 · 04 #9fb8d6 · 05 #b9c7b0 · 06 #b9c7b0 · 07 #2f2f2f (élastomère) · 08 hachures #c0392b · 09 #d0352b · 10 contour seul.
Ces couleurs sont celles que la 3D utilise en mode « couleurs par sous-ensemble ».

## Interdits
- Aucun détail de mécanisme d'arme (le 08 reste une enveloppe hachurée « volume réservé — non détaillé »).
- Pas de cote inventée qui n'est pas dans le JSON ; si tu as besoin d'une valeur, utilise le JSON.
- Ne touche à aucun fichier hors de `plans/`.

## Validation
Exécute `node plans/generer_plans.mjs` et `node plans/controle_coherence.mjs` ; vérifie que les SVG sont bien formés (par ex. `xmllint --noout`). Termine par un court rapport : fichiers produits, résultats des contrôles, incohérences éventuelles du JSON.

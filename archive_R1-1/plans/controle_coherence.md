# Contrôle de cohérence — HOTLINE MK-II

Révision R2-visu — 2026-10-16 — unité : mm.

Source unique : [geometry.json](../config/geometry.json), lu sans modification. Génération : `node plans/generer_plans.mjs` ; contrôle : `node plans/controle_coherence.mjs`. Les scripts fonctionnent depuis tout répertoire courant.

**Bilan géométrique : tous les contrôles passent ; 0 interférence positive sur 406 paires de 29 solides.** Ces résultats concernent les volumes conceptuels, sans tolérance, câble, fixation ni déformation.

## Résultats calculés

| Contrôle | État | Résultat | Commentaire |
|---|---|---|---|
| Enveloppe réellement atteinte | OK | 320 × 280 × 100 mm | X [0 ; 320], Y [-140 ; 140], Z [0 ; 100]. Arrière 03, avant 07, largeur 03, sol 02, sommet 08. |
| Jeu roue / caisson | OK | 2,5 mm | voie_y − largeur_roue/2 − Y_caisson_max ; quatre roues, symétrie G/D. Jeu faible : contrôle V2. |
| Jeu roue / protection | OK | 6,5 mm | Y_intérieur_flanc − voie_y − largeur_roue/2 ; quatre roues. Le jeu se mesure au bord intérieur du flanc. |
| Motoréducteur avant / paroi avant | OK | 4,5 mm | X_caisson_max − épaisseur_paroi − X_axe_avant − Ø_moteur/2 ; confirme les 4,5 mm R1.1. |
| Garde au sol plancher | OK | 6 mm | Dessous du solide comparé à garde_sol.plancher = 6 P. |
| Garde au sol pods | OK | 8 mm | Dessous du solide comparé à garde_sol.pods = 8 P. |
| Garde au sol protections | OK | 10 mm | Dessous du solide comparé à garde_sol.protections = 10 P. |
| Garde minimale hors roues | OK | 6 mm | 01-plancher |
| Roues tangentes au sol | OK | Z bas = 0 mm | Tangence, sans pénétration du sol. |
| Empattement déclaré | OK | 165 / 165 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Voie déclarée | OK | 230 / 230 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Largeur roues déclarée | OK | 255 / 255 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Longueur motoréducteur déclarée | OK | 58 / 58 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Épaisseur de plancher déclarée | OK | 8 / 8 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Capot posé sur caisson | OK | 62 / 62 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Sectionnement posé sur capot | OK | 65 / 65 mm | Valeur déclarée / valeur recomposée depuis les bornes. |
| Volumes valides | OK | 29 solides | Boîtes d’épaisseur strictement positive, caisson décomposé en plancher et quatre parois, sans double compte aux coins. |
| Rayons pods compatibles | OK | R10 | Rayon en plan XY seulement ; les silhouettes XZ et YZ restent rectangulaires. |
| Interférences entre boîtes englobantes | OK | 0 recouvrement(s) / 406 paires | Toutes les paires, y compris entretoises PV ; cylindres et pods arrondis approximés par leurs boîtes. Contacts sans pénétration comptés séparément. |
| Budget de masse | OK | 3600 + 250 = 3850 g | Allocation et réserve, sans masse mesurée ; la réserve n’a aucune position et est exclue du CG. |

## Méthode et périmètre

Le caisson est creux : son enveloppe globale ne représente pas de la matière. Le contrôle utilise un plancher et quatre parois disjointes, ainsi que le capot posé, les quatre roues, quatre motoréducteurs, trois panneaux du U, quatre entretoises PV, batterie, commande, deux contrôleurs, deux pods, volume 08 et accès 09. Les entretoises suivent Y entre la face externe du caisson et la face interne des protections. Leur diamètre et leurs positions proviennent du JSON.

Pour chaque paire, la pénétration sur chaque axe vaut `min(maxA,maxB) − max(minA,minB)`. Une interférence exige trois valeurs strictement positives (tolérance numérique 10⁻⁹ mm). Un zéro est un contact, une valeur négative un intervalle libre. Les cylindres selon Y et les pods R10 sont remplacés par leurs boîtes : méthode conservative, susceptible de signaler des faux positifs. Aucune paire n’est ignorée. L’option de levage n’est ni dessinée ni intégrée : elle est une variante exclue de la configuration de référence. Le volume 08 est uniquement réservé, sans mécanisme.

### Interférences positives

Aucune.

### Contacts sans pénétration (37)

Les contacts d’assemblage (plancher/parois, capot/parois, entretoises/flancs, pods/face avant, 09/capot) ne sont pas des interférences positives. Ils ne prouvent ni une fixation ni une continuité mécanique.

| Solide A | Solide B | Recouvrements X ; Y ; Z (mm) |
|---|---|---|
| 01-plancher | 01-paroi-arrière | 3 ; 200 ; 0 |
| 01-plancher | 01-paroi-avant | 3 ; 200 ; 0 |
| 01-plancher | 04-batterie | 90 ; 70 ; 0 |
| 01-plancher | 05-commande | 70 ; 70 ; 0 |
| 01-plancher | 01-flanc-D | 224 ; 3 ; 0 |
| 01-plancher | 06-D | 70 ; 40 ; 0 |
| 01-plancher | 07-D | 0 ; 45 ; 6 |
| 01-plancher | 01-flanc-G | 224 ; 3 ; 0 |
| 01-plancher | 06-G | 70 ; 40 ; 0 |
| 01-plancher | 07-G | 0 ; 45 ; 6 |
| 01-paroi-arrière | 10-capot | 3 ; 200 ; 0 |
| 01-paroi-arrière | 01-flanc-D | 0 ; 3 ; 48 |
| 01-paroi-arrière | 01-flanc-G | 0 ; 3 ; 48 |
| 01-paroi-avant | 08-module_avant | 0 ; 90 ; 32 |
| 01-paroi-avant | 10-capot | 3 ; 200 ; 0 |
| 01-paroi-avant | 01-flanc-D | 0 ; 3 ; 48 |
| 01-paroi-avant | 07-D | 0 ; 45 ; 26 |
| 01-paroi-avant | 01-flanc-G | 0 ; 3 ; 48 |
| 01-paroi-avant | 07-G | 0 ; 45 ; 26 |
| 03-arrière | 03-flanc-D | 6 ; 0 ; 55 |
| 03-arrière | 03-flanc-G | 6 ; 0 ; 55 |
| 08-module_avant | 10-capot | 0 ; 90 ; 3 |
| 09-sectionnement | 10-capot | 25 ; 30 ; 0 |
| 10-capot | 01-flanc-D | 224 ; 3 ; 0 |
| 10-capot | 01-flanc-G | 224 ; 3 ; 0 |
| 01-flanc-D | 02-moteur-D-70 | 25 ; 0 ; 25 |
| 01-flanc-D | 02-moteur-D-235 | 25 ; 0 ; 25 |
| 01-flanc-D | 03-entretoise-D-125 | 10 ; 0 ; 10 |
| 01-flanc-D | 03-entretoise-D-180 | 10 ; 0 ; 10 |
| 03-flanc-D | 03-entretoise-D-125 | 10 ; 0 ; 10 |
| 03-flanc-D | 03-entretoise-D-180 | 10 ; 0 ; 10 |
| 01-flanc-G | 02-moteur-G-70 | 25 ; 0 ; 25 |
| 01-flanc-G | 02-moteur-G-235 | 25 ; 0 ; 25 |
| 01-flanc-G | 03-entretoise-G-125 | 10 ; 0 ; 10 |
| 01-flanc-G | 03-entretoise-G-180 | 10 ; 0 ; 10 |
| 03-flanc-G | 03-entretoise-G-125 | 10 ; 0 ; 10 |
| 03-flanc-G | 03-entretoise-G-180 | 10 ; 0 ; 10 |

## Incohérences et limites du JSON / des sources

- **CG publié R1.1 non reproduit par les allocations du JSON.** Les postes totalisent 3600 g et donnent (169,708 ; 0 ; 37,889) mm E, hors réserve, contre (172 ; 0 ; 37) mm E publiés. Écart calculé − publié : (-2,292 ; 0 ; 0,889) mm. Le désaccord subsiste à l’arrondi au millimètre. Le JSON indique lui-même que le placement exact des masses n’est pas documenté. La planche conserve le disque publié R1.1, conformément au brief ; elle ne le présente pas comme le résultat du calcul reproductible.
- **Capot : statut mixte.** Le champ global est P, mais sa note classe l’épaisseur 3 mm en PV. La hauteur 65 mm est cotée P ; aucune épaisseur n’est cotée P sur la planche.
- **Correction historique moteur/paroi annoncée en R1.1 §4.** Avec l’ancien axe X = 240 mm du rapport R1, les mêmes bornes et parois donnent -0,5 mm, donc 0,5 mm de pénétration, et non les 1,5 mm annoncés. Le jeu actuel 4,5 mm est cohérent. Ni le JSON ni les sources ne sont corrigés par ces scripts.
- Le matériau, les supports moteurs et les liaisons au caisson restent à définir. Le jeu entre enveloppe moteur et roue ne constitue pas une géométrie d’arbre ou de transmission. Les gardes nominales ne valident pas le comportement sur le sol réel.

## Divergences R1 → R1.1 relevées

Sources locales : [rapport R1, §2 et §4](../sources/HOTLINE_MK-II_Rapport_final.txt) ; [dossier R1.1, §2 et §4](../sources/HOTLINE_MK-II_Dossier_R1-1.txt). Les valeurs R1 ci-dessous sont des citations de contexte, et ne pilotent jamais le dessin.

| Sujet | R1 | R1.1 / JSON courant |
|---|---|---|
| Axe avant / empattement | X = 240 / 170 mm | X = 235 / 165 mm ; axe arrière inchangé à 70 |
| Jeu moteur avant / paroi | Avec les bornes actuelles : -0,5 mm ; R1.1 relate −1,5 mm | 4,5 mm ; divergence historique explicitée ci-dessus |
| Extrémité arrière | 25 mm vides dans l’enveloppe annoncée | Panneau arrière X 0 ; 6 ; U fermé à l’arrière |
| Flancs | Roues avant dépassant les protections, selon la revue R1.1 | X 0 ; 280 ; épaisseur 6 mm |
| Jeu extérieur au pneu | 12,5 mm annoncés jusqu’à Y extrême ±140, sans distinguer épaisseur / jeu libre | 6,5 mm libres jusqu’à Y = ±134 ; 12,5 mm jusqu’au bord extérieur |
| Vue de côté | Protection latérale omise, selon R1.1 §4 | Flanc au premier plan ; roues et moteurs derrière en interrompus |
| Contrôleurs | Décrits latéraux, dessinés au centre, selon R1.1 §4 | Deux volumes X 125 ; 195, abs(Y) 45 ; 85, Z 14 ; 34 |
| Pods | X 255–315 selon la source du champ pods | X 255 ; 320 ; avant réel à 320 ; R10 |
| Centre de gravité | Cible (160 ; 0 ; 35) ; aucun CG calculable revendiqué | Estimation publiée (172 ; 0 ; 37) E ; calcul des allocations R2 distinct (169,708 ; 0 ; 37,889) E |

Les cotes P/H/V décrivent une proposition ou une hypothèse. Un calcul géométrique conforme n’est ni un essai ni une autorisation de fabrication. La présente revue ne vérifie pas les règles de compétition externes.

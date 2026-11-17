# WARABA — équipe SahelBridge · MaliBots Challenge 2026 (Robots Battle)

Maquette 3D interactive, plans 2D, rapport interne, dossier jury et fiche orale du robot.
**WARABA** (« lion » en bambara) est un **nom provisoire** : il remplace « HOTLINE MK-II », qui est le nom d'un robot existant. Pour le changer, modifiez `meta.nom` dans `config/geometry.json` puis relancez les commandes de la section « Modifier ».

## Pour la présentation (rien à installer)

| Besoin | Fichier à ouvrir |
|---|---|
| Robot en 3D (hors ligne, double-clic) | `LIVRABLES/WARABA_3D.html` (Chrome, Edge ou Firefox) |
| Dossier pour le jury | `LIVRABLES/WARABA_Dossier_Jury.pdf` (6 pages) |
| Fiche orale (1 min, 3 min, 5 questions) | `LIVRABLES/WARABA_Fiche_Orale.pdf` (2 pages) |
| Plans 2D (A3 paysage, à imprimer à 100 %) | `LIVRABLES/WARABA_Plans_A3.pdf` |
| Rapport interne de l'équipe | `LIVRABLES/WARABA_Rapport_Interne.pdf` (7 pages) |

### Utiliser la 3D
- Glisser : tourner · molette : zoom · clic droit : déplacer · clic sur une pièce : fiche de la pièce.
- Boutons : Perspective, Dessus, Face, Côté, Arrière ¾, Réinitialiser.
- Interrupteurs : capot, vue éclatée, repères 01–12, dimensions générales, flancs transparents, centre de gravité, grille ; couleurs réalistes ou par sous-ensemble (identiques aux plans 2D) ; option levage P3 avec curseur d'angle ; cases pour masquer chaque sous-ensemble.
- **Mode jury** (touche `P`, sortie `Échap`) : interface épurée, rotation lente, barre de vues discrète.
- **Rotation du module avant** : rotor simplifié visible dans l'enveloppe 08, curseur « Rotation » de 0 à 100 % (panneau « Configuration avant »), bouton « Rotation » en mode jury, touche `T`. Le pourcentage est une vitesse d'animation, pas une vitesse réelle (non définie). Au-delà d'environ 60 %, un disque flou apparaît, comme sur une vidéo.
- Animation de roulage (touche `W`) : signalée à l'écran comme **animation de présentation, pas une simulation**.
- Raccourcis : `T` rotation, `1` à `4` vues, `C` capot, `E` éclatée, `A` repères, `D` cotes, `X` flancs transparents, `R` réinitialiser.
- Bouton « Fond clair / sombre » pour un vidéoprojecteur.
- Déroulé conseillé : perspective → rotation (T) → capot (C) → éclatée (E) → cotes (D) → option levage P3.

## Organisation du dossier

```
config/geometry.json   base de cotes UNIQUE (3D, plans, tableaux des rapports)
app/                   source de la maquette 3D → app/dist/WARABA_3D.html
plans/                 générateur des plans + SVG modifiables + contrôle de cohérence
docs/                  calculs, générateur des documents (HTML) et PDF
renders/               images 3D utilisées dans les documents
sources/               documents d'origine (rapports R1/R1.1, rapport initial, récapitulatif, maquette et photos du coéquipier, pages officielles)
archive_R1-1/          première passe abandonnée (géométrie 320 × 280 × 100 de R1.1)
LIVRABLES/             copies prêtes à ouvrir
```

## Modifier (commandes exactes)

Prérequis : Node.js 18 ou plus (testé avec v24.18.0). Python 3 seulement pour la planche PDF vectorielle.

```bash
cd ~/Projects/WARABA_SahelBridge
# 1. modifier une cote, une masse ou le nom dans config/geometry.json
# 2. maquette 3D
cd app && npm install && npm run build && cd ..        # → app/dist/WARABA_3D.html
#    (npm run dev = reconstruction automatique + http://localhost:8080)
# 3. plans 2D + contrôle de cohérence
node plans/generer_plans.mjs && node plans/controle_coherence.mjs
/usr/bin/python3 plans/valider_rendu.py              # → plans/planche_A3.pdf (vectoriel, à renommer WARABA_Plans_A3.pdf)
# 4. calculs et documents
node docs/calculs.mjs && node docs/build_docs.mjs     # → docs/*.html
```
Les PDF des documents s'obtiennent en ouvrant `docs/dossier_jury.html`, `docs/rapport_interne.html` et `docs/fiche_orale.html` dans Chrome, puis Imprimer → Enregistrer en PDF (marges par défaut, graphiques d'arrière-plan cochés). Pensez à recopier ensuite les fichiers dans `LIVRABLES/`.

## Statut des données

Dans tous les fichiers : **M** = repris de la maquette du coéquipier (non mesuré) · **H** = hypothèse des rapports · **P** = proposition R2 · **E** = estimation calculée · **V** = à vérifier sur le matériel.
C'est un **modèle visuel conceptuel**, pas une CAO de fabrication. Le module avant est représenté par une enveloppe réservée et un rotor simplifié animé, sans aucun détail de fabrication, de matériau, de masse ni de vitesse réelle. Les fourches sont simplifiées et passives.

Règles officielles consultées le 16/10/2026 à 23 h 28 GMT sur malibotschallenge.com (le domaine « malibotchallenge » sans « s » ne répond pas) : 4 kg maximum, duel de 5 min en arène hexagonale, aucun robot activé hors arène, 5 membres au plus, phase éliminatoire le 7 novembre 2026. Le contenu du kit, les dimensions maximales, les batteries admises et les mécanismes autorisés ne sont pas publiés.

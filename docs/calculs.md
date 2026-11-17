# Calculs reproductibles — WARABA

Source des entrées : `config/geometry.json` (2026-10-16). Règles publiées consultées 2026-10-16 23:28 GMT. F = arithmétique ; H = hypothèse ; P = proposition ; E = estimation ; V = à vérifier. Aucune estimation ne vaut mesure.

Entrées H : 1,5 et 2,2 Ah, 14,8 V, 18 A, 600 tr/min à la roue, 45 N. Réserve de capacité de 20 % supposée.

| Grandeur | Formule | Résultat | Statut | Limite |
|---|---|---:|:---:|---|
| Autonomie 1,5 Ah, idéale | 60 × C / I | 5 min | E | Courant moyen constant, capacité entièrement utilisable. |
| Autonomie 1,5 Ah, réserve incluse | 60 × C × (1 − r) / I | 4 min | E | Réserve de 20 % supposée ; essai global V5 nécessaire. |
| Courant moyen maximal, 1,5 Ah | 60 × C × (1 − r) / t | 14,4 A | E | Pour 5 min théoriques ; pointes et capacité réelle inconnues. |
| Énergie nominale, 1,5 Ah | U × C | 22,2 Wh | E | Énergie nominale, pas énergie réellement disponible. |
| Autonomie 2,2 Ah, idéale | 60 × C / I | 7,33 min | E | Courant moyen constant, capacité entièrement utilisable. |
| Autonomie 2,2 Ah, réserve incluse | 60 × C × (1 − r) / I | 5,87 min | E | Réserve de 20 % supposée ; essai global V5 nécessaire. |
| Courant moyen maximal, 2,2 Ah | 60 × C × (1 − r) / t | 21,1 A | E | Pour 5 min théoriques ; pointes et capacité réelle inconnues. |
| Énergie nominale, 2,2 Ah | U × C | 32,6 Wh | E | Énergie nominale, pas énergie réellement disponible. |
| Capacité minimale à 18 A et 5 min | I × t / [60 × (1 − r)] | 1,875 Ah | E | Minimum théorique ; compatibilité et masse à contrôler. |
| Courant moyen par voie et par moteur | I / 2 | 9 A | E | Deux voies, un motoréducteur par voie ; pointes inconnues. |
| Vitesse théorique sans glissement | π × (Ø / 1000) × n / 60 | 1,73 m/s | E | 600 tr/min à la roue supposés ; charge et glissement inconnus. |
| Adhérence requise pour 45 N | F / [(M / 1000) × 9,81] | 1,19 µ | E | 45 N hypothétiques ; masse budgétée sur les roues, sol inconnu. |
| Somme des postes | Σ mᵢ | 3 600 g | F | Addition d’allocations P, pas une pesée. |
| Budget avec réserve | Σ mᵢ + réserve | 3 850 g | F | La réserve est comptée une seule fois ; masses non mesurées. |
| Marge au maximum publié | Mmax − budget | 150 g | F | Marge budgétaire ; seule V6 peut établir la masse réelle. |
| Marge relative | 100 × marge / Mmax | 3,75 % | F | Arithmétique sur le budget P. |
| XG avec poste avant | Σ(mᵢ × xᵢ) / Σmᵢ | 120,43 mm | E | Positions et masses proposées ; réserve non localisée exclue. |
| YG avec poste avant | Σ(mᵢ × yᵢ) / Σmᵢ | 0 mm | E | Symétrie postulée ; aucune mesure. |
| ZG avec poste avant | Σ(mᵢ × zᵢ) / Σmᵢ | 32,01 mm | E | Positions et masses proposées ; réserve non localisée exclue. |
| Part statique essieu avant avec poste avant | 100 × (XG − 44) / 120 | 63,7 % | E | Sol plat, deux essieux ; transferts dynamiques et appui des fourches exclus. |
| Écart XG à la cible avec poste avant | XG − Xcible | 10,43 mm | E | Cible P ; un écart ne prouve pas la stabilité. |
| Écart ZG à la cible avec poste avant | ZG − Zcible | 2,01 mm | E | Cible P ; positions réelles à relever. |
| XG sans poste avant et arceaux | Σ(mᵢ × xᵢ) / Σmᵢ | 99,59 mm | E | Positions et masses proposées ; réserve non localisée exclue. |
| YG sans poste avant et arceaux | Σ(mᵢ × yᵢ) / Σmᵢ | 0 mm | E | Symétrie postulée ; aucune mesure. |
| ZG sans poste avant et arceaux | Σ(mᵢ × zᵢ) / Σmᵢ | 25,41 mm | E | Positions et masses proposées ; réserve non localisée exclue. |
| Part statique essieu avant sans poste avant et arceaux | 100 × (XG − 44) / 120 | 46,3 % | E | Sol plat, deux essieux ; transferts dynamiques et appui des fourches exclus. |
| Écart XG à la cible sans poste avant et arceaux | XG − Xcible | -10,41 mm | E | Cible P ; un écart ne prouve pas la stabilité. |
| Écart ZG à la cible sans poste avant et arceaux | ZG − Zcible | -4,59 mm | E | Cible P ; positions réelles à relever. |

## Allocations de masse

Dénominateur des parts : 3 850 g, réserve comprise. Positions en mm dans le repère du JSON.

| Poste | Masse | Position X ; Y ; Z | Part ; formule | Statut et limite |
|---|---:|---|---|---|
| Châssis, capot et supports | 800 g | 100 ; 0 ; 28 | 20,8 % ; 100 × 800 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Flancs, pare-chocs et pods | 450 g | 110 ; 0 ; 26 | 11,7 % ; 100 × 450 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Propulsion (roues, moteurs, courroies) | 700 g | 104 ; 0 ; 27,5 | 18,2 % ; 100 × 700 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Batterie et retenue | 350 g | 50 ; 0 ; 26 | 9,1 % ; 100 × 350 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Commande et distribution | 300 g | 45 ; 0 ; 20 | 7,8 % ; 100 × 300 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Module avant et arceaux | 650 g | 215 ; 0 ; 62 | 16,9 % ; 100 × 650 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Visserie et petits accessoires | 200 g | 100 ; 0 ; 25 | 5,2 % ; 100 × 200 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Fourches et aménagements | 150 g | 270 ; 0 ; 10 | 3,9 % ; 100 × 150 / 3850 | P → F ; Allocation et position proposées, non mesurées. |
| Réserve non localisée | 250 g | — | 6,5 % ; 100 × réserve / budget | P → F ; exclue du CG |

## Lecture du centrage

Avec poste avant et arceaux : (120,43 ; 0 ; 32,01) mm sur 3 600 g ; part statique avant 63,7 %. Sans ce poste entier : (99,59 ; 0 ; 25,41) mm sur 2 950 g ; part avant 46,3 %. Cible P : (110 ; 0 ; 30) mm. La relation de charge est (XG − 44) / 120.

**Limite du JSON :** Le poste de 650 g regroupe module avant et arceaux : le seul retrait du module n’est pas calculable depuis ce JSON. Réserve de 250 g exclue faute de position. Le calcul « sans » ne représente donc pas exactement une configuration conservant les arceaux. Les fourches touchent le sol dans la maquette : leur effet éventuel sur les appuis est également omis.

## Écarts documentaires et contrôles

S0 annonce 3 850 g en couverture, puis 3 990 g « homologués » et « mesurés » dans son tableau ; les 19 postes non nuls de ce tableau totalisent 3 990 g, mais aucune preuve de pesée n’est fournie. Le récapitulatif reprend 3 990 g et 0 g de lest. R1/R1.1 remplacent ces prétentions par 3 600 g d’allocations et 250 g de réserve, soit 3 850 g. Leur mention de 1 586 g de lest provient d’une autre base du rapport initial ; elle ne se retrouve pas dans le tableau S0 présent. La différence de version doit être clarifiée.

R1/R1.1 utilisent quatre moteurs et l’enveloppe 320 × 280 × 100 mm. R2 représente deux motoréducteurs et une enveloppe 334 × 217 × 110 mm. Les valeurs R1/R1.1 de 5 min idéales, 4 min avec réserve, 14,4 A, 1,875 Ah, 22,2 Wh, 1,73 m/s et µ ≈ 1,19 restent cohérentes pour le cas 1,5 Ah et leurs hypothèses ; 1,875 Ah s’arrondit à 1,9 Ah pour un choix de pack. Les 480 s de la procédure S0 valent 8 min, et non 7 min 40 s ; aucune durée entre matchs n’est publiée dans les règles consultées.

Le CG estimé de R1.1, (172 ; 0 ; 37) mm, reposait sur une autre implantation (essieu arrière X = 70 mm, empattement 165 mm). Il n’est pas directement comparable au CG R2 dans son repère et sa géométrie. La R2 prend X arrière = 44 mm, empattement = 120 mm, et des allocations localisées proposées.

Contrôles géométriques automatiques : empattement OK ; hauteur_module OK ; largeur_flancs OK ; longueur_sans_fourches OK ; budget OK. Ces contrôles ne démontrent pas les jeux, la disponibilité des pièces ou la faisabilité. Le volume batterie a été réduit par rapport à la maquette et doit être confronté au pack choisi ; les 650 g du poste avant et arceaux ne décrivent pas la masse d’une pièce existante.

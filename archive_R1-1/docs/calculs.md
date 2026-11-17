# Calculs reproductibles — HOTLINE MK-II

Source unique des entrées actuelles : `config/geometry.json` (2026-10-16). F = calcul arithmétique vérifié ; H = entrée hypothétique ; E = estimation fondée sur H/P/PV. Aucune ligne E n'est une mesure.

Entrées H : 1,5 Ah, 14,8 V, 18 A, 600 tr/min, poussée 45 N, réserve de capacité 20 %. Durée et masse maximale publiées : 5 min et 4000 g (2026-10-16 23:28 GMT).

| Grandeur | Formule | Résultat arrondi | Statut | Portée / limite |
|---|---|---:|:---:|---|
| Autonomie idéale | 60 × C / I | 5 min | E | Capacité entière et courant constant supposés. |
| Autonomie avec réserve | 60 × C × (1 − r) / I | 4 min | E | Réserve de capacité de travail ; autonomie réelle inconnue. |
| Courant moyen admissible pour le match | 60 × C × (1 − r) / t | 14,4 A | E | Maximum théorique à vérifier sur le système entier. |
| Capacité nécessaire au courant supposé | I × t / [60 × (1 − r)] | 1,875 Ah | E | Minimum théorique ; disponibilité, masse et décharge à vérifier. |
| Courant moyen par voie | I / 2 | 9 A | E | Répartition égale supposée ; deux moteurs par voie, pointes inconnues. |
| Énergie nominale du pack | U × C | 22,2 Wh | E | Énergie nominale ; ni énergie utile ni puissance garantie. |
| Vitesse sans glissement | π × (Ø / 1000) × n / 60 | 1,73 m/s | E | À la vitesse de roue supposée ; charge et glissement inconnus. |
| Adhérence requise pour la poussée supposée | F / [(M / 1000) × 9,81] | 1,19 µ | E | Toute la masse budgétée sur les roues ; 45 N non démontrés. |
| Somme des postes | Σ mᵢ | 3600 g | F | Addition des allocations, pas une pesée. |
| Budget avec réserve | Σ mᵢ + réserve | 3850 g | F | La réserve est incluse une seule fois. |
| Marge au maximum publié | Mmax − budget | 150 g | F | Marge budgétaire seulement ; conformité à peser. |
| Marge relative au maximum | 100 × marge / Mmax | 3,75 % | F | Pourcentage du maximum publié. |
| XG avec module avant | Σ(mᵢ xᵢ) / Σmᵢ | 169,71 mm | E | Positions PV ; réserve non localisée exclue. |
| ZG avec module avant | Σ(mᵢ zᵢ) / Σmᵢ | 37,89 mm | E | Positions PV ; symétrie YG = 0 ; aucune mesure. |
| Charge sur essieu avant avec module | 100 × (XG − x arrière) / empattement | 60,4 % | E | Équilibre statique sur sol plat, sans transfert dynamique. |
| XG sans module avant | Σ hors 08(mᵢ xᵢ) / Σ hors 08mᵢ | 144,31 mm | E | Masse restante ; réserve exclue. |
| ZG sans module avant | Σ hors 08(mᵢ zᵢ) / Σ hors 08mᵢ | 31,92 mm | E | Positions PV ; aucune mesure. |
| Charge sur essieu avant sans module | 100 × (XG − x arrière) / empattement | 45 % | E | Équilibre statique sur sol plat. |

Les parts de masse utilisent le budget avec réserve (3850 g) comme dénominateur ; chaque poste est une allocation P et sa part est un calcul F sur cette allocation.

| Poste | Formule de part | Résultat arrondi | Statut | Portée / limite | Position PV (X ; Y ; Z), mm |
|---|---|---:|:---:|---|---|
| Structure et supports | 100 × 800 / 3850 | 20,8 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 140 ; 0 ; 34 |
| Protections remplaçables | 100 × 450 / 3850 | 11,7 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 146 ; 0 ; 37,5 |
| Propulsion 4WD complète | 100 × 700 / 3850 | 18,2 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 152,5 ; 0 ; 27,5 |
| Batterie et retenue | 100 × 350 / 3850 | 9,1 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 165 ; 0 ; 31,5 |
| Commande et distribution | 100 × 300 / 3850 | 7,8 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 115 ; 0 ; 26 |
| Module avant réservé | 100 × 650 / 3850 | 16,9 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 285 ; 0 ; 65 |
| Visserie et petits accessoires | 100 × 200 / 3850 | 5,2 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 140 ; 0 ; 30 |
| Aménagements et identification | 100 × 150 / 3850 | 3,9 % | F | Part arithmétique d’une allocation P ; position PV non mesurée. | 140 ; 0 ; 40 |
| Réserve non localisée | 100 × 250 / 3850 | 6,5 % | F | Allocation P, sans position : exclue du CG. | — |

**CG E.** Avec 08 : (169,71 ; 0 ; 37,89) mm sur 3600 g, charge avant 60,4 %. Sans 08 : (144,31 ; 0 ; 31,92) mm sur 2950 g, charge avant 45 %. La charge suit (XG − 70) / 165. La réserve de 250 g n'a pas de position et n'est incluse dans aucun de ces CG.

R1.1 publie (172 ; 0 ; 37) mm E, contre (169,71 ; 0 ; 37,89) mm E ici : écart -2,29 mm en X et +0,89 mm en Z. La part avant passe d'environ 62 % publiée à 60,4 %. R1.1 ne documente pas les placements ayant produit sa valeur ; le JSON pose des positions PV différentes. Sans 08, R1.1 annonce environ (147 ; 0 ; 31) mm et 47 % avant contre (144,31 ; 0 ; 31,92) mm et 45 % avant. La comparaison ne permet pas d'identifier le placement antérieur exact.

## Vérification de R1 et R1.1

Les deux révisions donnent correctement 5,00 min, 4,00 min, 14,4 A, 1,875 Ah, 22,2 Wh, 1,73 m/s et µ ≈ 1,19 avec leurs hypothèses. Le courant par voie de 9 A dans R1.1 est une moyenne conditionnelle, pas un calibre de contrôleur. Le total historique de lest 1 586 / 3 850 = 41,2 % est arithmétiquement correct, mais les 22 masses du rapport initial ne sont pas disponibles ici pour une vérification indépendante. Les 480 s cités en R1/R1.1 valent bien 8 min ; les huit durées du rapport initial ne sont pas disponibles ici pour recomposer cette somme. L’autonomie de 4 min 30 s évoquée pour le rapport initial suppose 90 % de capacité utilisable, hypothèse absente.

## Cohérence et limites du JSON

La somme des postes est 3600 g, la réserve 250 g et le budget 3850 g : cohérents. L’empattement 165 mm égale la différence des axes (235 − 70). La hauteur hors tout 100 mm est portée par 08 ; le capot finit à Z = 65 mm. Le volume 08 est une enveloppe, tandis que son allocation de 650 g suppose une configuration avec masse réelle future : ne pas confondre la vue neutralisée et le budget de configuration complète. La « réserve projet » ne possède aucune position, donc son effet sur CG et charge avant est indéterminé. Les positions des postes sont PV et certains regroupements (protections, commande) ne correspondent pas à une seule pièce ; ils doivent être recalculés après inventaire. L’accès 09 indiqué à Z = 65–75 mm débute au sommet du capot (Z = 65 mm) : c’est un volume d’accès proposé, pas la position vérifiée d’un organe.

Aucune incohérence arithmétique bloquante trouvée dans les champs vérifiés. La faisabilité des jeux, matériaux, courants et dimensions de l’arène reste à confirmer.

# Registre des points à confirmer — HOTLINE MK-II

État au 16 octobre 2026. F = information publiée ou arithmétique ; H = hypothèse non mesurée ; P/PV = proposition ; E = estimation ; V = à vérifier. Les réponses et preuves doivent être inscrites par l’équipe après l’entretien et l’inventaire.

| ID | Sujet | Valeur actuelle + statut | Source | Qui confirme | Quand | Impact si différent |
|---|---|---|---|---|---|---|
| C01 | Version technique applicable et dimensions maximales | Non publiées V | `config/geometry.json` → `regles_publiees.non_publie` ; page catégorie consultée le 16/10/2026 23:28 GMT | DoniFab / Membre 1 | Entretien 17 oct. | Modifier enveloppe, plans et conception avant achat. |
| C02 | Masse et durée officielles | 4 kg maximum et duel de 5 min F | Page Robots Battle ; `regles_publiees` | DoniFab / Membre 1 | Entretien 17 oct. | Recalculer masse et autonomie si une version applicable change. |
| C03 | Contenu exact du kit | Inconnu V | FAQ et catégorie ; `regles_publiees.non_publie` | DoniFab / Membre 5 | Entretien puis remise du kit | Revoir nomenclature, budget, dimensions et calendrier. |
| C04 | Motoréducteurs, roues et interfaces | 4 moteurs « type 370 » H ; roues Ø55 H ; Ø25 × 58 P | `geometry.json` ; R1.1 §2 | Membre 4 / Membre 2 | Inventaire semaine 1 | Adapter voie, jeux, supports, contrôleurs et vitesse. |
| C05 | Jeu roue–caisson / protection | 2,5 / 6,5 mm P | R1.1 §2–4 ; géométrie actuelle | Membre 2 | V2 semaine 1 | Déplacer axes, élargir voie ou modifier caisson/protections. |
| C06 | Matériaux et fixations | PVC rigide, carton stratifié résiné, PEHD, polycarbonate envisagés P ; nuances inconnues V | R1/R1.1 §3 ; `geometry.json` | Membre 2 / encadrant | Avant fabrication | Revoir épaisseurs, chemin des efforts, sécurité et masse. |
| C07 | Batterie et chargeur admis | Pack 4S 1,5 Ah H ; batteries admises et charge inconnues V | `geometry.json` ; pages officielles consultées | DoniFab / encadrant / Membre 1 | Entretien, puis V3 | Revoir énergie, volume 04, charge et masse. |
| C08 | Courant et autonomie réels | 18 A moyens H ; 4 min avec 20 % de réserve E | `geometry.json` ; `calculs.json` | Membre 4 / encadrant | V3 puis V5 | Choisir pack et contrôleurs compatibles ou réduire la consommation. |
| C09 | Courants de pointe et tension moteurs | Inconnus V ; 9 A/voie est seulement une moyenne E | R1.1 §5–6 ; `calculs.json` | Membre 4 / encadrant | V3 | Modifier les voies, protections et faisceau après revue. |
| C10 | Masse de chaque poste | 3 600 g alloués P + 250 g de réserve P ; total 3 850 g F | `geometry.json` ; `calculs.json` | Membre 5 | Inventaire puis V6 | Réaffecter réserve et différer les options avant limite de 4 kg. |
| C11 | CG et charge sur essieu | (169,71 ; 0 ; 37,89) mm E, 60,4 % avant E avec module ; positions PV | `geometry.json` ; `calculs.json` | Membre 2 / Membre 5 | Après masses et positions mesurées | Replacer batterie/module, recontrôler l’appui. |
| C12 | Masse effective du module 08 | 650 g d’allocation P ; volume neutralisé P | `geometry.json` ; R1.1 §7 | Membre 3 / Membre 5 | Après décision de configuration | CG, masse et charge avant changent fortement ; refaire calcul. |
| C13 | Mécanismes permis et option P3 | Règles détaillées inconnues V ; levage lent non coupant P3 | `regles_publiees.non_publie` ; R1.1 §2 | DoniFab / encadrant / Membre 3 | Entretien, avant intégration | Maintenir 08 neutralisé ou différer P3. |
| C14 | Sectionnement, inspection et essais | Accès 09 proposé X 35–60, Z 65–75 P/V ; procédure inconnue V | `geometry.json` ; pages officielles | DoniFab / encadrant / Membre 1 | Entretien puis V3/V4 | Modifier implantation et protocole ; aucun essai non autorisé. |
| C15 | Radio et alimentation régulée | FS-iA6B candidat H ; modèle et disponibilité inconnus V | R1/R1.1 §5 | Membre 4 / Membre 5 | Inventaire semaine 1 | Modifier régulation, mixage et budget. |
| C16 | Prix et disponibilité à Bamako | Aucun devis reçu V ; aucun prix retenu | R1/R1.1 §8 ; `budget_grille.csv` | Membre 5 | Semaine 1 avant achat | Adapter choix et délai ; ne pas assimiler blanc à gratuit. |
| C17 | Convocation et format de l’épreuve | Entretien 17 oct. selon équipe/convocation ; éliminatoire 7 nov. F au calendrier ; format inconnu V | R1.1 ; `regles_publiees.calendrier` | DoniFab / Membre 1 | 17 oct. | Adapter jalons et préparation du stand. |
| C18 | Délai entre matchs et maintenance | 10 min H non publiées ; 480 s = 8 min F de durées citées, non chronométrées | R1/R1.1 §11 | DoniFab / Membre 5 | Entretien, puis répétition | Revoir rechanges et séquence sans raccourcir les étapes de sécurité. |
| C19 | Émetteur, pilote et capitaine | Membre 4 pilote proposé P ; capitaine à désigner V | R1.1 §10–11 ; règlement art. 2 | Équipe / Membre 1 | Avant entretien | Clarifier interlocuteur et rôle pendant l’épreuve. |

Les sources officielles consultées localement sont `sources/web/categories_robots-battle.txt`, `reglement.txt`, `calendrier.txt` et `faq.txt`. Le domaine correct est **malibotschallenge.com** ; le domaine sans « s » ne répond pas selon le brief.

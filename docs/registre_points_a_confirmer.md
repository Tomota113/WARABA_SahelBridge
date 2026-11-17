# Registre des points à confirmer — WARABA R2

État de travail du 16 octobre 2026. **F** = règle publiée ou calcul arithmétique ; **M** = maquette non mesurée ; **H** = hypothèse ; **P** = proposition ; **E** = estimation ; **V** = à vérifier. Les réponses seront datées et accompagnées d'une preuve par l'équipe.

| ID | Sujet | Valeur et statut | Source | Qui confirme | Quand | Impact |
|---|---|---|---|---|---|---|
| C01 | Nom final et attribution | WARABA, nom provisoire P ; architecture inspirée d'un robot de référence | `config/geometry.json` ; récapitulatif | Équipe / M1 | 17 oct. | Mettre à jour identité, dossier et maquette. |
| C02 | Version des règles et dimensions admises | 4 kg, duel 5 min, sécurité hors arène F ; dimensions non publiées V | `regles_publiees`, 16/10/2026 23:28 GMT | DoniFab / M1 | Entretien 17 oct. | Adapter enveloppe et protocole. |
| C03 | Contenu exact du kit | Inconnu V | `regles_publiees.non_publie`, FAQ | DoniFab / M5 | Entretien puis remise | Revoir interfaces, nomenclature et budget. |
| C04 | Nombre et modèle des moteurs | 2 motoréducteurs P/M en R2 ; 4 moteurs H en R1/R1.1 | `transmission`, R1/R1.1 | M4 / DoniFab | Inventaire V1 | Refaire implantation, commande et masse. |
| C05 | Courroies, poulies, roues | 2 jeux et 4 roues Ø55 M/H ; références réelles V | `transmission`, `roues` | M2/M4 | V1–V2 | Modifier voie, fixations et vitesse. |
| C06 | Jeux et résistance de la structure | Interférences de maquette corrigées P ; tenue V | `chassis`, `pods`, `batterie` | M2 / encadrant | V2 | Refaire les volumes avant fabrication. |
| C07 | Matériaux et fixations | PVC ou plaque technique, PEHD, métal qualifié envisagés P | `chassis`, `flancs`, R1/R1.1 | M2 / encadrant | Avant achat | Revoir masse, disponibilité et sécurité. |
| C08 | Batterie et chargeur admis | 4S 1,5 ou 2,2 Ah H ; batteries admises V | `hypotheses_calcul`, règles publiées | DoniFab / encadrant / M1 | 17 oct., V3 | Revoir volume, masse, énergie et charge. |
| C09 | Autonomie et courant réels | 18 A H ; 1,5 Ah : 4 min E avec réserve ; 2,2 Ah : 5,87 min E | `calculs.json` | M4 / encadrant | V5 | Choisir pack et vérifier 5 min. |
| C10 | Courant par voie et protections | 9 A/voie E, un moteur par voie ; pointes V | `calculs.json`, R2 | M4 / encadrant | V3 | Dimensionner contrôleurs et protections. |
| C11 | Budget de masse | 3 600 g alloués + 250 g de réserve = 3 850 g F sur P ; aucune pesée | `masse.postes`, `calculs.json` | M5 | V6 | Modifier configuration avant limite de 4 kg. |
| C12 | Poste avant et arceaux | 650 g P groupés ; répartition réelle V | `masse.postes` | M2/M3/M5 | Avant CG final | Séparer masses et positions pour calcul sans module seul. |
| C13 | Centrage et appuis | Avec poste : XG 120,43 mm E, part avant 63,7 % E ; cible X 110 P | `calculs.json`, `cg.cible` | M2/M5 | V2 puis V6 | Repositionner les masses ; vérifier appui des fourches. |
| C14 | Module avant et P3 | Enveloppe réservée P ; levage lent non coupant P3 ; permission V | `module_avant`, `option_levage`, règles | DoniFab / encadrant / M3 | 17 oct. avant intégration | Maintenir volume neutralisé ou étudier P3. |
| C15 | Coupe-circuit, radio, inspection | Accès arrière sur capot P/V ; procédure officielle non publiée V | `sectionnement`, règles | DoniFab / M1/M4 | Entretien puis V3–V4 | Modifier implantation et essais. |
| C16 | Prix et disponibilité à Bamako | Aucun devis vérifié V ; aucune cellule prix remplie | `budget_grille.csv` | M5 | Semaine du 19 oct. | Comparer solutions et délais avant achat. |
| C17 | Convocation et calendrier | Présentation annoncée le 17 oct. par l'équipe ; éliminatoire publiée le 7 nov. F | brief ; `regles_publiees.calendrier` | DoniFab / M1 | 17 oct. | Adapter jalons et présence. |
| C18 | Maintenance entre matchs | 480 s = 8 min F de durées S0 ; délai entre matchs V | S0 p.8 ; `regles_publiees.non_publie` | DoniFab / M5 | Entretien puis répétition | Préparer procédure sans temps garanti. |
| C19 | Rôles et capitaine | M1 à M5 proposés P ; capitaine V | R2 ; règlement art. 2 | Équipe | Avant entretien | Identifier interlocuteur et preuves. |
| C20 | Fichiers visuels attendus | `renders/01` à `08` et `plans/svg` absents V ; schémas intégrés au dossier | Arborescence locale, 16 oct. | M2 / équipe | Avant export PDF | Produire les vues/planche si elles sont nécessaires au dépôt jury. |

Sources officielles de référence : [Robots Battle](https://www.malibotschallenge.com/categories/robots-battle), [règlement](https://www.malibotschallenge.com/reglement), [calendrier](https://www.malibotschallenge.com/calendrier), consultés selon `regles_publiees` le 16/10/2026 à 23:28 GMT. Le contenu du kit, les dimensions maximales, les batteries admises et les mécanismes permis n'y sont pas précisés.

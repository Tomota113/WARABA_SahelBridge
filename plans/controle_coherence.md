# Contrôle de cohérence — WARABA / SahelBridge — R2

Date de référence : **16/10/2026**, issue du JSON (date de la planche conservée même lors d’une exécution ultérieure). Unité : **mm**.

**Résultat : aucune interférence non prévue dans les volumes modélisés.** 140/140 vérifications satisfaites. Enveloppe atteinte : **334 × 217 × 110 mm**. Le JSON n’est pas modifié.

## Source et méthode

- Source unique : [config/geometry.json](../config/geometry.json), empreinte SHA-256 `8989b524c1f9eb774e2bbb3d30033141c65aa2b1a56a96f42429a9e4d94afb26`.
- Origine O au sol, dans le plan de symétrie, à l'arrière du pare-chocs. X vers l'avant, Y vers la gauche, Z vers le haut.
- 41 volumes : boîtes, profils XZ extrudés en Y, cylindres d’axe Y et platines XY extrudées en Z. Paires contrôlées : 820. Présence du capot et du coupe-circuit incluse dans le contrôle, même lorsque le dessin retire le capot.
- Les boîtes servent au préfiltrage ; l’intersection réelle approchée utilise les profils concaves triangulés et soustrait l’évidement des arceaux. Les cercles sont discrétisés en 128 segments, erreur radiale maximale sur 08 : 0,014 mm. Les jeux du tableau sont calculés analytiquement, sans discrétisation.
- La poulie motrice est supposée coaxiale au moteur et les autres aux roues. Courroies : tracé de principe à la largeur des poulies. Pour le contrôle des platines, on utilise une enveloppe pleine englobant les poulies et les brins : aucun passage dans le vide central de la transmission n’est invoqué pour conclure au dégagement. Leur épaisseur, leur tension et leur routage réel ne sont pas validés.
- Les platines sont dessinées avec leur trapèze XY, un retrait extérieur de 8 mm à chaque extrémité (instruction utilisateur, cote absente du JSON) et leur ajour triangulaire symétrique. Le contrôle d’interférence utilise leur boîte pleine, plus conservatrice : il ne profite ni des coins retranchés ni de l’ajour. Un recouvrement éventuel de cette boîte serait signalé comme candidat conservateur.
- Les axes de roues Ø6 relient rail et flanc ; leurs passages coaxiaux dans roues et poulies sont des liaisons volontaires, sans modélisation des alésages.
- Les cotes des nouvelles vues dérivent du JSON, hormis le retrait extérieur des platines demandé explicitement. Les paramètres de papier, de projection et de style sont fixés dans le générateur. Les stries sont des symboles de surface, sans cote de fabrication. Les données anciennes ci-dessous servent uniquement à l’audit de la source.

## Enveloppe atteinte et implantation

| Grandeur | Calcul / limites | Résultat | Statut |
| --- | --- | --- | --- |
| Longueur totale | X 0…334 | 334 | M |
| Longueur sans fourches | X 0…273 | 273 | M |
| Largeur totale | Y -108,5…108,5 | 217 | M |
| Hauteur totale, sommet 08 | Z 0…110 | 110 | M |
| Axes des roues en X | 44 / 164 | 120 d’empattement | M |
| Voie entre centres | 2 × 91 | 182 | M |
| Rails, entre faces externes | 2 × 73 | 146 | M |
| Module avant, largeur × diamètre | 2 × 56 ; 2 × 48 | 112 × 96 | M |
| Axe 08 en X ; Z | origine du JSON | 225 ; 62 | M |

L’extrémité des fourches fixe la longueur ; les flancs fixent la largeur ; 08 fixe la hauteur. Le capot culmine à 44, les flancs à 46, les roues à 55, les arceaux à 95 et le coupe-circuit à 52.

## Jeux calculés

| Paire / mesure | Expression en mm | Jeu (mm) | Statut du calcul / sources |
| --- | --- | --- | --- |
| Roue / pod avant, G et D | 193 − (164 + 27,5) | 1,5 | P / H |
| Roue / rail intérieur, G et D | 81 − 73 | 8 | E (M / H) |
| Roue / flanc extérieur, G et D | 103,5 − 101 | 2,5 | E (M / H) |
| Poulie / roue, G et D | 81 − 79,5 | 1,5 | E (M / H) |
| Poulie / rail intérieur, G et D | 74,5 − 73 | 1,5 | E (M) |
| 08 / arceau, de chaque côté | 67 − 56 | 11 | E (M) |
| 08 / capot, séparation des projections sur X | 225 − 48 − 164 | 13 | E (M / P) |
| 08 / capot, distance géométrique minimale | √[(225 − 164)² + (62 − 44)²] − 48 | 15,6 | E (M / P) |
| 08 / sol | 62 − 48 | 14 | E (M) |
| Batterie / motoréducteurs, séparation sur X | début des cylindres moteurs − fin du pack | 5 | E (M / P) |
| Batterie / dessous du capot | 41 − 40 | 1 | E (P) |

**Les 13 mm demandés pour 08 / capot sont une séparation sur X entre boîtes de projection**, conservatrice. La distance euclidienne entre le cylindre et le coin supérieur avant du capot est 15,6 mm ; il ne s’agit pas de deux valeurs contradictoires du même jeu. Les 11 mm concernent chaque côté de 08 face aux arceaux.

## Mise à jour des arceaux, platines, pare-chocs et ouïes

- Évidement des arceaux en XZ : (188 ; 57) / (208 ; 61) / (207 ; 85). Le triangle est soustrait du profil et contrôlé comme contenu dans chaque arceau ; son trou apparaît en profil et en axonométrie.
- Platines : X 76–132, |Y| 73–103, Z 40,5–42,5. Le bord extérieur mesure 40 mm, contre 56 mm au bord intérieur. Ajour XY : (92 ; 80) / (116 ; 80) / (104 ; 96), miroir exact en −Y.
- Pare-chocs : bleu de Z 10 à 24, noir de 24 à 42. Le dessus ne montre que la partie noire ; en face avant, la caisse masque le pare-chocs arrière.
- Capot : 7 fentes par rangée, deux rangées symétriques à Y=±28, largeur 2, pas 7, longueur 16 mm. Le capot retiré et ses ouïes restent en contour fantôme au-dessus et en axonométrie. Aucun évidement traversant n’est inventé en profil ou en face.

### Dégagement des platines

| Platine | Obstacle | Séparation X (mm) | Séparation Y (mm) | Séparation Z (mm) | Résultat |
| --- | --- | --- | --- | --- | --- |
| platine-D | rail-D | -118 | 0 | -3,5 | dégagé / tangent |
| platine-D | roue-D-44 | 4,5 | -22 | -14,5 | dégagé / tangent |
| platine-D | roue-D-164 | 4,5 | -22 | -14,5 | dégagé / tangent |
| platine-D | courroie-D | -97 | -6,5 | 4 | dégagé / tangent |
| platine-G | rail-G | -118 | 0 | -3,5 | dégagé / tangent |
| platine-G | roue-G-44 | 4,5 | -22 | -14,5 | dégagé / tangent |
| platine-G | roue-G-164 | 4,5 | -22 | -14,5 | dégagé / tangent |
| platine-G | courroie-G | -97 | -6,5 | 4 | dégagé / tangent |

Une séparation positive sur un seul axe suffit à exclure une interférence ; zéro désigne une tangence sans volume commun ; une valeur négative indique seulement un chevauchement des projections sur cet axe. Les deux côtés et les obstacles du côté opposé sont contrôlés ; le tableau détaille les paires du même côté. Les platines sont séparées de chaque roue de **4,5 mm sur X**, de l’enveloppe des courroies de **4 mm sur Z**, et sont **tangentes aux rails à |Y|=73**, sans pénétration. Cette tangence ne constitue pas une marge de tolérance.

## Gardes au sol et contacts

| Élément | Minimum Z (mm) | Statut / interprétation |
| --- | --- | --- |
| plancher | 7,5 | M |
| pods | 8 | M |
| flancs | 12 | M |
| fourches | 0 | P — contact au sol volontaire |
| Roues | 0 | H — contact au sol volontaire |
| 08 | 14 | M — enveloppe uniquement |

Appuis sans pénétration : plancher / batterie et électronique à Z=12,5 ; arceaux / dessus des rails à Z=44 ; coupe-circuit / dessus du capot à Z=44. Le capot est bord à bord avec les rails, à |Y|=67. Les fourches touchent le sol sur leur segment inférieur, pas seulement à leur extrémité. Les appuis ne prouvent aucune fixation mécanique.

## Interférences entre volumes

**Aucune interférence non prévue détectée.** 10 recouvrements sont classés explicitement ; 0 candidats de boîtes sont éliminés après intersection des profils.

| Volume A | Volume B | Volume commun approché / borne supérieure (mm³) | Interprétation |
| --- | --- | --- | --- |
| pod-D | fourche-D | 1577,739 | Engagement volontaire de la fourche dans le pod ; logement non détaillé |
| roue-D-44 | axe-roue-D-44 | 565,26 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| axe-roue-D-44 | poulie-D-44 | 141,315 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| roue-D-164 | axe-roue-D-164 | 565,26 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| axe-roue-D-164 | poulie-D-164 | 141,315 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| pod-G | fourche-G | 1577,739 | Engagement volontaire de la fourche dans le pod ; logement non détaillé |
| roue-G-44 | axe-roue-G-44 | 565,26 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| axe-roue-G-44 | poulie-G-44 | 141,315 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| roue-G-164 | axe-roue-G-164 | 565,26 | Liaison coaxiale d’assemblage ; alésages non détaillés |
| axe-roue-G-164 | poulie-G-164 | 141,315 | Liaison coaxiale d’assemblage ; alésages non détaillés |

**Recouvrement volontaire fourche / pod** : la fourche est engagée dans le pod, qui est ici représenté plein. Le logement n’est pas défini ; l’intersection n’est donc ni cachée ni qualifiée de jeu libre. Même principe pour les axes dans les roues et les poulies.

Les boîtes tangentes ne sont pas comptées comme des collisions de volume. Les pièces au contact et la géométrie de logement restent à définir sur une CAO de fabrication.

## Corrections apportées à la maquette du coéquipier

La maquette est conservée intacte. Les corrections suivantes sont déjà portées par le JSON R2 et sont reprises dans les nouvelles vues, sans réutiliser sa géométrie R1.1.

| Sujet | Constat ancien → représentation R2 | Trace dans le fichier source |
| --- | --- | --- |
| Pods / roue avant | Pod de la maquette à X=189 ; roue avant jusqu’à 191,5 : pénétration de 2,5. R2 : pod dès X=193, jeu 1,5. | [maquette, ligne 2577](../sources/coequipier/Maquette_Detaillee_Bot.html#L2577) |
| Planchers latéraux dans les roues | Semelles 185 × 5 × 36, centrées transversalement à ±88 et à Z=10 ; elles traversent les pneus. R2 : semelles supprimées, plancher central limité à Y=±67. | [maquette, ligne 2238](../sources/coequipier/Maquette_Detaillee_Bot.html#L2238) |
| Poulies dans les roues | Maquette : poulies aux essieux centrées à \|Y\|=85, largeur 8 (81–89), pneus 82–102 : recouvrement transversal 7. R2 : poulies 74,5–79,5, pneus 81–101 ; jeu 1,5. La poulie motrice centrale était dans le même couloir transversal, mais séparée des pneus en X. | [maquette, ligne 2771](../sources/coequipier/Maquette_Detaillee_Bot.html#L2771) |
| Arceaux dans les rails | Maquette : rail \|Y\|=67–73 ; arceau 70–78, soit 3 de recouvrement latéral, base Z=38 dans le rail montant à 44. R2 : même plan transversal 67–73, base Z=44 ; appui sur les rails, sans pénétration. | [maquette, ligne 2329](../sources/coequipier/Maquette_Detaillee_Bot.html#L2329) |
| Batterie dans les moteurs | Maquette : pack X=−107,5…−22,5, moteur centré X=−25, rayon 11 ; recouvrement de boîtes de 13,5 en X, avec intersection réelle du cylindre. R2 : pack 12–88 et moteurs dès 93, jeu 5. | [maquette, ligne 2849](../sources/coequipier/Maquette_Detaillee_Bot.html#L2849) |
| Capot incliné | Maquette : dessus incliné 48→38 et dessous 44→34 ; au droit de la batterie son dessous descend jusqu’à environ 37,6 alors que le pack monte à 38. R2 : capot plat Z=41–44, batterie jusqu’à 40, jeu 1. | [maquette, ligne 2261](../sources/coequipier/Maquette_Detaillee_Bot.html#L2261) |

Les cotes de l’ancienne 3D utilisent X longitudinal et Z transversal dans Three.js, avec Y vertical. Elles sont expliquées ci-dessus dans le repère mécanique du JSON (X avant, Y gauche, Z haut). Les références de lignes permettent de retrouver les primitives originales.

## Erreurs relevées dans ses plans 2D

Audit de l’onglet « Plans 2D » du fichier local [Maquette_Detaillee_Bot.html](../sources/coequipier/Maquette_Detaillee_Bot.html), vues dessus, profil, face et éclaté. Les nouvelles planches les remplacent.

| Sujet | Erreur constatée / correction | Trace dans le fichier source |
| --- | --- | --- |
| Cotes de dessus contradictoires | Châssis 280, longueur totale 420 et largeur 250 annoncés ; R2 : longueur sans fourches 273, totale 334, largeur 217. La cote 280 ne correspond pas au plancher central de 158. | [maquette, ligne 1108](../sources/coequipier/Maquette_Detaillee_Bot.html#L1108) |
| Échelle de dessus incohérente | Segments SVG : 310 px pour 280 mm, 525 px pour 420 mm, 300 px pour 250 mm. Rapports respectifs 1,107, 1,25, 1,2 px/mm : aucune échelle commune, malgré le cartouche « 1:2.5 ISO ». Nos SVG ont des dimensions physiques en mm. | [maquette, ligne 1145](../sources/coequipier/Maquette_Detaillee_Bot.html#L1145) |
| Empattement du profil | Le plan indique 190, mais les centres de la 3D sont à X=−85 et +35, soit 120. Le dessin utilise 190 px entre centres et 80 px pour Ø55 : ses cotes ne suivent pas une même échelle. | [maquette, ligne 1299](../sources/coequipier/Maquette_Detaillee_Bot.html#L1299) |
| Hauteur du profil | Cote 145 rattachée à Y=230, sans sommet correspondant : l’arceau dessiné culmine à Y=325 et son enveloppe circulaire à Y=270. R2 distingue arceau 95, caisse 44 et hauteur totale 110. | [maquette, ligne 1283](../sources/coequipier/Maquette_Detaillee_Bot.html#L1283) |
| Voie confondue avec largeur | La face annonce « voie totale 250 » en cotant les bords externes des pneus ; ce n’est pas une voie entre centres. La 3D place les roues à ±92, voie 184 ; R2 les recentre à ±91, voie 182, hors-tout flancs 217. | [maquette, ligne 1445](../sources/coequipier/Maquette_Detaillee_Bot.html#L1445) |
| Projections incompatibles des arceaux et des pods | Les arceaux de profil sont des quadrilatères bas, ceux de face des rectangles hauts ; aucun ne projette le profil triangulaire ajouré de la 3D. En face les pods sont fortement décalés vers le centre par rapport aux roues, contrairement à la 3D. R2 projette partout les mêmes profils extrudés. | [maquette, ligne 1383](../sources/coequipier/Maquette_Detaillee_Bot.html#L1383) |
| Flancs et occultation des roues | Les plans ajoutent des arches au-dessus des roues et un flanc crénelé à trou triangulaire, absents du profil 3D incliné. Les roues de profil sont masquées sans arcs cachés ; au-dessus le caisson empiète sur les pneus. R2 montre leurs parties libres, leurs arcs cachés interrompus et les flancs sans arches ajoutées. | [maquette, ligne 953](../sources/coequipier/Maquette_Detaillee_Bot.html#L953) |
| Module avant : largeur et garde au sol | Les planches annoncent une largeur 118, tandis que la 3D donne une portée transversale 112. Le profil annonce 22 de garde, mais l’axe 3D Z=62 et le rayon 48 donnent 14. R2 conserve seulement l’enveloppe Ø96 × 112 et son axe. | [maquette, ligne 1317](../sources/coequipier/Maquette_Detaillee_Bot.html#L1317) |
| Dégagement du capot non justifié | « Jeu 11 mm » est affirmé sur la vue de dessus sans projection homogène ni calcul. R2 distingue 13 sur X, 15,6 de distance réelle au capot et 11 par côté entre module et arceaux. | [maquette, ligne 1004](../sources/coequipier/Maquette_Detaillee_Bot.html#L1004) |
| Repères et éclaté non homogènes | Le capot porte [1] dans l’éclaté mais le repère 1 de sa nomenclature désigne un autre sous-ensemble ; les quatre roues y sont des disques dans un même plan plutôt qu’une projection des volumes. R2 utilise la même géométrie et les repères 01–12 du brief. | [maquette, ligne 1490](../sources/coequipier/Maquette_Detaillee_Bot.html#L1490) |
| Cartouches sans preuve | Ancien nom, équipe « MaliBots 2026 », « homologation DoniFab » et masse « 3 990 g » présentés comme acquis. R2 lit nom et équipe dans le JSON et porte explicitement le statut conceptuel et provisoire ; aucune homologation ni pesée n’est déduite des dessins. | [maquette, ligne 1149](../sources/coequipier/Maquette_Detaillee_Bot.html#L1149) |

Les harpons et détails du mécanisme avant des anciens dessins ne sont pas repris. 08 apparaît uniquement comme enveloppe hachurée : rectangle de projection au-dessus et en face, cercle de profil, cylindre en axonométrie.

## Incohérences et réserves du JSON à signaler

1. **Traçabilité du statut de la voie** : `roues.statut=M` mais sa note indique que la voie 182 est une correction P de la voie 184. Les dessins conservent le statut stocké M ; l’équipe doit confirmer s’il faut distinguer les statuts des cotes. Aucun changement du JSON effectué.
2. **Statut global de l’enveloppe** : `enveloppe.statut=M`, alors que sa longueur totale dépend de fourches P et sa largeur des flancs de la version corrigée. Les valeurs géométriques sont cohérentes ; la provenance n’est pas entièrement décrite par le statut global M.
3. **« Caisse à 44 »** signifie le dessus des rails/capot. Les flancs montent localement à 46 et les roues à 55 : 44 ne doit pas être présenté comme la hauteur de tout le soubassement.
4. **Coordonnées Z des poulies absentes** : la coaxialité avec roues ou moteurs est une interprétation nécessaire, explicitée dans `geometrie.mjs`. Épaisseur, passage, prétension et guidage des courroies non fournis ; le contrôle n’atteste pas le fonctionnement de la transmission.
5. **Marge batterie / capot de 1 mm** : positive, mais aucun volume de câblage, connecteurs, maintien, tolérances ou déformation n’est fourni. Le volume batterie n’atteste pas le logement d’un pack réel.
6. **Assemblages incomplets** : logements fourche/pod, liaisons pods/châssis, sorties moteurs, maintien des axes et de 08 non détaillés. Le contact au sol des fourches est volontaire. Aucune liaison, aucun perçage ni mécanisme de 08 n’est inventé.

Il n’y a pas de contradiction numérique sur les enveloppes, les axes, les gardes ou les jeux spécifiés. Les réserves ci-dessus limitent la portée du contrôle conceptuel.

## Variante de levage P3

08 est retiré de la variante. Palette arrondie de longueur 70, largeur 100, épaisseur 6, rayon de bord 3, pivot (X=196 ; Z=36), positions 0° et 25°, statut P. Le petit cercle de pivot est un symbole, sans diamètre mécanique. Actionneur et débattements ne sont pas dimensionnés.

## Livrables et reproduction

L’exécutable xmllint est absent de cet environnement. Repli fourni : python plans/valider_rendu.py valide les six fichiers avec libxml2 (même moteur XML), puis les rend sans navigateur.

- `node plans/generer_plans.mjs && node plans/controle_coherence.mjs`
- `xmllint --noout plans/svg/*.svg` si l’exécutable est disponible.
- `python plans/valider_rendu.py` : contrôle XML avec libxml2, unicité des identifiants et références SVG, rendus librsvg/Cairo, PDF A3 vectoriel. Aucun lancement de Chrome ni d’un autre navigateur.
- Six SVG, quatre vues principales à **1:2,5** et variante à la même échelle ; A3 paysage, 420 × 297 mm. Échelle ajustée par rapport au 1:2 proposé pour ménager une place lisible à P3, aux cotes et aux légendes.
- [Planche à imprimer](planche_A3.html) ; [SVG A3](svg/planche_A3.svg). Après rendu, renommer `planche_A3.pdf` en [PDF A3 final](WARABA_Plans_A3.pdf) ; aperçus dans `apercus/`. Imprimer à 100 %, sans ajustement automatique.
- Date, nom, équipe, compétition, révision et statuts proviennent du JSON. Tous les fichiers produits sont dans `plans/`.

### Résultat détaillé

140 vérifications satisfaites ; aucune erreur bloquante.

Modèle conceptuel — cotes provisoires — non destiné à la fabrication.

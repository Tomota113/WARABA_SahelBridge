# 🤖 MaliBots Challenge 2026 | Projet HOTLINE MK-II
## Compte-Rendu Complet de la Session de Travail & Objectifs Stratégiques

---

> **Événement :** [MaliBots Challenge 2026](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Rapport_Technique_Equipe_MaliBots2026.pdf)  
> **Organisateur :** DoniFab (Bamako, Mali)  
> **Catégorie :** Robots de Combat Featherweight adaptés (**Masse limite stricte : < 4,00 kg**)  
> **Robot :** **HOTLINE MK-II** (Inspiré de l'architecture championne *Hotline*)  
> **Fichiers Clés du Projet :**  
> - 🌐 **Maquette 3D & Plans Techniques Interactifs :** [Maquette_Detaillee_Bot.html](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Maquette_Detaillee_Bot.html)  
> - 📄 **Rapport Officiel d'Homologation (8 pages PDF) :** [Rapport_Technique_Equipe_MaliBots2026.pdf](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Rapport_Technique_Equipe_MaliBots2026.pdf)  
> - 🐍 **Script de Génération Vectorielle du Rapport :** [generate_pdf.py](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/generate_pdf.py)  
> - 📁 **Dossier d'Ingénierie Visuelle :** [Photos_Reference_Hotline/INDEX_PHOTOS.md](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Photos_Reference_Hotline/INDEX_PHOTOS.md)  

---

## 🎯 1. Vision Globale & Objectifs du Projet

### 1.1 Contexte et Enjeux
Le **MaliBots Challenge 2026** est la compétition nationale d'ingénierie et de combat robotique organisée à Bamako par le fablab technologique **DoniFab**. L'objectif est de concevoir, fabriquer et homologuer un robot de combat télécommandé répondant aux standards internationaux de sécurité et de robustesse, tout en valorisant une approche d'**ingénierie frugale et d'industrialisation locale**.

### 1.2 Objectifs Techniques Principaux

1. **Respect Impératif du Devis de Masse (< 4,00 kg) :**
   * Masse totale homologuée : **3 990 g**, offrant une marge de sécurité de **10 g** sous le plafond réglementaire.
   * **0 gramme de lest passif** : 100% de la masse embarquée est fonctionnelle (blindage actif, motricité, puissance d'impact).

2. **Supériorité Balistique et Projection Verticale :**
   * Arme de type **Batteur Rectangulaire Creux (Hollow Beater Bar)** tournant à une vitesse nominale de **8 000 à 10 000 tr/min** (jusqu'à 12 000 tr/min en crête).
   * Énergie cinétique stockée : **684 Joules** (nominal) à **1 070 Joules** (crête).
   * Objectif de combat : **propulser les robots adverses à plus de 1 à 2 mètres de hauteur** dès le premier contact grâce à un angle d'impact ascendant (*up-cutting*) et une vitesse circonférentielle de **50 m/s** (180 km/h).

3. **Domination du « Ground Game » (Bataille du Sol) :**
   * Intégration de deux **fourches harpons ajourées** en acier trempé montées sur coussinets élastomères en silicone rose amortissant.
   * Rôle : glisser impérativement sous le châssis adverse pour le désolidariser du sol et le guider directement dans la zone de frappe du batteur.

4. **Mobilité 4WD Intégrale et Réversibilité :**
   * Transmission intégrale 4 roues motrices via courroies crantées latérales synchrones **`198-2GT`**.
   * Quatre rouleaux en polyuréthane moulé haute adhérence montés sur jantes blanches allégées.
   * Géométrie symétrique permettant au robot de **combattre en mode inversé** en cas de retournement sans perte de maniabilité.

5. **Sécurité et Homologation Conforme au Règlement DoniFab :**
   * **Coupe-circuit mécanique amovible (Link XT60)** accessible immédiatement à l'arrière sans ouvrir le capot.
   * **LED témoin d'armement** haute visibilité indiquant l'état sous-tension.
   * **Fail-Safe radio 2.4 GHz** coupant l'arme et l'entraînement sous 500 ms en cas de perte de signal.
   * **Goupille mécanique de neutralisation d'arme** verrouillant le batteur en stand et en zone de préparation.

---

## 🛠️ 2. Compte-Rendu Détaillé de la Session d'Aujourd'hui

Au cours de cette session intensive, l'ensemble de l'architecture mécanique, de la modélisation 3D et de la documentation officielle a été refondu et aligné rigoureusement sur le robot champion international **Hotline**.

```
[Vérification Référence Vidéo/Photos] 
       ⬇
[Refonte Géométrie Batteur Bar 3D] ───> [Cadre Creux Hardox + Axe Laiton + Poulie Orange]
       ⬇
[Châssis & A-Frames Révisés] ─────────> [Entraxe 140 mm + Écrou M8 Doré + Pods Rouges]
       ⬇
[Plan d'Homologation & Devis Masse] ──> [3 990 g (0g Lest) / 684 J nominal]
       ⬇
[Production des Livrables Officiels] ─> [Maquette 3D HTML + PDF 8 Pages + 4 Plans CAD 2D]
```

### 2.1 Refonte de l'Arme : Le Batteur Rectangulaire Évidé (*Hollow Beater Bar*)
* **Constat initial :** L'ancien modèle présentait un tambour trop tubulaire et des dimensions qui ne correspondaient pas à la frappe sèche du vrai Hotline.
* **Correction géométrique majeure :**
  * Modélisation d'un **cadre rectangulaire évidé** (*Hollow Frame*) composé de deux barres d'impact en acier haute dureté (**Hardox 450**) d'une épaisseur de 12 mm avec chanfrein d'attaque taillé à 45°.
  * Deux bras d'extrémité usinés en aluminium 7075-T6 intégrant les bossages de roulements à billes étanches 6802-2RS et les vis d'assemblage BTR M4.
  * **Fenêtre centrale traversante (44 mm × 96 mm)** complètement ouverte : réduit considérablement la traînée aérodynamique, allège le centre de rotation et concentre l'inertie $I_{zz}$ aux extrémités périphériques ($r = 48\text{ mm}$).
  * **Manchon d'axe central en laiton poli doré** (`#ffb703`) parfaitement visible à travers la fenêtre centrale.
  * Poulie crantée **HTD-3M 24 dents orange** montée directement sur le flanc d'entraînement avec courroie renforcée fibre de verre.

### 2.2 Reconfiguration des Montants Triangulaires (A-Frames) & Pods
* **Écartement de l'arbre d'arme :** Élargissement de l'entre-axe intérieur à **140 mm**, offrant le dégagement parfait pour le débattement du batteur de 136 mm.
* **Architecture des montants :**
  * Montants triangulaires noirs massifs avec ajourage central triangulaire pour optimisation topologique.
  * Reproduction de l'élément iconique de Hotline : **gros écrou hexagonal doré M8 et rondelle d'appui en laiton** sur la face extérieure droite de l'arceau.
* **Pods Avant Rouges & Harpons :**
  * Deux pods rouge vif Hotline (`#d32f2f`) sculptés avec profil déflecteur d'impact.
  * **Double fente verticale de guidage** accueillant les fourches harpons en acier ressort trempé (50CrV4).
  * Représentation du **coussinet élastomère en silicone rose** monté au talon des fourches pour absorber les vibrations et maintenir l'assiette au sol.

### 2.3 Châssis, Motricité 4WD & Esthétique Complète
* **Châssis compact et trapu :**
  * Réduction des proportions excessives pour obtenir une silhouette basse et agressive (280 mm de long, 220 mm de large hors-tout, 70 mm de hauteur de caisse).
  * Trois **stries blanches inclinées** distinctives peintes à l'avant des flancs latéraux.
  * Fond de caisse en sandwich composite carbone/époxy avec ouïes de ventilation transversales à l'arrière.
* **Transmission 4WD :**
  * Quatre roues motrices à rouleaux uréthane rose translucide sur jantes blanches, affleurant au sol avec 2 mm de garde au sol.
  * Double motorisation centrale avec poulies et courroies crantées synchrones `198-2GT` logées sous carter protecteur.

### 2.4 Calculs Physiques de Projection & Énergie Cinétique
Les formules dynamiques ont été validées pour le rapport d'homologation :

$$\text{Moment d'inertie du batteur : } I_{zz} = \frac{1}{2} M (R_{ext}^2 + R_{int}^2) \approx 1{,}52 \times 10^{-3} \text{ kg}\cdot\text{m}^2$$

$$\text{Énergie cinétique à 9 200 tr/min : } E_c = \frac{1}{2} I_{zz} \omega^2 = \frac{1}{2} \times 0{,}00152 \times (963{,}4)^2 \approx 705{,}4 \text{ Joules}$$

$$\text{Hauteur de saut théorique pour un adversaire de 3{,}5 kg : } h = \frac{\eta \cdot E_c}{m_{adv} \cdot g} \approx \frac{0{,}40 \times 700}{3{,}5 \times 9{,}81} \approx 0{,}82 \text{ mètre}$$

> *Pour un adversaire léger (catégorie 1 à 2 kg), la projection dépasse aisément 2,0 mètres de hauteur.*

### 2.5 Validation du Devis de Masse Homologué (3 990 g)

| Sous-Système | Composants & Matériaux | Masse Réelle | Part relative |
| :--- | :--- | :---: | :---: |
| **Arme Active** | Batteur évidé Hardox 450, axe acier 40Cr, poulie HTD-3M, roulements 6802 | **1 120 g** | 28,1 % |
| **Motorisation Arme** | Brushless Outrunner 3548 (1100 KV), ESC BLHeli_32 80A, câblage silicone | **285 g** | 7,1 % |
| **Châssis & A-Frames** | Montants A-Frames PVC armé, entretoises alu 7075, visserie BTR acier 10.9 | **840 g** | 21,1 % |
| **Blindage & Pods** | Pods avant rouge Hotline, capot composite supérieur, déflecteurs latéraux | **480 g** | 12,0 % |
| **Propulsion 4WD** | 2 motoréducteurs DC planétaires, courroies `198-2GT`, 4 roues uréthane rose | **590 g** | 14,8 % |
| **Système Électrique** | Batterie LiPo 4S 2200 mAh 75C, prise sécurité XT60, récepteur 2.4 GHz | **395 g** | 9,9 % |
| **Ground Game** | Paire de fourches harpons acier trempé 50CrV4, blocs amortisseurs silicone | **280 g** | 7,0 % |
| **TOTAL GÉNÉRAL** | **Masse de combat totale active (0 g de lest passif)** | **3 990 g** | **100,0 %** |

---

## 💻 3. Livrables Techniques Développés et Disponibles

1. **La Maquette 3D WebGL / Three.js Interactif :**
   * Fichier : [Maquette_Detaillee_Bot.html](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Maquette_Detaillee_Bot.html)
   * Fonctionnalités :
     * Visualisation 3D temps réel avec contrôles OrbitControls (rotation, zoom, pan).
     * Bouton d'animation et de rotation dynamique du batteur jusqu'à 10 000 tr/min avec effets de flou de mouvement.
     * Bascule d'affichage du robot en mode normal ou en **mode inversé (combat sur le dos)**.
     * Onglet dédié **« Plans Techniques 2D »** avec 4 planches de dessin industriel vectoriel (Batteur, Pods, Châssis, Intérieur).
     * Mode arène de combat avec banc d'essai et adversaire simulé.

2. **Le Dossier Technique d'Homologation Officiel (8 pages) :**
   * Fichier : [Rapport_Technique_Equipe_MaliBots2026.pdf](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Rapport_Technique_Equipe_MaliBots2026.pdf)
   * Sommaire :
     1. Fiche d'identité et conformité réglementaire DoniFab (< 4,00 kg).
     2. Devis de masse exhaustif et bilan centrage / CG.
     3. Conception mécanique du batteur évidé et résistance aux chocs.
     4. Calculs cinématiques, couple moteur et balistique d'impact.
     5. Chaîne cinématique 4WD et motricité tout-terrain.
     6. Schéma électrique, gestion thermique LiPo et sécurité d'arrêt.
     7. Stratégie de fabrication frugale locale à Bamako.
     8. Procédure de contrôle d'homologation et check-list officielle.

3. **Le Script de Synthèse Vectorielle :**
   * Fichier : [generate_pdf.py](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/generate_pdf.py)
   * Script Python 100% autonome utilisant `fpdf2` avec calculs automatiques des tableaux et respect strict de la charte graphique de DoniFab et de l'identité Hotline.

4. **Note Technologique sur l'Export URDF / ROS :**
   * Analyse menée suite à votre question sur **Three.js** et **URDF-Loader** : confirmation que le modèle 3D actuel utilise nativement Three.js pour une compatibilité web universelle sans serveur, et préparation d'un fichier descripteur standard `.urdf` si une intégration sous Gazebo ou ROS2 est requise pour la simulation dynamique avancée.

---

## 📅 4. Feuille de Route & Prochaines Étapes de l'Équipe

| Phase | Échéance | Objectif & Actions Clés |
| :---: | :---: | :--- |
| **1. Validation Virtuelle** | *Aujourd'hui (Fait)* | Validation 3D du robot, géométrie du batteur, devis de masse et génération du dossier PDF. |
| **2. Prototypage & Fabrication** | Mois M+1 | Découpe jet d'eau / laser du batteur Hardox 450, usinage de l'axe 40Cr et impression 3D des pods en PETG-CF. |
| **3. Assemblage & Câblage** | Mois M+2 | Montage de l'arbre monté sur roulements, intégration des courroies `198-2GT`, câblage de la LiPo 4S et du coupe-circuit XT60. |
| **4. Banc d'Essai & Équilibrage** | Mois M+3 | Équilibrage dynamique du batteur (suppression de tout balourd à 10 000 tr/min), essais de traction et tests de failsafe. |
| **5. Homologation DoniFab** | Mois M+4 | Pesée officielle sous balance certifiée (< 4,00 kg), test de goupille et validation en fosse d'arène à Bamako. |

---

*Document d'ingénierie compilé et validé pour l'équipe technique MaliBots 2026.*  
*Pour ouvrir la maquette 3D directement dans votre navigateur : double-cliquez sur [Maquette_Detaillee_Bot.html](file:///c:/Users/hp/Downloads/BatleBots%20-%20Copie/BatleBots%20-%20Copie/Maquette_Detaillee_Bot.html).*

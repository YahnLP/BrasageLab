# BrasageLab

Apprendre les bases du brasage et les erreurs classiques.

Support pédagogique interactif pour le Bac Pro CIEL : cours illustré et simulateur de brasage manuel sur trou métallisé, dans la charte graphique d'ElectroLab. Page unique, sans dépendance, qui fonctionne hors ligne.

## Utiliser

Ouvrir `index.html` dans un navigateur, ou activer GitHub Pages sur la branche `main` (dossier racine) : la page sera disponible à l'adresse `https://yahnlp.github.io/BrasageLab/`.

## Contenu de la page

1. Principe du brasage tendre.
2. Le geste, étape par étape (démonstration animée en coupe).
3. Atelier : simulateur interactif (voir ci-dessous).
4. Le flux et le mouillage (angle de contact).
5. Échelle microscopique : couche intermétallique.
6. Bonne ou mauvaise brasure : galerie de défauts (sèche, excès, manque, surchauffe, pont, tombstone CMS).
7. CMS : profil de refusion.
8. Sécurité à l'atelier.
9. Quiz de vérification.

## Simulateur

Maintenir `C` (fer), `S` (alliage) et `M` (bouger la carte), ou utiliser les boutons à l'écran. Les touches `1` à `4` choisissent le pad. L'aspect de la brasure sur la carte et dans la loupe en coupe est calculé par le modèle, il n'est pas dessiné à la main.

Le modèle (`src/model.js`) est à paramètres localisés :

- thermique : pointe régulée (puissance limitée, chute au contact), pad, patte, plan de masse ;
- flux apporté par le fil, actif au-dessus d'environ 120 °C et consommé par la chaleur ;
- oxyde retiré par le flux, qui revient si le flux est épuisé et que le pad surchauffe ;
- mouillage : angle de contact, remplissage du trou par capillarité, couche intermétallique ;
- dégradation du pad avec la température et le temps, solidification, perturbation par un mouvement.

Réglages de l'atelier : alliage (SAC305, SAC0307, Sn99,3Cu0,7, Sn63/Pb37, Sn42/Bi58), diamètre du fil, flux, température de consigne, puissance de la station, forme de la pointe, diamètre de la patte, état du pad. Douze scénarios prêts à l'emploi et un tableau de fenêtre de brasage estimée par pad.

## Développement

```
python3 build.py          # assemble index.html à partir de src/
node tests/scenarios.js   # compare les scénarios (fenêtre de chauffe, verdict d'un opérateur type)
```

- `src/cours.html` : source du cours illustré (sections 1, 2 et 4 à 9).
- `src/sim_markup.html`, `src/sim.css`, `src/sim.js` : simulateur (interface, rendu).
- `src/model.js` : modèle physique, utilisable seul en Node.

## Limites

Modèle simplifié à but pédagogique : les constantes thermiques et les seuils sont des ordres de grandeur réglés à la main, non validés par des mesures. Les valeurs (temps de contact idéal, volumes, angles) sont à confronter aux consignes de l'atelier et aux fiches fabricant.

Créé par Yahn LE PRETTRE - Formaxion Landes.

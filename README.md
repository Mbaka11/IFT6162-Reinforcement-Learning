# IFT6162 — Reinforcement Learning & Control

Espace personnel d’auto-apprentissage à partir du livre **Building Up RL: From Dynamics and Control to Learning**, de **Pierre-Luc Bacon**. L’objectif est de suivre les chapitres dans l’ordre, retrouver les documents, poser des questions et conserver ses notes — sans obligation de suivre les échéances du cours universitaire.

## Commencer

- **[Sommaire : les 31 pages dans l’ordre du site](Content/README.md)**
- [01 — Introduction, version Web lisible](Content/Website/01-intro.md)
- [02 — Syllabus / plan de cours](Content/Website/02-syllabus.md)
- [03 — Controlled Systems: Boundaries, States, and Actions](Content/Website/03-modeling-controlled-systems.md)
- [PDF, notebooks et bibliographie](Resources/README.md)
- [Projet ChatGPT vocal `IFT-6.2.rl` : installation et prompt](ChatGPT/README.md)

La numérotation suit **la barre latérale publiée**, pas l’ordre alphabétique du dépôt. Les sections de navigation sont conservées dans le sommaire ; les annexes et la démonstration de collocation sont incluses.

## Organisation

```text
IFT6162_RL/
├── ebook/                   # Clone original intact, sous-module Git épinglé
├── Content/
│   ├── 01-intro.md          # Sources Markdown/MyST renumérotées
│   ├── 02-syllabus.md
│   ├── 03-… à 31-….md
│   ├── Website/             # Mêmes pages extraites du HTML publié
│   └── Assets/              # Figures, fichiers et résultats cités
├── Resources/               # PDF du livre, bibliographie et 8 notebooks
├── Notes/                   # Notes et questions personnelles
├── Assignments/             # Exercices et travaux éventuels
├── Projects/                # Expériences RL et projets personnels
├── Data/                    # Futures données et documentation de provenance
├── ChatGPT/                 # Instructions vocales et documents à joindre
├── Sources/                 # Navigation, attribution, manifeste et empreintes
├── scripts/                 # Import et vérification reproductibles
└── tests/                   # Tests de l’importeur
```

### Deux versions complémentaires

- **`Content/NN-….md`** : sources MyST complètes ; liens entre chapitres et ressources adaptés. Les équations, directives, exercices et cellules de code originales restent présents. Certaines directives nécessitent MyST pour leur rendu.
- **`Content/Website/NN-….md`** : texte du site converti en Markdown, avec les formules LaTeX, solutions, tableaux et figures statiques générées. C’est la version recommandée pour lire sur GitHub et pour les fichiers du projet ChatGPT.
- **`ebook/`** : sources originales, code, simulations, données et démonstrations, sans modification. Le sous-module évite de dupliquer ses centaines de mégaoctets dans l’historique de ce dépôt.

Les animations, vidéos et laboratoires interactifs ne deviennent pas exécutables en Markdown. Utiliser leurs liens vers le site, ou construire le livre original en suivant `ebook/README.md`. Aucun code pédagogique n’est exécuté par l’importeur. Les copies HTML exactes sont conservées dans le cache **local** `.cache/rlbook/`, non publié.

## Récupérer le dépôt complet

```bash
git clone --recurse-submodules --shallow-submodules https://github.com/Mbaka11/IFT6162-Reinforcement-Learning.git
cd IFT6162-Reinforcement-Learning
```

Si le dépôt a déjà été cloné sans son sous-module :

```bash
git submodule update --init --depth 1
```

Un téléchargement ZIP de GitHub **n’inclut pas** le contenu de `ebook/`. Les textes importés, ressources et fichiers ChatGPT restent disponibles dans le ZIP.

## Import et contrôle

Prérequis : **Git et Node.js 22 ou ultérieur**. Aucun environnement Python n’est nécessaire pour importer les documents.

```bash
npm ci --ignore-scripts
npm run check
npm test

# Télécharger les pages/ressources absentes du cache, puis reconstruire les copies.
npm run import

# Reproduire l’import à partir du cache, sans réseau.
npm run import:offline

# Relire le site explicitement ; ne met pas le clone original à jour.
npm run import -- --refresh

# Regrouper les documents à joindre au projet ChatGPT.
npm run chatgpt:pack
```

L’import vérifie la correspondance entre la navigation du site et `ebook/myst.yml` ; il s’arrête plutôt que d’inventer un ordre en cas de divergence. Le manifeste indique le commit exact, les URL, les dates de récupération et les empreintes SHA-256. Le réimport hors ligne exige un cache constitué par un premier import.

### Mettre les sources à jour volontairement

```bash
git -C ebook fetch --depth 1 origin main
git -C ebook checkout --detach FETCH_HEAD
npm run import -- --refresh
npm run chatgpt:pack
npm run check
npm test
```

Vérifier les différences avant de committer. **Ne pas annoter les fichiers générés** dans `Content/` ou `ChatGPT/Uploads/` : un réimport les remplace. Écrire les notes dans `Notes/`.

## Sources et attribution

- [Livre en ligne](https://pierrelucbacon.com/rlbook/)
- [Dépôt original de Pierre-Luc Bacon](https://github.com/pierrelux/rlbook)
- [Ce dépôt personnel](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning)
- [Provenance et statut de redistribution](Sources/README.md)

Le contenu pédagogique est attribué à **Pierre-Luc Bacon**, pas au propriétaire de ce dépôt. La copie publique est effectuée sur la base de l’autorisation du professeur rapportée par le propriétaire. Aucune licence générale de redistribution n’a été trouvée dans le dépôt original lors de l’import ; ce dépôt n’en invente pas et ne relicencie pas les contenus tiers.

> **Dépôt public** : ne pas y ajouter de clés, données personnelles, résultats confidentiels ou corrigés non autorisés. Les sous-dossiers `private/`, fichiers `.env` et clés privées sont ignorés par Git.

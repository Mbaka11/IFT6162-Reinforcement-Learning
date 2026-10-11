# Projet ChatGPT vocal — IFT-6.2.rl

## Instructions à copier

**[Ouvrir `SYSTEM_PROMPT.md`](SYSTEM_PROMPT.md)**, puis utiliser le bouton **Raw / Brut** de GitHub et copier tout le texte. Dans ChatGPT, ce « system prompt » correspond aux **instructions du projet** ; le joindre comme simple fichier source ne suffit pas à activer ses consignes.

Le prompt privilégie l’auto-apprentissage en français, une conversation vocale progressive, les échanges mains libres et l’honnêteté sur les documents effectivement consultés. Il inclut le site du livre, le dépôt de Pierre-Luc Bacon et ce dépôt personnel.

## Installer — à l’arrêt, jamais en conduisant

1. Ouvrir le projet existant **`IFT-6.2.rl`**, ou créer un projet portant ce nom.
2. Dans le menu du projet (**⋯**), ouvrir les paramètres ou **Instructions du projet**. Coller le contenu de `SYSTEM_PROMPT.md` et enregistrer. Les intitulés peuvent varier selon l’interface.
3. Télécharger les **quatre fichiers Markdown** dans [Uploads/](Uploads/), puis les ajouter aux sources/fichiers du projet. Ils contiennent le texte des **31 pages complètes**, pas seulement des résumés. Le premier inclut le sommaire général.
4. Facultatif : joindre [le PDF du livre](../Resources/rlbook.pdf) pour compléter la lecture des figures, et [PROGRESS.md](PROGRESS.md) pour conserver un état de reprise. Les limites de fichiers et l’analyse des images PDF dépendent du forfait et des capacités disponibles.
5. Faire un premier test **écrit** : demander le titre et la première section du chapitre 03 à partir des fichiers joints. Vérifier la réponse dans [le chapitre](../Content/Website/03-modeling-controlled-systems.md).
6. Préparer le chapitre dans cette conversation écrite, puis lancer le mode vocal **dans le même projet et la même conversation**, si l’interface le permet.

Aucune modification directe de ton compte ChatGPT n’a été effectuée par les scripts de ce dépôt. L’installation et l’ajout des fichiers restent à faire dans ChatGPT.

## Ce qu’il faut joindre

| Fichier | Chapitres |
|---|---|
| [01-chapitres-01-a-08.md](Uploads/01-chapitres-01-a-08.md) | Introduction, syllabus, modèles et début du contrôle optimal |
| [02-chapitres-09-a-16.md](Uploads/02-chapitres-09-a-16.md) | iLQR/DDP, collocation, MPPI, feedback et début de la programmation dynamique |
| [03-chapitres-17-a-24.md](Uploads/03-chapitres-17-a-24.md) | Contrôle stochastique, MDP et méthodes de valeur approchées |
| [04-chapitres-25-a-31.md](Uploads/04-chapitres-25-a-31.md) | Gradients, politiques, démonstration et annexes |

Les fichiers regroupés sont produits depuis `Content/Website/`, avec la provenance de chaque chapitre. **Ne pas joindre en plus toutes les copies source et Web** sauf besoin spécifique : cela duplique le contenu. Les notebooks restent dans `Resources/Notebooks/` pour une séance technique à l’arrêt.

## Limites importantes en mode vocal

- Un lien vers GitHub ou un site **ne donne pas un accès permanent ou garanti à tous ses fichiers**.
- La disponibilité des outils de recherche, de navigation et d’accès aux sources en vocal dépend du produit, du mode et du compte. Le prompt ne peut pas activer un outil absent.
- Si ChatGPT ne peut pas consulter un fichier pendant l’échange vocal, revenir au texte **à l’arrêt**, lui faire consulter le passage et préparer la discussion, puis reprendre le vocal dans cette conversation.
- Les images référencées par les Markdown ne sont pas intégrées aux fichiers joints. Ne pas supposer que ChatGPT les a vues. Le PDF et le site sont des compléments, selon les capacités de consultation.
- La progression n’est pas garantie d’une conversation à l’autre. Demander un checkpoint, puis le sauvegarder manuellement ; ne pas laisser ChatGPT prétendre qu’il a modifié le fichier sans outil réel.

## Démarrer simplement

Exemples de demandes, **après configuration à l’arrêt** :

- « Commençons l’introduction. Explique-moi une idée à la fois. »
- « Prépare une conversation sur le chapitre 03 à partir des fichiers joints. »
- « Je suis en mode voiture : reste dans l’intuition, sans calcul ni écran. »
- « Plus simple. » / « Un exemple. » / « Quiz. » / « Pause. »
- À l’arrêt : « Fais un checkpoint pour reprendre la prochaine fois. »

## Regénérer après mise à jour du livre

```bash
npm run chatgpt:pack
npm run check
```

Ce script **prépare des fichiers locaux**. Il ne se connecte pas à ChatGPT et ne remplace pas automatiquement les sources déjà jointes au projet.

## Documentation officielle

- [Projets dans ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
- [Mode vocal](https://help.openai.com/en/articles/20001274-chatgpt-voice)

Consulter ces pages pour les fonctionnalités et limites du compte ; ne pas considérer les instructions du projet comme une garantie de capacité technique.

# Sources, provenance et attribution

## Références

| Élément | Source |
|---|---|
| Auteur du livre | **Pierre-Luc Bacon** |
| Titre | *Building Up RL: From Dynamics and Control to Learning* |
| Site publié | https://pierrelucbacon.com/rlbook/ |
| Page fournie initialement | https://pierrelucbacon.com/rlbook/discrete-time-optimal-control/ |
| Dépôt original | https://github.com/pierrelux/rlbook |
| Dépôt personnel | https://github.com/Mbaka11/IFT6162-Reinforcement-Learning |
| Commit importé, dates et empreintes | [import-manifest.json](import-manifest.json) |
| Ordre exact, sections et correspondances | [navigation.json](navigation.json) |

La navigation complète est extraite des données **MyST de la page publiée** : elle inclut les chapitres des sections repliées de la barre latérale. La liste est vérifiée contre la table des matières publiée et celle du clone, `ebook/myst.yml`. Le sommaire n’est donc ni une liste alphabétique, ni une reconstruction à partir des seuls liens visibles de la page fournie.

## Ce qui est conservé

- `ebook/` est un clone original intact, référencé par un sous-module Git à un commit précis. Sa branche de suivi est `main`, mais un import ne lance jamais un `pull` automatique.
- `Content/` contient les sources complètes dans cet ordre, avec une notice d’attribution et les chemins de lecture adaptés. Le notebook de la barre latérale possède aussi une version Markdown, sans suppression de ses cellules ; le fichier `.ipynb` est dans `Resources/Notebooks/`.
- `Content/Website/` contient les textes rendus côté serveur, exercices et solutions, tableaux, code présent dans le HTML, formules LaTeX et figures statiques. Les macros mathématiques du livre sont développées pour faciliter le rendu hors MyST.
- Les ressources locales citées sont copiées avec leurs empreintes. Les médias distants et applications JavaScript restent accessibles par leurs URL ; les copies Markdown ne constituent pas un miroir fonctionnel de tout le site.
- `.cache/rlbook/` conserve localement les réponses HTML et les téléchargements exacts. Il est ignoré par Git : les scripts peuvent recréer ce cache sur un autre ordinateur.
- `Resources/rlbook.pdf`, la bibliographie et les huit notebooks complètent la lecture.

Les versions Git et Web sont volontairement séparées : un site déployé peut être décalé par rapport à sa branche source. Les dates et empreintes permettent d’identifier les deux captures. Aucun résumé automatique ne remplace le texte du professeur.

## Redistribution

Le propriétaire de ce dépôt a demandé une copie publique et a indiqué que **le professeur est d’accord avec cette copie**. Cette déclaration est la base de cette publication ; elle n’est pas présentée comme une licence ouverte générale.

Au moment de l’import, aucune licence de redistribution explicite n’était déclarée dans le dépôt original. Les contenus du professeur et des tiers conservent leurs droits et attributions. Ce dépôt ne leur applique ni licence MIT ni Creative Commons par défaut. Consulter les notices de chaque ressource et demander les permissions nécessaires avant une autre redistribution.

## Contrôle

```bash
npm run check
npm test
```

Le contrôle valide les pages, la numérotation, le commit source, les empreintes, les liens locaux et les ancres des extractions Web. Lorsqu’un cache est présent, il vérifie aussi les titres, sections et sources LaTeX contre le HTML archivé. Il n’exécute pas les notebooks et ne prétend pas prouver le contenu scientifique du livre.

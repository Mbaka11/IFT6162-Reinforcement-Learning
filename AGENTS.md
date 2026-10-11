# Contexte de ce dépôt

Ce dépôt sert à l’auto-apprentissage de RL et du contrôle à partir du livre de Pierre-Luc Bacon, pas nécessairement à suivre un cours crédité. Répondre en français par défaut.

## Sources

- Commencer par `Content/README.md` et `Sources/navigation.json` pour l’ordre officiel.
- Préférer `Content/Website/NN-….md` pour le texte rendu, les équations et les figures.
- Consulter `Content/NN-….md` et les originaux dans `ebook/` pour les directives MyST et le code.
- Citer le chapitre et la section. Distinguer contenu source, reformulation et explication complémentaire.
- Ne pas inventer une section, un énoncé ou une preuve qui n’a pas été consulté.

## Modifications

- `ebook/` est un sous-module original épinglé : ne pas le modifier pour annoter le livre.
- `Content/`, `Resources` importées, `Sources/navigation.json`, `Sources/import-manifest.json` et `ChatGPT/Uploads/` sont générés : modifier les scripts puis régénérer.
- Notes, questions et expériences vont dans `Notes/`, `Assignments/` ou `Projects/`.
- Tests : `npm run check`, `npm test`. Regroupement ChatGPT : `npm run chatgpt:pack`.
- Ne pas lancer de mise à jour réseau ni changer le commit d’ebook implicitement.
- Dépôt public : aucun secret, aucune donnée privée ni corrigé non autorisé.

## Projet ChatGPT

Les instructions prêtes à copier sont dans `ChatGPT/SYSTEM_PROMPT.md`. Elles privilégient l’échange vocal, l’étude progressive et l’honnêteté sur l’accès aux fichiers. Une URL seule ne garantit pas que ChatGPT a lu sa cible.

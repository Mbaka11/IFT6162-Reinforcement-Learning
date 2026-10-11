# Ressources complémentaires

## Lecture et expérimentation

- **[Livre complet en PDF](rlbook.pdf)** — version exportée par le site de Pierre-Luc Bacon.
- [Bibliographie BibTeX](references.bib).
- [Guide original des laboratoires, liens adaptés](lab-guide.md).
- [Sommaire des chapitres](../Content/README.md).

## Notebooks

Les fichiers ci-dessous sont des copies des notebooks originaux, sans exécution ni modification de leurs cellules.

| Nº | Sujet | Fichier |
|---|---|---|
| 01 | Évaluation de politique dans un MDP fini | [Notebook](Notebooks/01_finite_mdp_policy_evaluation.ipynb) |
| 02 | Itération sur les valeurs et sur les politiques | [Notebook](Notebooks/02_value_and_policy_iteration.ipynb) |
| 03 | Estimateurs Monte-Carlo | [Notebook](Notebooks/03_monte_carlo_estimators.ipynb) |
| 04 | Discrétisation d’équations différentielles | [Notebook](Notebooks/04_ode_discretization.ipynb) |
| 05 | LQR à horizon fini | [Notebook](Notebooks/05_finite_horizon_lqr.ipynb) |
| 06 | Optimisation de trajectoire avec SciPy | [Notebook](Notebooks/06_scipy_trajectory_optimization.ipynb) |
| 07 | Opérateurs de Lagrange | [Notebook](Notebooks/07_lagrange_operators.ipynb) |
| 08 | Collocation directe à partir des nœuds | [Notebook](Notebooks/08_collocation_from_nodes.ipynb) |

Le notebook 08 est également le [chapitre 28 du livre](../Content/Website/28-collocation-from-nodes.md). La numérotation des **notebooks** est indépendante de celle des **chapitres**.

Pour les dépendances Python et les constructions MyST/JupyterLite, suivre [le README original](https://github.com/pierrelux/rlbook#readme) depuis `ebook/`. Les scripts d’import de ce dépôt n’installent pas ces dépendances et n’exécutent pas les expériences.

## Autres ressources originales

Le clone `ebook/` conserve également `code/`, `data/`, `artifacts/`, `interactive/` et les enregistrements pédagogiques. Pour les consulter sur GitHub : [dépôt original](https://github.com/pierrelux/rlbook). Le [manifeste](../Sources/import-manifest.json) donne le commit exact de la copie locale.

Toutes ces ressources conservent les [attributions et droits de leurs sources](../Sources/README.md).

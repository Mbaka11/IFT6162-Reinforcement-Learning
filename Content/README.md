# Contenu du cours — ordre de lecture

Ordre exact de la barre latérale du [livre en ligne](https://pierrelucbacon.com/rlbook/), vérifié contre `ebook/myst.yml`. Les titres de sections ne reçoivent pas de numéro : seuls les chapitres sont numérotés.

- **Sources** : textes MyST complets, liens de chapitres adaptés.
- **Version Web** : Markdown lisible avec LaTeX et les figures produites par le site.
- Ne pas fusionner automatiquement les deux versions : elles peuvent évoluer à des moments différents. Les originaux sont préservés dans `ebook/` et le cache HTML local.
- Les macros MyST des sources sont définies dans `ebook/myst.yml` ; elles sont développées dans la version Web.


## Introduction et plan de cours

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 01 | Building Up RL: From Dynamics and Control to Learning | [Markdown](01-intro.md) | [Lire](Website/01-intro.md) |
| 02 | Syllabus · Plan de cours | [Markdown](02-syllabus.md) | [Lire](Website/02-syllabus.md) |

## Modeling Sequential Decisions

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 03 | Controlled Systems: Boundaries, States, and Actions | [Markdown](03-modeling-controlled-systems.md) | [Lire](Website/03-modeling-controlled-systems.md) |
| 04 | Stochastic Dynamics and Partial Observation | [Markdown](04-stochastic-dynamics-observation.md) | [Lire](Website/04-stochastic-dynamics-observation.md) |
| 05 | Model Interfaces and Learned Components | [Markdown](05-model-interfaces.md) | [Lire](Website/05-model-interfaces.md) |

## Open-Loop Optimal Control

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 06 | Finite-Horizon Optimal Control Problems | [Markdown](06-discrete-time-optimal-control.md) | [Lire](Website/06-discrete-time-optimal-control.md) |
| 07 | Adjoints and the Discrete-Time Pontryagin Principle | [Markdown](07-discrete-time-pmp.md) | [Lire](Website/07-discrete-time-pmp.md) |
| 08 | Numerical Trajectory Optimization | [Markdown](08-numerical-trajectory-optimization.md) | [Lire](Website/08-numerical-trajectory-optimization.md) |
| 09 | iLQR and Differential Dynamic Programming | [Markdown](09-iterative-trajectory-optimization.md) | [Lire](Website/09-iterative-trajectory-optimization.md) |
| 10 | Continuous-Time Transcription and Collocation | [Markdown](10-continuous-time-collocation.md) | [Lire](Website/10-continuous-time-collocation.md) |
| 11 | Model Predictive Path Integral Control | [Markdown](11-model-predictive-path-integral-control.md) | [Lire](Website/11-model-predictive-path-integral-control.md) |

## Feedback Control

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 12 | Receding-Horizon Control | [Markdown](12-receding-horizon-control.md) | [Lire](Website/12-receding-horizon-control.md) |
| 13 | MPC Variants and Reliable Operation | [Markdown](13-mpc-variants-reliability.md) | [Lire](Website/13-mpc-variants-reliability.md) |
| 14 | Parametric and Approximate Controllers | [Markdown](14-parametric-controllers.md) | [Lire](Website/14-parametric-controllers.md) |

## Dynamic Programming

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 15 | Finite-Horizon Dynamic Programming | [Markdown](15-finite-horizon-dp.md) | [Lire](Website/15-finite-horizon-dp.md) |
| 16 | Stochastic Dynamic Programming and Markov Decision Processes | [Markdown](16-stochastic-dp.md) | [Lire](Website/16-stochastic-dp.md) |
| 17 | Path-Integral Stochastic Control | [Markdown](17-path-integral-stochastic-control.md) | [Lire](Website/17-path-integral-stochastic-control.md) |
| 18 | Infinite-Horizon Markov Decision Processes | [Markdown](18-infinite-horizon-mdps.md) | [Lire](Website/18-infinite-horizon-mdps.md) |
| 19 | Smooth and Regularized Dynamic Programming | [Markdown](19-regularized-dp.md) | [Lire](Website/19-regularized-dp.md) |

## Approximate Value Methods

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 20 | Weighted-Residual Methods | [Markdown](20-weighted-residual-methods.md) | [Lire](Website/20-weighted-residual-methods.md) |
| 21 | Approximate Bellman Equations | [Markdown](21-approximate-bellman-equations.md) | [Lire](Website/21-approximate-bellman-equations.md) |
| 22 | Monte Carlo Bellman Estimation | [Markdown](22-monte-carlo-bellman-estimation.md) | [Lire](Website/22-monte-carlo-bellman-estimation.md) |
| 23 | Fitted Q-Iteration and DQN | [Markdown](23-fitted-q-iteration.md) | [Lire](Website/23-fitted-q-iteration.md) |

## Parameterized Policy Optimization

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 24 | Amortized Action Optimization | [Markdown](24-amortized-action-optimization.md) | [Lire](Website/24-amortized-action-optimization.md) |
| 25 | Gradient Estimation for Stochastic Objectives | [Markdown](25-gradient-estimation.md) | [Lire](Website/25-gradient-estimation.md) |
| 26 | Regularized and Residual-Based Policy Learning | [Markdown](26-regularized-policy-learning.md) | [Lire](Website/26-regularized-policy-learning.md) |
| 27 | Policy Gradients and Actor-Critic | [Markdown](27-policy-gradients.md) | [Lire](Website/27-policy-gradients.md) |

## Demos

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 28 | Direct Collocation for a Pendulum Swing-Up | [Markdown](28-collocation-from-nodes.md) | [Lire](Website/28-collocation-from-nodes.md) |

## Appendix

| Nº | Chapitre | Source | Version Web |
|---|---|---|---|
| 29 | Example COCPs | [Markdown](29-appendix-examples.md) | [Lire](Website/29-appendix-examples.md) |
| 30 | Solving Initial Value Problems | [Markdown](30-appendix-ivps.md) | [Lire](Website/30-appendix-ivps.md) |
| 31 | Nonlinear Programming | [Markdown](31-appendix-nlp.md) | [Lire](Website/31-appendix-nlp.md) |

## Ressources

- [Notebooks, PDF et bibliographie](../Resources/README.md)
- [Provenance et attribution](../Sources/README.md)
- [Manifeste d’import](../Sources/import-manifest.json)

> **Cours de Pierre-Luc Bacon — 02.** [Page publiée](https://pierrelucbacon.com/rlbook/syllabus) · [Source numérotée](../02-syllabus.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Syllabus · Plan de cours

<a id="skip-to-article"></a>

**IFT 6162: Apprentissage par renforcement, commande optimale (Reinforcement Learning, Optimal Control)**

Note

This page is bilingual. Use the tabs below to switch between English and French. Cette page est bilingue. Utilisez les onglets ci-dessous pour basculer entre l’anglais et le français.

English

Français

<a id="course-information"></a>

## Course information

|  |  |
| --- | --- |
| **Course code** | IFT 6162 |
| **Title** | Reinforcement Learning, Optimal Control (official registrar title is in French: _Apprentissage par renforcement, commande optimale_) |
| **Credits** | 4 |
| **Term** | Fall 2026 (A26) |
| **Schedule** | Mondays 10:30–12:29 and Thursdays 13:30–15:29; Aug 31 – Oct 16 and Oct 26 – Dec 9, 2026 (14 teaching weeks, ~25 sessions) |
| **Room** | Mila, Auditorium 1, 6650 rue Saint-Urbain, 2e étage, Montréal |
| **Instructor** | Pierre-Luc Bacon |
| **Email** | [pierre\-luc.bacon@mila.quebec](mailto:pierre-luc.bacon@mila.quebec) |
| **Office hours** | By appointment, by email |
| **Teaching assistants** | Gabriel Sasseville, [gabriel.sasseville@umontreal.ca](mailto:gabriel.sasseville@umontreal.ca) (availability by email) |
| **Language of instruction** | English |
| **Course website** | [https://pierrelucbacon.com/rlbook/](01-intro.md) |

**Building access.** The Mila doors are unlocked Mondays 10:15–10:45 and Thursdays 13:15–13:45.

<a id="description"></a>

## Description

This course builds reinforcement learning up from its foundations in dynamics, optimization, and control. Rather than starting from the tabular Markov decision process and working outward, we start from the decision problem itself: how to write down a model of a system, how to state an objective that unfolds over time, and how to solve the resulting optimization problem numerically. Dynamic programming, model predictive control, and modern deep RL algorithms then appear as different answers to the same question, each carrying its own assumptions and failure modes.

The organizing theme is that most of the work in applying RL happens _before_ an algorithm is chosen. Sensors produce noisy data, constraints are non-negotiable, and objectives shift or conflict. A practitioner who can only reach for a policy gradient method is poorly equipped for that reality. A practitioner who recognizes the same mathematical structure across trajectory optimization, MPC, dynamic programming, and deep RL can choose the right tool and explain why.

Reinforcement learning did not develop in isolation: its foundations draw on control theory, dynamic programming, operations research, and economics. The same ideas recur under different names in each community. Making those connections explicit is a central goal of the course.

<a id="prerequisites"></a>

## Prerequisites

Students are expected to be comfortable with:

-   **Mathematics.** Linear algebra, multivariable calculus, and probability at the undergraduate level.
    
-   **Optimization.** Unconstrained and constrained optimization; gradient-based methods. Familiarity with KKT conditions is helpful but will be reviewed.
    
-   **Programming.** Python, with working knowledge of NumPy. The course uses JAX and nonlinear programming solvers; no prior experience with either is assumed.
    
-   **Machine learning.** A prior course covering supervised learning and neural network training.
    

Prior exposure to reinforcement learning is _not_ required.

<a id="learning-outcomes"></a>

## Learning outcomes

By the end of the course, you should be able to:

1.  Formulate a sequential decision problem as a discrete-time optimal control problem or an MDP, stating dynamics, objective, and constraints explicitly, and justify the modeling choices you made.
    
2.  Solve trajectory optimization problems numerically using single shooting, multiple shooting, and direct collocation; derive and implement MPPI for sampling-based control; and explain the roles of conditioning, sparsity, physical uncertainty, and sampling error.
    
3.  Implement model predictive control, and reason about recursive feasibility, stability, constraint softening, and fallback behavior.
    
4.  Derive dynamic programming recursions for finite- and infinite-horizon problems, and characterize Bellman operators as contractions on an appropriate space.
    
5.  Explain approximate dynamic programming as the projection of a Bellman residual onto an approximation space, and connect this view to fitted value and fitted Q iteration.
    
6.  Analyze the Monte Carlo estimators used throughout RL, identifying sources of bias and variance, including maximization bias.
    
7.  Situate deep RL algorithms, including DQN and its extensions, DDPG, TD3, path consistency learning and policy gradient methods, within this framework, and explain each design choice as a response to a specific difficulty.
    
8.  Read and critically assess research papers spanning the RL, control, and operations research literatures.
    

<a id="textbook"></a>

## Textbook

The primary text is the course book, written for this class and freely available online:

> Pierre-Luc Bacon. _Building Up RL: From Dynamics and Control to Learning._ [https://pierrelucbacon.com/rlbook/](01-intro.md)

The book is executable: figures and examples are generated from code you can run and modify. The source is on [GitHub](https://github.com/pierrelux/rlbook); corrections and issues are welcome.

<a id="supplementary-references"></a>

### Supplementary references

These are recommended for depth on particular topics; none is required.

-   D. P. Bertsekas. _Dynamic Programming and Optimal Control_, Vols. I–II. Athena Scientific.
    
-   M. L. Puterman. _Markov Decision Processes: Discrete Stochastic Dynamic Programming._ Wiley, 1994.
    
-   R. S. Sutton and A. G. Barto. _Reinforcement Learning: An Introduction_, 2nd ed. MIT Press, 2018.
    
-   J. T. Betts. _Practical Methods for Optimal Control and Estimation Using Nonlinear Programming_, 2nd ed. SIAM.
    
-   J. B. Rawlings, D. Q. Mayne, and M. M. Diehl. _Model Predictive Control: Theory, Computation, and Design_, 2nd ed. Nob Hill.
    
-   J. Nocedal and S. J. Wright. _Numerical Optimization_, 2nd ed. Springer.
    
-   W. B. Powell. _Reinforcement Learning and Stochastic Optimization._ Wiley, 2022.
    

<a id="evaluation"></a>

## Evaluation

| Component | Weight | Due |
| --- | --- | --- |
| In-class midterm 1 | 15% | Thursday, October 8, 2026, 13:30–15:30 |
| In-class midterm 2 | 15% | Thursday, November 19, 2026, 13:30–15:30 |
| Final project poster session | 30% | Thursday, December 3, 2026, 13:30–15:30 at Mila |
| Final examination | 40% | Monday, December 14, 2026, 10:30–12:30, Mila, Auditorium 1 |
| **Total** | **100%** |  |

The three examinations are completed in person on paper, without electronic devices or generative-AI tools. Each student may bring one double-sided reference sheet that they prepared themselves. Questions may ask students to derive or interpret a result, inspect supplied code, identify a flaw in a model or algorithm, and justify a diagnosis. Memorizing Python syntax is not an examination objective.

Exercises, self-checks, and coding practice are formative and ungraded. They prepare students for the analytical and diagnostic work required on the examinations and in the project.

The applied project is completed in teams of exactly three. If enrollment makes that impossible, exceptions will be arranged privately by the instructor. Each team will formulate and investigate a substantive control-and-learning problem rather than reproduce a canned benchmark. The deliverables are working code, a poster, and an oral defense. A short proposal is an ungraded checkpoint. The team artifact establishes the base project grade; an individual’s grade may be adjusted when the oral defense shows a materially different level of understanding.

**Grading scale.** Final grades are reported as UdeM letter grades. The instructor converts the weighted total (out of 100%) into a letter grade.

**Project checkpoint and late policy.** The short proposal is an ungraded checkpoint: a team may send it to the instructor by email at any point before the poster session to get feedback, and earlier is better. The poster session and the examinations take place on fixed dates and cannot be completed late. An absence from any of them must be justified under the University’s rules.

<a id="tentative-schedule"></a>

## Tentative schedule

The course meets **twice a week**, Mondays 10:30–12:29 and Thursdays 13:30–15:29, over **14 teaching weeks**, for roughly 25 sessions in total. Each row below therefore covers two meetings, except where a holiday or assessment intervenes. Pacing is indicative and will be adjusted as the term goes on.

| Week | Topic | Reading |
| --- | --- | --- |
| 1 · Aug 31 – Sep 3 | Course overview; system boundaries; state and action | [Controlled Systems](03-modeling-controlled-systems.md) |
| 2 · Sep 7 – 10 | Dynamics models and the state-space perspective | [Controlled Systems](03-modeling-controlled-systems.md) |
| 3 · Sep 14 – 17 | Stochastic dynamics; partial observation; programs and data as model interfaces | [Stochastic Dynamics](04-stochastic-dynamics-observation.md), [Model Interfaces](05-model-interfaces.md) |
| 4 · Sep 21 – 24 | Discrete-time optimal control problems; existence and optimality conditions | [Finite-Horizon Optimal Control](06-discrete-time-optimal-control.md) |
| 5 · Sep 28 – Oct 1 | Adjoints and the Pontryagin principle; single and multiple shooting | [Discrete-Time PMP](07-discrete-time-pmp.md), [Numerical Trajectory Optimization](08-numerical-trajectory-optimization.md) |
| 6 · Oct 5 – 8 | Direct transcription; polynomial interpolation (Monday). Midterm 1: Thursday, October 8, 13:30–15:30 | [Continuous-Time Collocation](10-continuous-time-collocation.md) |
| 7 · Oct 12 – 15 | Direct transcription examples; MPPI and stochastic trajectory optimization | [Continuous-Time Collocation](10-continuous-time-collocation.md), [Model Predictive Path Integral Control](11-model-predictive-path-integral-control.md) |
| 8 · Oct 26 – 29 | Closing the loop by replanning; theoretical guarantees; MPC variants | [Receding-Horizon Control](12-receding-horizon-control.md), [MPC Variants](13-mpc-variants-reliability.md) |
| 9 · Nov 2 – 5 | MPC failure handling; parametric optimization and approximate controllers | [Reliable MPC](13-mpc-variants-reliability.md), [Parametric Controllers](14-parametric-controllers.md) |
| 10 · Nov 9 – 12 | Backward recursion, continuous spaces, and the linear quadratic regulator | [Finite-Horizon Dynamic Programming](15-finite-horizon-dp.md) |
| 11 · Nov 16 – 19 | Stochastic and infinite-horizon MDPs; Bellman operators; value and policy iteration (Monday). Midterm 2: Thursday, November 19, 13:30–15:30 | [Stochastic DP](16-stochastic-dp.md), [Path-Integral Control](17-path-integral-stochastic-control.md), [Infinite-Horizon MDPs](18-infinite-horizon-mdps.md) |
| 12 · Nov 23 – 26 | Regularized MDPs; weighted residuals; approximate Bellman equations | [Regularized DP](19-regularized-dp.md), [Weighted Residuals](20-weighted-residual-methods.md), [Approximate Bellman Equations](21-approximate-bellman-equations.md) |
| 13 · Nov 30 – Dec 3 | Monte Carlo methods and overestimation bias; fitted Q iteration, NFQ, DQN (Monday). Final project poster session: Thursday, December 3, 13:30–15:30 at Mila | [Monte Carlo](22-monte-carlo-bellman-estimation.md), [FQI](23-fitted-q-iteration.md) |
| 14 · Dec 7 | Amortized action optimization; stochastic gradient estimators; regularized and direct policy optimization | [Amortized Action Optimization](24-amortized-action-optimization.md), [Gradient Estimation](25-gradient-estimation.md), [Regularized Policy Learning](26-regularized-policy-learning.md), [Policy Gradients](27-policy-gradients.md) |

The poster session is on December 3, before [NeurIPS 2026](https://neurips.cc/Conferences/2026/Dates) runs December 6–13 across its sites. The final examination is on Monday, December 14, 10:30–12:30, in Auditorium 1 at Mila.

**No class on:**

-   Monday **September 7**: Labour Day (_Fête du travail_)
    
-   Monday **October 12**: Thanksgiving (_Action de grâce_)
    
-   **October 19–25**: _période d’activités libres_ (no meetings; this is the gap between the two blocks in the registrar’s listing)
    
-   Thursday **December 10** falls outside the course’s end date of December 9, so week 14 has a Monday session only.
    

Note

The registrar lists the course as beginning **Monday, August 31**, while the University’s academic calendar gives the _rentrée_ as **Tuesday, September 1**. The first meeting took place on Monday, August 31.

The appendices on [worked examples](29-appendix-examples.md), [initial value problems](30-appendix-ivps.md), and [nonlinear programming](31-appendix-nlp.md) are reference material used throughout the term rather than assigned to a specific week.

<a id="course-policies"></a>

## Course policies

**Attendance.** Attendance at lectures is not graded. Sessions are recorded and the recordings are posted in the course Google Drive folder. The midterms, the poster session, and the final examination are in person.

**Collaboration.** Discussion and collaboration are encouraged on formative work. The project is collaborative within the assigned team. Each student must be able to explain and defend the team’s complete submission.

**Generative AI.** Generative AI may be used for formative work and the applied project. Disclosure is not required. Each student remains responsible for every claim, equation, baseline, experiment, and line of submitted code and must be able to defend them during the oral defense. Generative AI and electronic devices are prohibited during in-class examinations.

**Academic integrity.** All work is subject to the University’s regulations on plagiarism and fraud. See [https://integrite.umontreal.ca/](https://integrite.umontreal.ca/) for the full policy.

**Accommodations.** Students registered with the _Soutien aux personnes étudiantes en situation de handicap_ (SESH) service should contact the instructor early in the term so that arrangements can be made. See [https://vieetudiante.umontreal.ca/a\-propos/service/soutien\-personnes\-etudiantes\-situation\-handicap](https://vieetudiante.umontreal.ca/a-propos/service/soutien-personnes-etudiantes-situation-handicap) or write to [soutienhandicap@sve.umontreal.ca](mailto:soutienhandicap@sve.umontreal.ca).

**Changes to this syllabus.** This document may be revised during the term. Changes will be announced in class and reflected on this page.

<a id="renseignements-g-n-raux"></a>

## Renseignements généraux

|  |  |
| --- | --- |
| **Sigle** | IFT 6162 |
| **Titre** | Apprentissage par renforcement, commande optimale |
| **Crédits** | 4 |
| **Trimestre** | Automne 2026 (A26) |
| **Horaire** | Lundi 10 h 30 – 12 h 29 et jeudi 13 h 30 – 15 h 29; du 31 août au 16 octobre et du 26 octobre au 9 décembre 2026 (14 semaines de cours, ~25 séances) |
| **Local** | Mila, Auditorium 1, 6650 rue Saint-Urbain, 2e étage, Montréal |
| **Enseignant** | Pierre-Luc Bacon |
| **Courriel** | [pierre\-luc.bacon@mila.quebec](mailto:pierre-luc.bacon@mila.quebec) |
| **Disponibilités** | Sur rendez-vous, par courriel |
| **Auxiliaires d’enseignement** | Gabriel Sasseville, [gabriel.sasseville@umontreal.ca](mailto:gabriel.sasseville@umontreal.ca) (disponibilités par courriel) |
| **Langue d’enseignement** | Anglais |
| **Site du cours** | [https://pierrelucbacon.com/rlbook/](01-intro.md) |

**Accès à Mila.** Les portes sont déverrouillées le lundi de 10 h 15 à 10 h 45 et le jeudi de 13 h 15 à 13 h 45.

<a id="description-1"></a>

## Description

Ce cours construit l’apprentissage par renforcement à partir de ses fondements en dynamique, en optimisation et en commande. Plutôt que de partir du processus décisionnel de Markov tabulaire pour élargir ensuite le cadre, nous partons du problème de décision lui-même : comment écrire le modèle d’un système, comment formuler un objectif qui se déploie dans le temps, et comment résoudre numériquement le problème d’optimisation qui en résulte. La programmation dynamique, la commande prédictive et les algorithmes modernes d’apprentissage par renforcement profond apparaissent alors comme autant de réponses à une même question, chacune portant ses propres hypothèses et ses propres modes de défaillance.

Le fil conducteur est que l’essentiel du travail d’application de l’apprentissage par renforcement se fait _avant_ le choix d’un algorithme. Les capteurs produisent des données bruitées, certaines contraintes ne sont pas négociables, et les objectifs évoluent ou entrent en conflit. Une personne qui ne dispose que d’une méthode de gradient de politique est mal outillée devant cette réalité. Celle qui reconnaît la même structure mathématique dans l’optimisation de trajectoires, la commande prédictive, la programmation dynamique et l’apprentissage profond peut choisir le bon outil et justifier son choix.

L’apprentissage par renforcement ne s’est pas développé en vase clos : ses fondements puisent dans la théorie de la commande, la programmation dynamique, la recherche opérationnelle et l’économie. Les mêmes idées y reviennent sous des noms différents. Rendre ces liens explicites est un objectif central du cours.

<a id="pr-alables"></a>

## Préalables

On attend des étudiantes et étudiants une aisance avec :

-   **Mathématiques.** Algèbre linéaire, calcul à plusieurs variables et probabilités de niveau premier cycle.
    
-   **Optimisation.** Optimisation avec et sans contraintes ; méthodes fondées sur le gradient. Une familiarité avec les conditions KKT est utile, mais celles-ci seront revues.
    
-   **Programmation.** Python, avec une connaissance pratique de NumPy. Le cours utilise JAX et des solveurs de programmation non linéaire ; aucune expérience préalable n’est présumée pour l’un ou l’autre.
    
-   **Apprentissage automatique.** Un cours antérieur couvrant l’apprentissage supervisé et l’entraînement de réseaux de neurones.
    

Aucune exposition préalable à l’apprentissage par renforcement n’est requise.

<a id="objectifs-dapprentissage"></a>

## Objectifs d’apprentissage

Au terme du cours, vous devriez être en mesure de :

1.  Formuler un problème de décision séquentielle comme un problème de commande optimale en temps discret ou comme un MDP, en énonçant explicitement la dynamique, l’objectif et les contraintes, et justifier vos choix de modélisation.
    
2.  Résoudre numériquement des problèmes d’optimisation de trajectoires par tir simple, tir multiple et collocation directe ; dériver et implémenter MPPI pour la commande par échantillonnage ; et expliquer les rôles du conditionnement, de la structure creuse, de l’incertitude physique et de l’erreur d’échantillonnage.
    
3.  Mettre en œuvre la commande prédictive et raisonner sur la faisabilité récursive, la stabilité, l’assouplissement des contraintes et les comportements de repli.
    
4.  Établir les récurrences de la programmation dynamique en horizon fini et infini, et caractériser les opérateurs de Bellman comme des contractions sur un espace approprié.
    
5.  Expliquer la programmation dynamique approchée comme la projection d’un résidu de Bellman sur un espace d’approximation, et relier ce point de vue à l’itération sur la valeur ajustée et à l’itération sur $Q$ ajustée.
    
6.  Analyser les estimateurs de Monte-Carlo employés en apprentissage par renforcement en identifiant les sources de biais et de variance, dont le biais de maximisation.
    
7.  Situer les algorithmes d’apprentissage profond, dont DQN et ses extensions, DDPG, TD3, l’apprentissage par cohérence de chemin et les méthodes de gradient de politique, dans ce cadre, et expliquer chaque choix de conception comme une réponse à une difficulté précise.
    
8.  Lire et évaluer de façon critique des articles de recherche issus des littératures de l’apprentissage par renforcement, de la commande et de la recherche opérationnelle.
    

<a id="manuel"></a>

## Manuel

Le texte principal est le livre du cours, rédigé pour cette classe et accessible gratuitement en ligne :

> Pierre-Luc Bacon. _Building Up RL: From Dynamics and Control to Learning._ [https://pierrelucbacon.com/rlbook/](01-intro.md)

Le livre est exécutable : les figures et les exemples sont produits à partir de code que vous pouvez exécuter et modifier. Le code source est sur [GitHub](https://github.com/pierrelux/rlbook) ; les corrections et les signalements sont les bienvenus.

<a id="r-f-rences-compl-mentaires"></a>

### Références complémentaires

Recommandées pour approfondir certains sujets ; aucune n’est obligatoire.

-   D. P. Bertsekas. _Dynamic Programming and Optimal Control_, vol. I–II. Athena Scientific.
    
-   M. L. Puterman. _Markov Decision Processes: Discrete Stochastic Dynamic Programming._ Wiley, 1994.
    
-   R. S. Sutton et A. G. Barto. _Reinforcement Learning: An Introduction_, 2e éd. MIT Press, 2018.
    
-   J. T. Betts. _Practical Methods for Optimal Control and Estimation Using Nonlinear Programming_, 2e éd. SIAM.
    
-   J. B. Rawlings, D. Q. Mayne et M. M. Diehl. _Model Predictive Control: Theory, Computation, and Design_, 2e éd. Nob Hill.
    
-   J. Nocedal et S. J. Wright. _Numerical Optimization_, 2e éd. Springer.
    
-   W. B. Powell. _Reinforcement Learning and Stochastic Optimization._ Wiley, 2022.
    

<a id="id-valuation"></a>

## Évaluation

| Élément | Pondération | Échéance |
| --- | --- | --- |
| Premier examen de mi-session en classe | 15 % | Jeudi 8 octobre 2026, de 13 h 30 à 15 h 30 |
| Deuxième examen de mi-session en classe | 15 % | Jeudi 19 novembre 2026, de 13 h 30 à 15 h 30 |
| Séance de présentation des affiches du projet final | 30 % | Jeudi 3 décembre 2026, de 13 h 30 à 15 h 30, à Mila |
| Examen final | 40 % | Lundi 14 décembre 2026, de 10 h 30 à 12 h 30, à Mila (Auditorium 1) |
| **Total** | **100 %** |  |

Les trois examens se font en personne, sur papier, sans appareil électronique ni outil d’intelligence artificielle générative. Chaque personne peut apporter une feuille de référence recto verso qu’elle a préparée elle-même. Les questions peuvent demander d’établir ou d’interpréter un résultat, d’examiner du code fourni, de repérer une erreur dans un modèle ou un algorithme et de justifier le diagnostic. La mémorisation de la syntaxe Python ne constitue pas un objectif d’évaluation.

Les exercices, les autoévaluations et les activités de programmation sont formatifs et ne sont pas notés. Ils préparent au travail d’analyse et de diagnostic demandé dans les examens et le projet.

Le projet appliqué se réalise en équipes d’exactement trois personnes. Si le nombre d’inscriptions rend cette règle impossible, l’enseignant réglera les exceptions en privé. Chaque équipe formulera et étudiera un problème substantiel de commande et d’apprentissage, plutôt que de reproduire un banc d’essai préfabriqué. Les livrables sont du code fonctionnel, une affiche et une défense orale. Une courte proposition sert de jalon non noté. La production d’équipe établit la note de base du projet; la note individuelle peut être ajustée si la défense orale indique un niveau de compréhension sensiblement différent.

**Barème de notation.** La note finale est exprimée en notation littérale de l’UdeM. L’enseignant convertit le total pondéré (sur 100 %) en note littérale.

**Jalon du projet et politique sur les retards.** La courte proposition est un jalon non noté : une équipe peut l’envoyer par courriel à l’enseignant à tout moment avant la séance d’affiches pour obtenir une rétroaction, le plus tôt étant le mieux. La séance d’affiches et les examens ont lieu à des dates fixes et ne peuvent pas être faits en retard. Toute absence doit être justifiée selon les règlements de l’Université.

<a id="calendrier-provisoire"></a>

## Calendrier provisoire

Le cours a lieu **deux fois par semaine**, le lundi de 10 h 30 à 12 h 29 et le jeudi de 13 h 30 à 15 h 29, sur **14 semaines de cours**, soit environ 25 séances au total. Chaque ligne ci-dessous couvre donc deux séances, sauf lorsqu’un congé ou une évaluation s’intercale. Le rythme est indicatif et sera ajusté au fil du trimestre.

| Semaine | Sujet | Lecture |
| --- | --- | --- |
| 1 · 31 août – 3 sept. | Présentation du cours ; frontière du système ; état et action | [Controlled Systems](03-modeling-controlled-systems.md) |
| 2 · 7 – 10 sept. | Modèles de dynamique et perspective de l’espace d’états | [Controlled Systems](03-modeling-controlled-systems.md) |
| 3 · 14 – 17 sept. | Dynamique stochastique ; observation partielle ; programmes et données comme interfaces de modèle | [Stochastic Dynamics](04-stochastic-dynamics-observation.md), [Model Interfaces](05-model-interfaces.md) |
| 4 · 21 – 24 sept. | Problèmes de commande optimale en temps discret ; existence et conditions d’optimalité | [Finite-Horizon Optimal Control](06-discrete-time-optimal-control.md) |
| 5 · 28 sept. – 1er oct. | États adjoints et principe de Pontryagin ; tir simple et tir multiple | [Discrete-Time PMP](07-discrete-time-pmp.md), [Numerical Trajectory Optimization](08-numerical-trajectory-optimization.md) |
| 6 · 5 – 8 oct. | Transcription directe ; interpolation polynomiale (lundi). Premier examen de mi-session : jeudi 8 octobre, de 13 h 30 à 15 h 30 | [Continuous-Time Collocation](10-continuous-time-collocation.md) |
| 7 · 12 – 15 oct. | Exemples de transcription directe ; MPPI et optimisation stochastique de trajectoires | [Continuous-Time Collocation](10-continuous-time-collocation.md), [Model Predictive Path Integral Control](11-model-predictive-path-integral-control.md) |
| 8 · 26 – 29 oct. | Boucler la boucle par replanification ; garanties théoriques ; variantes de commande prédictive | [Receding-Horizon Control](12-receding-horizon-control.md), [MPC Variants](13-mpc-variants-reliability.md) |
| 9 · 2 – 5 nov. | Gestion des défaillances en commande prédictive ; optimisation paramétrique et contrôleurs approchés | [Reliable MPC](13-mpc-variants-reliability.md), [Parametric Controllers](14-parametric-controllers.md) |
| 10 · 9 – 12 nov. | Récurrence arrière, espaces continus et régulateur linéaire quadratique | [Finite-Horizon Dynamic Programming](15-finite-horizon-dp.md) |
| 11 · 16 – 19 nov. | MDP stochastiques et à horizon infini ; opérateurs de Bellman ; itérations sur la valeur et la politique (lundi). Deuxième examen de mi-session : jeudi 19 novembre, de 13 h 30 à 15 h 30 | [Stochastic DP](16-stochastic-dp.md), [Path-Integral Control](17-path-integral-stochastic-control.md), [Infinite-Horizon MDPs](18-infinite-horizon-mdps.md) |
| 12 · 23 – 26 nov. | MDP régularisés ; résidus pondérés ; équations de Bellman approchées | [Regularized DP](19-regularized-dp.md), [Weighted Residuals](20-weighted-residual-methods.md), [Approximate Bellman Equations](21-approximate-bellman-equations.md) |
| 13 · 30 nov. – 3 déc. | Méthodes de Monte-Carlo et biais de surestimation ; itération sur $Q$ ajustée, NFQ, DQN (lundi). Séance de présentation des affiches du projet final : jeudi 3 décembre, de 13 h 30 à 15 h 30, à Mila | [Monte Carlo](22-monte-carlo-bellman-estimation.md), [FQI](23-fitted-q-iteration.md) |
| 14 · 7 déc. | Optimisation amortie des actions ; estimateurs de gradient stochastique ; optimisation régularisée et directe des politiques | [Amortized Action Optimization](24-amortized-action-optimization.md), [Gradient Estimation](25-gradient-estimation.md), [Regularized Policy Learning](26-regularized-policy-learning.md), [Policy Gradients](27-policy-gradients.md) |

La séance de présentation des affiches a lieu le 3 décembre, avant [NeurIPS 2026](https://neurips.cc/Conferences/2026/Dates), qui se déroule du 6 au 13 décembre sur ses différents sites. L’examen final aura lieu le lundi 14 décembre, de 10 h 30 à 12 h 30, à l’Auditorium 1 de Mila.

**Aucune séance :**

-   Lundi **7 septembre**: congé universitaire, Fête du travail
    
-   Lundi **12 octobre**: congé universitaire, Action de grâce
    
-   **19 au 25 octobre**: période d’activités libres (c’est l’intervalle entre les deux blocs de dates au répertoire des cours)
    
-   Le jeudi **10 décembre** dépasse la date de fin du cours (9 décembre) : la semaine 14 ne comporte donc qu’une séance, le lundi.
    

Note

Le répertoire des cours indique un début le **lundi 31 août**, alors que le calendrier universitaire fixe la rentrée au **mardi 1er septembre**. La première séance a eu lieu le lundi 31 août.

Les annexes sur les [exemples détaillés](29-appendix-examples.md), les [problèmes à valeur initiale](30-appendix-ivps.md) et la [programmation non linéaire](31-appendix-nlp.md) servent de matériel de référence tout au long du trimestre plutôt que d’être rattachées à une semaine précise.

<a id="r-glements-du-cours"></a>

## Règlements du cours

**Présence.** La présence aux cours n’est pas notée. Les séances sont enregistrées et les enregistrements sont déposés dans le dossier Google Drive du cours. Les examens de mi-session, la séance d’affiches et l’examen final se font en personne.

**Collaboration.** Les échanges et la collaboration sont encouragés dans les activités formatives. Le projet se réalise en collaboration au sein de l’équipe assignée. Chaque personne doit pouvoir expliquer et défendre l’ensemble de la production de son équipe.

**Intelligence artificielle générative.** L’intelligence artificielle générative peut être utilisée dans les activités formatives et le projet appliqué. Aucune déclaration d’utilisation n’est exigée. Chaque personne demeure responsable de chaque affirmation, équation, méthode de référence, expérience et ligne de code remise, et doit pouvoir les défendre lors de la défense orale. L’intelligence artificielle générative et les appareils électroniques sont interdits pendant les examens en classe.

**Intégrité intellectuelle.** Tous les travaux sont soumis au règlement disciplinaire de l’Université sur le plagiat et la fraude. Voir [https://integrite.umontreal.ca/](https://integrite.umontreal.ca/) pour le texte complet.

**Accommodements.** Les personnes inscrites au service de Soutien aux personnes étudiantes en situation de handicap (SESH) sont invitées à communiquer avec l’enseignant tôt dans le trimestre afin que les mesures nécessaires soient mises en place. Voir [https://vieetudiante.umontreal.ca/a\-propos/service/soutien\-personnes\-etudiantes\-situation\-handicap](https://vieetudiante.umontreal.ca/a-propos/service/soutien-personnes-etudiantes-situation-handicap) ou écrire à [soutienhandicap@sve.umontreal.ca](mailto:soutienhandicap@sve.umontreal.ca).

**Modifications au plan de cours.** Ce document peut être révisé en cours de trimestre. Toute modification sera annoncée en classe et reflétée sur cette page.

[

Building Up RL: From Dynamics and Control to Learning

Building Up RL: From Dynamics and Control to Learning


](01-intro.md)[

Modeling Sequential Decisions

Controlled Systems: Boundaries, States, and Actions


](03-modeling-controlled-systems.md)

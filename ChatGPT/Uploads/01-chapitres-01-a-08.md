# IFT-6.2.rl — Document 01 — Chapitres 01 à 08

Texte pédagogique de Pierre-Luc Bacon ; copie organisée pour l’auto-apprentissage. Ce document contient les pages complètes extraites du site, sans résumé de remplacement. Consulter les titres « CHAPITRE NN » pour retrouver leur numéro exact.

# IFT-6.2.rl — Index des documents de référence

Livre : **Building Up RL: From Dynamics and Control to Learning**, de **Pierre-Luc Bacon**. Les 31 pages sont regroupées intégralement dans quatre documents, dans l’ordre de la barre latérale du site. Les regroupements ne sont pas de nouveaux chapitres.

- Site : https://pierrelucbacon.com/rlbook/
- Sources originales : https://github.com/pierrelux/rlbook
- Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning
- Commit source : `aa6b5d14c796dbf47a7865d327246983dbb86e25`
- Capture de navigation : 2026-10-11T20:49:16.557Z

Les documents sont des extractions textuelles du HTML publié, avec les formules LaTeX et les liens. Ils ne contiennent pas les pixels des images, les vidéos ni les applications interactives. Les références restent des liens : leur présence ne prouve pas qu’un assistant les a consultées.

| Nº | Section du livre | Chapitre | Document joint |
|---|---|---|---|
| 01 | Introduction et plan | Building Up RL: From Dynamics and Control to Learning | 01-chapitres-01-a-08.md |
| 02 | Introduction et plan | Syllabus · Plan de cours | 01-chapitres-01-a-08.md |
| 03 | Modeling Sequential Decisions | Controlled Systems: Boundaries, States, and Actions | 01-chapitres-01-a-08.md |
| 04 | Modeling Sequential Decisions | Stochastic Dynamics and Partial Observation | 01-chapitres-01-a-08.md |
| 05 | Modeling Sequential Decisions | Model Interfaces and Learned Components | 01-chapitres-01-a-08.md |
| 06 | Open-Loop Optimal Control | Finite-Horizon Optimal Control Problems | 01-chapitres-01-a-08.md |
| 07 | Open-Loop Optimal Control | Adjoints and the Discrete-Time Pontryagin Principle | 01-chapitres-01-a-08.md |
| 08 | Open-Loop Optimal Control | Numerical Trajectory Optimization | 01-chapitres-01-a-08.md |
| 09 | Open-Loop Optimal Control | iLQR and Differential Dynamic Programming | 02-chapitres-09-a-16.md |
| 10 | Open-Loop Optimal Control | Continuous-Time Transcription and Collocation | 02-chapitres-09-a-16.md |
| 11 | Open-Loop Optimal Control | Model Predictive Path Integral Control | 02-chapitres-09-a-16.md |
| 12 | Feedback Control | Receding-Horizon Control | 02-chapitres-09-a-16.md |
| 13 | Feedback Control | MPC Variants and Reliable Operation | 02-chapitres-09-a-16.md |
| 14 | Feedback Control | Parametric and Approximate Controllers | 02-chapitres-09-a-16.md |
| 15 | Dynamic Programming | Finite-Horizon Dynamic Programming | 02-chapitres-09-a-16.md |
| 16 | Dynamic Programming | Stochastic Dynamic Programming and Markov Decision Processes | 02-chapitres-09-a-16.md |
| 17 | Dynamic Programming | Path-Integral Stochastic Control | 03-chapitres-17-a-24.md |
| 18 | Dynamic Programming | Infinite-Horizon Markov Decision Processes | 03-chapitres-17-a-24.md |
| 19 | Dynamic Programming | Smooth and Regularized Dynamic Programming | 03-chapitres-17-a-24.md |
| 20 | Approximate Value Methods | Weighted-Residual Methods | 03-chapitres-17-a-24.md |
| 21 | Approximate Value Methods | Approximate Bellman Equations | 03-chapitres-17-a-24.md |
| 22 | Approximate Value Methods | Monte Carlo Bellman Estimation | 03-chapitres-17-a-24.md |
| 23 | Approximate Value Methods | Fitted Q-Iteration and DQN | 03-chapitres-17-a-24.md |
| 24 | Parameterized Policy Optimization | Amortized Action Optimization | 03-chapitres-17-a-24.md |
| 25 | Parameterized Policy Optimization | Gradient Estimation for Stochastic Objectives | 04-chapitres-25-a-31.md |
| 26 | Parameterized Policy Optimization | Regularized and Residual-Based Policy Learning | 04-chapitres-25-a-31.md |
| 27 | Parameterized Policy Optimization | Policy Gradients and Actor-Critic | 04-chapitres-25-a-31.md |
| 28 | Demos | Direct Collocation for a Pendulum Swing-Up | 04-chapitres-25-a-31.md |
| 29 | Appendix | Example COCPs | 04-chapitres-25-a-31.md |
| 30 | Appendix | Solving Initial Value Problems | 04-chapitres-25-a-31.md |
| 31 | Appendix | Nonlinear Programming | 04-chapitres-25-a-31.md |

Pour citer un passage, utiliser le **numéro de chapitre**, son titre et sa section ; pas seulement le numéro du regroupement. La numérotation originale des huit notebooks est indépendante.


---



---

# CHAPITRE 01 — Building Up RL: From Dynamics and Control to Learning

Section du livre : Introduction et plan de cours

Page originale : https://pierrelucbacon.com/rlbook/

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/01-intro.md

> **Cours de Pierre-Luc Bacon — 01.** [Page publiée](https://pierrelucbacon.com/rlbook/) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/01-intro.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# From Models to Learning

<a id="skip-to-article"></a>

On the TCV tokamak, a learned policy controlled plasma by issuing voltage commands to 19 magnetic coils at 10 kHz [Degrave _et al._, 2022](https://doi.org/10.1038/s41586-021-04301-9). The policy did not form the plasma, choose the sensors, define a safe operating region, or decide what a voltage command meant. Conventional control first formed and stabilized the plasma, and a simulator specified the physical and operational conditions under which the policy was trained.

The learning algorithm therefore operated inside a decision problem that had already been formulated. The system boundary, state and observations, available actions, objective, and termination conditions were fixed before training. These choices determine what a learned policy can observe, cause, and optimize.

Working definition

**Reinforcement learning** studies how data from interaction or recorded experience can be used to evaluate and improve decisions whose consequences unfold through a dynamical system. Present actions affect future states and therefore future opportunities and outcomes.

This is a problem class rather than a single algorithm. Temporal-difference, value-based, and policy-gradient methods are solution families. The state, action set, objective, constraints, and transition interface define the problem they are asked to solve.

Sequential decision-making is the broader subject. Trajectory optimization, feedback control, and exact dynamic programming can solve some sequential problems without learning from data. Reinforcement learning enters when a model, value function, or policy must be estimated from samples or interaction. The book develops the common mathematical structure before introducing the places where models, values, or policies must be estimated from data.

An application does not arrive with this interface attached. Its formulation must specify where the system ends, what is known when an action is chosen, which interventions are physically possible, how outcomes are valued, and which requirements cannot be traded against reward. An optimizer can use only the variables, objectives, and constraints in that formulation. An omitted requirement cannot affect its solution.

<a id="the-agent-environment-interface"></a>

## The Agent-Environment Interface

The standard agent-environment loop begins after a state signal, actions, and rewards have been selected. [Sutton & Barto (2018)](http://incompleteideas.net/book/the-book-2nd.html) treat the state signal as the output of a preprocessing system and set aside much of its construction in order to study decision making. Their abstraction isolates the learning problem; it does not make the preceding formulation choices disappear.

The familiar agent-environment loop also appears in other fields. Control theory, operations research, and econometrics use different names for related causal exchanges and ask different questions of them.

<a id="fig-interaction-loop-vocabularies"></a>

Reinforcement learning

Agent policy _π_

action _A_t

→←

state _S_t+1  
reward _R_t+1

Environment transition _p_

How can models or experience evaluate and improve a policy?

objective encoded by reward

Control theory

Controller feedback law _κ_

input _u_t

→←

measurement _y_t

Plant dynamics _f_

Which feedback law makes the plant meet its specification?

reference · disturbances · cost · constraints

OR and econometrics

Decision rule objective + constraints

decision _d_t

→←

covariates and  
outcome

System or population data-generating process

What would each feasible intervention cause, and which should be selected?

shocks · feasibility · causal assumptions · welfare

**Three vocabularies for a shared causal interaction.** Reinforcement learning describes an agent acting in an environment; control theory describes a controller acting on a plant; operations research and econometrics describe decisions or interventions applied to an evolving system. The correspondence is structural rather than exact: a measurement need not reveal the state, a reward or cost must be specified, and econometric counterfactuals require identification assumptions. The reinforcement-learning panel follows the interaction convention of Sutton and Barto (2018).

The three panels describe related causal exchanges, but their terms are not interchangeable. A sensor measurement may not reveal the system state, a reward or cost must be chosen, and causal claims from observational data require identification assumptions. Moving between the vocabularies is useful only when these differences remain explicit.

<a id="the-tcv-formulation"></a>

## The TCV Formulation

TCV’s simulator combined conductor-circuit dynamics, a free-boundary plasma model, and lumped plasma-current dynamics. Data-identified sensor and power-supply models represented filtering, delays, measurement noise, and voltage offsets. Experimentally informed parameter ranges represented uncertainty, while the objective and termination rules represented operating requirements. After handover, the learned policy acted as the feedback controller within this specified system.

Reinforcement learning used the physical model and the conventional plasma-formation controller rather than replacing them. A detailed physical simulator is not required in every application, but available structure remains useful when it determines feasible actions, conserved quantities, or safety constraints. The same division appears in safe robot control, where nominal dynamics, costs, and constraints encode prior knowledge and uncertain components are learned from data [Brunke _et al._, 2022](https://doi.org/10.1146/annurev-control-042920-020211).

Real systems also impose limited samples, delays, safety constraints, partial observability, stochasticity, nonstationarity, multiple objectives, real-time action selection, and distribution shift [Dulac-Arnold _et al._, 2021](https://doi.org/10.1007/s10994-021-05961-4). These conditions affect the formulation itself. They determine which state is predictive, which action is feasible, which data support evaluation, and which claim a successful experiment can justify.

<a id="relation-to-reinforcement-learning-theory"></a>

## Relation to Reinforcement-Learning Theory

Bellman equations, dynamic programming, Monte Carlo and temporal-difference methods, value-function approximation, and policy gradients all begin from a specified sequential decision interface. These foundations occupy the second half of the book. The earlier chapters study the modeling and control steps that construct and test that interface.

Known dynamics and constraints permit trajectory optimization from a particular initial condition. Repeated optimization converts such plans into feedback. Dynamic programming computes state-contingent decisions across possible future states, and approximation becomes necessary when the required model, value function, or policy is unknown or too expensive to represent exactly.

Both model-free and model-based reinforcement learning begin from a specified interface. If only transitions and rewards are available, sample-based methods can operate on that interface. If equations, geometry, conservation laws, or hard constraints are also available, they can remain explicit. With a partial model, data can estimate uncertain parameters, residual dynamics, value functions, or policies without replacing the known structure.

<a id="formulating-the-decision-problem"></a>

## Formulating the Decision Problem

A sequential decision problem must answer five questions before an algorithm can solve it:

1.  Which variables summarize the information needed for future decisions?
    
2.  Which actions can the decision maker actually apply?
    
3.  How do actions, disturbances, and uncertainty change the system?
    
4.  Which outcomes should the objective reward or penalize?
    
5.  Which physical, operational, or safety constraints must always hold?
    

The answers determine which computations and claims are available. An explicit differential equation exposes derivatives and conservation laws. A simulator may expose only reset and transition operations. Logged data cannot answer arbitrary counterfactual questions without additional assumptions. Live interaction supplies new data, but collecting it consumes time and may damage the system.

<a id="book-structure"></a>

## Book Structure

The technical development follows the information available about the decision problem. Every later method depends on some account of how actions lead to future observations, whether supplied by equations, a simulator, logged transitions, or live interaction.

| Part | Question | Result |
| --- | --- | --- |
| Modeling sequential decisions | What evolves, what can be observed, and where does an action enter? | A state, action, disturbance, objective, constraint set, and model interface |
| Open-loop optimal control | What action sequence performs well from one initial condition? | A finite-horizon plan and the conditions and numerical methods used to compute it |
| Feedback control | How can the plan respond when measurements reveal a different state? | Closed-loop behavior through repeated replanning |
| Dynamic programming | Can state-contingent decisions be computed before the state is observed? | Value functions and policies defined over many possible states |
| Approximate value methods | How can Bellman equations be solved when their functions or expectations cannot be represented exactly? | Projected, sampled, and fitted value functions |
| Parameterized policy optimization | How can a restricted policy class be optimized when action selection or return evaluation is intractable? | Amortized action selectors, actor-critic methods, and direct policy gradients |

This order does not assume a complete mechanistic model. It keeps the available information explicit: known conservation laws, geometry, and constraints stay in the formulation, while uncertain parameters, residual dynamics, value functions, or policies become learning targets.

Model predictive control is the book’s first closed-loop construction: a new finite-horizon plan is computed from each measured state. Dynamic programming builds feedback differently by solving for decisions across a family of states. Function approximation and stochastic optimization then make those closed-loop objects computable when exact value functions, expectations, or action searches are unavailable.

These structures recur in reinforcement learning, control theory, and operations research, which permits methods to move between fields when the assumptions attached to them are preserved.

<a id="how-to-use-this-book"></a>

## How to Use This Book

The chapters are cumulative, but each begins with its prerequisites and points to the relevant review material. Readers with a reinforcement-learning background may find the modeling and trajectory-optimization chapters less familiar. Readers from control may need more time with Bellman operators, sampling, and function approximation. The appendices provide concise reviews of initial-value problems and nonlinear programming when those tools first become necessary.

Derivations are part of the argument rather than decorative verification. Pause before a nontrivial step, attempt it on paper, and then compare the result with the text. Work through the short self-checks while the notation is still active. The longer exercises are intended for a second pass and often connect several chapters.

The computational examples answer specific modeling or algorithmic questions. Their source, parameters, and recorded artifacts are provided so that the result can be inspected and modified. Running every example is optional, but a numerical result should be read together with the assumptions and diagnostic that support it.

<a id="self-checks"></a>

## Self-checks

<a id="ex-intro-check-1"></a>

[Exercise 1](#ex-intro-check-1 "Link to this Exercise") (Problem before algorithm)

A production controller must respect a hard storage limit. Is selecting a learning algorithm enough to define the reinforcement-learning problem? Name two pieces of structure that must be specified first.

Solution to [Exercise 1](#ex-intro-check-1)

No. At minimum, the state and available decisions must be defined, together with the objective and the hard storage constraint. The transition or feedback structure must also say how decisions affect future states.

<a id="ex-intro-check-2"></a>

[Exercise 2](#ex-intro-check-2 "Link to this Exercise") (Shared structure)

What feature makes trajectory optimization, model predictive control, and reinforcement learning members of the same decision-making family?

Solution to [Exercise 2](#ex-intro-check-2)

All three choose actions whose consequences unfold through a dynamical system over time, so present decisions must account for future objectives and constraints.

<a id="ex-intro-check-3"></a>

[Exercise 3](#ex-intro-check-3 "Link to this Exercise") (Available information)

Suppose an environment already supplies a Markov state, an action set, a reward, and a transition sampler. Which formulation work has already been done? What additional computations become possible if differentiable dynamics and hard constraints are also available?

Solution to [Exercise 3](#ex-intro-check-3)

The environment designer has selected a boundary, state representation, actions, transition interface, and reward, although those choices may still need to be audited against the intended application. Sample-based reinforcement-learning methods can operate on that interface. Differentiable dynamics and explicit constraints also permit direct trajectory optimization, model predictive control, local feedback design, and model-based dynamic programming when their other assumptions are satisfied.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Degrave2022"></a>
2.  Degrave, J., Felici, F., Buchli, J., Neunert, M., Tracey, B., Carpanese, F., Ewalds, T., Hafner, R., Abdolmaleki, A., de las Casas, D., Donner, C., Fritz, L., Galperti, C., Huber, A., Keeling, J., Tsimpoukelli, M., Kay, J., Merle, A., Moret, J.-M., … Riedmiller, M. (2022). Magnetic Control of Tokamak Plasmas through Deep Reinforcement Learning. _Nature_, _602_(7897), 414–419. [10.1038/s41586-021-04301-9](https://doi.org/10.1038/s41586-021-04301-9)
<a id="cite-SuttonBarto2018"></a>
4.  Sutton, R. S., & Barto, A. G. (2018). _Reinforcement Learning: An Introduction_ (2nd ed.). MIT Press. [http://incompleteideas.net/book/the-book-2nd.html](http://incompleteideas.net/book/the-book-2nd.html)
<a id="cite-Brunke2022"></a>
6.  Brunke, L., Greeff, M., Hall, A. W., Yuan, Z., Zhou, S., Panerati, J., & Schoellig, A. P. (2022). Safe Learning in Robotics: From Learning-Based Control to Safe Reinforcement Learning. _Annual Review of Control, Robotics, and Autonomous Systems_, _5_(1), 411–444. [10.1146/annurev-control-042920-020211](https://doi.org/10.1146/annurev-control-042920-020211)
<a id="cite-DulacArnold2021"></a>
8.  Dulac-Arnold, G., Levine, N., Mankowitz, D. J., Li, J., Paduraru, C., Gowal, S., & Hester, T. (2021). Challenges of Real-World Reinforcement Learning: Definitions, Benchmarks and Analysis. _Machine Learning_, _110_(9), 2419–2468. [10.1007/s10994-021-05961-4](https://doi.org/10.1007/s10994-021-05961-4)

[

Building Up RL: From Dynamics and Control to Learning

Syllabus · Plan de cours


](02-syllabus.md)


---

# CHAPITRE 02 — Syllabus · Plan de cours

Section du livre : Introduction et plan de cours

Page originale : https://pierrelucbacon.com/rlbook/syllabus

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/02-syllabus.md

> **Cours de Pierre-Luc Bacon — 02.** [Page publiée](https://pierrelucbacon.com/rlbook/syllabus) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/02-syllabus.md)
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
| **Course website** | [https://pierrelucbacon.com/rlbook/](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/01-intro.md) |

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

> Pierre-Luc Bacon. _Building Up RL: From Dynamics and Control to Learning._ [https://pierrelucbacon.com/rlbook/](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/01-intro.md)

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
| 1 · Aug 31 – Sep 3 | Course overview; system boundaries; state and action | [Controlled Systems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md) |
| 2 · Sep 7 – 10 | Dynamics models and the state-space perspective | [Controlled Systems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md) |
| 3 · Sep 14 – 17 | Stochastic dynamics; partial observation; programs and data as model interfaces | [Stochastic Dynamics](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/04-stochastic-dynamics-observation.md), [Model Interfaces](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/05-model-interfaces.md) |
| 4 · Sep 21 – 24 | Discrete-time optimal control problems; existence and optimality conditions | [Finite-Horizon Optimal Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md) |
| 5 · Sep 28 – Oct 1 | Adjoints and the Pontryagin principle; single and multiple shooting | [Discrete-Time PMP](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/07-discrete-time-pmp.md), [Numerical Trajectory Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md) |
| 6 · Oct 5 – 8 | Direct transcription; polynomial interpolation (Monday). Midterm 1: Thursday, October 8, 13:30–15:30 | [Continuous-Time Collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) |
| 7 · Oct 12 – 15 | Direct transcription examples; MPPI and stochastic trajectory optimization | [Continuous-Time Collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md), [Model Predictive Path Integral Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md) |
| 8 · Oct 26 – 29 | Closing the loop by replanning; theoretical guarantees; MPC variants | [Receding-Horizon Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md), [MPC Variants](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/13-mpc-variants-reliability.md) |
| 9 · Nov 2 – 5 | MPC failure handling; parametric optimization and approximate controllers | [Reliable MPC](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/13-mpc-variants-reliability.md), [Parametric Controllers](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/14-parametric-controllers.md) |
| 10 · Nov 9 – 12 | Backward recursion, continuous spaces, and the linear quadratic regulator | [Finite-Horizon Dynamic Programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) |
| 11 · Nov 16 – 19 | Stochastic and infinite-horizon MDPs; Bellman operators; value and policy iteration (Monday). Midterm 2: Thursday, November 19, 13:30–15:30 | [Stochastic DP](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/16-stochastic-dp.md), [Path-Integral Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md), [Infinite-Horizon MDPs](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/18-infinite-horizon-mdps.md) |
| 12 · Nov 23 – 26 | Regularized MDPs; weighted residuals; approximate Bellman equations | [Regularized DP](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md), [Weighted Residuals](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/20-weighted-residual-methods.md), [Approximate Bellman Equations](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md) |
| 13 · Nov 30 – Dec 3 | Monte Carlo methods and overestimation bias; fitted Q iteration, NFQ, DQN (Monday). Final project poster session: Thursday, December 3, 13:30–15:30 at Mila | [Monte Carlo](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md), [FQI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md) |
| 14 · Dec 7 | Amortized action optimization; stochastic gradient estimators; regularized and direct policy optimization | [Amortized Action Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md), [Gradient Estimation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/25-gradient-estimation.md), [Regularized Policy Learning](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/26-regularized-policy-learning.md), [Policy Gradients](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/27-policy-gradients.md) |

The poster session is on December 3, before [NeurIPS 2026](https://neurips.cc/Conferences/2026/Dates) runs December 6–13 across its sites. The final examination is on Monday, December 14, 10:30–12:30, in Auditorium 1 at Mila.

**No class on:**

-   Monday **September 7**: Labour Day (_Fête du travail_)
    
-   Monday **October 12**: Thanksgiving (_Action de grâce_)
    
-   **October 19–25**: _période d’activités libres_ (no meetings; this is the gap between the two blocks in the registrar’s listing)
    
-   Thursday **December 10** falls outside the course’s end date of December 9, so week 14 has a Monday session only.
    

Note

The registrar lists the course as beginning **Monday, August 31**, while the University’s academic calendar gives the _rentrée_ as **Tuesday, September 1**. The first meeting took place on Monday, August 31.

The appendices on [worked examples](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/29-appendix-examples.md), [initial value problems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/30-appendix-ivps.md), and [nonlinear programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/31-appendix-nlp.md) are reference material used throughout the term rather than assigned to a specific week.

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
| **Site du cours** | [https://pierrelucbacon.com/rlbook/](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/01-intro.md) |

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

> Pierre-Luc Bacon. _Building Up RL: From Dynamics and Control to Learning._ [https://pierrelucbacon.com/rlbook/](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/01-intro.md)

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
| 1 · 31 août – 3 sept. | Présentation du cours ; frontière du système ; état et action | [Controlled Systems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md) |
| 2 · 7 – 10 sept. | Modèles de dynamique et perspective de l’espace d’états | [Controlled Systems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md) |
| 3 · 14 – 17 sept. | Dynamique stochastique ; observation partielle ; programmes et données comme interfaces de modèle | [Stochastic Dynamics](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/04-stochastic-dynamics-observation.md), [Model Interfaces](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/05-model-interfaces.md) |
| 4 · 21 – 24 sept. | Problèmes de commande optimale en temps discret ; existence et conditions d’optimalité | [Finite-Horizon Optimal Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md) |
| 5 · 28 sept. – 1er oct. | États adjoints et principe de Pontryagin ; tir simple et tir multiple | [Discrete-Time PMP](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/07-discrete-time-pmp.md), [Numerical Trajectory Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md) |
| 6 · 5 – 8 oct. | Transcription directe ; interpolation polynomiale (lundi). Premier examen de mi-session : jeudi 8 octobre, de 13 h 30 à 15 h 30 | [Continuous-Time Collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) |
| 7 · 12 – 15 oct. | Exemples de transcription directe ; MPPI et optimisation stochastique de trajectoires | [Continuous-Time Collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md), [Model Predictive Path Integral Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md) |
| 8 · 26 – 29 oct. | Boucler la boucle par replanification ; garanties théoriques ; variantes de commande prédictive | [Receding-Horizon Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md), [MPC Variants](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/13-mpc-variants-reliability.md) |
| 9 · 2 – 5 nov. | Gestion des défaillances en commande prédictive ; optimisation paramétrique et contrôleurs approchés | [Reliable MPC](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/13-mpc-variants-reliability.md), [Parametric Controllers](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/14-parametric-controllers.md) |
| 10 · 9 – 12 nov. | Récurrence arrière, espaces continus et régulateur linéaire quadratique | [Finite-Horizon Dynamic Programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) |
| 11 · 16 – 19 nov. | MDP stochastiques et à horizon infini ; opérateurs de Bellman ; itérations sur la valeur et la politique (lundi). Deuxième examen de mi-session : jeudi 19 novembre, de 13 h 30 à 15 h 30 | [Stochastic DP](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/16-stochastic-dp.md), [Path-Integral Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md), [Infinite-Horizon MDPs](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/18-infinite-horizon-mdps.md) |
| 12 · 23 – 26 nov. | MDP régularisés ; résidus pondérés ; équations de Bellman approchées | [Regularized DP](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md), [Weighted Residuals](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/20-weighted-residual-methods.md), [Approximate Bellman Equations](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md) |
| 13 · 30 nov. – 3 déc. | Méthodes de Monte-Carlo et biais de surestimation ; itération sur $Q$ ajustée, NFQ, DQN (lundi). Séance de présentation des affiches du projet final : jeudi 3 décembre, de 13 h 30 à 15 h 30, à Mila | [Monte Carlo](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md), [FQI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md) |
| 14 · 7 déc. | Optimisation amortie des actions ; estimateurs de gradient stochastique ; optimisation régularisée et directe des politiques | [Amortized Action Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md), [Gradient Estimation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/25-gradient-estimation.md), [Regularized Policy Learning](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/26-regularized-policy-learning.md), [Policy Gradients](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/27-policy-gradients.md) |

La séance de présentation des affiches a lieu le 3 décembre, avant [NeurIPS 2026](https://neurips.cc/Conferences/2026/Dates), qui se déroule du 6 au 13 décembre sur ses différents sites. L’examen final aura lieu le lundi 14 décembre, de 10 h 30 à 12 h 30, à l’Auditorium 1 de Mila.

**Aucune séance :**

-   Lundi **7 septembre**: congé universitaire, Fête du travail
    
-   Lundi **12 octobre**: congé universitaire, Action de grâce
    
-   **19 au 25 octobre**: période d’activités libres (c’est l’intervalle entre les deux blocs de dates au répertoire des cours)
    
-   Le jeudi **10 décembre** dépasse la date de fin du cours (9 décembre) : la semaine 14 ne comporte donc qu’une séance, le lundi.
    

Note

Le répertoire des cours indique un début le **lundi 31 août**, alors que le calendrier universitaire fixe la rentrée au **mardi 1er septembre**. La première séance a eu lieu le lundi 31 août.

Les annexes sur les [exemples détaillés](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/29-appendix-examples.md), les [problèmes à valeur initiale](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/30-appendix-ivps.md) et la [programmation non linéaire](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/31-appendix-nlp.md) servent de matériel de référence tout au long du trimestre plutôt que d’être rattachées à une semaine précise.

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


---

# CHAPITRE 03 — Controlled Systems: Boundaries, States, and Actions

Section du livre : Modeling Sequential Decisions

Page originale : https://pierrelucbacon.com/rlbook/modeling-controlled-systems

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md

> **Cours de Pierre-Luc Bacon — 03.** [Page publiée](https://pierrelucbacon.com/rlbook/modeling-controlled-systems) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/03-modeling-controlled-systems.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Controlled Systems: Boundaries, States, and Actions

<a id="skip-to-article"></a>

The introduction identified the state, action, evolution, objective, and constraints as the ingredients of a sequential decision problem. Before any algorithm can compare actions, how can those ingredients be tied to one physical system and one decision maker?

A simulated playground swing can be made easy to control by placing a motor at the suspension pivot. A rider on a real swing has no such motor. The rider can change body shape, and the chain can pull but cannot push. An optimizer may produce a successful trajectory for the first model even though neither its action nor its suspension exists in the target system.

This failure occurs before the choice of control or learning algorithm. A **decision model** must say what evolves, what can be observed, which interventions are possible, how uncertainty enters, and which constraints must hold. Its **information pattern** specifies what the decision maker knows when each action is selected. These choices lead from physical systems to state-space equations and then to simulators, logged transitions, and interactive environments. Each case study tests one part of the resulting model.

Trajectory optimization, model predictive control, dynamic programming, and reinforcement learning all reason about the consequences of actions. They can only compare consequences that the model makes possible, including the predicted outcome of an action that has not yet been tried. Such an unobserved alternative is called a **counterfactual**. A fictitious actuator creates infeasible plans, an incomplete state destroys predictive information, and a logged dataset cannot answer counterfactual questions about actions it does not cover. Modeling therefore determines which later computations and claims are meaningful.

The modeling choices have a useful dependency order. The system boundary first separates internal variables from external influences. That boundary determines the state, observation, action, and disturbance. Dynamics then describe how these quantities interact, while the objective and constraints define the decision problem. Finally, the available model interface determines whether an algorithm can differentiate equations, run new simulations, or only analyze a fixed log. The chapter follows this order.

Learning goals

After reading this chapter, you should be able to:

-   formulate a sequential decision problem by specifying its boundary, state, action, disturbance, observation, objective, and constraints;
    
-   locate the physical channel through which an action changes the system;
    
-   write deterministic and stochastic state-space models in continuous and discrete time;
    
-   distinguish state from observation and an open-loop action sequence from a feedback policy;
    
-   determine which operations are supplied by equations, simulators, logged transitions, and interactive environments;
    
-   separate known structure from learned components and design a controlled experiment that can expose a modeling error.
    

Prerequisites

The chapter assumes linear algebra, multivariable calculus, elementary probability, and the meaning of an ordinary differential equation. Numerical integration is reviewed in [Solving Initial Value Problems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/30-appendix-ivps.md).

<a id="system-boundaries-and-action-channels"></a>

## System Boundaries and Action Channels

Which physical variables belong inside the controlled system, and which interventions can the decision maker actually apply across that boundary?

A playground swing, an overhead crane, and a wave-energy converter all oscillate. Their visual similarity does not make them the same control problem. A rider changes body shape, a crane accelerates the suspension point, and a wave-energy converter changes a dissipative load while the sea supplies the forcing.

The boundary identifies which physical components belong to the system being modeled and which influences arrive from outside it. The action channel then identifies the intervention available to the decision maker within that boundary. These two choices must precede the equations because they determine which input terms the equations are allowed to contain.

<a id="ex-dynamics-opening-action-channel"></a>

[Exercise 1](#ex-dynamics-opening-action-channel "Link to this Exercise") (Locate the action channel)

Before reading the table, predict which system should create oscillation, which should suppress it, and which should retain motion to extract energy. Then name the physical quantity that each controller can change.

<a id="LPqaJjpJnJ"></a>

```python
from pathlib import Path
import sys

import matplotlib.pyplot as plt
import numpy as np
from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from modeling_interfaces import make_overview_figure
```

<a id="xyHLORi0Nw"></a>

<a id="fig-modeling-action-channels"></a>

<a id="fig-modeling-action-channels-code"></a>

```python
overview_figure = make_overview_figure()
display(overview_figure)
plt.close(overview_figure)
```

[Figure 1:](#fig-modeling-action-channels "Link to this figure")The systems share an oscillatory silhouette but expose different control interfaces. The rider changes internal shape, the crane accelerates its pivot, and the wave device changes a nonnegative dissipative load. Their desired motions and feasible actions therefore differ.

<a id="fig-modeling-action-channels-outputs"></a>

![<Figure size 1230x465 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/5c8a870b52-f63a72df5c8f77c084960c82cd6fe252.png)

| system | state must describe | action changes | external influence | objective | hard constraint |
| --- | --- | --- | --- | --- | --- |
| playground swing | suspension angle and rider pose | internal body shape | gravity and drag | add mechanical energy | a chain can pull but cannot push |
| overhead crane | trolley position and load angle | trolley acceleration | gravity and damping | move the load and remove sway | acceleration is bounded |
| wave-energy converter | flap angle and velocity | power-take-off damping | incident waves | extract energy within motion limits | passive damping is nonnegative |

Solution to [Exercise 1](#ex-dynamics-opening-action-channel)

The rider creates oscillation by changing body shape. The crane suppresses load sway by changing trolley acceleration. The wave-energy converter retains motion while extracting energy by changing nonnegative power-take-off damping. The systems look similar, but none exposes an arbitrary force at the oscillating coordinate.

The three systems need different inputs, but their mechanical equations can be organized by the same bookkeeping template. Let $q$ collect the independent coordinates needed to describe configuration, such as an angle or a trolley position. Such coordinates are called **generalized positions**. Their velocities are $v=\dot q$; $z$ collects additional actuator or environment states; and $u$ is the commanded input. A broad finite-dimensional model is

<a id="y6MfsxrCHS"></a>

$$
\dot q=v,
\qquad
M(q,z)\dot v+c(q,v,z,\dot z)+\nabla_q V(q,z)+r(q,v,z)
=B(q,v,z)u+G(q,v,z)\xi_v(t),
\qquad
\dot z=g(q,v,z,u,\xi_z(t)).
$$

[(1)](#y6MfsxrCHS "Link to this Equation")

The mass matrix $M$ maps coordinate accelerations to their corresponding forces or torques, collectively called **generalized forces**. It is positive definite, which ensures that every nonzero velocity has positive kinetic energy. The term $c$ collects velocity- and configuration-dependent inertial forces, including Coriolis and centrifugal effects. The gradient $\nabla_q V$ appears on the left side, so the corresponding conservative force is $-\nabla_q V$. The term $r$ represents dissipative resistance. The columns of $B$ and $G$ specify the physical directions through which actions $u$ and external inputs $\xi=(\xi_v,\xi_z)$ enter. Dissipation requires $v^\top r(q,v,z)\geq0$, so resistance cannot add mechanical energy. An action can enter directly through $Bu$ or indirectly by changing $z$. A moving coordinate whose inertia is modeled belongs in $q$; a fixed parameter or prescribed signal does not need its own state equation.

The term $B(q,v,z)u$ cannot be inferred from the word “action” alone. An unconstrained vector input would omit the swing’s internal-actuation geometry, the crane’s acceleration limit, and the wave device’s passivity restriction.

Optional connection: port-Hamiltonian models

The mechanical template above is one coordinate-level instance of a broader energy-based description. A port-Hamiltonian model writes

<a id="GFekwXZiOi"></a>

$$
\dot x=[J(x)-R(x)]\nabla H(x)+G(x)u,
\qquad y=G(x)^\top\nabla H(x),
$$

[(2)](#GFekwXZiOi "Link to this Equation")

where $H$ stores energy, the skew-symmetric matrix $J$ routes energy, $R$ dissipates it, and $(u,y)$ form an external power port. The same structure can connect mechanical, electrical, fluid, and thermal components. When $H$ has no explicit time dependence, its energy balance is

<a id="sXzP7QE4VM"></a>

$$
\dot H=-\nabla H(x)^\top R(x)\nabla H(x)+y^\top u.
$$

[(3)](#sXzP7QE4VM "Link to this Equation")

The first term dissipates stored energy, while $y^\top u$ is power supplied through the port [Schaft & Jeltsema (2014)](https://doi.org/10.1561/2600000002). This chapter uses the more concrete coordinate form.

The system boundary also determines which variables are external. At sea, the incident wave torque is an uncommanded disturbance to the energy converter. In a laboratory wave tank, an experimenter can command a motorized paddle that generates the waves. The paddle command is then an action, while the resulting hydrodynamic torque remains a force on the flap. The converter has not changed; the modeled boundary, decision maker, and physical actuator have.

Once the boundary and action channel are fixed, the remaining internal variables must be summarized in a form that predicts what happens next. That predictive summary is the state.

<a id="state-space-models"></a>

## State-Space Models

Once the boundary and action channel are fixed, which variables summarize the past well enough to predict the effect of the next action?

A state summarizes the past information needed to predict future evolution under a chosen action. The word “needed” depends on the model. For example, indoor air temperature alone may fail to predict the next temperature if heat stored in the walls is omitted. Two rooms with the same air temperature but different wall temperatures respond differently after the heater is turned off. Adding wall temperature to the state removes that ambiguity in a simple thermal model.

Once the state has been chosen, it should make earlier history unnecessary for one-step prediction. For a stochastic discrete-time model, this requirement is the Markov property:

<a id="E4GWdapQzR"></a>

$$
\Pr(x_{t+1}\in A\mid x_{0:t},u_{0:t})
=\Pr(x_{t+1}\in A\mid x_t,u_t),
$$

[(4)](#E4GWdapQzR "Link to this Equation")

for every set $A$ of possible next states. The left side conditions on the entire state-action history, while the right side retains only the current state and action. Their equality means that the older history supplies no additional information about the next state. The definition is relative to the declared model and time scale. A simulator may store a large internal state while exposing a smaller observation to the controller, and that observation need not itself be Markov.

A state-space model can keep disturbances and sensor errors as explicit inputs. In discrete time, such a model has the form

<a id="Loo4dGrcmD"></a>

$$
x_{t+1}=f_t(x_t,u_t,\xi_t),
\qquad
y_t=h_t(x_t,u_t,\nu_t).
$$

[(5)](#Loo4dGrcmD "Link to this Equation")

Here $f_t$ advances the state, while $h_t$ maps the state and action to the sensor output $y_t$. The variable $\xi_t$ is a process disturbance that changes the physical evolution, whereas $\nu_t$ is measurement noise that changes only the reported observation. For fixed values of these inputs, both equations are deterministic maps. The stochastic section later assigns probability laws to them.

In continuous time, the corresponding equations are

<a id="qgbH9Yqq3p"></a>

$$
\dot x(t)=f(x(t),u(t),\xi(t)),
\qquad
y(t)=h(x(t),u(t),\nu(t)).
$$

[(6)](#qgbH9Yqq3p "Link to this Equation")

The first equation specifies a rate of change rather than a one-step update. Many physical laws are most compact in continuous time because mechanics, circuit theory, fluid dynamics, heat transfer, and chemical kinetics describe rates, flows, and conservation balances. Those fields provide reusable structure: geometry, conservation laws, units, and admissible energy flows need not be relearned from trajectories. Unknown parameters or empirical relationships, such as drag or heat-transfer laws, can instead be estimated inside that structure.

Continuous equations still need a sampling convention before a digital controller can use them. Sensors and command interfaces operate at discrete times even though the physical plant continues to evolve between updates. Under a chosen hold rule, which specifies how an action is maintained between updates, and a sampling period $\Delta t$, integrating the ODE defines a discrete transition $x_{k+1}=F_{\Delta t}(x_k,u_k)$. The map $F_{\Delta t}$ is called the exact flow over one sample interval. A numerical integrator approximates this map. Changing $\Delta t$ or the hold changes the sampled transition, not the underlying physical law. It can also change the disturbance model because a short event may be visible on one sampling grid and absent from another.

<a id="fig-sampling-and-integration"></a>

<a id="uOJ0ckTAFY"></a>
![A continuous scalar velocity model is sampled at fine and coarse periods. The fine zero-order-hold disturbance representation captures a short pulse, while the coarse left-endpoint representation misses it and predicts the wrong endpoint.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/d2eacf12b6-sampling-and-integra-d442468b357267f89def2053c2b8f63a.svg)

[Figure 2:](#fig-sampling-and-integration "Link to this figure")A sampling period and an interval integrator jointly define the discrete transition. The action is held at $0.6\ \mathrm{m/s^2}$, and the true disturbance acts only from 0.4 to 0.6 seconds. At $\Delta t=0.1$ seconds, its two sampled intervals reproduce the $0.182\ \mathrm{m/s}$ endpoint contribution. At $\Delta t=1$ second, the left-endpoint disturbance sample is zero, so the held coarse model predicts $0.379\ \mathrm{m/s}$ instead of $0.562\ \mathrm{m/s}$. The ODE and interval integrator are unchanged; the sampling period changes both $F_{\Delta t}$ and what the sampled disturbance representation can express.

Coarse output sampling alone does not erase a known event. An integrator given the true event time and $\xi(t)$ can still resolve the pulse with internal substeps. The miss in [Figure 2](#fig-sampling-and-integration) occurs because the coarse model replaces $\xi(t)$ by left-endpoint, zero-order-held samples. Here zero-order hold means that each sampled value is kept constant until the next sample.

The general nonlinear maps above can be difficult to analyze or optimize. Linear state-space models provide a tractable local or exact special case:

<a id="dYtRJREgVL"></a>

$$
\dot x=Ax+Bu+E\xi,
\qquad
y=Cx+Du.
$$

[(7)](#dYtRJREgVL "Link to this Equation")

The matrix $A$ describes autonomous state evolution, $B$ describes how the action changes that evolution, and $E$ describes how disturbances enter. The matrix $C$ selects or combines state components into measurements, while $D$ captures any immediate effect of the action on the measurement. Thus $B$ and $C$ encode different questions. An actuator may be able to influence every state direction without sensors measuring every state component. Conversely, measuring the full state does not imply that the available actuators can move it in every direction.

Linearity is a modeling choice rather than a claim that the world is linear at all scales. A nonlinear system may be well approximated by a linear model near an equilibrium. Dynamic programming itself is not restricted to linear models or stabilization: its Bellman recursion also applies to nonlinear and stochastic transitions. In the later inverted-pendulum example, a local linear approximation supplies one stabilizing controller, while [Trajectory Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md) uses the nonlinear equations to move the pendulum into that controller’s local region.

Dynamics answer the counterfactual question “what happens after this action?” A decision problem must additionally specify which consequences are preferred, which are forbidden, and what information may be used when each action is chosen.

<a id="decision-problems-and-policy-classes"></a>

## Decision Problems and Policy Classes

A state-space model predicts evolution under an input, but which objective, constraints, and information pattern turn that prediction into a decision problem?

In machine learning, a model often means a parameterized predictor. A **decision model** contains more: a state, available actions, dynamics, observations, an objective, constraints, and an information pattern. Prediction remains one component, but decisions require counterfactual trajectories under actions that may not yet have been observed.

For a finite horizon of $T$ actions, let $P_t(\cdot\mid x,u)$ be the distribution of the next state after applying action $u$ in state $x$. The set $\mathcal U_t(x)$ contains the feasible actions, and $\mathcal X_t$ contains the admissible states. A stage cost $\ell_t(x,u)$ evaluates one decision, while $\ell_T(x)$ evaluates the terminal state. A feedback policy $\pi_t$ maps the available information $I_t$ to an action. These objects define the problem

<a id="NHRLhuRmYQ"></a>

$$
\begin{aligned}
\underset{\pi_0,\ldots,\pi_{T-1}}{\operatorname{minimize}}\quad
& \mathbb{E}^{\pi}\!\left[\sum_{t=0}^{T-1}
  \ell_t(x_t,u_t)+\ell_T(x_T)\right] \\
\text{subject to}\quad
& x_{t+1}\sim P_t(\cdot\mid x_t,u_t), \\
& u_t=\pi_t(I_t)\in\mathcal U_t(x_t), \\
& x_t\in\mathcal X_t \quad \text{almost surely}.
\end{aligned}
$$

[(8)](#NHRLhuRmYQ "Link to this Equation")

The expectation averages the accumulated cost over trajectories generated by the policy and stochastic dynamics. The state constraint holds **almost surely**, meaning with probability one under that trajectory distribution. Replacing it by a constraint on the average value, or by a **chance constraint** that permits a stated probability of violation, would define a different feasible set. Thus the formulation specifies what is optimized, how uncertainty propagates, which information a policy may use, and which trajectories are admissible. Omitting one of these pieces changes the problem even if the same environment class and neural network are used afterward.

An **open-loop plan** selects the whole action sequence from information available at the start,

<a id="bIDtx3KV6h"></a>

$$
(u_0,\ldots,u_{T-1})=\mu(I_0).
$$

[(9)](#bIDtx3KV6h "Link to this Equation")

The sequence remains fixed after planning. A **feedback policy** instead selects each action from the information available at that time,

<a id="SlfEfi9cbm"></a>

$$
u_t=\pi_t(I_t).
$$

[(10)](#SlfEfi9cbm "Link to this Equation")

<a id="fig-open-loop-vs-feedback"></a>

<a id="Bm3897E2aF"></a>
![Two controllers face the same unexpected disturbance. The open-loop controller keeps its precomputed actions, while the feedback controller changes later actions after observing the displaced state.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/7e36c1ed0b-open-loop-vs-feedbac-9ab83bb9f992dbbc9e4765b57bdc07a2.svg)

[Figure 3:](#fig-open-loop-vs-feedback "Link to this figure")An open-loop plan commits to future actions before the trajectory begins. A feedback policy reevaluates its decision rule after each new observation. The rule may be an optimizer, a learned policy, or a hand-written heuristic; the word _feedback_ describes what information reaches the action, not how the rule was obtained. In this illustration, $x_{k+1}=0.8x_k+u_k+\xi_k$: the open-loop schedule contains zeros, while the feedback rule $u_k=-0.6x_k$ responds after the disturbance becomes visible at $x_2$. The example shows information flow, not a guarantee that every feedback rule performs well.

A planned trajectory can perform well under its assumed initial condition and disturbance forecast while reacting poorly to a tap, a delayed actuator, or an unexpected arrival. Later chapters construct open-loop plans, turn them into feedback by replanning, and compute state-contingent value functions.

The policy class and the model are separate choices. Several independent axes describe the model itself.

| axis | common alternatives | consequence |
| --- | --- | --- |
| time | continuous or discrete | differential equations or transition steps |
| evolution | deterministic or stochastic | one next state or a distribution over next states |
| state | continuous, discrete, or mixed | geometry of the state space and applicable solvers |
| action | continuous, discrete, or mixed | control authority and optimization method |
| observation | full state or partial/noisy measurement | state feedback or estimation from information histories |
| horizon | finite, infinite, or terminating | terminal conditions and objective definition |

Terms such as “continuous control” specify only one row of this table. They do not determine the time representation, uncertainty, observation model, or information available to the controller.

The swing example now combines these modeling choices. Its action is continuous, its plant is simulated in continuous time, its feedback rule uses observations at discrete times, and its suspension constraint changes the equations when the chain becomes slack. The comparison isolates what goes wrong when the action channel or constraint is modeled incorrectly.

<a id="internal-actuation-in-swingrl"></a>

## Internal Actuation and Unilateral Constraints in SwingRL

How can a concrete model audit reveal that a nominally successful controller relies on an actuator or contact force the real system cannot produce?

A rider who wants to swing higher cannot command a torque at the suspension pivot. The available interventions are changes in body shape, and the chain can transmit tension but not compression. A complete revolution provides a strict test of both assumptions: the controller must inject enough energy through internal motion while remaining feasible for a unilateral suspension.

The [`swing-rl`](https://github.com/pierrelux/swing-rl) environment turns those requirements into a control problem. Its articulated standing model exposes two normalized actions in $[-1,1]^2$: a squat target and a torso-lean target. The action changes body geometry rather than applying a hidden torque at the suspension pivot.

<a id="fig-swing-reduced-coordinates"></a>

<a id="NxrtsU2EOq"></a>
![Geometry of the reduced swing model, showing the suspension angle theta, pivot-to-center-of-mass distance rho, center-of-mass offset alpha, absolute center-of-mass angle psi, and body angle beta.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/590cc9bf60-swing-reduced-coordi-c9914f636583e2a0c7a3246eb6fccc3c.svg)

[Figure 4:](#fig-swing-reduced-coordinates "Link to this figure")The reduced coordinates describe the rider in aggregate rather than tracking every joint. The suspension angle is $\theta$. The center of mass lies a distance $\rho$ from the pivot and is offset by $\alpha$ from the suspension, so its absolute angle is $\psi=\theta+\alpha$. The angle $\beta$ describes the body’s orientation relative to the suspension. Squatting mainly changes $\rho$; leaning changes $\alpha$ and $\beta$.

The reduced model makes the internal action channel visible in one equation. Let $m$ be the rider’s mass, $g$ gravitational acceleration, $\theta$ the suspension angle, $\rho$ the center-of-mass distance from the pivot, $\alpha$ its offset from the suspension line, $\psi=\theta+\alpha$, $\beta$ the body orientation relative to the suspension, and $J$ the rider’s inertia about its center of mass. With $\tau_{\mathrm{damp}}$ denoting the modeled damping torque, the suspension-coordinate balance is

<a id="yVbS2EMQCr"></a>

$$
(m\rho^2+J)\ddot\theta
=-m\rho^2\ddot\alpha
-2m\rho\dot\rho\dot\psi
-J\ddot\beta
-\dot J(\dot\theta+\dot\beta)
-mg\rho\sin\psi
+\tau_{\mathrm{damp}}.
$$

[(11)](#yVbS2EMQCr "Link to this Equation")

There is no commanded pivot torque on the right side. Torso lean instead contributes through the acceleration terms in $\ddot\alpha$ and $\ddot\beta$, while squatting changes $\rho$ and contributes through $-2m\rho\dot\rho\dot\psi$. Multiplying this generalized force by the angular velocity $\dot\theta$ gives its mechanical power. Near a bottom passage, $\dot\psi\approx\dot\theta$, so the squat contribution is approximately

<a id="XUDSg0FtCW"></a>

$$
\left(-2m\rho\dot\rho\dot\psi\right)\dot\theta
\approx -2m\rho\dot\rho\dot\theta^2.
$$

[(12)](#XUDSg0FtCW "Link to this Equation")

Shortening means $\dot\rho<0$. Since $m>0$, $\rho>0$, and $\dot\theta^2\geq0$, the contribution is positive in either direction of travel. The model therefore explains how a rider can add energy without a fictitious pivot actuator.

The action channel is only half of the audit; the suspension must also obey the correct force constraint. The matched comparison applies one **phase-feedback law**, a rule that times squat and lean targets from the observed oscillation phase, to the standing body under two suspension models supplied by SwingRL. A rigid rod can carry tension or compression. A chain can pull but cannot push. The body parameters, initial state, squat and lean limits, feedback rule, 32-second horizon, and 0.02-second sampling interval remain fixed. During the first 0.25 seconds, both runs multiply their requested squat and lean targets by

<a id="WA6kCc7Vg1"></a>

$$
r(t)=\min(t/0.25,1)
$$

[(13)](#WA6kCc7Vg1 "Link to this Equation")

so both commands rise linearly from zero to their full requested values instead of jumping at the first step. This shared startup ramp prevents an initial command discontinuity from being counted as a chain-release event.

Success requires the unwrapped suspension angle to change by at least $2\pi$, one complete revolution. At that crossing, the pivot-to-seat distance must also be at least $0.9L$, where $L$ is the fully extended suspension length. The second test prevents a rotation from being credited while the seat is bunched close to the pivot.

Both simulations use the same function from the current observation to squat and lean commands. Once the chain releases, however, the rod and chain follow different trajectories and produce different observations. Applying the same feedback function to those different observations can produce different later commands. The comparison therefore holds the feedback rule fixed, not the entire open-loop command sequence.

The recorded comparison below applies that feedback rule to both suspension models. The left plant permits axial force in either direction, while the right plant enforces a chain that can only pull. Each plot displays the trajectory only up to the selected playback time. The unwrapped angle keeps accumulating past $\pm\pi$, so a full revolution remains visible. The compression-demand trace shows how much pushing force the rod trajectory would require, a force the chain cannot supply. The extension trace shows the pivot-to-seat distance relative to $L$. Event buttons jump to times already located in the Python trajectory: chain release, impact on reattachment (the snap), and the rod run’s first completed revolution.

<a id="rilyEywrrQ"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from swing_control import model_audit_player_html

display(HTML(model_audit_player_html(
    Path("_static/swing_modeling"),
    Path("artifacts/swing_modeling/events.json"),
    fallback_id="fig-swing-model-audit-fallback",
)))
```

Loading...

<a id="fig-swing-model-audit-fallback"></a>

<a id="xUg0683vqf"></a>
![Matched SwingRL rod and chain keyframes with complete traces for angle, rod compression demand, and chain extension.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/4157c4b71c-model_audit-6f7f4eb839af7528c8a12fafb73c493f.svg)

[Figure 5:](#fig-swing-model-audit-fallback "Link to this figure")Matched keyframes and complete diagnostics from the same Python trajectories. The online book adds the recorded 16:9 animation and event seeking.

| Suspension model | Full rotation | Peak $\lvert\theta\rvert$ | Minimum axial force | Minimum $r/L$ | Slack time |
| --- | --- | --- | --- | --- | --- |
| Bidirectional rigid rod | yes, 26.08 s | 361.16° | \-397.1 N | 1.000 | 0.00 s |
| Unilateral chain | no | 130.49° | 0.0 N | 0.395 | 1.61 s |

The rod trajectory requests as much as **397.1 N of compression**, which a chain cannot provide. The chain first releases at **20.84 s**, releases 2 times in total, and loses **1380.6 J** across reattachments.

Recorded chain mode changes:

-   Release at 20.84 s ($\theta=-97.2^\circ$).
    
-   Reattachment at 21.22 s ($\theta=-90.6^\circ$).
    
-   Release at 22.46 s ($\theta=114.9^\circ$).
    
-   Reattachment at 23.68 s ($\theta=10.9^\circ$).
    

The rod completes a rotation, but part of that motion requires the suspension to push the seat away from the pivot. A real chain cannot supply that push. It goes slack when the pulling force would otherwise become negative, and the seat and rider then move freely under gravity until the chain becomes fully extended again. At that instant the chain snaps taut, the velocity changes abruptly, and some mechanical energy is lost. In modeling language, this is a **hybrid system**: it switches between taut and slack equations and includes a reset at reattachment. Changing a coefficient in the always-taut rod equation cannot create the missing free-flight mode or the snap.

This controller completes the task on the bidirectional-rod model and fails on the unilateral-chain plant. The comparison does not rank control against reinforcement learning, nor does it establish that a chain swing cannot be rotated. It isolates a physical assumption: success on the rod model provides no evidence that the same trajectory remains feasible when the suspension cannot push.

A learned approximation fitted only to rod trajectories would inherit the same blind spot. Data remain useful for estimating rider parameters, damping, and contact losses after the unilateral mode structure is represented. [Policy Gradients](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/27-policy-gradients.md) later evaluates PPO and the structured controller against the same SwingRL action semantics and success criterion.

The swing audit changed a structural constraint while keeping the decision rule fixed. The next modeling question concerns outcomes that vary even when the state and action are fixed, such as demand arrivals or environmental disturbances.

Inspect the shared SwingRL scenario and model audit

swing\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
401
402
403
404
405
406
407
408
409
410
411
412
413
414
415
416
417
418
419
420
421
422
423
424
425
426
427
428
429
430
431
432
433
434
435
436
437
438
439
440
441
442
443
444
445
446
447
448
449
450
451
452
453
454
455
456
457
458
459
460
461
462
463
464
465
466
467
468
469
470
471
472
473
474
475
476
477
478
479
480
481
482
483
484
485
486
487
488
489
490
491
492
493
494
495
496
497
498
499
500
501
502
503
504
505
506
507
508
509
510
511
512
513
514
515
516
517
518
519
520
521
522
523
524
525
526
527
528
529
530
531
532
533
534
535
536
537
538
539
540
541
542
543
544
545
546
547
548
549
550
551
552
553
554
555
556
557
558
559
560
561
562
563
564
565
566
567
568
569
570
571
572
573
574
575
576
577
578
579
580
581
582
583
584
585
586
587
588
589
590
591
592
593
594
595
596
597
598
599
600
601
602
603
604
605
606
607
608
609
610
611
612
613
614
615
616
617
618
619
620
621
622
623
624
625
626
627
628
629
630
631
632
633
634
635
636
637
638
639
640
641
642
643
644
645
646
647
648
649
650
651
652
653
654
655
656
657
658
659
660
661
662
663
664
665
666
667
668
669
670
671
672
673
674
675
676
677
678
679
680
681
682
683
684
685
686
687
688
689
690
691
692
693
694
695
696
697
698
699
700
701
702
703
704
705
706
707
708
709
710
711
712
713
714
715
716
717
718
719
720
721
722
723
724
725
726
727
728
729
730
731
732
733
734
735
736
737
738
```

[Download the complete SwingRL control example](https://pierrelucbacon.com/rlbook/build/swing_control-71b2d30e643ba40b27f7237a540015bd.py)

[Download the recorded model audit](https://pierrelucbacon.com/rlbook/build/model_audit-77f67de1b6dd9226fc1f41d91e3d8918.mp4)

<a id="summary-and-outlook"></a>

## Summary and Outlook

A controlled-system model fixes the system boundary, the variables that carry state, the physical action channel, and the class of decision rules allowed to use that state. The SwingRL audit shows why these choices precede optimization: a controller cannot repair an action channel or contact mode that the model omitted.

Deterministic state-space equations still assign one successor to each state and action. What changes when disturbances make that successor random, or when the controller observes only an ambiguous measurement? [Stochastic dynamics and partial observation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/04-stochastic-dynamics-observation.md) answer that question.

<a id="exercises"></a>

## Exercises

<a id="ex-dynamics-model-checklist"></a>

[Exercise 2](#ex-dynamics-model-checklist "Link to this Exercise") (A complete decision model)

Choose a familiar sequential system and specify its boundary, state, observation, action, disturbance, objective, information pattern, and one hard constraint. Every item must refer to the same decision maker and time scale.

Solution to [Exercise 2](#ex-dynamics-model-checklist)

Many answers are possible. For a room thermostat, one consistent model is: the boundary contains the room, walls, and heater; the state contains indoor air and wall temperatures; the observation is a noisy air-temperature reading; the action is heater power; outdoor temperature and occupancy are disturbances; the objective trades temperature error against energy; the information at time $t$ is the observation and action history; and $0\leq u_t\leq P_{\max}$ is a hard constraint. A different answer is valid when all eight objects use one boundary and one sampling period.

<a id="ex-dynamics-action-channels"></a>

[Exercise 3](#ex-dynamics-action-channels "Link to this Exercise") (Action channels are physical)

In [Figure 1](#fig-modeling-action-channels), explain why replacing every input by an unconstrained generalized force changes all three decision problems.

Solution to [Exercise 3](#ex-dynamics-action-channels)

The replacement gives the swing a fictitious pivot actuator instead of body-shape control and may bypass the chain’s inability to push. It replaces bounded trolley acceleration in the crane with direct forcing of the load. It also lets the wave device inject signed force instead of choosing nonnegative power-take-off damping. Each substitution changes the feasible trajectories, rather than only the symbols used to describe them.

<a id="ex-dynamics-euler-sampling"></a>

[Exercise 4](#ex-dynamics-euler-sampling "Link to this Exercise") (Sampling changes the transition)

For $\dot x=-ax+bu$ with a zero-order-held input, derive the forward Euler updates at step sizes $\Delta t$ and $\Delta t/2$. Which discrete coefficients change with the sampling period?

Solution to [Exercise 4](#ex-dynamics-euler-sampling)

At step size $\Delta t$,

<a id="QZymY0THOw"></a>

$$
x_{k+1}=(1-a\Delta t)x_k+b\Delta t\,u_k.
$$

[(14)](#QZymY0THOw "Link to this Equation")

At step size $\Delta t/2$,

<a id="I6NF0mZJxS"></a>

$$
x_{k+1}=\left(1-\frac{a\Delta t}{2}\right)x_k
{}+\frac{b\Delta t}{2}u_k.
$$

[(15)](#I6NF0mZJxS "Link to this Equation")

Both the state coefficient and the input coefficient change. Two half-steps also compose a different finite-step approximation than one full Euler step, although both converge to the same continuous flow as $\Delta t\to0$.

<a id="ex-dynamics-swing-power"></a>

[Exercise 5](#ex-dynamics-swing-power "Link to this Exercise") (When shortening adds energy)

Multiply $-2m\rho\dot\rho\dot\psi$ by $\dot\theta$ and use $\dot\psi\approx\dot\theta$ near the bottom of the swing. Why can shortening the rider’s radius add energy in either direction of travel?

Solution to [Exercise 5](#ex-dynamics-swing-power)

The approximate power contributed to the suspension coordinate is

<a id="IgG9JjyJ7H"></a>

$$
\left(-2m\rho\dot\rho\dot\psi\right)\dot\theta
\approx-2m\rho\dot\rho\dot\theta^2.
$$

[(16)](#IgG9JjyJ7H "Link to this Equation")

Because $m,\rho>0$ and shortening gives $\dot\rho<0$, this term is positive. The square removes the sign of $\dot\theta$, so the conclusion holds for clockwise and counterclockwise passages.

<a id="ex-dynamics-hybrid-swing"></a>

[Exercise 6](#ex-dynamics-hybrid-swing "Link to this Exercise") (A taut-slack hybrid model)

Describe the swing’s taut and slack phases as a hybrid model. Identify the continuous state, discrete mode, release guard, reattachment guard, and impact reset; a complete equation of motion is not required.

Solution to [Exercise 6](#ex-dynamics-hybrid-swing)

Use a continuous mechanical state containing positions, velocities, and rider configuration, together with a mode $m\in\{\text{taut},\text{slack}\}$. The taut mode enforces the chain-length constraint and requires nonnegative tension. Release occurs when the tension needed to maintain that constraint reaches zero and would become negative. The slack mode follows unconstrained ballistic dynamics. Reattachment occurs when the pivot-to-seat distance reaches the chain length with outward radial velocity. The impact reset removes the inadmissible radial velocity and dissipates its associated energy.

<a id="ex-dynamics-rod-data"></a>

[Exercise 7](#ex-dynamics-rod-data "Link to this Exercise") (What rod-only data cannot identify)

The structured controller completes a revolution on the rod model and fails on the chain model. Why can a larger neural transition model fitted only to rod trajectories fail to resolve this discrepancy?

Solution to [Exercise 7](#ex-dynamics-rod-data)

Rod trajectories contain no release, slack flight, reattachment, or impact. Additional function capacity cannot identify a mode absent from the data. Chain interventions or an explicit unilateral hybrid structure must first supply that missing behavior; data can then estimate parameters within it.

<a id="ex-dynamics-swing-intervention"></a>

[Exercise 8](#ex-dynamics-swing-intervention "Link to this Exercise") (A one-factor SwingRL audit)

Extend the SwingRL comparison with the seated controller, or disable either squat or lean in the standing controller. Before running it, predict one diagnostic that should change. Then explain which modeling assumption the intervention tests.

Solution to [Exercise 8](#ex-dynamics-swing-intervention)

A valid audit changes only one factor, records a prediction first, and compares the result with the baseline. The seated controller changes rider morphology and available actuation. Disabling squat removes the $-2m\rho\dot\rho\dot\theta^2$ power channel; disabling lean removes the driven angular terms. Peak unwrapped angle, revolution success, action-channel work, and the timing of release or reattachment are suitable diagnostics. A result supports only the changed modeling assumption, not a general ranking of controllers.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-vanDerSchaftJeltsema2014"></a>
2.  van der Schaft, A., & Jeltsema, D. (2014). Port-Hamiltonian Systems Theory: An Introductory Overview. _Foundations and Trends in Systems and Control_, _1_(2–3), 173–378. [10.1561/2600000002](https://doi.org/10.1561/2600000002)

[

Building Up RL: From Dynamics and Control to Learning

Syllabus · Plan de cours


](02-syllabus.md)[

Modeling Sequential Decisions

Stochastic Dynamics and Partial Observation


](04-stochastic-dynamics-observation.md)


---

# CHAPITRE 04 — Stochastic Dynamics and Partial Observation

Section du livre : Modeling Sequential Decisions

Page originale : https://pierrelucbacon.com/rlbook/stochastic-dynamics-observation

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/04-stochastic-dynamics-observation.md

> **Cours de Pierre-Luc Bacon — 04.** [Page publiée](https://pierrelucbacon.com/rlbook/stochastic-dynamics-observation) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/04-stochastic-dynamics-observation.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Stochastic Dynamics and Partial Observation

<a id="skip-to-article"></a>

Deterministic dynamics assign one next state to each state-action pair. Process noise, uncertain inflow, and unmodeled interactions instead produce a distribution of possible next states. This distinction changes the decision problem: a controller may need to compare expected cost, failure probability, or risk across those possible outcomes rather than optimize one nominal trajectory.

How should prediction and action selection be defined when the next state is a distribution and the controller may not observe the realized state directly?

One representation makes the source of randomness explicit:

<a id="nLw6QfOhGK"></a>

$$
x_{t+1}=f_t(x_t,u_t,\xi_t),
\qquad
\xi_t\mid x_t,u_t\sim p_t(\cdot\mid x_t,u_t).
$$

[(1)](#nLw6QfOhGK "Link to this Equation")

For a realized disturbance $\xi_t$, the function $f_t$ still returns one next state. The conditional law of $\xi_t$ determines how likely the different realizations are and therefore induces a distribution over $x_{t+1}$. The familiar additive Gaussian model assumes an independent noise sequence with a fixed covariance:

<a id="PheJeGABzN"></a>

$$
x_{t+1}=Ax_t+Bu_t+\xi_t,
\qquad
\xi_t\sim\mathcal N(0,Q).
$$

[(2)](#PheJeGABzN "Link to this Equation")

The induced dynamics can also be represented directly by a transition kernel,

<a id="UVMLTY0gA0"></a>

$$
P_t(A\mid x,u)
=\Pr(x_{t+1}\in A\mid x_t=x,u_t=u).
$$

[(3)](#UVMLTY0gA0 "Link to this Equation")

For any set $A$ of possible next states, $P_t(A\mid x,u)$ is the probability that the next state lies in $A$ after action $u$ is applied in state $x$. This object is called a **transition kernel**. The function-plus-noise representation exposes how randomness enters and may permit pathwise differentiation, in which a sampled transition is differentiated while holding its random draw fixed. The kernel requires only the conditional distribution of the next state, so it also covers simulators whose internal random variables are hidden.

Continuous-time noise must be scaled consistently with the duration of a time interval. A stochastic differential equation separates the deterministic rate of change, called the drift, from rapidly fluctuating random increments, called the diffusion:

<a id="j0CHaL1xcS"></a>

$$
dX_t=f(X_t,U_t)\,dt+\sigma(X_t,U_t)\,dW_t.
$$

[(4)](#j0CHaL1xcS "Link to this Equation")

Here $f$ is the drift, $W_t$ is standard Brownian motion, and $\sigma$ maps its increments into the state. Over an interval of length $\Delta t$, Brownian motion satisfies

<a id="BZQmO1FnIz"></a>

$$
W_{t+\Delta t}-W_t\sim\mathcal N(0,\Delta t I).
$$

[(5)](#BZQmO1FnIz "Link to this Equation")

The increment variance is proportional to elapsed time. The stochastic analogue of a forward Euler step, called Euler--Maruyama, therefore has the form

<a id="oIJ1TDNNHI"></a>

$$
X_{k+1}\approx X_k+f(X_k,U_k)\Delta t
+\sigma(X_k,U_k)\sqrt{\Delta t}\,\varepsilon_k,
\qquad \varepsilon_k\sim\mathcal N(0,I).
$$

[(6)](#oIJ1TDNNHI "Link to this Equation")

The random increment’s standard deviation therefore scales as $\sqrt{\Delta t}$ and its covariance as $\Delta t$. Halving the sampling interval does not mean adding the same covariance twice as often. A full treatment of stochastic differential equations lies outside this book; these relations record the scaling needed to construct a consistent sampled model. The later [path-integral stochastic control chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md#sec-path-integral-control) uses these Brownian moments to extend dynamic programming to continuous time and express optimal feedback through expectations over trajectories.

<a id="bicycle-inventory-and-stochastic-demand"></a>

### Bicycle Inventory and Stochastic Demand

Inventory provides a concrete transition model in which random events and hard constraints interact. A rental can occur only when a bicycle is present, and a return can occur only when a dock is open. Relocation decisions change those conditions before the next random arrivals are realized.

Between 07:00 and 10:00 on 4 July 2024, the BIXI stations at Berri--Cherrier and Prince-Arthur--St-Urbain recorded many more completed rentals than returns. The station at de Maisonneuve--Aylmer recorded the opposite flow. The three stations are less than 1.6 km apart, so a small relocation truck can move bicycles among them within one 15-minute interval. This deliberately local boundary lets us study inventory feedback without also having to choose routes across the full Montreal network.

<a id="fig-bixi-model-interface"></a>

<a id="oYfpWfZmDb"></a>
![A coordinate-faithful schematic of three nearby BIXI stations and their completed rental and return counts during the recorded morning.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/3a1e2d38ee-bixi-model-interface-e79fa6008b4ba75553a5f7f5acf796aa.svg)

[Figure 1:](#fig-bixi-model-interface "Link to this figure")The three-station boundary contains 99 docks. Berri recorded 79 completed rentals and 36 returns, Prince-Arthur recorded 48 and 20, and de Maisonneuve recorded 12 and 84. The events come from the 2024 BIXI trip archive; capacities come from a station-information snapshot retrieved on 2 September 2026.

The simulation uses the station capacities recorded in a 2 September 2026 station-information snapshot for every run. Those values make the example reproducible, but they need not equal the capacities in service on 4 July 2024.

| station | ID | capacity |
| --- | --- | --- |
| Berri / Cherrier | 173 | 39 |
| Prince-Arthur / St-Urbain | 404 | 23 |
| de Maisonneuve / Aylmer (ouest) | 68 | 37 |

Let $s_{i,k}$ be the number of bicycles at station $i$, $c_i$ its capacity, and $b_k$ the truck inventory. A transfer $\rho_{i,k}$ is positive when the truck unloads bicycles at its current station and negative when it loads them. The post-transfer stock at the start of an interval is $q_{i,0}=s_{i,k}+\rho_{i,k}$.

Attempted rentals and returns then arrive as a chronological event sequence. For event $e$, let $R_{i,e}$ indicate a served rental and $A_{i,e}$ an accepted return. Their values depend on the stock immediately before the event:

<a id="q3B3DHW9Hw"></a>

$$
\begin{aligned}
R_{i,e}
&=\mathbf 1\{\text{event $e$ is a rental at $i$}\}
  \mathbf 1\{q_{i,e-1}\geq 1\},\\
A_{i,e}
&=\mathbf 1\{\text{event $e$ is a return at $i$}\}
  \mathbf 1\{q_{i,e-1}<c_i\},\\
q_{i,e}&=q_{i,e-1}-R_{i,e}+A_{i,e}.
\end{aligned}
$$

[(7)](#q3B3DHW9Hw "Link to this Equation")

If interval $k$ contains $N_k$ events, its inventory balance is

<a id="d8kShgX15F"></a>

$$
s_{i,k+1}=q_{i,N_k},
\qquad
b_{k+1}=b_k-\sum_i\rho_{i,k}.
$$

[(8)](#d8kShgX15F "Link to this Equation")

Relocation cancels when station and truck inventories are added. Customer trips can still change the total inside this three-station boundary because their other endpoint may lie elsewhere in the network.

The teaching plant begins with station inventories $(30,18,8)$ and an empty 16-bike truck at de Maisonneuve. Decisions occur every 15 minutes. A stop may transfer at most eight bicycles, and travel between any two of the three stations consumes one decision interval. At a common station and timestamp, the simulator processes returns before rentals. It records lost rentals and rejected returns instead of silently clipping attempted events.

Three controllers receive the same event trace. The first never relocates a bike. The second freezes a schedule computed before 07:00 from mean completed trip counts. The third reevaluates a deterministic, hand-written rule every 15 minutes using the observed inventories. It does not solve an optimization problem at each decision time. Here _feedback_ means that the current observation enters the rule; it does not imply optimization or learning.

Both active controllers use the remaining-horizon target

<a id="cRJ6RRr9k1"></a>

$$
g_{i,n}=
\operatorname{clip}\left(
\frac{c_i}{2}
+\sum_{h=n}^{T-1}(\hat d_{i,h}-\hat a_{i,h}),
0.2c_i,0.8c_i
\right).
$$

[(9)](#cRJ6RRr9k1 "Link to this Equation")

The function $\operatorname{clip}(q,l,r)$ limits $q$ to the interval $[l,r]$. Thus the target begins at half capacity, shifts upward when future departures are expected to exceed arrivals, and remains between 20 and 80 percent of station capacity. Here $\hat d_{i,h}$ and $\hat a_{i,h}$ are the mean numbers of completed departures and arrivals at station $i$ during 15-minute interval $h$ across the 43 calibration dates. Define the current deficit and surplus relative to the target by

<a id="MFjliZb0xx"></a>

$$
\delta^-_{i,n}=[g_{i,n}-s_{i,n}]_+,
\qquad
\delta^+_{i,n}=[s_{i,n}-g_{i,n}]_+.
$$

[(10)](#MFjliZb0xx "Link to this Equation")

The positive-part operator $[q]_+=\max(q,0)$ makes deficit and surplus nonnegative. At most one is positive for a given station. The rule first decides what to transfer at the truck’s current station. If the truck carries bicycles and the local deficit is at least two, it unloads. If the local surplus is at least two and the other stations have a combined deficit of at least two, it loads. Transfer size is capped by the eight-bike stop limit, truck capacity, available bicycles, open docks, and the relevant surplus or deficit. If the truck still carries bicycles after the transfer, it drives toward the other station with the largest ratio $\delta^-_{i,n}/c_i$. If it is empty, and both a deficit and a surplus of at least two remain, it drives toward the other station with the largest ratio $\delta^+_{i,n}/c_i$. Distance breaks ties. Finally, when the truck carries leftover bicycles but the total modeled deficit is below two, it returns as many as possible at its current station rather than keeping them unavailable to customers.

The frozen schedule is produced before 07:00 by applying this same heuristic to one deterministic mean-flow trajectory. It then keeps those actions unchanged. That calculation makes it an open-loop plan, not a second online optimizer. In the resulting schedule, the truck waits at de Maisonneuve, loads three bicycles at 07:45, travels to Prince-Arthur, and unloads them at 08:00. The feedback controller instead recomputes the rule from each newly observed inventory.

For the stochastic comparison, let $C^z_{i,k,d}$ be the number of completed events of type $z\in\{\mathrm{rental},\mathrm{return}\}$ at station $i$ in interval $k$ on calibration date $d$. The empirical rate and simulated count are

<a id="cF9q2xLDsa"></a>

$$
\widehat\lambda^z_{i,k}
=\frac{1}{43}\sum_{d=1}^{43}C^z_{i,k,d},
\qquad
N^z_{i,k}\sim
\operatorname{Poisson}\!\left(\widehat\lambda^z_{i,k}\right).
$$

[(11)](#cF9q2xLDsa "Link to this Equation")

The Poisson distribution is a count model whose mean here is $\widehat\lambda^z_{i,k}$. The count draws are independent across stations, intervals, and event types. Conditional on $N^z_{i,k}=m$, the simulator places the $m$ event times independently and uniformly inside interval $k$. It treats these events as potential attempts and accepts or rejects each one using the inventory equations above. Thus the model turns rates estimated from _completed_ trips into attempted-event rates. This is a declared modeling assumption: the public archive does not identify demand that was censored by an empty or full station.

For each seed from 0 through 511, all three controllers receive the same sampled event trace. This common-random-number design compares their decisions under the same demand realization. A separate paired-pulse condition appends eight rental attempts at Prince-Arthur at 07:47 and eight return attempts at de Maisonneuve at 07:57 to every trace. These additions are fixed, not extra Poisson draws, and each succeeds only when inventory or dock space permits. The feedback rule first uses their inventory consequences at the 08:00 decision. The frozen controller receives the new observation but ignores it and executes the action selected before 07:00.

The recorded comparison below uses the same event trace for every controller. The map, station fills, truck motion, and service failures come from committed Python trajectories. Controller selection and the playhead only seek through those records; they do not recompute the plant in the browser.

<a id="MLiKR4bsLh"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from bixi_replay import render_bixi_replay

display(HTML(render_bixi_replay(
    Path("artifacts/bixi/textbook_results.json"),
    replay_id="bixi-modeling-replay",
    fallback_id="fig-bixi-control-replay-fallback",
)))
```

Loading...

<a id="fig-bixi-control-replay-fallback"></a>

<a id="rIQDf9g1pm"></a>
![BIXI station inventory trajectories and paired service-failure intervals for no relocation, a frozen schedule, and inventory feedback.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/d577972762-bixi-feedback-eviden-3099b851efe7ae86d9d424515f0a9441.svg)

[Figure 2:](#fig-bixi-control-replay-fallback "Link to this figure")Static trajectories and paired stochastic evidence from the same Python experiment. The online book adds controller selection, playback, stepping, and scrubbing.

| controller | mean failures, rate model | mean failures, paired pulse |
| --- | --- | --- |
| No relocation | 8.78 | 19.30 |
| Frozen open loop | 6.21 | 14.78 |
| Inventory feedback | 3.06 | 3.60 |

On the nominal traces, feedback lowers mean failures from 6.21 to 3.06 relative to the frozen plan. The frozen plan moves a median 6 bicycles over 0.85 km. Feedback moves a median 20 bicycles over 4.05 km under the rate model and 33 bicycles over 5.09 km under the paired pulse. The service gain therefore comes with a visible relocation cost.

Values are means over 512 common-random-number event traces. They describe the teaching simulator calibrated from completed trips, not measured failures in BIXI operations.

Feedback reduces service failures in this model, but it does more relocation work. These are outcomes of the stated simulator, not measurements of service failures or estimates of a causal effect in BIXI operations. The public archive omits unsuccessful attempts, historical inventories, and operator truck movements. The selected morning was chosen after inspection because its imbalance is easy to see; it is not an unbiased evaluation sample [BIXI Montréal (2024)](https://bixi.com/en/open-data/)[Ville de Montréal (2026)](https://donnees.montreal.ca/dataset/bixi-historique-des-deplacements)[Hulot _et al._ (2018)](https://doi.org/10.1145/3219819.3219873).

Inspect the BIXI transition and feedback rule

bixi\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
```

bixi\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
```

[Download the complete BIXI experiment](https://pierrelucbacon.com/rlbook/build/bixi_control-c5fc44d4361eba917395bf1d64ee2b16.py)

The BIXI simulator supplies station and truck inventories directly to the feedback controller. Physical sensors often provide only indirect, noisy measurements of the state.

<a id="partial-observability"></a>

## Partial Observability

A transition kernel describes uncertainty in the state itself. What changes when the controller receives only a noisy or ambiguous function of that state?

The BIXI controller receives the modeled inventories directly. Many controllers instead receive sensor readings that contain only partial or noisy information about the predictive state. An observation model relates the hidden state to the available measurement:

<a id="dmtKhk4mZf"></a>

$$
y_t=h(x_t,u_t,\nu_t),
\qquad
\nu_t\sim p_\nu.
$$

[(12)](#dmtKhk4mZf "Link to this Equation")

Here $p_\nu$ is the distribution assigned to measurement noise. For a linear Gaussian sensor, $y_t=Cx_t+\nu_t$ with $\nu_t\sim\mathcal N(0,R)$. A controller based only on $y_t$ may lose information needed to predict future transitions. Under a known model, the posterior belief

<a id="d3KVwemISQ"></a>

$$
b_t(A)=\Pr(x_t\in A\mid y_{0:t},u_{0:t-1})
$$

[(13)](#d3KVwemISQ "Link to this Equation")

assigns a probability to each set $A$ of possible hidden states. This belief is an **information state**: it retains the predictive content of the observation history in a form that can be updated after each action and measurement. A point estimate is often cheaper to use, but it may discard uncertainty that affects future decisions.

<a id="camera-stabilization-under-partial-observation"></a>

### Camera Stabilization under Partial Observation

Picture a camera on a one-axis gimbal attached to a moving vehicle. The motor tries to keep the horizon level. A tap can rotate the camera, and a sideways acceleration of the vehicle can disturb its sensors even when the camera itself does not rotate. The controller must infer what happened from an inertial measurement unit rather than from the true angle.

The simulated hidden state is

<a id="BrIXTyW2ia"></a>

$$
x=(\theta,\omega,b)
$$

[(14)](#BrIXTyW2ia "Link to this Equation")

where $\theta$ is the camera angle in radians, $\omega$ is its angular velocity in radians per second, and $b$ is an offset in the gyroscope reading, also in radians per second. The camera is balanced about the gimbal axis, so gravity does not create a rotational torque in this model. Its one-axis torque balance is

<a id="JATy2EPvSO"></a>

$$
\dot\theta=\omega,
\qquad
J\dot\omega=u-c\omega+\tau_{\mathrm{ext}}(t),
\qquad |u|\leq u_{\max}.
$$

[(15)](#JATy2EPvSO "Link to this Equation")

Here $J$ is the camera’s moment of inertia about the gimbal axis, measured in $\mathrm{kg\,m^2}$. A larger $J$ means that the same torque produces less angular acceleration. The motor torque $u$ and external torque $\tau_{\mathrm{ext}}$ are measured in $\mathrm{N\,m}$, and $c$ is a viscous rotational-damping coefficient measured in $\mathrm{N\,m\,s/rad}$. The bound $u_{\max}$ represents the motor’s torque limit.

The bias $b$ belongs to the sensor, not to the mechanical plant. If the camera is motionless but $b=0.8$ degrees per second, the gyroscope reading remains centered near 0.8 degrees per second instead of zero. This persistent offset is different from the small, rapid fluctuations that vary independently from one measurement to the next.

Real sensor errors depend on temperature, calibration, and hardware. For this ten-second simulation, a random walk provides a simple model of an offset that persists but can drift [El-Sheimy _et al._ (2008)](https://doi.org/10.1109/TIM.2007.908635):

<a id="AIfqVXXQNT"></a>

$$
b_{k+1}=b_k+\sigma_b\sqrt{\Delta t}\,\epsilon_k,
\qquad \epsilon_k\sim\mathcal N(0,1).
$$

[(16)](#AIfqVXXQNT "Link to this Equation")

Conditional on $b_k$, the next bias has mean $b_k$ and its change has standard deviation $\sigma_b\sqrt{\Delta t}$. Nothing in the model pulls the bias back to zero. Here $b_0=0.8$ degrees per second and $\sigma_b=0.02\ (\mathrm{degrees/s})/\sqrt{\mathrm{s}}$, so the standard deviation of one bias change is only 0.002 degrees per second at the $\Delta t=0.01$\-second sensor period. The chosen random walk therefore changes slowly relative to the sample-to-sample measurement noise. It is a reproducible teaching model, not a claim that every gyroscope drifts in exactly this way.

The gyroscope measures angular velocity with both the persistent bias and sample-to-sample measurement noise:

<a id="rRi5kzLphT"></a>

$$
y_k^\omega=\omega_k+b_k+\nu_k^\omega.
$$

[(17)](#rRi5kzLphT "Link to this Equation")

Integrating these readings turns a rate estimate into an angle estimate. Over $T$ seconds, an approximately constant bias $b$ contributes roughly $Tb$ to that estimated angle. A camera that is actually motionless therefore acquires about eight degrees of estimated rotation after ten seconds when an uncorrected 0.8\-degree-per-second bias is integrated. Zero-mean measurement noise tends to fluctuate in both directions; the persistent offset accumulates in one direction.

The accelerometer creates a different ambiguity. It measures _specific force_, the force per unit mass sensed by its internal proof mass, rather than reporting a camera angle directly. When the vehicle is stationary or moves at constant velocity, the support force opposing gravity supplies a vertical reference. A sideways vehicle acceleration changes the same sensor reading and can therefore look like camera tilt [Android Developers (2026)](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion).

The simulation keeps only the two axes in the plane of rotation. Its accelerometer model is

<a id="ccdI28JH78"></a>

$$
\begin{bmatrix}y_k^x\\y_k^y\end{bmatrix}
=R(-\theta_k)
\begin{bmatrix}a_{x,k}^{w}\\g\end{bmatrix}+\nu_k^a.
$$

[(18)](#ccdI28JH78 "Link to this Equation")

The vector $[a_{x,k}^{w},g]^\top$ contains the vehicle’s sideways acceleration and the gravity reference in world coordinates. The rotation $R(-\theta_k)$ expresses that vector along the camera-mounted sensor axes, and $\nu_k^a$ adds instantaneous measurement noise. If sideways acceleration and measurement noise are both zero, the direction of this vector determines $\theta_k$. With sideways acceleration, the angle inferred from the same two components becomes

<a id="O6AvuNC718"></a>

$$
\operatorname{atan2}(y_k^x,y_k^y)
=\theta_k+\operatorname{atan2}(a_{x,k}^{w},g).
$$

[(19)](#O6AvuNC718 "Link to this Equation")

For example, $a_x^w=3\ \mathrm{m/s^2}$ adds an apparent tilt of about 17 degrees. A level camera on a vehicle accelerating sideways can then produce the same accelerometer direction as a tilted camera on a stationary base. This is the partial-observation problem: the sensor reading alone does not identify which hidden situation occurred.

The two sensors fail on different time scales. The accelerometer gives a stable long-run reference when vehicle translation is mild, but a lateral acceleration corrupts it immediately. The gyroscope tracks rapid rotations without confusing them with translation, but integrating an unknown bias produces long-run drift. A **complementary observer** is a recursive state estimator that combines these two time scales. It uses the gyroscope for rapid changes, the accelerometer for slow angle correction, and the persistent disagreement between them to estimate gyroscope bias [Mahony _et al._ (2008)](https://doi.org/10.1109/TAC.2008.923738).

The comparison below changes only the estimator. One controller uses the accelerometer direction as its angle estimate, one integrates the raw gyroscope, and one uses the complementary observer. Every run receives the same mechanical plant, noise realization, disturbances, torque limit, and feedback law:

<a id="m2hh9BLQPZ"></a>

$$
u_k=\operatorname{clip}
\left(-0.9\hat\theta_k-0.12\hat\omega_k,
-0.18,0.18\right).
$$

[(20)](#m2hh9BLQPZ "Link to this Equation")

The function $\operatorname{clip}$ limits the requested motor torque to the interval $[-0.18,0.18]\ \mathrm{N\,m}$. The simulated plant uses $J=0.018\ \mathrm{kg\,m^2}$, $c=0.025\ \mathrm{N\,m\,s/rad}$, one-millisecond mechanical integration, and ten-millisecond sensing and control. The ten-second sensor trace is generated once with seed 11 and then supplied unchanged to every estimator.

All three runs start with the camera tilted by eight degrees. A $0.14\ \mathrm{N\,m}$ tap from 1.50 to 1.62 seconds physically rotates the camera, so both inertial sensors should help the controller respond. From 4.0 to 4.6 seconds, the base instead accelerates sideways at up to $3\ \mathrm{m/s^2}$. That event changes the accelerometer reading without directly rotating the balanced camera. The final quiet interval exposes the angle error produced by integrating the biased gyroscope.

The replay displays curves only up to the current playhead. Its metrics use the hidden simulated angle, which is available to the experiment but not to the controllers.

<a id="QlugFkX8OX"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from gimbal_replay import render_gimbal_replay

display(HTML(render_gimbal_replay(
    Path("artifacts/gimbal/textbook_results.json"),
    replay_id="gimbal-observation-replay",
    fallback_id="fig-gimbal-observation-fallback",
)))
```

Loading...

<a id="fig-gimbal-observation-fallback"></a>

<a id="VTlTAQ0AyS"></a>
![Three camera gimbals and their true-angle trajectories under accelerometer-only, integrated-gyro, and complementary state estimation.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/72bf80041f-partial-observabilit-b3a06859601bdde1e579a4d1b7bbc3bf.svg)

[Figure 3:](#fig-gimbal-observation-fallback "Link to this figure")Static snapshots and complete trajectories from the same Python experiment. The online book adds playback, stepping, and scrubbing.

| state estimate supplied to the controller | RMS angle | peak during translation | final absolute error |
| --- | --- | --- | --- |
| Accelerometer as state | 3.86 degrees | 19.00 degrees | 0.08 degrees |
| Integrated gyroscope | 4.60 degrees | 4.31 degrees | 7.73 degrees |
| Complementary observer | 2.43 degrees | 6.07 degrees | 0.58 degrees |

The results follow the two failure mechanisms. The accelerometer-only estimate reacts strongly to the translation pulse. The integrated-gyroscope estimate largely ignores that pulse but drifts during the quiet interval. The complementary observer reduces both errors by using the accelerometer as a slow correction to the gyroscope-based angle. Sustained unknown translation can still be mistaken for tilt. These are results from a transparent teaching simulation, not measured performance of a commercial gimbal.

The same distinction appears in adaptive optics: local wavefront slopes are sensor observations, while the reconstructed phase is the state used for control.

Inspect the sampled plant, sensors, estimator, and controller

gimbal\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
```

[Download the complete gimbal experiment](https://pierrelucbacon.com/rlbook/build/gimbal_control-fa8228dcab354ac53e8247e502818ebf.py)

State, action, disturbance, and observation equations describe the model’s semantics. An algorithm still needs a computational way to use that model. The next distinction concerns which operations the model exposes: formulas and derivatives, reset-and-step simulation, fixed logged transitions, or new online interaction.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Transition kernels separate the action selected by the decision maker from the disturbance that selects a realized successor. Observation models add a second separation: the state supports prediction, while the measurement supplies only the information available for choosing the next action.

These equations specify what a model means, but they do not specify how an algorithm may use it. Can the algorithm differentiate the transition, reset a simulator, resample a state, or only inspect logged transitions? [Model interfaces and learned components](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/05-model-interfaces.md) make those operations explicit.

<a id="exercises"></a>

## Exercises

<a id="ex-dynamics-bixi-conservation"></a>

[Exercise 1](#ex-dynamics-bixi-conservation "Link to this Exercise") (Conservation and feedback in bicycle relocation)

Before customer events occur, verify that relocation preserves the sum of station and truck inventories. Then compare the frozen schedule with inventory feedback after the declared demand pulse. Which new observation can change the feedback action, and why can the frozen action not change?

Solution to [Exercise 1](#ex-dynamics-bixi-conservation)

Since $q_{i,0}=s_{i,k}+\rho_{i,k}$ and $b_{k+1}=b_k-\sum_i\rho_{i,k}$,

<a id="KJfqe8HHuu"></a>

$$
\sum_i q_{i,0}+b_{k+1}=\sum_i s_{i,k}+b_k.
$$

[(21)](#KJfqe8HHuu "Link to this Equation")

Customer trips may later cross the three-station boundary and change that total. At 08:00, feedback observes the inventories produced by the unexpected Prince-Arthur rentals and de Maisonneuve returns, so it can alter its transfer or route. The frozen schedule was fixed from information available before 07:00 and has no rule for using the new observation.

<a id="ex-dynamics-gimbal-ambiguity"></a>

[Exercise 2](#ex-dynamics-gimbal-ambiguity "Link to this Exercise") (Tilt or translation?)

Construct two pairs $(\theta,a_x^w)$ that produce the same noiseless accelerometer-derived tilt. What additional information does the gyroscope supply, and which ambiguity remains?

Solution to [Exercise 2](#ex-dynamics-gimbal-ambiguity)

Both

<a id="hSnP4kDDsD"></a>

$$
(\theta,a_x^w)=(10^\circ,0)
\quad\text{and}\quad
(\theta,a_x^w)=\left(0,g\tan 10^\circ\right)
$$

[(22)](#hSnP4kDDsD "Link to this Equation")

produce an apparent tilt of $10^\circ$. The gyroscope measures angular rate plus bias, which helps distinguish a rapid rotation from a translational pulse. An unknown gyro bias still accumulates as angle error, and sustained unknown translation remains confounded with gravity in the accelerometer.

<a id="ex-dynamics-reservoir-kernel"></a>

[Exercise 3](#ex-dynamics-reservoir-kernel "Link to this Exercise") (Function-plus-noise and transition kernels)

Suppose a reservoir with no spill or evaporation obeys $s_{t+1}=s_t-u_t+w_t$, where $w_t=\bar w_t+\epsilon_t$. Write a function-plus-noise model and the induced transition kernel.

Solution to [Exercise 3](#ex-dynamics-reservoir-kernel)

The explicit-noise form is

<a id="X8exC3qv9e"></a>

$$
s_{t+1}=s_t-u_t+\bar w_t+\epsilon_t.
$$

[(23)](#X8exC3qv9e "Link to this Equation")

If $\epsilon_t$ has conditional distribution $p_t$, then the induced kernel is

<a id="XfkuQ9Hdi1"></a>

$$
P_t(A\mid s,u)
=\Pr\!\left(s-u+\bar w_t+\epsilon_t\in A\right).
$$

[(24)](#XfkuQ9Hdi1 "Link to this Equation")

This kernel is the pushforward of the noise distribution through the balance equation. Adding bounds or spill would change the map and could create probability mass at a boundary.

<a id="ex-dynamics-nonmarkov-observation"></a>

[Exercise 4](#ex-dynamics-nonmarkov-observation "Link to this Exercise") (A non-Markov observation)

An inference controller observes queue counts and total cache occupancy but not the remaining output length of each active request. Why are those measurements not generally a Markov state? What additional state or history would improve prediction?

Solution to [Exercise 4](#ex-dynamics-nonmarkov-observation)

Two request sets can have equal queue counts and cache occupancy but different remaining output lengths. Their completion times and cache releases therefore have different conditional distributions. A full state can retain every request’s remaining work. When that work is hidden, the complete observation history is sufficient in principle, and a posterior distribution over the request-level state is a compact information state under a known model.

<a id="ex-dynamics-modeling-dispatch"></a>

[Exercise 5](#ex-dynamics-modeling-dispatch "Link to this Exercise") (Dispatch under hidden service times)

A computing service reviews its operation once per minute. Four workers can process jobs from either of two queues. At each review, the dispatcher sees the number of waiting jobs in each queue, the number of busy workers, the current worker modes, and a power measurement. It chooses how many workers will be active and which queue receives priority during the next minute. New jobs arrive at random times. Each busy job has an unobserved remaining processing time, and this quantity affects whether the job finishes during the next minute. The objective penalizes waiting time and energy use. A hard power limit must hold at every step.

(a) Draw the system boundary and classify the state, observation, action, disturbance, objective, constraint, time representation, and horizon. Use a finite horizon of 60 decisions.

(b) Explain why the observed queue counts and number of busy workers are not generally a Markov state. Give one full-state description for the system and one information state available to the dispatcher.

(c) Choose between deterministic dynamics and a stochastic transition kernel. State which sentence in the description determines your choice.

(d) Distinguish a fixed 60-minute staffing schedule from a feedback policy. Which observations can affect the feedback action after the first minute?

(e) Suppose the only available data are transitions logged under one fixed staffing schedule. Which model interface does this provide, and what can it not answer directly about a new feedback policy?

Solution to [Exercise 5](#ex-dynamics-modeling-dispatch)

(a) The boundary contains the two queues, four workers, and their power-relevant operation. A full state contains the queued jobs, every active job’s worker and remaining processing time, the worker modes, and any variable needed to predict power. The stated observation contains the two queue counts, busy-worker count, worker modes, and measured power. The action is the active-worker count and queue priority. Arrivals and unobserved job requirements are disturbances. The stage cost combines waiting and energy, and the power cap is a hard constraint. Time is discrete in one-minute steps over 60 decisions.

(b) Equal counts can hide different remaining workloads and therefore different completion distributions. The full state just described is Markov under the declared job model. The complete observation-action history is available to the dispatcher; under a known stochastic model, its posterior over hidden job states is a more compact information state.

(c) A stochastic transition kernel is the natural representation because jobs arrive at random times and hidden processing requirements make completions uncertain. A deterministic function remains possible only after the relevant noise realizations are supplied as additional inputs.

(d) The fixed schedule selects all 60 actions from initial information. A feedback policy may change the active-worker count or priority after observing new queue counts, busy-worker status, modes, or power.

(e) Those data supply a logged-transition interface under one behavior schedule. It cannot directly answer how actions absent from that log would change queues or power, so evaluating a new feedback policy requires coverage and identification assumptions or a separate transition model.

<a id="ex-dynamics-modeling-practice"></a>

[Exercise 6](#ex-dynamics-modeling-practice "Link to this Exercise") (Practice under latent mastery)

An online practice system presents one problem at each of 20 rounds. Before round $t$, a learner’s unobserved mastery $M_t$ is one of three ordered categories. The system chooses an easy, medium, or hard problem $A_t$, then observes correctness and response time $Y_t$. The observation distribution depends only on $M_t$ and $A_t$. Mastery then changes randomly according to a distribution that depends only on $M_t$ and $A_t$, producing $M_{t+1}$. The objective is to maximize the probability that $M_{20}$, after the twentieth transition, is the highest category, subject to presenting at most five hard problems. A resettable simulator can sample a transition and observation from any supplied mastery level and difficulty, but it exposes no equations or derivatives.

(a) Classify the latent state, observation, action, stochastic dynamics, objective, constraint, horizon, and model interface. Include any bookkeeping variable needed to enforce the five-hard-problem limit.

(b) Compare three possible inputs to the decision rule: the most recent answer, the complete observation history, and the posterior distribution over mastery levels. Which is an information state under the stated conditional relationships? Explain why.

(c) Write the structural form of the state transition, observation model, and feedback policy without inventing numerical probabilities.

(d) Describe an open-loop problem sequence and a feedback problem sequence. Which part of the available information can change the latter?

(e) Name one computation that the resettable simulator supports directly and one operation that would require an additional interface.

Solution to [Exercise 6](#ex-dynamics-modeling-practice)

(a) The augmented latent state is $(M_t,c_t,t)$, where $c_t$ counts hard problems already used. The observation is correctness and response time, and the action is difficulty. The model has a stochastic mastery transition and a stochastic observation map. The terminal objective is $\Pr(M_{20}=\text{highest})$, with $c_t\leq5$ as a hard constraint. The horizon contains 20 actions. The available model is a generative reset-and-sample simulator.

(b) The latest answer alone generally loses information from earlier rounds. The complete history is sufficient but grows with time. Under the stated conditional relationships, the posterior $b_t(m)=\Pr(M_t=m\mid Y_{0:t-1},A_{0:t-1})$, augmented by $c_t$ and $t$, is a Markov information state.

(c) Without assigning numbers, the structure is

<a id="CDD8slA9dc"></a>

$$
Y_t\sim O(\,\cdot\mid M_t,A_t),\qquad
M_{t+1}\sim P(\,\cdot\mid M_t,A_t),\qquad
c_{t+1}=c_t+\mathbf 1\{A_t=\mathrm{hard}\},
$$

[(25)](#CDD8slA9dc "Link to this Equation")

with a feasible feedback policy $A_t=\pi_t(b_t,c_t)$ that excludes the hard action once $c_t=5$.

(d) An open-loop sequence fixes all 20 difficulties before any answers are seen. A feedback sequence selects the next difficulty after updating the mastery posterior from correctness and response time, while retaining the remaining hard-problem budget.

(e) The simulator directly supports arbitrary one-step samples and Monte Carlo rollouts from chosen latent states and actions. Exact probabilities, analytic derivatives, or symbolic local equations require an additional interface.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-bixiOpenData2024"></a>
2.  BIXI Montréal. (2024). _Open Data: Trip History and Station Status_. [https://bixi.com/en/open-data/](https://bixi.com/en/open-data/)
<a id="cite-montrealBixiTrips"></a>
4.  Ville de Montréal. (2026). _BIXI Trip History_. Montréal open-data catalogue. [https://donnees.montreal.ca/dataset/bixi-historique-des-deplacements](https://donnees.montreal.ca/dataset/bixi-historique-des-deplacements)
<a id="cite-hulot2018bixi"></a>
6.  Hulot, P., Aloise, D., & Jena, S. D. (2018). Towards Station-Level Demand Prediction for Effective Rebalancing in Bike-Sharing Systems. _Proceedings of the 24th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining_, 378–386. [10.1145/3219819.3219873](https://doi.org/10.1145/3219819.3219873)
<a id="cite-elSheimy2008allan"></a>
8.  El-Sheimy, N., Hou, H., & Niu, X. (2008). Analysis and Modeling of Inertial Sensors Using Allan Variance. _IEEE Transactions on Instrumentation and Measurement_, _57_(1), 140–149. [10.1109/TIM.2007.908635](https://doi.org/10.1109/TIM.2007.908635)
<a id="cite-androidMotionSensors2026"></a>
10.  Android Developers. (2026). _Motion Sensors_. [https://developer.android.com/develop/sensors-and-location/sensors/sensors\_motion](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion)
<a id="cite-mahony2008complementary"></a>
12.  Mahony, R., Hamel, T., & Pflimlin, J.-M. (2008). Nonlinear Complementary Filters on the Special Orthogonal Group. _IEEE Transactions on Automatic Control_, _53_(5), 1203–1218. [10.1109/TAC.2008.923738](https://doi.org/10.1109/TAC.2008.923738)

[

Modeling Sequential Decisions

Controlled Systems: Boundaries, States, and Actions


](03-modeling-controlled-systems.md)[

Modeling Sequential Decisions

Model Interfaces and Learned Components


](05-model-interfaces.md)


---

# CHAPITRE 05 — Model Interfaces and Learned Components

Section du livre : Modeling Sequential Decisions

Page originale : https://pierrelucbacon.com/rlbook/model-interfaces

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/05-model-interfaces.md

> **Cours de Pierre-Luc Bacon — 05.** [Page publiée](https://pierrelucbacon.com/rlbook/model-interfaces) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/05-model-interfaces.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Model Interfaces and Learned Components

<a id="skip-to-article"></a>

Stochastic dynamics and observation models specify the law of the next state and the information returned to the controller. Which of those mathematical objects can an algorithm actually evaluate, differentiate, resample, or learn from recorded data?

Two models may generate the same nominal trajectory while exposing different operations to an algorithm. Access to equations, derivatives, resets, and new interactions determines what can be computed. The interface therefore matters independently of the model’s physical fidelity: knowing that a transition exists is different from being able to differentiate it, resample it, or query it under a new action.

| available interface | operations it supports directly | methods developed later |
| --- | --- | --- |
| equations and derivatives | evaluate local dynamics, linearize, differentiate constraints | direct transcription, LQR, gradient-based MPC |
| one-step transition function | reset and advance from chosen state-action pairs | shooting, simulation-based MPC, model-based dynamic programming |
| generative simulator | sample trajectories without inspecting internal equations | Monte Carlo estimation, derivative-free search, policy learning |
| logged transitions | fit or evaluate models on the recorded distribution | system identification, fitted value and Q methods, offline evaluation |
| interactive environment and objective | collect new transitions under chosen actions | online reinforcement learning |

The rows are not mutually exclusive. A simulator may be differentiable, an explicit model may contain unknown parameters, and logged data can be used to fit a new one-step model. The table records the information supplied to the algorithm, not the origin or fidelity of the model.

A program is a model when its execution defines state transitions. MuJoCo, for example, combines rigid-body equations, contact detection, constraint forces, sensors, and rendering behind a reset-and-step interface. A user can query that interface without possessing a practical expression for its complete local transition function. A discrete-event simulator also defines a transition model, although its clock advances from one asynchronous event to the next.

Calling a method **model-free** specifies which transition information its updates can use. In this book, a model-free update receives sampled experience rather than direct access to the transition function, transition probabilities, or their derivatives. An online method may choose an action and observe the resulting transition. An offline method is restricted to the transitions in its log. Neither can directly request the exact outcome distribution for an untried action at the same state. Both still require a declared observation, action set, reward, sampling process, and assumptions connecting the available samples to deployment.

<a id="inference-serving-as-a-controlled-system"></a>

### Inference Serving as a Controlled System

Inference serving contains several modeling choices within one boundary. It combines conserved work and cache balances with profiled performance maps, has both request-level and aggregate states, and can be accessed through equations, simulation, logged traces, or a live process. The control objective is to schedule work and choose hardware settings while respecting latency, memory, power, and thermal limits.

An inference server receives prompts at irregular times and generates one response for each request. A decoder-only language model processes a request in two phases. The **prefill** phase processes the prompt in parallel and creates the first output token. The **decode** phase generates the remaining tokens one iteration at a time. Long prefills can delay the short decode iterations of requests already in progress. Iteration-level scheduling and chunked prefill are production approaches to controlling this interaction [Yu _et al._ (2022)](https://www.usenix.org/conference/osdi22/presentation/yu)[Agrawal _et al._ (2024)](https://www.usenix.org/conference/osdi24/presentation/agrawal). The teaching simulator below uses a reduced interleaving rule rather than reproducing either serving system.

<a id="boundary-state-and-action"></a>

#### Boundary, State, and Action

The system boundary surrounds one GPU and its serving process. The language model and inference engine lie inside the boundary. Request arrivals and ambient thermal conditions enter from outside it.

<a id="fig-inference-serving-boundary"></a>

<a id="eSz6pUUyDv"></a>
![A system-boundary diagram containing one serving process and one GPU. Requests and ambient conditions enter from outside; responses and observations leave; clock and scheduling actions enter from a controller.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/00e0a1430b-inference-serving-bo-8a67a6a85379fa2222bc62b552cc9ab2.svg)

[Figure 1:](#fig-inference-serving-boundary "Link to this figure")The boundary contains the request queue, scheduler, language-model execution, key-value cache, and GPU hardware state. The controller observes queue and cache state, completed work, power, temperature, and realized clock; it chooses a requested clock and scheduling rule. Arrivals are disturbances, and a request’s eventual output length remains hidden until that request completes. Other GPUs, network routing, and downstream applications remain outside this model.

This fixed serving boundary is available through four of the interfaces above. Token, cache, and thermal balances provide equations. The profile-based event simulator can be reset and run under chosen clock and scheduling actions. Logged traces and profile records contain only the states and actions that were recorded, so they cannot directly answer counterfactual questions outside that coverage. A live Qwen/vLLM process accepts new requests and chosen clock settings, producing new transition samples. Several interfaces may coexist; their available operations differ even though the serving process does not.

The full request-level simulator state records each request’s phase, age, remaining prompt work, generated tokens, eventual output length, and cache allocation. The eventual output length is part of the simulator’s hidden state but is not revealed to the controller. At a one-second control interval, the reduced control model uses the aggregate state

<a id="lPr7pmDM3Q"></a>

$$
x_t=(p_t,d_t,m_t,T_t,f_t),
$$

[(1)](#lPr7pmDM3Q "Link to this Equation")

where $p_t$ is queued prefill work and $d_t$ is unfinished decode work. The quantity $m_t$ is key-value-cache occupancy; this cache stores intermediate attention representations so that previously processed tokens need not be recomputed at each decode step. The remaining variables are GPU temperature $T_t$ and realized graphics clock $f_t$, the hardware frequency that determines how quickly GPU work can proceed. This vector is a state of the reduced model, but it is not a Markov description of every request-level trajectory. The control

<a id="yvPtwXJ7qh"></a>

$$
u_t=(f_t^{\mathrm{req}},\sigma_t)
$$

[(2)](#yvPtwXJ7qh "Link to this Equation")

combines a requested clock with a scheduling rule $\sigma_t$. The scheduler decides which phase receives each service step and how much prefill work may be processed before returning to active decodes. The clock request changes the rate and energy cost of that work. Hardware may realize a lower clock under a power or thermal limit, so $f_t^{\mathrm{req}}$ and $f_t$ are distinct variables [NVIDIA Corporation (2026)](https://docs.nvidia.com/deploy/nvidia-smi/index.html).

Request arrivals form the disturbance. An arrival supplies its time and prompt length, but its eventual output length remains unknown to the controller until the end-of-sequence token arrives. The observation contains queue ages, completed prompt and output tokens, cache use, power, temperature, and realized clock. This information pattern prevents a controller from scheduling with the future length recorded in an evaluation trace.

<a id="conservation-and-calibrated-maps"></a>

#### Conservation and Calibrated Maps

The aggregate balances expose structure that does not have to be learned. If $A_t^p$ prompt tokens arrive, $C_t^p$ prompt tokens are processed, $N_t^p$ requests finish prefill, and $C_t^d$ decode tokens are produced, then

<a id="LmNBKKpL8j"></a>

$$
\begin{aligned}
p_{t+1} &= p_t+A_t^p-C_t^p,\\
d_{t+1} &= d_t+W_t^d(N_t^p)-C_t^d.
\end{aligned}
$$

[(3)](#LmNBKKpL8j "Link to this Equation")

The term $W_t^d(N_t^p)$ denotes the still-unknown output work associated with newly admitted decode requests. The request-level simulator makes this work available only as tokens complete. It tracks continuous prompt and generated-token occupancy, including partial prefills, together with a fixed per-request reserve. That occupancy is released when a request completes. This aggregate accounting preserves the modeled cache balance, but it does not reproduce a serving engine’s block allocator. An aggregate thermal balance has the form

<a id="tcmtcEeYtL"></a>

$$
T_{t+1}=T_t+\frac{\Delta t}{C_\theta}
\left(P(x_t,u_t)-\frac{T_t-T_{\mathrm{amb}}}{R_\theta}\right).
$$

[(4)](#tcmtcEeYtL "Link to this Equation")

Here $T_{\mathrm{amb}}$ is ambient temperature, $C_\theta$ is effective thermal capacitance, and $R_\theta$ is thermal resistance to the surroundings. The power map $P(x_t,u_t)$ adds heat, while $(T_t-T_{\mathrm{amb}})/R_\theta$ removes heat when the GPU is warmer than its environment.

Token and cache conservation determine the form of the transition. Measurements are still needed for the service-rate map, the power map $P$, and the thermal parameters. The profiling protocol targets Qwen2.5-7B-Instruct served by vLLM on an NVIDIA L4 [Qwen Team (2025)](https://arxiv.org/abs/2412.15115)[Kwon _et al._ (2023)](https://doi.org/10.1145/3600006.3613165). Its intended hardware profile spans five requested clock levels, several prompt lengths, and three concurrency levels, meaning three different numbers of requests served at the same time. The book build reads a committed profile and never starts a model server. Its manifest states whether the maps come from completed L4 measurements or a pre-measurement engineering surrogate, and every rendered result displays that provenance.

<a id="batch-size-changes-the-service-map"></a>

#### Batch Size Changes the Service Map

The recorded 64.8 W L4 profile shows why a service map must retain concurrency. At a requested 2,040 MHz with a 1,024-token prompt, aggregate decode throughput rises from 17.5 generated tokens per second for one request to 105.6 for eight concurrent requests. Aggregate prefill throughput changes much less across these batch sizes. Pooling the measurements into one rate per clock loses this difference and can give a controller the wrong prediction of queue drainage.

<a id="fig-inference-batch-calibration"></a>

<a id="AGaWENfIui"></a>
![Prefill and decode throughput at five requested GPU clocks, with separate curves for one, four, and eight concurrent requests. Decode throughput increases strongly with concurrency; prefill throughput changes little.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/03ea093e1e-batch-calibration-145327ff00ed00e93e8ddc0d38dde552.svg)

[Figure 2:](#fig-inference-batch-calibration "Link to this figure")Batch size changes decode capacity in the recorded 2 September 2026 L4 profile at a 64.8 W cap. Each point is the median of five concurrent batches; whiskers show their minimum and maximum. Prompt length is fixed within each panel. All five requested clocks are retained, including the throughput plateau above 1,125 MHz.

The plateau also motivates a fixed moderate-clock baseline. A feedback controller can lower energy relative to the maximum clock without improving on a well-chosen constant clock. The live experiment therefore selects a constant clock on development requests before comparing it with the governor and MPC on fresh requests. The current live experiment uses a 40 W cap and requires fresh service and idle power measurements at that cap. The 64.8 W curves remain historical evidence; the replay below retains the original reduced teaching model.

The live controller distinguishes requests awaiting their first output from requests already streaming. It estimates remaining output work from development request lengths and the tokens received so far, then fits its transition model on mixed-serving measurements. These observations preserve useful differences in the workload without exposing unfinished requests’ final lengths or assuming that the resulting state is fully Markov.

[Download the phase, context, and concurrency calibration table (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/e882e10ad3-batch_calibration-3e069fe028408abf56c3ab3125112d45.csv)

A separate measured study now compares fixed clocks, GPU-managed graphics clocks, and a causal demand/phase heuristic under the configured 40 W setting. Across four held-out Azure request blocks, each repeated twice, fixed 660 MHz used 10.31% less telemetry-derived GPU energy than GPU-managed clocks; the adaptive heuristic used a further 0.77% less than fixed 660 MHz. All paired relative latency checks passed, but the candidate failed development qualification and all three methods missed the absolute time-to-first-token target on the shorter code block. These are exploratory observations, not established latency-qualified adaptive savings. The heuristic is separate from the governor and MPC, whose calibration remains incomplete. The [measured study](https://pierrelucbacon.com/rlbook/build/gpu-adaptive-study-0b2980d8bfa15c6e98aea05982359544.html) includes the five-clock screen, request-shape probes, observed clocks, and retained failures.

[Read the completed study and paired results (PDF)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/460706c542-article-92c02a4d51251cc17113676ccb4c56f3.pdf)

<a id="workload-and-scheduling-rule"></a>

#### Workload and Scheduling Rule

The conservation equations specify how work moves through the server, but an experiment also needs a reproducible arrival process and a declared scheduler. The following settings define the recorded simulation. The revised live experiment instead measures mixed-serving capacity and freezes its latency targets from development requests before confirmation.

The simulated workload is a five-minute excerpt from the Azure 2023 code-generation trace, which records request times and input and output token counts [Microsoft Azure (2023)](https://github.com/Azure/AzurePublicDataset/blob/master/AzureLLMInferenceDataset2023.md)[Patel _et al._ (2024)](https://www.microsoft.com/en-us/research/publication/splitwise-efficient-generative-llm-inference-using-phase-splitting/). Arrival times are dilated once to place maximum-clock utilization near 80 percent. This time dilation preserves request sizes and ordering while spreading arrivals over a longer interval. If $\rho_{\max}$ is the isolated service time of all requests at the highest profiled clock divided by the original window length, the dilation and normalized arrivals are

<a id="HqjXsoBAOk"></a>

$$
\kappa=\max\!\left(1,\frac{\rho_{\max}}{0.8}\right),
\qquad
t_i'=\kappa(t_i-t_0).
$$

[(5)](#HqjXsoBAOk "Link to this Equation")

The factor $\kappa$ is at least one, so it can leave the trace unchanged or slow its arrivals; it never compresses them into a shorter interval.

All simulated controllers receive the same immutable requests after this transformation. The simulated time-to-first-token limit is twice the median baseline value for a 1,024-token prompt at concurrency one and the highest clock. The time-per-output-token limit is 1.5 times the corresponding median. These are reference levels for a controlled comparison, not service-level objectives claimed for production systems.

| quantity | recorded simulation setting |
| --- | --- |
| model | Qwen2.5-7B-Instruct, revision `acbd96531cda22292a3ceaa67e984955d3965282` [Qwen Team (2025)](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/tree/acbd96531cda22292a3ceaa67e984955d3965282) |
| inference engine | vLLM OpenAI server, version 0.28.0 [vLLM Project (2026)](https://docs.vllm.ai/en/v0.28.0/deployment/docker/) |
| target accelerator | one NVIDIA L4 |
| clock profile | five requested graphics clocks; realized clock, power, utilization, and temperature retained |
| request trace | first five minutes for evaluation; first 20 requests for the animation |
| controller sampling | one second |
| service simulation | 0.1-second steps; decode priority or one prefill chunk first; unused prefill capacity may return to decode |
| output length | hidden from the controller until completion |

Within each one-second clock-control period, the scheduler gives each 0.1-second simulator step to decode or begins it with one prefill chunk. If that chunk finishes before the step’s service budget is exhausted, the remaining capacity returns to decode. When both phases have work, active decode receives alternating-step priority and strict priority under high cache pressure. The **512-token interleaved chunked-prefill** rule specifies the teaching model’s action channel; it does not reproduce vLLM’s mixed-batch scheduler or Sarathi-Serve.

<a id="recorded-replay-and-scope"></a>

#### Recorded Replay and Scope

The first 20 requests form the recorded replay below. They move through arrival, interleaved 512-token prefill chunks, autoregressive decode, and completion. The plots report only the trajectory prefix reached by the playhead, and output length is hidden from the controller until each request completes. A provenance badge distinguishes a verified measured profile from a pre-measurement engineering surrogate.

<a id="AAkLhOiMz1"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from inference_replay import render_serving_replay

display(HTML(render_serving_replay(
    Path("artifacts/inference_serving/textbook_results.json"),
    view="modeling",
)))
```

Loading...

<a id="fig-inference-serving-model-fallback"></a>

<a id="HyPECzEadT"></a>
![Line charts of unfinished requests and realized GPU clock for the 20-request modeling replay.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/4320a5ebb1-modeling-ac1a5c2302fd2fd70a3b7dc99cbad041.svg)

[Figure 3:](#fig-inference-serving-model-fallback "Link to this figure")Static summary of unfinished requests and realized clock from the same request-level simulation. The online book provides playback, stepping, scrubbing, phase detail, and controller selection.

Conservation checks account for every request, processed token, and cache allocation. At the end of the committed replay, all 20 requests have completed, the prefill and decode queues are empty, and all modeled cache occupancy has been released. This establishes closure of the modeled flows. It does not show that the aggregate variables are Markov for the request-level plant, nor that the service-rate, power, or thermal maps are accurate. A provisional profile permits tests of the simulation and control software but does not supply empirical latency or energy evidence. In either case, the model does not cover every inference engine or GPU. Network transfer, host-side tokenization, multi-GPU communication, model-quality effects, and failures outside the serving process remain outside the boundary.

Inspect the request-level transition

inference\_serving.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
```

[Download the complete inference-serving model](https://pierrelucbacon.com/rlbook/build/inference_serving-a97ceb70b51a0e213a87632e9bcd954e.py)

<a id="censoring-in-completed-trip-logs"></a>

### Censoring in Completed-Trip Logs

The inference example can generate new trajectories from a simulator or live process. The BIXI archive supplies a more restrictive interface: a fixed log of completed trips. The distinction matters because a completed-event log records what the system served, not every request that users attempted. A completed rental proves that a bicycle was available, but an empty station leaves no trip record for a customer who could not depart. A completed return similarly proves that a dock was available without counting customers who found the station full.

<a id="fig-bixi-completed-trip-censoring"></a>

<a id="th49DS65Kg"></a>
![Two attempted-demand histories produce the same BIXI completed-trip log because extra attempts occur while a station is empty.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/344ed127e7-bixi-completed-trip--f4946e8542c4c8d21ca2b3e9418dd6b4.svg)

[Figure 4:](#fig-bixi-completed-trip-censoring "Link to this figure")Two worlds can produce the same completed-trip log. In the second world, additional customers attempt to rent while the station is empty. The log cannot identify those censored attempts.

The public station-status feed can report current inventories while it is running, but it does not provide an action channel for relocating bicycles. Historical completed trips omit unsuccessful demand, past station inventories, and operator movements. A fitted arrival model can be useful, but evaluating a new relocation policy from these logs requires assumptions about the missing attempts and about how operations generated the observed data. The executable BIXI example keeps those assumptions visible by declaring an attempted-demand model and recording every rejected event.

Inspect the logged-data counterexample

bixi\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
```
<a id="language-generation-as-a-sequential-system"></a>

### Language Generation as a Sequential System

The distinction between a transition model and a policy can also be obscured when one software object appears to generate an entire trajectory. Autoregressive language generation separates the two. For a fixed prompt $p$, let

<a id="w9HgpLvIFY"></a>

$$
s_t=(p,y_1,\ldots,y_{t-1}),
\qquad
a_t=y_t.
$$

[(6)](#w9HgpLvIFY "Link to this Equation")

The base transition appends the selected token,

<a id="aGkqjcazPK"></a>

$$
s_{t+1}=\operatorname{concat}(s_t,a_t).
$$

[(7)](#aGkqjcazPK "Link to this Equation")

This transition is deterministic once the token is chosen; uncertainty comes from the token policy $\pi(a_t\mid s_t)$. A language model therefore supplies a policy, while the prefix update supplies the transition. A reward or preference model is an additional object rather than an inherent property of text generation.

The simplified boundary changes when the model calls tools, receives new user messages, or interacts with an external application. Tool outputs and user responses then become observations generated by an environment outside the prefix concatenation rule. Context truncation also requires the retained context or memory state to be specified explicitly.

The interface determines which data and counterfactual queries are available. The remaining modeling decision is which transition structure should be fixed and which components should be estimated from those data.

<a id="known-structure-and-learned-components"></a>

## Known Structure and Learned Components

When data expose a mismatch, which model components should be recalibrated and which conservation laws, geometry, and constraints should remain explicit?

Uncertainty in one component does not require replacing the entire model. One can retain the known transition and learn only the discrepancy between its prediction and the observed next state:

<a id="z8LF7j3nGI"></a>

$$
x_{t+1}=f_{\mathrm{known}}(x_t,u_t)
+r_\theta(x_t,u_t,\eta_t)+\xi_t.
$$

[(8)](#z8LF7j3nGI "Link to this Equation")

The correction $r_\theta$ is called a **learned residual** because it accounts for what remains after the known model has made its prediction. The context vector $\eta_t$ may contain weather, payload information, or other measured conditions. This residual has a narrower task than a complete black-box transition.

| system | retained structure | plausible learned component | model-audit experiment |
| --- | --- | --- | --- |
| swing | internal actuation and unilateral tension | rider, damping, and contact-loss parameters | measure the first slack event |
| bicycle corridor | inventory and truck conservation, dock and truck capacities | attempted-demand distribution and travel times | introduce a declared demand shock |
| camera gimbal | rigid-body dynamics, torque limit, and sensor geometry | gyro-bias evolution or disturbance model | separate mechanical rotation from base translation |
| inference service | request, token, and cache conservation | service-rate, power, and thermal residuals | hold out prompt lengths, clocks, and concurrency levels |
| battery cell | charge balance, equivalent circuit, and thermal conservation | resistance change | apply a diagnostic current pulse, then repeat the charge |

<a id="fast-charging-when-resistance-drifts"></a>

### Fast Charging When Resistance Drifts

The battery case separates a known model structure from one changed parameter. Charge balance, circuit topology, and thermal conservation remain fixed, while a short current pulse estimates a resistance scale that affects safe charging. This separation makes it possible to ask whether a targeted calibration can correct a specific prediction error without relearning the entire transition.

Charge balance determines how current changes the state of charge. With the book’s charge-positive sign convention,

<a id="SJtRCspqFX"></a>

$$
\dot z=\frac{I}{3600Q},
$$

[(9)](#SJtRCspqFX "Link to this Equation")

where $z$ is the state of charge, $I$ is charging current in amperes, and $Q$ is cell capacity in ampere-hours. A 5 Ah cell charged at 10 A would move from 20 to 80 percent in

<a id="SJim91Sink"></a>

$$
\frac{0.6(5\ \mathrm{Ah})}{10\ \mathrm A}
=0.3\ \mathrm h
=18\ \mathrm{min},
$$

[(10)](#SJim91Sink "Link to this Equation")

if this were the only relevant equation. Terminal voltage and temperature can restrict the current before that charge target is reached.

Terminal voltage cannot be predicted from charge balance alone because current also produces an immediate resistive rise and a slower polarization response. The reference process represents those two responses with PyBaMM’s documented [one-RC Thévenin model](https://docs.pybamm.org/en/v26.6.2.0/source/api/models/equivalent_circuit/thevenin.html) [Sulzer _et al._ (2021)](https://doi.org/10.5334/jors.309)[Barletta _et al._ (2022)](https://doi.org/10.3390/en15176207). It also uses two lumped thermal states, treating the cell and its fixture as objects with one uniform temperature each. Its state contains $x=(z,v_p,T_c,T_j)$: state of charge, polarization voltage, cell temperature, and jig temperature. The jig is the surrounding fixture with which the cell exchanges heat. The electrical model uses an open-circuit voltage $U_{\mathrm{oc}}(z)$, the cell voltage when no current flows, a series resistance $R_0$, and an $R_1$\--$C_1$ branch containing one resistor and one capacitor. Its voltage $v_p$ changes on the time scale $R_1C_1$, so it represents slower polarization behavior. With $V$ denoting terminal voltage, the charge-positive equations are

<a id="J4JVSqlPSO"></a>

$$
\dot v_p=-\frac{v_p}{R_1C_1}+\frac{I}{C_1},
\qquad
V=U_{\mathrm{oc}}(z)+v_p+IR_0.
$$

[(11)](#J4JVSqlPSO "Link to this Equation")

PyBaMM treats positive current as discharge, so the implementation changes the sign of the positive charging current used in these equations.

The calibration begins with a controlled experiment rather than a full charge. The cell rests at $I=0$ for 20 seconds, receives a commanded 5 A charge current for 10 seconds, and then rests for another 40 seconds. Samples are recorded every 0.5 seconds. Switching the current on produces an immediate voltage jump through $R_0$, followed by the slower voltage response $v_p$ of the RC branch. Switching it off exposes the decay of that slower response. The pulse is therefore a deliberately chosen input that makes the resistive part of the model visible in the voltage trace.

The committed diagnostic record contains the commanded current, simulated state of charge, and terminal voltage. Independent Gaussian sensor noise with a standard deviation of 1 mV and seed 11 is added to the voltage. This fit does not use temperature measurements. Cell and jig temperatures are monitored in the subsequent full-charge runs, while their model parameters remain fixed.

The nominal circuit uses $R_0=15$ m$\Omega$, $R_1=10$ m$\Omega$, and $C_1=2400$ F. The calibration allows only the following one-parameter change:

<a id="ZZKt9ZT5iZ"></a>

$$
R_0(\alpha)=\alpha R_0,
\qquad
R_1(\alpha)=\alpha R_1,
\qquad
C_1(\alpha)=\frac{C_1}{\alpha}.
$$

[(12)](#ZZKt9ZT5iZ "Link to this Equation")

The dimensionless multiplier $\alpha$ measures resistance relative to the nominal circuit. Thus $\alpha=1$ is the nominal cell, and $\alpha=1.8$ makes both resistances 80 percent larger. The inverse change in $C_1$ keeps the RC time constant $R_1C_1$ at 24 seconds. It is a controlled way to isolate the amplitude of the resistive response, not a claim that all aging changes these three components in this proportion.

Under this restriction, the pulse voltage is linear in $\alpha$. Let $\bar v_{p,k}$ denote the polarization voltage predicted at sample $k$ by the nominal RC branch, driven by the known current $I_k$. Define the measured voltage above open circuit and the nominal model’s prediction for that excess voltage as

<a id="n2YjqEn61Z"></a>

$$
y_k=V_k^{\mathrm{meas}}-U_{\mathrm{oc}}(z_k),
\qquad
\phi_k=I_kR_0+\bar v_{p,k}.
$$

[(13)](#n2YjqEn61Z "Link to this Equation")

Thus $y_k$ is the excess voltage observed at sample $k$, while $\phi_k$ is the excess voltage predicted when the resistance scale is one.

Because the scaled branch has the same time constant and starts from rest, $v_{p,k}=\alpha\bar v_{p,k}$. With $\epsilon_k$ denoting voltage-measurement noise, the measured samples therefore satisfy

<a id="s5OIihsbvI"></a>

$$
y_k=\alpha\phi_k+\epsilon_k.
$$

[(14)](#s5OIihsbvI "Link to this Equation")

The estimate chooses the value of $\alpha$ that makes the sum of squared voltage prediction errors as small as possible, while restricting the value to a plausible interval:

<a id="pF3wnynKWk"></a>

$$
\hat\alpha
=\underset{0.7\leq a\leq2.5}{\arg\min}
\sum_{k:\,|\phi_k|>10^{-8}\,\mathrm V}
\left(y_k-a\phi_k\right)^2.
$$

[(15)](#pF3wnynKWk "Link to this Equation")

Before the pulse, both $I_k$ and $\bar v_{p,k}$ are zero, so those resting samples contain no information about $\alpha$. The current step makes $\phi_k$ nonzero, and the relaxation after the step supplies additional samples. This experiment can identify the common multiplier because it is the only unknown in the fit: the ratio $R_0/R_1$ and the time constant are fixed. It cannot separately estimate $R_0$, $R_1$, and $C_1$.

The fitted value enters the charging rule as the controller’s resistance estimate $\hat\alpha$. A **current governor** is a local safety rule that maps the present estimated state to an allowable current request. At each one-second control update, the governor receives the simulated values of $z$, $v_p$, and $T_c$ and requests the largest current inside three limits. Let $[q]_+=\max(q,0)$ and let $h_{cj}=0.55$ W/K denote the modeled cell-to-jig heat-transfer coefficient. The rule is

<a id="ewg7jW8Zps"></a>

$$
I=\min\left\{
10,
\left[\frac{4.17-U_{\mathrm{oc}}(z)-v_p}{\hat\alpha R_0}\right]_+,
\sqrt{\left[
\frac{h_{cj}(34.5-T_c)}{\hat\alpha(R_0+R_1)}
\right]_+}
\right\}.
$$

[(16)](#ewg7jW8Zps "Link to this Equation")

The first entry is the 10 A hardware limit. The second prevents the model’s instantaneous terminal-voltage prediction from exceeding its 4.17 V guard. The third starts from the remaining temperature margin, $34.5-T_c$. Multiplying that margin by $h_{cj}$ gives a simple allowance for resistive heating, modeled here as $I^2\hat\alpha(R_0+R_1)$. Solving this inequality for $I$ gives the square-root ceiling in the rule. This ceiling is conservative; it does not forecast the future temperature trajectory. The simulated plant itself is checked against the bounds of 4.20 V and 35 degrees Celsius. A larger fitted resistance lowers both the voltage-based and temperature-based current ceilings.

This governor is a fixed local rule, not an optimization over a future current sequence. Constrained fast charging also motivates richer predictive-control methods [Gonzalez-Saenz & Becerra (2024)](https://doi.org/10.3390/en17061470).

The three matched runs ask whether the governor reaches the charge target while respecting its bounds on the reference plant, whether the stale model preserves the voltage margin after resistance changes, and whether updating one parameter restores that margin.

| run | plant scale $\alpha$ | governor scale $\hat\alpha$ |
| --- | --- | --- |
| fresh, nominal | 1.0 | 1.0 |
| high resistance, stale | 1.8 | 1.0 |
| high resistance, calibrated | 1.8 | fitted from the pulse |

The recorded battery audit compares the three matched runs through charge, terminal voltage, cell temperature, and requested current. Each trace displays only the prefix reached by the playhead. Event controls seek to the first current taper, the first plant-bound violation, and the 80 percent target when those events exist.

<a id="m52E0ntpOR"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from battery_replay import render_battery_replay

display(HTML(render_battery_replay(
    Path("artifacts/battery/textbook_results.json"),
    replay_id="battery-fast-charging-replay",
    fallback_id="fig-battery-fast-charging-fallback",
)))
```

Loading...

<a id="fig-battery-fast-charging-fallback"></a>

<a id="wgKCzfdDXj"></a>
![State of charge, voltage, temperature, and current for a fresh cell, a high-resistance cell controlled by a stale model, and the same cell after resistance calibration.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/676cde808f-fast-charging-9f9dfea31ffc4a132435cd979c3aa6f1.svg)

[Figure 5:](#fig-battery-fast-charging-fallback "Link to this figure")The stale model loses its voltage margin after resistance changes. Updating one fitted resistance scale restores the tested margin at the cost of a longer charge. The online book adds synchronized playback and event seeking.

The pulse-response fit gives alpha = 1.8005. Within the declared one-parameter model, this means that R0 and R1 are estimated to be 1.8005 times their nominal values. The fitted voltage trace has an RMSE of 0.94 mV. The fresh plant reaches the target in 18.52 minutes. The stale model reaches the charge target in 22.26 minutes, but its voltage exceeds 4.20 V for 245.5 seconds and peaks at 4.251 V. The fitted model takes 25.64 minutes and remains inside both plant bounds.

Time above the voltage bound uses linear interpolation at the threshold crossings. The 35 degree C plant bound is never reached, but the conservative 34.5 degree C local thermal-headroom envelope does limit requested current. These are results for a declared teaching cell and a controlled high-resistance counterfactual, not charging guidance for a product.

Within this declared simulation, the comparison supports a narrow conclusion: when the plant differs from the controller model by exactly the common resistance scale above, the pulse estimates that scale well enough for the same governor to remain inside the tested voltage and temperature bounds. The fit changes the predicted voltage drop and resistive heat for a candidate current; it does not replace charge conservation, the circuit topology, or the thermal states.

The comparison does not establish a safe charging rule for a physical product. Every run gives the governor the exact simulated state, so it does not test state estimation. One fitted scale also cannot represent capacity fade, lithium plating, an incorrect open-circuit-voltage curve, sensor bias, spatial temperature gradients, or other electrochemical degradation mechanisms.

[Model Predictive Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md) will optimize an entire future input sequence under state and input constraints. The governor here evaluates a fixed, local current rule so that the consequence of changing one model parameter remains visible.

Inspect the local governor and one-parameter fit

battery\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
```

battery\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
```

[Download the complete battery model audit](https://pierrelucbacon.com/rlbook/build/battery_control-42af00ad99845247b1fc434d793795c5.py)

[Download the recorded replay renderer](https://pierrelucbacon.com/rlbook/build/battery_replay-3719b4db7c1a07b0a3481d7c7c6075f5.py)

Generated simulator or controller code may execute while representing the wrong action, omitting a physical mode, or leaving a safety requirement outside the objective and constraints. Execution tests software behavior. Claims about the target system require inspection of the model and evidence from interventions that expose the disputed assumption.

A residual cannot repair a missing action channel or a missing physical mode if the training data never contains evidence of it. The SwingRL comparison exposed the failure by changing the suspension model while holding the controller fixed. Comparable interventions are needed to decide which structure should remain and which component should be learned.

<a id="exercises"></a>

## Exercises

<a id="ex-dynamics-cache-balance"></a>

[Exercise 1](#ex-dynamics-cache-balance "Link to this Exercise") (Aggregate cache state)

For the inference service, write an aggregate cache balance that distinguishes occupancy added while prompt and output tokens are processed, reserve added when a request enters decode, and occupancy released at request completion. Give one reason why the aggregate total may be insufficient for prediction.

Solution to [Exercise 1](#ex-dynamics-cache-balance)

One balance consistent with the teaching abstraction is

<a id="Yilxrm7PjY"></a>

$$
m_{t+1}=m_t+C_t^p+C_t^d+rN_t^p
-\sum_{j\in\mathcal C_t}L_{j,t},
$$

[(17)](#Yilxrm7PjY "Link to this Equation")

where $C_t^p$ and $C_t^d$ are processed prompt and decode tokens, $rN_t^p$ is the fixed reserve for requests entering decode, $\mathcal C_t$ is the set that completes, and $L_{j,t}$ is all occupancy released by completed request $j$. Equal totals can hide different per-request remaining output lengths, so future completion and cache-release times can differ.

<a id="ex-dynamics-interface-capabilities"></a>

[Exercise 2](#ex-dynamics-interface-capabilities "Link to this Exercise") (Capabilities of three model interfaces)

For a differentiable ODE solver, a reset-and-step robotics simulator, and a fixed table of logged transitions, list the operations each exposes. Name one method from the book that each interface directly supports.

Solution to [Exercise 2](#ex-dynamics-interface-capabilities)

The differentiable ODE solver supports chosen-input rollouts and derivatives of those rollouts, which can support shooting or gradient-based MPC. The reset-and-step simulator supports counterfactual sampled rollouts from chosen states and actions, which can support simulation-based MPC, Monte Carlo evaluation, or policy learning. Logged transitions support fitting and evaluation on their recorded distribution, including system identification or fitted Q iteration, but do not by themselves answer arbitrary counterfactual queries.

<a id="ex-dynamics-language-transition"></a>

[Exercise 3](#ex-dynamics-language-transition "Link to this Exercise") (Text generation: transition or policy?)

For autoregressive language generation, distinguish the environment transition from the token policy. How does the model change when a tool call returns information from an external database?

Solution to [Exercise 3](#ex-dynamics-language-transition)

For a closed text prefix, the transition is deterministic concatenation, $s_{t+1}=\operatorname{concat}(s_t,a_t)$, while the language model supplies the token distribution $\pi(a_t\mid s_t)$. A tool call crosses that boundary. The returned value is an external observation, and the state must retain whatever tool result or interaction history is needed to predict subsequent transitions.

<a id="ex-dynamics-bixi-censoring"></a>

[Exercise 4](#ex-dynamics-bixi-censoring "Link to this Exercise") (Censoring at an empty station)

Starting from the completed-trip counterexample, add one rental attempt while the station is empty. Why does latent demand change while the completed-trip log remains unchanged?

Solution to [Exercise 4](#ex-dynamics-bixi-censoring)

The additional customer cannot depart because no bicycle is available. The attempt therefore raises demand by one but generates no completed rental record. Both worlds produce the same observed trip log even though their attempted-demand histories differ.

<a id="ex-dynamics-inference-dilation"></a>

[Exercise 5](#ex-dynamics-inference-dilation "Link to this Exercise") (Offered-load sensitivity)

Use `data/inference_serving/azure_code_evaluation.csv` and `normalize_offered_load` from `code/inference_serving.py`. Recompute the offered-load dilation after omitting the ten requests with the longest prompts. Which model quantities change, and which conservation equations remain unchanged?

Solution to [Exercise 5](#ex-dynamics-inference-dilation)

The ten removed prompts each contain 7,436 tokens. For the committed profile, the dilation changes from

<a id="Pjfs4knhL9"></a>

$$
3.5538284803\quad\text{to}\quad3.4524186516.
$$

[(18)](#Pjfs4knhL9 "Link to this Equation")

The isolated-service total, normalized arrival times, and exogenous request sequence change. The algebraic form of the request, token, cache, and thermal balances does not.

<a id="ex-dynamics-battery-calibration"></a>

[Exercise 6](#ex-dynamics-battery-calibration "Link to this Exercise") (Battery calibration)

Ignoring voltage and temperature, derive the ideal time needed to move a $5\ \mathrm{Ah}$ cell from 20 to 80 percent state of charge at $10\ \mathrm A$. Then use the Thévenin output equation to explain why a governor with a stale resistance estimate can violate the voltage bound even though charge conservation is correct. Which structure should remain fixed, and which quantity can be estimated from the known current pulse and measured voltage?

Solution to [Exercise 6](#ex-dynamics-battery-calibration)

The required charge is $0.6(5\ \mathrm{Ah})=3\ \mathrm{Ah}$, so

<a id="IczJOcdORE"></a>

$$
\Delta t=\frac{3\ \mathrm{Ah}}{10\ \mathrm A}
=0.3\ \mathrm h=18\ \mathrm{min}.
$$

[(19)](#IczJOcdORE "Link to this Equation")

Because $V=U_{\mathrm{oc}}+v_p+IR_0$, underestimated resistance makes the governor underpredict terminal voltage and request too much current. Charge conservation, the circuit topology, and the thermal equations remain fixed. During the known 5 A pulse, the immediate voltage jump and slower relaxation make the resistive response visible. Fitting that response estimates the one allowed unknown, $\alpha$, where $R_0$ and $R_1$ are $\alpha$ times their nominal values and $C_1$ is divided by $\alpha$. The experiment updates this single controller parameter; it does not relearn the balance equations or separately identify all three circuit elements.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Equations, reset-and-step simulators, logged transitions, and interactive environments expose different operations even when they describe the same nominal evolution. Known balances and constraints can remain explicit while data estimate uncertain parameters, residual dynamics, values, or policies. The battery example makes the division concrete: the circuit and thermal balances remain fixed while one resistance factor is recalibrated.

A model interface can now generate or constrain candidate trajectories. Which admissible action sequence performs best from a given initial condition? [The finite-horizon optimal-control problem](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md) is the first answer, and it remains open loop until later measurements are allowed to change the decision.

<a id="computational-sources"></a>

## Computational Sources

The SwingRL dependency is pinned to commit [`d579663`](https://github.com/pierrelux/swing-rl/commit/d579663fc81c044729f4d3ab60bf63bcdbd27b9a). The three modeling chapters execute domain code and read committed experiment artifacts:

-   [SwingRL controller and model audit](https://pierrelucbacon.com/rlbook/build/swing_control-71b2d30e643ba40b27f7237a540015bd.py)
    
-   [BIXI inventory model and controllers](https://pierrelucbacon.com/rlbook/build/bixi_control-c5fc44d4361eba917395bf1d64ee2b16.py)
    
-   [BIXI recorded replay renderer](https://pierrelucbacon.com/rlbook/build/bixi_replay-e923b65be79d676945decce8e73bda83.py)
    
-   [Camera-gimbal plant, estimators, and controller](https://pierrelucbacon.com/rlbook/build/gimbal_control-fa8228dcab354ac53e8247e502818ebf.py)
    
-   [Camera-gimbal recorded replay renderer](https://pierrelucbacon.com/rlbook/build/gimbal_replay-2c643ed2db645692aca4e7c3bfa0c581.py)
    
-   [Battery model audit and parameter fit](https://pierrelucbacon.com/rlbook/build/battery_control-42af00ad99845247b1fc434d793795c5.py)
    
-   [Battery recorded replay renderer](https://pierrelucbacon.com/rlbook/build/battery_replay-3719b4db7c1a07b0a3481d7c7c6075f5.py)
    
-   [Battery diagnostic pulse](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/ea067f1326-diagnostic_pulse-226054abb1960e73dafc94f9472e0597.csv)
    
-   [Battery recorded trajectories](https://pierrelucbacon.com/rlbook/build/trajectories-6ee3ee48d39e2087cd7643675813d193.npz) and [browser replay data](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/6a8c04ae56-textbook_results-58b2e6e731d804132ef1bbdc1e5d5029.json)
    
-   [Battery artifact manifest](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/b03487b571-manifest-221e59e77988c50944d1418773dc9a9d.json)
    
-   [Conceptual-figure generator](https://pierrelucbacon.com/rlbook/build/modeling_interfaces-37474f8995c615767b4411831ab0e36f.py)
    
-   [Sampling-and-integration SVG](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/d2eacf12b6-sampling-and-integra-d442468b357267f89def2053c2b8f63a.svg)
    
-   [Open-loop and feedback SVG](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/7e36c1ed0b-open-loop-vs-feedbac-9ab83bb9f992dbbc9e4765b57bdc07a2.svg)
    
-   [Swing-coordinate SVG](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/590cc9bf60-swing-reduced-coordi-c9914f636583e2a0c7a3246eb6fccc3c.svg)
    
-   [Inference-serving boundary SVG](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/00e0a1430b-inference-serving-bo-8a67a6a85379fa2222bc62b552cc9ab2.svg)
    
-   [Inference-serving model](https://pierrelucbacon.com/rlbook/build/inference_serving-a97ceb70b51a0e213a87632e9bcd954e.py)
    
-   [Inference replay renderer](https://pierrelucbacon.com/rlbook/build/inference_replay-3bb4e9ae85a9d2b39725c1c4e2954185.py)
    

The animation controls are embedded in the static site and require no live Python kernel.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-yu2022orca"></a>
2.  Yu, G.-I., Jeong, J. S., Kim, G.-W., Kim, S., & Chun, B.-G. (2022). Orca: A Distributed Serving System for Transformer-Based Generative Models. _16th USENIX Symposium on Operating Systems Design and Implementation (OSDI 22)_, 521–538. [https://www.usenix.org/conference/osdi22/presentation/yu](https://www.usenix.org/conference/osdi22/presentation/yu)
<a id="cite-agrawal2024sarathi"></a>
4.  Agrawal, A., Kedia, N., Panwar, A., Mohan, J., Kwatra, N., Gulavani, B. S., Tumanov, A., & Ramjee, R. (2024). Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve. _18th USENIX Symposium on Operating Systems Design and Implementation (OSDI 24)_, 117–134. [https://www.usenix.org/conference/osdi24/presentation/agrawal](https://www.usenix.org/conference/osdi24/presentation/agrawal)
<a id="cite-nvidiaSmi2026"></a>
6.  NVIDIA Corporation. (2026). _NVIDIA System Management Interface: nvidia-smi_. [https://docs.nvidia.com/deploy/nvidia-smi/index.html](https://docs.nvidia.com/deploy/nvidia-smi/index.html)
<a id="cite-qwen25report"></a>
8.  Qwen Team. (2025). Qwen2.5 Technical Report. _arXiv Preprint arXiv:2412.15115_. [https://arxiv.org/abs/2412.15115](https://arxiv.org/abs/2412.15115)
<a id="cite-kwon2023vllm"></a>
10.  Kwon, W., Li, Z., Zhuang, S., Sheng, Y., Zheng, L., Yu, C. H., Gonzalez, J. E., Zhang, H., & Stoica, I. (2023). Efficient Memory Management for Large Language Model Serving with PagedAttention. _Proceedings of the 29th Symposium on Operating Systems Principles_, 611–626. [10.1145/3600006.3613165](https://doi.org/10.1145/3600006.3613165)
<a id="cite-azureLLMTrace2023"></a>
12.  Microsoft Azure. (2023). _Azure LLM Inference Dataset 2023_. Azure Public Dataset. [https://github.com/Azure/AzurePublicDataset/blob/master/AzureLLMInferenceDataset2023.md](https://github.com/Azure/AzurePublicDataset/blob/master/AzureLLMInferenceDataset2023.md)
<a id="cite-patel2024splitwise"></a>
14.  Patel, P., Choukse, E., Zhang, C., Shah, A., Goiri, Í., Maleki, S., & Bianchini, R. (2024). Splitwise: Efficient Generative LLM Inference Using Phase Splitting. _Proceedings of the 51st Annual International Symposium on Computer Architecture (ISCA)_. [https://www.microsoft.com/en-us/research/publication/splitwise-efficient-generative-llm-inference-using-phase-splitting/](https://www.microsoft.com/en-us/research/publication/splitwise-efficient-generative-llm-inference-using-phase-splitting/)
<a id="cite-qwen25modelcard"></a>
16.  Qwen Team. (2025). _Qwen2.5-7B-Instruct, revision acbd96531cda22292a3ceaa67e984955d3965282_. Hugging Face model repository. [https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/tree/acbd96531cda22292a3ceaa67e984955d3965282](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/tree/acbd96531cda22292a3ceaa67e984955d3965282)
<a id="cite-vllmDocker028"></a>
18.  vLLM Project. (2026). _Using Docker with vLLM, version 0.28.0_. [https://docs.vllm.ai/en/v0.28.0/deployment/docker/](https://docs.vllm.ai/en/v0.28.0/deployment/docker/)
<a id="cite-sulzer2021pybamm"></a>
20.  Sulzer, V., Marquis, S. G., Timms, R., Robinson, M., & Chapman, S. J. (2021). Python Battery Mathematical Modelling (PyBaMM). _Journal of Open Research Software_, _9_(1), 14. [10.5334/jors.309](https://doi.org/10.5334/jors.309)
<a id="cite-barletta2022thevenin"></a>
22.  Barletta, G., Di Prima, P., & Papurello, D. (2022). Thévenin’s Battery Model Parameter Estimation Based on Simulink. _Energies_, _15_(17), 6207. [10.3390/en15176207](https://doi.org/10.3390/en15176207)
<a id="cite-gonzalezSaenz2024fastCharging"></a>
24.  Gonzalez-Saenz, J., & Becerra, V. (2024). Determining Fast Battery Charging Profiles Using an Equivalent Circuit Model and a Direct Optimal Control Approach. _Energies_, _17_(6), 1470. [10.3390/en17061470](https://doi.org/10.3390/en17061470)

[

Modeling Sequential Decisions

Stochastic Dynamics and Partial Observation


](04-stochastic-dynamics-observation.md)[

Open-Loop Optimal Control

Finite-Horizon Optimal Control Problems


](06-discrete-time-optimal-control.md)


---

# CHAPITRE 06 — Finite-Horizon Optimal Control Problems

Section du livre : Open-Loop Optimal Control

Page originale : https://pierrelucbacon.com/rlbook/discrete-time-optimal-control

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md

> **Cours de Pierre-Luc Bacon — 06.** [Page publiée](https://pierrelucbacon.com/rlbook/discrete-time-optimal-control) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/06-discrete-time-optimal-control.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Finite-Horizon Optimal Control Problems

<a id="skip-to-article"></a>

The models introduced in the previous chapter predict how actions change a system’s state. Trajectory optimization adds an objective and constraints, then selects the actions that produce a desirable state sequence. For a fixed discrete horizon, the states and controls form a finite vector, so the planning problem can be written as a nonlinear program.

Which finite-dimensional optimization problem selects the best admissible trajectory from one known initial condition?

A **trajectory** is the time-indexed sequence of states $(\mathbf{x}_1,\ldots,\mathbf{x}_T)$ and controls $(\mathbf{u}_1,\ldots,\mathbf{u}_{T-1})$. This chapter first computes the complete control sequence from a known initial state. The sequence is **open loop**: once execution begins, the action at time $t$ does not change in response to the measured state.

The three-satellite example below makes both the value and the limitation of open-loop planning visible. A linear model produces a sparse, feasible plan, but the same immutable plan misses its target when replayed through a nonlinear model. Later chapters will replace the fixed sequence by feedback through receding-horizon control and policies.

Learning Goals

After studying this chapter, you should be able to:

1.  Formulate a discrete-time optimal control problem (DOCP) in Bolza, Lagrange, and Mayer forms, and convert between them.
    
2.  State the KKT conditions for a constrained NLP and explain the role of constraint qualifications.
    
3.  Derive the discrete-time Pontryagin principle from the Lagrangian of a DOCP.
    
4.  Implement single shooting and multiple shooting methods for trajectory optimization.
    
5.  Explain the trade-offs between simultaneous (direct transcription) and sequential (shooting) methods.
    
6.  Compute gradients of the objective with respect to controls using the adjoint (costate) recursion.
    
7.  Audit an immutable open-loop plan under a specified model mismatch.
    

Prerequisites

This chapter uses gradients, Jacobians, the chain rule, matrix-vector products, and linear systems. [Nonlinear Programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/31-appendix-nlp.md) reviews the nonlinear-programming objects used in the KKT derivation. The state and transition models come from [Controlled Systems: Boundaries, States, and Actions](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md).

<a id="a-motivating-example-phasing-three-satellites-with-differential-drag"></a>

## A Motivating Example: Phasing Three Satellites with Differential Drag

What does an open-loop plan gain from a transparent finite-horizon model, and which part of its guarantee disappears when the replay model changes?

Three small satellites are released into nearly the same circular orbit, but the mission calls for them to occupy slots separated by $120^\circ$. They have no propulsion. Each satellite can instead rotate between low- and high-drag attitudes. High drag lowers its orbit slightly; the lower satellite then moves faster and accumulates phase relative to the others. The control authority is weak, slow, and irreversible because every maneuver spends altitude.

Differential drag has been used to phase propulsionless satellite constellations in orbit [Foster _et al._, 2018](https://doi.org/10.2514/1.A33927). Linear programs provide a useful planning model for this control mechanism [Sin _et al._, 2018](https://doi.org/10.23919/ACC.2018.8431408). The example below is a teaching-scale reconstruction inspired by that literature. It is not a reconstruction of a particular flight campaign.

We plan over $N=180$ daily intervals. All three satellites begin at a circular altitude of 475 km, with phase offsets

<a id="bSPCO2yx9I"></a>

$$
\varphi_{0}
=
\begin{bmatrix}-0.5&0&0.5\end{bmatrix}^{\mathsf T}\text{ degrees}
$$

[(1)](#bSPCO2yx9I "Link to this Equation")

and zero relative angular rates. The action

<a id="XqzrqVyg95"></a>

$$
0\leq u_{i,k}\leq1
$$

[(2)](#XqzrqVyg95 "Link to this Equation")

is the fraction of day $k$ that satellite $i$ spends in its high-drag attitude. For the nominal daily model, its state is

<a id="WyGTVpyZCv"></a>

$$
x_{i,k}
=
\begin{bmatrix}
\varphi_{i,k}\\
\omega_{i,k}\\
\ell_{i,k}
\end{bmatrix},
$$

[(3)](#WyGTVpyZCv "Link to this Equation")

where $\varphi$ is phase in degrees, $\omega$ is relative angular rate in degrees per day, and $\ell$ is extra altitude loss in kilometres relative to remaining in the low-drag attitude.

<a id="from-drag-physics-to-a-daily-linear-model"></a>

### From drag physics to a daily linear model

Use SI units in the derivation. With $h_0=475\text{ km}$, set

<a id="A0SJ3qPzt0"></a>

$$
a_0=(R_\mathrm{E}+h_0)\frac{10^3\text{ m}}{1\text{ km}}
=6{,}853{,}137\text{ m},
\qquad
n_0=\sqrt{\mu/a_0^3}.
$$

[(4)](#A0SJ3qPzt0 "Link to this Equation")

At the reference density $\rho_0$, changing the ballistic coefficient from $B_\mathrm{low}$ to $B_\mathrm{high}$ changes the area-to-mass factor by

<a id="FVqxhA8bmi"></a>

$$
\Delta\sigma
=\frac{1}{B_\mathrm{high}}-\frac{1}{B_\mathrm{low}}.
$$

[(5)](#FVqxhA8bmi "Link to this Equation")

Linearizing the semimajor-axis and mean-motion changes over one day gives

<a id="WSplYgGZVV"></a>

$$
\begin{aligned}
d
&=\rho_0\Delta\sigma\sqrt{\mu a_0}\,\Delta t
\left(\frac{1\ {\rm km}}{10^3\ {\rm m}}\right),\\
\alpha
&=\frac{3n_0}{2a_0}
\rho_0\Delta\sigma\sqrt{\mu a_0}\,\Delta t^2
\left(\frac{180^\circ}{\pi\ {\rm rad}}\right),
\end{aligned}
$$

[(6)](#WSplYgGZVV "Link to this Equation")

where $\Delta t=86400$ s. For

<a id="ZFSaJk6pLy"></a>

$$
\begin{gathered}
\rho_0=3\times10^{-13}\ {\rm kg/m^3},\qquad
B_\mathrm{low}=60\ {\rm kg/m^2},\qquad
B_\mathrm{high}=20\ {\rm kg/m^2},\\
R_\mathrm{E}=6378.137\ {\rm km},\qquad
\mu=3.986004418\times10^{14}\ {\rm m^3/s^2},
\end{gathered}
$$

[(7)](#ZFSaJk6pLy "Link to this Equation")

the coefficients are

<a id="lgSUltcnAU"></a>

$$
\alpha=0.0544503\ {\rm deg/day^2},
\qquad
d=0.0451572\ {\rm km/day}.
$$

[(8)](#lgSUltcnAU "Link to this Equation")

The daily dynamics are therefore

<a id="eIICosUom6"></a>

$$
x_{i,k+1}
=
\underbrace{
\begin{bmatrix}
1&1&0\\
0&1&0\\
0&0&1
\end{bmatrix}}_{A}
x_{i,k}
+
\underbrace{
\begin{bmatrix}
\alpha/2\\
\alpha\\
d
\end{bmatrix}}_{B}
u_{i,k}.
$$

[(9)](#eIICosUom6 "Link to this Equation")

The phase receives half of the new daily rate during the interval, the rate accumulates the drag-induced acceleration, and the extra altitude loss accumulates monotonically.

<a id="a-finite-open-loop-plan"></a>

### A finite open-loop plan

Define the cyclic difference matrix

<a id="KwCfyw34eE"></a>

$$
G=
\begin{bmatrix}
-1&1&0\\
0&-1&1\\
1&0&-1
\end{bmatrix}.
$$

[(10)](#KwCfyw34eE "Link to this Equation")

The terminal target is

<a id="dlFVH7aCCz"></a>

$$
G\varphi_N
\approx
\begin{bmatrix}120\\120\\-240\end{bmatrix}
\text{ degrees},
\qquad
G\omega_N\approx0,
$$

[(11)](#dlFVH7aCCz "Link to this Equation")

with tolerances of 0.1 degree and 0.002 degree per day. These are unwrapped directed differences. Because the rows of $G$ sum to zero, the third target is $-240^\circ$, which represents the same circular separation as $+120^\circ$ modulo $360^\circ$ while preserving a consistent unwrapped coordinate system.

The primary linear program minimizes the worst final extra altitude loss:

<a id="JmXCAjb6hH"></a>

$$
\begin{aligned}
\underset{x,u,z}{\operatorname{minimize}}\quad&z\\
\text{subject to}\quad&
x_{i,k+1}=Ax_{i,k}+Bu_{i,k},\\
&\ell_{i,N}\leq z,\qquad 0\leq u_{i,k}\leq1,\\
&\left\lVert G\varphi_N-
\begin{bmatrix}120&120&-240\end{bmatrix}^{\mathsf T}
\right\rVert_\infty\leq0.1,\\
&\lVert G\omega_N\rVert_\infty\leq0.002.
\end{aligned}
$$

[(12)](#JmXCAjb6hH "Link to this Equation")

A second linear program keeps $z$ at its primary optimum, up to numerical tolerance, and minimizes

<a id="ewJ9xcAXhm"></a>

$$
\sum_{i=1}^{3}\sum_{k=0}^{N-2}
\left|u_{i,k+1}-u_{i,k}\right|.
$$

[(13)](#ewJ9xcAXhm "Link to this Equation")

This lexicographic step selects a low-variation member of the primary optimal set without changing the worst-loss objective beyond numerical tolerance.

<a id="nominal-and-nonlinear-replay"></a>

### Nominal and nonlinear replay

The linear plan is first rolled out through the model used by the optimizer. The exact same $u_{i,k}$ is then replayed, without reoptimization, through the nonlinear orbital model

<a id="Pi4sQ0zNvR"></a>

$$
\dot a_i
=-\rho(a_i,t)\,\sigma(u_i)\sqrt{\mu a_i},
\qquad
\dot\theta_i
=\sqrt{\frac{\mu}{a_i^3}},
$$

[(14)](#Pi4sQ0zNvR "Link to this Equation")

where

<a id="XfZogxNcx2"></a>

$$
\begin{aligned}
\sigma(u)
&=\frac{1-u}{B_\mathrm{low}}+\frac{u}{B_\mathrm{high}},\\
\rho(a,t)
&=\rho_0
\left[
0.90+0.15\sin\left(\frac{2\pi t}{26\text{ days}}+\frac{\pi}{6}\right)
\right]
\exp\left(\frac{h_0-h_i}{60\text{ km}}\right),
\qquad
h_i=\frac{a_i-R_\mathrm{E}}{10^3}\text{ km}.
\end{aligned}
$$

[(15)](#XfZogxNcx2 "Link to this Equation")

Here $a_i$ and $R_\mathrm{E}$ are in metres inside the orbital equations, so $h_i$ is the corresponding altitude in kilometres. In the display, the nominal altitude trace is the planning-model proxy $475-\ell_i$ km and therefore omits the common low-drag decay; the nonlinear trace reports absolute orbital altitude.

The nonlinear trajectory is integrated by hourly RK4 and checked against a 30-minute replay. This variable-density model is a deterministic teaching stress test, not a flight-dynamics reconstruction. The complete command sequence is known from day zero; the state traces below are revealed only up to the playhead.

<a id="P7GSyvu9S1"></a>

<a id="fig-cubesat-differential-drag"></a>

<a id="fig-cubesat-differential-drag-code"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from cubesat_replay import render_cubesat_replay

display(HTML(render_cubesat_replay(
    Path("artifacts/cubesat/textbook_results.json"),
    replay_id="cubesat-differential-drag-replay",
    fallback_id="fig-cubesat-differential-drag-fallback",
)))
```

[Figure 1:](#fig-cubesat-differential-drag "Link to this figure")A single open-loop differential-drag plan is evaluated by two plant models. The nominal linear rollout reaches the cyclic slot and relative-rate tolerances. The nonlinear variable-density replay uses the unchanged plan and exposes the accumulated phase miss. The orbit diagrams use a fixed radius; altitude differences are reported numerically rather than exaggerated geometrically.

<a id="fig-cubesat-differential-drag-outputs"></a>

Loading...

<a id="fig-cubesat-differential-drag-fallback"></a>

<a id="McMUstEUjJ"></a>
![Nominal and nonlinear final constellation gaps, altitude loss, phase-error histories, and the common open-loop drag plan for three satellites.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/df3c57fdb3-differential-drag-9a14c08068aa92bd1adb5436ba59bb7e.svg)

[Figure 2:](#fig-cubesat-differential-drag-fallback "Link to this figure")Static audit of the immutable differential-drag plan. The online book adds synchronized playback and scrubbing while keeping the full planned command heatmap visible from the start.

The lexicographic solve limits the largest nominal extra altitude loss to 1.312323 km, then reduces total variation from 33.701181 to 2.000000 without changing that primary answer beyond the declared lock tolerance.

At day 180, the linear planning model reaches a maximum cyclic-gap error of $0.100000^\circ$ and a maximum cyclic relative rate of $0.002000^\circ/\mathrm{day}$. Replaying the identical command matrix through the variable-density model raises those values to $11.537412^\circ$ and $0.031144^\circ/\mathrm{day}$. The optimization result is therefore a statement about the planning model, not a guarantee for the replay model.

| spacecraft | high-drag equivalent (day) | duty | nominal final loss (km) | nonlinear final loss (km) | nonlinear altitude (km) |
| --- | --- | --- | --- | --- | --- |
| Leader | 29.024453 | 16.125% | 1.310664 | 1.262074 | 469.966466 |
| Follower 1 | 29.044961 | 16.136% | 1.311590 | 1.269299 | 469.959242 |
| Follower 2 | 29.061184 | 16.145% | 1.312323 | 1.287855 | 469.940685 |

| directed cyclic gap | target (degrees) | nominal final (degrees) | nominal error (degrees) | nonlinear final (degrees) | nonlinear error (degrees) |
| --- | --- | --- | --- | --- | --- |
| Leader to Follower 1 | 120.000 | 119.900000 | \-0.100000 | 113.231784 | \-6.768216 |
| Follower 1 to Follower 2 | 120.000 | 120.000000 | \-0.000000 | 115.230804 | \-4.769196 |
| Follower 2 to Leader | \-240.000 | \-239.900000 | 0.100000 | \-228.462588 | 11.537412 |

The hourly RK4 replay agrees with a 30-minute reference to within $3.101e-09^\circ$ in phase, $6.333e-11^\circ/\mathrm{day}$ in relative rate, and 3.183e-11 km in altitude. Its sampled density spans 2.264e-13 to 3.403e-13 kg/m³.

All 15 deterministic acceptance checks pass. This is a transparent stress test of one open-loop teaching model, not a flight-operations prescription.

[Download the open-loop plan (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/692b743c72-open_loop_plan-63d27294d07480cd724dcc861674a5b5.csv)

[Download the audit metrics (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/fffc58d678-metrics-52526989adf113cc41db588c9d2fd193.csv)

The nominal rollout establishes feasibility for the optimization model. The nonlinear replay tests the same plan under the declared model change, and the terminal phase constraints fail. [Closing the loop by replanning](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md#closing-the-loop-by-replanning) will replace the immutable schedule by controls that can change when new state measurements arrive.

The example already contains the ingredients of a **discrete-time optimal control problem** (DOCP): a state $x_{i,k}$, a bounded control $u_{i,k}$, a transition map, terminal constraints, and an objective accumulated over a finite horizon. We now formalize that structure.

<a id="discrete-time-optimal-control-problems-docps"></a>

## Discrete-Time Optimal Control Problems (DOCPs)

Which variables, costs, dynamics, and constraints place the satellite planner inside a reusable finite-horizon control template?

Consider a system described by a **state** $\mathbf{x}_t \in \mathbb{R}^n$, summarizing everything needed to predict its evolution. At each stage $t$, we can influence the system through a **control input** $\mathbf{u}_t \in \mathbb{R}^m$. The dynamics specify how the state evolves:

<a id="OTwjPR4dIP"></a>

$$
\mathbf{x}_{t+1} = \mathbf{f}_t(\mathbf{x}_t, \mathbf{u}_t),
$$

[(16)](#OTwjPR4dIP "Link to this Equation")

where $\mathbf{f}_t$ may be nonlinear or time-varying. We assume the initial state $\mathbf{x}_1$ is known.

The goal is to pick a sequence of controls $\mathbf{u}_1,\dots,\mathbf{u}_{T-1}$ that makes the trajectory desirable. But desirable in what sense? That depends on an **objective function**, which often includes two components:

<a id="KaabskmPe3"></a>

$$
\text{(i) stage cost: } c_t(\mathbf{x}_t,\mathbf{u}_t), \qquad \text{(ii) terminal cost: } c_T(\mathbf{x}_T).
$$

[(17)](#KaabskmPe3 "Link to this Equation")

The stage cost reflects ongoing penalties such as energy, delay, or risk. The terminal cost measures the value (or cost) of ending in a particular state. Together, these give a discrete-time Bolza problem with path constraints and bounds:

<a id="STPr0yKUJe"></a>

$$
\begin{aligned}
    \text{minimize} \quad & c_T(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t) \\
    \text{subject to} \quad & \mathbf{x}_{t+1} = \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t) \\
                            & \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t) \leq \mathbf{0} \\
                            & \mathbf{x}_{\text{min}} \leq \mathbf{x}_t \leq \mathbf{x}_{\text{max}} \\
                            & \mathbf{u}_{\text{min}} \leq \mathbf{u}_t \leq \mathbf{u}_{\text{max}} \\
    \text{given} \quad & \mathbf{x}_1 = \mathbf{x}_0 \enspace .
\end{aligned}
$$

[(18)](#STPr0yKUJe "Link to this Equation")

In the satellite example, $\mathbf{x}_t$ stacks the three phase, relative-rate, and altitude-loss states; $\mathbf{u}_t$ stacks the three daily drag fractions; and $\mathbf{f}_t$ applies the block-diagonal copies of the daily map. The terminal inequalities impose the cyclic slot and rate tolerances, while the epigraph variable $z$ represents the worst altitude loss. This mapping also shows why state values can appear explicitly as decision variables even when a deterministic rollout could reconstruct them from the controls.

Written this way, it may seem obvious that the decision variables are the controls $\mathbf{u}_t$. After all, in most intuitive descriptions of control, we think of choosing inputs to influence the system. But notice that in the program above, the entire state trajectory also appears as a set of variables, linked to the controls by the dynamics constraints. This is intentional: it reflects one way of writing the problem that makes the constraints explicit.

Why introduce $\mathbf{x}_t$ as decision variables if they can be simulated forward from the controls? Many readers hesitate here, and the question is natural: _If the model is deterministic and $\mathbf{x}_1$ is known, why not pick $\mathbf{u}_{1:T-1}$ and compute $\mathbf{x}_{2:T}$ on the fly?_ That instinct leads to **single shooting**, a method we will return to shortly.

Already in this formulation, though, **the structure of the problem matters**. Ignoring it can make our life much harder. The reason is twofold:

-   **Dimensionality grows with the horizon.** For a horizon of length $T$, the program has roughly $(T-1)(m+n)$ decision variables.
    
-   **Temporal coupling.** Each control affects all future states and costs. The feasible set is not a simple box but a narrow manifold defined by the dynamics.
    

Together, these features explain why specialized methods exist and why the way we write the problem influences the algorithms we can use. Whether we keep states explicit or eliminate them through forward simulation determines the problem size, its conditioning, and the trade-offs between robustness and computational effort.

<a id="existence-of-solutions-and-optimality-conditions"></a>

## Existence of Solutions and Optimality Conditions

Writing the problem as a nonlinear program does not ensure that a minimizer exists or that a candidate is locally optimal. Which conditions supply those two claims?

Now that we have the optimization problem written down, we can ask: does it always have a solution? And if so, how do we recognize one? These questions lead us to feasibility and optimality conditions.

<a id="existence-of-solutions"></a>

### Existence of Solutions

Notice first that nothing in the problem statement required the dynamics

<a id="hBapKLe5JZ"></a>

$$
\mathbf{x}_{t+1} = \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)
$$

[(19)](#hBapKLe5JZ "Link to this Equation")

to be stable. In fact, many problems of interest involve unstable systems; think of balancing a pole or steering a spacecraft. What matters is that the dynamics are **well defined**: given a state–control pair, the rule $\mathbf{f}_t$ produces a valid next state.

In continuous time, one usually requires $\mathbf{f}$ to be continuous (often Lipschitz continuous) in $\mathbf{x}$ so that the ODE has a unique solution on the horizon of interest. In discrete time, the requirement is lighter: we only need the update map to be well posed.

Existence also hinges on **feasibility**. A candidate control sequence must generate a trajectory that respects all constraints: the dynamics, any bounds on state and control, and any terminal requirements. If no such sequence exists, the feasible set is empty and the problem has no solution. This can happen if the constraints are overly strict, or if the system is uncontrollable from the given initial condition.

<a id="optimality-conditions"></a>

### Optimality Conditions

Assume the feasible set is nonempty. Necessary conditions for a local minimum follow from the Lagrange multiplier theorem. They supply equations for candidate solutions, although satisfying them alone need not establish a minimum. For a smooth problem

<a id="yHAUdzRfTu"></a>

$$
\begin{aligned}
\min_{\mathbf{z}}\quad & F(\mathbf{z})\\
\text{s.t.}\quad & H(\mathbf{z})=\mathbf{0},\\
& G(\mathbf{z})\le \mathbf{0},
\end{aligned}
$$

[(20)](#yHAUdzRfTu "Link to this Equation")

Here $G$ stacks inequalities of the form $g_i\leq0$, and $H$ stacks equalities of the form $h_i=0$. Define the **Lagrangian**

<a id="WGJHvurOW6"></a>

$$
\mathcal{L}(\mathbf{z},\boldsymbol{\lambda},\boldsymbol{\mu})
= F(\mathbf{z})+\boldsymbol{\lambda}^{\top}H(\mathbf{z})+\boldsymbol{\mu}^{\top}G(\mathbf{z}),\qquad \boldsymbol{\mu}\ge \mathbf{0}.
$$

[(21)](#WGJHvurOW6 "Link to this Equation")

The positive sign before the inequality term follows from the convention $G(\mathbf z)\le \mathbf0$: a violation $G_i(\mathbf z)>0$ increases the Lagrangian when $\mu_i>0$. Equality multipliers remain unrestricted. For a candidate point $\mathbf z$, the **active set** is

<a id="h5ghJapXF2"></a>

$$
\mathcal{A}(\mathbf{z}) \;=\; \{\, i \;:\; G_i(\mathbf{z})=0 \,\},
$$

[(22)](#h5ghJapXF2 "Link to this Equation")

while indices with $G_i(\mathbf{z})<0$ are **inactive**. Only active inequalities can carry positive multipliers.

A **constraint qualification** is a regularity assumption under which a local minimum admits Lagrange multipliers. One sufficient choice is the **Linear Independence Constraint Qualification (LICQ)**: the equality gradients and active inequality gradients at the candidate are linearly independent. If $J_H$ and $J_{G_{\mathcal A}}$ have those gradients as rows, LICQ requires

<a id="U3fbd7lePJ"></a>

$$
\begin{bmatrix}J_H(\mathbf z^\star)\\J_{G_{\mathcal A}}(\mathbf z^\star)\end{bmatrix}
\quad\text{to have full row rank.}
$$

[(23)](#U3fbd7lePJ "Link to this Equation")

This assumption guarantees multiplier existence at a local minimum. It does not by itself make the Newton system for the optimality conditions invertible; that also depends on the objective and constraint curvature.

Under such a constraint qualification, any local minimizer $\mathbf{z}^\star$ admits multipliers $(\boldsymbol{\lambda}^\star,\boldsymbol{\mu}^\star)$ that satisfy the **Karush–Kuhn–Tucker (KKT) conditions**:

<a id="AGTJAP1K26"></a>

$$
\begin{aligned}
&\text{stationarity:} && \nabla_{\mathbf{z}}\mathcal{L}(\mathbf{z}^\star,\boldsymbol{\lambda}^\star,\boldsymbol{\mu}^\star)=\mathbf{0},\\
&\text{primal feasibility:} && H(\mathbf{z}^\star)=\mathbf{0},\quad G(\mathbf{z}^\star)\le \mathbf{0},\\
&\text{dual feasibility:} && \boldsymbol{\mu}^\star\ge \mathbf{0},\\
&\text{complementarity:} && \mu_i^\star\,G_i(\mathbf{z}^\star)=0\quad \text{for all } i.
\end{aligned}
$$

[(24)](#AGTJAP1K26 "Link to this Equation")

Complementarity requires $\mu_i^\star=0$ when $G_i(\mathbf z^\star)<0$. At a tight constraint, the multiplier may be positive or zero. Under suitable sensitivity assumptions, multipliers quantify changes in the optimal value when constraint right-hand sides change, with signs determined by the chosen perturbation convention.

In trajectory problems, $\mathbf z$ stacks states and controls, $H$ enforces the dynamics, and $G$ collects bounds and path constraints. The equality multipliers associated with dynamics become Pontryagin costates when the residual is written $\mathbf f_t-\mathbf x_{t+1}$. Writing the residual in the opposite order reverses the multiplier sign. Terminal-equality multipliers are denoted separately by $\boldsymbol\nu$ in that derivation. Since nonlinear dynamics generally make these programs nonconvex, KKT is a necessary first-order test under regularity. It does not generally imply a local minimum of the Lagrangian or a global saddle point.

If LICQ fails, a different constraint qualification may still apply. Without an applicable qualification, multipliers can fail to exist or be nonunique. Redundant dynamic or path constraints can also make numerical systems singular or poorly conditioned.

<a id="from-kkt-to-algorithms"></a>

### From KKT to algorithms

The Lagrangian gives an exact min–max representation of the constrained problem, whether or not the problem is convex:

<a id="gRBS7rb9QB"></a>

$$
p^\star=\inf_{\mathbf z}
\sup_{\boldsymbol\lambda,\,\boldsymbol\mu\ge\mathbf0}
\mathcal L(\mathbf z,\boldsymbol\lambda,\boldsymbol\mu),
\qquad
\mathcal L=F+\boldsymbol\lambda^\top H+\boldsymbol\mu^\top G.
$$

[(25)](#gRBS7rb9QB "Link to this Equation")

Here $\boldsymbol\lambda$ is unrestricted. For a feasible $\mathbf z$, the inner supremum equals $F(\mathbf z)$. If an equality is violated, its multiplier can choose a sign and magnitude that makes the Lagrangian arbitrarily large. If $G_i(\mathbf z)>0$, sending $\mu_i$ to infinity does the same. Thus the multiplier player’s response assigns $+\infty$ to every infeasible choice.

Reversing the order gives the dual value, a lower bound on the primal value:

<a id="FwbWhicENw"></a>

$$
d^\star=\sup_{\boldsymbol\lambda,\,\boldsymbol\mu\ge\mathbf0}
\inf_{\mathbf z}\mathcal L(\mathbf z,\boldsymbol\lambda,\boldsymbol\mu)
\le p^\star.
$$

[(26)](#FwbWhicENw "Link to this Equation")

The distinction is whether the multipliers can respond to each candidate or must be fixed before the candidate is chosen. A **saddle point** requires one fixed multiplier pair for which $\mathbf z^\star$ globally minimizes the Lagrangian, together with optimal multipliers against that fixed $\mathbf z^\star$. Such a pair satisfies

<a id="p21Ng26VVt"></a>

$$
\mathcal L(\mathbf z^\star,\boldsymbol\lambda,\boldsymbol\mu)
\le\mathcal L(\mathbf z^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)
\le\mathcal L(\mathbf z,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)
$$

[(27)](#p21Ng26VVt "Link to this Equation")

for all $\mathbf z$, unrestricted $\boldsymbol\lambda$, and $\boldsymbol\mu\ge\mathbf0$. Solving the primal min–max problem alone does not guarantee this property. For example, minimizing $-z^2$ subject to $z=0$ has the unique feasible optimizer $z^\star=0$ and KKT multiplier $\lambda^\star=0$, yet $\mathcal L(z,0)=-z^2$ is maximized at zero.

When $F$ is convex, each $G_i$ is convex, and $H$ is affine, the Lagrangian is convex in $\mathbf z$. KKT stationarity then guarantees its global minimum; feasibility and complementarity give the other saddle inequality. An existing KKT point is therefore sufficient for a global saddle point. Slater’s condition, the existence of a point with $H=0$ and $G_i<0$ for every inequality, guarantees suitable multipliers at an attained finite optimizer in this convex setting. The [nonlinear-programming appendix](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/31-appendix-nlp.md#the-lagrangian-duality-and-optimality-conditions) derives these statements and distinguishes them from the necessary conditions used in nonconvex trajectory optimization.

<a id="primal-dual-gradient-dynamics-arrow-hurwicz"></a>

#### Primal–dual gradient dynamics (Arrow–Hurwicz)

A first-order method takes a descent step in the primal variables and an ascent step in the multipliers, projecting the inequality multipliers back onto their allowed set:

<a id="lDLkedOb1Y"></a>

$$
\begin{aligned}
\mathbf{z}^{k+1} &= \mathbf{z}^{k}-\alpha_k\big(\nabla F(\mathbf{z}^{k})+J_H(\mathbf{z}^{k})^{\top}\boldsymbol{\lambda}^{k}+J_G(\mathbf{z}^{k})^{\top}\boldsymbol{\mu}^{k}\big),\\[2mm]
\boldsymbol{\lambda}^{k+1} &= \boldsymbol{\lambda}^{k}+\beta_k\,H(\mathbf{z}^{k}),\\[1mm]
\boldsymbol{\mu}^{k+1} &= \Pi_{\ge 0}\!\big(\boldsymbol{\mu}^{k}+\beta_k\,G(\mathbf{z}^{k})\big).
\end{aligned}
$$

[(28)](#lDLkedOb1Y "Link to this Equation")

Here $\Pi_{\ge0}$ clips each negative component to zero. With the convention $G\le0$, a violated inequality increases its multiplier. These finite updates do not perform the inner supremum in the exact primal representation, and saddle-point existence alone does not guarantee their convergence. Even the convex bilinear case $\mathcal L(z,\lambda)=\lambda z$ has simultaneous updates with eigenvalues $1\pm i\sqrt{\alpha\beta}$ for fixed positive steps, whose magnitudes exceed one.

Additional curvature assumptions or algorithmic modifications are needed for convergence. Penalty and augmented-Lagrangian methods add terms that discourage violations. For example, one can use the penalized Lagrangian

<a id="ZKGUXxF9iW"></a>

$$
\mathcal{L}_\rho(\mathbf{z},\boldsymbol{\lambda},\boldsymbol{\mu})
= \mathcal{L}(\mathbf{z},\boldsymbol{\lambda},\boldsymbol{\mu})
+\tfrac{\rho}{2}\|H(\mathbf{z})\|^2
+\tfrac{\rho}{2}\|\max\{0,G(\mathbf{z})\}\|^2,
$$

[(29)](#ZKGUXxF9iW "Link to this Equation")

where $\rho>0$ weights squared equality residuals and inequality violations. These terms change the curvature away from feasibility. Their use still requires a suitable step-selection or subproblem strategy; adding them alone is not a convergence guarantee.

<a id="sec-sqp-newton"></a>

#### SQP as Newton on the KKT system (equality case)

With **only equality constraints** $H(\mathbf{z})=\mathbf{0}$, write first-order conditions

<a id="eeOOJdYSS0"></a>

$$
\nabla_{\mathbf{z}}\mathcal{L}(\mathbf{z},\boldsymbol{\lambda})=\mathbf{0},
\qquad
H(\mathbf{z})=\mathbf{0},
\quad \text{where }\mathcal{L}=F+\boldsymbol{\lambda}^{\top}H.
$$

[(30)](#eeOOJdYSS0 "Link to this Equation")

Applying Newton’s method to this system gives the linear KKT solve

<a id="KnTiU9eNoi"></a>

$$
\begin{bmatrix}
\nabla_{\mathbf{z}\mathbf{z}}^2\mathcal{L}(\mathbf{z}^k,\boldsymbol{\lambda}^k) & J_H(\mathbf{z}^k)^{\top}\\
J_H(\mathbf{z}^k) & 0
\end{bmatrix}
\begin{bmatrix}
\Delta \mathbf{z}\\ \Delta \boldsymbol{\lambda}
\end{bmatrix}
=
-
\begin{bmatrix}
\nabla_{\mathbf{z}}\mathcal{L}(\mathbf{z}^k,\boldsymbol{\lambda}^k)\\
H(\mathbf{z}^k)
\end{bmatrix}.
$$

[(31)](#KnTiU9eNoi "Link to this Equation")

The same step has an optimization interpretation. With $B_k=\nabla^2_{\mathbf z\mathbf z}\mathcal L(\mathbf z^k,\boldsymbol\lambda^k)$, **Sequential Quadratic Programming (SQP)** chooses a displacement $\Delta\mathbf z$ by solving the quadratic program

<a id="HX0W4SgAou"></a>

$$
\boxed{
\begin{aligned}
\underset{\Delta\mathbf z}{\operatorname{minimize}}\quad&
\nabla F(\mathbf z^k)^\top\Delta\mathbf z
+\frac12\Delta\mathbf z^\top B_k\Delta\mathbf z\\
\text{subject to}\quad&
H(\mathbf z^k)+J_H(\mathbf z^k)\Delta\mathbf z=\mathbf0.
\end{aligned}}
$$

[(32)](#HX0W4SgAou "Link to this Equation")

The quadratic objective retains a slope, $\nabla F(\mathbf z^k)$, and a curvature matrix, $B_k$. Its gradient changes linearly with the proposed displacement: $\nabla F(\mathbf z^k)+B_k\Delta\mathbf z$. This lets the model predict how the benefit of moving in a direction changes as we move farther. The constant $F(\mathbf z^k)$ can be omitted because it does not affect which step minimizes the model.

Linearizing a constraint means replacing its value at the trial point by its current value plus its predicted first-order change. Thus the QP asks $J_H(\mathbf z^k)\Delta\mathbf z$ to cancel the current residual $H(\mathbf z^k)$. At a feasible iterate, this becomes $J_H(\mathbf z^k)\Delta\mathbf z=\mathbf0$: the step lies in the tangent space to the constraints. These are _affine_ constraints on the step, meaning linear expressions plus constants.

Why use the Lagrangian’s Hessian in the quadratic objective? For equality constraints it is

<a id="ECjOg8fEil"></a>

$$
B_k=\nabla^2 F(\mathbf z^k)
+\sum_i\lambda_i^k\nabla^2 H_i(\mathbf z^k).
$$

[(33)](#ECjOg8fEil "Link to this Equation")

The additional terms carry information about the curvature of the constraints, weighted by their multipliers. The QP therefore uses a quadratic model designed for the constrained problem; it is generally different from the second-order Taylor expansion of $F$ alone. Its connection to Newton’s method explains this choice. If $\boldsymbol\lambda_{\mathrm{QP}}$ denotes the multiplier of the QP equality, the QP’s stationarity and feasibility conditions are

<a id="NSunbEXSaH"></a>

$$
\begin{bmatrix}
B_k & J_H(\mathbf z^k)^\top\\
J_H(\mathbf z^k) & 0
\end{bmatrix}
\begin{bmatrix}
\Delta\mathbf z\\ \boldsymbol\lambda_{\mathrm{QP}}
\end{bmatrix}
=-
\begin{bmatrix}
\nabla F(\mathbf z^k)\\ H(\mathbf z^k)
\end{bmatrix}.
$$

[(34)](#NSunbEXSaH "Link to this Equation")

Substitute $\boldsymbol\lambda_{\mathrm{QP}}=\boldsymbol\lambda^k+
\Delta\boldsymbol\lambda$ and move $J_H(\mathbf z^k)^\top\boldsymbol\lambda^k$ to the right-hand side. This gives exactly the Newton system above. The QP multiplier is thus the new multiplier estimate for a full step; its difference from the old estimate is the Newton multiplier increment.

With inequalities $G(\mathbf z)\le\mathbf0$, the QP also includes

<a id="NNg6pdaUQp"></a>

$$
G(\mathbf z^k)+J_G(\mathbf z^k)\Delta\mathbf z\le\mathbf0.
$$

[(35)](#NNg6pdaUQp "Link to this Equation")

The Hessian $B_k$ then includes $\sum_i\mu_i^k\nabla^2G_i(\mathbf z^k)$, and the QP returns inequality multipliers $\boldsymbol\mu_{\mathrm{QP}}\ge\mathbf0$ as well.

The computational benefit comes from fixing these matrices for the duration of each QP solve. The solver works with a quadratic function and flat constraint boundaries, without repeatedly differentiating the original nonlinear functions. In the equality case, one linear KKT solve gives the unique QP minimizer when $J_H$ has full row rank and $B_k$ is positive definite on nonzero directions $\mathbf v$ satisfying $J_H\mathbf v=\mathbf0$. With inequalities, an **active-set method** selects candidate tight constraints and solves equality-constrained QPs, updating the selection as needed. An **interior-point method** handles the inequalities through slacks and perturbed complementarity equations, solving related linear systems. Both approaches can exploit sparse matrix factorizations. The [NEOS guide to QP algorithms](https://neos-guide.org/guide/algorithms/qp/) develops these two approaches.

Consecutive subproblems often share their pattern of nonzero entries, so solvers can reuse the ordering used for sparse elimination and start from previous primal and dual estimates. A numerical factorization can also be reused when its coefficient matrix stays unchanged; changing the Hessian or constraint Jacobians generally requires updating or recomputing it. [OSQP](https://osqp.org/docs/) provides one implementation of factorization reuse and warm starts for convex QPs. In trajectory optimization, each dynamics constraint couples neighboring time steps, which gives the matrices a sparse block structure. With stagewise quadratic costs, linearized dynamics, and no additional inequalities, suitable QPs can be solved by a Riccati recursion as in LQR.

The exact Lagrangian Hessian need not give a convex QP away from a solution. Practical SQP methods often modify it or use a positive-definite approximation. For a least-squares objective, a Gauss–Newton approximation provides positive-semidefinite curvature; adding a positive multiple of the identity makes it positive definite. These choices give modified Newton steps. Finally, satisfying the linearized constraints does not ensure nonlinear feasibility at $\mathbf z^k+\Delta\mathbf z$. A line search or trust region checks progress using the original objective and constraints and controls how far to move before constructing the next QP.

<a id="further-sources-of-discrete-time-optimal-control-problems"></a>

## Further Sources of Discrete-Time Optimal-Control Problems

Beyond sampled physical dynamics, which computations and continuous-time models produce the same temporally coupled optimization structure?

The satellite planner begins from a deliberately discretized daily model. Other problems are discrete because decisions naturally occur at stages, while still others inherit a discrete transition from numerical integration or program execution. The next two constructions make those latter connections explicit.

<a id="docps-arising-from-the-discretization-of-continuous-time-ocps"></a>

### DOCPs Arising from the Discretization of Continuous-Time OCPs

Although many applications are natively discrete-time, it is also common to obtain a DOCP by discretizing a continuous-time formulation. Consider a system on $[0, T_c]$ given by

<a id="dT8vhPUOWO"></a>

$$
\dot{\mathbf{x}}(t) = \mathbf{f}(\mathbf{x}(t), \mathbf{u}(t),t), \qquad \mathbf{x}(0) = \mathbf{x}_0.
$$

[(36)](#dT8vhPUOWO "Link to this Equation")

Choose a step size $\Delta > 0$ and grid $t_k = k\,\Delta$. A one-step integration scheme induces a discrete map $\mathbf{F}_\Delta$ so that

<a id="ZVQLs5aRKl"></a>

$$
\mathbf{x}_{k+1} = \mathbf{F}_\Delta(\mathbf{x}_k, \mathbf{u}_k, t_k),\qquad k=0,\dots, T-1,
$$

[(37)](#ZVQLs5aRKl "Link to this Equation")

where, for example, explicit Euler gives $\mathbf{F}_\Delta(\mathbf{x},\mathbf{u},t) = \mathbf{x} + \Delta\,\mathbf{f}(\mathbf{x},\mathbf{u},t)$. The resulting discrete-time optimal control problem takes the Bolza form with these induced dynamics:

<a id="CdgZ4DKVol"></a>

$$
\begin{aligned}
\min_{\{\mathbf{x}_k,\mathbf{u}_k\}}\; & c_T(\mathbf{x}_T) + \sum_{k=0}^{T-1} c_k(\mathbf{x}_k,\mathbf{u}_k) \\
\text{s.t.}\; & \mathbf{x}_{k+1} - \mathbf{F}_\Delta(\mathbf{x}_k,\mathbf{u}_k, t_k) = 0,\quad k=0,\dots,T-1, \\
& \mathbf{x}_0 = \mathbf{x}_\mathrm{init}.
\end{aligned}
$$

[(38)](#CdgZ4DKVol "Link to this Equation")

<a id="programs-as-docps-and-differentiable-programming"></a>

### Programs as DOCPs and Differentiable Programming

It is often useful to view a computer program itself as a discrete-time dynamical system. Let the **program state** collect memory, buffers, and intermediate variables, and let the **control** represent inputs or tunable decisions at each step. A single execution step defines a transition map

<a id="xASuLSBsCp"></a>

$$
\mathbf{x}_{k+1}=\Phi_k(\mathbf{x}_k,\mathbf{u}_k),
$$

[(39)](#xASuLSBsCp "Link to this Equation")

and a scalar objective (e.g., loss, error, runtime, energy) yields a DOCP:

<a id="exEOH76K8v"></a>

$$
\min_{\{\mathbf{u}_k\}} \; c_T(\mathbf{x}_T)+\sum_{k=0}^{T-1} c_k(\mathbf{x}_k,\mathbf{u}_k)
\quad\text{s.t.}\quad \mathbf{x}_{k+1}=\Phi_k(\mathbf{x}_k,\mathbf{u}_k).
$$

[(40)](#exEOH76K8v "Link to this Equation")

In differentiable programming (e.g., JAX, PyTorch), the composed map $\Phi_{T-1}\circ\cdots\circ\Phi_0$ is differentiable, enabling reverse-mode automatic differentiation and efficient gradient-based trajectory optimization. When parts of the program are non-differentiable (discrete branches, simulators with events), DOCPs can still be solved using derivative-free or weak-gradient methods (eg. finite differences, SPSA, Nelder–Mead, CMA-ES, or evolutionary strategies) optionally combined with smoothing, relaxations, or stochastic estimators to navigate non-smooth regions.

<a id="example-offline-frequency-planning-for-inference"></a>

#### Example: Offline Frequency Planning for Inference

The inference service from the [model-interface chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/05-model-interfaces.md#inference-serving-as-a-controlled-system) is also a program with a controllable execution rate. Its service-rate and phase-power curves come from a measured NVIDIA L4 profile. The request and queue trajectories below come from a simulator calibrated with those curves, not from running each controller on the GPU. The scheduling rule is held fixed. Each 0.1-second simulator step prioritizes decode or begins with a prefill chunk capped at 512 tokens. If that chunk finishes early, the remaining service budget may return to decode. Active decode receives alternating-step or cache-pressure priority. This reduced interleaving model is not a reproduction of the vLLM scheduler used for profiling. The control sequence specifies one normalized GPU frequency for each second of a 60-second horizon,

<a id="oEwxilsst9"></a>

$$
u_k=\frac{f_k-f_{\min}}{f_{\max}-f_{\min}}\in[0,1].
$$

[(41)](#oEwxilsst9 "Link to this Equation")

An aggregate state collects queued prefill work, active decode work, temperature, and the preceding frequency:

<a id="diRWZSs46I"></a>

$$
x_k=(p_k,d_k,T_k,f_{k-1}),
\qquad
x_{k+1}=F_k(x_k,u_k,w_k).
$$

[(42)](#diRWZSs46I "Link to this Equation")

The disturbance $w_k$ contains the arrival times and prompt lengths predicted for second $k$. Future output lengths remain hidden. The planner substitutes the trace distribution’s expected output length, while the request-level replay uses each realized length only as a disturbance. Service and power in $F_k$ interpolate the committed profile whose provenance is displayed with the result. The request-level simulator remains outside the optimizer and validates the resulting schedule after the solve.

The 60-second workload is selected before optimization by a deterministic, capacity-screened rule. The rule scans ten-second-aligned windows after load normalization, discards any window whose forecast work exceeds the horizon’s maximum-clock service capacity, and requires an occupied burst that can be moved twenty seconds earlier. Among the remaining windows, it chooses the shift-eligible burst with the largest forecast work; total window work and then earlier source time break ties. The selected source interval is $[890,950)$ seconds in the normalized trace and is rebased to start at zero. Its 48 requests require 51.936 seconds of forecast work at maximum clock, or 86.56% of the horizon’s capacity. The chosen burst occupies $[40,50)$ seconds after rebasing and contains 31 requests. The shifted replay moves those requests to $[20,30)$ seconds.

The offline problem uses the complete nominal arrival forecast. It introduces a normalized service decision $\nu_k\in[\nu_{\min},1]$ and a nonnegative backlog variable $B_{k+1}$. If $W_k$ is arriving work in seconds of highest-clock service, their fluid balance is relaxed to

<a id="ajLnBFn4t7"></a>

$$
\begin{aligned}
\underset{\nu_0,\ldots,\nu_{59},B_1,\ldots,B_{60}}
{\operatorname{minimize}}\quad
&\sum_{k=0}^{59}\left[\alpha_P\nu_k+20B_{k+1}\right]
+20B_{60}\\
\text{subject to}\quad
&B_{k+1}\geq B_k+W_k-\Delta t\,\nu_k,\qquad B_0=0,\\
&B_{k+1}\geq0,\qquad \nu_{\min}\leq\nu_k\leq1.
\end{aligned}
$$

[(43)](#ajLnBFn4t7 "Link to this Equation")

The coefficient $\alpha_P$ is the slope of a linear interpolation between the lowest- and highest-clock normalized power values. The backlog term prices waiting throughout the horizon, while the additional terminal term discourages postponing work beyond second 60. This is a linear program, solved with HiGHS. The service decisions are mapped through the profiled service curve to continuous frequencies. Execution rounds each frequency downward to the nearest profiled requested clock, so the request-level validation includes the actuator’s finite action set. The replay reports the corresponding measured median realized clock separately; a requested level and its realized clock need not coincide under the experimental power cap.

This planning model deliberately omits request identities, phase-specific queues, clock slew, and the nonlinear thermal state. The detailed replay restores those variables and reports power, temperature, latency, and memory violations. The optimizer therefore supplies an offline plan from a tractable aggregate model, while the replay audits the assumptions used to obtain it.

The experiment asks what a one-shot frequency schedule gains from a perfect nominal arrival and prompt-length forecast, and what it loses when that forecast is wrong. Future output lengths remain uncertain in both cases. The same plan is replayed twice. The nominal replay uses the forecast supplied to the optimizer. The shifted replay uses the earlier arrival times defined above. No reoptimization occurs after either replay starts.

<a id="DyCXyv0PJq"></a>

<a id="fig-inference-open-loop"></a>

<a id="fig-inference-open-loop-code"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from inference_replay import render_serving_replay

display(HTML(render_serving_replay(
    Path("artifacts/inference_serving/textbook_results.json"),
    view="open_loop",
)))
```

[Figure 3:](#fig-inference-open-loop "Link to this figure")The optimized clock schedule is computed once from the nominal 60-second request forecast. The shifted replay moves the selected work burst twenty seconds earlier while keeping the planned clocks fixed. Both request-level trajectories are simulations calibrated by measured NVIDIA L4 service-rate and phase-power curves. The playhead reveals only the executed trajectory prefix; the dashed schedule is the plan available at time zero.

<a id="fig-inference-open-loop-outputs"></a>

Loading...

<a id="fig-inference-open-loop-fallback"></a>

<a id="eRm3BjVBc0"></a>
![Static comparison of the fixed offline frequency plan under nominal and shifted request arrivals.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/72d918f6b9-open-loop-5d7784b7c585022685475482183c23a4.svg)

[Figure 4:](#fig-inference-open-loop-fallback "Link to this figure")Static comparison of the nominal and shifted-burst replays. The online book adds playback and a controller selector.

The table reports request-level results for the fixed offline schedule under its nominal forecast and the shifted-burst disturbance. Both columns use the same requests, controller parameters, and measured profile calibration.

<a id="bAojVoWYzp"></a>

```python
import pandas as pd

open_loop_metrics = pd.read_csv(
    "artifacts/inference_serving/metrics_open_loop.csv"
).set_index("controller")
open_loop_metrics[
    [
        "mean_ttft_s",
        "p95_ttft_s",
        "matched_moved_burst_mean_ttft_s",
        "matched_moved_burst_p95_ttft_s",
        "energy_j",
        "peak_queued_requests_at_minimum_clock",
        "queued_requests_at_30_s",
        "power_violation_w",
        "thermal_violation_c",
    ]
].T.rename_axis("metric").round(3)
```

Loading...

[Download every open-loop metric (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/fdb21c6b3d-metrics_open_loop-bc8787d3ae658e9a66680fa963ec6594.csv)

HiGHS reports an optimal solution for the stated linear program, with objective 11,205.68 in its weighted model units. Across all 48 requests, mean time to first token rises from 16.35 seconds under the nominal arrival times to 23.23 seconds after the shift. The 95th percentile rises from 28.09 to 31.28 seconds. For the 31 moved requests, the mean rises from 15.22 to 22.73 seconds. Their 95th percentile rises from 23.74 to 32.04 seconds. These changes are increases of 7.52 and 8.30 seconds, respectively.

At 30 seconds, the nominal replay has no queued request, while the shifted replay has 29. The peak queue while the clock is at its minimum also rises from zero to 29 requests. Energy falls from 3,719.7 to 3,646.8 joules despite the larger delays. Moving the burst changes which requests overlap and how long the system remains in each phase, so an energy decrease does not imply an improved service trajectory.

All requests eventually complete during the post-horizon drain. At the 60-second reporting horizon, 27 nominal requests and 22 shifted requests remain unfinished. Both simulations reach a modeled phase power of 64.852 W and exceed the configured 64.800 W power limit by 0.052 W. Neither simulation records a thermal or KV-capacity violation.

The displayed table focuses on latency, energy, queueing, and constraint violations. The downloadable CSV also reports energy per output token, time per output token, unfinished work, and the full set of recorded diagnostics. The nominal run tests the optimized trajectory under its own assumptions. The shifted run tests sensitivity to one explicit forecast error. It does not establish robustness to arbitrary arrivals, model error, or hardware throttling. Closing that gap requires new information to alter future controls, which is the role of feedback and receding-horizon optimization. The profile calibration is a hardware measurement, while the controller comparison is a simulation of the calibrated model. The reported latency, energy, and constraint outcomes are not direct measurements from replaying this trace through vLLM.

Inspect the offline frequency optimization

inference\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
```

[Download the complete inference-control implementation](https://pierrelucbacon.com/rlbook/build/inference_control-4281ed415b62adfe193289f0e3dfbe27.py)

<a id="example-gradient-descent-with-momentum-as-docp"></a>

#### Example: Gradient Descent with Momentum as DOCP

To connect this lens to familiar practice, including hyperparameter optimization, treat the learning rate and momentum (or their schedules) as controls. Rather than fixing them a priori, we can optimize them as part of a trajectory optimization. The optimizer itself becomes the dynamical system whose execution we shape to minimize final loss.

Program: gradient descent with momentum on a quadratic loss. We fit $\boldsymbol{\theta}\in\mathbb{R}^p$ to data $(\mathbf{A},\mathbf{b})$ by minimizing

<a id="jj8XB88JfY"></a>

$$
\ell(\boldsymbol{\theta})=\tfrac{1}{2}\,\lVert\mathbf{A}\boldsymbol{\theta}-\mathbf{b}\rVert_2^2.
$$

[(44)](#jj8XB88JfY "Link to this Equation")

The program maintains parameters $\boldsymbol{\theta}_k$ and momentum $\mathbf{m}_k$. Each iteration does:

1.  compute gradient $\mathbf{g}_k=\nabla_{\boldsymbol{\theta}}\ell(\boldsymbol{\theta}_k)=\mathbf{A}^\top(\mathbf{A}\boldsymbol{\theta}_k-\mathbf{b})$
    
2.  update momentum $\mathbf{m}_{k+1}=\beta_k \, \mathbf{m}_k + \mathbf{g}_k$
    
3.  update parameters $\boldsymbol{\theta}_{k+1}=\boldsymbol{\theta}_k - \alpha_k \, \mathbf{m}_{k+1}$
    

State, control, and transition. Define the state $\mathbf{x}_k=\begin{bmatrix}\boldsymbol{\theta}_k\\ \mathbf{m}_k\end{bmatrix}\in\mathbb{R}^{2p}$ and the control $\mathbf{u}_k=\begin{bmatrix}\alpha_k\\ \beta_k\end{bmatrix}$. One program step is

<a id="f295jJxoPf"></a>

$$
\Phi_k(\mathbf{x}_k,\mathbf{u}_k)=
\begin{bmatrix}
\boldsymbol{\theta}_k - \alpha_k\!\left(\beta_k \, \mathbf{m}_k + \mathbf{A}^\top(\mathbf{A}\boldsymbol{\theta}_k-\mathbf{b})\right)\\[2mm]
\beta_k \, \mathbf{m}_k + \mathbf{A}^\top(\mathbf{A}\boldsymbol{\theta}_k-\mathbf{b})
\end{bmatrix}.
$$

[(45)](#f295jJxoPf "Link to this Equation")

Executing the program for $T$ iterations gives the trajectory

<a id="ZJZJmFlQwg"></a>

$$
\mathbf{x}_{k+1}=\Phi_k(\mathbf{x}_k,\mathbf{u}_k),\quad k=0,\dots,T-1,\qquad
\mathbf{x}_0=\begin{bmatrix}\boldsymbol{\theta}_0\\ \mathbf{m}_0\end{bmatrix}.
$$

[(46)](#ZJZJmFlQwg "Link to this Equation")

Objective as a DOCP. Choose terminal cost $c_T(\mathbf{x}_T)=\ell(\boldsymbol{\theta}_T)$ and (optionally) stage costs $c_k(\mathbf{x}_k,\mathbf{u}_k)=\rho_\alpha \, \alpha_k^2+\rho_\beta\,(\beta_k- \bar\beta)^2$. The program-as-control problem is

<a id="qehif8mDwW"></a>

$$
\min_{\{\alpha_k,\beta_k\}} \; \ell(\boldsymbol{\theta}_T)+\sum_{k=0}^{T-1}\big(\rho_\alpha \, \alpha_k^2+\rho_\beta\,(\beta_k-\bar\beta)^2\big)
\quad\text{s.t.}\quad \mathbf{x}_{k+1}=\Phi_k(\mathbf{x}_k,\mathbf{u}_k).
$$

[(47)](#qehif8mDwW "Link to this Equation")

Backpropagation = reverse-time costate recursion. Because $\Phi_k$ is differentiable, reverse-mode AD computes $\nabla_{\mathbf{u}_{0:T-1}} \big(c_T+\sum c_k\big)$ by propagating a costate $\boldsymbol{\lambda}_k=\partial \mathcal{J}/\partial \mathbf{x}_k$ backward:

<a id="XCBdXEUgvC"></a>

$$
\boldsymbol{\lambda}_T=\nabla_{\mathbf{x}_T} c_T,\qquad
\boldsymbol{\lambda}_k=\nabla_{\mathbf{x}_k} c_k + \left(\nabla_{\mathbf{x}_k}\Phi_k\right)^\top \boldsymbol{\lambda}_{k+1},
$$

[(48)](#XCBdXEUgvC "Link to this Equation")

where $\nabla_{\mathbf{x}_k}\Phi_k$ denotes the Jacobian of the vector-valued map $\Phi_k$ with respect to $\mathbf{x}_k$, so that $\left(\nabla_{\mathbf{x}_k}\Phi_k\right)^\top \boldsymbol{\lambda}_{k+1}$ is a vector-Jacobian product, and the gradients with respect to controls are

<a id="p311GZAFeZ"></a>

$$
\nabla_{\mathbf{u}_k}\mathcal{J}=\nabla_{\mathbf{u}_k} c_k + \left(\nabla_{\mathbf{u}_k}\Phi_k\right)^\top \boldsymbol{\lambda}_{k+1}.
$$

[(49)](#p311GZAFeZ "Link to this Equation")

Unrolling a tiny horizon ($T=3$) to see the composition:

<a id="gioVelDX33"></a>

$$
\begin{aligned}
\mathbf{x}_1&=\Phi_0(\mathbf{x}_0,\mathbf{u}_0),\\
\mathbf{x}_2&=\Phi_1(\mathbf{x}_1,\mathbf{u}_1),\\
\mathbf{x}_3&=\Phi_2(\mathbf{x}_2,\mathbf{u}_2),\qquad
\mathcal{J}=c_T(\mathbf{x}_3)+\sum_{k=0}^{2} c_k(\mathbf{x}_k,\mathbf{u}_k).
\end{aligned}
$$

[(50)](#gioVelDX33 "Link to this Equation")

What if the program branches? Suppose we insert a “skip-small-gradients” branch

<a id="nPud6IPvgT"></a>

$$
\boldsymbol{\theta}_{k+1}=\boldsymbol{\theta}_k - \alpha_k\,\mathbf{m}_{k+1}\,\mathbf{1}\{ \lVert\mathbf{g}_k\rVert>\tau\},
$$

[(51)](#nPud6IPvgT "Link to this Equation")

which is non-differentiable because of the indicator. The DOCP view still applies, but gradients are unreliable. Two practical paths: smooth the branch (e.g., replace $\mathbf{1}\{\cdot\}$ with $\sigma((\lVert\mathbf{g}_k\rVert-\tau)/\epsilon)$ for small $\epsilon$) and use autodiff; or go derivative-free on $\{\alpha_k,\beta_k,\tau\}$ (e.g., SPSA or CMA-ES) while keeping the inner dynamics exact.

<a id="variants-lagrange-and-mayer-problems"></a>

## Variants: Lagrange and Mayer Problems

How does moving cost between running and terminal terms change the representation without changing the underlying control problem?

The Bolza form is general enough to cover most situations, but two common special cases deserve mention:

-   **Lagrange problem (no terminal cost)** If the objective only accumulates stage costs:
    

<a id="MiCyA4kFDZ"></a>

$$
\min_{\mathbf{u}_{1:T-1}} \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t).
$$

[(52)](#MiCyA4kFDZ "Link to this Equation")

Example: _Energy minimization for a delivery drone_. The concern is total battery use, regardless of the final position.

-   **Mayer problem (terminal cost only)** If the objective depends only on the final state:
    

<a id="ir0HrDUOlZ"></a>

$$
\min_{\mathbf{u}_{1:T-1}} c_T(\mathbf{x}_T).
$$

[(53)](#ir0HrDUOlZ "Link to this Equation")

Example: _Satellite orbital transfer_. The only goal is to reach a specified orbit, no matter the fuel spent along the way.

These distinctions matter when deriving optimality conditions, but conceptually they fit in the same framework: the system evolves over time, and we choose controls to shape the trajectory.

<a id="reducing-to-mayer-form-by-state-augmentation"></a>

### Reducing to Mayer Form by State Augmentation

Although Bolza, Lagrange, and Mayer problems look different, they are equivalent in expressive power. Any problem with running costs can be rewritten as a Mayer problem (one whose objective depends only on the final state) through a simple trick: **augment the state with a running sum of costs**.

The idea is straightforward. Introduce a new variable, $y_t$, that keeps track of the cumulative cost so far. At each step, we update this running sum along with the system state:

<a id="mN0O3o1vij"></a>

$$
\tilde{\mathbf{x}}_{t+1} =
\begin{pmatrix}
\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t) \\
y_t + c_t(\mathbf{x}_t,\mathbf{u}_t)
\end{pmatrix},
$$

[(54)](#mN0O3o1vij "Link to this Equation")

where $\tilde{\mathbf{x}}_t = (\mathbf{x}_t, y_t)$. The terminal cost then becomes:

<a id="BNWZacuyZH"></a>

$$
\tilde{c}_T(\tilde{\mathbf{x}}_T) = c_T(\mathbf{x}_T) + y_T.
$$

[(55)](#BNWZacuyZH "Link to this Equation")

The overall effect is that the explicit sum $\sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t)$ disappears from the objective and is captured implicitly by the augmented state. This lets us write every optimal control problem in Mayer form.

This reduction serves two purposes. First, it often simplifies mathematical derivations, as we will see later when deriving necessary conditions. Second, it can streamline algorithmic implementation: instead of writing separate code paths for Mayer, Lagrange, and Bolza problems, we can reduce everything to one canonical form. That said, this unified approach is not always best in practice. Specialized formulations can sometimes be more efficient computationally, especially when the running cost has simple structure.

The unifying theme is that a DOCP may look like a generic NLP on paper, but its structure matters. Ignoring that structure often leads to impractical solutions, whereas formulations that expose sparsity and respect temporal coupling allow modern solvers to scale effectively. In the following sections, we will examine how these choices play out in practice through single shooting, multiple shooting, and collocation methods, and why different formulations strike different trade-offs between robustness and computational effort.

<a id="summary-and-outlook"></a>

## Summary and Outlook

A finite horizon converts a controlled dynamical model into a nonlinear program over states and actions. The differential-drag and inference examples also delimit its guarantee: feasibility and performance apply to the stated initial condition, dynamics, and disturbance forecast. Bolza, Lagrange, and Mayer forms change the bookkeeping without changing the admissible action sequences.

Under a constraint qualification, the KKT conditions are necessary at a local solution of the resulting nonlinear program, but their raw form hides the direction of time. Can the multipliers be organized into a backward recursion that matches the forward state dynamics? [Adjoints and the discrete-time Pontryagin principle](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/07-discrete-time-pmp.md) provide that organization.

<a id="exercises"></a>

## Exercises

<a id="ex-trajectories-kkt"></a>

[Exercise 1](#ex-trajectories-kkt "Link to this Exercise") (KKT conditions for a simple DOCP)

Consider a two-stage optimal control problem with scalar state and control:

<a id="n5WZ0yhBa6"></a>

$$
\min_{u_1, u_2} \quad x_3^2 + u_1^2 + u_2^2
$$

[(56)](#n5WZ0yhBa6 "Link to this Equation")

subject to:

<a id="BMVIGbrPKf"></a>

$$
x_2 = x_1 + u_1, \quad x_3 = x_2 + u_2, \quad x_1 = 1.
$$

[(57)](#BMVIGbrPKf "Link to this Equation")

**(a)** Write out the Lagrangian with multipliers $\lambda_2, \lambda_3$ for the dynamics constraints.

**(b)** Derive the KKT conditions (stationarity with respect to $x_2, x_3, u_1, u_2$).

**(c)** Solve the system to find the optimal controls $u_1^\star, u_2^\star$ and the optimal cost.

Solution to [Exercise 1](#ex-trajectories-kkt)

The Lagrangian is $\mathcal{L} = x_3^2 + u_1^2 + u_2^2 + \lambda_2(x_1 + u_1 - x_2) + \lambda_3(x_2 + u_2 - x_3)$.

Stationarity conditions:

-   $\partial \mathcal{L}/\partial x_2 = -\lambda_2 + \lambda_3 = 0 \Rightarrow \lambda_2 = \lambda_3$
    
-   $\partial \mathcal{L}/\partial x_3 = 2x_3 - \lambda_3 = 0 \Rightarrow \lambda_3 = 2x_3$
    
-   $\partial \mathcal{L}/\partial u_1 = 2u_1 + \lambda_2 = 0 \Rightarrow u_1 = -\lambda_2/2$
    
-   $\partial \mathcal{L}/\partial u_2 = 2u_2 + \lambda_3 = 0 \Rightarrow u_2 = -\lambda_3/2$
    

Substituting and using the dynamics: $x_3 = 1 + u_1 + u_2 = 1 - \lambda_2/2 - \lambda_3/2 = 1 - \lambda_3$. Combined with $\lambda_3 = 2x_3$, we get $x_3 = 1 - 2x_3$, so $x_3^\star = 1/3$, $\lambda_3^\star = 2/3$, $u_1^\star = u_2^\star = -1/3$. The optimal cost is $(1/3)^2 + 2(1/3)^2 = 1/3$.

* * *

<a id="ex-trajectories-mayer"></a>

[Exercise 2](#ex-trajectories-mayer "Link to this Exercise") (Lagrange to Mayer conversion)

Consider the Lagrange problem:

<a id="y6RfXSlCB4"></a>

$$
\min_{u_{1:T-1}} \sum_{t=1}^{T-1} c_t(x_t, u_t) \quad \text{s.t.} \quad x_{t+1} = f_t(x_t, u_t), \quad x_1 = x_0.
$$

[(58)](#y6RfXSlCB4 "Link to this Equation")

**(a)** Introduce an auxiliary state $y_t$ that accumulates the running cost. Write the augmented dynamics and the equivalent Mayer problem.

**(b)** What is the initial condition for $y_1$? What is the terminal cost in Mayer form?

**(c)** Verify that the two formulations have the same optimal control sequence.

Solution to [Exercise 2](#ex-trajectories-mayer)

Define the augmented state $\tilde{x}_t = (x_t, y_t)$ with dynamics:

<a id="MZY2FuZTLF"></a>

$$
\tilde{x}_{t+1} = \begin{pmatrix} f_t(x_t, u_t) \\ y_t + c_t(x_t, u_t) \end{pmatrix}.
$$

[(59)](#MZY2FuZTLF "Link to this Equation")

Initial condition: $y_1 = 0$. Terminal cost: $\tilde{c}_T(\tilde{x}_T) = y_T$.

The objective $y_T = \sum_{t=1}^{T-1} c_t(x_t, u_t)$ is identical to the Lagrange objective, so the optimal controls are the same.

* * *

<a id="ex-trajectories-licq"></a>

[Exercise 3](#ex-trajectories-licq "Link to this Exercise") (When LICQ fails)

Consider a DOCP where the state must satisfy $x_T = 0$ and also $x_T \leq 0$ at the terminal time.

**(a)** At a feasible point with $x_T = 0$, which constraints are active?

**(b)** Write the gradients of the active constraints with respect to $x_T$. Are they linearly independent?

**(c)** Explain why this violates LICQ and what consequences this might have for the KKT multipliers.

Solution to [Exercise 3](#ex-trajectories-licq)

Both constraints $h(x_T) = x_T = 0$ and $g(x_T) = x_T \leq 0$ are active when $x_T = 0$. The gradients are $\nabla h = 1$ and $\nabla g = 1$, which are parallel (linearly dependent). LICQ fails because the constraint gradients do not span independent directions. Consequence: the multipliers $\lambda$ (for equality) and $\mu \geq 0$ (for inequality) may not be unique—only the sum enters the stationarity condition, so any combination satisfying $\lambda + \mu = c$ for a fixed $c$ could work. This leads to numerical difficulties in optimization algorithms.

* * *

<a id="ex-trajectories-differential-drag"></a>

[Exercise 4](#ex-trajectories-differential-drag "Link to this Exercise") (Differential-drag derivation and model audit)

Return to the three-satellite planner. Let $\Delta\sigma=1/B_\mathrm{high}-1/B_\mathrm{low}$ and $a_0=R_\mathrm{E}+h_0$, with all quantities converted to consistent SI units before substitution.

**(a)** Starting from

<a id="TfrSYhlnBY"></a>

$$
\dot a=-\rho_0\sigma\sqrt{\mu a},
\qquad
n(a)=\sqrt{\frac{\mu}{a^3}},
$$

[(60)](#TfrSYhlnBY "Link to this Equation")

derive the extra daily altitude loss $d$ and angular acceleration $\alpha$ caused by full-time high drag after linearization at $a_0$.

**(b)** Unroll the daily model and show that

<a id="g7TiE5K4aK"></a>

$$
\omega_{i,N}=\alpha\sum_{k=0}^{N-1}u_{i,k},
\qquad
\varphi_{i,N}
=\varphi_{i,0}
+\alpha\sum_{k=0}^{N-1}
\left(N-k-\frac12\right)u_{i,k}.
$$

[(61)](#g7TiE5K4aK "Link to this Equation")

Explain why equal total high-drag exposure can produce equal terminal rates while different command timing still produces different terminal phases.

**(c)** The nominal LP residual is below 10\-10, but the nonlinear replay misses a cyclic gap by more than $10^\circ$. Identify which claim each number supports. Why would tightening the LP tolerance not repair the nonlinear miss?

**(d)** Propose a validation or feedback experiment that distinguishes integration error from model mismatch without changing the already executed part of the command.

Solution to [Exercise 4](#ex-trajectories-differential-drag)

The extra semimajor-axis rate is

<a id="M3rqwthAoB"></a>

$$
\Delta\dot a
=-\rho_0\Delta\sigma\sqrt{\mu a_0}.
$$

[(62)](#M3rqwthAoB "Link to this Equation")

Thus $d=-\Delta\dot a\,\Delta t$, with a metre-to-kilometre conversion. Since $dn/da=-3n/(2a)$,

<a id="mJYjzd8vAO"></a>

$$
\dot n
=\frac{3n_0}{2a_0}
\rho_0\Delta\sigma\sqrt{\mu a_0},
$$

[(63)](#mJYjzd8vAO "Link to this Equation")

and $\alpha=\dot n\,\Delta t^2$ after converting radians to degrees. Repeated substitution in the rate equation gives the first expression in part (b). Each input contributes half of its new rate on its own day and its full rate on every later day, which gives the phase weight $N-k-\tfrac12$.

Equal sums $\sum_k u_{i,k}$ give equal final rate changes and equal nominal extra altitude losses. Moving an equal amount of high drag earlier gives it a larger phase weight, so timing can separate the satellites without leaving a large terminal rate difference.

The small LP residual certifies that the numerical solution satisfies the linear program. The cyclic-gap miss measures predictive failure under the declared nonlinear plant. Solver tolerance cannot remove omitted density and altitude dependence. First halve the RK4 step to audit integration error. To address model mismatch during operation, observe the current orbital state and replan only the remaining command, as in receding-horizon control.

<a id="self-checks"></a>

## Self-checks

<a id="ex-trajectories-check-3"></a>

[Exercise 5](#ex-trajectories-check-3 "Link to this Exercise") (Predict the active bound)

In a minimum-time braking problem with bounded deceleration, which control bound do you expect to be active before the vehicle stops?

Solution to [Exercise 5](#ex-trajectories-check-3)

The maximum braking bound should be active almost everywhere: delaying or reducing braking cannot shorten the stopping time when the terminal position and zero velocity are fixed.

<a id="ex-trajectories-check-4"></a>

[Exercise 6](#ex-trajectories-check-4 "Link to this Exercise") (Forecast shift)

The offline inference controller receives the exact total work over 60 seconds, but the largest burst arrives twenty seconds earlier than planned. Explain why matching total work does not preserve the planned queue and temperature trajectory.

Solution to [Exercise 6](#ex-trajectories-check-4)

The state depends on when work arrives. Earlier work increases the queue and power demand before the clocks chosen for that work are scheduled, and the thermal state carries this timing difference into later seconds.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Foster2018ConstellationPhasing"></a>
2.  Foster, C., Mason, J., Vittaldev, V., Leung, L., Beukelaers, V., Stepan, L., & Zimmerman, R. (2018). Constellation Phasing with Differential Drag on Planet Labs Satellites. _Journal of Spacecraft and Rockets_, _55_(2), 473–483. [10.2514/1.A33927](https://doi.org/10.2514/1.A33927)
<a id="cite-Sin2018DifferentialDrag"></a>
4.  Sin, E., Arcak, M., & Packard, A. (2018). Small Satellite Constellation Separation Using Linear Programming Based Differential Drag Commands. _2018 Annual American Control Conference (ACC)_, 4951–4956. [10.23919/ACC.2018.8431408](https://doi.org/10.23919/ACC.2018.8431408)

[

Modeling Sequential Decisions

Model Interfaces and Learned Components


](05-model-interfaces.md)[

Open-Loop Optimal Control

Adjoints and the Discrete-Time Pontryagin Principle


](07-discrete-time-pmp.md)


---

# CHAPITRE 07 — Adjoints and the Discrete-Time Pontryagin Principle

Section du livre : Open-Loop Optimal Control

Page originale : https://pierrelucbacon.com/rlbook/discrete-time-pmp

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/07-discrete-time-pmp.md

> **Cours de Pierre-Luc Bacon — 07.** [Page publiée](https://pierrelucbacon.com/rlbook/discrete-time-pmp) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/07-discrete-time-pmp.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Adjoints and the Discrete-Time Pontryagin Principle

<a id="skip-to-article"></a>

Finite-horizon optimal control produces a structured nonlinear program and the KKT conditions characterize its local solutions. How do those multipliers organize themselves when the equality constraints are a forward dynamical recursion?

If we take the Bolza formulation of the DOCP and apply the KKT conditions directly, we obtain an optimization system with many multipliers and constraints. Written in raw form, it looks like any other nonlinear program. But in control, this structure has a long history and a name of its own: the **Pontryagin principle**. In fact, the discrete-time version can be seen as the structured KKT system that results from introducing multipliers for the dynamics and collecting terms stage by stage.

We work with the Bolza program

<a id="qekNU7WDoz"></a>

$$
\begin{aligned}
\min_{\{\mathbf{x}_t,\mathbf{u}_t\}} \quad & c_T(\mathbf{x}_T)\;+\;\sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t) \\
\text{s.t.}\quad & \mathbf{x}_{t+1}=\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t),\quad t=1,\dots,T-1,\\
& \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t)\le \mathbf{0},\quad \mathbf{u}_t\in \mathcal{U}_t,\\
& \mathbf{h}(\mathbf{x}_T)=\mathbf{0}\quad\text{(optional terminal equalities)}.
\end{aligned}
$$

[(1)](#qekNU7WDoz "Link to this Equation")

Introduce **costates** $\boldsymbol{\lambda}_{t+1}\in\mathbb{R}^n$ for the dynamics, multipliers $\boldsymbol{\mu}_t\ge \mathbf{0}$ for path inequalities, and $\boldsymbol{\nu}$ for terminal equalities. The Lagrangian is

<a id="qE4UzhP7Eo"></a>

$$
\mathcal{L}
= c_T(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t)
+ \sum_{t=1}^{T-1} \boldsymbol{\lambda}_{t+1}^\top\!\big(\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)-\mathbf{x}_{t+1}\big)
+ \sum_{t=1}^{T-1} \boldsymbol{\mu}_t^\top \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t)
+ \boldsymbol{\nu}^\top \mathbf{h}(\mathbf{x}_T).
$$

[(2)](#qE4UzhP7Eo "Link to this Equation")

It is convenient to package the stagewise terms in a **Hamiltonian**

<a id="pPu9YNRGHF"></a>

$$
H_t(\mathbf{x}_t,\mathbf{u}_t,\boldsymbol{\lambda}_{t+1},\boldsymbol{\mu}_t)
:= c_t(\mathbf{x}_t,\mathbf{u}_t)
+ \boldsymbol{\lambda}_{t+1}^\top \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)
+ \boldsymbol{\mu}_t^\top \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t).
$$

[(3)](#pPu9YNRGHF "Link to this Equation")

Check your understanding

Verify that the Hamiltonian $H_t$ collects exactly the terms from the Lagrangian that involve stage $t$: the stage cost, the dynamics constraint (weighted by the next costate), and the path constraints (weighted by their multipliers). Why does $\boldsymbol{\lambda}_{t+1}$ appear rather than $\boldsymbol{\lambda}_t$?

Then

<a id="psCRkUlOJz"></a>

$$
\mathcal{L} = c_T(\mathbf{x}_T)+\boldsymbol{\nu}^\top \mathbf{h}(\mathbf{x}_T)
+ \sum_{t=1}^{T-1}\Big[H_t(\mathbf{x}_t,\mathbf{u}_t,\boldsymbol{\lambda}_{t+1},\boldsymbol{\mu}_t)
- \boldsymbol{\lambda}_{t+1}^\top \mathbf{x}_{t+1}\Big].
$$

[(4)](#psCRkUlOJz "Link to this Equation")

<a id="necessary-conditions"></a>

## Necessary conditions

How do state feasibility, costate recursion, control stationarity, and complementarity emerge from the stagewise Lagrangian?

Gradient convention

Throughout this section, we use the **denominator layout** (gradient layout) convention:

-   $\nabla_{\mathbf{x}} f(\mathbf{x})$ produces a **column vector** (gradient)
    
-   $\frac{\partial f}{\partial \mathbf{x}}$ produces the Jacobian matrix
    
-   For scalar functions: $\nabla_{\mathbf{x}} f = \left(\frac{\partial f}{\partial \mathbf{x}}\right)^\top$
    
-   For vector-valued maps such as $\mathbf{f}_t$, we write $\nabla_{\mathbf{x}} \mathbf{f}_t$ for the Jacobian $\frac{\partial \mathbf{f}_t}{\partial \mathbf{x}}$ (one row per component of $\mathbf{f}_t$), so that $[\nabla_{\mathbf{x}} \mathbf{f}_t]^\top \boldsymbol{\lambda}$ is a vector-Jacobian product
    

This is the standard convention in optimization and control theory.

Taking first-order variations and collecting terms gives the discrete-time adjoint system, control stationarity, and complementarity. At a local minimum $\{\mathbf{x}_t^\star,\mathbf{u}_t^\star\}$ with multipliers $\{\boldsymbol{\lambda}_t^\star,\boldsymbol{\mu}_t^\star,\boldsymbol{\nu}^\star\}$:

**State dynamics (primal feasibility)**

<a id="mFEoNg5Ezl"></a>

$$
\mathbf{x}_{t+1}^\star=\mathbf{f}_t(\mathbf{x}_t^\star,\mathbf{u}_t^\star),\quad t=1,\dots,T-1.
$$

[(5)](#mFEoNg5Ezl "Link to this Equation")

**Costate recursion (backward “adjoint” equation)**

<a id="JlrZ5GHJOT"></a>

$$
\boldsymbol{\lambda}_t^\star
= \nabla_{\mathbf{x}} H_t\big(\mathbf{x}_t^\star,\mathbf{u}_t^\star,\boldsymbol{\lambda}_{t+1}^\star,\boldsymbol{\mu}_t^\star\big)
= \nabla_{\mathbf{x}} c_t(\mathbf{x}_t^\star,\mathbf{u}_t^\star)
+ \big[\nabla_{\mathbf{x}} \mathbf{f}_t(\mathbf{x}_t^\star,\mathbf{u}_t^\star)\big]^\top \boldsymbol{\lambda}_{t+1}^\star
+ \big[\nabla_{\mathbf{x}} \mathbf{g}_t(\mathbf{x}_t^\star,\mathbf{u}_t^\star)\big]^\top \boldsymbol{\mu}_t^\star,
$$

[(6)](#JlrZ5GHJOT "Link to this Equation")

with the **terminal condition**

<a id="ecNgxJ4zWJ"></a>

$$
\boldsymbol{\lambda}_T^\star
= \nabla_{\mathbf{x}} c_T(\mathbf{x}_T^\star) + \big[\nabla_{\mathbf{x}} \mathbf{h}(\mathbf{x}_T^\star)\big]^\top \boldsymbol{\nu}^\star
\quad\text{(and \(\boldsymbol{\nu}^\star=\mathbf{0}\) if there are no terminal equalities).}
$$

[(7)](#ecNgxJ4zWJ "Link to this Equation")

**Control stationarity (first-order optimality in $\mathbf{u}_t$)** If $\mathcal{U}_t=\mathbb{R}^m$ (no explicit set constraint), then

<a id="muWLaP8GMM"></a>

$$
\nabla_{\mathbf{u}} H_t\big(\mathbf{x}_t^\star,\mathbf{u}_t^\star,\boldsymbol{\lambda}_{t+1}^\star,\boldsymbol{\mu}_t^\star\big)=\mathbf{0}.
$$

[(8)](#muWLaP8GMM "Link to this Equation")

If $\mathcal{U}_t$ imposes bounds or a convex set, the condition becomes the **variational inequality**

<a id="ojsEoF7AB0"></a>

$$
\mathbf{0}\in \nabla_{\mathbf{u}} H_t(\cdot)\;+\;N_{\mathcal{U}_t}(\mathbf{u}_t^\star),
$$

[(9)](#ojsEoF7AB0 "Link to this Equation")

where $N_{\mathcal{U}_t}(\cdot)$ is the normal cone to $\mathcal{U}_t$. For simple box bounds, this reduces to standard KKT sign and complementarity conditions on the components of $\mathbf{u}_t^\star$.

**Path-constraint multipliers (primal/dual feasibility and complementarity)**

<a id="hYVa6fjLKc"></a>

$$
\mathbf{g}_t(\mathbf{x}_t^\star,\mathbf{u}_t^\star)\le \mathbf{0},\quad
\boldsymbol{\mu}_t^\star\ge \mathbf{0},\quad
\mu_{t,i}^\star\, g_{t,i}(\mathbf{x}_t^\star,\mathbf{u}_t^\star)=0\quad \text{for all }i,t.
$$

[(10)](#hYVa6fjLKc "Link to this Equation")

**Terminal equalities (if present)**

<a id="k7NVOtfWtV"></a>

$$
\mathbf{h}(\mathbf{x}_T^\star)=\mathbf{0}.
$$

[(11)](#k7NVOtfWtV "Link to this Equation")

The triplet “forward state, backward costate, control stationarity” is the discrete-time Euler–Lagrange system tailored to control with dynamics. It is the same KKT logic as before, but organized stagewise through the Hamiltonian.

Proposition 1 (Discrete-time Pontryagin necessary conditions (summary))

At a local minimum of the DOCP

<a id="zYLhLD0l41"></a>

$$
\min_{\{\mathbf{x}_t,\mathbf{u}_t\}}\ c_T(\mathbf{x}_T)+\sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t)
\quad\text{s.t.}\quad \mathbf{x}_{t+1}=\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t),\ \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t)\le \mathbf{0},\ \mathbf{h}(\mathbf{x}_T)=\mathbf{0},
$$

[(12)](#zYLhLD0l41 "Link to this Equation")

there exist multipliers $\{\boldsymbol{\lambda}_{t+1}\}$, $\{\boldsymbol{\mu}_t\ge\mathbf{0}\}$, and (if present) $\boldsymbol{\nu}$ such that, for $t=1,\dots,T-1$:

-   State dynamics:  $\ \mathbf{x}_{t+1}=\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)$.
    
-   Backward costate recursion:
    
    <a id="EnyXBv57K3"></a>
    
    $$
    \boldsymbol{\lambda}_t = \nabla_{\mathbf{x}} c_t(\mathbf{x}_t,\mathbf{u}_t)
      + \big[\nabla_{\mathbf{x}} \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)\big]^\top \boldsymbol{\lambda}_{t+1}
      + \big[\nabla_{\mathbf{x}} \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t)\big]^\top \boldsymbol{\mu}_t.
    $$
    
    [(13)](#EnyXBv57K3 "Link to this Equation")
    
-   Terminal condition:  $\ \boldsymbol{\lambda}_T = \nabla_{\mathbf{x}} c_T(\mathbf{x}_T) + \big[\nabla_{\mathbf{x}} \mathbf{h}(\mathbf{x}_T)\big]^\top \boldsymbol{\nu}$.
    
-   Control stationarity (unconstrained control):  $\ \nabla_{\mathbf{u}} H_t(\cdot)=\mathbf{0}$; with a convex control set $\mathcal{U}_t$,  $\ \mathbf{0}\in \nabla_{\mathbf{u}} H_t(\cdot)+N_{\mathcal{U}_t}(\mathbf{u}_t)$.
    
-   Path inequalities:  $\ \mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t)\le \mathbf{0}$,  $\ \boldsymbol{\mu}_t\ge\mathbf{0}$, and complementarity  $\ \mu_{t,i}\,g_{t,i}(\mathbf{x}_t,\mathbf{u}_t)=0$ for all $i$.
    
-   Terminal equalities (if present):  $\ \mathbf{h}(\mathbf{x}_T)=\mathbf{0}$.
    

Here $H_t(\mathbf{x}_t,\mathbf{u}_t,\boldsymbol{\lambda}_{t+1},\boldsymbol{\mu}_t):=c_t(\mathbf{x}_t,\mathbf{u}_t)+\boldsymbol{\lambda}_{t+1}^\top\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)+\boldsymbol{\mu}_t^\top\mathbf{g}_t(\mathbf{x}_t,\mathbf{u}_t)$ is the stage Hamiltonian.

**Recap.** The discrete-time Pontryagin principle is the KKT system for trajectory optimization, organized to exploit temporal structure. It has a forward-backward decomposition: states propagate forward through the dynamics, while costates propagate backward through the adjoint equation. The Hamiltonian $H_t$ packages together the stage cost, the dynamics (weighted by the next costate), and any path constraints (weighted by their multipliers). Control stationarity says that optimal controls are stationary points of the Hamiltonian at each stage (zero gradient, or the variational inequality when $\mathcal{U}_t$ is constrained); when $H_t$ is convex in $\mathbf{u}_t$, as in the LQR setting, stationarity strengthens to minimization of the Hamiltonian. Complementarity ensures that only binding constraints carry nonzero multipliers. This structure underlies both analytical solution methods (such as LQR) and numerical algorithms (such as the adjoint method for gradient computation).

<a id="the-adjoint-equation-as-reverse-accumulation"></a>

## The adjoint equation as reverse accumulation

The costate equations characterize stationarity, but can the same backward recursion compute every control derivative with one reverse sweep?

Optimization needs sensitivities. In trajectory problems we adjust decisions (controls or parameters) to reduce an objective while respecting dynamics and constraints. First‑order methods in the unconstrained case (e.g., gradient descent, L‑BFGS, Adam) require the gradient of the objective with respect to all controls, and constrained methods (SQP, interior‑point) require gradients of the Lagrangian, i.e., of costs and constraints. The discrete‑time adjoint equations provide these derivatives in a way that scales to long horizons and many decision variables.

Consider

<a id="StcL2GiWBe"></a>

$$
J = c_T(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t),
\qquad \mathbf{x}_{t+1}=\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t).
$$

[(14)](#StcL2GiWBe "Link to this Equation")

A single forward rollout computes and stores the trajectory $\mathbf{x}_{1:T}$. A single backward sweep then applies the reverse‑mode chain rule stage by stage.

Before reading on

Try applying the chain rule to compute how a perturbation to the state at time $t$ affects the total cost $J$. Start from $\partial J / \partial \mathbf{x}_T$ and work backward. What pattern emerges?

Defining the costate by

<a id="UOsZgssRNy"></a>

$$
\boldsymbol{\lambda}_T = \nabla_{\mathbf{x}} c_T(\mathbf{x}_T),\qquad
\boldsymbol{\lambda}_t = \nabla_{\mathbf{x}} c_t(\mathbf{x}_t,\mathbf{u}_t) + \big[\nabla_{\mathbf{x}} \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)\big]^\top \boldsymbol{\lambda}_{t+1},\quad t=T-1,\dots,1,
$$

[(15)](#UOsZgssRNy "Link to this Equation")

yields exactly the discrete‑time adjoint (PMP) recursion.

Check your understanding

What terms would you expect to appear in the gradient $\nabla_{\mathbf{u}_t} J$? The control $\mathbf{u}_t$ affects $J$ in two ways: directly through the stage cost $c_t$, and indirectly by changing the next state $\mathbf{x}_{t+1}$. How should these contributions combine?

The gradient with respect to each control follows from the same reverse pass:

<a id="jrtyZifeXJ"></a>

$$
\nabla_{\mathbf{u}_t} J = \nabla_{\mathbf{u}} c_t(\mathbf{x}_t,\mathbf{u}_t) + \big[\nabla_{\mathbf{u}} \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)\big]^\top \boldsymbol{\lambda}_{t+1}.
$$

[(16)](#jrtyZifeXJ "Link to this Equation")

This reverse accumulation produces every control gradient with one forward rollout and one backward adjoint pass. The costate $\boldsymbol{\lambda}_t$ measures the marginal effect of perturbing the state at time $t$ on the total objective. Each control gradient combines a direct contribution from $c_t$ with an indirect contribution through the next state. Backpropagation through an unrolled dynamical system performs the same calculation.

Finite differences instead perturb one decision at a time and rerun the system. They require on the order of $p$ rollouts for $p=(T-1)m$ control variables and introduce a finite-difference step size. Forward-mode sensitivities propagate a separate Jacobian-vector product for each parameter direction, so their work also scales with $p$. Reverse mode propagates one costate vector backward and reads all partial derivatives from that sweep. For a scalar objective, this replaces one rollout per parameter by one forward-backward pass, at the cost of storing or checkpointing the state trajectory.

The adjoint recursion is therefore the reverse-mode derivative of the trajectory objective. States carry the nominal trajectory forward, costates carry its sensitivity backward, and the local control derivatives combine the two at each stage.

<a id="summary-and-outlook"></a>

## Summary and Outlook

The KKT conditions organize local optimality into primal feasibility, stationarity, dual feasibility, and complementarity. Applied along a trajectory, they give the discrete-time Pontryagin principle. States propagate forward, costates propagate backward, and the Hamiltonian supplies the local control stationarity condition. The same backward recursion computes all control gradients with one reverse pass.

The necessary conditions do not choose how states and actions should be exposed to a numerical solver. Should the states remain decision variables, be eliminated by forward simulation, or appear only at segment boundaries? [Numerical trajectory optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md) compares those formulations.

<a id="exercises"></a>

## Exercises

<a id="ex-trajectories-costate"></a>

[Exercise 1](#ex-trajectories-costate "Link to this Exercise") (Costate recursion as sensitivity)

Consider an unconstrained DOCP with objective $J = c_T(x_T) + \sum_{t=1}^{T-1} c_t(x_t, u_t)$ and dynamics $x_{t+1} = f_t(x_t, u_t)$.

**(a)** Define the value-to-go from time $t$ as $V_t(x_t) = \min_{u_{t:T-1}} \left[ c_T(x_T) + \sum_{s=t}^{T-1} c_s(x_s, u_s) \right]$. Show that at an optimal trajectory, $\nabla_{x_t} V_t(x_t^\star) = \lambda_t^\star$, where $\lambda_t$ is the costate.

**(b)** Interpret the costate economically: what does $\lambda_t$ measure?

Solution to [Exercise 1](#ex-trajectories-costate)

By definition, $V_t(x_t)$ is the minimum future cost starting from $x_t$. At the optimal trajectory, the envelope theorem gives $\nabla_{x_t} V_t = \lambda_t$, the marginal value of the state. Economically, $\lambda_t$ is the rate at which the optimal cost-to-go changes under a small perturbation of the state $x_t$ (the cost increases by approximately $\lambda_t^\top \delta x_t$ for a perturbation $\delta x_t$)—it is the “shadow price” of the state at time $t$.

* * *

<a id="ex-trajectories-adjoint"></a>

[Exercise 2](#ex-trajectories-adjoint "Link to this Exercise") (Adjoint gradient verification)

For the system $x_{t+1} = x_t^2 + u_t$ with $x_1 = 0.5$, $T = 4$, and objective $J = x_4$:

**(a)** Compute the gradient $\nabla_{u} J$ using finite differences (perturb each $u_t$ by $\epsilon = 10^{-5}$).

**(b)** Compute the gradient using the adjoint method: first simulate forward to get $x_{1:4}$, then propagate costates backward using $\lambda_4 = 1$ and $\lambda_t = 2x_t \lambda_{t+1}$.

**(c)** Verify that the two methods give the same answer. Which is more efficient for large $T$?

Solution to [Exercise 2](#ex-trajectories-adjoint)

For controls $u = [0, 0, 0]$: forward simulation gives $x_1 = 0.5$, $x_2 = 0.25$, $x_3 = 0.0625$, $x_4 = 0.00390625$.

Adjoint: $\lambda_4 = 1$, $\lambda_3 = 2(0.0625)(1) = 0.125$, $\lambda_2 = 2(0.25)(0.125) = 0.0625$, $\lambda_1 = 2(0.5)(0.0625) = 0.0625$.

Control gradients: $\nabla_{u_t} J = \lambda_{t+1}$, so $\nabla_u J = [\lambda_2, \lambda_3, \lambda_4] = [0.0625, 0.125, 1.0]$.

Finite differences should match. The adjoint is $O(T)$ work (one forward rollout and one backward pass) regardless of the number of controls; finite differences require one rollout per control variable, that is $O(T m)$ rollouts of $O(T)$ each, for $O(T^2 m)$ total work with $m$\-dimensional control.

* * *

[

Open-Loop Optimal Control

Finite-Horizon Optimal Control Problems


](06-discrete-time-optimal-control.md)[

Open-Loop Optimal Control

Numerical Trajectory Optimization


](08-numerical-trajectory-optimization.md)


---

# CHAPITRE 08 — Numerical Trajectory Optimization

Section du livre : Open-Loop Optimal Control

Page originale : https://pierrelucbacon.com/rlbook/numerical-trajectory-optimization

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md

> **Cours de Pierre-Luc Bacon — 08.** [Page publiée](https://pierrelucbacon.com/rlbook/numerical-trajectory-optimization) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/08-numerical-trajectory-optimization.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Numerical Trajectory Optimization

<a id="skip-to-article"></a>

The Pontryagin recursion exposes the temporal structure of first-order optimality, but a solver still needs a finite vector of variables and constraints. Should the states remain explicit, be eliminated by simulation, or appear only at selected segment boundaries?

Each choice recasts the discrete-time optimal control problem as a standard nonlinear program (NLP). Collect all decision variables (states, controls, and any auxiliary variables) into a single vector $\mathbf{z}\in\mathbb{R}^{n_z}$ and write

<a id="EIN8sQk8N8"></a>

$$
\begin{aligned}
\min_{\mathbf{z}\in\mathbb{R}^{n_z}} \quad & F(\mathbf{z}) \\
\text{s.t.} \quad & H(\mathbf{z}) = 0, \\
& G(\mathbf{z}) \le 0,
\end{aligned}
$$

[(1)](#EIN8sQk8N8 "Link to this Equation")

with maps $F:\mathbb{R}^{n_z}\to\mathbb{R}$, $H:\mathbb{R}^{n_z}\to\mathbb{R}^{r_e}$, and $G:\mathbb{R}^{n_z}\to\mathbb{R}^{r_i}$. In optimal control, $H$ typically encodes dynamics and boundary conditions, while $G$ captures path and box constraints.

Thus uppercase $G$ stacks the inequalities $g_i\leq0$, and uppercase $H$ stacks the equalities $h_i=0$, following the conventions of the optimal-control formulation and the nonlinear-programming appendix.

There are multiple ways to arrive at (and benefit from) this NLP:

-   Simultaneous (direct transcription / full discretization): keep all states and controls as variables and impose the dynamics as equality constraints. This is straightforward and exposes sparsity, but the problem can be large unless solver-side techniques (e.g., condensing) are exploited.
    
-   Sequential (recursive elimination / single shooting): eliminate states by forward propagation from the initial condition, leaving controls as the main decision variables. This reduces dimension and constraints, but can be sensitive to initialization and longer horizons.
    
-   Multiple shooting: introduce state variables at segment boundaries and enforce continuity between simulated segments. This compromises between size and conditioning and is often more robust than pure single shooting.
    

<a id="learning-goals"></a>

## Learning Goals

After working through the examples and exercises, you should be able to:

-   Formulate simultaneous, single-shooting, and multiple-shooting programs.
    
-   Compare their variables, constraints, sparsity, and sensitivity paths.
    
-   Differentiate a rollout in reverse mode to measure how each control affects the terminal state, and relate that sensitivity to the conditioning of a shooting program.
    
-   Construct continuity defects between independently simulated segments and check a computed trajectory against its dynamics and constraints.
    

<a id="prerequisites"></a>

## Prerequisites

The formulations use the [finite-horizon optimal-control problem](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md) and its [Pontryagin recursion](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/07-discrete-time-pmp.md). The [nonlinear-programming appendix](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/31-appendix-nlp.md) reviews constrained optimization, derivatives, and numerical solvers.

<a id="simultaneous-methods"></a>

## Simultaneous Methods

What numerical structure appears when every state and action remains an optimization variable and each transition becomes an equality constraint?

In the simultaneous (also called direct transcription or full discretization) approach, we keep the entire trajectory explicit and enforce the dynamics as equality constraints. Starting from the Bolza DOCP,

<a id="BfAWVHe2em"></a>

$$
\min_{\{\mathbf{x}_t,\mathbf{u}_t\}}\; c_T(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t)
\quad\text{s.t.}\quad \mathbf{x}_{t+1} - \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t) = 0,\; t=1,\dots,T-1,
$$

[(2)](#BfAWVHe2em "Link to this Equation")

collect all variables into a single vector

<a id="nRgYOgy3kO"></a>

$$
\mathbf{z} := \begin{bmatrix}
\mathbf{x}_1^\top & \cdots & \mathbf{x}_T^\top & \mathbf{u}_1^\top & \cdots & \mathbf{u}_{T-1}^\top
\end{bmatrix}^\top \in \mathbb{R}^{n_z}.
$$

[(3)](#nRgYOgy3kO "Link to this Equation")

The dynamics residual is written here as $\mathbf{x}_{t+1}-\mathbf f_t$. Its multiplier is the negative of the Pontryagin costate, which multiplies $\mathbf f_t-\mathbf{x}_{t+1}$; reversing an equality residual changes its multiplier sign but leaves the feasible trajectories unchanged.

Path constraints typically apply only at selected times. Let $\mathscr{E}$ index additional equality constraints $h_i$ and $\mathscr{I}$ index inequality constraints $g_i$. For each constraint $i$, define the set of time indices $K_i \subseteq \{1,\dots,T\}$ where it is enforced (e.g., terminal constraints use $K_i = \{T\}$). The simultaneous transcription is the NLP

<a id="yGOOu6FNYx"></a>

$$
\begin{aligned}
\min_{\mathbf{z}}\quad & F(\mathbf{z}) := c_T(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t) \\
\text{s.t.}\quad & H(\mathbf{z}) = \begin{bmatrix}
\big[\, h_i(\mathbf{x}_k,\mathbf{u}_k) \big]_{i\in\mathscr{E},\, k\in K_i} \\
\big[\, \mathbf{x}_{t+1} - \mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t) \big]_{t=1: T-1} \\
\mathbf{x}_1 - \mathbf{x}_\mathrm{init}
\end{bmatrix} = \mathbf{0}, \\
& G(\mathbf{z}) = \big[\, g_i(\mathbf{x}_k,\mathbf{u}_k) \big]_{i\in\mathscr{I},\, k\in K_i} \; \le \; \mathbf{0},
\end{aligned}
$$

[(4)](#yGOOu6FNYx "Link to this Equation")

optionally with simple bounds $\mathbf{x}_{\mathrm{lb}} \le \mathbf{x}_t \le \mathbf{x}_{\mathrm{ub}}$ and $\mathbf{u}_{\mathrm{lb}} \le \mathbf{u}_t \le \mathbf{u}_{\mathrm{ub}}$ folded into $G$ or provided to the solver separately. For notational convenience, some constraints may not depend on $\mathbf{u}_k$ at times in $K_i$; the indexing still helps specify when each condition is active.

This direct transcription is attractive because it is faithful to the model and exposes sparsity. The Jacobian of $H$ has a block bi-diagonal structure induced by the dynamics, and the KKT matrix is sparse and structured. These properties are exploited by interior-point and SQP methods. The trade-off is size: with state dimension $n$ and control dimension $m$, the decision vector has $(T\!\cdot\!n) + ((T\!-
1)\cdot m)$ entries, and there are roughly $(T\!-
1)\cdot n$ dynamic equalities plus any path and boundary conditions. Techniques such as partial or full condensing eliminate state variables to reduce the equality set (at the cost of denser matrices), while keeping states explicit preserves sparsity and often improves robustness on long horizons and in the presence of state constraints.

Compared to alternatives, simultaneous methods avoid the long nonlinear dependency chains of single shooting and make it easier to impose state/path constraints. They can, however, demand more memory and per-iteration linear algebra, so practical performance hinges on exploiting sparsity and good initialization.

The same logic applies when selecting an optimizer. For small-scale problems, it is common to rely on general-purpose routines such as those in `scipy.optimize.minimize`. Derivative-free methods like Nelder–Mead require no gradients but scale poorly as dimensionality increases. Quasi-Newton schemes such as BFGS work well for moderate dimensions and can approximate gradients by finite differences, while large-scale trajectory optimization often calls for gradient-based constrained solvers such as interior-point or sequential quadratic programming methods that can exploit sparse Jacobians and benefit from automatic differentiation. Stochastic techniques, including genetic algorithms, simulated annealing, or particle swarm optimization, occasionally appear when gradients are unavailable, but their cost grows rapidly with dimension and they are rarely competitive for structured optimal control problems.

<a id="example-nonlinear-cart-pole-swing-up"></a>

### Example: Nonlinear Cart-Pole Swing-Up

A cart carries a rigid pendulum whose angle is measured from the upright vertical. The cart can accelerate horizontally, but no actuator applies torque directly at the pendulum joint. Starting from the stable downward configuration, the task is to move the base so that the pendulum arrives upright while the cart returns near the center of a finite rail.

Let the state be $\mathbf{x}=(p,v,\theta,\omega)$, where $p$ and $v$ are the cart position and velocity, and $\theta$ and $\omega$ are the pendulum angle and angular velocity. A commanded horizontal acceleration $u$ produces the nonlinear dynamics

<a id="HJn2mBZQEx"></a>

$$
\dot p = v, \qquad
\dot v = u, \qquad
\dot\theta = \omega, \qquad
\dot\omega = \frac{g}{\ell}\sin\theta
                 - \frac{u}{\ell}\cos\theta
                 - b\omega.
$$

[(5)](#HJn2mBZQEx "Link to this Equation")

The factor $-u\cos\theta/\ell$ identifies the action channel. Horizontal base motion couples into angular acceleration, and its sign and magnitude depend on the current configuration. A black-box optimizer could evaluate these equations without inspecting that term, but the term explains why the cart must first move away from its eventual resting position to build pendulum energy.

The numerical experiment uses a 4.5 s horizon with $N=30$ zero-order-hold controls and a step size $h=0.15$ s. Fourth-order Runge--Kutta integration defines the discrete map $\mathbf{x}_{k+1}=F_h(\mathbf{x}_k,u_k)$. Both numerical formulations solve the same problem:

<a id="DdrTpi3aQc"></a>

$$
\begin{aligned}
\min_{\mathbf{x}_{0:N},u_{0:N-1}}\quad
& h\sum_{k=0}^{N-1}\Bigl[
0.05p_k^2+0.01v_k^2+0.25(1-\cos\theta_k)
+0.01\omega_k^2+0.004u_k^2\Bigr] \\
& {}+20p_N^2+5v_N^2+120(1-\cos\theta_N)+12\omega_N^2 \\
\text{subject to}\quad
& \mathbf{x}_{k+1}=F_h(\mathbf{x}_k,u_k), \\
& \mathbf{x}_0=(0,0,\pi,0), \\
& |p_k|\leq 2.4,\quad |v_k|\leq 4,\quad
  |\omega_k|\leq 12,\quad |u_k|\leq 8.
\end{aligned}
$$

[(6)](#DdrTpi3aQc "Link to this Equation")

The periodic penalty $1-\cos\theta$ assigns the same terminal cost to angles that differ by a full revolution. Position and velocity penalties still require the cart to finish near rest, so rotating the pole through the top is not enough by itself.

Direct transcription retains all 31 states and 30 controls. It therefore optimizes over 154 scalar variables and imposes 124 scalar equalities, including the initial condition and one four-dimensional dynamics equation per step. The equality Jacobian is block banded because the residual at step $k$ depends only on $(\mathbf{x}_k,u_k,\mathbf{x}_{k+1})$.

The small demonstration below passes that Jacobian to SLSQP as a dense array. A large-scale direct solver would instead store and factor the same block-banded pattern sparsely. The formulation exposes sparsity, but exploiting it is a separate implementation choice.

Prediction before computation

Single shooting will reduce the decision vector from 154 variables to 30. Before examining the matched runs below, predict whether the smaller program must be easier to optimize. Identify which constraints become less explicit after the states are eliminated.

<a id="sequential-methods"></a>

## Sequential Methods

Can eliminating the states reduce the nonlinear program without making the resulting long simulation chain too sensitive to early actions?

The previous section showed how a discrete-time optimal control problem can be solved by treating all states and controls as decision variables and enforcing the dynamics as equality constraints. This produces a nonlinear program that can be passed to solvers such as `scipy.optimize.minimize` with the SLSQP method. For short horizons, this approach is straightforward and works well; the code stays close to the mathematical formulation.

It also has a real advantage: by keeping the states explicit and imposing the dynamics through constraints, we anchor the trajectory at multiple points. This extra structure helps stabilize the optimization, especially for long horizons where small deviations in early steps can otherwise propagate and cause the optimizer to drift or diverge. In that sense, this formulation is better conditioned and more robust than approaches that treat the dynamics implicitly.

The drawback is scale. As the horizon grows, the number of variables and constraints grows with it, and all are coupled by the dynamics. Each iteration of a sequential quadratic programming (SQP) or interior-point method requires building and factorizing large Jacobians and Hessians. These methods have been embedded in reinforcement learning and differentiable programming pipelines, through implicit layers or differentiable convex solvers, but the cost is significant. They remain serial, rely on repeated linear algebra factorizations, and are difficult to parallelize efficiently. When thousands of such problems must be solved inside a learning loop, the overhead becomes prohibitive.

This motivates an alternative that aligns with the computational model of machine learning. For deterministic dynamics, the equality constraints can be eliminated by making the states implicit. Instead of solving for both states and controls, we fix the initial state and roll the system forward under a candidate control sequence. State constraints can remain, but they become nonlinear functions of the entire preceding control sequence. This is the essence of **single shooting**.

The term “shooting” comes from the idea of _aiming and firing_ a trajectory from the initial state: you pick a control sequence, integrate (or step) the system forward, and see where it lands. If the final state misses the target, you adjust the controls and try again: like adjusting the angle of a shot until it hits the mark. It is called **single** shooting because we compute the entire trajectory in one pass from the starting point, without breaking it into segments. Later, we will contrast this with **multiple shooting**, where the horizon is divided into smaller arcs that are optimized jointly to improve stability and conditioning.

The analogy with deep learning is also immediate: the control sequence plays the role of parameters, the rollout is a forward pass, and the cost is a scalar loss. Gradients can be obtained with reverse-mode automatic differentiation. In the single shooting formulation of the DOCP, the constrained program

<a id="ab9lT3BZLc"></a>

$$
\min_{\mathbf{x}_{1:T},\,\mathbf{u}_{1:T-1}} J(\mathbf{x}_{1:T},\mathbf{u}_{1:T-1})
\quad\text{s.t.}\quad
\mathbf{x}_{t+1}=\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)
$$

[(7)](#ab9lT3BZLc "Link to this Equation")

collapses to

<a id="RFJTMUtApS"></a>

$$
\min_{\mathbf{u}_{1:T-1}}\;
c_T\!\bigl(\boldsymbol{\phi}_{T}(\mathbf{u}, \mathbf{x}_1)\bigr)
+\sum_{t=1}^{T-1} c_t\!\bigl(\boldsymbol{\phi}_{t}(\mathbf{u}, \mathbf{x}_1), \mathbf{u}_t\bigr),
\quad\text{s.t.}\quad
\mathbf{g}_t\!\bigl(\boldsymbol{\phi}_{t}(\mathbf{u},\mathbf{x}_1),\mathbf{u}_t\bigr)\leq 0,
\quad
\mathbf{u}_{\mathrm{lb}}\le\mathbf{u}_{t}\le\mathbf{u}_{\mathrm{ub}}.
$$

[(8)](#RFJTMUtApS "Link to this Equation")

Here $\boldsymbol{\phi}_t$ denotes the state reached at time $t$ by recursively applying the dynamics to the previous state and current control. This recursion can be written as

<a id="AMOhxba0F7"></a>

$$
\boldsymbol{\phi}_{t+1}(\mathbf{u},\mathbf{x}_1)=
\mathbf{f}_{t}\!\bigl(\boldsymbol{\phi}_{t}(\mathbf{u},\mathbf{x}_1),\mathbf{u}_t\bigr),\qquad
\boldsymbol{\phi}_{1}=\mathbf{x}_1.
$$

[(9)](#AMOhxba0F7 "Link to this Equation")

Concretely, here is JAX-style pseudocode for defining `phi(u, x_0, t)` using `jax.lax.scan` with a zero-based time index:

```python
def phi(u_seq, x0, t):
    """Return \phi_t(u, x0) with 0-based t (\phi_0 = x0).

    u_seq: controls of length T (or T-1); only first t entries are used
    x0: initial state at time 0
    t: integer >= 0
    """
    if t <= 0:
        return x0

    def step(carry, u):
        x, t_idx = carry
        x_next = f(x, u, t_idx)
        return (x_next, t_idx + 1), None

    (x_t, _), _ = lax.scan(step, (x0, 0), u_seq[:t])
    return x_t
```

The pattern mirrors an RNN unroll: starting from an initial state ($\mathbf{x}^\star_1$) and a sequence of controls ($\mathbf{u}^*_{1:T-1}$), we propagate forward through the dynamics, updating the state at each step and accumulating cost along the way. This structural similarity is why single shooting often feels natural to practitioners with a deep learning background: the rollout is a forward pass, and gradients propagate backward through time exactly as in backpropagation through an RNN.

Algorithmically:

<a id="single-shooting-forward-unroll"></a>

[Algorithm 1](#single-shooting-forward-unroll "Link to this Algorithm") (Single Shooting: Forward Unroll)

**Inputs**: Initial state $\mathbf{x}_1$, horizon $T$, control bounds $\mathbf{u}_{\mathrm{lb}}, \mathbf{u}_{\mathrm{ub}}$, dynamics $\mathbf{f}_t$, costs $c_t$

**Output**: Optimal control sequence $\mathbf{u}^*_{1:T-1}$

1.  Initialize $\mathbf{u}_{1:T-1}$ within bounds
    
2.  Define `ComputeTrajectoryAndCost`($\mathbf{u}, \mathbf{x}_1$):
    
    -   $\mathbf{x} \leftarrow \mathbf{x}_1$, $J \leftarrow 0$
        
    -   For $t = 1$ to $T-1$:
        
        -   $J \leftarrow J + c_t(\mathbf{x}, \mathbf{u}_t)$
            
        -   $\mathbf{x} \leftarrow \mathbf{f}_t(\mathbf{x}, \mathbf{u}_t)$
            
    -   $J \leftarrow J + c_T(\mathbf{x})$
        
    -   Return $J$
        
3.  Solve $\min_{\mathbf{u}} J(\mathbf{u})$ subject to the control bounds and any state constraints evaluated along the rollout
    
4.  Return $\mathbf{u}^*_{1:T-1}$
    

In JAX or PyTorch, this loop can be compiled and differentiated automatically. The control sequence plays the role of trainable parameters, while the simulated trajectory is the forward computation. Reverse-mode differentiation of that computation gives $\nabla J(\mathbf{u})$.

Single shooting is attractive for its simplicity and compatibility with differentiable programming, but it has limitations. Early controls influence every later state through a long product of dynamics Jacobians. This can make gradients poorly conditioned over long horizons. State constraints also lose their local sparse representation because each constrained state depends on all earlier controls. Formulations that keep selected states explicit, such as multiple shooting or collocation, shorten these dependency chains.

<a id="matched-swing-up-comparison"></a>

### Matched Swing-Up Comparison

The direct-transcription and single-shooting implementations below use the cart-pole problem stated above without changing the model, cost, limits, horizon, initial control guess, or nonlinear-programming solver. Only the decision variables and the representation of the dynamics differ.

<a id="qAx1B5TAL5"></a>

```python
from pathlib import Path
import sys

code_directory = Path.cwd() / "code"
if str(code_directory) not in sys.path:
    sys.path.insert(0, str(code_directory))

from cartpole_control import (
    SwingUpScenario,
    format_swingup_metrics,
    make_open_loop_perturbation_figure,
    make_swingup_animation,
    make_swingup_figure,
    replay_open_loop_with_disturbance,
    solve_swingup_comparison,
)

swingup_scenario = SwingUpScenario()
swingup_results = solve_swingup_comparison(swingup_scenario)
```

<a id="TSCYW9sOJC"></a>

<a id="fig-cartpole-formulations"></a>

<a id="fig-cartpole-formulations-code"></a>

```python
print(format_swingup_metrics(swingup_results))
make_swingup_figure(swingup_results, swingup_scenario)
```

[Figure 1:](#fig-cartpole-formulations "Link to this figure")Direct transcription and single shooting solve the same nonlinear cart-pole problem from the same initialization. Both reach the upright configuration and respect the matched limits, but they converge to different local solutions. Direct transcription retains 154 scalar variables and 124 local dynamics equalities; single shooting retains only the 30 controls and reconstructs every state by forward simulation.

<a id="fig-cartpole-formulations-outputs"></a>

```
method                variables  eqs  iterations  objective  final angle  defect
direct transcription    154  124         413      1.180      0.002 deg  1.3e-07
single shooting          30    0         430      2.675      0.130 deg  0.0e+00
```

![<Figure size 1080x352.5 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/7e8d549f41-df675e04c6ca5ea94457ccb6fd4e6be7.png)

![<Figure size 1080x352.5 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/7e8d549f41-df675e04c6ca5ea94457ccb6fd4e6be7.png)

Both solvers produce a successful open-loop swing-up. The direct formulation reaches a lower objective in this fixed run, while single shooting uses a much smaller decision vector. This numerical outcome does not establish that direct transcription always finds better solutions. It exposes a concrete trade-off: eliminating variables shortens the program but lengthens the dependency from an early control to the terminal cost and later constraints.

<a id="T1RwK2zplU"></a>

<a id="anim-cartpole-formulations"></a>

<a id="anim-cartpole-formulations-code"></a>

```python
from IPython.display import HTML, display
import matplotlib.pyplot as plt

swingup_animation = make_swingup_animation(swingup_results, swingup_scenario)
display(HTML(swingup_animation.to_jshtml()))
plt.close(swingup_animation._fig)
```

[Figure 2:](#anim-cartpole-formulations "Link to this figure")The two trajectories are generated by the same nonlinear RK4 plant. The pole starts downward and reaches the upright configuration while the cart remains inside the 2.4 m rail limits. Animation frames are computed from the optimized state trajectories; no browser-side simulator is used.

<a id="anim-cartpole-formulations-outputs"></a>

Loading...

The comparison also separates optimization from feedback. Each optimizer returns one fixed control sequence for one assumed initial state. To test what that object can and cannot do, the next replay applies the direct-transcription controls twice. One realization follows the nominal model. The other receives an additional cart acceleration of $1\;\mathrm{m\,s^{-2}}$ for one 0.15 s step at $t=2.1$ s, after which both realizations receive the same remaining commands.

<a id="tW5CQ7Zz9p"></a>

<a id="fig-cartpole-open-loop-perturbation"></a>

<a id="fig-cartpole-open-loop-perturbation-code"></a>

```python
open_loop_replay = replay_open_loop_with_disturbance(
    swingup_results["direct"],
    swingup_scenario,
)
make_open_loop_perturbation_figure(open_loop_replay)
```

[Figure 3:](#fig-cartpole-open-loop-perturbation "Link to this figure")A one-step unmodeled acceleration separates two realizations driven by the same open-loop controls. The nominal trajectory reaches normalized pole height $\cos\theta=1$; the disturbed trajectory finishes below the horizontal. The optimizer has produced a plan, not a rule that reacts to the observed state.

<a id="fig-cartpole-open-loop-perturbation-outputs"></a>

![<Figure size 1080x352.5 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/63967ddef0-46219a5e48a9923fad2ed834cf6a40c5.png)

Feedback changes the object being computed. A feedback controller maps the state observed after the disturbance to a new action. Model predictive control will obtain such a map by repeatedly solving trajectory problems, while dynamic programming will construct state-contingent decisions through the value function.

Inspect the shared nonlinear dynamics

cartpole\_control.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
```

[Download the complete cart-pole trajectory-optimization and control source](https://pierrelucbacon.com/rlbook/build/cartpole_control-d3957d6280d7c1453fe01480d080b46a.py).

<a id="sec-truck-alley-dock"></a>

### Example: Alley-Docking a Semi Truck

The cart-pole comparison kept the solver fixed and changed the decision variables. This example stays with single shooting and asks what its one long rollout does to the derivatives the optimizer receives. A tractor-semitrailer backing into a loading bay is a useful test because the rig has a well-known instability: in reverse, a small steering error grows into a jackknife unless it is corrected. That growth is the long product of dynamics Jacobians mentioned above, and it can be measured on the solution.

**The model.** The state is the tractor’s rear-axle position $(p_x, p_y)$, the tractor heading $\theta_0$, and the trailer heading $\theta_1$. The fifth wheel sits over the tractor’s rear axle, and the trailer axle trails it by $L_1 = 10\ \mathrm m$ along the trailer axis. The controls are the tractor speed $v$ and the steering angle $\delta$, which act through the kinematic model

<a id="evVGEnfxVD"></a>

$$
\dot p_x = v\cos\theta_0,\qquad
\dot p_y = v\sin\theta_0,\qquad
\dot\theta_0 = \frac{v}{L_0}\tan\delta,\qquad
\dot\theta_1 = \frac{v}{L_1}\sin(\theta_0-\theta_1),
$$

[(10)](#evVGEnfxVD "Link to this Equation")

with tractor wheelbase $L_0 = 4.5\ \mathrm m$. The hitch angle $\beta = \theta_0 - \theta_1$ is zero when the rig is straight. The controls are held constant over intervals of $0.25\ \mathrm s$, each integrated with one RK4 step, and $T = 160$ intervals cover a fixed $40\ \mathrm s$ maneuver. Speed is bounded by $\pm 1.5\ \mathrm{m/s}$ and steering by $\pm 30^\circ$.

**The maneuver.** The dock face is the line $p_y = 0$ and the bay is centered on $p_x = 0$. The rig starts in a lane parallel to the dock, $19\ \mathrm m$ out, pointing along $+x$ with the trailer behind it. It must end straight and pointing away from the dock, with the trailer’s rear bumper $0.5\ \mathrm m$ from the face. A second scenario exchanges the endpoints: the rig starts docked and must pull out to the lane position.

**The program.** Single shooting keeps only the $2T = 320$ control values as decision variables. The objective is the cost of the rollout they generate,

<a id="qs1nkG0NEg"></a>

$$
J(\mathbf u) = \sum_{t=0}^{T-1} c\bigl(\boldsymbol\phi_t(\mathbf u,\mathbf x_0),\mathbf u_t\bigr) + r(\mathbf u) + c_T\bigl(\boldsymbol\phi_T(\mathbf u,\mathbf x_0)\bigr).
$$

[(11)](#qs1nkG0NEg "Link to this Equation")

The stage cost charges speed, steering, and the distance between the trailer axle and its target, and adds two smooth penalties evaluated on the rolled-out state: one for any body corner closer than $0.2\ \mathrm m$ to the dock face and one for hitch angles beyond $60^\circ$. These are state constraints of the kind discussed above, and in this formulation each one becomes a function of every earlier control. The term $r(\mathbf u)$ depends on the controls alone. It charges changes between consecutive intervals and a moving final interval. The terminal cost penalizes the trailer-axle position error, the trailer heading error, and the hitch angle. The control bounds stay explicit and are handled by the solver.

The implementation follows [Algorithm 1](#single-shooting-forward-unroll). A `jax.lax.scan` rollout produces the states, the cost is accumulated along it, and `jax.value_and_grad` returns $J(\mathbf u)$ with its gradient by reverse mode. SciPy’s L-BFGS-B receives both, together with the box on each control, and stops when the projected gradient falls below 10\-5 or the relative decrease of $J$ falls below 10\-10. The seed is a straight creep at $0.5\ \mathrm{m/s}$ in the relevant direction: backing for the docking scenario and forward for the pull-out.

<a id="fig-truck-iterations"></a>

<a id="A7n9SDPI1U"></a>
![Four L-BFGS-B iterates of the backing solve. Each panel is a complete
rollout of the current control sequence, with the trailer-axle path in blue
and rig outlines every ten seconds; the dotted outline is the target. The
seed backs straight along the lane. By iteration 10 the trailer swings toward
the bay, and the final plan docks it.](../Assets/Website/9b7ef391e5-iterations-afd50fc23f539c69a270b30b95226d04.svg)

[Figure 4:](#fig-truck-iterations "Link to this figure")Four L-BFGS-B iterates of the backing solve. Each panel is a complete rollout of the current control sequence, with the trailer-axle path in blue and rig outlines every ten seconds; the dotted outline is the target. The seed backs straight along the lane. By iteration 10 the trailer swings toward the bay, and the final plan docks it.

<a id="fig-truck-paths"></a>

[Démonstration interactive — Semi-truck alley dock by single shooting](https://pierrelucbacon.com/interactive/truck-parking.html)

[Figure 5:](#fig-truck-paths "Link to this figure")Final plans for both scenarios. The blue curve is the trailer axle, the dashed orange curve the tractor axle, and the dotted gray line the straight seed. Outlines show the rig every five seconds. In the online book this figure is a replay: choose a scenario and an optimizer checkpoint, then scrub or play simulation time within that fixed plan. The path ahead and the translucent outlines show the plan’s remaining states; the tiles and plots belong to the selected checkpoint, including early ones that do not dock.

| Scenario | Stop | Iterations | Objective evaluations | Initial cost | Final cost |
| --- | --- | --- | --- | --- | --- |
| Backing into the bay | small decrease | 821 | 1750 | 5666.9 | 12.2009 |
| Pulling out of the bay | small decrease | 510 | 1044 | 5666.9 | 11.3762 |

The arrival checks below use the finer replay.

| Scenario | Trailer-axle error (m) | Trailer heading error (°) | Hitch angle (°) | Clearance (m) | Largest hitch angle (°) | Distance (m) |
| --- | --- | --- | --- | --- | --- | --- |
| Backing into the bay | 0.0031 | 0.872 | 1.72 | 0.466 | 45.4 | 32.2 |
| Pulling out of the bay | 0.00205 | 0.599 | 1.3 | 0.500 | 42.5 | 36.1 |

Amplification of a steering perturbation into the terminal hitch angle, at the first control interval of each plan.

| Plan | Reverse mode | Per-interval product |
| --- | --- | --- |
| Backing into the bay | 14.2 | 14.2 |
| Pulling out of the bay | 0.0737 | 0.0737 |
| Backing plan driven forward | 0.0695 | 0.0695 |

Both solves stop on a small relative decrease of the objective and pass the arrival checks, which replay the final controls with four RK4 substeps per interval. Backing needed 821 iterations and 1750 objective evaluations, pulling out 510 and 1044. The docking plan backs at the speed limit for the first 17 seconds. Its steering starts at $+21^\circ$, which bends the rig, sweeps through zero, and reaches $-29^\circ$ at 17 seconds as the trailer swings toward the bay; speed and steering then relax together as the rig straightens. The hitch angle peaks near $45^\circ$, inside the $60^\circ$ limit ([Figure 6](#fig-truck-plan)). The pull-out plan overshoots the lane position slightly and backs up to straighten the rig, which is why its distance is longer.

<a id="fig-truck-plan"></a>

<a id="Ac0h4EOLxe"></a>
![Left: the final backing plan, that is, the 320 numbers the optimizer
returns. Speed saturates at the reverse limit and steering approaches its
30^\circ limit before both relax as the rig straightens. Right: the hitch
angle along both final plans; dotted lines mark the 60^\circ penalty
threshold.](../Assets/Website/3efa432549-plan-3026d655f873b1c3d0b17f11fcbc7cb7.svg)

[Figure 6:](#fig-truck-plan "Link to this figure")Left: the final backing plan, that is, the 320 numbers the optimizer returns. Speed saturates at the reverse limit and steering approaches its $30^\circ$ limit before both relax as the rig straightens. Right: the hitch angle along both final plans; dotted lines mark the $60^\circ$ penalty threshold.

**Measuring the sensitivity chain.** Subtracting the two heading equations gives a closed equation for the hitch angle,

<a id="XXqwMGkY3j"></a>

$$
\dot\beta = \frac{v}{L_0}\tan\delta - \frac{v}{L_1}\sin\beta .
$$

[(12)](#XXqwMGkY3j "Link to this Equation")

Along a given plan, a small hitch perturbation $\Delta\beta$ evolves as $\Delta\dot\beta = -(v\cos\beta/L_1)\,\Delta\beta$. Driving forward, $v>0$, the coefficient is negative and the perturbation decays. Backing, $v<0$, it is positive and the perturbation grows: this is the jackknife instability. Over one control interval of length $\Delta t$ the perturbation is multiplied by $\exp(-v\cos\beta\,\Delta t/L_1)$, and the effect of a steering change at interval $t$ on the terminal hitch angle is the product of these factors over all later intervals. For a straight rig the product is $\exp(d_t/L_1)$, where $d_t$ is the distance still to be backed after interval $t$: every ten metres of backing multiplies an uncorrected hitch error by $e$.

This product is what reverse-mode differentiation computes through the rollout. [Figure 7](#fig-truck-conditioning) compares the two. The dots are $\partial\beta_T/\partial\delta_t$ from `jax.jacrev`, divided by the tractor heading change that the same steering causes within interval $t$, so that a value of one means the rest of the rollout neither amplifies nor attenuates the error. The lines are the products of per-interval factors along the same plan. They agree to within half a percent. For the backing plan, a steering error at the start of the maneuver is amplified fourteen times by the time the trailer reaches the dock. For the same path driven forward, obtained by reversing the control sequence and the sign of the speed, an early steering error is attenuated to 0.07 of its immediate effect, because the trailer follows the tractor and forgets.

<a id="fig-truck-conditioning"></a>

<a id="doczjEpMVK"></a>
![Left: amplification of a steering perturbation into the terminal hitch
angle, per control interval, for the final backing plan and for the same
path driven forward. Dots come from reverse-mode differentiation of the
rollout; lines are products of the linearized per-interval hitch Jacobians.
Intervals with speed below 0.1\ \mathrm{m/s} are omitted because a
stationary tractor cannot steer. Right: objective value at every L-BFGS-B
iteration for the two scenarios, which start from the same seed cost.](../Assets/Website/1230069b4f-conditioning-5f96b6d72f72141ca223a31c2e7e58ef.svg)

[Figure 7:](#fig-truck-conditioning "Link to this figure")Left: amplification of a steering perturbation into the terminal hitch angle, per control interval, for the final backing plan and for the same path driven forward. Dots come from reverse-mode differentiation of the rollout; lines are products of the linearized per-interval hitch Jacobians. Intervals with speed below $0.1\ \mathrm{m/s}$ are omitted because a stationary tractor cannot steer. Right: objective value at every L-BFGS-B iteration for the two scenarios, which start from the same seed cost.

The consequence for the optimizer appears in the right panel. At the seed, the gradient of $J$ with respect to the first steering angle is about 800 in the backing scenario and about 200 in the pull-out, while the gradient with respect to the last steering angle is 0.04 in both. The curvature of $J$ varies across the decision vector in the same way, more strongly for backing. The backing solve descends more slowly, stops later, and ends with a projected gradient roughly three times larger than the pull-out solve. Two local solves do not establish a general rule, but they show the mechanism: eliminating the states did not remove the dynamics from the problem, it moved them into the derivatives. A longer backing distance multiplies the amplification by $e$ every ten metres, and the formulation of the next section shortens that chain by keeping selected states as variables.

Inspect the reduced objective and the L-BFGS-B driver

truck\_parking.py

```
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
```

-   [Truck model, costs, solver, and sensitivity](https://pierrelucbacon.com/rlbook/build/truck_parking-be977da9c7314da70a0d95eedfc50306.py)
    
-   [Experiment and figure builder](https://pierrelucbacon.com/rlbook/build/build_truck_parking_-06ed904ae8489795244b1fbf8e7c313d.py)
    
-   [Numerical diagnostics and source hashes](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/1e514a0659-metrics-fdbff6ae6c960784b2f506106bc44983.json)
    

Run `uv run python scripts/build_truck_parking_artifacts.py` from the repository root to reproduce the solves, figures, tables, and replay data. Normal book builds read those artifacts.

<a id="in-between-sequential-and-simultaneous"></a>

## In Between Sequential and Simultaneous

Can selected boundary states shorten those sensitivity paths while preserving local simulation inside each segment?

Before reading on

Consider what happens to single shooting when the horizon $T$ is very large. What numerical difficulties might arise? Think about how small errors in early controls could propagate through the dynamics.

The two formulations we have seen so far lie at opposite ends. The **full discretization** approach keeps every state explicit and enforces the dynamics through equality constraints, which makes the structure clear but leads to a large optimization problem. At the other end, **single shooting** removes these constraints by simulating forward from the initial state, leaving only the controls as decision variables. That makes the problem smaller, but it also introduces a long and highly nonlinear dependency from the first control to the last state.

**Multiple shooting** sits in between. Instead of simulating the entire horizon in one shot, we divide it into smaller segments. For each segment, we keep its starting state as a decision variable and propagate forward using the dynamics for that segment. At the end, we enforce continuity by requiring that the simulated end state of one segment matches the decision variable for the next.

Formally, suppose the horizon of $T$ steps is divided into $K$ segments of length $L$ (with $T = K \cdot L$ for simplicity). We introduce:

-   The controls for each step: $\mathbf{u}_{1:T-1}$.
    
-   The state at the start of each segment: $\mathbf{x}_1,\dots,\mathbf{x}_K$.
    

Given $\mathbf{x}_k$ and the controls in its segment, we compute the predicted terminal state by simulating forward:

<a id="Ei8WkeRFil"></a>

$$
\hat{\mathbf{x}}_{k+1} = \Phi(\mathbf{x}_k,\mathbf{u}_{\text{segment }k}),
$$

[(13)](#Ei8WkeRFil "Link to this Equation")

where $\Phi$ represents $L$ applications of the dynamics. Continuity constraints enforce:

<a id="vp4EFdbZJX"></a>

$$
\mathbf{x}_{k+1} - \hat{\mathbf{x}}_{k+1} = 0, \qquad k=1,\dots,K-1.
$$

[(14)](#vp4EFdbZJX "Link to this Equation")

The resulting nonlinear program looks like this:

<a id="LROo6xTAWp"></a>

$$
\begin{aligned}
\min_{\{\mathbf{x}_k,\mathbf{u}_t\}} \quad &
c_T(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t,\mathbf{u}_t) \\
\text{subject to} \quad &
\mathbf{x}_{k+1} - \Phi(\mathbf{x}_k,\mathbf{u}_{\text{segment }k}) = 0,\quad k = 1,\dots,K-1, \\
& \mathbf{u}_{\mathrm{lb}} \le \mathbf{u}_t \le \mathbf{u}_{\mathrm{ub}}, \\
& \text{boundary conditions on } \mathbf{x}_1 \text{ and } \mathbf{x}_K.
\end{aligned}
$$

[(15)](#LROo6xTAWp "Link to this Equation")

Compared to the full NLP, we no longer introduce every intermediate state as a variable, only the anchors at segment boundaries. Inside each segment, states are reconstructed by simulation. Compared to single shooting, these anchors break the long dependency chain that makes optimization unstable: gradients only have to travel across $L$ steps before they hit a decision variable, rather than the entire horizon. This is the same reason why exploding or vanishing gradients appear in deep recurrent networks: when the chain is too long, information either dies out or blows up. Multiple shooting shortens the chain and improves conditioning.

By adjusting the number of segments $K$, we can interpolate between the two extremes: $K = 1$ gives single shooting, while $K = T$ recovers the full direct NLP. In practice, a moderate number of segments often strikes a good balance between robustness and complexity.

<a id="ohWUKWehpU"></a>

Source

```python
#  label: fig-ocp-multiple-shooting
#  caption: Multiple shooting ballistic BVP: the code produces an animation (and optional static plot) that shows how segment defects shrink while steering the projectile to the target.

%config InlineBackend.figure_format = 'retina'
"""
Multiple Shooting as a Boundary-Value Problem (BVP) for a Ballistic Trajectory
-----------------------------------------------------------------------------
We solve for the initial velocities (and total flight time) so that the terminal
position hits a target, enforcing continuity between shooting segments.
"""

import numpy as np
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults
from scipy.integrate import solve_ivp
from scipy.optimize import minimize
from IPython.display import HTML, display

# -----------------------------
# Physical parameters
# -----------------------------
g = 9.81          # gravity (m/s^2)
m = 1.0           # mass (kg)
drag_coeff = 0.1  # quadratic drag coefficient


def dynamics(t, state):
    """Ballistic dynamics with quadratic drag. state = [x, y, vx, vy]."""
    x, y, vx, vy = state
    v = np.hypot(vx, vy)
    drag_x = -drag_coeff * v * vx / m if v > 0 else 0.0
    drag_y = -drag_coeff * v * vy / m if v > 0 else 0.0
    dx  = vx
    dy  = vy
    dvx = drag_x
    dvy = drag_y - g
    return np.array([dx, dy, dvx, dvy])


def flow(y0, h):
    """One-segment flow map Φ(y0; h): integrate dynamics over duration h."""
    sol = solve_ivp(dynamics, (0.0, h), y0, method="RK45", rtol=1e-7, atol=1e-9)
    return sol.y[:, -1], sol

# -----------------------------
# Multiple-shooting BVP residuals
# -----------------------------

def residuals(z, K, x_init, x_target):
    """
    Unknowns z = [vx0, vy0, H, y1(4), y2(4), ..., y_{K-1}(4)]  (total len = 3 + 4*(K-1))
    We define y0 from x_init and (vx0, vy0). Each segment has duration h = H/K.
    Residual vector stacks:
      - initial position constraints: y0[:2] - x_init[:2]
      - continuity: y_{k+1} - Φ(y_k; h) for k=0..K-2
      - terminal position constraint at end of last segment: Φ(y_{K-1}; h)[:2] - x_target[:2]
    """
    n = 4
    vx0, vy0, H = z[0], z[1], z[2]
    if H <= 0:
        # Strongly penalize nonpositive durations to keep solver away
        return 1e6 * np.ones(2 + 4*(K-1) + 2)

    h = H / K

    # Build list of segment initial states y_0..y_{K-1}
    ys = []
    y0 = np.array([x_init[0], x_init[1], vx0, vy0], dtype=float)
    ys.append(y0)
    if K > 1:
        rest = z[3:]
        y_internals = rest.reshape(K-1, n)
        ys.extend(list(y_internals))  # y1..y_{K-1}

    res = []

    # Initial position must match exactly
    res.extend(ys[0][:2] - x_init[:2])

    # Continuity across segments
    for k in range(K-1):
        yk = ys[k]
        yk1_pred, _ = flow(yk, h)
        res.extend(ys[k+1] - yk1_pred)

    # Terminal position at the end of last segment equals target
    y_last_end, _ = flow(ys[-1], h)
    res.extend(y_last_end[:2] - x_target[:2])

    # Optional soft "stay above ground" at knots (kept gentle)
    # res.extend(np.minimum(0.0, np.array([y[1] for y in ys])).ravel())

    return np.asarray(res)

# -----------------------------
# Solve BVP via optimization on 0.5*||residuals||^2
# -----------------------------

def solve_bvp_multiple_shooting(K=5, x_init=np.array([0., 0.]), x_target=np.array([10., 0.])):
    """
    K: number of shooting segments.
    x_init: initial position (x0, y0). Initial velocities are unknown.
    x_target: desired terminal position (xT, yT) at time H (unknown).
    """
    # Heuristic initial guesses:
    dx = x_target[0] - x_init[0]
    dy = x_target[1] - x_init[1]
    H0 = max(0.5, dx / 5.0)  # guess ~ 5 m/s horizontal
    vx0_0 = dx / H0
    vy0_0 = (dy + 0.5 * g * H0**2) / H0  # vacuum guess

    # Intentionally disconnected internal knots to visualize defect shrinkage
    internals = []
    for k in range(1, K):  # y1..y_{K-1}
        xk = x_init[0] + (dx * k) / K
        yk = x_init[1] + (dy * k) / K + 2.0  # offset to create mismatch
        internals.append(np.array([xk, yk, 0.0, 0.0]))
    internals = np.array(internals) if K > 1 else np.array([])

    z0 = np.concatenate(([vx0_0, vy0_0, H0], internals.ravel()))

    # Variable bounds: H > 0, keep velocities within a reasonable range
    # Use wide bounds to let the solver work; tune if needed.
    lb = np.full_like(z0, -np.inf, dtype=float)
    ub = np.full_like(z0,  np.inf, dtype=float)
    lb[2] = 1e-2  # H lower bound
    # Optional velocity bounds
    lb[0], ub[0] = -50.0, 50.0
    lb[1], ub[1] = -50.0, 50.0

    # Objective and callback for L-BFGS-B
    def objective(z):
        r = residuals(z, K,
                      np.array([x_init[0], x_init[1], 0., 0.]),
                      np.array([x_target[0], x_target[1], 0., 0.]))
        return 0.5 * np.dot(r, r)

    iterate_history = []
    def cb(z):
        iterate_history.append(z.copy())

    bounds = list(zip(lb.tolist(), ub.tolist()))
    sol = minimize(objective, z0, method='L-BFGS-B', bounds=bounds,
                   callback=cb, options={'maxiter': 300, 'ftol': 1e-12})

    return sol, iterate_history

# -----------------------------
# Reconstruct and plot (optional static figure)
# -----------------------------

def reconstruct_and_plot(sol, K, x_init, x_target):
    n = 4
    vx0, vy0, H = sol.x[0], sol.x[1], sol.x[2]
    h = H / K

    ys = []
    y0 = np.array([x_init[0], x_init[1], vx0, vy0])
    ys.append(y0)
    if K > 1:
        internals = sol.x[3:].reshape(K-1, n)
        ys.extend(list(internals))

    # Integrate each segment and stitch
    traj_x, traj_y = [], []
    for k in range(K):
        yk = ys[k]
        yend, seg = flow(yk, h)
        traj_x.extend(seg.y[0, :].tolist() if k == 0 else seg.y[0, 1:].tolist())
        traj_y.extend(seg.y[1, :].tolist() if k == 0 else seg.y[1, 1:].tolist())

    # Plot
    fig, ax = plt.subplots(figsize=(7, 4.2))
    ax.plot(traj_x, traj_y, '-', label='Multiple-shooting solution')
    ax.plot([x_init[0]], [x_init[1]], 'go', label='Start')
    ax.plot([x_target[0]], [x_target[1]], 'r*', ms=12, label='Target')
    total_pts = len(traj_x)
    for k in range(1, K):
        idx = int(k * total_pts / K)
        ax.axvline(traj_x[idx], color='k', ls='--', alpha=0.3, lw=1)

    ax.set_xlabel('x (m)')
    ax.set_ylabel('y (m)')
    ax.set_title(f'Multiple Shooting BVP (K={K})   H={H:.3f}s   v0=({vx0:.2f},{vy0:.2f}) m/s')
    ax.grid(True, alpha=0.3)
    ax.legend(loc='best')
    plt.tight_layout()

    # Report residual norms
    res = residuals(sol.x, K, np.array([x_init[0], x_init[1], 0., 0.]), np.array([x_target[0], x_target[1], 0., 0.]))
    print(f"\nFinal residual norm: {np.linalg.norm(res):.3e}")
    print(f"vx0={vx0:.4f} m/s, vy0={vy0:.4f} m/s, H={H:.4f} s")

# -----------------------------
# Create JS animation for notebooks
# -----------------------------

def create_animation_progress(iter_history, K, x_init, x_target):
    """Return a JS animation (to_jshtml) showing defect shrinkage across segments."""
    import matplotlib.pyplot as plt
    from matplotlib.animation import FuncAnimation

    # Apply book style
    try:
        import scienceplots
        plt.style.use(['science', 'notebook'])
    except (ImportError, OSError):
        pass  # Use matplotlib defaults

    n = 4

    def unpack(z):
        vx0, vy0, H = z[0], z[1], z[2]
        ys = [np.array([x_init[0], x_init[1], vx0, vy0])]
        if K > 1 and len(z) > 3:
            internals = z[3:].reshape(K-1, n)
            ys.extend(list(internals))
        return H, ys

    fig, ax = plt.subplots(figsize=(7, 4.2))
    ax.set_xlabel('Segment index (normalized time)')
    ax.set_ylabel('y (m)')
    ax.set_title('Multiple Shooting: Defect Shrinkage (Fixed Boundaries)')
    ax.grid(True, alpha=0.3)

    # Start/target markers at fixed indices
    ax.plot([0], [x_init[1]], 'go', label='Start')
    ax.plot([K], [x_target[1]], 'r*', ms=12, label='Target')
    # Vertical dashed lines at boundaries
    for k in range(1, K):
        ax.axvline(k, color='k', ls='--', alpha=0.35, lw=1)
    ax.legend(loc='best')

    # Pre-create line artists
    colors = plt.cm.plasma(np.linspace(0, 1, K))
    segment_lines = [ax.plot([], [], '-', color=colors[k], lw=2, alpha=0.9)[0] for k in range(K)]
    connector_lines = [ax.plot([], [], 'r-', lw=1.4, alpha=0.75)[0] for _ in range(K-1)]

    text_iter = ax.text(0.02, 0.98, '', transform=ax.transAxes,
                        va='top', fontsize=9,
                        bbox=dict(boxstyle='round', facecolor='white', alpha=0.7))

    def animate(i):
        idx = min(i, len(iter_history)-1)
        z = iter_history[idx]
        H, ys = unpack(z)
        h = H / K

        all_y = [x_init[1], x_target[1]]
        total_defect = 0.0
        for k in range(K):
            yk = ys[k]
            yend, seg = flow(yk, h)
            # Map local time to [k, k+1]
            t_local = seg.t
            x_vals = k + (t_local / t_local[-1])
            y_vals = seg.y[1, :]
            segment_lines[k].set_data(x_vals, y_vals)
            all_y.extend(y_vals.tolist())
            if k < K-1:
                y_next = ys[k+1]
                # Vertical connector at boundary x=k+1
                connector_lines[k].set_data([k+1, k+1], [yend[1], y_next[1]])
                total_defect += abs(y_next[1] - yend[1])

        # Fixed x-limits in index space
        ax.set_xlim(-0.1, K + 0.1)
        ymin, ymax = min(all_y), max(all_y)
        margin_y = 0.10 * max(1.0, ymax - ymin)
        ax.set_ylim(ymin - margin_y, ymax + margin_y)

        text_iter.set_text(f'Iterate {idx+1}/{len(iter_history)}  |  Sum vertical defect: {total_defect:.3e}')
        return segment_lines + connector_lines + [text_iter]

    anim = FuncAnimation(fig, animate, frames=len(iter_history), interval=600, blit=False, repeat=True)
    plt.tight_layout()
    js_anim = anim.to_jshtml()
    plt.close(fig)
    return js_anim


def main():
    # Problem definition
    x_init = np.array([0.0, 0.0])      # start at origin
    x_target = np.array([10.0, 0.0])   # hit ground at x=10 m
    K = 6                               # number of shooting segments

    sol, iter_hist = solve_bvp_multiple_shooting(K=K, x_init=x_init, x_target=x_target)
    # Optionally show static reconstruction (commented for docs cleanliness)
    # reconstruct_and_plot(sol, K, x_init, x_target)

    # Animate progression (defect shrinkage across segments) and display as JS
    js_anim = create_animation_progress(iter_hist, K, x_init, x_target)
    display(HTML(js_anim))


if __name__ == "__main__":
    main()
```

Loading...

<a id="example-hydro-cascade-scheduling-with-physical-routing"></a>

### Example: Hydro Cascade Scheduling with Physical Routing

The ballistic boundary-value problem couples consecutive segments of one trajectory. A hydroelectric cascade adds a second form of coupling: actions taken upstream alter the inflows seen downstream after a travel delay. Multiple shooting exposes both forms through local ODE integrations, temporal continuity defects, and inter-reach routing constraints.

The hydro-reservoir model in [Finite-Horizon Dynamic Programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) uses a discrete-time abstraction in which precipitation enters as a noisy inflow. That abstraction is useful for learning and control design, but it omits much of the physical behavior of rivers and dams. Here we use a more detailed setup inspired by [Savorgnan _et al._, 2011](https://doi.org/10.1016/j.jprocont.2011.01.011). We consider a series of dams arranged in a cascade, where the actions taken upstream influence downstream levels with a delay. The amount of power produced depends on the water flow through the turbines and the head (the vertical distance between the reservoir surface and the turbine outlet). The larger the head, the more potential energy is available for conversion into electricity, and the higher the power output.

To capture these effects, we follow a modeling approach inspired by the Saint-Venant equations, which describe how water levels and flows evolve in open channels. Instead of solving the full PDEs, we use a reduced model that approximates each dammed section of river (called a reach) as a lumped system governed by an ordinary differential equation. The main variable of interest is the water level $h_r(t)$, which changes over time depending on how much water enters, how much is discharged through the turbines $q_r(t)$, and how much is spilled $s_r(t)$. The mass balance for reach $r$ is written as:

<a id="VJ9u4EJUKX"></a>

$$
\frac{d h_r(t)}{dt} = \frac{1}{A_r} \left( z_r(t) - q_r(t) - s_r(t) \right),
$$

[(16)](#VJ9u4EJUKX "Link to this Equation")

where $A_r$ is the surface area of the reservoir, assumed constant. The inflow $z_r(t)$ to a reach either comes from nature (for the first dam), or from the upstream turbine and spill discharge, delayed by a travel time $\tau_{r-1}$:

<a id="q8WlyvgBmR"></a>

$$
z_1(t) = \text{inflow}(t), \qquad
z_r(t) = q_{r-1}(t - \tau_{r-1}) + s_{r-1}(t - \tau_{r-1}), \quad \text{for } r > 1.
$$

[(17)](#q8WlyvgBmR "Link to this Equation")

Power generation at each reach depends on how much water is discharged and the available head:

<a id="YQGhoqA4xQ"></a>

$$
P_r(t) = \rho g \eta \, q_r(t) \, H_r(h_r(t)),
$$

[(18)](#YQGhoqA4xQ "Link to this Equation")

where $\rho$ is water density, $g$ is gravitational acceleration, $\eta$ is turbine efficiency, and $H_r(h_r(t))$ denotes the head as a function of the water level. In some models, the head is approximated as the difference between the current level and a fixed tailwater height (the water level downstream of the dam, after it has passed through the turbine).

The operator’s goal is to meet a target generation profile $P^\text{ref}(t)$, such as one dictated by a market dispatch or load-following constraint. This leads to an objective that minimizes the deviation from the target over the full horizon:

<a id="wBsScbGKxa"></a>

$$
\min_{\{q_r(t), s_r(t)\}} \int_0^T \left( \sum_{r=1}^R P_r(t) - P^\text{ref}(t) \right)^2 dt.
$$

[(19)](#wBsScbGKxa "Link to this Equation")

In practice, this is combined with operational constraints: turbine capacity $0 \le q_r(t) \le \bar{q}_r$, spillway limits $0 \le s_r(t) \le \bar{s}_r$, and safe level bounds $h_r^{\min} \le h_r(t) \le h_r^{\max}$. Depending on the use case, one may also penalize spill to encourage water conservation, or penalize fast changes in levels for ecological reasons.

The reaches are coupled across space and time. An upstream reach cannot simply act in isolation: if the operator wants reach $r$ to produce power at a specific time, the water must be released by reach $r-1$ sufficiently in advance. This coordination is further complicated by delays, nonlinearities in head-dependent power, and limited storage capacity.

We solve the problem using **multiple shooting**. Each reach is divided into local simulation segments over short time windows. Within each segment, the dynamics are integrated forward using the ODEs, and continuity constraints are added to ensure that the water levels match across segment boundaries. At the same time, the inflows passed from upstream reaches must arrive at the right time and be consistent with previous decisions. In discrete time, this gives rise to a set of state-update equations:

<a id="eEJ6vXn8oQ"></a>

$$
h_r^{k+1} = h_r^k + \Delta t \cdot \frac{1}{A_r}(z_r^k - q_r^k - s_r^k),
$$

[(20)](#eEJ6vXn8oQ "Link to this Equation")

with delays handled by shifting $z_r^k$ according to the appropriate travel time. These constraints are enforced as part of a nonlinear program, alongside the power tracking objective and control bounds.

Compared with a single-reservoir inflow-outflow model, the cascade adds delayed coupling constraints. Upstream reservoirs can store water in anticipation of future needs, while downstream dams adjust their output to match arrivals and avoid overflows. The resulting schedule coordinates the entire system against the demand profile.

<a id="WIGJDrbQs7"></a>

<a id="fig-trajectories-hydro-multiple-shooting"></a>

Source

<a id="fig-trajectories-hydro-multiple-shooting-code"></a>

```python
%config InlineBackend.figure_format = 'retina'
# Instrumented MSD hydro demo with heterogeneity + diagnostics
# - Breaks symmetry to avoid trivial identical plots
# - Adds rich diagnostics to explain flat levels and equalities
#
# This cell runs end-to-end and shows plots + tables.

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults
from dataclasses import dataclass
from typing import Tuple
from scipy.optimize import minimize
from math import sqrt
import warnings

# ---------- Model ----------

g = 9.81  # m/s^2

@dataclass
class ReachParams:
    L: float
    W: float
    k_b: float
    S_b: float
    k_t: float
    @property
    def A_surf(self) -> float:
        return self.L * self.W

def smooth_relu(x, eps=1e-9):
    return 0.5*(x + np.sqrt(x*x + eps))

def q_bypass(H, rp: ReachParams):
    H_eff = smooth_relu(H)
    return rp.k_b * rp.S_b * np.sqrt(2*g*H_eff)

def muskingum_coeffs(K: float, X: float, dt: float) -> Tuple[float, float, float]:
    D  = 2.0*K*(1.0 - X) + dt
    C0 = (dt - 2.0*K*X) / D
    C1 = (dt + 2.0*K*X) / D
    C2 = (2.0*K*(1.0 - X) - dt) / D
    return C0, C1, C2

def integrate_interval(H0, u, z, dt, nsub, rp: ReachParams):
    """Forward Euler. Returns Hend, avg_qout."""
    h = dt/nsub
    H = H0
    qsum = 0.0
    for _ in range(nsub):
        qb = q_bypass(H, rp)
        qout = u + qb
        dHdt = (z - qout) / rp.A_surf
        H += h*dHdt
        qsum += qout
    return H, qsum/nsub

def shapes(M,N): return (M*(N+1), M*N, M*N)

def unpack(x, M, N):
    nH, nu, nz = shapes(M,N)
    H = x[:nH].reshape(M,N+1)
    u = x[nH:nH+nu].reshape(M,N)
    z = x[nH+nu:nH+nu+nz].reshape(M,N)
    return H,u,z

def pack(H,u,z): return np.concatenate([H.ravel(), u.ravel(), z.ravel()])

# ---------- Problem builder ----------

def make_params_hetero(M):
    """Heterogeneous reaches to break symmetry."""
    # Widths, spillway areas, and power coeffs vary by reach
    W_list = np.linspace(80, 140, M)         # m
    L_list = np.full(M, 4000.0)              # m
    S_b_list = np.linspace(14.0, 20.0, M)    # m^2
    k_t_list = np.linspace(7.5, 8.5, M)      # power coeff
    k_b_list = np.linspace(0.55, 0.65, M)    # spill coeff
    return [ReachParams(L=float(L_list[i]), W=float(W_list[i]),
                        k_b=float(k_b_list[i]), S_b=float(S_b_list[i]),
                        k_t=float(k_t_list[i])) for i in range(M)]

def build_demo(M=3, N=12, dt=900.0, seed=0, hetero=True):
    rng = np.random.default_rng(seed)
    params = make_params_hetero(M) if hetero else [ReachParams(4000.0, 100.0, 0.6, 18.26, 8.0) for _ in range(M)]

    # initial levels (heterogeneous)
    H0 = np.array([17.0, 16.7, 17.3][:M])

    H_ref = np.array([17.0, 16.9, 17.1][:M]) if hetero else np.full(M, 17.0)
    H_bounds = (16.0, 18.5)
    u_bounds = (40.0, 160.0)

    Qin_base = 300.0
    Qin_ext = Qin_base + 30.0*np.sin(2*np.pi*np.arange(N)/N)  # stronger swing

    Pref_raw = 60.0 + 15.0*np.sin(2*np.pi*(np.arange(N)-2)/N)

    # default Muskingum parameters per link (M-1 links)
    if M > 1:
        K_list = list(np.linspace(1800.0, 2700.0, M-1))
        X_list = [0.2]*(M-1)
    else:
        K_list = []
        X_list = []

    return dict(params=params, H0=H0, H_ref=H_ref, H_bounds=H_bounds,
                u_bounds=u_bounds, Qin_ext=Qin_ext, Pref_raw=Pref_raw,
                dt=dt, N=N, M=M, nsub=10,
                muskingum=dict(K=K_list, X=X_list))

# ---------- Objective / constraints / helpers ----------

def compute_total_power(H,u,params):
    M,N = u.shape
    Pn = np.zeros(N)
    for n in range(N):
        for i in range(M):
            Pn[n] += params[i].k_t * u[i,n] * H[i,n]
    return Pn

def decompose_objective(x, data, Pref, wP, wH, wDu):
    H,u,z = unpack(x, data["M"], data["N"])
    params, H_ref = data["params"], data["H_ref"]
    track = np.sum((compute_total_power(H,u,params)-Pref)**2)
    lvl   = np.sum((H[:,:-1]-H_ref[:,None])**2)
    du    = np.sum((u[:,1:]-u[:,:-1])**2)
    return dict(track=wP*track, lvl=wH*lvl, du=wDu*du, raw=dict(track=track,lvl=lvl,du=du))

def make_objective(data, Pref, wP=8.0, wH=0.02, wDu=1e-4):
    params, H_ref, N, M = data["params"], data["H_ref"], data["N"], data["M"]
    def obj(x):
        H,u,z = unpack(x,M,N)
        return (
            wP*np.sum((compute_total_power(H,u,params)-Pref)**2)
            + wH*np.sum((H[:,:-1]-H_ref[:,None])**2)
            + wDu*np.sum((u[:,1:]-u[:,:-1])**2)
        )
    return obj, dict(wP=wP,wH=wH,wDu=wDu)

def make_constraints(data):
    params, H0, Qin_ext, dt, N, M, nsub = (
        data["params"], data["H0"], data["Qin_ext"], data["dt"], data["N"], data["M"], data["nsub"]
    )
    cons = []
    def init_fun(x):
        H,u,z = unpack(x,M,N); return H[:,0]-H0
    cons.append({'type':'eq','fun':init_fun})
    def dyn_fun(x):
        H,u,z = unpack(x,M,N)
        res=[]
        for i in range(M):
            for n in range(N):
                Hend, _ = integrate_interval(H[i,n], u[i,n], z[i,n], dt, nsub, params[i])
                res.append(H[i,n+1]-Hend)
        return np.array(res)
    cons.append({'type':'eq','fun':dyn_fun})
    def coup_fun(x):
        H,u,z = unpack(x,M,N)
        res=[]
        # First reach is exogenous inflow per interval
        for n in range(N):
            res.append(z[0,n]-Qin_ext[n])
        # Downstream links: Muskingum routing
        K_list = data.get("muskingum", {}).get("K", [])
        X_list = data.get("muskingum", {}).get("X", [])
        for i in range(1,M):
            # Seed condition for z[i,0]
            _, I0 = integrate_interval(H[i-1,0], u[i-1,0], z[i-1,0], dt, nsub, params[i-1])
            res.append(z[i,0] - I0)
            # Coefficients
            Ki = K_list[i-1] if i-1 < len(K_list) else 1800.0
            Xi = X_list[i-1] if i-1 < len(X_list) else 0.2
            C0, C1, C2 = muskingum_coeffs(Ki, Xi, dt)
            # Recursion over intervals
            for n in range(N-1):
                # upstream interval-average outflows for n and n+1
                _, I_n   = integrate_interval(H[i-1,n],   u[i-1,n],   z[i-1,n],   dt, nsub, params[i-1])
                _, I_np1 = integrate_interval(H[i-1,n+1], u[i-1,n+1], z[i-1,n+1], dt, nsub, params[i-1])
                res.append(z[i,n+1] - (C0*I_np1 + C1*I_n + C2*z[i,n]))
        return np.array(res)
    cons.append({'type':'eq','fun':coup_fun})
    return cons

def make_bounds(data):
    Hmin,Hmax = data["H_bounds"]
    umin,umax = data["u_bounds"]
    M,N = data["M"], data["N"]
    nH,nu,nz = shapes(M,N)
    lb = np.empty(nH+nu+nz); ub = np.empty_like(lb)
    lb[:nH]=Hmin; ub[:nH]=Hmax
    lb[nH:nH+nu]=umin; ub[nH:nH+nu]=umax
    lb[nH+nu:]=0.0; ub[nH+nu:]=2000.0
    return list(zip(lb,ub))

def residuals(x, data):
    params, H0, Qin_ext, dt, N, M, nsub = (
        data["params"], data["H0"], data["Qin_ext"], data["dt"], data["N"], data["M"], data["nsub"]
    )
    H,u,z = unpack(x, M, N)
    dyn = np.zeros((M,N)); coup = np.zeros((M,N))
    for i in range(M):
        for n in range(N):
            Hend, qavg = integrate_interval(H[i,n], u[i,n], z[i,n], dt, nsub, params[i])
            dyn[i,n] = H[i,n+1] - Hend
            if i == 0:
                coup[i,n] = z[i,n] - Qin_ext[n]
            else:
                # Muskingum residual, align on current index using n and n-1
                Ki = data.get("muskingum", {}).get("K", [1800.0]*(M-1))[i-1]
                Xi = data.get("muskingum", {}).get("X", [0.2]*(M-1))[i-1]
                C0, C1, C2 = muskingum_coeffs(Ki, Xi, dt)
                if n == 0:
                    coup[i,n] = 0.0
                else:
                    _, I_nm1 = integrate_interval(H[i-1,n-1], u[i-1,n-1], z[i-1,n-1], dt, nsub, params[i-1])
                    _, I_n   = integrate_interval(H[i-1,n],   u[i-1,n],   z[i-1,n],   dt, nsub, params[i-1])
                    coup[i,n] = z[i,n] - (C0*I_n + C1*I_nm1 + C2*z[i,n-1])
    return dyn, coup

# ---------- Feasible initial guess with hetero controls ----------

def feasible_initial_guess(data):
    """Feasible x0 with nontrivial u by setting u at mid + per-reach pattern, then integrating to define H,z."""
    M,N,dt,nsub = data["M"], data["N"], data["dt"], data["nsub"]
    params = data["params"]
    umin,umax = data["u_bounds"]
    Qin_ext = data["Qin_ext"]

    # pattern to break symmetry
    base = 0.5*(umin+umax)
    phase = np.linspace(0, np.pi/2, M)
    tgrid = np.arange(N)
    u_pattern = np.array([base + 25*np.sin(2*np.pi*(tgrid/N) + ph) for ph in phase])
    u_pattern = np.clip(u_pattern, umin, umax)

    H = np.zeros((M, N+1)); u = np.zeros((M, N)); z = np.zeros((M, N))
    H[:,0] = data["H0"]
    # Set controls from pattern first
    for i in range(M):
        u[i,:] = u_pattern[i,:]

    # First reach: exogenous inflow, integrate forward and record outflow averages
    qavg_up = np.zeros((M, N))
    for n in range(N):
        z[0,n] = Qin_ext[n]
        Hend, qavg = integrate_interval(H[0,n], u[0,n], z[0,n], dt, nsub, params[0])
        H[0,n+1] = Hend
        qavg_up[0,n] = qavg

    # Downstream reaches with Muskingum routing
    K_list = data.get("muskingum", {}).get("K", [1800.0]*(M-1))
    X_list = data.get("muskingum", {}).get("X", [0.2]*(M-1))
    for i in range(1,M):
        Ki = K_list[i-1] if i-1 < len(K_list) else 1800.0
        Xi = X_list[i-1] if i-1 < len(X_list) else 0.2
        C0, C1, C2 = muskingum_coeffs(Ki, Xi, dt)
        I = qavg_up[i-1,:]
        # seed
        z[i,0] = I[0]
        # propagate recursively over time
        for n in range(N-1):
            z[i,n+1] = C0*I[n+1] + C1*I[n] + C2*z[i,n]
        # integrate levels for reach i using routed inflow
        for n in range(N):
            Hend, qavg = integrate_interval(H[i,n], u[i,n], z[i,n], dt, nsub, params[i])
            H[i,n+1] = Hend
            qavg_up[i,n] = qavg
    return pack(H,u,z)

def scale_pref(Pref_raw, x0, data):
    H,u,z = unpack(x0, data["M"], data["N"])
    P0 = compute_total_power(H,u,data["params"])
    s = max(np.mean(P0),1e-6)/max(np.mean(Pref_raw),1e-6)
    return Pref_raw*s, P0

def run_demo(show: bool = True, save_path: str | None = 'hydro.png', verbose: bool = False):
    """Build, solve, and render the hydro demo.

    Parameters
    ----------
    show : bool
        If True, displays the matplotlib figure via plt.show().
    save_path : str | None
        If provided, saves the figure to this path.
    verbose : bool
        If True, prints diagnostic information.

    Returns
    -------
    matplotlib.figure.Figure | None
        Returns the Figure when show is False; otherwise returns None.
    """
    # ---------- Solve ----------
    data = build_demo(M=3, N=16, dt=900.0, hetero=True)
    x0 = feasible_initial_guess(data)
    Pref, P0 = scale_pref(data["Pref_raw"], x0, data)

    objective, weights = make_objective(data, Pref, wP=8.0, wH=0.02, wDu=5e-4)
    # Suppress noisy SciPy warning about delta_grad during quasi-Newton updates
    with warnings.catch_warnings():
        warnings.filterwarnings(
            "ignore",
            message=r"delta_grad == 0.0",
            category=UserWarning,
            module=r"scipy\.optimize\.\_differentiable_functions",
        )
        res = minimize(
            fun=objective,
            x0=x0,
            method='trust-constr',
            bounds=make_bounds(data),
            constraints=make_constraints(data),
            options=dict(maxiter=1000, disp=verbose),
        )

    H,u,z = unpack(res.x, data["M"], data["N"])
    P = compute_total_power(H,u,data["params"])
    dyn_res, coup_res = residuals(res.x, data)

    # ---------- Diagnostics ----------
    if verbose:
        terms = decompose_objective(res.x, data, Pref, **weights)
        print("\n=== Objective decomposition ===")
        print({k: float(v) if not isinstance(v, dict) else {kk: float(vv) for kk,vv in v.items()} for k,v in terms.items()})

        print("\n=== Constraint residuals (max |.|) ===")
        print("dyn:", float(np.max(np.abs(dyn_res)))), print("coup:", float(np.max(np.abs(coup_res))))

        # Muskingum coefficient sanity and residuals
        if data.get("M", 1) > 1:
            K_list = data.get("muskingum", {}).get("K", [])
            X_list = data.get("muskingum", {}).get("X", [])
            coef_checks = []
            mean_abs_res = []
            for i in range(1, data["M"]):
                Ki = K_list[i-1] if i-1 < len(K_list) else 1800.0
                Xi = X_list[i-1] if i-1 < len(X_list) else 0.2
                C0, C1, C2 = muskingum_coeffs(Ki, Xi, data["dt"])
                coef_checks.append(dict(link=i, sum=float(C0+C1+C2), min_coef=float(min(C0,C1,C2))))
                # compute mean abs residual for this link
                res_vals = []
                for n in range(data["N"]-1):
                    _, I_n   = integrate_interval(H[i-1,n],   u[i-1,n],   z[i-1,n],   data["dt"], data["nsub"], data["params"][i-1])
                    _, I_np1 = integrate_interval(H[i-1,n+1], u[i-1,n+1], z[i-1,n+1], data["dt"], data["nsub"], data["params"][i-1])
                    res_vals.append(float(abs(z[i,n+1] - (C0*I_np1 + C1*I_n + C2*z[i,n]))))
                mean_abs_res.append(dict(link=i, mean_abs=float(np.mean(res_vals))))
            print("\n=== Muskingum coeff checks (sum, min_coef) ===")
            print(coef_checks)
            print("=== Muskingum mean |residual| per link ===")
            print(mean_abs_res)

    # Per-interval diagnostic table for each reach (kept for debugging but unused here)
    def interval_table(i):
        rp = data["params"][i]
        rows = []
        for n in range(data["N"]):
            qb = q_bypass(H[i,n], rp)
            net = z[i,n] - (u[i,n] + qb)
            dH = data["dt"]*net/rp.A_surf
            rows.append(dict(interval=n, Hn=H[i,n], Hn1=H[i,n+1], u=u[i,n], z=z[i,n], qb=qb, net_flow=net, dH_pred=dH))
        return pd.DataFrame(rows)

    # summary and tables available to callers if needed
    tables = [interval_table(i) for i in range(data["M"])]
    summary = pd.DataFrame([
        dict(reach=i+1,
             H_mean=float(np.mean(H[i])), H_std=float(np.std(H[i])),
             u_mean=float(np.mean(u[i])), u_std=float(np.std(u[i])),
             z_mean=float(np.mean(z[i])), z_std=float(np.std(z[i])))
        for i in range(data["M"])
    ])

    # ---------- Plots ----------
    M,N = data["M"], data["N"]
    t_nodes = np.arange(N+1)
    t = np.arange(N)

    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Hydroelectric System Optimization Results', fontsize=16)

    ax1 = axes[0, 0]
    for i in range(M):
        ax1.plot(t_nodes, H[i], marker='o', label=f'Reach {i+1}')
    ax1.set_xlabel("Node n"); ax1.set_ylabel("H [m]"); ax1.set_title("Water Levels")
    ax1.grid(True); ax1.legend()

    ax2 = axes[0, 1]
    for i in range(M):
        ax2.step(t, u[i], where='post', label=f'Reach {i+1}')
    ax2.set_xlabel("Interval n"); ax2.set_ylabel("u [m³/s]"); ax2.set_title("Turbine Discharge")
    ax2.grid(True); ax2.legend()

    ax3 = axes[1, 0]
    for i in range(M):
        ax3.step(t, z[i], where='post', label=f'Reach {i+1}')
    ax3.set_xlabel("Interval n"); ax3.set_ylabel("z [m³/s]"); ax3.set_title("Inflow (Coupling)")
    ax3.grid(True); ax3.legend()

    ax4 = axes[1, 1]
    ax4.plot(t, P0, marker='s', label="Power @ x0")
    ax4.plot(t, P, marker='o', label="Power @ optimum")
    ax4.plot(t, Pref, marker='x', label="Scaled Pref")
    ax4.set_xlabel("Interval n"); ax4.set_ylabel("Power units"); ax4.set_title("Power Tracking")
    ax4.legend(); ax4.grid(True)

    plt.tight_layout()
    if save_path:
        fig.savefig(save_path, bbox_inches='tight')
    if show:
        return None
    return fig


# Run the demo directly when loaded in a notebook cell
run_demo(show=True, save_path=None, verbose=False)
```

[Figure 8:](#fig-trajectories-hydro-multiple-shooting "Link to this figure")Multiple shooting coordinates reservoir levels, turbine discharges, routed inflows, and total generation across a three-reach hydroelectric cascade.

<a id="fig-trajectories-hydro-multiple-shooting-outputs"></a>

The figure shows the result of a multiple-shooting optimization applied to a three-reach hydroelectric cascade. The time horizon is discretized into 16 intervals, and SciPy’s `trust-constr` solver is used to find a feasible control sequence that satisfies mass balance, turbine and spillway limits, and Muskingum-style routing dynamics. Each reach integrates its own local ODE. Shooting defects link reservoir levels across time, while separate Muskingum constraints link routed flows between reaches.

The top-left panel shows the water levels in each reservoir. We observe that upstream reservoirs tend to increase their levels ahead of discharge events, building potential energy before releasing water downstream. The top-right panel shows turbine discharges for each reach. These vary smoothly and are temporally coordinated across the system. The bottom-right panel compares the total generation to a synthetic demand profile, which is generated by a sum of time-shifted sigmoids and normalized to be feasible given turbine capacities. The optimized schedule (orange) tracks this demand closely, while the initial guess (blue) lags behind. The bottom-left panel plots the routed inflows between reaches, which display the expected lag and smoothing effects from Muskingum routing. The interplay between these plots shows how the system anticipates, stores, and routes water to meet time-varying generation targets within physical and operational limits.

The ballistic and hydro examples use the same numerical structure at different scales: integrate locally, expose states at segment boundaries, and drive every continuity defect to zero. Introducing these boundary states changes the optimization variables and their coupling, independently of whether the underlying physical model includes random disturbances.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Direct transcription keeps states and controls explicit and exposes sparse dynamics constraints. Single shooting eliminates the states but couples early actions to every later quantity through one rollout. The truck alley-dock example measured that coupling: reverse-mode derivatives through the rollout reproduce the product of per-interval hitch Jacobians, and backing amplifies an early steering error that forward driving forgets. Multiple shooting keeps selected boundary states, trading additional variables for shorter sensitivity paths and sparse continuity defects.

The next chapter, [iLQR and differential dynamic programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/09-iterative-trajectory-optimization.md), uses this temporal structure to solve successive local quadratic problems by backward elimination. Its boat-docking example follows both the optimizer’s iterations and the vessel’s predicted motion along a selected plan.

The transcription formulations use a discrete transition map. [Continuous-time transcription and collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) develops nodal polynomial representations directly from differential equations. The subsequent [MPPI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md) returns to the single-shooting rollout, sampling candidate control sequences and combining them according to their costs. For models with uncertain disturbances, several simulated futures estimate each candidate’s expected cost.

<a id="exercises"></a>

## Exercises

<a id="ex-trajectories-single-shooting"></a>

[Exercise 1](#ex-trajectories-single-shooting "Link to this Exercise") (Single shooting implementation)

Consider the scalar system $x_{t+1} = x_t + u_t$ with $x_1 = 1$ and objective:

<a id="dPxM6eEMyU"></a>

$$
J = x_T^2 + \sum_{t=1}^{T-1} u_t^2.
$$

[(21)](#dPxM6eEMyU "Link to this Equation")

**(a)** Express $x_T$ as a function of the controls $u_1, \ldots, u_{T-1}$.

**(b)** Substitute into $J$ to obtain an unconstrained objective in the controls only.

**(c)** Implement single shooting in Python/JAX to minimize $J$ for $T = 10$. Use gradient descent with a learning rate of 0.01 for 100 iterations. Report the optimal controls and final cost.

Solution to [Exercise 1](#ex-trajectories-single-shooting)

**(a)** $x_T = 1 + \sum_{t=1}^{T-1} u_t$.

**(b)** $J(u) = \left(1 + \sum_{t=1}^{T-1} u_t\right)^2 + \sum_{t=1}^{T-1} u_t^2$.

**(c)** Sample code:

```python
import jax.numpy as jnp
from jax import grad

def objective(u):
    x_T = 1.0 + jnp.sum(u)
    return x_T**2 + jnp.sum(u**2)

T = 10
u = jnp.zeros(T - 1)
for _ in range(100):
    u = u - 0.01 * grad(objective)(u)

print(f"Optimal u: {u}, Cost: {objective(u):.4f}")
```

By symmetry the optimal controls are equal, $u_t = -x_1/T = -0.1$, which gives $x_T = 0.1$ and total cost $J = x_1^2/T = 0.1$: the quadratic control penalty makes it cheaper to spread the correction over all stages than to cancel $x_1$ exactly. (The Hessian of $J$ has largest eigenvalue $2T = 20$, so a learning rate of 0.1 would oscillate without converging; 0.01 converges in well under 100 iterations.)

* * *

<a id="ex-trajectories-multiple-shooting"></a>

[Exercise 2](#ex-trajectories-multiple-shooting "Link to this Exercise") (Multiple shooting segments)

Using the problem in [Exercise 1](#ex-trajectories-single-shooting), implement multiple shooting with $K = 3$ segments.

**(a)** Define the segment boundaries and the continuity defects.

**(b)** Set up the NLP with decision variables $[x_1, x_4, x_7, u_1, \ldots, u_9]$ (for $T=10$, with segments of length 3).

**(c)** Compare the convergence behavior to single shooting. Does multiple shooting require fewer iterations to reach the same tolerance?

Solution to [Exercise 2](#ex-trajectories-multiple-shooting)

The defects are $d_k = x_{k+1}^{\text{simulated}} - x_{k+1}^{\text{variable}}$ at segment boundaries. You can minimize $J + \rho \sum_k \|d_k\|^2$ for large $\rho$ (penalty method) or use a constrained solver. Multiple shooting typically converges faster for longer horizons because the optimization landscape is better conditioned.

* * *

<a id="ex-trajectories-truck-first-order"></a>

[Exercise 3](#ex-trajectories-truck-first-order "Link to this Exercise") (Truck parking with a first-order optimizer)

The alley-dock example in [Example: Alley-Docking a Semi Truck](#sec-truck-alley-dock) minimizes $J(\mathbf u)$ with L-BFGS-B. Using the downloadable model, replace the solver by projected gradient descent with a fixed step, projecting each iterate onto the control box after every update.

**(a)** At the seed, the gradient with respect to the first steering angle is about 800 and with respect to the last one about 0.04. Using the amplification profile of [Figure 7](#fig-truck-conditioning), explain why a step size that is stable for the first steering controls makes almost no progress on the last ones.

**(b)** Run projected gradient descent from the same straight seed for the same number of objective evaluations that L-BFGS-B used, and compare the reached cost and the arrival checks reported by `audit`.

**(c)** Repeat with Adam, which rescales each coordinate by a running estimate of its gradient magnitude. Does per-coordinate rescaling remove the difficulty, or only part of it?

Solution to [Exercise 3](#ex-trajectories-truck-first-order)

**(a)** The stable step for gradient descent is bounded by the largest curvature of $J$, which the first steering controls set because their effect on the terminal cost is amplified through the whole backing rollout. The same step multiplied by a gradient component of 0.04 moves the last controls by a negligible amount, so progress along those directions takes thousands of iterations.

**(b)** With a matched evaluation budget, projected gradient descent typically stops far from the L-BFGS-B cost, and the arrival checks fail on heading or hitch angle. Increasing the step to speed up the late controls makes the early ones oscillate.

**(c)** Adam rescales each coordinate and therefore reaches a docking plan in a few thousand iterations, but the coupling between early and late controls is off-diagonal and remains: its cost after several thousand iterations is still above the L-BFGS-B value obtained in fewer than a thousand.

<a id="self-checks"></a>

## Self-checks

<a id="ex-trajectories-check-1"></a>

[Exercise 4](#ex-trajectories-check-1 "Link to this Exercise") (Count the decisions)

A single-shooting problem has horizon $T$ and scalar controls. How many optimization variables remain after eliminating the states, and what computation couples an early control to the terminal cost?

Solution to [Exercise 4](#ex-trajectories-check-1)

With the chapter’s states $x_1,\ldots,x_T$, there are $T-1$ control variables. Forward simulation couples every early control to all later states and therefore to the terminal cost.

<a id="ex-trajectories-check-2"></a>

[Exercise 5](#ex-trajectories-check-2 "Link to this Exercise") (Shooting trade-off)

Why can multiple shooting be easier to optimize than single shooting even though it introduces more decision variables?

Solution to [Exercise 5](#ex-trajectories-check-2)

Intermediate states break a long sensitive rollout into shorter segments. The resulting continuity constraints are sparse, and derivatives need not propagate through the full horizon in one chain.

<a id="ex-trajectories-check-direction"></a>

[Exercise 6](#ex-trajectories-check-direction "Link to this Exercise") (Direction of travel)

In the truck example, the same path is driven backward in one plan and forward in the other. Why does an early steering error matter fourteen times more in one direction and fourteen times less in the other?

Solution to [Exercise 6](#ex-trajectories-check-direction)

The hitch angle obeys $\dot\beta = (v/L_0)\tan\delta - (v/L_1)\sin\beta$. Its linearization has coefficient $-v\cos\beta/L_1$: negative when driving forward, so deviations decay, and positive when backing, so they grow. The terminal sensitivity to an early steering change is the product of these per-interval factors, which reverse-mode differentiation of the rollout computes exactly.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Savorgnan2011"></a>
2.  Savorgnan, C., Romani, C., Kozma, A., & Diehl, M. (2011). Multiple shooting for distributed systems with applications in hydro electricity production. _Journal of Process Control_, _21_(5), 738–745. [10.1016/j.jprocont.2011.01.011](https://doi.org/10.1016/j.jprocont.2011.01.011)

[

Open-Loop Optimal Control

Adjoints and the Discrete-Time Pontryagin Principle


](07-discrete-time-pmp.md)[

Open-Loop Optimal Control

iLQR and Differential Dynamic Programming


](09-iterative-trajectory-optimization.md)

> **Cours de Pierre-Luc Bacon — 01.** [Page publiée](https://pierrelucbacon.com/rlbook/) · [Source numérotée](../01-intro.md)
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

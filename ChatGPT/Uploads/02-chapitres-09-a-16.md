# IFT-6.2.rl — Document 02 — Chapitres 09 à 16

Texte pédagogique de Pierre-Luc Bacon ; copie organisée pour l’auto-apprentissage. Ce document contient les pages complètes extraites du site, sans résumé de remplacement. Consulter les titres « CHAPITRE NN » pour retrouver leur numéro exact.

Sommaire général : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/ChatGPT/COURSE_INDEX.md



---

# CHAPITRE 09 — iLQR and Differential Dynamic Programming

Section du livre : Open-Loop Optimal Control

Page originale : https://pierrelucbacon.com/rlbook/iterative-trajectory-optimization

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/09-iterative-trajectory-optimization.md

> **Cours de Pierre-Luc Bacon — 09.** [Page publiée](https://pierrelucbacon.com/rlbook/iterative-trajectory-optimization) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/09-iterative-trajectory-optimization.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# iLQR and Differential Dynamic Programming

<a id="skip-to-article"></a>

A boat approaching a quay must arrive in the right place, face along the berth, and lose its remaining momentum. A sequence of thrust commands determines all three outcomes. The [shooting formulation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md) turns this task into an optimization over those commands: simulate a candidate sequence, measure its cost, and improve it. How can an optimizer use the time structure of the simulation when computing that improvement?

Linearizing the dynamics along the current trajectory and quadratically approximating its costs gives a problem whose controls can be eliminated backward, one time step at a time. The resulting correction is then tested through the nonlinear simulator. Repeating these operations gives the **iterative linear-quadratic regulator**, or **iLQR**. Keeping additional curvature from the dynamics gives **differential dynamic programming**, or **DDP**. Both methods compute corrections around a nominal trajectory. Their backward recursions follow from substitution and quadratic minimization.

<a id="learning-goals"></a>

## Learning Goals

After working through the derivations and examples, you should be able to:

-   Construct a local quadratic optimal-control problem around a feasible rollout.
    
-   Eliminate its controls backward and recover an affine correction at each step.
    
-   Implement nonlinear trial rollouts with line search and regularization.
    
-   Identify the dynamics-curvature terms that distinguish DDP from iLQR.
    
-   Assess a docking plan using its cost, arrival velocity, and hull clearance.
    
-   Explain how thermal load and nonlinear power loss shape a bounded cooling schedule.
    

<a id="prerequisites"></a>

## Prerequisites

The chapter uses the [finite-horizon optimal-control formulation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md), [single shooting](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md), and first and second derivatives. The [sequential-methods discussion](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md#sequential-methods) introduces general SQP subproblems, and the [initial-value-problem appendix](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/30-appendix-ivps.md) reviews numerical integration. Neither dynamic programming nor a previous derivation of LQR is required.

<a id="sec-boat-docking"></a>

## A Docking Problem

Docking requires the boat to reach the berth, align with the quay, and shed its momentum. A trajectory that reaches the right position with appreciable translational or angular velocity will carry the boat away again.

Consider a two-metre boat moving in the horizontal plane. Its state and control are

<a id="yZn6eCCduN"></a>

$$
\mathbf x=(p_x,p_y,\psi,v_x,v_y,\omega),\qquad
\mathbf u=(u_L,u_R)\in[-1,1]^2.
$$

[(1)](#yZn6eCCduN "Link to this Equation")

The position and velocity are measured in fixed world coordinates, $\psi$ is the heading, and $\omega$ is the angular velocity. Each control is a fraction of maximum thrust. Positive commands push forward and negative commands push backward. Unequal thrusts turn the boat. There is no directly commanded sideways force, so an approach with sideways momentum requires a maneuver.

Let $\mathbf e(\psi)=(\cos\psi,\sin\psi)^\top$ point along the boat and $\mathbf n(\psi)=(-\sin\psi,\cos\psi)^\top$ point across it. The simplified inertial model is

<a id="QgL25VMqTK"></a>

$$
\begin{aligned}
\dot{\mathbf p}&=\mathbf v,&\qquad \dot\psi&=\omega,\\
m\dot{\mathbf v}
&=F_{\max}(u_L+u_R)\mathbf e
  -d_\parallel(\mathbf e^\top\mathbf v)\mathbf e
  -d_\perp(\mathbf n^\top\mathbf v)\mathbf n,\\
I\dot\omega&=bF_{\max}(u_R-u_L)-d_\omega\omega.
\end{aligned}
$$

[(2)](#QgL25VMqTK "Link to this Equation")

The drag opposes velocity along each boat axis, with stronger resistance to sideways motion. Thrust changes acceleration, so releasing the controls does not stop the boat immediately. These equations are a synthetic teaching model for calm water, with neither contact forces nor waves.

| Quantity | Value |
| --- | --- |
| Mass $m$ | $50\ \mathrm{kg}$ |
| Angular inertia $I$ | $20\ \mathrm{kg\,m^2}$ |
| Thruster lever arm $b$ | $0.4\ \mathrm m$ |
| Maximum force per thruster $F_{\max}$ | $25\ \mathrm N$ |
| Longitudinal drag $d_\parallel$ | $8\ \mathrm{N\,s/m}$ |
| Lateral drag $d_\perp$ | $30\ \mathrm{N\,s/m}$ |
| Angular drag $d_\omega$ | $10\ \mathrm{N\,m\,s}$ |
| Rectangular hull length and width | $2\ \mathrm m$, $0.8\ \mathrm m$ |

The quay occupies $p_y\leq0$, and the desired arrival state is $\mathbf x_\star=(0,1,0,0,0,0)$. The boat should lie parallel to the quay with its center one metre from the edge. The angled approach starts from $(-8,5,-0.5,0.2,-0.1,0)$. The sideways-drift case changes only $v_y$ to $-0.5\ \mathrm{m/s}$. Angles are in radians. Both experiments use $T-1=200$ piecewise-constant controls, each held for $h=0.1\ \mathrm s$, for a total of 20 seconds. Thus $\mathbf x_1$ is the initial state and $\mathbf x_T$ is the arrival state, as in the preceding chapters. One fourth-order Runge--Kutta step gives $\mathbf x_{t+1}=\mathbf f_t(\mathbf x_t,\mathbf u_t)$ for $t=1,\ldots,T-1$.

To discourage the hull from approaching the quay, let $y_j(\mathbf x)$ be the world-coordinate height of rectangular corner $j$. With a desired buffer $a=0.2\ \mathrm m$ and smoothing length $s=0.08\ \mathrm m$, define

<a id="WIuK4iWEPK"></a>

$$
\rho(z)=s\log(1+\exp(z/s)),\qquad
\mathcal P(\mathbf x)=200\sum_{j=1}^4\rho(a-y_j(\mathbf x))^2.
$$

[(3)](#WIuK4iWEPK "Link to this Equation")

This is a smooth penalty for violating the buffer. Its finite weight permits violations, so the final trajectories will also undergo a separate geometric clearance check. The full rectangle is used for that check, including the area outside the pointed boat icon in the figures.

For $\mathbf e_p=\mathbf p-(0,1)^\top$, the running and terminal costs are

<a id="xC7bysittX"></a>

$$
\begin{aligned}
c_t(\mathbf x,\mathbf u)
&=h\big[0.03\|\mathbf e_p\|^2+0.1(1-\cos\psi)
       +0.1\|\mathbf v\|^2+0.1\omega^2
       +0.2\|\mathbf u\|^2+\mathcal P(\mathbf x)\big],\\
c_T(\mathbf x)
&=300\|\mathbf e_p\|^2+100(1-\cos\psi)
       +200\|\mathbf v\|^2+100\omega^2+\mathcal P(\mathbf x).
\end{aligned}
$$

[(4)](#xC7bysittX "Link to this Equation")

These numerical weights apply to the stated SI coordinates and dimensionless thrust commands. The periodic heading penalty assigns the same cost to angles that differ by a full turn. The simulator retains an unwrapped angle; it does not insert a discontinuity at $\pm\pi$ into the differentiated transition.

The initial control sequence is zero, so the boat coasts and slows under drag. It stops far from the berth. Successive control updates can first bring it closer and then adjust the arrival heading and velocity.

<a id="fig-boat-iterations"></a>

<a id="kvCM6ENeJK"></a>
![Accepted iLQR iterates for the angled approach. Every curve is a nonlinear
rollout from the same initial state. Boat outlines are spaced four seconds
apart; their overlap indicates slow motion. The dotted outline marks the
desired berth. The first update reduces the position error substantially,
while later updates refine the turn and stopping maneuver.](../Assets/Website/9e4fb2a81f-iterations-a3e436c5a3bf6579cc568516add60208.svg)

[Figure 1:](#fig-boat-iterations "Link to this figure")Accepted iLQR iterates for the angled approach. Every curve is a nonlinear rollout from the same initial state. Boat outlines are spaced four seconds apart; their overlap indicates slow motion. The dotted outline marks the desired berth. The first update reduces the position error substantially, while later updates refine the turn and stopping maneuver.

<a id="sec-local-quadratic-trajectory"></a>

## Taylor Models of Dynamics and Cost

The local model describes the change in cost caused by a small change in the thrust sequence. Start from the finite-horizon problem

<a id="uyqC2YLzPM"></a>

$$
\begin{aligned}
\min_{\mathbf U}\quad &J(\mathbf U)
 :=c_T(\mathbf x_T)+\sum_{t=1}^{T-1}c_t(\mathbf x_t,\mathbf u_t),\\
\text{s.t.}\quad &\mathbf x_{t+1}=\mathbf f_t(\mathbf x_t,\mathbf u_t),
\quad t=1,\ldots,T-1,\\
&\mathbf x_1=\mathbf x_{\mathrm{init}}.
\end{aligned}
$$

[(5)](#uyqC2YLzPM "Link to this Equation")

Here $\mathbf U=(\mathbf u_1,\ldots,\mathbf u_{T-1})$ is the complete control sequence. Its rollout determines every later state.

Set aside the control bounds while deriving the local correction. Roll out a nominal control sequence $\bar{\mathbf U}$ to obtain states satisfying $\bar{\mathbf x}_{t+1}=\mathbf f_t(\bar{\mathbf x}_t,\bar{\mathbf u}_t)$. For a nearby trajectory, write $\delta\mathbf x_t=\mathbf x_t-\bar{\mathbf x}_t$ and $\delta\mathbf u_t=\mathbf u_t-\bar{\mathbf u}_t$, and stack them as $\delta\mathbf z_t=(\delta\mathbf x_t,\delta\mathbf u_t)$. Taylor expansion of the discrete transition at the nominal state and control gives

<a id="dh2cuxehtU"></a>

$$
\begin{aligned}
\mathbf f_t(\bar{\mathbf x}_t+\delta\mathbf x_t,
             \bar{\mathbf u}_t+\delta\mathbf u_t)
&=\bar{\mathbf x}_{t+1}
  +A_t\delta\mathbf x_t+B_t\delta\mathbf u_t
  +O(\|\delta\mathbf z_t\|^2),\\
A_t&=\left.\frac{\partial\mathbf f_t}{\partial\mathbf x}
      \right|_{(\bar{\mathbf x}_t,\bar{\mathbf u}_t)},\\
B_t&=\left.\frac{\partial\mathbf f_t}{\partial\mathbf u}
      \right|_{(\bar{\mathbf x}_t,\bar{\mathbf u}_t)}.
\end{aligned}
$$

[(6)](#dh2cuxehtU "Link to this Equation")

Subtracting $\bar{\mathbf x}_{t+1}$ and dropping the quadratic remainder gives the linearized dynamics $\delta\mathbf x_{t+1}=A_t\delta\mathbf x_t+B_t\delta\mathbf u_t$. Both rollouts start from the same state, so $\delta\mathbf x_1=\mathbf0$. There is no constant defect because the nominal trajectory satisfies the discrete dynamics. Independently chosen state guesses would generally leave such a defect. We write $F_t=[A_t\ B_t]$ for the combined Jacobian.

Taylor expansion of the running cost to second order gives

<a id="FONmGeSsRx"></a>

$$
c_t(\bar{\mathbf x}_t+\delta\mathbf x_t,
    \bar{\mathbf u}_t+\delta\mathbf u_t)
 = \bar c_t+
\begin{bmatrix}c_{x,t}\\c_{u,t}\end{bmatrix}^{\!\top}\delta\mathbf z_t
+\frac12\delta\mathbf z_t^\top
\begin{bmatrix}c_{xx,t}&c_{xu,t}\\c_{ux,t}&c_{uu,t}\end{bmatrix}
\delta\mathbf z_t+o(\|\delta\mathbf z_t\|^2).
$$

[(7)](#FONmGeSsRx "Link to this Equation")

Here $\bar c_t=c_t(\bar{\mathbf x}_t,\bar{\mathbf u}_t)$ and $c_{x,t}=\nabla_{\mathbf x}c_t(\bar{\mathbf x}_t,\bar{\mathbf u}_t)$; the other gradient and Hessian blocks are evaluated at the same nominal pair. We denote the stacked gradient by $c_{z,t}$ and the displayed block Hessian by $c_{zz,t}$. Gradients are column vectors, matching the convention of the preceding chapters. We retain the linear terms: individual stage gradients need not vanish even at an optimal trajectory because the dynamics couple stages, and at a non-optimal nominal trajectory they also drive its correction. The $c_{xu,t}$ block measures how the marginal cost of a control changes with the state. Even if the running cost has no such cross term, eliminating later controls can create one in the quadratic tail.

The terminal cost has the same expansion, with no control coordinate:

<a id="JVbuCgeI3P"></a>

$$
\begin{aligned}
c_T(\bar{\mathbf x}_T+\delta\mathbf x_T)
&=c_T(\bar{\mathbf x}_T)+p_T^\top\delta\mathbf x_T\\
&\quad+\frac12\delta\mathbf x_T^\top P_T\delta\mathbf x_T
 +o(\|\delta\mathbf x_T\|^2),\\
p_T&=\nabla_{\mathbf x}c_T(\bar{\mathbf x}_T),\qquad
P_T=\nabla^2_{\mathbf x\mathbf x}c_T(\bar{\mathbf x}_T).
\end{aligned}
$$

[(8)](#JVbuCgeI3P "Link to this Equation")

Dropping the remainders in these Taylor expansions yields a quadratic cost subject to linearized transitions. The state at one step couples only to its neighbors. This is the local problem solved by backward elimination. A general SQP method also forms local quadratic subproblems, but its exact Lagrangian Hessian includes terms from dynamics curvature. Those terms enter below when we develop DDP.

<a id="backward-elimination"></a>

## Backward Elimination

The last control affects only its own stage and the terminal state when its starting state is fixed. Eliminating it first leaves a shorter quadratic problem of the same form. Repeating that step works backward through the horizon.

<a id="a-two-step-calculation"></a>

### A two-step calculation

Consider a scalar example with $T=3$, initial state $x_1=0$, dynamics $x_{t+1}=x_t+u_t$, and cost

<a id="wFbz0Yt946"></a>

$$
J=\frac12u_1^2+\frac12u_2^2+\frac12(x_3-1)^2.
$$

[(9)](#wFbz0Yt946 "Link to this Equation")

Treat $x_2$ as given while eliminating $u_2$. Substitution of $x_3=x_2+u_2$ gives

<a id="oimYWUraaE"></a>

$$
\frac12u_2^2+\frac12(x_2+u_2-1)^2
=u_2^2+(x_2-1)u_2+\frac12(x_2-1)^2.
$$

[(10)](#oimYWUraaE "Link to this Equation")

Differentiating with respect to $u_2$ gives $2u_2+x_2-1=0$, so $u_2=(1-x_2)/2$. Substituting this expression back into the last two terms of the cost leaves $(x_2-1)^2/4$. Since $x_2=u_1$, the remaining problem is

<a id="IThYcYUxEi"></a>

$$
\min_{u_1}\ \frac12u_1^2+\frac14(u_1-1)^2.
$$

[(11)](#IThYcYUxEi "Link to this Equation")

Its derivative is $u_1+(u_1-1)/2$, giving $u_1=1/3$. Forward substitution then gives $x_2=1/3$, $u_2=1/3$, $x_3=2/3$, and $J=1/6$. The final position is short of one because the objective trades terminal error against effort; arrival was penalized, not imposed as an equality.

The expression $u_2=(1-x_2)/2$ also carries information that a single number would discard: if the state reaching the last step changes, the minimizing last control changes with it. This dependence becomes the matrix feedback correction in the general calculation.

<a id="eliminating-a-vector-control"></a>

### Eliminating a vector control

Suppose all controls after time $t$ have already been eliminated from the local problem. Write the remaining quadratic tail as

<a id="DKDdFdMAcp"></a>

$$
S_{t+1}(\delta\mathbf x_{t+1})
=s_{t+1}+p_{t+1}^\top\delta\mathbf x_{t+1}
+\frac12\delta\mathbf x_{t+1}^\top P_{t+1}\delta\mathbf x_{t+1}.
$$

[(12)](#DKDdFdMAcp "Link to this Equation")

At the terminal step, $S_T$ is the quadratic Taylor polynomial of $c_T$, so $s_T=c_T(\bar{\mathbf x}_T)$ and its other coefficients are the $p_T,P_T$ defined above. At earlier steps, $S_{t+1}$ is obtained by elimination from a finite optimization problem. This construction does not require a function over all states of the nonlinear system.

Substitute $\delta\mathbf x_{t+1}=A_t\delta\mathbf x_t+B_t\delta\mathbf u_t$ into this tail and add the stage cost. With $F_t=[A_t\ B_t]$, the new linear and quadratic coefficients are

<a id="HzNkkPYdHy"></a>

$$
q_t=c_{z,t}+F_t^\top p_{t+1},\qquad
M_t=c_{zz,t}+F_t^\top P_{t+1}F_t.
$$

[(13)](#HzNkkPYdHy "Link to this Equation")

We use $M_t$ for the local Hessian because $H_t$ denoted the Hamiltonian in the Pontryagin chapter. Partition $q_t$ and $M_t$ according to the state and control coordinates. Apart from a constant, the expression to minimize is

<a id="ttQ8iT5sYS"></a>

$$
q_x^\top\delta\mathbf x+q_u^\top\delta\mathbf u
+\frac12\delta\mathbf x^\top M_{xx}\delta\mathbf x
+\delta\mathbf u^\top M_{ux}\delta\mathbf x
+\frac12\delta\mathbf u^\top M_{uu}\delta\mathbf u.
$$

[(14)](#ttQ8iT5sYS "Link to this Equation")

The time index is suppressed within this one-step calculation. When $M_{uu}$ is positive definite, setting the control derivative to zero gives

<a id="klWvlgs2Ps"></a>

$$
M_{uu}\delta\mathbf u+q_u+M_{ux}\delta\mathbf x=0,
\qquad
\delta\mathbf u=k+K\delta\mathbf x,
$$

[(15)](#klWvlgs2Ps "Link to this Equation")

where

<a id="fNg1dJqu6e"></a>

$$
k=-M_{uu}^{-1}q_u,\qquad K=-M_{uu}^{-1}M_{ux}.
$$

[(16)](#fNg1dJqu6e "Link to this Equation")

Restoring the time index gives the affine correction $\delta\mathbf u_t=k_t+K_t\delta\mathbf x_t$. The vector $k$ changes the nominal command even at zero state deviation. The matrix $K$ adjusts that change for a different state arriving from the earlier steps. In code, these formulas are linear solves with $M_{uu}$; an explicit matrix inverse is unnecessary.

Substituting the minimizing control back into the quadratic expression gives the coefficients needed by the preceding step:

<a id="Zc95yuoLu8"></a>

$$
\begin{aligned}
p_t&=q_x-M_{ux}^\top M_{uu}^{-1}q_u,\\
P_t&=M_{xx}-M_{ux}^\top M_{uu}^{-1}M_{ux}.
\end{aligned}
$$

[(17)](#Zc95yuoLu8 "Link to this Equation")

The subtracted term in $P_t$ is the Schur complement associated with eliminating the control block. Repeat this operation from $T-1$ to one, starting with the terminal coefficients. A subsequent forward substitution recovers the state and control changes. For fixed state and control dimensions, the number of these elimination steps grows linearly with the horizon.

For linear dynamics and quadratic costs, this procedure solves the original unconstrained problem exactly when its control minimizations are well posed. That problem is called the **linear-quadratic regulator** problem, and the matrix recursion for $P_t$ is a **Riccati recursion**. Along a nonlinear trajectory, $A_t$, $B_t$, and the cost derivatives describe only a local approximation. They must be recomputed after the trajectory changes.

<a id="sec-ilqr-rollout"></a>

## Nonlinear Rollouts and iLQR

The backward pass minimizes a quadratic approximation. A large correction can make its linearized state prediction inaccurate, so a proposed control sequence must be evaluated through the original discrete simulator before it is accepted.

Starting from the same initial state, form a nonlinear trial trajectory using

<a id="gDeGkFns7f"></a>

$$
\begin{aligned}
\mathbf x_1^+&=\mathbf x_{\mathrm{init}},\\
\mathbf u_t^+&=\bar{\mathbf u}_t+\alpha k_t
                  +K_t(\mathbf x_t^+-\bar{\mathbf x}_t),\\
\mathbf x_{t+1}^+&=\mathbf f_t(\mathbf x_t^+,\mathbf u_t^+).
\end{aligned}
$$

[(18)](#gDeGkFns7f "Link to this Equation")

The step size $\alpha$ scales the feedforward change. The feedback term responds to the state deviation that actually occurs during this trial. Its gain is not multiplied by $\alpha$. At $\alpha=0$, induction through these equations recovers the nominal trajectory, because each state deviation is then zero. For an exact linear-quadratic problem, $\alpha=1$ gives the complete solution derived by elimination.

A line search first tries $\alpha=1$, then successively smaller values. Each trial has its own nonlinear states and cost. The implementation uses $1,1/2,\ldots,2^{-11}$ and accepts a strictly lower finite cost with a small sufficient-decrease check. If

<a id="DOmGh53M0I"></a>

$$
d_1=\sum_{t=1}^{T-1}q_{u,t}^\top k_t,\qquad
d_2=\frac12\sum_{t=1}^{T-1}k_t^\top M_{uu,t}k_t,
$$

[(19)](#DOmGh53M0I "Link to this Equation")

the backward pass estimates a reduction $\widehat\Delta J(\alpha)=-\alpha d_1-\alpha^2d_2$. Acceptance requires $J(\bar{\mathbf U})-J(\mathbf U^+)\geq10^{-4}\max(\widehat\Delta J(\alpha),0)$ as well as a strict decrease. This estimate guides acceptance; it does not replace evaluation of the original objective.

The control curvature may be indefinite or nearly singular. Replace the matrix used in the control solve by $M_{uu}+\mu I$, where $\mu>0$. Increasing $\mu$ makes the correction more conservative and can make the solve positive definite. The code checks a Cholesky factorization, increases $\mu$ after a failed backward pass or line search, and decreases it after an accepted step. The numerical defaults start at 10\-4, multiply by ten after failure, and divide by three after acceptance, with a floor of 10\-9.

When regularization changes $k$ and $K$, the simplified Schur-complement formulas above no longer describe substitution into the original quadratic model. The implementation therefore uses the full expressions

<a id="ZOqf1HJQ8x"></a>

$$
\begin{aligned}
p_t&=q_x+M_{ux}^\top k+K^\top q_u+K^\top M_{uu}k,\\
P_t&=M_{xx}+M_{ux}^\top K+K^\top M_{ux}+K^\top M_{uu}K.
\end{aligned}
$$

[(20)](#ZOqf1HJQ8x "Link to this Equation")

Here $M_{uu}$ is the original curvature block; regularization was used to choose the correction. These expressions also remain applicable when some controls are fixed at their bounds.

Alternating local linear-quadratic approximation, backward elimination, and nonlinear rollout gives iLQR [Li & Todorov, 2004](https://roboti.us/lab/papers/LiICINCO04.pdf). The iteration uses second derivatives of the costs but only first derivatives of the dynamics. It is often described as a Gauss--Newton approximation to DDP. That terminology should not obscure what is approximated: the omitted terms come from dynamics curvature. If a nonlinear cost is itself a sum of squared residuals, replacing its Hessian by a residual-Jacobian product would be a further approximation; the docking code uses the exact cost Hessian.

<a id="alg-trajectory-ilqr"></a>

[Algorithm 1](#alg-trajectory-ilqr "Link to this Algorithm") (Successive linear-quadratic trajectory optimization)

**Input:** Discrete transition, running and terminal costs, initial state, and a feasible initial control sequence.

1.  Roll out the current controls and evaluate their nonlinear cost.
    
2.  Differentiate the transition and costs along this rollout.
    
3.  Starting from the terminal quadratic expansion, eliminate controls backward to obtain $k_t$ and $K_t$. Increase regularization and retry if a control solve fails.
    
4.  Test decreasing step sizes using nonlinear forward rollouts with the affine corrections.
    
5.  Accept a trial only when its actual cost decreases sufficiently. Otherwise increase regularization and retry the backward pass.
    
6.  Repeat until the control-gradient residual is small or a declared iteration or regularization limit is reached.
    

**Output:** The last accepted trajectory, its controls and local gains, an iteration history, and an explicit termination status.

The returned gains describe a neighborhood of the final nominal trajectory. The docking animation below executes one stored plan. The gains used inside the optimizer do not imply that the animation replans as the boat moves.

<a id="sec-ddp-curvature"></a>

## Dynamics Curvature and DDP

iLQR drops the quadratic remainder in the transition’s first-order Taylor expansion. For a turning boat, a change in heading changes the direction of thrust, so products of state and control changes can affect the next state. DDP retains these second-order terms in the backward calculation.

For component $i$ of the transition, Taylor expansion one order further gives

<a id="eBhTEssJsF"></a>

$$
\delta x_{t+1,i}
=(F_t\delta\mathbf z_t)_i
+\frac12\delta\mathbf z_t^\top f^i_{zz,t}\delta\mathbf z_t
+o(\|\delta\mathbf z_t\|^2).
$$

[(21)](#eBhTEssJsF "Link to this Equation")

Here $f^i_{zz,t}$ is the Hessian of the $i$th component of $\mathbf f_t$ with respect to the stacked state and control, evaluated at the nominal pair. Substitute this expression into the same quadratic tail $S_{t+1}$. Its linear term $p_{t+1}^\top\delta\mathbf x_{t+1}$ now contributes an additional quadratic term. Its quadratic term contributes $\tfrac12\delta\mathbf z_t^\top F_t^\top P_{t+1}F_t\delta\mathbf z_t$; products involving the second-order part of the transition there are of order three or higher and are discarded. Consequently,

<a id="kajfcTsFeN"></a>

$$
\begin{aligned}
q_t^{\mathrm{DDP}}&=c_{z,t}+F_t^\top p_{t+1},\\
M_t^{\mathrm{DDP}}&=c_{zz,t}+F_t^\top P_{t+1}F_t
                  +\sum_{i=1}^{n_x}p_{t+1,i}f^i_{zz,t}.
\end{aligned}
$$

[(22)](#kajfcTsFeN "Link to this Equation")

The extra contraction weights curvature of each next-state component by its linear coefficient in the eliminated tail. At a given backward stage, this is the second-order chain rule for composing the transition with that tail. In block form, the differences from iLQR are

<a id="YfvxNdoxnC"></a>

$$
\begin{aligned}
M_{xx,t}^{\mathrm{DDP}}&=c_{xx,t}+A_t^\top P_{t+1}A_t
                    +\sum_i p_{t+1,i} f^i_{xx,t},\\
M_{ux,t}^{\mathrm{DDP}}&=c_{ux,t}+B_t^\top P_{t+1}A_t
                    +\sum_i p_{t+1,i} f^i_{ux,t},\\
M_{uu,t}^{\mathrm{DDP}}&=c_{uu,t}+B_t^\top P_{t+1}B_t
                    +\sum_i p_{t+1,i} f^i_{uu,t}.
\end{aligned}
$$

[(23)](#YfvxNdoxnC "Link to this Equation")

Setting those three sums to zero recovers the iLQR construction. Retaining them and using the same quadratic elimination and nonlinear line search gives DDP [Tassa _et al._, 2014](https://doi.org/10.1109/ICRA.2014.6907001). The two methods share an algorithmic structure; the curvature choice can change both the direction of a step and the amount of regularization needed to accept it. This derivation does not require solving a subproblem with quadratic dynamics constraints.

For the boat, even the continuous acceleration contains a state--control cross derivative: $\partial^2\dot v_x/(\partial\psi\,\partial u_L)
=-(F_{\max}/m)\sin\psi$. The discrete derivatives used by the solver also include how heading and velocity change within the RK4 step. Automatic differentiation is applied through that complete step. A differential equation that is affine in its controls need not yield a numerical transition whose second control derivatives vanish.

The extra curvature costs computation and can be indefinite. DDP therefore still needs regularization and nonlinear acceptance tests. Neither method guarantees the globally best docking maneuver. For affine dynamics the transition Hessians are zero, so the two backward constructions coincide when all other choices agree.

<a id="thruster-limits-and-stopping-criteria"></a>

## Thruster Limits and Stopping Criteria

The boat’s controls must remain in $[-1,1]^2$, even when the unconstrained correction asks for more thrust. At zero state deviation, the feedforward step is the solution of the box-constrained quadratic problem

<a id="IX7ngTrP8x"></a>

$$
\min_k\ q_u^\top k+\frac12k^\top(M_{uu}+\mu I)k,
\qquad -\mathbf1-\bar{\mathbf u}_t\leq k\leq\mathbf1-\bar{\mathbf u}_t.
$$

[(24)](#IX7ngTrP8x "Link to this Equation")

For two controls, each coordinate is either free, fixed at its lower bound, or fixed at its upper bound. The teaching implementation checks the nine combinations, minimizes over each face, and keeps the best feasible candidate. Positive-definite curvature makes this a strictly convex QP. Larger systems can use an active-set solver rather than enumerate all combinations [Tassa _et al._, 2014](https://doi.org/10.1109/ICRA.2014.6907001).

The feedback rows of saturated controls are zero while their active set stays fixed. For the free coordinates $\mathcal F$, solve $(M_{uu}+\mu I)_{\mathcal F\mathcal F}K_{\mathcal F}
=-(M_{ux})_{\mathcal F}$. Use the full substitution formulas to update the quadratic tail. With bounds, this tail describes a neighborhood with the selected active sets; across active-set changes the minimized expression is generally piecewise quadratic. During the nonlinear trial, project the resulting control onto its box before simulation. This enforces the physical bounds when a trial leaves the neighborhood represented by the backward pass. The nonlinear cost check then decides whether that trial should be retained.

The stopping test is separate from docking success. Let $g=\nabla_{\mathbf U}J$ be the gradient of the original shooting objective, computed by the adjoint recursion along the current nonlinear rollout. With normalized controls, the solver stops when

<a id="pd0F0obbYx"></a>

$$
\left\|\mathbf U-\operatorname{clip}(\mathbf U-g,-1,1)\right\|_\infty
\leq10^{-5}.
$$

[(25)](#pd0F0obbYx "Link to this Equation")

At an interior optimum this reduces to a small control gradient. At a bound it also allows a gradient that points toward a forbidden improvement. The experiment permits at most 120 accepted updates. If regularization exceeds 1012 without an acceptable trial, the solver retains its last accepted trajectory and reports failure to make progress. A small residual certifies approximate first-order stationarity, not a globally optimal path or a successful arrival.

<a id="sec-docking-results"></a>

## Docking Trajectories and Recorded Futures

Do the two curvature choices produce the same maneuver from the same starting plan? Both methods receive the coasting initialization, identical costs and control limits, and the same stopping settings. The following tables report their final nonlinear costs and arrival checks. Each final control sequence is also replayed with four RK4 substeps per control interval, giving a $0.025\ \mathrm s$ validation grid.

| Approach | Method | Cost | Accepted updates |
| --- | --- | --- | --- |
| Angled approach | iLQR | 8.0515 | 18 |
| Angled approach | DDP | 11.9879 | 34 |
| Sideways drift | iLQR | 7.6674 | 13 |
| Sideways drift | DDP | 7.6674 | 45 |

The arrival checks below use the finer replay.

| Approach | Method | Position error (m) | Heading error (°) | Speed (m/s) | Clearance (m) |
| --- | --- | --- | --- | --- | --- |
| Angled approach | iLQR | 0.000125 | 8.98e-05 | 6.89e-05 | 0.599 |
| Angled approach | DDP | 0.00125 | 0.139 | 0.0144 | 0.352 |
| Sideways drift | iLQR | 3.89e-05 | 2.65e-06 | 4.25e-05 | 0.600 |
| Sideways drift | DDP | 3.89e-05 | 3.71e-06 | 4.25e-05 | 0.600 |

All four runs satisfy the stopping test and the docking checks: position error below $0.2\ \mathrm m$, heading error below $3^\circ$, speed below $0.05\ \mathrm{m/s}$, angular speed below $1^\circ/\mathrm s$, bounded thrust, and positive hull clearance. The maximum position difference between the planning trajectory and the finer replay is below $10^{-6}\ \mathrm m$ in these runs. Clearance is checked on the finer grid; this remains a sampled validation, not a proof of continuous-time collision avoidance.

<a id="fig-boat-paths"></a>

<a id="cZRBTebLgI"></a>
![Final trajectories under the same initialization and objective. Solid blue
is iLQR and dashed orange is DDP; the dotted gray path is the initial coast.
Outlines show orientation every four seconds. DDP takes a different turning
maneuver in the angled approach. The two final paths nearly coincide in the
sideways-drift case.](../Assets/Website/605bed68f9-paths-29cb7f444f8996d8e8ebb1cca8315a7c.svg)

[Figure 2:](#fig-boat-paths "Link to this figure")Final trajectories under the same initialization and objective. Solid blue is iLQR and dashed orange is DDP; the dotted gray path is the initial coast. Outlines show orientation every four seconds. DDP takes a different turning maneuver in the angled approach. The two final paths nearly coincide in the sideways-drift case.

In the angled approach, iLQR reaches cost 8.0515 in 18 accepted updates, while DDP reaches a different stationary trajectory with cost 11.9879 in 34 updates. The DDP trajectory makes two full turns near the berth. Its final unwrapped heading is approximately $720^\circ$, which the periodic heading cost treats as the same orientation as zero. Reaching this stationary trajectory does not remove the extra motion accumulated on the way there. In the sideways-drift case, both reach cost 7.6674, with 13 accepted updates for iLQR and 45 for DDP. These are outcomes of two particular local solves, not a general ranking of the algorithms. The difference in the first case also shows why comparing iteration counts alone can hide a difference in the solutions obtained.

<a id="fig-boat-convergence"></a>

<a id="cz1O59NSNc"></a>
![Actual nonlinear cost at every accepted iteration, including the initial
rollout at iteration zero. The vertical axis is logarithmic. Rejected trial
steps are excluded from the horizontal count; forward-evaluation and
backward-attempt counts are available in the downloadable diagnostics.](../Assets/Website/5d155e739a-convergence-c9b79a2171f5a3fbdfa9e614b0acb581.svg)

[Figure 3:](#fig-boat-convergence "Link to this figure")Actual nonlinear cost at every accepted iteration, including the initial rollout at iteration zero. The vertical axis is logarithmic. Rejected trial steps are excluded from the horizontal count; forward-evaluation and backward-attempt counts are available in the downloadable diagnostics.

Within one selected plan, simulation time has a different meaning from optimizer iteration. At two seconds, for example, the boat occupies the two-second state of that rollout. Its remaining states give a prediction of where it will go if the rest of the stored controls are applied. Outlines spaced equally in time spread apart while the boat is moving quickly and cluster as it comes to rest. Reverse thrust helps remove momentum before arrival.

<a id="fig-boat-future"></a>

<a id="YZDpVQUS2B"></a>
![The final iLQR plan for the angled approach. The filled boat marks the selected
simulation time; translucent outlines show future poses every two seconds.
The right panel gives speed and both physical thrusts. Negative thrust during
the approach brakes the boat. The vertical marker identifies the same time
as the filled boat.](../Assets/Website/c151822aaf-future-and-motion-c18ca98ca05e0db8a19b619cd90881e2.svg)

[Figure 4:](#fig-boat-future "Link to this figure")The final iLQR plan for the angled approach. The filled boat marks the selected simulation time; translucent outlines show future poses every two seconds. The right panel gives speed and both physical thrusts. Negative thrust during the approach brakes the boat. The vertical marker identifies the same time as the filled boat.

<a id="vf5z0Zitqv"></a>

[Démonstration interactive — Boat docking with iLQR and DDP](https://pierrelucbacon.com/interactive/boat-docking.html)

Choose a scenario and optimizer iteration, then scrub or play simulation time within that fixed plan. The path ahead and boat outlines display its remaining predicted states. Arrival errors and plots belong to the selected iteration, including intermediate plans that do not dock successfully.

The replay reads recorded simulations, so exploring it does not rerun an optimizer. Recomputing a plan from newly observed states is the additional step introduced in [receding-horizon control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md).

<a id="sec-thermoacoustic-pulldown"></a>

## Pulling Down a Thermoacoustic Refrigerator

A standing-wave thermoacoustic refrigerator is a sealed, gas-filled tube with a loudspeaker at one end and a stack of thin parallel plates inside ([Figure 6](#fig-thermoacoustic-geometry)a). The loudspeaker excites a standing sound wave in the tube. Each gas parcel near a plate is pushed back and forth along it, compressing and heating as it moves toward the loudspeaker end and expanding and cooling as it moves away. At the loudspeaker end of its travel the parcel is warmer than the plate and gives up heat to it; at the far end it is cooler than the plate and takes heat from it. Every cycle therefore moves a little heat one step along the plate, and the parcels together act as a bucket brigade that transports heat from the far end of the stack toward the loudspeaker end. Sound is used to move heat from a cold place to a warmer one, against the direction it would flow on its own. A household heat pump does the same thing with a compressor when it extracts heat from cold outdoor air and delivers it indoors; a refrigerator is the same machine used for its cold side. A cold heat exchanger at the far end of the stack connects to the payload, the refrigeration term for the object or compartment being cooled, and a hot heat exchanger at the loudspeaker end rejects the heat to ambient air. There are no moving parts other than the loudspeaker, and the only knob is how hard it drives. The control problem is what refrigeration engineers call a pull-down: bringing the payload from ambient temperature down to its set point after switch-on. Here that means choosing a driver-amplitude schedule that brings the payload to a target temperature by a fixed deadline while spending little acoustic energy.

<a id="fig-thermoacoustic-geometry"></a>

[Démonstration interactive — Thermoacoustic refrigerator: device, lumped model, and recorded pull-down plans](https://pierrelucbacon.com/interactive/thermoacoustic-refrigerator.html)

[Figure 6:](#fig-thermoacoustic-geometry "Link to this figure")Geometry of the thermoacoustic refrigerator and its two-state abstraction. (a) The device: a loudspeaker piston at the left end of a sealed resonator, a hot heat exchanger, a stack of thin plates, and a cold heat exchanger. The dashed envelope is the standing-wave pressure amplitude. Gas parcels oscillating along the plates pump heat from the cold exchanger toward the hot one. (b) The lumped model the optimizer sees. The state is the pair of exchanger temperatures, the action is the driver amplitude, the stage cost charges acoustic work, and the terminal cost penalizes the final cold-side temperature error. In the online book the figure replays the recorded iLQR and DDP plans: the piston stroke, wave, and parcel motion follow the action, the exchanger and node tints follow the state, and the panels below compare the plan with a constant-amplitude schedule. The static version shows the same two panels.

In the online book, the replay reads the recorded plans and integrates only the constant-amplitude comparison; it does not rerun the optimizer.

Rather than simulate the acoustics, we lump the whole device into two thermal masses ([Figure 6](#fig-thermoacoustic-geometry)b): the cold exchanger together with its payload, and the hot exchanger. The state is their temperatures, $\mathbf x_t=(T_{c,t},T_{h,t})$, and the action is the normalized driver amplitude $u_t\in[0,1]$, so this is a two-dimensional continuous-state, one-dimensional continuous-action problem. Let $\Delta T=T_h-T_c$ be the temperature span across the stack and $\eta(\Delta T)=1-\Delta T/\Delta T_0$ a pumping efficiency that decreases linearly with that span. The continuous-time dynamics are

<a id="iA96astEPf"></a>

$$
\begin{aligned}
\dot Q_c &= k_q u^2\eta(\Delta T),&
\dot W &= k_w u^2\eta(\Delta T)+k_vu^2+k_3u^3,\\
C_c\dot T_c &= -\dot Q_c+Q_{\mathrm{load}},&
C_h\dot T_h &= \dot Q_c+\dot W-UA(T_h-T_{\mathrm{amb}}).
\end{aligned}
$$

[(26)](#iA96astEPf "Link to this Equation")

Here $\dot Q_c$ is the heat pumped out of the cold side, $\dot W$ is the acoustic work the driver injects, $Q_{\mathrm{load}}$ is a parasitic heat leak into the payload, and $UA$ is the hot exchanger’s conductance to ambient. Both heat flows scale with $u^2$ because acoustic power is quadratic in wave amplitude, and both weaken as the span grows; this is the short-stack approximation of thermoacoustics [Swift, 1988](https://doi.org/10.1121/1.396617)[Swift, 2017](https://doi.org/10.1007/978-3-319-66933-5). Two loss terms complete the work: a viscous term in $u^2$ and a cubic term $k_3u^3$ that makes hard driving disproportionately expensive. The coupling matters for the optimizer. Driving hard pumps heat faster, but it also dumps that heat plus the work into the hot side, which raises $T_h$, widens the span, and lowers the efficiency of every later step. Refrigeration engineers measure this efficiency by the coefficient of performance (COP), the ratio $\dot Q_c/\dot W$ of heat pumped to work spent while the driver is on. Unlike an efficiency it can exceed one, because the work only moves heat rather than producing cold. In this model the COP falls as the span grows and, through the cubic term, as the amplitude grows; one scenario below removes the cubic term so that the COP no longer depends on amplitude. All coefficients are synthetic teaching values, not measurements of a particular device.

| Quantity | Value |
| --- | --- |
| Cold and hot heat capacities $C_c,C_h$ | $20,50\ \mathrm{J/K}$ |
| Hot conductance $UA$ | $0.5\ \mathrm{W/K}$ |
| Ambient temperature $T_{\mathrm{amb}}$ | $20\ ^\circ\mathrm C$ |
| Parasitic cold-side load $Q_{\mathrm{load}}$ | $1\ \mathrm W$ |
| Pumping coefficient $k_q$ | $5\ \mathrm W$ |
| Work and viscous coefficients $k_w,k_v$ | $4,1\ \mathrm W$ |
| Cubic-loss coefficient $k_3$ | $2\ \mathrm W$ |
| Critical temperature span $\Delta T_0$ | $40\ \mathrm K$ |
| Target temperature $T^\star$ | $5\ ^\circ\mathrm C$ |

Both temperatures begin at ambient, $20\ ^\circ\mathrm C$. A fourth-order Runge--Kutta step of length $h=1\ \mathrm s$ defines the deterministic transition $\mathbf x_{t+1}=\mathbf f_t(\mathbf x_t,u_t)$ over a horizon of $T-1=300$ actions, so the episode is exactly five minutes. The cost uses the same stage-plus-terminal form as the docking problem:

<a id="gGDUlznx25"></a>

$$
c_t(\mathbf x_t,u_t)=h\,w_E\dot W(\mathbf x_t,u_t),\qquad
c_T(\mathbf x_T)=w_T(T_{c,T}-T^\star)^2,
\qquad w_E=0.05,\quad w_T=10.
$$

[(27)](#gGDUlznx25 "Link to this Equation")

The stage cost charges only energy, and the target enters only through the terminal cost, so the objective is sparse in the RL sense: nothing tells the optimizer how cold to be at intermediate times. The terminal penalty is soft, so a plan can trade some arrival error for lower energy. Both methods start from the constant open-loop sequence $u_t=0.5$ and use the same action bounds and stopping settings.

| Experiment | Method | Status | Accepted updates | Cost | Energy (J) | Cold at 300 s (°C) |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline pull-down | iLQR | converged | 24 | 51.224 | 1016 | 5.20 |
| Baseline pull-down | DDP | converged | 12 | 51.224 | 1016 | 5.20 |
| No parasitic load | iLQR | converged | 28 | 20.652 | 411 | 5.09 |
| No parasitic load | DDP | converged | 8 | 20.652 | 411 | 5.09 |
| Sluggish hot side | iLQR | converged | 28 | 45.716 | 911 | 5.13 |
| Sluggish hot side | DDP | converged | 14 | 45.585 | 908 | 5.13 |
| Amplitude-independent COP | iLQR | iteration\_limit | 200 | 33.353 | 666 | 5.08 |
| Amplitude-independent COP | DDP | converged | 27 | 33.353 | 666 | 5.08 |
| Target out of reach in 300 s | iLQR | converged | 2 | 119.582 | 1426 | 2.20 |
| Target out of reach in 300 s | DDP | converged | 10 | 119.582 | 1426 | 2.20 |

Costs are evaluated on the final accepted nonlinear trajectory. The iteration-limit row is a retained local plan, not a converged solve.

For comparison, constant full amplitude in the baseline case ends at 2.20 °C, uses 1426 J, and has cost 149.89.

<a id="fig-thermoacoustic-pulldown"></a>

<a id="M1TyQb0Ccl"></a>
![Cold and hot temperatures under the baseline plan, with a constant
full-amplitude rollout for comparison. The lower panel shows their driver
amplitudes. The target line and temperature traces show the tradeoff between
energy use and final cold temperature.](../Assets/Website/ff30e8c5c1-pulldown-9186f5b8900724a36a7537874cda5746.svg)

[Figure 7:](#fig-thermoacoustic-pulldown "Link to this figure")Cold and hot temperatures under the baseline plan, with a constant full-amplitude rollout for comparison. The lower panel shows their driver amplitudes. The target line and temperature traces show the tradeoff between energy use and final cold temperature.

The baseline plan drives relatively hard at first, eases off, then ramps to full amplitude near the deadline. Early driving uses the initially small temperature span, but it also warms the hot side and weakens later pumping. The fixed load adds the same total heat over every 300-second plan. Control timing still changes the temperature span and therefore the final cold temperature. Running at full amplitude throughout uses about $1426\ \mathrm J$ and reaches $2.20\ ^\circ\mathrm C$; its nonlinear cost is 149.886, versus 51.224 for the baseline local plan. The soft terminal cost need not favor the coldest possible final state.

<a id="fig-thermoacoustic-variants"></a>

<a id="G75zbUKzmX"></a>
![Final computed amplitude schedules for the baseline, no-load,
sluggish-hot-side, and no-cubic-loss cases. The first three are iLQR plans;
the no-cubic-loss plan is from DDP. Removing the cold-side load flattens the
schedule, while changing the hot-side dynamics produces a long ramp.](../Assets/Website/d9ba72c8ff-variants-8420d7aaef9a55800a6235c76d7cde80.svg)

[Figure 8:](#fig-thermoacoustic-variants "Link to this figure")Final computed amplitude schedules for the baseline, no-load, sluggish-hot-side, and no-cubic-loss cases. The first three are iLQR plans; the no-cubic-loss plan is from DDP. Removing the cold-side load flattens the schedule, while changing the hot-side dynamics produces a long ramp.

Without the parasitic load, a nearly constant amplitude is economical. To see the tendency, temporarily hold the temperature span fixed and write $v=u^2$. Heat pumped is then proportional to $v$, while the cubic loss is proportional to $v^{3/2}$, a convex function for $v\geq0$. For a fixed total amount of pumping, Jensen’s inequality favors spreading $v$ through time. The actual schedule is not exactly constant because the span and hot-side temperature still respond to the controls. With $C_h=200\ \mathrm{J/K}$ and $UA=0.2\ \mathrm{W/K}$, the amplitude rises through most of the horizon, then turns off for the final two intervals. Both thermal storage and heat rejection changed in that experiment, so it does not isolate the effect of either parameter.

The [DDP curvature term](#sec-ddp-curvature) also has a direct physical interpretation here. For the continuous cold-side equation,

<a id="MOSyWGFiqh"></a>

$$
\frac{\partial^2\dot T_c}{\partial u\,\partial\Delta T}
=\frac{2k_qu}{C_c\Delta T_0}.
$$

[(28)](#MOSyWGFiqh "Link to this Equation")

Increasing the temperature span weakens pumping, and this mixed derivative measures how that effect changes with amplitude. The solver differentiates the complete RK4 transition, whose Hessian also contains effects from the intermediate integration stages.

<a id="fig-thermoacoustic-convergence"></a>

<a id="tyBhXyLTyX"></a>
![Actual nonlinear cost after each accepted update for iLQR and DDP in the
baseline and no-cubic-loss cases. The vertical axis is logarithmic. The
curves compare these local solves from the same initial control sequence,
not a general ranking of the methods.](../Assets/Website/24f5481a62-convergence-1d0f11a24f7cd58df38e1873cdaf44b2.svg)

[Figure 9:](#fig-thermoacoustic-convergence "Link to this figure")Actual nonlinear cost after each accepted update for iLQR and DDP in the baseline and no-cubic-loss cases. The vertical axis is logarithmic. The curves compare these local solves from the same initial control sequence, not a general ranking of the methods.

When $k_3=0$, both pumping and work are quadratic in amplitude at a fixed temperature span. Their instantaneous ratio then no longer depends on amplitude, leaving weaker preferences among some schedules. In the recorded run, iLQR reaches its iteration limit while DDP satisfies the stopping test; both reach nearly the same final cost. For the sluggish hot side, DDP reaches a different, slightly lower-cost local plan than iLQR. Lowering the target to $0\ ^\circ\mathrm C$ produces a plan saturated at $u_t=1$ throughout the fixed horizon, exercising the box-constrained backward step. These outcomes depend on the initial sequence. Starting the baseline from constant amplitudes 0.1 and 0.9 leads to other local plans, so neither result certifies a global minimum.

<a id="exercises"></a>

## Exercises

<a id="ex-ilqr-two-step"></a>

[Exercise 1](#ex-ilqr-two-step "Link to this Exercise") (Change the terminal weight)

In the two-step scalar example, replace the terminal cost by $\tfrac\beta2(x_3-r)^2$, with $\beta>0$. Eliminate $u_2$ and then $u_1$. Find both controls and the terminal state. What happens as $\beta\to\infty$?

Solution to [Exercise 1](#ex-ilqr-two-step)

The last control is $u_2=\beta(r-x_2)/(1+\beta)$, and its minimized tail is $\beta(x_2-r)^2/[2(1+\beta)]$. With $x_1=0$, minimizing the remaining expression gives $u_1=\beta r/(1+2\beta)$, followed by the same value for $u_2$. Thus $x_3=2\beta r/(1+2\beta)$. As the terminal weight grows, the two controls tend to $r/2$ and the terminal state tends to $r$.

<a id="ex-ilqr-linear-case"></a>

[Exercise 2](#ex-ilqr-linear-case "Link to this Exercise") (The linear-quadratic special case)

Suppose the dynamics are affine and every cost is quadratic, with a strictly convex reduced objective and no control bounds. Explain why one unregularized backward pass and a full nonlinear rollout solve the problem from any feasible initial trajectory. What changes when using DDP?

Solution to [Exercise 2](#ex-ilqr-linear-case)

The local expansions are exact. Backward elimination therefore minimizes the original quadratic problem in perturbation coordinates, and $\alpha=1$ recovers its solution. The affine simulator agrees exactly with the linearized perturbation dynamics. All transition Hessians vanish, so DDP produces the same correction. This is also a useful implementation test: compare the returned controls with a dense solve of the reduced quadratic objective.

<a id="ex-ilqr-boat-curvature"></a>

[Exercise 3](#ex-ilqr-boat-curvature "Link to this Exercise") (A curvature term in the boat model)

Temporarily discretize the boat with forward Euler. Derive the mixed derivative $\partial^2 f^{v_x}/(\partial\psi\,\partial u_L)$. Identify where it enters the DDP backward pass and why iLQR omits it.

Solution to [Exercise 3](#ex-ilqr-boat-curvature)

The Euler velocity update contains $h(F_{\max}/m)(u_L+u_R)\cos\psi$. The mixed derivative is therefore $-h(F_{\max}/m)\sin\psi$. DDP multiplies it by the $v_x$ component of $p_{t+1}$ and adds it to the corresponding state--control curvature entry. iLQR uses the first-order transition, whose second derivatives are zero within the local model. The actual experiment differentiates RK4 instead, so its mixed derivative includes the intermediate integration stages.

<a id="ex-ilqr-terminal-speed"></a>

[Exercise 4](#ex-ilqr-terminal-speed "Link to this Exercise") (Remove the stopping penalty)

Set the terminal translational-velocity weight to zero and rerun the angled approach. Compare position error, terminal speed, and controls with the default run. Repeat with an eight-second horizon. Does arriving near the berth imply that docking succeeded?

Solution to [Exercise 4](#ex-ilqr-terminal-speed)

Use `make_problem(velocity_weight=0.)` and keep every other choice fixed for the first comparison. For the shorter experiment, set `steps=80` in `BoatParameters` and regenerate the initial controls. Removing the terminal velocity term removes an explicit incentive to stop at the final time. Running position and velocity costs can still lead to a slow arrival, especially over the longer horizon, so failure is not inevitable. Measure the final speed independently of position error and retain the same docking tolerances for both objectives. A low-cost pass through the target is not a successful stationary arrival.

<a id="ex-ilqr-saturation"></a>

[Exercise 5](#ex-ilqr-saturation "Link to this Exercise") (Saturation and a rejected step)

For a positive-definite $2\times2$ matrix $M$ with nonzero off-diagonal entries, compare the exact box-QP solution with clipping $-M^{-1}q$ componentwise. Explain why they can differ. What should the trajectory optimizer retain if every nonlinear trial is rejected?

Solution to [Exercise 5](#ex-ilqr-saturation)

Fixing one coordinate at a bound changes the stationarity equation for the other coordinate through the off-diagonal entry of $M$. Componentwise clipping does not solve that new equation. The face minimization does. If no nonlinear trial is accepted, the solver retains its previous controls and states and reports that it could not make progress; it must not replace them with an unaccepted trial or report convergence from rejection alone.

<a id="ex-ilqr-pulldown-load"></a>

[Exercise 6](#ex-ilqr-pulldown-load "Link to this Exercise") (Thermal load and amplitude scheduling)

Set the parasitic cold-side load to zero and rerun the baseline refrigerator problem. Explain why the optimized amplitude becomes nearly constant, using the convexity of the cubic loss. Then restore the load and double the horizon to $600\ \mathrm s$. Predict how the amplitude schedule and energy use change.

Solution to [Exercise 6](#ex-ilqr-pulldown-load)

With no load, cooling obtained early is not directly undone by a constant heat leak. If the temperature span were fixed, a given amount of cooling would fix the sum of $v_t=u_t^2$. The cubic loss is proportional to $v_t^{3/2}$, so Jensen’s inequality favors equal $v_t$ across time. The temperature span still evolves, which explains the modest variation in the computed schedule. With the load restored, the longer horizon admits lower amplitude over more intervals, but the leak adds heat throughout that extra time. In this model, the $600\ \mathrm s$ local solution starts near 0.59, reaches 0.89 by $550\ \mathrm s$, and uses full amplitude in the final intervals. Its approximately $1392\ \mathrm J$ of energy exceeds the shorter baseline’s use.

<a id="computational-sources"></a>

## Computational Sources

The implementation separates the generic backward recursion from the physical models and artifact builders:

-   [Shared iLQR and DDP solver](https://pierrelucbacon.com/rlbook/build/trajectory_optimizat-8e39dfce26c483d806221892c5f7eaff.py)
    
-   [Boat dynamics, costs, and validation](https://pierrelucbacon.com/rlbook/build/boat_docking-be2f16ff07bab127c02b677b368b5813.py)
    
-   [Experiment and figure builder](https://pierrelucbacon.com/rlbook/build/build_boat_docking_a-4ba8a2e7bc037166ac56040b328a8153.py)
    
-   [Numerical diagnostics and source hashes](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/d50da40a2e-metrics-e6ba7fc06c666ace72cc6d7eaf029a7c.json)
    
-   [Thermoacoustic model and costs](https://pierrelucbacon.com/rlbook/build/thermoacoustic_pulld-9ee6468c40051f66b47c636fa671347d.py)
    
-   [Thermoacoustic geometry figure](https://pierrelucbacon.com/rlbook/build/thermoacoustic_geome-b7b8acda58731e6ecacfcaf10a958f7d.py)
    
-   [Thermoacoustic experiment builder](https://pierrelucbacon.com/rlbook/build/build_thermoacoustic-69410e1d4f08f6115d2bf55fa2becd83.py)
    
-   [Thermoacoustic diagnostics](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/334f4983c3-metrics-adbb88abcc4191fb585d76c00baceac2.json)
    
-   [Thermoacoustic replay data](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/3b5a4c4b9f-thermoacoustic-refri-c73132288faaff6741ae7e0674dbece4.json)
    

Run `uv run python scripts/build_boat_docking_artifacts.py` from the repository root to reproduce the solves, figures, results table, and browser data. Normal book builds read those artifacts. Tests independently check the derivatives, the composed DDP curvature, the scalar calculation, and agreement between backward elimination and a dense quadratic solve.

Run `uv run python scripts/build_thermoacoustic_pulldown_artifacts.py` to regenerate the refrigerator results table, figures, diagnostics, and the browser replay data.

<a id="summary-and-outlook"></a>

## Summary and Outlook

A feasible nonlinear rollout supplies the point around which dynamics and costs are approximated. Backward elimination of a local quadratic problem then supplies both a feedforward change and a state-dependent correction. iLQR repeats that calculation with linearized dynamics; DDP includes the second-order chain-rule terms from the transition. Nonlinear rollouts, regularization, and acceptance tests connect these local calculations to a decreasing sequence of actual trajectory costs. The refrigerator applies the same calculation to a bounded driver amplitude, with energy use and terminal temperature competing in the objective.

The docking and refrigerator experiments both use discrete transitions obtained by integrating ordinary differential equations. [Continuous-time transcription and collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) develops other ways to represent continuous trajectories inside a finite optimization problem. Later, [finite-horizon dynamic programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) gives a broader interpretation of the quadratic tail: in the linear-quadratic case, the function produced by elimination is the optimal cost-to-go.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-li2004iterative"></a>
2.  Li, W., & Todorov, E. (2004). Iterative Linear Quadratic Regulator Design for Nonlinear Biological Movement Systems. _Proceedings of the First International Conference on Informatics in Control, Automation and Robotics_, _1_, 222–229. [https://roboti.us/lab/papers/LiICINCO04.pdf](https://roboti.us/lab/papers/LiICINCO04.pdf)
<a id="cite-tassa2014control"></a>
4.  Tassa, Y., Mansard, N., & Todorov, E. (2014). Control-Limited Differential Dynamic Programming. _IEEE International Conference on Robotics and Automation_, 1168–1175. [10.1109/ICRA.2014.6907001](https://doi.org/10.1109/ICRA.2014.6907001)
<a id="cite-swift1988thermoacoustic"></a>
6.  Swift, G. W. (1988). Thermoacoustic engines. _The Journal of the Acoustical Society of America_, _84_(4), 1145–1180. [10.1121/1.396617](https://doi.org/10.1121/1.396617)
<a id="cite-swift2017thermoacoustics"></a>
8.  Swift, G. W. (2017). _Thermoacoustics: A Unifying Perspective for Some Engines and Refrigerators_ (2nd ed.). Springer Cham. [10.1007/978-3-319-66933-5](https://doi.org/10.1007/978-3-319-66933-5)

[

Open-Loop Optimal Control

Numerical Trajectory Optimization


](08-numerical-trajectory-optimization.md)[

Open-Loop Optimal Control

Continuous-Time Transcription and Collocation


](10-continuous-time-collocation.md)


---

# CHAPITRE 10 — Continuous-Time Transcription and Collocation

Section du livre : Open-Loop Optimal Control

Page originale : https://pierrelucbacon.com/rlbook/continuous-time-collocation

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md

> **Cours de Pierre-Luc Bacon — 10.** [Page publiée](https://pierrelucbacon.com/rlbook/continuous-time-collocation) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/10-continuous-time-collocation.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Continuous-Time Transcription and Collocation

<a id="skip-to-article"></a>

The preceding chapters formulated and optimized trajectories through discrete transition maps. Physical models are often given instead by ordinary differential equations, so their states and controls are functions of time. A finite-dimensional optimizer cannot choose an entire function directly. Continuous-time trajectory optimization therefore begins by replacing those functions and their differential equations with finitely many variables and constraints on those variables.

How can that replacement preserve enough of the differential equation to make the resulting trajectory meaningful between the stored time points?

This replacement is called **transcription**, and the resulting finite optimization problem is a nonlinear program (NLP).

The direct-collocation formulation used here stores state and control values at selected times and interpolates between them with low-degree polynomials. The differential equation is enforced at selected points on each time interval. This chapter develops that construction from one simple example through Euler, trapezoidal, and Hermite--Simpson transcriptions, then applies it to the motion of an overhead crane.

Learning goals

After studying this chapter, you should be able to:

1.  Explain why continuous-time optimal control requires transcription before it can be sent to an NLP solver.
    
2.  Represent one polynomial either by basis coefficients or by values at distinct nodes.
    
3.  Distinguish exact polynomial interpolation from least-squares regression.
    
4.  Construct differentiation and quadrature operators from Lagrange cardinal functions.
    
5.  Assemble the complete Euler, trapezoidal, and Hermite--Simpson optimization problems.
    
6.  Choose state and control representations separately and identify their decision variables.
    
7.  Generate collocation coefficients from nodes and use them to assemble a sparse NLP.
    

Prerequisites

The chapter uses ordinary differential equations, definite integrals, and the basic form of a nonlinear program with equality and inequality constraints. [Finite-Horizon Optimal Control Problems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md) introduces that optimization problem, and [Numerical Trajectory Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md) develops shooting and simultaneous formulations. [Solving Initial Value Problems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/30-appendix-ivps.md) reviews the sequential integrators used inside shooting.

Companion demo

The demo [Direct Collocation for a Pendulum Swing-Up](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md) applies the construction of this chapter to a nonlinear control problem, one step at a time. It computes the collocation coefficients by hand and in code, assembles and solves the nonlinear program, and explains each line of the Python code in the notation of this chapter. It can be read after [Algorithm 1](#alg-collocation-from-nodes) or alongside the rest of the chapter, and it runs in Colab.

<a id="a-one-interval-example"></a>

## A One-Interval Example

How can a constraint on four endpoint values ensure that the chosen control produces the required displacement?

Consider a point that must move from $x(0)=0$ to $x(1)=1$. Its velocity is the control, so

<a id="NYPIOZkZKL"></a>

$$
\dot x(t)=u(t),
$$

[(1)](#NYPIOZkZKL "Link to this Equation")

and the objective penalizes squared control effort,

<a id="fijYTDpBno"></a>

$$
\underset{x(\cdot),u(\cdot)}{\operatorname{minimize}}
\quad \int_0^1 u(t)^2\,dt.
$$

[(2)](#fijYTDpBno "Link to this Equation")

Both $x$ and $u$ are unknown functions. As a first finite approximation, retain only their endpoint values $x_0,x_1,u_0,u_1$ and let the control vary linearly between $u_0$ and $u_1$. Integrating $\dot x=u$ means that the change in state equals the area under this control. The shaded region below is a unit-width trapezoid. Its area is the average of its two endpoint heights, $u_0$ and $u_1$, multiplied by the width.

<a id="rcPLPua3uX"></a>

<a id="fig-linear-control-trapezoid"></a>

<a id="fig-linear-control-trapezoid-code"></a>

```python
from pathlib import Path
import sys

from IPython.display import HTML, display

code_dir = Path.cwd() / "code"
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))

from collocation_widgets import render_linear_control_area

control_area = render_linear_control_area()
display(HTML(control_area))
```

[Figure 1:](#fig-linear-control-trapezoid "Link to this figure")Drag the endpoint controls or play the accumulation from left to right. The shaded rectangle and triangle sum to the state change implied by $\dot x=u$. Setting the interval width to $h=1$ gives the state-change relation $x_1-x_0=(u_0+u_1)/2$.

<a id="fig-linear-control-trapezoid-outputs"></a>

Loading...

<a id="fig-linear-control-trapezoid-fallback"></a>

<a id="MPR9xSs4tq"></a>
![A linear control between two endpoint values forms a trapezoid whose rectangle and triangle areas sum to the state change.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/88e46b5dd8-linear-control-area-496e048af626d6485c06869c8dea696d.svg)

[Figure 2:](#fig-linear-control-trapezoid-fallback "Link to this figure")A linear control connects $u_0$ and $u_1$ across an interval of width $h$. The rectangle $hu_0$ and triangle $h(u_1-u_0)/2$ sum to $h(u_0+u_1)/2$. Because $\dot x=u$, this area equals $x_1-x_0$.

The optimizer must choose endpoint states and controls that agree with this area calculation. Otherwise, it could choose $x_0=0$ and $x_1=1$ while setting both controls to zero: the endpoint conditions would hold, but zero velocity could not produce the displacement. To exclude such choices, the stored state change $x_1-x_0$ must equal the change $(u_0+u_1)/2$ predicted by integrating the control. Moving both quantities to the left gives the constraint

<a id="vJ7Q9OVg6W"></a>

$$
x_1-x_0-\frac{1}{2}(u_0+u_1)=0.
$$

[(3)](#vJ7Q9OVg6W "Link to this Equation")

The left-hand side measures the mismatch between these two changes and is called the **defect**. Requiring that mismatch to vanish gives a **defect constraint**, which enforces the dynamics within the chosen approximation. The equation is **algebraic** because it relates the four numbers $x_0,x_1,u_0,u_1$ through arithmetic operations; there is no unknown function to differentiate or integrate when evaluating it. An optimizer can therefore check the constraint directly for each candidate set of endpoint values.

Approximating the running-cost integral by the average of its endpoint values gives the finite nonlinear program

<a id="kRmFhvgJan"></a>

$$
\begin{aligned}
\underset{x_0,x_1,u_0,u_1}{\operatorname{minimize}}
\quad&\frac{1}{2}(u_0^2+u_1^2)\\
\text{subject to}\quad&x_0=0,\qquad x_1=1,\\
&x_1-x_0-\frac{1}{2}(u_0+u_1)=0.
\end{aligned}
$$

[(4)](#kRmFhvgJan "Link to this Equation")

The defect integrates the linear control exactly. The objective uses another approximation: $u(t)^2$ is generally quadratic, so averaging its endpoint values need not give its exact integral. Both calculations become exact for a constant control.

The boundary conditions reduce the defect to $u_0+u_1=2$. Substituting $u_1=2-u_0$ into the objective gives

<a id="N6xK5yhlh4"></a>

$$
\frac12\left(u_0^2+(2-u_0)^2\right)
=(u_0-1)^2+1.
$$

[(5)](#N6xK5yhlh4 "Link to this Equation")

The squared term is minimized at $u_0=1$, which also gives $u_1=1$. The resulting interpolation is the exact solution $u(t)=1$ and $x(t)=t$.

This example already contains the main ingredients of direct collocation. The function values became optimization variables, integration became a weighted sum, and the differential equation became an equality constraint. The remaining sections construct these operations systematically for nonlinear vector dynamics and higher-degree polynomials.

<a id="from-a-continuous-problem-to-a-finite-nlp"></a>

## From a Continuous Problem to a Finite NLP

Which quantities and constraints must a transcription retain from the continuous-time control problem?

We retain the earlier notation $\mathbf x\in\mathbb R^n$ for the state, $\mathbf u\in\mathbb R^m$ for the control, and $c$ for cost. Here $t$ is continuous physical time, while $k$ will index mesh intervals. The running cost $c(\mathbf x,\mathbf u,t)$ is a cost per unit time; integrating it over an interval produces the counterpart of the discrete stage cost $c_k$. The terminal cost is written $c_f$ because the final physical time is $t_f$. Scalar examples omit boldface.

With inequalities $\mathbf g\leq\mathbf0$ and equalities $\mathbf h=\mathbf0$, the continuous-time Bolza problem is

<a id="tLDo4MVaID"></a>

$$
\begin{aligned}
\underset{\mathbf{x}(\cdot),\mathbf{u}(\cdot),t_f}{\operatorname{minimize}}
\quad&
c_f(\mathbf{x}(t_f),t_f)
+\int_{t_0}^{t_f} c(\mathbf{x}(t),\mathbf{u}(t),t)\,dt\\
\text{subject to}\quad&
\dot{\mathbf{x}}(t)=\mathbf{f}(\mathbf{x}(t),\mathbf{u}(t),t),\\
&\mathbf{h}(\mathbf{x}(t_0),\mathbf{x}(t_f),t_f)=\mathbf0,\\
&\mathbf{g}(\mathbf{x}(t),\mathbf{u}(t),t)\leq\mathbf0.
\end{aligned}
$$

[(6)](#tLDo4MVaID "Link to this Equation")

The equality $\mathbf h=\mathbf0$ imposes endpoint conditions, while $\mathbf g\leq\mathbf0$ imposes constraints along the path, such as actuator limits or a bound on the state. A fixed final time is supplied as data and omitted from the decision variables. Setting $c=0$ gives the Mayer special case, while setting $c_f=0$ gives the Lagrange special case. All three forms use the same transcription.

Two transcription strategies differ in which values become decision variables and in how they impose the differential equation:

| Strategy | Finite decision variables | Treatment of the ODE |
| --- | --- | --- |
| Shooting | Control parameters and, in multiple shooting, selected boundary states | A time integrator advances the state sequentially inside each shooting interval |
| Direct collocation | State and control values at selected nodes | Algebraic defect equations enforce the ODE simultaneously |

Shooting and collocation are therefore distinct transcription strategies. A collocation method may reproduce a familiar integration formula, but it exposes the state values to the NLP rather than hiding every state update inside a simulation. The term **direct** indicates that the continuous problem is converted directly into an optimization problem, without first deriving necessary conditions such as the Pontryagin equations.

To apply a local approximation repeatedly over the horizon, divide time into intervals with endpoints

<a id="lbMgKaAyMm"></a>

$$
t_0<t_1<\cdots<t_N=t_f,\qquad h_k=t_{k+1}-t_k.
$$

[(7)](#lbMgKaAyMm "Link to this Equation")

This sequence is a **mesh**, with $k=0,\ldots,N-1$ indexing its intervals. We write $\mathbf x_k$ and $\mathbf u_k$ for values at mesh time $t_k$, as in the earlier discrete-time chapters; the subscript is an index, not a physical time. On each interval, the normalized coordinate is $\tau=(t-t_k)/h_k$, or equivalently

<a id="adDjIguGHa"></a>

$$
t=t_k+h_k\tau,\qquad 0\leq\tau\leq1.
$$

[(8)](#adDjIguGHa "Link to this Equation")

Every physical interval is thereby mapped to the same reference interval $[0,1]$. Differentiation and integration formulas can be constructed once on this reference interval; the length $h_k$ then supplies the physical-time scaling. If the final time is also optimized, the interval lengths become variables or fixed fractions of the variable horizon; the reference-interval operators remain unchanged.

<a id="polynomial-pieces-on-a-time-mesh"></a>

### Polynomial pieces on a time mesh

A single polynomial can represent a trajectory over the entire horizon; the opening example’s solution $x(t)=t$ already does so. Why introduce several pieces? Consider the same scalar dynamics $\dot x=u$, starting from $x(0)=0$, but now moving right at unit speed until $t=1/2$ and then left at unit speed:

<a id="gKxMabXeN6"></a>

$$
u(t)=\begin{cases}
1,&0\leq t<\tfrac12,\\
-1,&\tfrac12<t\leq1,
\end{cases}
\qquad
x(t)=\begin{cases}
t,&0\leq t\leq\tfrac12,\\
1-t,&\tfrac12\leq t\leq1.
\end{cases}
$$

[(9)](#gKxMabXeN6 "Link to this Equation")

The state is continuous, but its slope changes abruptly at the switching time. Two line segments represent it exactly. A single polynomial has a continuous derivative, so it cannot reproduce this corner exactly, although it can approximate the trajectory. The ODE here holds on either side of the switch; the control’s value at that one instant does not affect its integral.

The comparison below uses the quadratic $q(t)=2t(1-t)$, which passes through the same states at $t=0,1/2,1$. Matching these three values does not reproduce the motion between them: the quadratic has a continuously varying slope, while the prescribed velocity switches from +1 to \-1.

<a id="fig-switching-trajectory"></a>

<a id="CwsIAv9nek"></a>
![The triangular state trajectory consists of two straight segments meeting at time one half. A dashed quadratic passes through the same three points but curves above the segments. Below, the exact slope jumps from plus one to minus one, whereas the quadratic's slope decreases continuously from plus two to minus two.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/64988ac4f2-switching-trajectory-89dea3858e8b42226486dbc84de44406.svg)

[Figure 3:](#fig-switching-trajectory "Link to this figure")Two linear pieces represent the prescribed motion exactly. The dashed orange quadratic $q(t)=2t(1-t)$ matches the three black sample points but differs between them. The lower panel compares their physical-time derivatives. Open circles indicate the two one-sided slopes at the switch, where the exact state has no derivative. Higher-degree global polynomials can improve the approximation, but every single polynomial has a continuous derivative.

Even when the trajectory is smooth, some portions may change much faster than others. Separate polynomial pieces let us shorten the mesh intervals near a rapid change while retaining longer intervals elsewhere. Increasing the degree of one global polynomial adds flexibility across the whole horizon. The local representation also gives the optimizer useful structure: each interval’s dynamics constraints involve only values on that interval and neighboring endpoint states. A global polynomial couples values across the horizon through its differentiation matrix.

For a trajectory that is smooth throughout the horizon, a single polynomial of sufficiently high degree can be an efficient choice. Piecewise polynomials give us local control over resolution, allow changes in slope at joins, and keep the constraint derivatives sparse. They require us to connect adjacent pieces explicitly so that the state remains continuous.

We therefore represent the trajectory by a separate polynomial on each mesh interval $[t_k,t_{k+1}]$. The full approximation $\mathbf{x}_h$ is **piecewise polynomial**. To construct the piece on interval $k$, use its local coordinate $\tau=(t-t_k)/h_k$, where $h_k=t_{k+1}-t_k$, and write

<a id="hnJhQQvEmX"></a>

$$
\mathbf{p}_k(\tau):=\mathbf{x}_h(t_k+h_k\tau),\qquad 0\le\tau\le1.
$$

[(10)](#hnJhQQvEmX "Link to this Equation")

Thus $\mathbf{p}_k(0)$ is the state at the start of this interval and $\mathbf{p}_k(1)$ is the state at its end. On the next interval, the local coordinate starts again at zero, and a different polynomial $\mathbf{p}_{k+1}$ describes the trajectory. The reference interval and its integration weights can be reused even when the physical intervals have different lengths.

<a id="fig-local-time-pieces"></a>

<a id="MD12iISFF1"></a>
![A continuous scalar trajectory has three polynomial pieces on the physical intervals zero to one, one to three, and three to four. Beneath it, the same pieces each occupy a local time axis from zero to one. Adjacent pieces meet at the shared endpoint states x1 and x2.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/2c9cd20e8f-local-time-pieces-e55ebfdc0a175ca73628f177d3116bde.svg)

[Figure 4:](#fig-local-time-pieces "Link to this figure")A scalar example of the piecewise representation. The upper panel joins three quadratic pieces on physical intervals of lengths 1, 2, and 1. The lower panels show those same pieces in their own coordinates $0\leq\tau\leq1$, preserving their colors and line styles. The middle piece uses $t=1+2\tau$, so two units of physical time occupy one unit of local time. Black dots mark endpoint states; matching the right value of one piece to the left value of the next keeps the trajectory continuous. The slopes need not match across joins.

<a id="one-polynomial-two-coordinate-systems"></a>

## One Polynomial, Two Coordinate Systems

Should a polynomial trajectory be stored by its coefficients or by its values at selected points, and how are the two descriptions related?

The opening example stored a linear control by its two endpoint values. Each piece of a collocation trajectory needs a similar reconstruction: given the values the optimizer stores, what curve do they define between nodes? Start with a scalar polynomial $p$ on the reference interval $[0,1]$. The construction applies to each state and control component.

Suppose $p(0)=y_0$ and $p(1)=y_1$, and restrict $p$ to degree at most one. A line has the form $p(\tau)=a_0+a_1\tau$. The first endpoint condition gives $a_0=y_0$, and the second gives $a_0+a_1=y_1$, so $a_1=y_1-y_0$. Substitution and regrouping give

<a id="uLlB3dZ2xN"></a>

$$
p(\tau)=y_0(1-\tau)+y_1\tau.
$$

[(11)](#uLlB3dZ2xN "Link to this Equation")

The weights $1-\tau$ and $\tau$ enforce the two endpoint conditions: at 0, the formula returns $y_0$, and at 1, it returns $y_1$. Between the endpoints, the weights vary continuously; at $\tau=1/4$, for example, the value is $3y_0/4+y_1/4$. This is the unique line through the two prescribed values. Without the degree restriction, other curves could pass through them. Even for this same line, $y_0+(y_1-y_0)\tau$ is an equivalent representation. The weighted form is convenient because each stored value has its own function that determines its contribution throughout the interval. The functions $1-\tau$ and $\tau$ form a basis for linear polynomials, just as 1 and $\tau$ do. In the first basis, the coefficients are the endpoint values $y_0,y_1$; in the monomial basis, they are $a_0=y_0$ and $a_1=y_1-y_0$.

Higher-degree pieces use the same idea with more stored values. To specify which curves those values may define, restrict the degree to at most $r$. The resulting polynomial space is

<a id="kKF0Khihwl"></a>

$$
\mathcal P_r=\{p:\deg p\leq r\}.
$$

[(12)](#kKF0Khihwl "Link to this Equation")

This space, denoted by $\mathcal P_r$, has dimension $r+1$. Choosing a basis $\{\phi_0,\ldots,\phi_r\}$ gives coefficient coordinates

<a id="JtgtA3IDZk"></a>

$$
p(\tau)=\sum_{j=0}^{r}a_j\phi_j(\tau).
$$

[(13)](#JtgtA3IDZk "Link to this Equation")

The monomial choice $\phi_j(\tau)=\tau^j$ gives the familiar expression $a_0+a_1\tau+\cdots+a_r\tau^r$. A different basis changes the coefficients used to describe the same function.

The same polynomial can instead be identified by its values. Choose $r+1$ distinct points

<a id="zU2NiVaBwZ"></a>

$$
\sigma_0,\ldots,\sigma_r\in[0,1],
$$

[(14)](#zU2NiVaBwZ "Link to this Equation")

and record

<a id="ktUXVG1x2l"></a>

$$
y_i=p(\sigma_i).
$$

[(15)](#ktUXVG1x2l "Link to this Equation")

These points are called **support nodes**, or **interpolation nodes**: once the degree is restricted to at most $r$, the $r+1$ stored values determine the whole polynomial. Storing values is useful for trajectory optimization because a bound on the state at a node then becomes a bound on a decision variable. To evaluate the dynamics between nodes, however, we need a formula that reconstructs the polynomial from those values.

With more nodes, the same construction needs one weight function $\ell_j$ per stored value $y_j$. To recover $y_j$ at its own node without altering the values at the other nodes, $\ell_j$ must equal one at $\sigma_j$ and zero at every other support node. A polynomial with those zeros contains the factors $(\tau-\sigma_m)$ for all $m\ne j$. Dividing their product by its value at $\sigma_j$ makes the value there equal to one. This constructs the **Lagrange basis function**, also called a **cardinal function**,

<a id="BUSxQm52du"></a>

$$
\ell_j(\tau)
=\prod_{\substack{m=0\\m\neq j}}^r
\frac{\tau-\sigma_m}{\sigma_j-\sigma_m}.
$$

[(16)](#BUSxQm52du "Link to this Equation")

At a support node $\sigma_i$, one factor in the numerator is zero unless $i=j$. When $i=j$, every numerator equals its corresponding denominator. Consequently,

<a id="VHwkEuEh8a"></a>

$$
\ell_j(\sigma_i)=\delta_{ij},
$$

[(17)](#VHwkEuEh8a "Link to this Equation")

where the Kronecker delta $\delta_{ij}$ is shorthand for one when $i=j$ and zero otherwise. This identity specifies the values at the nodes only. At any other $\tau$, the product formula gives a smoothly varying polynomial weight, which can be negative or exceed one for higher degrees. Thus, unlike a line between two endpoint values, a higher-degree interpolant can take values outside the range of its stored values. The cardinal functions reconstruct the polynomial throughout the interval by

<a id="wyZHvvBE5k"></a>

$$
\boxed{
p(\tau)=\sum_{j=0}^{r}y_j\ell_j(\tau),
\qquad y_j=p(\sigma_j).
}
$$

[(18)](#wyZHvvBE5k "Link to this Equation")

At a node $\sigma_i$, all terms except $y_i\ell_i(\sigma_i)=y_i$ vanish. Between nodes, the weighted sum supplies the intervening values. This expression is the **Lagrange form** of $p$. When the values $y_j$ are prescribed and $p$ is constructed to pass through them, $p$ is called the **Lagrange interpolating polynomial**. Each $\ell_j$ is one basis function; $p$ is their weighted sum. Changing one stored value $y_j$ by $\Delta y_j$ changes the curve by $\Delta y_j\ell_j(\tau)$, so the same function describes how that variable affects the entire polynomial.

The uniqueness of this reconstruction follows from a basic root-counting argument. If two polynomials in $\mathcal P_r$ have the same $r+1$ nodal values, their difference has $r+1$ distinct roots. A nonzero polynomial of degree at most $r$ cannot have that many roots, so the two polynomials must be identical.

Consequently, every polynomial in $\mathcal P_r$ has a unique expansion in $\ell_0,\ldots,\ell_r$. These functions form the **Lagrange basis** associated with the chosen support nodes. Its coefficients are exactly the nodal values $y_j=p(\sigma_j)$. Storing a polynomial by its values is therefore also a basis representation, with the basis chosen so that its coefficients have a direct interpretation as function values.

For a scalar polynomial, collect the coefficients and values into column vectors $\mathbf a=(a_0,\ldots,a_r)^\top$ and $\mathbf y=(y_0,\ldots,y_r)^\top$. The coefficient and nodal descriptions are related by the evaluation matrix

<a id="FfYjA1Rzpy"></a>

$$
V_{ij}=\phi_j(\sigma_i),
\qquad \mathbf{y}=V\mathbf{a}.
$$

[(19)](#FfYjA1Rzpy "Link to this Equation")

Distinct support nodes make $V$ invertible by the same root-counting argument. Thus $\mathbf{a}$ and $\mathbf{y}$ are two coordinate vectors for one polynomial, rather than two different approximations.

For example, take $p(\tau)=1+2\tau-\tau^2$ and the nodes $0,\tfrac12,1$. In monomial coordinates,

<a id="PriZY7aqXk"></a>

$$
\mathbf{a}=
\begin{bmatrix}1\\2\\-1\end{bmatrix},
\qquad
V=
\begin{bmatrix}
1&0&0\\
1&\tfrac12&\tfrac14\\
1&1&1
\end{bmatrix},
$$

[(20)](#PriZY7aqXk "Link to this Equation")

whereas the nodal coordinates are

<a id="JjBE9s0YdE"></a>

$$
\mathbf{y}=V\mathbf{a}=
\begin{bmatrix}1\\\tfrac74\\2\end{bmatrix}.
$$

[(21)](#JjBE9s0YdE "Link to this Equation")

In the Lagrange basis for these three nodes, the same quadratic is

<a id="n3w3VwmxNt"></a>

$$
p(\tau)=\ell_0(\tau)+\tfrac74\ell_1(\tau)+2\ell_2(\tau).
$$

[(22)](#n3w3VwmxNt "Link to this Equation")

Here $\ell_0,\ell_1,\ell_2$ select the nodes $0,\tfrac12,1$, respectively. Both coefficient vectors describe the same quadratic. The transcription used here chooses coordinates like $\mathbf y$ for the state and control: values that can be inserted directly into the dynamics, cost, and bounds. Monomial coefficients remain useful for deriving formulas that act on those values.

<a id="polynomial-space-basis-and-nodes-are-different-choices"></a>

### Polynomial spaces, bases, and nodes

The construction separates three decisions that are easy to conflate:

-   The **polynomial space** $\mathcal P_r$ specifies which functions are available.
    
-   The **basis** specifies coordinates for a member of that space. Monomial and Lagrange bases span the same $\mathcal P_r$.
    
-   The **nodes** specify where values, residuals, or integrals are evaluated.
    

Changing the basis does not change the exact polynomial space, although it can change numerical conditioning. Changing the nodes changes the interpolation and the operators built from it. The node families introduced later can still use Lagrange nodal coordinates in the NLP.

<a id="polynomial-interpolation-and-least-squares-regression"></a>

## Polynomial Interpolation and Least-Squares Regression

When should a polynomial pass through every supplied value, and when should it approximate those values with a smaller number of coefficients?

Interpolation and polynomial regression impose different requirements on the same data. Six values at six distinct nodes determine one polynomial of degree at most five that passes through every point. If the values are noisy observations and the aim is to estimate a quadratic trend, a quadratic will generally be unable to pass through all six. Least-squares regression then chooses its three coefficients to minimize the sum of squared discrepancies. The figure below applies both choices to the same six points. Write $V$ for the basis evaluation matrix, as in $\mathbf y=V\mathbf a$. It has six rows in both cases, but six columns for the degree-five interpolant and three for the quadratic fit.

|  | Polynomial interpolation | Least-squares regression |
| --- | --- | --- |
| Input | Exact value conditions | Usually noisy or overdetermined observations |
| Algebraic problem | Satisfy $V\mathbf{a}=\mathbf{y}$ exactly | Minimize $\lVert V\mathbf{a}-\mathbf{y}\rVert_2^2$ |
| Residual | Zero when the value conditions uniquely determine a polynomial | Generally nonzero |
| Typical purpose | Represent a function from exact nodal data | Estimate a trend or conditional mean |

If $V$ is square and invertible, minimizing the squared residual also returns the exact interpolant. The two procedures coincide in that case because the chosen polynomial space can satisfy every value condition.

<a id="H0wb0xyL3r"></a>

<a id="fig-interpolation-versus-regression"></a>

<a id="fig-interpolation-versus-regression-code"></a>

```python
import numpy as np
import matplotlib.pyplot as plt

observation_nodes = np.linspace(0.0, 1.0, 6)
observation_values = (
    0.25
    + 0.95 * observation_nodes
    - 0.25 * observation_nodes**2
    + np.array([0.00, 0.10, -0.07, 0.08, -0.09, 0.02])
)
plot_nodes = np.linspace(0.0, 1.0, 401)

def evaluate_lagrange(nodes, values, points):
    result = np.zeros_like(points)
    for j, node in enumerate(nodes):
        cardinal = np.ones_like(points)
        for m, other_node in enumerate(nodes):
            if m != j:
                cardinal *= (points - other_node) / (node - other_node)
        result += values[j] * cardinal
    return result

interpolated_values = evaluate_lagrange(
    observation_nodes, observation_values, plot_nodes
)
regression_matrix = np.vander(observation_nodes, 3, increasing=True)
regression_coefficients, *_ = np.linalg.lstsq(
    regression_matrix, observation_values, rcond=None
)
regression_curve = np.vander(plot_nodes, 3, increasing=True) @ regression_coefficients
regression_at_nodes = regression_matrix @ regression_coefficients

with plt.rc_context({
    "font.family": "serif",
    "font.serif": ["STIX Two Text", "Times New Roman", "DejaVu Serif"],
    "mathtext.fontset": "stix",
    "font.size": 9,
    "axes.labelsize": 9,
    "xtick.labelsize": 8,
    "ytick.labelsize": 8,
}):
    figure, axis = plt.subplots(figsize=(5.5, 2.8), constrained_layout=True)
    blue = "#0072B2"
    orange = "#D55E00"
    gray = "#4D4D4D"

    axis.plot(plot_nodes, interpolated_values, color=blue, linewidth=1.8,
              label="Degree-five interpolation")
    axis.plot(plot_nodes, regression_curve, color=orange, linewidth=1.8,
              linestyle="--", label="Quadratic least squares")
    axis.vlines(observation_nodes, regression_at_nodes, observation_values,
                color="#777777", linewidth=1.2, zorder=2)
    axis.scatter(observation_nodes, observation_values, color=gray,
                 edgecolor="white", linewidth=0.6, s=30, zorder=3,
                 label="Same six points")
    axis.set_xlabel(r"$\tau$")
    axis.set_ylabel("value")
    axis.spines[["top", "right"]].set_visible(False)
    axis.grid(alpha=0.18, linewidth=0.6)
    axis.set_xlim(-0.025, 1.025)
    axis.set_ylim(0.15, 1.25)
    axis.legend(loc="upper left", frameon=False, fontsize=8)

display(figure)
plt.close(figure)
```

[Figure 5:](#fig-interpolation-versus-regression "Link to this figure")Two polynomials fitted to the same six points (black dots). The solid blue degree-five interpolant passes through every point. The dashed orange quadratic regression minimizes the sum of squared residuals, shown as gray vertical segments. The polynomial degrees differ because a quadratic generally cannot satisfy all six value conditions exactly.

<a id="fig-interpolation-versus-regression-outputs"></a>

![<Figure size 550x280 with 1 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/dbf0f7fbbd-98f2386e51f175de3a4ea7859176ca95.png)

In a nodal state representation of direct collocation, the stored states are unknown decision variables rather than observations. Each candidate vector of support values defines one interpolating polynomial exactly. The optimizer selects a candidate whose ODE residual vanishes at the collocation nodes. A numerical solver may temporarily work with a scalar measure of constraint violation, but the collocation conditions remain equality constraints rather than a statistical regression loss.

<a id="fixed-operators-from-nodal-values"></a>

## Fixed Operators from Nodal Values

How can the stored values give us both the slopes and the integral of every candidate polynomial?

The nodal representation also turns differentiation and integration into matrix and vector products. Once the nodes are chosen, the required arrays can be computed once and reused for every candidate trajectory. The optimizer can then evaluate slopes and integrals as it changes the nodal values, without recomputing those arrays. Each cardinal function is a known polynomial, so its derivative and antiderivative can be computed in closed form by changing its coefficients. Constructing the arrays therefore does not require finite-difference approximations or numerical quadrature of the basis functions. The resulting operators are exact for the represented polynomial, apart from floating-point error in their construction and application.

This is possible because the cardinal functions stay fixed while only their coefficients $y_j$ change. In the representation

<a id="J8rsJaIUmB"></a>

$$
p(\tau)=\sum_{j=0}^r y_j\ell_j(\tau),
$$

[(23)](#J8rsJaIUmB "Link to this Equation")

each $y_j$ is constant with respect to $\tau$, so differentiation acts only on $\ell_j$. To obtain the slopes needed by the ODE, differentiate and then evaluate at a node $\sigma_i$:

<a id="Y1wNwJeIKL"></a>

$$
p'(\sigma_i)=\sum_{j=0}^r
\underbrace{\ell_j'(\sigma_i)}_{D_{ij}}y_j,
$$

[(24)](#Y1wNwJeIKL "Link to this Equation")

while integration over the reference interval gives

<a id="nj3iGKg0V4"></a>

$$
\int_0^1p(\tau)\,d\tau
=\sum_{j=0}^r
\underbrace{\left(\int_0^1\ell_j(\tau)\,d\tau\right)}_{w_j}y_j.
$$

[(25)](#nj3iGKg0V4 "Link to this Equation")

The resulting differentiation matrix $D$ and integration weights $w$ depend only on the chosen nodes. Their entries record the derivatives and areas of the fixed cardinal functions. Multiplication by the current nodal values combines these contributions into the derivative or integral of the current polynomial. This is how the transcription supplies the calculus needed by the dynamics and cost through arithmetic on the decision variables.

For a concrete construction, suppose a quadratic is stored by its values $y_0,y_m,y_1$ at $0,\tfrac12,1$, where $m$ denotes the midpoint. The desired outputs are its slope at each of these nodes and its integral over $[0,1]$. To build the arrays that return those outputs for any choice of the three values, first construct the three cardinal functions multiplying them:

<a id="uweCU4ir0C"></a>

$$
\begin{aligned}
\ell_0(\tau)
&=\frac{(\tau-\frac12)(\tau-1)}{(0-\frac12)(0-1)}
=2\tau^2-3\tau+1,\\
\ell_m(\tau)
&=\frac{\tau(\tau-1)}{(\frac12-0)(\frac12-1)}
=4\tau(1-\tau),\\
\ell_1(\tau)
&=\frac{\tau(\tau-\frac12)}{(1-0)(1-\frac12)}
=2\tau^2-\tau.
\end{aligned}
$$

[(26)](#uweCU4ir0C "Link to this Equation")

These are the three contributions in $p(\tau)=y_0\ell_0(\tau)+y_m\ell_m(\tau)+y_1\ell_1(\tau)$. Their derivatives are $4\tau-3$, $4-8\tau$, and $4\tau-1$. At the left endpoint they give the weights $-3,4,-1$, so $p'(0)=-3y_0+4y_m-y_1$. Evaluation at the midpoint and right endpoint supplies the other two rows of the differentiation matrix:

<a id="b6A82nGiWr"></a>

$$
\begin{bmatrix}
p'(0)\\
p'(\tfrac12)\\
p'(1)
\end{bmatrix}
=
\underbrace{
\begin{bmatrix}
-3&4&-1\\
-1&0&1\\
1&-4&3
\end{bmatrix}}_{D}
\begin{bmatrix}
y_0\\y_m\\y_1
\end{bmatrix}.
$$

[(27)](#b6A82nGiWr "Link to this Equation")

Thus a matrix-vector product turns the three stored values into the three nodal derivatives. Integrating the same cardinal functions gives

<a id="E7AX2oAha7"></a>

$$
\int_0^1 p(\tau)\,d\tau
=
\underbrace{
\begin{bmatrix}
\tfrac16&\tfrac46&\tfrac16
\end{bmatrix}}_{w^\mathsf T}
\begin{bmatrix}
y_0\\y_m\\y_1
\end{bmatrix}.
$$

[(28)](#E7AX2oAha7 "Link to this Equation")

The row $w^\mathsf T$ turns the same three values into the exact integral of their quadratic interpolant. The matrix $D$ differentiates every polynomial in $\mathcal P_2$ exactly, and $w$ integrates every polynomial in that space exactly. “Fixed operator” means that these arrays remain constant while the NLP changes the nodal values.

For the earlier polynomial $p(\tau)=1+2\tau-\tau^2$, the stored values are $\mathbf y=(1,\tfrac74,2)^\top$. Applying the arrays gives

<a id="Z9a5WWPCcd"></a>

$$
D\mathbf y=\begin{bmatrix}2\\1\\0\end{bmatrix},
\qquad
w^\top\mathbf y
=\frac16+\frac46\frac74+\frac16\,2=\frac53.
$$

[(29)](#Z9a5WWPCcd "Link to this Equation")

The first result agrees with $p'(\tau)=2-2\tau$ at the three nodes; the second agrees with the integral of $1+2\tau-\tau^2$ over $[0,1]$. The figure collects the coordinate change and these two operations for that same polynomial.

<a id="fig-polynomial-coordinate-operators"></a>

<a id="NaNRwKGzfm"></a>
![The quadratic p of tau equals one plus two tau minus tau squared is represented by its monomial coefficient vector and by its values at support nodes zero, one half, and one. Fixed differentiation and quadrature operators act on the nodal vector.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/1804839975-polynomial-coordinat-f389dab0e2c32fb109322604167a0464.svg)

[Figure 6:](#fig-polynomial-coordinate-operators "Link to this figure")One quadratic, two coordinate systems. Evaluating the monomial coefficients $\mathbf{a}$ at the support nodes gives $\mathbf{y}=V\mathbf{a}$. Direct collocation stores the nodal vector $\mathbf{y}$; the fixed operators $D$ and $w$ then return its nodal derivatives and exact integral without adding optimization variables.

A transcription may use nodes for three distinct purposes:

| Node role | What it does |
| --- | --- |
| Support node | Supplies a value used to define a particular polynomial by interpolation |
| Collocation node | Specifies where the reconstructed state must satisfy the ODE |
| Quadrature node | Supplies a point used to approximate an integral |

A method often reuses one set of points for two or three roles. Support nodes belong to a particular polynomial: the state, control, and slope polynomials need not use the same interpolation nodes. For example, a state polynomial can be supported at one set of nodes and differentiated at different collocation nodes. In the integration construction below, the collocation nodes also serve as support nodes for the slope polynomial. Both integration and differentiation forms have collocation nodes. Their algebraic residuals differ: one matches state values after integrating slopes, while the other matches slopes after interpolating state values.

<a id="from-nodal-slopes-to-collocation-constraints"></a>

## From Nodal Slopes to Collocation Constraints

How do those fixed maps convert differential equations into algebraic constraints at the chosen collocation nodes?

The preceding operators apply to any polynomial. A trajectory must also satisfy the dynamics. On each interval, the construction will interpolate the slopes supplied by the ODE and integrate them from the stored left state. Constraints will then require the stored states to agree with the resulting polynomial.

Interval $k$ extends from physical time $t_k$ to $t_{k+1}$ and contains one polynomial piece. Its local time coordinate runs from $\tau=0$ at the left endpoint to $\tau=1$ at the right endpoint. Choose $s$ distinct collocation nodes $\tau_1,\ldots,\tau_s$ on $[0,1]$. A node $\tau_j$ specifies one time within this interval, $t_k+h_k\tau_j$; for example, $\tau_j=1/2$ specifies its midpoint. The state and control values at that time are $\mathbf{x}_{k,j}$ and $\mathbf{u}_{k,j}$.

This evaluation point, together with its state and control values, is called a **stage**. A stage is associated with a single time, so it has no separate beginning or end. The index $k$ identifies the interval and $j$ identifies a stage in that interval. Depending on the method, stages may be interior points or may coincide with an endpoint: $\tau_j=0$ places a stage at the start and $\tau_j=1$ places one at the end. At each stage, the differential equation prescribes the physical-time slope

<a id="YASMnEgJEP"></a>

$$
\mathbf{f}_{k,j}
=\mathbf{f}(\mathbf{x}_{k,j},\mathbf{u}_{k,j},t_k+h_k\tau_j)
$$

[(30)](#YASMnEgJEP "Link to this Equation")

for $j=1,\ldots,s$. The figure below shows one such evaluation for the scalar dynamics $\dot x=u$. The state and control are read at the same physical time; the ODE then gives the slope that the state polynomial must match there.

<a id="fig-collocation-stage"></a>

<a id="qXWy541Oy9"></a>
![State and control curves on the physical interval from time two to four. An orange vertical line at time three marks the collocation node tau j equals one half. The stage state is two and the stage control is three halves. A dashed tangent at the state point has physical-time slope three halves, as required by x dot equals u.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6aa509a778-collocation-stage-6d0eb8619f5cff77ca9811e98701ab06.svg)

[Figure 7:](#fig-collocation-stage "Link to this figure")A stage combines a time, a state value, and a control value. Here $t_k=2$, $h_k=2$, and $\tau_j=1/2$, so the stage occurs at physical time 3. The orange dots mark $x_{k,j}=2$ and $u_{k,j}=3/2$. For $\dot x=u$, the prescribed slope is $f_{k,j}=3/2$, drawn as a dashed tangent in the upper panel. The curves are $u_h(t)=1/2+(t-2)$ and $x_h(t)=1+(t-2)/2+(t-2)^2/2$. Both panels use physical time; in local coordinates the derivative is $p_k'(\tau_j)=h_kf_{k,j}=3$.

As before, $\mathbf p_k(\tau)=\mathbf x_h(t_k+h_k\tau)$ denotes the state piece in normalized time. Here $\ell_j$ is the Lagrange cardinal function for the slope nodes $\tau_1,\ldots,\tau_s$; the $s$ slope values determine a polynomial of degree at most $s-1$. Interpolating them gives the physical-time derivative on this one interval:

<a id="addxSiUYW5"></a>

$$
\dot{\mathbf{x}}_h(t_k+h_k\tau)
=\sum_{j=1}^{s}\mathbf{f}_{k,j}\ell_j(\tau).
$$

[(31)](#addxSiUYW5 "Link to this Equation")

This polynomial agrees with each sampled slope $\mathbf{f}_{k,j}$ at its collocation node. Each sample was evaluated at a stored stage state $\mathbf x_{k,j}$; the state curve recovered by integration need not yet pass through those stored states. The stage equations below will enforce that agreement. To recover state values from these slopes, we need to reverse differentiation. For example, both $\tau+2\tau^2$ and $1+\tau+2\tau^2$ have derivative $1+4\tau$. Each is an **antiderivative** of $1+4\tau$: differentiating it returns that function. Adding any constant gives another antiderivative, because the derivative of a constant is zero. The slopes therefore determine changes in state, but a starting value is needed to determine the state itself. This starting value fixes the **integration constant**.

The **fundamental theorem of calculus** connects antiderivatives to definite integrals. For a scalar function $p$ with a continuous derivative, it states that integrating the derivative between two points gives the difference between the function values:

<a id="eW8zjour9d"></a>

$$
\int_0^\tau p'(\eta)\,d\eta=p(\tau)-p(0),
\qquad
p(\tau)=p(0)+\int_0^\tau p'(\eta)\,d\eta.
$$

[(32)](#eW8zjour9d "Link to this Equation")

Here $\eta$ is a dummy variable that runs over the integration interval; $\tau$ specifies where that interval ends. Over a short interval of width $\Delta\eta$, the change in $p$ is approximately $p'(\eta)\Delta\eta$. The definite integral is the limit of sums of these signed changes as the interval widths approach zero. Adding $p(0)$ to this accumulated change recovers the value at $\tau$. Polynomial derivatives are continuous, so the theorem applies to the pieces used here. For a vector state, the same identity applies to each component.

The sampled slopes $\mathbf f_{k,j}$ are derivatives with respect to physical time, whereas $\mathbf p_k$ is expressed in local time. Since $t=t_k+h_k\tau$, the chain rule gives

<a id="EVht7LgARd"></a>

$$
\mathbf p_k'(\tau)
=h_k\dot{\mathbf x}_h(t_k+h_k\tau)
=h_k\sum_{j=1}^{s}\mathbf f_{k,j}\ell_j(\tau).
$$

[(33)](#EVht7LgARd "Link to this Equation")

The factor $h_k$ accounts for the duration of the physical interval: a change of $\Delta\tau$ in local time corresponds to $h_k\Delta\tau$ units of physical time. For example, a constant physical slope $\mathbf f$ acting from 0 to $\tau_i$ changes the state by $h_k\tau_i\mathbf f$.

Applying the fundamental theorem with the left-endpoint condition $\mathbf p_k(0)=\mathbf x_k$ now gives the state piece:

<a id="HZQNZhuaLm"></a>

$$
\begin{aligned}
\mathbf{p}_k(\tau)
&=\mathbf{x}_k+\int_0^\tau\mathbf p_k'(\eta)\,d\eta\\
&=\mathbf{x}_k+h_k\sum_{j=1}^{s}
\left(\int_0^\tau\ell_j(\eta)\,d\eta\right)\mathbf{f}_{k,j}.
\end{aligned}
$$

[(34)](#HZQNZhuaLm "Link to this Equation")

The final expression follows by substituting the slope polynomial and integrating its terms separately; the stage slopes $\mathbf f_{k,j}$ are constant with respect to $\eta$. At $\tau=0$, every integral vanishes, leaving $\mathbf p_k(0)=\mathbf x_k$. Differentiating the expression returns the prescribed slope polynomial. Thus the stored left state selects the unique antiderivative with that starting value. Integrating a polynomial of degree at most $s-1$ gives a state piece of degree at most $s$.

For the scalar example above, $h_k=2$ and the physical-time slope is $1/2+2\tau$, so $p_k'(\tau)=1+4\tau$. Starting from $x_k=1$ gives

<a id="cLsiDlO19t"></a>

$$
p_k(\tau)=1+\int_0^\tau(1+4\eta)\,d\eta
=1+\left[\eta+2\eta^2\right]_0^\tau
=1+\tau+2\tau^2.
$$

[(35)](#cLsiDlO19t "Link to this Equation")

The brackets mean evaluating the antiderivative at the upper limit and subtracting its value at the lower limit. At $\tau_i=1/2$, the accumulated change is 1, so $p_k(1/2)=2$. At $\tau=1$, the accumulated change is 3, so $p_k(1)=4$. These are two evaluations of the same polynomial: both integrals begin at the left endpoint, but one stops at a stage and the other at the right endpoint.

This integration is exact for the interpolated slope polynomial. It does not generally give the exact solution of the original ODE: between collocation nodes, the interpolated slope can differ from $\mathbf f(\mathbf p_k(\tau),\mathbf u_h(t_k+h_k\tau),t_k+h_k\tau)$.

<a id="fig-stage-and-endpoint"></a>

<a id="nI6qUo5uz3"></a>
![One quadratic state piece spans local time zero to one, corresponding to physical time two to four. A circular stage point at local time one half has state two; square endpoints have states one and four. A blue arrow from zero to one half shows the integration span for a stage equation. An orange arrow from zero to one shows the integration span for the endpoint equation. Both arrows start at the same left endpoint.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/c7c5a4c913-stage-and-endpoint-058f449827efc25af4765659514c2a09.svg)

[Figure 8:](#fig-stage-and-endpoint "Link to this figure")Two integration limits on one polynomial piece. Here $t_k=2$, $h_k=2$, and $p_k(\tau)=1+\tau+2\tau^2$. The circle marks stage $i$ at $\tau_i=1/2$, corresponding to physical time 3; the squares mark the interval endpoints. The blue span accumulates a state change of 1 from $\tau=0$ to $\tau_i$, giving $x_{k,i}=2$. The orange span accumulates a state change of 3 from $\tau=0$ to 1, giving $x_{k+1}=4$. The arrows mark integration spans, not successive steps of a numerical solver. The changes come from integrating the derivative of the state curve shown. Only stage $i$ is highlighted; each sum uses all the slope stages on the interval.

The integration construction already determines the derivative at each collocation node. Because $\ell_j(\tau_i)=\delta_{ij}$, any candidate stage values give

<a id="JtkoK9qftK"></a>

$$
\begin{gathered}
\frac{1}{h_k}\mathbf p_k'(\tau_i)
=\mathbf f_{k,i}
=\mathbf f(\mathbf x_{k,i},\mathbf u_{k,i},t_k+h_k\tau_i),\\
\forall\,k=0,\ldots,N-1,\quad i=1,\ldots,s.
\end{gathered}
$$

[(36)](#JtkoK9qftK "Link to this Equation")

This identity holds by construction, before the NLP constraints have been satisfied. It does not yet guarantee that the reconstructed curve satisfies the ODE: the dynamics on the right are evaluated at the stored state $\mathbf x_{k,i}$, which may differ from the curve’s value $\mathbf p_k(\tau_i)$.

The remaining condition is agreement between these two state values. The point $(\tau_i,\mathbf{x}_{k,i})$ must lie on the graph of $\mathbf{p}_k$. Imposing $\mathbf{x}_{k,i}=\mathbf{p}_k(\tau_i)$ at every stage of every interval gives the **stage equations**

<a id="kXXORDG8QV"></a>

$$
\mathbf{x}_{k,i}
=\mathbf{x}_k+h_k\sum_{j=1}^{s}A_{ij}\mathbf{f}_{k,j},
\qquad \forall\,k=0,\ldots,N-1,\quad i=1,\ldots,s.
$$

[(37)](#kXXORDG8QV "Link to this Equation")

Their coefficients are

<a id="rUMo8l7uPX"></a>

$$
A_{ij}=\int_0^{\tau_i}\ell_j(\tau)\,d\tau,
\qquad i,j=1,\ldots,s.
$$

[(38)](#rUMo8l7uPX "Link to this Equation")

Each stage equation therefore sets a state-matching residual to zero:

<a id="zUkAsABout"></a>

$$
\mathbf r^{\mathrm{int}}_{k,i}
=\mathbf x_{k,i}-\mathbf p_k(\tau_i)=\mathbf0,
\qquad \forall\,k=0,\ldots,N-1,\quad i=1,\ldots,s.
$$

[(39)](#zUkAsABout "Link to this Equation")

Once this residual vanishes, the stored state used to evaluate $\mathbf f_{k,i}$ is the state on the reconstructed curve. Substituting $\mathbf x_{k,i}=\mathbf p_k(\tau_i)$ into the derivative identity above then gives the ODE at that node. Thus the integration form enforces the ODE at collocation nodes even though its explicit stage residuals compare state values rather than slopes.

For example, consider $\dot x=x$ on an interval of length $h_k=1$, starting from $x_k=1$, with one collocation node at $\tau_1=1/2$. A trial stage value $x_{k,1}=3$ supplies the slope $f_{k,1}=3$ and hence the state piece $p_k(\tau)=1+3\tau$. Its midpoint value is $5/2$, not the stored value 3. The polynomial’s slope is 3, but the ODE evaluated on the curve at the midpoint asks for $5/2$. The state equation $x_{k,1}=1+\tfrac12 x_{k,1}$ instead gives $x_{k,1}=2$. The reconstructed polynomial is then $p_k(\tau)=1+2\tau$, whose midpoint state and slope both equal 2. The state-matching constraint has made the ODE hold at the collocation node.

Row $i$ of $A$ integrates each slope basis function from 0 to $\tau_i$. Here $i$ selects the destination stage and $j$ runs over all slope stages that contribute to the polynomial. All these integrals start at 0, including when $i>1$; they do not start at the preceding stage. The stage equations are simultaneous constraints, since the slopes on the right depend on the state and control variables being chosen.

For example, take three slope stages at $(\tau_1,\tau_2,\tau_3)=(0,\tfrac12,1)$ and fix the destination $i=2$. Every integral in row 2 of $A$ now ends at $\tau_2=\tfrac12$. Varying $j$ selects the basis function being integrated: $\ell_1$, $\ell_2$, or $\ell_3$. [Figure 9](#fig-collocation-destination-and-slopes) shows these three signed areas. Although the third slope is evaluated at the right endpoint $\tau_3=1$, its basis function $\ell_3$ is nonzero between 0 and $\tfrac12$. That slope therefore contributes to the midpoint state as well. The sum runs over all $j=1,\ldots,s$, not only stages with $j\leq i$.

<a id="fig-collocation-destination-and-slopes"></a>

<a id="DMoJI1yc4g"></a>
![Three panels show the cardinal slope basis functions for nodes zero, one half, and one. The destination is fixed at stage i equals two, marked by the same vertical dashed line at one half in each panel. Shaded signed areas from zero to one half give A21 equals five twenty-fourths, A22 equals one third, and A23 equals minus one twenty-fourth. All three slopes enter the midpoint state equation.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/30d892ce95-destination-and-slop-935fcaaafb9071c1ce4769b86804b737.svg)

[Figure 9:](#fig-collocation-destination-and-slopes "Link to this figure")Fixing $i$ chooses the integration endpoint; varying $j$ includes every slope basis function. For nodes $(0,\tfrac12,1)$, the blue curves are $\ell_1(\tau)=2\tau^2-3\tau+1$, $\ell_2(\tau)=4\tau(1-\tau)$, and $\ell_3(\tau)=2\tau^2-\tau$. Each blue point marks the node where its basis function equals one. The orange dashed line marks the common upper limit $\tau_i=\tau_2=\tfrac12$. The shaded signed areas form row 2 of $A$: $(A_{21},A_{22},A_{23})=(\tfrac5{24},\tfrac13,-\tfrac1{24})$. The third area is negative because $\ell_3$ lies below zero on this span; it is not absent just because stage 3 lies after the destination. The bottom equation expands the sum for a scalar state; the same coefficients multiply vector-valued slopes in the general case.

The right endpoint has local coordinate 1. Evaluating the same polynomial there uses the full integration span $[0,1]$, in place of the span $[0,\tau_i]$ used for stage $i$. Requiring this value $\mathbf{p}_k(1)$ to equal the stored endpoint state $\mathbf{x}_{k+1}$ gives

<a id="gWqWRAUsVc"></a>

$$
\boxed{
\mathbf{x}_{k+1}
=\mathbf{x}_k+h_k\sum_{j=1}^{s}b_j\mathbf{f}_{k,j},
\qquad
b_j=\int_0^1\ell_j(\tau)\,d\tau.
}
$$

[(40)](#gWqWRAUsVc "Link to this Equation")

The coefficients $b_j$ integrate the cardinal functions over the full reference interval. In code, both $A_{ij}$ and $b_j$ are obtained by forming an antiderivative polynomial and evaluating it at the integration limits. No repeated integration of the nonlinear dynamics is involved in computing these coefficients. The worked calculation in [A reusable coefficient generator and residual evaluator](#sec-collocation-coefficient-generator) shows the coefficient arithmetic. If a stage lies at $\tau_i=1$, then $A_{ij}=b_j$ for every $j$, so its stage equation gives the same polynomial value as the endpoint equation. Its state must therefore equal $\mathbf{x}_{k+1}$; an implementation can share that variable.

The endpoint equation is a defect constraint: it requires the stored endpoint to match the endpoint obtained by integrating the slopes of piece $k$. The next piece starts from that same stored value, so the two pieces meet:

<a id="o2YzjypdDT"></a>

$$
\mathbf{p}_k(1)=\mathbf{x}_{k+1}=\mathbf{p}_{k+1}(0).
$$

[(41)](#o2YzjypdDT "Link to this Equation")

This shared variable enforces state continuity across the join. If an implementation stores separate endpoint variables for the two pieces, it must impose an equality between them. Choosing an endpoint as a collocation node does not by itself join the pieces. Continuity of the state also does not require continuity of its derivative; neighboring pieces can meet with different slopes.

<a id="fig-piecewise-collocation-trajectory"></a>

<a id="v6hhFreQIw"></a>
![Three quadratic state segments meet at shared endpoint states in physical time. The middle segment is repeated on a normalized time axis from zero to one, with two interior stage values and their slopes marked.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/b4156b1f00-piecewise-trajectory-b7459847145aea6dbb86aeb978a11dfe.svg)

[Figure 10:](#fig-piecewise-collocation-trajectory "Link to this figure")A scalar trajectory consists of polynomial pieces joined at shared endpoint states (squares). The middle piece $p_k$ is shown in blue in both panels; only its time coordinate changes. The stage values (orange dots) lie at $\tau_1=1/3$ and $\tau_2=2/3$. Tangent marks in the lower panel have slopes $p_k'(\tau_j)=h_kf_{k,j}$ because that axis uses normalized time. The stage equations place the dots on the piece, and the endpoint defect makes it reach $x_{k+1}$, where the next piece begins. This schematic uses quadratic state pieces and linear slope interpolants.

The running-cost integral can be treated by exactly the same construction. As in the earlier Bolza-to-Mayer reduction, introduce a scalar state $y(t)$ that records the cost accumulated since $t_0$:

<a id="uj2kQLIIMy"></a>

$$
y(t)=\int_{t_0}^{t}c(\mathbf{x}(s),\mathbf{u}(s),s)\,ds,
\qquad
\dot y(t)=c(\mathbf{x}(t),\mathbf{u}(t),t),\qquad y(t_0)=0.
$$

[(42)](#uj2kQLIIMy "Link to this Equation")

The original objective is now $c_f(\mathbf{x}(t_f),t_f)+y(t_f)$. The augmented state $(\mathbf{x}^{\top},y)^{\top}$ has two rates of change: $\mathbf{f}$ supplies the physical state rate and $c$ supplies the cost rate. Applying the same collocation method to this augmented ODE evaluates both rates at each stage’s state, control, and time. In particular, the cost rate at stage $j$ of interval $k$ is

<a id="VnGoIQ5nPw"></a>

$$
c_{k,j}:=c(\mathbf{x}_{k,j},\mathbf{u}_{k,j},t_k+h_k\tau_j).
$$

[(43)](#VnGoIQ5nPw "Link to this Equation")

Let $y_k$ and $y_{k,i}$ denote the accumulated-cost values at the interval’s left endpoint and at stage $i$. Integrating the cost-rate interpolant to a stage and to the right endpoint gives

<a id="c7FimDmKJM"></a>

$$
y_{k,i}=y_k+h_k\sum_{j=1}^{s}A_{ij}c_{k,j},
\qquad
y_{k+1}=y_k+h_k\sum_{j=1}^{s}b_jc_{k,j}.
$$

[(44)](#c7FimDmKJM "Link to this Equation")

These are the same stage and endpoint equations as for $\mathbf{x}$, with $c_{k,j}$ in place of $\mathbf{f}_{k,j}$. The increase in accumulated cost across interval $k$ therefore supplies its contribution to the discrete objective:

<a id="N0VoIxxtaW"></a>

$$
c_k:=y_{k+1}-y_k
=h_k\sum_{j=1}^{s}b_jc_{k,j}
\approx\int_{t_k}^{t_{k+1}}c(\mathbf{x}_h(t),\mathbf{u}_h(t),t)\,dt.
$$

[(45)](#N0VoIxxtaW "Link to this Equation")

Here $\mathbf{u}_h$ is the piecewise control approximation. The single-index $c_k$ is an interval cost, whereas $c_{k,j}$ is a sampled cost rate; the factor $h_k$ gives them different units. The weighted sum integrates the polynomial interpolating the sampled cost rates exactly. It approximates the running-cost integral because the composed function $c(\mathbf{x}_h(t),\mathbf{u}_h(t),t)$ need not itself be that polynomial. Such a weighted-sum approximation is called a **quadrature rule**.

Since $y_0=0$, summing the interval increments gives $y_N=\sum_{k=0}^{N-1}c_k$. The accumulated-cost variables can therefore be eliminated and the sum used directly in the objective. Introducing $y$ explains why applying one collocation scheme to both rates uses the same nodes and weights; it does not require adding cost variables to the implementation. A different quadrature rule is also possible, with the state and control polynomials evaluated at that rule’s nodes.

<a id="choosing-a-polynomial-for-the-control"></a>

### Choosing a polynomial for the control

The state and control play different roles. The ODE constrains the state’s derivative, so integrating an interpolant of $s$ slopes gives a state polynomial of degree at most $s$. There is no corresponding ODE for the control in this problem. Its representation is a separate choice: a constant command on each interval, a line between endpoint commands, or a higher-degree polynomial.

For example, with two endpoint slopes the state polynomial is quadratic. The control can still be the line

<a id="z1XdQWDhYm"></a>

$$
\mathbf u_h(t_k+h_k\tau)
=(1-\tau)\mathbf u_k+\tau\mathbf u_{k+1}.
$$

[(46)](#z1XdQWDhYm "Link to this Equation")

These degrees need not match. Also, substituting polynomial state and control curves into a nonlinear $\mathbf f$ need not produce a polynomial. Collocation matches the state derivative to $\mathbf f$ at the chosen nodes, rather than requiring the ODE to hold identically between them.

To make the control choice explicit, select distinct control support nodes $\rho_0,\ldots,\rho_{d_u}\in[0,1]$ and construct their cardinal functions $\psi_0,\ldots,\psi_{d_u}$. The decision variables $\widehat{\mathbf u}_{k,r}$ are control values at these support nodes:

<a id="OnyqvA5Q04"></a>

$$
\mathbf u_h(t_k+h_k\tau)
=\sum_{r=0}^{d_u}\widehat{\mathbf u}_{k,r}\psi_r(\tau),
\qquad
\mathbf u_{k,j}
=\sum_{r=0}^{d_u}B_{jr}\widehat{\mathbf u}_{k,r},
\quad B_{jr}:=\psi_r(\tau_j).
$$

[(47)](#OnyqvA5Q04 "Link to this Equation")

Thus the stage controls $\mathbf u_{k,j}$ are computed from the control variables; they are independent variables only when the representation allows independent values at all those stages. For a constant control, $d_u=0$ and every entry of $B$ is one. For a linear control supported at $0,1$, row $j$ of $B$ is $(1-\tau_j,\tau_j)$.

Using more control support values than collocation stages leaves some control variations invisible to those stage samples. The examples below use $d_u+1\leq s$; a richer control representation needs additional sampling or other constraints to account for those variations.

The ODE requires continuous states, but it can admit controls that jump between intervals. Independent control polynomials therefore need no continuity constraint unless the model or chosen parameterization requires one. Sharing endpoint controls between neighboring linear pieces enforces continuity. With separate local variables, the equivalent equality is

<a id="rrzR74mvQQ"></a>

$$
\sum_{r=0}^{d_u}\psi_r(1)\widehat{\mathbf u}_{k,r}
=\sum_{r=0}^{d_u}\psi_r(0)\widehat{\mathbf u}_{k+1,r}.
$$

[(48)](#rrzR74mvQQ "Link to this Equation")

At a jump, endpoint stages use the control belonging to their own interval. Finally, bounds on support values guarantee bounds throughout a constant or linear control segment, because its values are convex combinations of its endpoints. A higher-degree polynomial can overshoot those values, so support bounds alone no longer give that guarantee.

<a id="assembling-the-nonlinear-program"></a>

### Assembling the nonlinear program

The state and control representations now specify which quantities the optimizer chooses and which it evaluates from those choices. The mesh states $\mathbf x_k,\mathbf x_{k+1}$ are shared decision variables at the ends of interval $k$. The stage states $\mathbf x_{k,j}$ are decision variables at the collocation nodes; a stage at an endpoint can use the mesh state itself. For the control, the optimizer chooses the support values $\widehat{\mathbf u}_{k,r}$ at $\rho_r$. Evaluating the control polynomial at $\tau_j$ gives $\mathbf u_{k,j}$. Together with $\mathbf x_{k,j}$ and the time $t_k+h_k\tau_j$, this evaluated control supplies the inputs to $\mathbf f$ and $c$.

<a id="fig-collocation-nlp-quantities"></a>

<a id="p6ZwzrzJ83"></a>
![State and control curves share one interval with collocation nodes at one third and two thirds. Filled blue squares mark shared mesh state variables, filled blue circles mark stage state variables, and filled blue diamonds mark control support variables at zero and one. An open orange circle marks the stage control evaluated using B. The selected stage state, evaluated control, and time determine the dynamics and cost rates on the right.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/f93ca39bd6-nlp-quantities-a18f7733ee47409b241a6f2ca6e90eff.svg)

[Figure 11:](#fig-collocation-nlp-quantities "Link to this figure")Decision variables and evaluated quantities on one interval. The curves show a scalar example with two collocation nodes, $\tau_1=1/3$ and $\tau_2=2/3$; the highlighted stage is $j=2$. Squares mark mesh states shared with neighboring intervals, and filled circles mark stage states. Diamonds mark the independent control values at $\rho_0=0$ and $\rho_1=1$. For this linear control, $B_{j,:}=(1-\tau_j,\tau_j)$ evaluates the open circle $\mathbf u_{k,j}$ from the two diamonds. The quantities $\mathbf f_{k,j}$ and $c_{k,j}$ are then evaluated at the stage state, control, and physical time. Filled blue markers are decision variables; the orange control value and rates are computed from them. The curves depict a feasible choice: the stage and endpoint constraints place the state variables on the integrated polynomial. If a collocation node is an endpoint, its stage state can be identified with the shared mesh variable.

Collect the independent state and control values across all intervals into the decision vector

<a id="u0X8skaXiO"></a>

$$
\mathbf z=\operatorname{col}\!\left(
\{\mathbf x_k\}_{k=0}^{N},
\{\mathbf x_{k,j}\}_{k=0,\,j=1}^{N-1,\,s},
\{\widehat{\mathbf u}_{k,r}\}_{k=0,\,r=0}^{N-1,\,d_u}
\right).
$$

[(49)](#u0X8skaXiO "Link to this Equation")

Here $\operatorname{col}$ stacks the listed vectors into one column, omitting duplicate variables when a stage shares a mesh endpoint. Stage controls are evaluated using $B$, and any chosen control-continuity equalities are added to the constraints. If $t_f$ is optimized, it is included in $\mathbf z$ as well. The resulting finite optimization problem has the form

<a id="yvh0RBjYjl"></a>

$$
\begin{aligned}
\underset{\mathbf{z}}{\operatorname{minimize}}\quad&
c_f(\mathbf{x}_N,t_f)+\sum_{k=0}^{N-1}c_k\\
\text{subject to}\quad&
\text{stage equations},\\
&\text{endpoint defects and continuity},\\
&\text{boundary, path, and bound constraints}.
\end{aligned}
$$

[(50)](#yvh0RBjYjl "Link to this Equation")

In the preceding chapter’s NLP notation, $F(\mathbf z)$ is this scalar objective, $H(\mathbf z)=\mathbf0$ stacks the stage, endpoint, and boundary equalities, and $G(\mathbf z)\leq\mathbf0$ stacks the sampled path and bound inequalities. The slope $\mathbf f_{k,j}$ is a vector, distinct from $F$.

The original path and bound constraints apply at every continuous time. This NLP imposes them at selected points, usually its support or collocation nodes. Feasibility at those nodes does not rule out a violation between them. Checking the polynomial between nodes and simulating the chosen control provide complementary diagnostics, developed below.

Every interval constraint touches only local stage variables and neighboring endpoint states. Consequently, most derivatives of the constraints with respect to the decision variables are zero. With variables ordered by time, the nonzero blocks lie near the diagonal of the Jacobian, the matrix of constraint derivatives. NLP solvers can exploit this sparse, block-banded pattern. The arrays $A$ and $b$ are numerical constants computed before optimization.

<a id="equivalent-differentiation-form"></a>

### Equivalent differentiation form

The differentiation form uses the same collocation nodes $\tau_i$ as the integration form. It changes which consistency condition is built into the representation and which must be enforced by a residual. The integration form constructs a curve whose nodal derivatives match the evaluated stage slopes, then constrains its values to match the stored stage states. The differentiation form constructs a curve from state-support values, evaluates its stage states directly on that curve, and constrains its derivatives to match the ODE.

To represent the same state polynomials, retain the same degree. The integral of the degree-$(s-1)$ slope polynomial has degree at most $s$, so take $d=s$ and choose $d+1$ support nodes $\sigma_0,\ldots,\sigma_d$ for the state polynomial. Write $\ell_r^{\mathrm{state}}$ for their cardinal functions to distinguish this support-node basis from the slope-node basis $\ell_j$. Denote the support values by $\widehat{\mathbf x}_{k,r}$; these need not be the stage values $\mathbf x_{k,j}$ at $\tau_j$:

<a id="hLawruRHht"></a>

$$
\mathbf{x}_h(t_k+h_k\tau)
=\sum_{r=0}^{d}\widehat{\mathbf x}_{k,r}\ell_r^{\mathrm{state}}(\tau).
$$

[(51)](#hLawruRHht "Link to this Equation")

At a collocation node $\tau_i$, the state is a weighted sum of its support values, and its derivative with respect to $\tau$ is another weighted sum. The fixed arrays containing these weights are

<a id="mL6B5ebnY0"></a>

$$
E_{ir}=\ell_r^{\mathrm{state}}(\tau_i),
\qquad
D_{ir}=(\ell_r^{\mathrm{state}})'(\tau_i).
$$

[(52)](#mL6B5ebnY0 "Link to this Equation")

The $i$th row of $E$ computes $\mathbf p_k(\tau_i)$, the point on the state polynomial that we supply to the dynamics function. The $i$th row of $D$ computes $\mathbf p_k'(\tau_i)$, the tangent slope measured per unit of local time $\tau$. Both calculations use the same stored support states $\widehat{\mathbf x}_{k,r}$; they do not introduce new decision variables. In particular, the stage state is defined as $\mathbf x_{k,i}=\mathbf p_k(\tau_i)=\sum_r E_{ir}\widehat{\mathbf x}_{k,r}$. State-value consistency therefore holds for every candidate support array; there is no separate state-matching residual at a stage.

To compare this tangent slope with the rate returned by $\mathbf f$, both must be measured in physical time. A local-time increment $\Delta\tau$ corresponds to a physical-time increment $\Delta t=h_k\Delta\tau$. We therefore divide the local-time slope by $h_k$ to obtain the physical-time slope: this is the chain rule $d/dt=(1/h_k)d/d\tau$ used earlier. The remaining constraint sets the physical-time slope residual to zero:

<a id="RTVwOLb84I"></a>

$$
\begin{gathered}
\mathbf r^{\mathrm{diff}}_{k,i}
=\frac{1}{h_k}\mathbf p_k'(\tau_i)
-\mathbf f\!\left(\mathbf p_k(\tau_i),\mathbf u_{k,i},t_k+h_k\tau_i\right)
=\mathbf0,\\
\forall\,k=0,\ldots,N-1,\quad i=1,\ldots,s.
\end{gathered}
$$

[(53)](#RTVwOLb84I "Link to this Equation")

Both slopes are evaluated at the same point on the state curve. Unlike state-value consistency, their equality is not built into the state interpolant. Writing these evaluations using $E,D$ and multiplying by $h_k$ gives

<a id="OQQZxtzCJG"></a>

$$
\begin{gathered}
\boxed{
\sum_{r=0}^{d}D_{ir}\widehat{\mathbf x}_{k,r}
=h_k \mathbf{f}\left(
\sum_{r=0}^{d}E_{ir}\widehat{\mathbf x}_{k,r},
\mathbf{u}_{k,i},
t_k+h_k\tau_i
\right).
}\\
\forall\,k=0,\ldots,N-1,\quad i=1,\ldots,s.
\end{gathered}
$$

[(54)](#OQQZxtzCJG "Link to this Equation")

The left side is the polynomial’s slope with respect to $\tau$; the right side is the ODE’s physical-time rate multiplied by $h_k$. The scalar quadratic in [Figure 12](#fig-collocation-evaluation-differentiation) shows both calculations at a collocation node that is not a support node.

<a id="fig-collocation-evaluation-differentiation"></a>

<a id="XOwCBHh7nc"></a>
![Three square support states define a quadratic. At a collocation node between the support nodes, E computes the value shown by an open circle and D computes the dashed tangent's slope. Dividing this slope by the interval length gives the physical-time rate that must match the ODE.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/c4d75e4337-evaluation-and-diffe-b95b62c5c9438ac3fccc2408ad9add9e.svg)

[Figure 12:](#fig-collocation-evaluation-differentiation "Link to this figure")Evaluation and differentiation of the same state polynomial. The support states $(1,2,4)$ at $\sigma=(0,\tfrac12,1)$ define $p_k(\tau)=1+\tau+2\tau^2$. At the highlighted collocation node $\tau_i=\tfrac14$, $E$ computes the state $p_k(\tau_i)=\tfrac{11}{8}$, while $D$ computes the tangent slope $p_k'(\tau_i)=2$. With $h_k=2$, the physical-time slope is $2/2=1$. For the dynamics $\dot x=u$ and stage control $u_{k,i}=1$, the ODE also returns 1, so the collocation constraint holds at this node. Taking $t_k=2$ places the node at physical time $t_k+h_k\tau_i=\tfrac52$.

In matrix shorthand, all nodal constraints are $D\mathsf X_k=h_k\mathsf F_k$. Here $\mathsf X_k\in\mathbb R^{(d+1)\times n}$ has support states as rows, and $\mathsf F_k\in\mathbb R^{s\times n}$ has stage slopes as rows; neither is a single state vector. Evaluation at the two ends connects this polynomial to the shared mesh states:

<a id="ct8CY0HmS9"></a>

$$
\mathbf{x}_{k}=\sum_{r=0}^{d}\ell_r^{\mathrm{state}}(0)\widehat{\mathbf x}_{k,r},
\qquad
\mathbf{x}_{k+1}=\sum_{r=0}^{d}\ell_r^{\mathrm{state}}(1)\widehat{\mathbf x}_{k,r}.
$$

[(55)](#ct8CY0HmS9 "Link to this Equation")

When support and collocation nodes coincide, the cardinal property makes $E$ select the corresponding stored state directly. The slope-value and state-value forms describe the same polynomial construction; one integrates nodal slopes, while the other differentiates nodal states.

This implementation pattern is standard in direct collocation [Kelly, 2017](https://doi.org/10.1137/16M1062569)[Andersson _et al._, 2019](https://doi.org/10.1007/s12532-018-0139-4). The official [CasADi direct-collocation example](https://github.com/casadi/casadi/blob/main/docs/examples/python/direct_collocation.py) constructs fixed differentiation, endpoint, and quadrature arrays from Lagrange polynomials, while the NLP variables remain state and control values.

In the integration form, matching the evaluated stage slopes is built into the polynomial construction, while matching the stage states requires constraints. In the differentiation form, matching stage states to the curve is built into evaluation, while matching ODE slopes requires constraints. Both forms also connect the polynomial to the shared mesh endpoints. With the same collocation nodes, state degree, and control representation, their zero residuals describe the same collocation trajectories, although their residual values need not agree for an infeasible candidate. The node-to-NLP recipe for the differentiation form is developed in [Constructing the differentiation form from its nodes](#sec-collocation-differentiation-from-nodes).

<a id="low-order-transcriptions"></a>

## Low-Order Transcriptions

Which familiar integration rules appear when the polynomial and node sets are reduced to their lowest-order choices?

The general construction becomes concrete when only one or two slope values are retained on each interval. These cases recover familiar integration formulas, but the formulas now appear as constraints inside an NLP. For the concrete problems below, fix the mesh and final time. The boundary map $\mathbf h(\mathbf x_0,\mathbf x_N,t_N)=\mathbf0$ includes the prescribed initial state and any terminal conditions; $\mathbf g\leq\mathbf0$ includes path constraints and state/control bounds. Each displayed program specifies the points where those inequalities are imposed. Additional check points can be included, and a continuous replay still checks the result between nodes.

<a id="one-slope-value-explicit-and-implicit-euler"></a>

### One slope value: explicit and implicit Euler

A single slope value determines a constant derivative on each interval. Choose a constant control $\mathbf u_{k,1}$ on that interval as well: $\mathbf u_h(t_k+h_k\tau)=\mathbf u_{k,1}$. Different intervals may use different constants. The state is linear even though the control is constant. The following exercise applies the preceding construction to recover the two Euler methods. The solution gives a recipe that also extends to multiple slope nodes.

<a id="ex-collocation-one-slope-recipe"></a>

[Exercise 1](#ex-collocation-one-slope-recipe "Link to this Exercise") (Derive a transcription from one slope)

Consider $\dot{\mathbf x}=\mathbf{f}(\mathbf x,\mathbf u,t)$ on $[t_k,t_{k+1}]$, with duration $h_k$ and normalized time $\tau=(t-t_k)/h_k$. Approximate the physical-time derivative by a constant that matches the ODE at a single collocation node $\tau_1$.

Carry out the construction for $\tau_1=0$ and then for $\tau_1=1$. For each choice:

1.  Construct the cardinal function and identify the ODE slope it multiplies.
    
2.  Integrate from $\mathbf{x}_k$ to obtain the state polynomial $\mathbf{p}_k(\tau)$, then impose its agreement with the stored right endpoint $\mathbf{x}_{k+1}$.
    
3.  Derive the interval cost contribution by applying the same construction to $\dot y=c(\mathbf x,\mathbf u,t)$.
    
4.  Identify the method, state the degree of its state polynomial, and explain whether its endpoint equation can be evaluated directly in a forward simulation with prescribed controls.
    

Solution to [Exercise 1](#ex-collocation-one-slope-recipe)

The derivation follows five steps: choose where the ODE is evaluated, interpolate its slope, integrate that interpolant, match the stored endpoint, and integrate the cost rate with the same weights.

1.  **Choose the stage and evaluate its slope.** The left node uses the state, control, and time at the start of the interval; the right node uses those at its end:
    
    <a id="UhHq5V0j0d"></a>
    
    $$
    \mathbf{f}_{k,1}=\begin{cases}
       \mathbf{f}(\mathbf{x}_k,\mathbf u_{k,1},t_k),&\tau_1=0,\\
       \mathbf{f}(\mathbf{x}_{k+1},\mathbf u_{k,1},t_{k+1}),&\tau_1=1.
       \end{cases}
    $$
    
    [(56)](#UhHq5V0j0d "Link to this Equation")
    
2.  **Interpolate the physical-time derivative.** With one node, the cardinal function is the constant $\ell_1(\tau)=1$, since it must equal one at that node. Hence $\dot{\mathbf{x}}_h(t_k+h_k\tau)=\mathbf{f}_{k,1}$ throughout the interval. Its full-interval integration weight is $b_1=\int_0^1\ell_1(\tau)\,d\tau=1$.
    
3.  **Integrate from the left state.** The reference-time derivative is $\mathbf{p}_k'(\tau)=h_k\mathbf{f}_{k,1}$. Integrating and imposing $\mathbf{p}_k(0)=\mathbf{x}_k$ gives
    
    <a id="pYpyuc0cww"></a>
    
    $$
    \mathbf{p}_k(\tau)=\mathbf{x}_k+h_k\tau \mathbf{f}_{k,1}.
    $$
    
    [(57)](#pYpyuc0cww "Link to this Equation")
    
    Thus the state polynomial has degree at most one. The factor $h_k$ accounts for the physical duration of the interval.
    
4.  **Match the stored right endpoint.** Setting $\mathbf{p}_k(1)=\mathbf{x}_{k+1}$ gives the defect $\mathbf{x}_{k+1}-\mathbf{x}_k-h_k\mathbf{f}_{k,1}=\mathbf0$. Substituting the two slope choices yields
    
    <a id="JiGnKMttzy"></a>
    
    $$
    \begin{aligned}
       \mathbf{x}_{k+1}-\mathbf{x}_k-h_k\mathbf{f}(\mathbf{x}_k,\mathbf u_{k,1},t_k)&=\mathbf0
       &&\text{(explicit Euler)},\\
       \mathbf{x}_{k+1}-\mathbf{x}_k-h_k\mathbf{f}(\mathbf{x}_{k+1},\mathbf u_{k,1},t_{k+1})&=\mathbf0
       &&\text{(implicit Euler)}.
       \end{aligned}
    $$
    
    [(58)](#JiGnKMttzy "Link to this Equation")
    
    In forward simulation, explicit Euler computes the next state from known left-endpoint data. Implicit Euler places the unknown next state inside $\mathbf{f}$, so it generally requires solving an equation, which is nonlinear when the dynamics depend nonlinearly on that state. In direct transcription, both endpoints are optimization variables and either defect is imposed as an equality constraint.
    
5.  **Apply the same integration rule to the cost rate.** The single sampled cost rate is constant in the approximation, so its integral is that rate multiplied by $h_k$:
    
    <a id="RhSKUuVgXw"></a>
    
    $$
    c_k=\begin{cases}
       h_kc(\mathbf{x}_k,\mathbf u_{k,1},t_k),&\tau_1=0,\\
       h_kc(\mathbf{x}_{k+1},\mathbf u_{k,1},t_{k+1}),&\tau_1=1.
       \end{cases}
    $$
    
    [(59)](#RhSKUuVgXw "Link to this Equation")
    
    These are the left- and right-endpoint approximations to the interval running-cost integral. They use the same stage as the corresponding dynamics constraint.
    

With additional slope nodes, the sequence stays the same. The constant cardinal function is replaced by several cardinal polynomials, and their integrals supply the weights in the stage equations, endpoint defect, and cost contribution.

<a id="the-complete-euler-nlp"></a>

### The complete Euler NLP

Let $\theta=0$ for explicit Euler and $\theta=1$ for implicit Euler. Both methods optimize the mesh states $\mathbf x_0,\ldots,\mathbf x_N$ and the $N$ interval controls $\mathbf u_{k,1}$. There are no additional stage-state variables after identifying the sole stage with its endpoint:

<a id="SRv7bB6Vh9"></a>

$$
\begin{aligned}
\min_{\{\mathbf x_k\}_{k=0}^N,\,\{\mathbf u_{k,1}\}_{k=0}^{N-1}}
\quad &c_f(\mathbf x_N,t_N)
+\sum_{k=0}^{N-1}h_kc(\mathbf x_{k+\theta},\mathbf u_{k,1},t_{k+\theta})\\
\text{subject to}\quad
&\mathbf x_{k+1}-\mathbf x_k
-h_k\mathbf f(\mathbf x_{k+\theta},\mathbf u_{k,1},t_{k+\theta})=\mathbf0,\\
&\mathbf g(\mathbf x_{k+\theta},\mathbf u_{k,1},t_{k+\theta})\leq\mathbf0,
\quad k=0,\ldots,N-1,\\
&\mathbf h(\mathbf x_0,\mathbf x_N,t_N)=\mathbf0.
\end{aligned}
$$

[(60)](#SRv7bB6Vh9 "Link to this Equation")

Here $k+\theta$ selects an endpoint, not an intermediate time. The path constraints use the same endpoint as the dynamics; bounds required at the other endpoint can be imposed there too. The two NLPs differ only in where the slope and cost rate are evaluated. Both are solved for the entire trajectory simultaneously.

<a id="endpoint-slope-values-trapezoidal-transcription"></a>

### Endpoint slope values: trapezoidal transcription

Use continuous piecewise-linear controls, with shared endpoint variables $\mathbf u_0,\ldots,\mathbf u_N$. Choose the endpoint collocation nodes $\tau_1=0$ and $\tau_2=1$, and abbreviate the two ODE slopes by

<a id="fkOgmvVoga"></a>

$$
\mathbf{f}_k=\mathbf{f}(\mathbf{x}_k,\mathbf{u}_k,t_k),\qquad
\mathbf{f}_{k+1}=\mathbf{f}(\mathbf{x}_{k+1},\mathbf{u}_{k+1},t_{k+1}).
$$

[(61)](#fkOgmvVoga "Link to this Equation")

For this endpoint formula, label the cardinal functions by their locations, 0 and 1, rather than by the stage numbers 1 and 2:

<a id="G6Do95Ca8r"></a>

$$
\ell_0(\tau)=1-\tau,\qquad
\ell_1(\tau)=\tau.
$$

[(62)](#G6Do95Ca8r "Link to this Equation")

The derivative interpolant is the line joining the two slopes:

<a id="YKq3CcONT5"></a>

$$
\dot{\mathbf{x}}_h(t_k+h_k\tau)
=(1-\tau)\mathbf{f}_k+\tau \mathbf{f}_{k+1}.
$$

[(63)](#YKq3CcONT5 "Link to this Equation")

It equals $\mathbf{f}_k$ at $\tau=0$ and $\mathbf{f}_{k+1}$ at $\tau=1$. Integrating from the stored left state gives the continuous state approximation

<a id="awG6E17ICx"></a>

$$
\mathbf{x}_h(t_k+h_k\tau)
=\mathbf{x}_k+h_k\left[
\left(\tau-\frac{\tau^2}{2}\right)\mathbf{f}_k
+\frac{\tau^2}{2}\mathbf{f}_{k+1}
\right].
$$

[(64)](#awG6E17ICx "Link to this Equation")

The state approximation is quadratic, even though an implementation may store only its endpoint states and slopes. Evaluating this polynomial at $\tau=1$ and equating it to the stored endpoint produces

<a id="Vu9IZXVWi2"></a>

$$
\boxed{
\mathbf{x}_{k+1}-\mathbf{x}_k
-\frac{h_k}{2}
\left[
\mathbf{f}(\mathbf{x}_k,\mathbf{u}_k,t_k)
+\mathbf{f}(\mathbf{x}_{k+1},\mathbf{u}_{k+1},t_{k+1})
\right]
=\mathbf0.
}
$$

[(65)](#Vu9IZXVWi2 "Link to this Equation")

The coefficients $1/2$ are the integrals of the two linear cardinal functions. This is the trapezoidal defect derived in the opening example. Applying the same endpoint weights to the running cost gives

<a id="ZvbIHP5SPn"></a>

$$
c_k
=
\frac{h_k}{2}
\left[
c(\mathbf{x}_k,\mathbf{u}_k,t_k)
+c(\mathbf{x}_{k+1},\mathbf{u}_{k+1},t_{k+1})
\right].
$$

[(66)](#ZvbIHP5SPn "Link to this Equation")

The two endpoint costs are averaged and multiplied by the interval length. Integration increases the degree: a linear derivative interpolant produces a quadratic state interpolant. This construction also appears in [Kelly (2017)](https://doi.org/10.1137/16M1062569).

<a id="the-complete-trapezoidal-nlp"></a>

### The complete trapezoidal NLP

The decision variables are the mesh states and controls. Write $\mathbf f_k=\mathbf f(\mathbf x_k,\mathbf u_k,t_k)$ and $c_k^{\mathrm{rate}}=c(\mathbf x_k,\mathbf u_k,t_k)$ for evaluated quantities, not additional optimization variables. Then the transcribed problem is

<a id="Q0HkVDaLzx"></a>

$$
\begin{aligned}
\min_{\{\mathbf x_k,\mathbf u_k\}_{k=0}^{N}}\quad
&c_f(\mathbf x_N,t_N)
+\sum_{k=0}^{N-1}\frac{h_k}{2}
\left(c_k^{\mathrm{rate}}+c_{k+1}^{\mathrm{rate}}\right)\\
\text{subject to}\quad
&\mathbf x_{k+1}-\mathbf x_k
-\frac{h_k}{2}(\mathbf f_k+\mathbf f_{k+1})=\mathbf0,
\quad k=0,\ldots,N-1,\\
&\mathbf g(\mathbf x_k,\mathbf u_k,t_k)\leq\mathbf0,
\quad k=0,\ldots,N,\\
&\mathbf h(\mathbf x_0,\mathbf x_N,t_N)=\mathbf0.
\end{aligned}
$$

[(67)](#Q0HkVDaLzx "Link to this Equation")

The state between endpoints is the quadratic obtained above, while the control is linear. Shared mesh states and controls connect adjacent pieces; no separate continuity equations are needed in this representation.

<a id="hermite-simpson-transcription"></a>

## Hermite--Simpson Transcription

Can midpoint state and slope information raise the transcription order without requiring a high-degree polynomial over the whole horizon?

Hermite--Simpson extends the trapezoidal construction by adding the midpoint state $\mathbf{x}_{k+\frac12}$. Retain the same piecewise-linear control, so its midpoint value is already determined:

<a id="Jq0n3xkxFI"></a>

$$
\mathbf u_{k+\frac12}=\frac{\mathbf u_k+\mathbf u_{k+1}}{2}.
$$

[(68)](#Jq0n3xkxFI "Link to this Equation")

Evaluate the midpoint ODE slope using that control:

<a id="MWaOw7r91h"></a>

$$
\mathbf{f}_{k+\frac12}=\mathbf{f}\left(
\mathbf{x}_{k+\frac12},\mathbf{u}_{k+\frac12},t_k+\frac{h_k}{2}
\right).
$$

[(69)](#MWaOw7r91h "Link to this Equation")

The notation $\mathbf x_{k+\frac12}$ and $\mathbf u_{k+\frac12}$ denotes values at physical time $t_k+h_k/2$, not another mesh endpoint.

The three stage nodes are $\tau_1=0$, $\tau_2=\tfrac12$, and $\tau_3=1$. We label their cardinal functions $0,m,1$ for left endpoint, midpoint, and right endpoint. The derivative interpolant is the quadratic built from the following three cardinal functions:

<a id="UOCvpoIo1G"></a>

$$
\ell_0(\tau)=2\tau^2-3\tau+1,\qquad
\ell_m(\tau)=4\tau(1-\tau),\qquad
\ell_1(\tau)=2\tau^2-\tau.
$$

[(70)](#UOCvpoIo1G "Link to this Equation")

Integrating each function over the full reference interval gives

<a id="A7ewO2nbwD"></a>

$$
b_0=\frac16,\qquad
b_m=\frac46,\qquad
b_1=\frac16.
$$

[(71)](#A7ewO2nbwD "Link to this Equation")

These are the familiar Simpson quadrature weights. Substituting them into the general endpoint equation produces the Simpson defect:

<a id="a6zUmjenBr"></a>

$$
\boxed{
\mathbf{x}_{k+1}-\mathbf{x}_k
-\frac{h_k}{6}
\left(\mathbf{f}_k+4\mathbf{f}_{k+\frac12}+\mathbf{f}_{k+1}\right)
=\mathbf0.
}
$$

[(72)](#a6zUmjenBr "Link to this Equation")

The midpoint state must also lie on the cubic obtained by integrating the quadratic derivative. Integration only to $\tau=\tfrac12$ gives

<a id="v5zU6BuEqz"></a>

$$
\mathbf{x}_{k+\frac12}
=\mathbf{x}_k+\frac{h_k}{24}
\left(5\mathbf{f}_k+8\mathbf{f}_{k+\frac12}-\mathbf{f}_{k+1}\right).
$$

[(73)](#v5zU6BuEqz "Link to this Equation")

This form still contains the midpoint slope. The endpoint defect gives

<a id="pl2IdhXEW8"></a>

$$
4\mathbf{f}_{k+\frac12}
=\frac{6}{h_k}(\mathbf{x}_{k+1}-\mathbf{x}_k)-\mathbf{f}_k-\mathbf{f}_{k+1}.
$$

[(74)](#pl2IdhXEW8 "Link to this Equation")

Substituting this expression into the midpoint equation and collecting the endpoint states and slopes yields

<a id="z6LMji28Ie"></a>

$$
\boxed{
\mathbf{x}_{k+\frac12}
=\frac{\mathbf{x}_k+\mathbf{x}_{k+1}}{2}
+\frac{h_k}{8}\left(\mathbf{f}_k-\mathbf{f}_{k+1}\right).
}
$$

[(75)](#z6LMji28Ie "Link to this Equation")

The midpoint state relation and the definition of $\mathbf{f}_{k+\frac12}$ together enforce the ODE at the midpoint. The resulting state interpolant is cubic because it integrates a quadratic derivative. The name reflects its two ingredients: the state is a cubic Hermite interpolant determined by state and slope information, and its endpoint defect uses Simpson weights.

<a id="the-complete-hermite-simpson-nlp"></a>

### The complete Hermite--Simpson NLP

With linear controls, optimize mesh states, mesh controls, and midpoint states. For $q=k$ or $k+\tfrac12$, abbreviate $\mathbf f_q=\mathbf f(\mathbf x_q,\mathbf u_q,t_q)$ and $c_q^{\mathrm{rate}}=c(\mathbf x_q,\mathbf u_q,t_q)$, with $t_{k+\frac12}=t_k+h_k/2$ and the midpoint control given by the endpoint average. The complete program is

<a id="Rjg7LRdYLG"></a>

$$
\begin{aligned}
\min_{\{\mathbf x_k,\mathbf u_k\}_{k=0}^{N},\,
\{\mathbf x_{k+\frac12}\}_{k=0}^{N-1}}\quad
&c_f(\mathbf x_N,t_N)
+\sum_{k=0}^{N-1}\frac{h_k}{6}
\left(c_k^{\mathrm{rate}}+4c_{k+\frac12}^{\mathrm{rate}}+c_{k+1}^{\mathrm{rate}}\right)\\
\text{subject to}\quad
&\mathbf x_{k+1}-\mathbf x_k
-\frac{h_k}{6}(\mathbf f_k+4\mathbf f_{k+\frac12}+\mathbf f_{k+1})=\mathbf0,\\
&\mathbf x_{k+\frac12}-\frac{\mathbf x_k+\mathbf x_{k+1}}{2}
-\frac{h_k}{8}(\mathbf f_k-\mathbf f_{k+1})=\mathbf0,
\quad k=0,\ldots,N-1,\\
&\mathbf g(\mathbf x_q,\mathbf u_q,t_q)\leq\mathbf0,
\quad q\in\{0,\tfrac12,1,\tfrac32,\ldots,N\},\\
&\mathbf h(\mathbf x_0,\mathbf x_N,t_N)=\mathbf0.
\end{aligned}
$$

[(76)](#Rjg7LRdYLG "Link to this Equation")

An alternative is to optimize the midpoint control independently. The three control values then define a quadratic on each interval; the midpoint-average relation is removed, and $\mathbf u_{k+\frac12}$ joins the decision vector. The two state equations and Simpson cost weights remain the same. This changes the admissible controls, so it can change the optimizer’s solution.

The resulting representations can be compared directly. All degrees are upper bounds on each interval; they are not claims about convergence order.

| Scheme used here | State degree | Control degree | Independent values beyond mesh states |
| --- | --- | --- | --- |
| Explicit or implicit Euler | 1 | 0 | One control per interval |
| Trapezoidal | 2 | 1 | Shared endpoint controls |
| Hermite--Simpson, linear control | 3 | 1 | Shared endpoint controls and midpoint states |
| Hermite--Simpson, quadratic control | 3 | 2 | Shared endpoint controls, midpoint states, and midpoint controls |

<a id="constructing-a-scheme-from-its-nodes"></a>

## Constructing a Scheme from Its Nodes

How can a program generate these transcriptions from node choices without hand-deriving a new set of defect equations each time?

The same construction generates every scheme in the preceding table. Its inputs are the collocation nodes, the control support nodes, and a choice about control continuity. The number of collocation nodes determines the degree of the slope interpolant and hence the state polynomial. The control support nodes determine the control polynomial independently.

This recipe covers polynomial collocation obtained by interpolating slopes at distinct nodes and integrating them. It includes Gauss, Radau, and Lobatto collocation as well as the low-order examples. An arbitrary Runge--Kutta tableau need not come from such nodes, so specifying nodes does not generate every possible integration method.

The first recipe uses the integration form. Its differentiation-form counterpart in [Constructing the differentiation form from its nodes](#sec-collocation-differentiation-from-nodes) also takes state-support nodes as input, because it stores values of the state polynomial rather than constructing that polynomial from its slopes.

<a id="alg-collocation-from-nodes"></a>

[Algorithm 1](#alg-collocation-from-nodes "Link to this Algorithm") (Assemble an integration-form collocation NLP)

**Input:** A mesh $t_0<\cdots<t_N$; dynamics $\mathbf f$, running cost $c$, terminal cost $c_f$, boundary equalities $\mathbf h$, and path inequalities $\mathbf g$; distinct collocation nodes $\tau_1,\ldots,\tau_s$ and control support nodes $\rho_0,\ldots,\rho_{d_u}$ in $[0,1]$. Specify whether controls must be continuous across intervals.

**Output:** A finite decision vector $\mathbf z$, objective $F(\mathbf z)$, inequalities $G(\mathbf z)\leq\mathbf0$, and equalities $H(\mathbf z)=\mathbf0$.

1.  **Compute the rule once.** Construct the cardinal polynomials $\ell_j$ for the collocation nodes and $\psi_r$ for the control support nodes. Integrate and evaluate them to obtain
    
    <a id="yNLdD3hzyF"></a>
    
    $$
    A_{ij}=\int_0^{\tau_i}\ell_j(\tau)\,d\tau,\qquad
       b_j=\int_0^1\ell_j(\tau)\,d\tau,\qquad
       B_{jr}=\psi_r(\tau_j).
    $$
    
    [(77)](#yNLdD3hzyF "Link to this Equation")
    
2.  **Allocate variables.** Create mesh states $\mathbf x_k$, stage states $\mathbf x_{k,j}$, and control support values $\widehat{\mathbf u}_{k,r}$. Initialize $F=c_f(\mathbf x_N,t_N)$, append the boundary residual $\mathbf h(\mathbf x_0,\mathbf x_N,t_N)$ to $H$, and initialize $G$ empty.
    
3.  **Assemble each interval.** For $k=0,\ldots,N-1$, set $h_k=t_{k+1}-t_k$ and compute the expressions
    
    <a id="zKGm2atYLv"></a>
    
    $$
    \begin{aligned}
       \mathbf u_{k,j}&=\sum_rB_{jr}\widehat{\mathbf u}_{k,r},\\
       \mathbf f_{k,j}&=\mathbf f(\mathbf x_{k,j},\mathbf u_{k,j},t_k+h_k\tau_j),\\
       c_{k,j}&=c(\mathbf x_{k,j},\mathbf u_{k,j},t_k+h_k\tau_j).
       \end{aligned}
    $$
    
    [(78)](#zKGm2atYLv "Link to this Equation")
    
    Add $h_k\sum_jb_jc_{k,j}$ to $F$. Append to $H$ the stage and endpoint residuals
    
    <a id="HhbobWiI22"></a>
    
    $$
    \mathbf x_{k,i}-\mathbf x_k-h_k\sum_jA_{ij}\mathbf f_{k,j},
       \qquad
       \mathbf x_{k+1}-\mathbf x_k-h_k\sum_jb_j\mathbf f_{k,j}.
    $$
    
    [(79)](#HhbobWiI22 "Link to this Equation")
    
    Append $\mathbf g(\mathbf x_{k,j},\mathbf u_{k,j},t_k+h_k\tau_j)$ to $G$ at every stage. Append any additional sampled constraints or variable bounds required by the model.
    
4.  **Connect controls if required.** Either share endpoint control variables or append the equality between the right control value of piece $k$ and the left control value of piece $k+1$. Mesh states are already shared.
    
5.  **Solve and reconstruct.** Pass $F,G,H$ and their derivatives to an NLP solver. Recover each state piece by integrating its slope interpolant from $\mathbf x_k$, and recover each control piece from its support values. Check the ODE residual and constraints between nodes; refine the mesh or degree where needed and solve again.
    

The stage controls, slopes, and cost rates in step 3 are expressions in the decision variables. They are recomputed as the optimizer changes those variables; $A,b,B$ remain fixed. Automatic differentiation can supply the derivatives of the assembled expressions. If endpoint stages are retained as separate variables, the stage and endpoint equations connect them to the mesh states. Eliminating those copies produces the smaller low-order programs above; keeping both the copies and their defining equations is also valid. Identifying a copy with its endpoint requires removing the resulting duplicate or identically zero equation.

The demo [Direct Collocation for a Pendulum Swing-Up](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md#step-1-compute-the-rule-once) carries out these five steps for a nonlinear problem with the two-stage Radau nodes. It computes $A$ and $b$ by hand, reproduces them in code, assembles $F$ and $H$, solves the resulting NLP with SciPy, and checks the answer by simulation. Each step is accompanied by the corresponding lines of Python.

<a id="sec-collocation-coefficient-generator"></a>

### A reusable coefficient generator and residual evaluator

The [full Python source on GitHub](https://github.com/pierrelux/rlbook/blob/main/code/collocation_transcription.py) contains the coefficient generator and NLP residual evaluator. Its integration step uses closed-form polynomial calculus, rather than a numerical quadrature routine that samples a function to estimate its integral. To see what the code computes, return to the third slope basis function for nodes $(0,\tfrac12,1)$ in [Figure 9](#fig-collocation-destination-and-slopes):

<a id="HxfYH92h17"></a>

$$
\ell_3(\tau)=2\tau^2-\tau.
$$

[(80)](#HxfYH92h17 "Link to this Equation")

Integrating a term $a\tau^m$ increases its exponent by one and divides its coefficient by that new exponent. Applying this rule to both terms gives an antiderivative

<a id="Juo7IKtktT"></a>

$$
L_3(\tau)=\frac23\tau^3-\frac12\tau^2.
$$

[(81)](#Juo7IKtktT "Link to this Equation")

Differentiating $L_3$ returns $\ell_3$. We have chosen the integration constant to be zero; any other constant would cancel when evaluating a definite integral. The fundamental theorem of calculus now supplies both the full-interval weight and the midpoint weight:

<a id="vFQSvLT1RZ"></a>

$$
\begin{aligned}
b_3
&=L_3(1)-L_3(0)=\frac23-\frac12=\frac16,\\
A_{23}
&=L_3(\tfrac12)-L_3(0)=\frac1{12}-\frac18=-\frac1{24}.
\end{aligned}
$$

[(82)](#vFQSvLT1RZ "Link to this Equation")

Only the upper limit changes between these calculations. The negative midpoint weight agrees with the signed area under $\ell_3$ in the figure. Thus computing either weight requires an antiderivative and two polynomial evaluations, without approximating the area by small time steps.

The implementation represents a polynomial by its coefficients in increasing order of power. For $\ell_3$, the array is $[0,-1,2]$: the entries multiply $1,\tau,\tau^2$. Integration and differentiation transform this array into the coefficient arrays of new polynomials:

<a id="e6MUrf3JEp"></a>

$$
\begin{aligned}
[0,-1,2]&\xrightarrow{\text{integrate}}
[0,0,-\tfrac12,\tfrac23],\\
[0,-1,2]&\xrightarrow{\text{differentiate}}[-1,4].
\end{aligned}
$$

[(83)](#e6MUrf3JEp "Link to this Equation")

The first result represents $L_3$; the second represents $\ell_3'(\tau)=4\tau-1$. More generally, integrating a coefficient array $[a_0,a_1,\ldots,a_d]$ produces $[C,a_0,a_1/2,\ldots,a_d/(d+1)]$, where $C$ is the integration constant. Differentiating it produces $[a_1,2a_2,\ldots,d a_d]$. These operations require only arithmetic on the stored coefficients, not a symbolic algebra system. NumPy’s [polynomial integration](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.integ.html) method implements the antiderivative operation:

```python
from numpy.polynomial import Polynomial

ell3 = Polynomial([0, -1, 2])  # 2*tau**2 - tau
L3 = ell3.integ()             # (2/3)*tau**3 - (1/2)*tau**2
dell3 = ell3.deriv()          # 4*tau - 1

b3 = L3(1.0) - L3(0.0)       # 1/6, up to floating-point error
A23 = L3(0.5) - L3(0.0)      # -1/24, up to floating-point error
```

The generator below applies this procedure to every slope basis function. It first constructs each cardinal polynomial by multiplying its linear factors. Calling `.integ()` then constructs its antiderivative; evaluating that polynomial at the stage nodes and subtracting its value at zero supplies a column of $A$. Evaluation at 1 supplies the corresponding entry of $b$. Direct evaluation of the control basis functions supplies $B$. The same coefficient differentiation rule, followed by evaluation at the collocation nodes, constructs $D$ from the state basis in the differentiation form. It does not estimate a derivative using a small finite-difference step.

These calculations occur once for the chosen node sets. During an NLP evaluation, the current states and controls supply new slopes $\mathbf f_{k,j}$, but the coefficients stay fixed. At that point, “integrating the interpolated slopes” means computing the weighted sums $h_k\sum_j A_{ij}\mathbf f_{k,j}$ or $h_k\sum_j b_j\mathbf f_{k,j}$. The polynomial integral is exact in exact arithmetic; floating-point computation introduces roundoff, and replacing the nonlinear ODE by a slope interpolant still introduces a separate discretization error. Closed-form integration of the interpolant does not give a closed-form solution of the original ODE.

The following function computes $A,b,B$ for any distinct collocation and control support nodes:

collocation\_transcription.py

```python
def make_rule(nodes, control_nodes):
    """Precompute integration weights and control evaluation weights.

    A[i,j] = integral from 0 to nodes[i] of slope basis j.
    b[j] = integral from 0 to 1 of slope basis j.
    B[j,r] = control basis r evaluated at collocation node j.
    """
    slope_basis = cardinal_polynomials(nodes)
    control_basis = cardinal_polynomials(control_nodes)
    nodes = np.asarray(nodes, dtype=float)
    antiderivatives = [polynomial.integ() for polynomial in slope_basis]
    A = np.column_stack([p(nodes) - p(0.0) for p in antiderivatives])
    b = np.array([p(1.0) - p(0.0) for p in antiderivatives])
    B = np.column_stack([p(nodes) for p in control_basis])
    return CollocationRule(
        nodes=nodes,
        control_nodes=np.asarray(control_nodes, dtype=float),
        A=A,
        b=b,
        B=B,
        control_left=np.array([p(0.0) for p in control_basis]),
        control_right=np.array([p(1.0) for p in control_basis]),
    )
```

For example, the choices below recover the four low-order constructions:

```python
from collocation_transcription import make_rule

explicit_euler = make_rule([0.0], [0.0])
implicit_euler = make_rule([1.0], [0.0])
trapezoidal = make_rule([0.0, 1.0], [0.0, 1.0])
hermite_simpson = make_rule([0.0, 0.5, 1.0], [0.0, 1.0])
# An independent midpoint control changes B, not A or b:
hermite_simpson_quadratic_u = make_rule([0.0, 0.5, 1.0], [0.0, 0.5, 1.0])
```

The implicit-Euler control support node can be 0 even though its collocation node is 1: a constant polynomial has the same value at both. For Hermite--Simpson with linear controls, the generated arrays are

<a id="gIAwjrcyGz"></a>

$$
A=\begin{bmatrix}
0&0&0\\
5/24&1/3&-1/24\\
1/6&2/3&1/6
\end{bmatrix},\qquad
b=\begin{bmatrix}1/6\\2/3\\1/6\end{bmatrix},\qquad
B=\begin{bmatrix}1&0\\1/2&1/2\\0&1\end{bmatrix}.
$$

[(84)](#gIAwjrcyGz "Link to this Equation")

The middle row of $A$ gives the midpoint stage equation before elimination; the middle row of $B$ gives the endpoint-average control. Supplying three control support nodes instead makes $B$ the identity, allowing an independent midpoint control while leaving the state construction unchanged. The [experiments of the pendulum demo](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md#experiments) change the collocation nodes in the same way and compare the accuracy of the resulting schemes on a nonlinear problem.

The same file’s [residual evaluator](https://github.com/pierrelux/rlbook/blob/main/code/collocation_transcription.py#L68), `transcribed_problem`, evaluates $F,G,H$ from arrays of mesh states, stage states, and control support values. Its default allows control jumps; `continuous_control=True` adds the endpoint-matching equations used by the linear-control examples. A solver wrapper flattens these arrays into $\mathbf z$ and reshapes each candidate before evaluation. The NumPy evaluator can be used with finite differences; an automatic-differentiation implementation uses the same array operations in its chosen backend. The returned inequality residuals use $G\leq0$; negate them for a solver interface that expects nonnegative residuals.

[Download the coefficient generator and NLP evaluator](https://pierrelucbacon.com/rlbook/build/collocation_transcri-35f8bf800bdec3f19fd6086163b524a9.py)

Explicit polynomial coefficients keep this implementation readable at modest degrees. At high degrees, use numerically stable basis evaluation and integration routines; the NLP assembly remains the same.

<a id="sec-collocation-differentiation-from-nodes"></a>

### Constructing the differentiation form from its nodes

Both recipes retain collocation nodes where the reconstructed state must satisfy the ODE. The integration-form recipe interpolates evaluated stage slopes and integrates them; its residuals then match the resulting state values to the stored stage states. The differentiation form interpolates stored state-support values and evaluates the stage states on that curve; its residuals then match the curve’s derivatives to the ODE slopes. Choosing a form therefore changes the representation and residuals, not whether the scheme has collocation nodes.

For a concrete example, retain the trapezoidal rule’s two collocation nodes $\tau_1=0$ and $\tau_2=1$. Its slope interpolant is linear, so its state polynomial is quadratic. Storing only the two endpoint states and linearly interpolating between them would give a constant derivative. Enforcing that derivative at both endpoints would require the two ODE slopes to be equal, which the trapezoidal rule does not require. To represent the same quadratic as the integration form, choose three state-support nodes, for example $\sigma=(0,\tfrac12,1)$.

The cardinal polynomials for these support nodes are $2\tau^2-3\tau+1$, $4\tau-4\tau^2$, and $2\tau^2-\tau$. Evaluating them and their derivatives at the two collocation nodes gives

<a id="Kgt2teZ7o2"></a>

$$
E=\begin{bmatrix}1&0&0\\0&0&1\end{bmatrix},
\qquad
D=\begin{bmatrix}-3&4&-1\\1&-4&3\end{bmatrix}.
$$

[(85)](#Kgt2teZ7o2 "Link to this Equation")

There are three columns because each polynomial operation uses three support values, but only two rows because the ODE is enforced at two collocation nodes. Identify the endpoint support values with $\mathbf x_k$ and $\mathbf x_{k+1}$, and call the midpoint support value $\widehat{\mathbf x}_{k,1}$. The two differentiation constraints are

<a id="trcXwZ2gxX"></a>

$$
\begin{aligned}
-3\mathbf x_k+4\widehat{\mathbf x}_{k,1}-\mathbf x_{k+1}
&=h_k\mathbf f_{k,1},\\
\mathbf x_k-4\widehat{\mathbf x}_{k,1}+3\mathbf x_{k+1}
&=h_k\mathbf f_{k,2}.
\end{aligned}
$$

[(86)](#trcXwZ2gxX "Link to this Equation")

The slopes on the right are evaluated at the left and right endpoints, respectively. Adding the equations eliminates the midpoint support value. Dividing by two recovers the trapezoidal endpoint constraint:

<a id="o8i2rPWolk"></a>

$$
\mathbf x_{k+1}-\mathbf x_k
=\frac{h_k}{2}(\mathbf f_{k,1}+\mathbf f_{k,2}).
$$

[(87)](#o8i2rPWolk "Link to this Equation")

Substituting this relation into either differentiation constraint also determines the midpoint support value:

<a id="tdSP2ZRp1B"></a>

$$
\widehat{\mathbf x}_{k,1}
=\frac{\mathbf x_k+\mathbf x_{k+1}}{2}
+\frac{h_k}{8}(\mathbf f_{k,1}-\mathbf f_{k,2}).
$$

[(88)](#tdSP2ZRp1B "Link to this Equation")

The midpoint value records the curvature of the quadratic. Storing it does not add an ODE constraint at the midpoint. A support node specifies where a polynomial value is stored; a collocation node specifies where its derivative must match the dynamics.

The same degree count applies to any number of stages. With $s$ distinct collocation nodes, the integration form constructs a state polynomial of degree at most $s$. Its differentiation-form counterpart therefore uses $s+1$ distinct state-support nodes $\sigma_0,\ldots,\sigma_s$. They need not coincide with the collocation nodes or include the interval endpoints. Changing these support locations changes the coordinates used to describe the polynomial, not the polynomial space. Control support nodes still specify a separate polynomial and can be chosen independently.

<a id="alg-collocation-differentiation-from-nodes"></a>

[Algorithm 2](#alg-collocation-differentiation-from-nodes "Link to this Algorithm") (Assemble a differentiation-form collocation NLP)

**Input:** A mesh $t_0<\cdots<t_N$; dynamics $\mathbf f$, costs $c,c_f$, boundary equalities $\mathbf h$, and path inequalities $\mathbf g$; collocation nodes $\tau_1,\ldots,\tau_s$, state-support nodes $\sigma_0,\ldots,\sigma_s$, and control-support nodes $\rho_0,\ldots,\rho_{d_u}$ in $[0,1]$, distinct within each set. Specify whether controls must be continuous across intervals.

**Output:** A decision vector $\mathbf z$ and functions $F(\mathbf z)$, $G(\mathbf z)\leq\mathbf0$, and $H(\mathbf z)=\mathbf0$.

1.  **Compute the operators once.** Construct the cardinal polynomials $\ell_r^{\mathrm{state}}$ for the state-support nodes, $\ell_i$ for the collocation nodes, and $\psi_q$ for the control-support nodes. Form
    
    <a id="iSbxHSnZdg"></a>
    
    $$
    \begin{aligned}
       E_{ir}&=\ell_r^{\mathrm{state}}(\tau_i),&
       D_{ir}&=(\ell_r^{\mathrm{state}})'(\tau_i),\\
       e^L_r&=\ell_r^{\mathrm{state}}(0),&
       e^R_r&=\ell_r^{\mathrm{state}}(1),\\
       B_{iq}&=\psi_q(\tau_i),&
       b_i&=\int_0^1\ell_i(\tau)\,d\tau.
       \end{aligned}
    $$
    
    [(89)](#iSbxHSnZdg "Link to this Equation")
    
    Here $i=1,\ldots,s$, $r=0,\ldots,s$, and $q=0,\ldots,d_u$. The vectors $e^L,e^R$ evaluate the state polynomial at its left and right endpoints. Both $E$ and $D$ have shape $s\times(s+1)$.
    
2.  **Allocate variables.** Create shared mesh states $\mathbf x_k$, state-support values $\widehat{\mathbf x}_{k,r}$, and control-support values $\widehat{\mathbf u}_{k,q}$. Do not allocate separate stage states: they will be evaluated from the support values. Initialize $F=c_f(\mathbf x_N,t_N)$, append $\mathbf h(\mathbf x_0,\mathbf x_N,t_N)$ to $H$, and initialize $G$ empty.
    
3.  **Assemble each interval.** For every $k=0,\ldots,N-1$, set $h_k=t_{k+1}-t_k$. At every stage $i=1,\ldots,s$, compute
    
    <a id="ulmccSfgtJ"></a>
    
    $$
    \begin{aligned}
       \mathbf x_{k,i}&=\sum_{r=0}^{s}E_{ir}\widehat{\mathbf x}_{k,r},\\
       \mathbf u_{k,i}&=\sum_{q=0}^{d_u}B_{iq}\widehat{\mathbf u}_{k,q},\\
       \mathbf f_{k,i}&=\mathbf f(\mathbf x_{k,i},\mathbf u_{k,i},t_k+h_k\tau_i),\\
       c_{k,i}&=c(\mathbf x_{k,i},\mathbf u_{k,i},t_k+h_k\tau_i).
       \end{aligned}
    $$
    
    [(90)](#ulmccSfgtJ "Link to this Equation")
    
    Append the slope residuals to $H$:
    
    <a id="U1PYaSRh4B"></a>
    
    $$
    \sum_{r=0}^{s}D_{ir}\widehat{\mathbf x}_{k,r}
       -h_k\mathbf f_{k,i},\qquad i=1,\ldots,s.
    $$
    
    [(91)](#U1PYaSRh4B "Link to this Equation")
    
    Append the two endpoint residuals to connect the polynomial to the mesh:
    
    <a id="DzOapxeKvK"></a>
    
    $$
    \sum_{r=0}^{s}e^L_r\widehat{\mathbf x}_{k,r}-\mathbf x_k,
       \qquad
       \sum_{r=0}^{s}e^R_r\widehat{\mathbf x}_{k,r}-\mathbf x_{k+1}.
    $$
    
    [(92)](#DzOapxeKvK "Link to this Equation")
    
    Add $h_k\sum_{i=1}^{s}b_i c_{k,i}$ to $F$. Append $\mathbf g(\mathbf x_{k,i},\mathbf u_{k,i},t_k+h_k\tau_i)$ to $G$ at every stage, together with any additional sampled constraints or variable bounds required by the model.
    
4.  **Connect controls if required.** Share endpoint control variables, or equate the right endpoint evaluation of each control polynomial with the left endpoint evaluation of the next. The shared mesh states and the endpoint equations in step 3 already connect the state polynomials across intervals.
    
5.  **Solve and reconstruct.** Pass $F,G,H$ and their derivatives to an NLP solver. Reconstruct the state directly as $\mathbf p_k(\tau)=\sum_{r=0}^{s}\widehat{\mathbf x}_{k,r}
    \ell_r^{\mathrm{state}}(\tau)$, and reconstruct the control from its support values. Check between-node residuals and a separate continuous replay as in [Checking the continuous trajectory](#sec-collocation-validation); refine and solve again if needed.
    

The factor $h_k$ in the slope residual converts the ODE’s physical-time rate to a local-time derivative, as in [Figure 12](#fig-collocation-evaluation-differentiation). The arrays are computed for $\tau\in[0,1]$, so the same arrays work on intervals of different lengths. Mesh refinement changes the interval lengths and variables, but does not require new arrays unless the local node sets change. The last section of the pendulum demo, [The Same Construction with Derivatives](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md#the-same-construction-with-derivatives), carries out this algorithm with the two-stage Radau nodes and shows that it returns the same trajectory as the integration form.

This algorithm keeps mesh states and support states as separate variables and connects them by equations. If a support node is an endpoint, its value can instead be identified with the corresponding mesh state, as in the quadratic example. Then omit its endpoint equality: after identification, that equality would only say $\mathbf x_k-\mathbf x_k=\mathbf0$. If neither endpoint is a support node, retain both endpoint evaluations.

Differentiating the state does not remove integration from the objective. The running cost is still sampled at the $s$ collocation nodes and integrated with the same weights $b$ as in the integration form. Those weights integrate the collocation-node basis $\ell_i$, not the state-support basis $\ell_r^{\mathrm{state}}$. For the quadratic example, the cost contribution is the trapezoidal expression $h_k(c_{k,1}+c_{k,2})/2$, even though three values represent the state.

<a id="equivalence-with-the-integration-construction"></a>

#### Equivalence with the integration construction

At a feasible point, the differentiation constraints specify the values of $\mathbf p_k'$ at all $s$ collocation nodes. Because this derivative has degree at most $s-1$, its values at those nodes determine it everywhere:

<a id="LreBWvBoen"></a>

$$
\mathbf p_k'(\tau)=h_k\sum_{j=1}^{s}\mathbf f_{k,j}\ell_j(\tau),
\qquad \forall\tau\in[0,1].
$$

[(93)](#LreBWvBoen "Link to this Equation")

The left endpoint equation supplies $\mathbf p_k(0)=\mathbf x_k$. Applying the fundamental theorem of calculus therefore gives

<a id="t3lnRd0Stv"></a>

$$
\mathbf p_k(\tau)=\mathbf x_k
+h_k\sum_{j=1}^{s}\mathbf f_{k,j}\int_0^\tau\ell_j(\xi)\,d\xi,
\qquad \forall\tau\in[0,1].
$$

[(94)](#t3lnRd0Stv "Link to this Equation")

Evaluation at $\tau_i$ recovers the integration form’s stage equation; evaluation at 1, together with the right endpoint equation, recovers its endpoint defect. No additional integral defect is needed in the differentiation-form NLP. Conversely, the state polynomial constructed by the integration form has these nodal derivatives and can be represented by its values at any $s+1$ distinct state-support nodes.

Thus the two formulations describe the same feasible polynomial trajectories when they use the same collocation nodes, degree, and control space. Using the same cost weights and constraint-sampling points also gives the same discrete objective and path constraints. Their decision arrays and residuals differ, so their numerical conditioning need not be identical.

<a id="a-differentiation-form-coefficient-generator-and-residual-evaluator"></a>

#### A differentiation-form coefficient generator and residual evaluator

Constructing $D$ uses the coefficient differentiation introduced in [A reusable coefficient generator and residual evaluator](#sec-collocation-coefficient-generator). For example, the first state basis function in the quadratic example is $\ell_0^{\mathrm{state}}(\tau)=1-3\tau+2\tau^2$. Differentiation transforms its coefficient array $[1,-3,2]$ into $[-3,4]$. Evaluating the resulting polynomial $-3+4\tau$ at $(0,1)$ gives $(-3,1)$, the first column of $D$. NumPy’s [polynomial derivative method](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.deriv.html) performs this coefficient transformation. No small time increment or finite-difference estimate is involved.

The following generator uses the same `cardinal_polynomials` helper as `make_rule`. It evaluates each state basis function to form a column of $E$, and evaluates its derivative to form the corresponding column of $D$. It integrates the collocation-node basis only to obtain the cost weights:

collocation\_transcription.py

```python
def make_differentiation_rule(nodes, state_nodes, control_nodes):
    """Precompute the state-value form of a polynomial collocation rule.

    With s collocation nodes, use s+1 state nodes for a degree-s state.
    E[i,r] = state basis r evaluated at collocation node i.
    D[i,r] = its derivative with respect to local time, evaluated at node i.
    b integrates cost rates at collocation nodes, not state-support nodes.
    """
    state_basis = cardinal_polynomials(state_nodes)
    cost_basis = cardinal_polynomials(nodes)
    control_basis = cardinal_polynomials(control_nodes)
    nodes = np.asarray(nodes, dtype=float)
    if len(state_basis) != len(nodes) + 1:
        raise ValueError("s collocation nodes require s+1 state-support nodes")
    E = np.column_stack([p(nodes) for p in state_basis])
    D = np.column_stack([p.deriv()(nodes) for p in state_basis])
    antiderivatives = [p.integ() for p in cost_basis]
    b = np.array([p(1.0) - p(0.0) for p in antiderivatives])
    B = np.column_stack([p(nodes) for p in control_basis])
    return DifferentiationRule(
        nodes=nodes,
        state_nodes=np.asarray(state_nodes, dtype=float),
        control_nodes=np.asarray(control_nodes, dtype=float),
        E=E, D=D,
        state_left=np.array([p(0.0) for p in state_basis]),
        state_right=np.array([p(1.0) for p in state_basis]),
        b=b, B=B,
        control_left=np.array([p(0.0) for p in control_basis]),
        control_right=np.array([p(1.0) for p in control_basis]),
    )
```

The four low-order schemes can now be generated in differentiation form:

```python
from collocation_transcription import make_differentiation_rule

explicit_euler = make_differentiation_rule([0], [0, 1], [0])
implicit_euler = make_differentiation_rule([1], [0, 1], [0])
trapezoidal = make_differentiation_rule([0, 1], [0, 0.5, 1], [0, 1])
hermite_simpson = make_differentiation_rule(
    [0, 0.5, 1], [0, 1/3, 2/3, 1], [0, 1]
)
```

The argument order is collocation nodes, state-support nodes, and control-support nodes. In the Hermite--Simpson call, four state-support values represent a cubic. The midpoint stage state is evaluated by $E$ from those values, since $1/2$ is not a state-support node in this choice. Using only the three collocation nodes as state supports would restrict the state to a quadratic and would not reproduce the same method.

The fundamental theorem of calculus also supplies checks on the fixed arrays, before any dynamics function or NLP solver is involved. Subtracting the left endpoint evaluation from each row of $E$ must give the same operator as integrating the derivative with $A$. Similarly, the difference of endpoint evaluations must equal full-interval integration with $b$:

```python
import numpy as np
from collocation_transcription import make_rule

rule = hermite_simpson
integral = make_rule(rule.nodes, rule.control_nodes)
np.testing.assert_allclose(
    rule.E - rule.state_left, integral.A @ rule.D, atol=1e-12
)
np.testing.assert_allclose(
    rule.state_right - rule.state_left, rule.b @ rule.D, atol=1e-12
)
```

In the first check, NumPy subtracts `state_left` from every row of `E`. These identities hold for any degree-$s$ state polynomial, not just one that satisfies the ODE. The tolerances allow for floating-point roundoff in constructing the coefficients.

The residual evaluator `differentiation_problem` takes mesh states with shape $(N+1,n)$, state-support values with shape $(N,s+1,n)$, and control-support values with shape $(N,d_u+1,m)$. For each candidate decision vector, `E @ x_support[k]` supplies the stage states and `D @ x_support[k] - width * slopes` supplies the slope residuals. The two endpoint evaluations connect the polynomial to the mesh states. The cost, boundary, path, and optional control-continuity conventions match `transcribed_problem`.

Inspect the complete module and both residual evaluators

collocation\_transcription.py

```python
"""Construct polynomial collocation rules and evaluate their finite NLP.

The routines use explicit polynomial coefficients for teaching and modest
degrees. They do not select a mesh, scale variables, or choose an NLP solver.
"""

from dataclasses import dataclass

import numpy as np
from numpy.polynomial import Polynomial


def cardinal_polynomials(nodes):
    """Return the Lagrange basis for distinct nodes in [0, 1]."""
    nodes = np.asarray(nodes, dtype=float)
    if nodes.ndim != 1 or nodes.size == 0:
        raise ValueError("nodes must be a nonempty one-dimensional array")
    if not np.all(np.isfinite(nodes)) or np.any((nodes < 0) | (nodes > 1)):
        raise ValueError("nodes must be finite and lie in [0, 1]")
    if np.unique(nodes).size != nodes.size:
        raise ValueError("nodes must be distinct")
    basis = []
    for j, node in enumerate(nodes):
        polynomial = Polynomial([1.0])
        for m, other in enumerate(nodes):
            if m != j:
                polynomial *= Polynomial([-other, 1.0]) / (node - other)
        basis.append(polynomial)
    return basis


@dataclass
class CollocationRule:
    nodes: np.ndarray
    control_nodes: np.ndarray
    A: np.ndarray
    b: np.ndarray
    B: np.ndarray
    control_left: np.ndarray
    control_right: np.ndarray


def make_rule(nodes, control_nodes):
    """Precompute integration weights and control evaluation weights.

    A[i,j] = integral from 0 to nodes[i] of slope basis j.
    b[j] = integral from 0 to 1 of slope basis j.
    B[j,r] = control basis r evaluated at collocation node j.
    """
    slope_basis = cardinal_polynomials(nodes)
    control_basis = cardinal_polynomials(control_nodes)
    nodes = np.asarray(nodes, dtype=float)
    antiderivatives = [polynomial.integ() for polynomial in slope_basis]
    A = np.column_stack([p(nodes) - p(0.0) for p in antiderivatives])
    b = np.array([p(1.0) - p(0.0) for p in antiderivatives])
    B = np.column_stack([p(nodes) for p in control_basis])
    return CollocationRule(
        nodes=nodes,
        control_nodes=np.asarray(control_nodes, dtype=float),
        A=A,
        b=b,
        B=B,
        control_left=np.array([p(0.0) for p in control_basis]),
        control_right=np.array([p(1.0) for p in control_basis]),
    )


def transcribed_problem(
    rule, mesh, x_mesh, x_stage, u_support,
    dynamics, running_cost, terminal_cost, boundary, path=None,
    *, continuous_control=False,
):
    """Return objective F, inequalities G <= 0, and equalities H = 0.

    x_mesh: (N+1, n); x_stage: (N, s, n); u_support: (N, d_u+1, m).
    dynamics(x,u,t) returns n slopes; running_cost(x,u,t) returns a scalar.
    terminal_cost(x_final,t_final) returns a scalar.
    boundary(x_initial,x_final,t_final) returns equality residuals, including
    the prescribed initial condition. path(x,u,t), if supplied, returns
    inequality residuals sampled at the collocation stages only.
    """
    mesh = np.asarray(mesh, dtype=float)
    x_mesh, x_stage, u_support = map(
        lambda a: np.asarray(a, dtype=float), (x_mesh, x_stage, u_support)
    )
    if mesh.ndim != 1 or len(mesh) < 2 or not np.all(np.isfinite(mesh)):
        raise ValueError("mesh must be a finite one-dimensional array")
    widths = np.diff(mesh)
    if np.any(widths <= 0):
        raise ValueError("mesh times must be strictly increasing")
    N, s, r = len(widths), len(rule.nodes), len(rule.control_nodes)
    if x_mesh.ndim != 2 or x_mesh.shape[0] != N + 1:
        raise ValueError("x_mesh must have shape (N+1, n)")
    if x_stage.shape != (N, s, x_mesh.shape[1]):
        raise ValueError("x_stage must have shape (N, s, n)")
    if u_support.ndim != 3 or u_support.shape[:2] != (N, r):
        raise ValueError("u_support must have shape (N, d_u+1, m)")

    objective = float(terminal_cost(x_mesh[-1], mesh[-1]))
    equalities = [np.asarray(boundary(x_mesh[0], x_mesh[-1], mesh[-1])).ravel()]
    inequalities = []
    for k, width in enumerate(widths):
        stage_times = mesh[k] + width * rule.nodes
        stage_controls = rule.B @ u_support[k]
        slopes = np.stack([
            dynamics(x, u, t)
            for x, u, t in zip(x_stage[k], stage_controls, stage_times)
        ])
        rates = np.array([
            running_cost(x, u, t)
            for x, u, t in zip(x_stage[k], stage_controls, stage_times)
        ])
        equalities.append((x_stage[k] - x_mesh[k] - width * rule.A @ slopes).ravel())
        equalities.append(x_mesh[k + 1] - x_mesh[k] - width * rule.b @ slopes)
        objective += width * rule.b @ rates
        if path is not None:
            inequalities.extend(
                np.asarray(path(x, u, t)).ravel()
                for x, u, t in zip(x_stage[k], stage_controls, stage_times)
            )
        if continuous_control and k + 1 < N:
            equalities.append(
                rule.control_right @ u_support[k]
                - rule.control_left @ u_support[k + 1]
            )
    G = np.concatenate(inequalities) if inequalities else np.empty(0)
    return float(objective), G, np.concatenate(equalities)


@dataclass
class DifferentiationRule:
    nodes: np.ndarray
    state_nodes: np.ndarray
    control_nodes: np.ndarray
    E: np.ndarray
    D: np.ndarray
    state_left: np.ndarray
    state_right: np.ndarray
    b: np.ndarray
    B: np.ndarray
    control_left: np.ndarray
    control_right: np.ndarray


def make_differentiation_rule(nodes, state_nodes, control_nodes):
    """Precompute the state-value form of a polynomial collocation rule.

    With s collocation nodes, use s+1 state nodes for a degree-s state.
    E[i,r] = state basis r evaluated at collocation node i.
    D[i,r] = its derivative with respect to local time, evaluated at node i.
    b integrates cost rates at collocation nodes, not state-support nodes.
    """
    state_basis = cardinal_polynomials(state_nodes)
    cost_basis = cardinal_polynomials(nodes)
    control_basis = cardinal_polynomials(control_nodes)
    nodes = np.asarray(nodes, dtype=float)
    if len(state_basis) != len(nodes) + 1:
        raise ValueError("s collocation nodes require s+1 state-support nodes")
    E = np.column_stack([p(nodes) for p in state_basis])
    D = np.column_stack([p.deriv()(nodes) for p in state_basis])
    antiderivatives = [p.integ() for p in cost_basis]
    b = np.array([p(1.0) - p(0.0) for p in antiderivatives])
    B = np.column_stack([p(nodes) for p in control_basis])
    return DifferentiationRule(
        nodes=nodes,
        state_nodes=np.asarray(state_nodes, dtype=float),
        control_nodes=np.asarray(control_nodes, dtype=float),
        E=E, D=D,
        state_left=np.array([p(0.0) for p in state_basis]),
        state_right=np.array([p(1.0) for p in state_basis]),
        b=b, B=B,
        control_left=np.array([p(0.0) for p in control_basis]),
        control_right=np.array([p(1.0) for p in control_basis]),
    )


def differentiation_problem(
    rule, mesh, x_mesh, x_support, u_support,
    dynamics, running_cost, terminal_cost, boundary, path=None,
    *, continuous_control=False,
):
    """Return F, G <= 0, H = 0 for the state-value formulation.

    x_mesh: (N+1, n); x_support: (N, s+1, n); u_support: (N, d_u+1, m).
    Stage states are computed from x_support, not separate NLP variables.
    This uneliminated form keeps mesh and support states as separate slots
    and connects both polynomial endpoints to the mesh with equalities.
    Callback signatures and the path-sampling convention match
    transcribed_problem. Residual order is boundary, then each interval's
    slope, left endpoint, right endpoint, and optional control continuity.
    """
    mesh = np.asarray(mesh, dtype=float)
    x_mesh, x_support, u_support = map(
        lambda a: np.asarray(a, dtype=float), (x_mesh, x_support, u_support)
    )
    if mesh.ndim != 1 or len(mesh) < 2 or not np.all(np.isfinite(mesh)):
        raise ValueError("mesh must be a finite one-dimensional array")
    widths = np.diff(mesh)
    if np.any(widths <= 0):
        raise ValueError("mesh times must be strictly increasing")
    N, s, r = len(widths), len(rule.nodes), len(rule.control_nodes)
    if x_mesh.ndim != 2 or x_mesh.shape[0] != N + 1:
        raise ValueError("x_mesh must have shape (N+1, n)")
    if x_support.shape != (N, s + 1, x_mesh.shape[1]):
        raise ValueError("x_support must have shape (N, s+1, n)")
    if u_support.ndim != 3 or u_support.shape[:2] != (N, r):
        raise ValueError("u_support must have shape (N, d_u+1, m)")

    objective = float(terminal_cost(x_mesh[-1], mesh[-1]))
    equalities = [np.asarray(boundary(x_mesh[0], x_mesh[-1], mesh[-1])).ravel()]
    inequalities = []
    for k, width in enumerate(widths):
        stage_times = mesh[k] + width * rule.nodes
        stage_states = rule.E @ x_support[k]
        stage_controls = rule.B @ u_support[k]
        slopes = np.stack([
            dynamics(x, u, t)
            for x, u, t in zip(stage_states, stage_controls, stage_times)
        ])
        rates = np.array([
            running_cost(x, u, t)
            for x, u, t in zip(stage_states, stage_controls, stage_times)
        ])
        equalities.append((rule.D @ x_support[k] - width * slopes).ravel())
        equalities.append(rule.state_left @ x_support[k] - x_mesh[k])
        equalities.append(rule.state_right @ x_support[k] - x_mesh[k + 1])
        objective += width * rule.b @ rates
        if path is not None:
            inequalities.extend(
                np.asarray(path(x, u, t)).ravel()
                for x, u, t in zip(stage_states, stage_controls, stage_times)
            )
        if continuous_control and k + 1 < N:
            equalities.append(
                rule.control_right @ u_support[k]
                - rule.control_left @ u_support[k + 1]
            )
    G = np.concatenate(inequalities) if inequalities else np.empty(0)
    return float(objective), G, np.concatenate(equalities)
```

The generator’s `.deriv()` differentiates a known basis polynomial with respect to local time $\tau$. An NLP solver also needs derivatives, but with respect to the decision vector $\mathbf z$: those differentiate the assembled objective and constraints, including the dynamics function. Automatic differentiation can compute the latter in a compatible implementation; it does not replace or change the fixed matrix $D$.

<a id="sec-collocation-validation"></a>

### Checking the continuous trajectory

A small NLP residual confirms that the stored values satisfy the finite constraints. To check the approximation between nodes, first evaluate the state polynomial and its derivative at additional times. On interval $k$, their ODE residual is

<a id="mJVqste5g3"></a>

$$
\mathbf r_k(\tau)=
\frac{1}{h_k}\mathbf p_k'(\tau)
-\mathbf f\!\left(
\mathbf p_k(\tau),\mathbf u_h(t_k+h_k\tau),t_k+h_k\tau
\right).
$$

[(95)](#mJVqste5g3 "Link to this Equation")

This compares the slope of the reconstructed curve with the slope prescribed by the model at the same state, control, and time. The collocation equations make it vanish at the stages, up to solver tolerance. A large value elsewhere identifies an interval whose polynomial does not resolve the dynamics. Evaluate path constraints on this curve as well. This use of the method’s own interpolant for error assessment is described by [Kelly (2017)](https://doi.org/10.1137/16M1062569).

A separate check fixes the reconstructed control $\mathbf u_h(t)$ and integrates the original ODE from the prescribed initial state with an accurate time integrator. Compare this simulated state with $\mathbf x_h(t)$, and check its terminal conditions and path constraints. The simulation measures what the chosen control produces in the model; $\mathbf r_k$ measures how well the polynomial itself satisfies that model. [Step 5 of the pendulum demo](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md#step-5-solve-and-check) performs this replay and separates the solver’s residual from the discretization error.

If the two trajectories disagree or the polynomial residual is large, subdivide the affected intervals or increase their polynomial degree, then solve again. Compare the objective and trajectories across refinements. A dense check supplies evidence about resolution but does not prove that every point satisfies a bound. Tightening an already small NLP tolerance alone cannot remove the error introduced by a coarse transcription.

<a id="optional-orientation-gauss-radau-and-lobatto-nodes"></a>

### Gauss--Legendre and Radau collocation

The coefficient generator accepts any distinct nodes, but their placement affects the accuracy of the resulting integration rule. To see what node selection can accomplish, retain two slope values per interval, as in the trapezoidal construction, and allow their locations to move. The slope interpolant remains linear and its integral remains a quadratic state piece. The node choice changes where the ODE is enforced and the weights used to combine its slopes.

For **two-stage Gauss--Legendre collocation**, choose the interior nodes

<a id="mIw0rAt2jv"></a>

$$
\tau_1=\frac12-\frac{\sqrt3}{6},\qquad
\tau_2=\frac12+\frac{\sqrt3}{6}.
$$

[(96)](#mIw0rAt2jv "Link to this Equation")

These are approximately 0.2113 and 0.7887. Constructing the two Lagrange basis functions at these nodes and integrating them with `make_rule` gives

<a id="zBTs95UHxO"></a>

$$
A=\begin{bmatrix}
\tfrac14&\tfrac14-\tfrac{\sqrt3}{6}\\
\tfrac14+\tfrac{\sqrt3}{6}&\tfrac14
\end{bmatrix},\qquad
b=\begin{bmatrix}\tfrac12\\\tfrac12\end{bmatrix}.
$$

[(97)](#zBTs95UHxO "Link to this Equation")

The rows of $A$ determine the two interior stage states. The weights $b$ then give the endpoint constraint

<a id="PTuQekKYLz"></a>

$$
\mathbf x_{k+1}-\mathbf x_k
-\frac{h_k}{2}(\mathbf f_{k,1}+\mathbf f_{k,2})=0.
$$

[(98)](#PTuQekKYLz "Link to this Equation")

The weights resemble the trapezoidal rule, but the slopes are evaluated at the two interior stages. This relocation improves quadrature accuracy: for a scalar integrand $q(\tau)=\tau^2$, averaging endpoint values gives $1/2$, whereas these nodes give

<a id="WxcdKwF1vC"></a>

$$
\frac{\tau_1^2+\tau_2^2}{2}=\frac13
=\int_0^1\tau^2\,d\tau.
$$

[(99)](#WxcdKwF1vC "Link to this Equation")

The same two-node Gauss rule integrates every polynomial of degree at most three exactly. This does not make the state piece cubic: its degree is still at most two. Quadrature exactness describes which integrands a weighted sum integrates exactly; the state degree describes the curve represented on an interval.

The name comes from the **Legendre polynomials** $P_s$ on $[-1,1]$, which are orthogonal to all lower-degree polynomials under integration on that interval and are normalized by $P_s(1)=1$. For example, $P_0(\xi)=1$, $P_1(\xi)=\xi$, and $P_2(\xi)=(3\xi^2-1)/2$. The roots of $P_2$ are $\pm1/\sqrt3$; mapping them to $[0,1]$ by $\tau=(1+\xi)/2$ gives the two nodes above. With $s$ stages, the same construction uses the $s$ roots of $P_s$ and gives a quadrature rule exact through degree $2s-1$. [Gauss--Legendre quadrature](https://dlmf.nist.gov/3.5#v) supplies these node and exactness properties. The trajectory is still represented in a Lagrange basis: Legendre polynomials determine the nodes, and the Lagrange basis functions reconstruct values from those nodes.

For **right Radau collocation**, require the last node to lie at 1. With two stages, the nodes are $\tau_1=1/3$ and $\tau_2=1$. Their Lagrange basis functions are $\ell_1(\tau)=\tfrac32(1-\tau)$ and $\ell_2(\tau)=\tfrac32\tau-\tfrac12$. Integrating them gives

<a id="q9MvEGotQd"></a>

$$
A=\begin{bmatrix}
\tfrac5{12}&-\tfrac1{12}\\
\tfrac34&\tfrac14
\end{bmatrix},\qquad
b=\begin{bmatrix}\tfrac34\\\tfrac14\end{bmatrix}.
$$

[(100)](#q9MvEGotQd "Link to this Equation")

The last row of $A$ equals $b^\top$ because that stage is the right endpoint. Thus the stage and endpoint equations imply $\mathbf x_{k,2}=\mathbf x_{k+1}$; these variables can be identified and the duplicate equation removed. The rule integrates quadratics exactly, since $\tfrac34(\tfrac13)^2+\tfrac14=\tfrac13$, but it does not integrate every cubic exactly. It trades some quadrature exactness for including the endpoint. For $s$ stages, the right Radau nodes are the shifted roots of $P_s(\xi)-P_{s-1}(\xi)$, including $\xi=1$. With one stage, Gauss--Legendre recovers implicit midpoint, and right Radau recovers implicit Euler. The pendulum demo uses these two-stage Radau arrays; its [Step 1](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md#step-1-compute-the-rule-once) computes them by hand and in code and draws each entry as a signed area under a basis function.

CasADi supplies both node families through [`collocation_points`](https://web.casadi.org/python-api/#collocation_points). They can be passed directly to the slope-based coefficient generator:

```python
import casadi as ca
from collocation_transcription import make_rule

s = 2
control_nodes = [0.0, 1.0]  # Linear control, chosen separately.
gauss_rule = make_rule(ca.collocation_points(s, "legendre"), control_nodes)
radau_rule = make_rule(ca.collocation_points(s, "radau"), control_nodes)
```

Here $s$ counts slope stages, giving a state degree of at most $s$. Both calls retain a linear control, with stage values $\mathbf u_{k,j}=(1-\tau_j)\widehat{\mathbf u}_{k,0}
+\tau_j\widehat{\mathbf u}_{k,1}$. The same `transcribed_problem` function then assembles the stage constraints, endpoint constraints, and cost using either rule. No extra node at zero is needed by this generator: the left state already enters as the integration constant $\mathbf x_k$. CasADi’s [direct-collocation example](https://github.com/casadi/casadi/blob/main/docs/examples/python/direct_collocation.py) instead interpolates state values, so it includes the left endpoint among the state support nodes before differentiating that polynomial.

Gauss nodes include neither endpoint, right Radau includes the right one, and Lobatto includes both, as in the trapezoidal and Hermite--Simpson examples. For every family, adjacent state pieces must still share an endpoint state or be connected by an equality constraint. Constraints required at endpoints must also be imposed there even when those endpoints are not collocation stages. More accurate quadrature alone does not guarantee that the full trajectory optimization is well resolved; the control representation, mesh, and checks between nodes remain part of the construction.

<a id="worked-example-moving-an-overhead-crane-while-limiting-residual-sway"></a>

## Worked Example: Moving an Overhead Crane While Limiting Residual Sway

How do the nodal variables and trapezoidal defects behave in a constrained motion problem whose terminal state must suppress residual oscillation?

An overhead crane moves a trolley while a payload hangs from a cable. A precomputed trolley command can complete the move and still leave the payload swinging. The comparison uses three precomputed acceleration commands. The unshaped baseline moves the trolley without accounting for the payload. A zero-vibration input shaper modifies that baseline to cancel the nominal oscillation. Direct collocation instead chooses a command using the nonlinear payload dynamics and the motion constraints. All three commands are open loop: they are fixed before the move and do not respond to measurements during execution.

The state is $\mathbf{x}=(p,v,\theta,\omega)^\top$, where $p$ and $v$ are trolley position and velocity, and $\theta$ and $\omega$ are payload angle and angular velocity. The scalar control is the commanded trolley acceleration $u=a$. It enters the nonlinear dynamics as

<a id="aKoZCBzPlo"></a>

$$
\dot p=v,\qquad
\dot v=a,\qquad
\dot\theta=\omega,\qquad
\dot\omega=-\frac{g}{\ell}\sin\theta-\frac{a}{\ell}\cos\theta-\gamma\omega.
$$

[(101)](#aKoZCBzPlo "Link to this Equation")

Here $g$ is gravitational acceleration, $\ell$ is cable length, and $\gamma$ is the damping coefficient. The first two equations describe trolley motion, while the last two describe a damped pendulum driven at its suspension point. Positive trolley acceleration makes the load lag behind, which accounts for the minus sign multiplying $a$. The model treats the cable as a rigid, massless link and assumes that the trolley acceleration can be commanded directly.

The trolley and payload start at rest. The goal is to move the trolley 4 m, stop it, and leave the payload hanging vertically without swinging. The nominal cable length is $\ell=1.20$ m, with $g=9.81$ m/s$^2$ and $\gamma=0.035$ s$^{-1}$. Every command is limited to $|a|\leq 1.60$ m/s$^2$, and every command is replayed on the same nonlinear continuous-time plant with a 0.02 s sampling interval. A second replay increases the cable length by $10\%$ without redesigning any command. This second plant tests sensitivity to a simple model mismatch.

<a id="two-open-loop-baselines"></a>

### Two open-loop baselines

The unshaped baseline uses a symmetric trapezoidal velocity profile, produced by acceleration at 0.80 m/s$^2$ up to 1.00 m/s, cruising, and symmetric deceleration. These phases last 1.25, 2.75, and 1.25 s, respectively. Its acceleration and deceleration phases excite the payload oscillation because their timing ignores the pendulum period.

An **input shaper** filters a command into weighted, delayed copies. The delays are chosen so that vibrations excited by the copies cancel one another. For a zero-vibration (ZV) shaper, begin by approximating $\sin\theta\approx\theta$ and $\cos\theta\approx1$ near the hanging equilibrium. The payload equation then becomes

<a id="AhObmjl6W7"></a>

$$
\ddot\theta+2\zeta\omega_n\dot\theta+\omega_n^2\theta=-\frac{a}{\ell},
\qquad
\omega_n=\sqrt{\frac{g}{\ell}},
\qquad
\zeta=\frac{\gamma}{2\omega_n}.
$$

[(102)](#AhObmjl6W7 "Link to this Equation")

Here $\omega_n$ is the undamped natural frequency and $\zeta$ is the damping ratio. For the nominal parameters, $\omega_n=2.86$ rad/s and $\zeta=0.0061$. The shaper splits the baseline command $a_0$ into two copies separated by half of the damped oscillation period:

<a id="kjOKex5593"></a>

$$
a_{\mathrm{ZV}}(t)=A_1a_0(t)+A_2a_0(t-T_d),
\qquad
T_d=\frac{\pi}{\omega_n\sqrt{1-\zeta^2}}\,.
$$

[(103)](#kjOKex5593 "Link to this Equation")

The delay makes the vibration caused by the second copy oppose the vibration remaining from the first. Accounting for decay over the delay gives $A_1=1/(1+K)$, $A_2=K/(1+K)$, and $K=\exp[-\zeta\pi/\sqrt{1-\zeta^2}]$. Here $T_d=1.10$ s and the two weights are approximately 0.505 and 0.495.

<a id="nodal-decision-variables-and-trapezoidal-defects"></a>

### Nodal decision variables and trapezoidal defects

The shaped command finishes after $5.25+T_d\approx6.35$ s. Give the collocation command the same fixed horizon, and evaluate residual sway over the following two seconds with zero commanded acceleration.

The third command is found by solving the trajectory-optimization problem. Divide $[0,5.25+T_d]$ into $N=28$ equal intervals, so $h=(5.25+T_d)/28$. The NLP decision vector contains the state

<a id="U3XxguKzQc"></a>

$$
\mathbf{x}_k=(p_k,v_k,\theta_k,\omega_k)^\top
$$

[(104)](#U3XxguKzQc "Link to this Equation")

and acceleration $a_k$ at every mesh node. These are polynomial values, not monomial coefficients. Each interval contributes the trapezoidal defect

<a id="z7GJ8AHlvI"></a>

$$
\mathbf{x}_{k+1}-\mathbf{x}_k
-\frac{h}{2}\left[
\mathbf{f}(\mathbf{x}_k,a_k)+\mathbf{f}(\mathbf{x}_{k+1},a_{k+1})
\right]=\mathbf0.
$$

[(105)](#z7GJ8AHlvI "Link to this Equation")

The objective trades payload motion against acceleration magnitude and rapid changes in acceleration. The state and acceleration penalties are collected in the nodal quantity

<a id="VUYvgclGKu"></a>

$$
c_k^{\mathrm{rate}}=6\theta_k^2+0.15\omega_k^2+0.035a_k^2.
$$

[(106)](#VUYvgclGKu "Link to this Equation")

The coefficient on $\theta_k^2$ penalizes sway most strongly, while the smaller coefficients penalize angular velocity and acceleration. The smooth state-and-control cost uses trapezoidal endpoint weights. The final term penalizes **acceleration slew**, the rate at which the acceleration command changes. Because the control is piecewise linear, this rate is constant on each interval, giving

<a id="u02EwKdXhP"></a>

$$
\mathcal J
=h\left(\frac12c_0^{\mathrm{rate}}+\sum_{k=1}^{N-1}c_k^{\mathrm{rate}}+\frac12c_N^{\mathrm{rate}}\right)
+0.002h\sum_{k=0}^{N-1}
\left(\frac{a_{k+1}-a_k}{h}\right)^2.
$$

[(107)](#u02EwKdXhP "Link to this Equation")

The boundary conditions impose $\mathbf{x}_0=(0,0,0,0)^\top$ and $\mathbf{x}_N=(4,0,0,0)^\top$, so both the trolley and payload finish at rest. The nodal bounds impose $|a_k|\leq1.60$ m/s$^2$, $|v_k|\leq1.50$ m/s, and $|\theta_k|\leq15^\circ$. Linear interpolation preserves the acceleration bound between its endpoint values. The state bounds still require checks between nodes and on the independently simulated trajectory.

The ZV shaper is tailored to one frequency, so it should leave the least residual sway when the cable length matches its design model. The collocation solution uses the full nonlinear nominal model and handles all constraints at once, but it is also open loop and has no explicit robustness guarantee. The cable-length test therefore measures sensitivity to one model mismatch; it does not establish that either method is robust in general.

<a id="B3Ks7YWO9O"></a>

```python
import sys
sys.path.insert(0, "code")

import pandas as pd
from IPython.display import HTML, display
import matplotlib.pyplot as plt

from crane_control import (
    CraneParameters,
    create_animation as create_crane_animation,
    make_summary_figure as make_crane_summary_figure,
    metrics_table as crane_metrics_table,
    run_comparison as run_crane_comparison,
)

crane_parameters = CraneParameters()
crane_comparison = run_crane_comparison(
    crane_parameters,
    intervals=28,
    sample_period=0.02,
)
```

<a id="jNIfqcI5nY"></a>

<a id="fig-crane-collocation-comparison"></a>

<a id="fig-crane-collocation-comparison-code"></a>

```python
crane_summary_figure = make_crane_summary_figure(crane_comparison)
display(crane_summary_figure)
plt.close(crane_summary_figure)
```

[Figure 13:](#fig-crane-collocation-comparison "Link to this figure")All three commands move the trolley through the same four-metre task on the nonlinear plant. The unshaped command leaves a large oscillation. The ZV shaper nearly cancels the nominal mode, while direct collocation reaches the terminal state with a smoother, lower-effort command. The lower panel replays the unchanged commands after increasing cable length by 10 percent. Hatched bars denote the mismatched plant.

<a id="fig-crane-collocation-comparison-outputs"></a>

![<Figure size 825x750 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/fed4c7ad52-8199d6bbb0e59c6490e117fcd1ede2f3.png)

The ZV shaper produces the smallest nominal residual sway because the simulated plant closely matches the single oscillatory mode used to design it. The collocation command uses less squared acceleration than either baseline and keeps residual sway below one degree in both replays. The unshaped command completes the trolley move but leaves several degrees of oscillation. Cable-length mismatch increases the ZV residual substantially, while the collocation command degrades more gradually for this particular perturbation.

The table reports continuous-plant measurements rather than node values from the nonlinear program. Residual sway is the largest absolute angle after the common command horizon.

<a id="Yc0WQMVq4r"></a>

```python
crane_table = pd.DataFrame(crane_metrics_table(crane_comparison))
crane_table["residual_sway_deg"] = crane_table["residual_sway_deg"].map(lambda x: f"{x:.3f}")
crane_table["peak_sway_deg"] = crane_table["peak_sway_deg"].map(lambda x: f"{x:.2f}")
crane_table["position_error_mm"] = crane_table["position_error_mm"].map(lambda x: f"{x:.2f}")
crane_table["effort"] = crane_table["effort"].map(lambda x: f"{x:.3f}")
crane_table.rename(
    columns={
        "scenario": "plant",
        "controller": "command",
        "residual_sway_deg": "residual sway (deg)",
        "peak_sway_deg": "peak sway (deg)",
        "position_error_mm": "final position error (mm)",
        "effort": "integral a^2 dt",
    }
)
```

Loading...

The animation uses the same high-accuracy nonlinear validation trajectories as the figure. It does not replay the collocation polynomial itself.

<a id="NEhmC3Jpop"></a>

<a id="fig-crane-collocation-animation"></a>

<a id="fig-crane-collocation-animation-code"></a>

```python
crane_animation = create_crane_animation(crane_comparison, frame_stride=5)
crane_html = crane_animation.to_jshtml(fps=25)
plt.close(crane_animation._fig)
display(HTML(crane_html))
```

[Figure 14:](#fig-crane-collocation-animation "Link to this figure")Continuous nonlinear replay of the unshaped, zero-vibration-shaped, and direct-collocation commands. All panels use the same spatial and temporal scales.

<a id="fig-crane-collocation-animation-outputs"></a>

Loading...

Inspect the direct-transcription implementation

crane\_control.py

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
```

[Download the complete crane experiment](https://pierrelucbacon.com/rlbook/build/crane_control-138481920523b3931cc26679c5f5f9ad.py)

The optimization checks algebraic defects, bounds, and endpoint conditions at the nodes. The separate nonlinear replay checks what happens between those nodes. A small nodal defect is evidence that the discrete NLP was solved accurately; it is not, by itself, evidence that the mesh resolves the continuous dynamics.

The comparison does not establish that collocation always outperforms input shaping. The ZV calculation is inexpensive and can nearly cancel residual vibration when a lightly damped mode is accurately known. Direct collocation becomes useful when several state and actuator constraints must be handled together. All three commands remain open loop here. Feedback or receding-horizon replanning would be needed to react to unmeasured disturbances during the move.

<a id="exercises"></a>

## Exercises

<a id="classroom-lagrange-practice"></a>

### Lagrange interpolation practice

The worked example and first four exercises form a classroom sequence of about 30--40 minutes. They progress from constructing a polynomial through prescribed values to integrating a control on one physical time interval. The final exercise introduces barycentric evaluation as an optional extension. Each solution is collapsed so that the problems can be attempted first.

<a id="worked-example-recovering-a-quadratic"></a>

#### Worked example: recovering a quadratic

Suppose we know the values of $f(t)=t^2$ only at $t=1,2,3$ and want a polynomial of degree at most two passing through them. These are physical coordinates for this example; they need not lie in the normalized interval $[0,1]$. The nodes and values are

<a id="TRThj15Fnf"></a>

$$
(\sigma_0,\sigma_1,\sigma_2)=(1,2,3),\qquad
(y_0,y_1,y_2)=(1,4,9).
$$

[(108)](#TRThj15Fnf "Link to this Equation")

To attach a basis function to $y_0$, put zeros at the other two nodes and normalize its value at $\sigma_0=1$. Repeat for the remaining nodes:

<a id="cBQ4Z1QMEK"></a>

$$
\begin{aligned}
\ell_0(t)&=\frac{(t-2)(t-3)}{(1-2)(1-3)}
=\frac{(t-2)(t-3)}2,\\
\ell_1(t)&=\frac{(t-1)(t-3)}{(2-1)(2-3)}
=-(t-1)(t-3),\\
\ell_2(t)&=\frac{(t-1)(t-2)}{(3-1)(3-2)}
=\frac{(t-1)(t-2)}2.
\end{aligned}
$$

[(109)](#cBQ4Z1QMEK "Link to this Equation")

For example, at $t=2$ the three basis values are $(0,1,0)$, so their weighted sum returns $y_1=4$. At any other time, evaluate the same functions and combine them with the same stored values. Expanding gives

<a id="of0XPWyEe9"></a>

$$
\begin{aligned}
p(t)&=\ell_0(t)+4\ell_1(t)+9\ell_2(t)\\
&=\left(\tfrac12t^2-\tfrac52t+3\right)
+\left(-4t^2+16t-12\right)
+\left(\tfrac92t^2-\tfrac{27}2t+9\right)\\
&=t^2.
\end{aligned}
$$

[(110)](#of0XPWyEe9 "Link to this Equation")

The reconstruction agrees with $f$ everywhere because $f$ itself is a polynomial of degree two. Three samples of a general function would determine its quadratic interpolant, but would not determine that function between samples. Here, for instance, $t^2+(t-1)(t-2)(t-3)$ has the same three sampled values and differs between them.

<a id="ex-classroom-lagrange-line"></a>

[Exercise 2](#ex-classroom-lagrange-line "Link to this Exercise") (A line from two stored values)

On $[0,1]$, prescribe $p(0)=2$ and $p(1)=-1$ and restrict $p$ to degree at most one.

1.  Construct the two Lagrange basis functions using the product formula.
    
2.  Write $p$ in Lagrange form, then expand it in the monomial basis.
    
3.  Evaluate $p(1/4)$. Which pair of numbers are the coefficients in each basis?
    
4.  If the degree restriction is removed, give a different polynomial with the same endpoint values.
    

Solution to [Exercise 2](#ex-classroom-lagrange-line)

The basis functions are $\ell_0(\tau)=(\tau-1)/(0-1)=1-\tau$ and $\ell_1(\tau)=(\tau-0)/(1-0)=\tau$. Combining the stored values gives

<a id="haoZWubWNA"></a>

$$
p(\tau)=2(1-\tau)-\tau=2-3\tau,\qquad p(1/4)=5/4.
$$

[(111)](#haoZWubWNA "Link to this Equation")

Its Lagrange coefficients are $(2,-1)$, the endpoint values. Its monomial coefficients are $(2,-3)$, the intercept and slope. The polynomial $2-3\tau+\tau(\tau-1)$ has the same endpoint values because the added term vanishes at both endpoints. It is quadratic, so it lies outside the original degree restriction.

<a id="ex-classroom-lagrange-quadratic"></a>

[Exercise 3](#ex-classroom-lagrange-quadratic "Link to this Exercise") (A quadratic from three stored values)

Use the nodes $0,\tfrac12,1$ and values $y_0=1$, $y_m=2$, $y_1=0$, where $m$ denotes the midpoint. Seek a polynomial of degree at most two.

1.  Construct $\ell_0,\ell_m,\ell_1$ in factored form, then expand them.
    
2.  Check their values at all three nodes and verify $\ell_0(\tau)+\ell_m(\tau)+\ell_1(\tau)=1$.
    
3.  Form $p(\tau)=y_0\ell_0(\tau)+y_m\ell_m(\tau)+y_1\ell_1(\tau)$. Simplify it and evaluate $p(1/4)$.
    
4.  Evaluate all three basis functions at $1/4$. Are these weights all nonnegative, as they were for linear interpolation on $[0,1]$?
    

Solution to [Exercise 3](#ex-classroom-lagrange-quadratic)

Putting zeros at the other two nodes and normalizing at the selected node gives

<a id="DPTEwlkyBe"></a>

$$
\begin{aligned}
\ell_0(\tau)&=2(\tau-\tfrac12)(\tau-1)=2\tau^2-3\tau+1,\\
\ell_m(\tau)&=-4\tau(\tau-1)=4\tau-4\tau^2,\\
\ell_1(\tau)&=2\tau(\tau-\tfrac12)=2\tau^2-\tau.
\end{aligned}
$$

[(112)](#DPTEwlkyBe "Link to this Equation")

The rows of their values at $0,\tfrac12,1$ are $(1,0,0)$, $(0,1,0)$, and $(0,0,1)$. Adding the expanded expressions cancels the quadratic and linear terms and leaves one. The interpolant is

<a id="od0bSoUdq6"></a>

$$
p(\tau)=\ell_0(\tau)+2\ell_m(\tau)
=1+5\tau-6\tau^2,\qquad p(1/4)=15/8.
$$

[(113)](#od0bSoUdq6 "Link to this Equation")

At $1/4$, the basis values are $(3/8,3/4,-1/8)$. They sum to one but include a negative weight. The interpolant therefore need not stay within the range of its nodal values.

<a id="ex-classroom-lagrange-perturbation"></a>

[Exercise 4](#ex-classroom-lagrange-perturbation "Link to this Exercise") (Changing one value and checking a bound)

Keep the nodes and polynomial from the preceding exercise.

1.  Change only the midpoint value from 2 to 3. Write the new polynomial $\widetilde p$ using the old $p$ and a single basis function. How much does its value at $1/4$ change? What happens at the endpoints?
    
2.  For the original polynomial $p$, the three stored values all satisfy $p\leq2$. Find its maximum on $[0,1]$. Does the bound hold everywhere?
    
3.  Explain what these calculations imply when nodal values are decision variables representing a state trajectory.
    

Solution to [Exercise 4](#ex-classroom-lagrange-perturbation)

Only the coefficient of $\ell_m$ changes, so

<a id="ISJvIgM7fV"></a>

$$
\widetilde p(\tau)=p(\tau)+\ell_m(\tau)=1+9\tau-10\tau^2.
$$

[(114)](#ISJvIgM7fV "Link to this Equation")

The change at $1/4$ is $\ell_m(1/4)=3/4$, giving $\widetilde p(1/4)=21/8$. The endpoints are unchanged because $\ell_m$ vanishes there.

For the original polynomial, $p'(\tau)=5-12\tau$ vanishes at $5/12$. Since $p''=-12<0$, this point is its maximum, with

<a id="JwwESr0iC3"></a>

$$
p(5/12)=\frac{49}{24}=2+\frac1{24}>2.
$$

[(115)](#JwwESr0iC3 "Link to this Equation")

Changing a nodal decision variable changes the curve between nodes through its basis function. Likewise, bounds on the nodal variables alone do not ensure bounds on a quadratic state trajectory between nodes. The transcription needs additional checks there, as described in [Checking the continuous trajectory](#sec-collocation-validation).

<a id="ex-classroom-lagrange-state-change"></a>

[Exercise 5](#ex-classroom-lagrange-state-change "Link to this Exercise") (Integrating a control into a state trajectory)

On the physical interval $2\leq t\leq4$, consider $\dot x(t)=u(t)$ and $x(2)=3$. Represent the control by the quadratic through $u(2)=0$, $u(3)=1$, and $u(4)=0$. Let $\tau=(t-2)/2$.

1.  Express $u(2+2\tau)$ using the basis from the three-node exercise.
    
2.  Integrate each basis function on $[0,1]$ to obtain the weights $w_0,w_m,w_1$. Use them to compute $x(4)-x(2)$, including the physical interval length.
    
3.  Find the whole state piece $p(\tau)=x(2+2\tau)$ and state its degree. Check $p'(\tau)/2=u(2+2\tau)$.
    
4.  If $x_k$ and $x_{k+1}$ are stored endpoint states, write the endpoint defect constraint for arbitrary control values $u_0,u_m,u_1$ at the same three times. What endpoint state is required for the given data?
    

Solution to [Exercise 5](#ex-classroom-lagrange-state-change)

The only nonzero control value is at the midpoint, so $u(2+2\tau)=\ell_m(\tau)=4\tau(1-\tau)$. Integrating the expanded basis functions gives

<a id="WfSxZ61hkB"></a>

$$
\begin{aligned}
w_0&=\tfrac23-\tfrac32+1=\tfrac16,\\
w_m&=2-\tfrac43=\tfrac23,\\
w_1&=\tfrac23-\tfrac12=\tfrac16.
\end{aligned}
$$

[(116)](#WfSxZ61hkB "Link to this Equation")

Because $dt=2\,d\tau$, the displacement is $2(w_0\cdot0+w_m\cdot1+w_1\cdot0)=4/3$. Integrating only as far as the current $\tau$ gives the state piece

<a id="nxWWmTFPdk"></a>

$$
p(\tau)=3+2\int_0^\tau4\eta(1-\eta)\,d\eta
=3+4\tau^2-\frac83\tau^3.
$$

[(117)](#nxWWmTFPdk "Link to this Equation")

It is cubic, with $p'(\tau)/2=4\tau-4\tau^2$, as required. The endpoint constraint for arbitrary stored values is

<a id="hU7rrtW2no"></a>

$$
x_{k+1}-x_k-2\left(\frac16u_0+\frac23u_m+\frac16u_1\right)=0.
$$

[(118)](#hU7rrtW2no "Link to this Equation")

For $x_k=3$ and the prescribed controls, it requires $x_{k+1}=13/3$. This integration is exact for the chosen quadratic control and the dynamics $\dot x=u$; no claim of exactness for general nonlinear dynamics is needed.

<a id="ex-classroom-lagrange-barycentric"></a>

[Exercise 6](#ex-classroom-lagrange-barycentric "Link to this Exercise") (Optional: barycentric evaluation)

Return to the worked example with nodes $\sigma_j=1,2,3$ and values $y_j=1,4,9$. A polynomial can be evaluated without expanding its basis functions by precomputing the **barycentric weights**

<a id="geSJb1NKWC"></a>

$$
\beta_j=\frac{1}{\prod_{m\ne j}(\sigma_j-\sigma_m)}.
$$

[(119)](#geSJb1NKWC "Link to this Equation")

These weights describe an evaluation formula; they are distinct from the integration weights $w_j$ used above. Away from the nodes, the same interpolating polynomial is given by

<a id="OkXBBpSz0U"></a>

$$
p(t)=\frac{\displaystyle\sum_{j=0}^2\frac{\beta_jy_j}{t-\sigma_j}}
{\displaystyle\sum_{j=0}^2\frac{\beta_j}{t-\sigma_j}}.
$$

[(120)](#OkXBBpSz0U "Link to this Equation")

1.  Compute $\beta_0,\beta_1,\beta_2$ and use the formula at $t=3/2$.
    
2.  Multiply all three weights by 2. Does the result change?
    
3.  What should an implementation return when the query is exactly $t=2$? Why should it avoid directly evaluating the displayed quotients there?
    

Solution to [Exercise 6](#ex-classroom-lagrange-barycentric)

The products of node differences give $(\beta_0,\beta_1,\beta_2)
=(1/2,-1,1/2)$. At $t=3/2$, the numerator and denominator are

<a id="wlGFEM2RM0"></a>

$$
\frac{1/2}{1/2}+\frac{-4}{-1/2}+\frac{9/2}{-3/2}=6,
\qquad
\frac{1/2}{1/2}+\frac{-1}{-1/2}+\frac{1/2}{-3/2}=\frac83.
$$

[(121)](#wlGFEM2RM0 "Link to this Equation")

Their ratio is $9/4$, agreeing with $(3/2)^2$. Multiplying every weight by the same nonzero number scales both sums equally and leaves their ratio unchanged. At a query that equals a node, return the stored value directly: $p(2)=4$. The polynomial is defined there, but the individual quotients in this evaluation formula divide by zero.

<a id="further-exercises"></a>

### Further exercises

The following exercises revisit polynomial coordinates and connect them to the complete collocation schemes and trajectory checks developed in the chapter.

<a id="ex-collocation-coordinates"></a>

[Exercise 7](#ex-collocation-coordinates "Link to this Exercise")

Let $p(\tau)=2-\tau+2\tau^2$ and choose the support nodes $0,\tfrac12,1$.

1.  Compute its nodal coordinate vector $\mathbf{y}$.
    
2.  Write the evaluation matrix $V$ for the monomial basis.
    
3.  Recover the monomial coefficient vector from $V\mathbf{a}=\mathbf{y}$.
    

Solution to [Exercise 7](#ex-collocation-coordinates)

The nodal values are

<a id="j4Ml5DbIz9"></a>

$$
\mathbf{y}=
\begin{bmatrix}
p(0)\\p(\tfrac12)\\p(1)
\end{bmatrix}
=
\begin{bmatrix}
2\\2\\3
\end{bmatrix}.
$$

[(122)](#j4Ml5DbIz9 "Link to this Equation")

For the monomial basis,

<a id="TrEJV1aM8j"></a>

$$
V=
\begin{bmatrix}
1&0&0\\
1&\tfrac12&\tfrac14\\
1&1&1
\end{bmatrix}.
$$

[(123)](#TrEJV1aM8j "Link to this Equation")

Solving $V\mathbf{a}=\mathbf{y}$ returns $\mathbf{a}=(2,-1,2)^\mathsf T$. The solve changes coordinates; it does not construct a different polynomial.

<a id="ex-collocation-interpolation-regression"></a>

[Exercise 8](#ex-collocation-interpolation-regression "Link to this Exercise")

Classify each problem as interpolation, least-squares regression, or neither.

1.  Find a cubic that passes through four distinct exact values.
    
2.  Fit a cubic trend to twenty noisy temperature measurements.
    
3.  Choose unknown nodal states so that an ODE residual equals zero at four collocation nodes.
    
4.  Fit a line through two distinct exact values by minimizing squared error.
    

Solution to [Exercise 8](#ex-collocation-interpolation-regression)

Problems 1 and 4 are interpolation problems; the least-squares formulation in problem 4 has a zero-residual interpolating solution. Problem 2 is regression. Problem 3 is neither statistical regression nor interpolation of observations: the unknown nodal values define an interpolating polynomial, and collocation adds equality constraints that select those values.

<a id="ex-collocation-operators"></a>

[Exercise 9](#ex-collocation-operators "Link to this Exercise")

For the nodes $0,\tfrac12,1$:

1.  Construct the three Lagrange cardinal functions.
    
2.  Evaluate their derivatives at all three nodes to obtain $D$.
    
3.  Integrate them on $[0,1]$ to obtain $w$.
    
4.  Verify that $D$ differentiates $p(\tau)=1+2\tau-\tau^2$ exactly at the nodes.
    

Solution to [Exercise 9](#ex-collocation-operators)

The cardinal functions are

<a id="Q2Jh7ERpsi"></a>

$$
\ell_0=2\tau^2-3\tau+1,\qquad
\ell_m=4\tau(1-\tau),\qquad
\ell_1=2\tau^2-\tau.
$$

[(124)](#Q2Jh7ERpsi "Link to this Equation")

They give

<a id="HMLuz9Q45c"></a>

$$
D=
\begin{bmatrix}
-3&4&-1\\
-1&0&1\\
1&-4&3
\end{bmatrix},
\qquad
w=\frac16
\begin{bmatrix}1\\4\\1\end{bmatrix}.
$$

[(125)](#HMLuz9Q45c "Link to this Equation")

For $\mathbf{y}=(1,\tfrac74,2)^\mathsf T$, $D\mathbf{y}=(2,1,0)^\mathsf T$, which equals $p'(\tau)=2-2\tau$ at the three nodes.

<a id="ex-collocation-euler-trapezoid"></a>

[Exercise 10](#ex-collocation-euler-trapezoid "Link to this Exercise")

Starting from

<a id="p80EM0vY5T"></a>

$$
\dot{\mathbf{x}}_h(t_k+h_k\tau)=\sum_j\mathbf{f}_{k,j}\ell_j(\tau),
$$

[(126)](#p80EM0vY5T "Link to this Equation")

derive:

1.  explicit Euler from the single slope node $\tau_1=0$;
    
2.  implicit Euler from the single slope node $\tau_1=1$;
    
3.  the trapezoidal defect from the slope nodes $\tau_1=0$ and $\tau_2=1$.
    

State the degree of the resulting state approximation in each case.

Solution to [Exercise 10](#ex-collocation-euler-trapezoid)

One node gives the constant derivative interpolant $\mathbf{f}_k$ or $\mathbf{f}_{k+1}$. Integration yields the explicit or implicit Euler defect and a degree-one state. With endpoint nodes, $\dot{\mathbf{x}}_h=(1-\tau)\mathbf{f}_k+\tau \mathbf{f}_{k+1}$. Its integral at $\tau=1$ is $\tfrac12(\mathbf{f}_k+\mathbf{f}_{k+1})$, which gives the trapezoidal defect. The linear derivative integrates to a degree-two state.

<a id="ex-collocation-hermite-simpson-degree"></a>

[Exercise 11](#ex-collocation-hermite-simpson-degree "Link to this Exercise")

Explain why Hermite--Simpson has a cubic state interpolant even though its derivative is represented at only three nodes. Then derive the Simpson endpoint weights and the midpoint relation.

Solution to [Exercise 11](#ex-collocation-hermite-simpson-degree)

Three distinct slope values define a quadratic derivative interpolant. Integrating that quadratic adds one degree, so the state is cubic. Integrating the cardinal functions over $[0,1]$ gives $(1,4,1)/6$ and hence the Simpson defect. Integrating to $\tau=\tfrac12$ gives $(5,8,-1)/24$; eliminating the midpoint slope with the endpoint defect gives

<a id="hrRC7POk4o"></a>

$$
\mathbf{x}_{k+\frac12}
=\frac12(\mathbf{x}_k+\mathbf{x}_{k+1})
+\frac{h_k}{8}(\mathbf{f}_k-\mathbf{f}_{k+1}).
$$

[(127)](#hrRC7POk4o "Link to this Equation")

<a id="ex-collocation-generated-midpoint"></a>

[Exercise 12](#ex-collocation-generated-midpoint "Link to this Exercise") (Generate a midpoint transcription)

Choose the single collocation node $\tau_1=1/2$ and a constant control on each interval.

1.  Use the cardinal function to compute $A$, $b$, and $B$, then verify the arrays with `make_rule([0.5], [0.0])`.
    
2.  Eliminate the stage state from the stage and endpoint equations. State the resulting defect and explain why this is an implicit midpoint rule.
    
3.  For $\dot x=u$, minimize $\int_0^1u(t)^2\,dt$ with $x(0)=0$, $x(1)=1$, and $|u|\leq2$. Write the complete NLP on the mesh $0,1/2,1$, including its decision variables, and solve it.
    

Solution to [Exercise 12](#ex-collocation-generated-midpoint)

The cardinal function is $\ell_1=1$, so $A=[1/2]$, $b=[1]$, and $B=[1]$. The stage equation gives $\mathbf x_{k,1}=\mathbf x_k+(h_k/2)\mathbf f_{k,1}$, while the endpoint equation gives $\mathbf x_{k+1}=\mathbf x_k+h_k\mathbf f_{k,1}$. Eliminating the slope between these equations gives $\mathbf x_{k,1}=(\mathbf x_k+\mathbf x_{k+1})/2$ and hence

<a id="zWGeXD2QV6"></a>

$$
\mathbf x_{k+1}-\mathbf x_k
-h_k\mathbf f\!\left(
\frac{\mathbf x_k+\mathbf x_{k+1}}2,\mathbf u_{k,1},t_k+\frac{h_k}2
\right)=\mathbf0.
$$

[(128)](#zWGeXD2QV6 "Link to this Equation")

The unknown right state appears inside the dynamics evaluation, which makes the rule implicit. The state polynomial is linear and the control constant. For the scalar problem with two half-unit intervals, the complete NLP is

<a id="iOenFvpKkU"></a>

$$
\begin{aligned}
\min_{x_0,x_1,x_2,u_{0,1},u_{1,1}}\quad&
\frac12(u_{0,1}^2+u_{1,1}^2)\\
\text{subject to}\quad&
x_{k+1}-x_k-\frac12u_{k,1}=0,\quad k=0,1,\\
&-2\leq u_{k,1}\leq2,\quad k=0,1,\\
&x_0=0,\qquad x_2=1.
\end{aligned}
$$

[(129)](#iOenFvpKkU "Link to this Equation")

The defects imply $u_{0,1}+u_{1,1}=2$. Substitution into the objective gives $(u_{0,1}-1)^2+1$, so both controls are one, $x_1=1/2$, and the minimum cost is one. This recovers the opening trajectory on a finer mesh.

<a id="ex-collocation-control-sampling"></a>

[Exercise 13](#ex-collocation-control-sampling "Link to this Exercise") (Control variation between sampled stages)

On $[0,1]$, consider $\dot x=u$ with $x(0)=0$ and collocation stages only at the endpoints. Compare the controls $u(t)=0$ and $u(t)=4t(1-t)$.

1.  What control values does the endpoint transcription see? Can its trapezoidal defect distinguish the commands?
    
2.  Integrate each control to find the state at $t=1$. Explain why a quadratic control can cause a problem when only endpoint stages are used.
    
3.  Propose a change to the control representation or stage nodes that distinguishes these two commands.
    

Solution to [Exercise 13](#ex-collocation-control-sampling)

Both controls are zero at both endpoints. The trapezoidal defect therefore predicts $x(1)-x(0)=0$ for either command. Their actual displacements are zero and

<a id="g3Fm3uDOcc"></a>

$$
\int_0^1 4t(1-t)\,dt
=4\left(\frac12-\frac13\right)=\frac23.
$$

[(130)](#g3Fm3uDOcc "Link to this Equation")

Endpoint samples cannot detect the quadratic control’s interior variation. Restricting the control to a line makes two zero endpoint values determine the zero control. Alternatively, a midpoint stage samples the second control at value one, so the two commands produce different stage slopes. With all three stages, Simpson weights integrate this quadratic control exactly.

<a id="ex-collocation-between-node-residual"></a>

[Exercise 14](#ex-collocation-between-node-residual "Link to this Exercise")

An NLP reports a maximum collocation defect of 10\-10. The reconstructed polynomial has a large ODE residual halfway between two nodes, and an independent simulation of the chosen control violates a state bound.

1.  Why are these observations compatible?
    
2.  What diagnostic should be computed?
    
3.  What change to the transcription is the natural first response?
    

Solution to [Exercise 14](#ex-collocation-between-node-residual)

The NLP defect measures its equality constraints at the selected nodes. A coarse polynomial can satisfy those constraints while failing to resolve behavior between them. Evaluate $\mathbf r_k$ and path constraints on the polynomial at additional times. Separately, integrate the original ODE using the chosen control and compare the simulated states with the polynomial. Refine the offending intervals or raise the local degree, then solve and validate again. Tightening an already small NLP tolerance does not fix representation error.

<a id="ex-collocation-crane-mismatch"></a>

[Exercise 15](#ex-collocation-crane-mismatch "Link to this Exercise")

Download `code/crane_control.py`. Replay the fixed ZV and collocation commands for cable lengths between $0.9\ell$ and $1.1\ell$, without redesigning either command. Plot residual sway against cable length and explain the curve using the natural frequency $\sqrt{g/\ell}$.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Direct collocation turns an optimization over whole functions into an optimization over finitely many state and control values. These nodal values define polynomial segments. Algebraic defect constraints then require each segment to agree with the ODE at selected points.

Each polynomial has two equivalent descriptions: basis coefficients or values at nodes,

<a id="SGO4nhigrA"></a>

$$
p(\tau)=\sum_j a_j\phi_j(\tau)
=\sum_j y_j\ell_j(\tau),
\qquad \mathbf y=V\mathbf a.
$$

[(131)](#SGO4nhigrA "Link to this Equation")

Direct collocation uses the nodal description because the stored values have an immediate physical meaning. Lagrange cardinal functions turn them into fixed operators for computing derivatives, endpoints, and integrals. Although this construction resembles polynomial fitting, the nodal values are optimization variables rather than noisy observations, and the ODE residual is an equality constraint rather than a regression loss.

Both integration and differentiation forms impose collocation at selected nodes. The integration form interpolates evaluated ODE slopes and uses state-matching residuals to make their integral agree with the stored states. The differentiation form interpolates state values and uses slope-matching residuals to make their derivative agree with the ODE. With matching node choices, degree, and control space, both describe the same feasible polynomial trajectories.

Interpolating one left or right slope gives explicit or implicit Euler and a linear state approximation. Interpolating both endpoint slopes gives the trapezoidal defect and a quadratic state approximation. Adding the midpoint slope gives Simpson weights, the Hermite--Simpson midpoint relation, and a cubic state approximation.

The control degree is chosen separately. Its support values determine the stage controls through the evaluation matrix $B$. A program can construct $A$, $b$, and $B$ from the selected nodes, then assemble the same stage, endpoint, and cost expressions for all these schemes. Changing the nodes or control representation changes the finite approximation without requiring a new derivation of those expressions.

Across many intervals, each defect involves only neighboring endpoints and local stage values. Most entries in the constraint Jacobian are therefore zero, which allows an NLP solver to exploit a sparse, block-banded structure. The overhead-crane example also shows why solving the NLP is not the final check: constraints that hold at the nodes may still be violated between them. Polynomial residuals assess the local approximation, and independent simulation checks the trajectory produced by the chosen control.

How can we improve a control sequence when a simulator evaluates its cost but does not provide derivatives? [Model Predictive Path Integral Control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md) samples candidate control sequences and combines them using cost-dependent weights. When physical disturbances make the rollout uncertain, several simulated futures estimate each candidate’s expected cost. The following [receding-horizon control chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md) studies how replanning from measurements supplies feedback to a finite-horizon optimizer.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Kelly2017DirectCollocation"></a>
2.  Kelly, M. (2017). An Introduction to Trajectory Optimization: How to Do Your Own Direct Collocation. _SIAM Review_, _59_(4), 849–904. [10.1137/16M1062569](https://doi.org/10.1137/16M1062569)
<a id="cite-Andersson2019CasADi"></a>
4.  Andersson, J. A. E., Gillis, J., Horn, G., Rawlings, J. B., & Diehl, M. (2019). CasADi: A Software Framework for Nonlinear Optimization and Optimal Control. _Mathematical Programming Computation_, _11_(1), 1–36. [10.1007/s12532-018-0139-4](https://doi.org/10.1007/s12532-018-0139-4)

[

Open-Loop Optimal Control

iLQR and Differential Dynamic Programming


](09-iterative-trajectory-optimization.md)[

Open-Loop Optimal Control

Model Predictive Path Integral Control


](11-model-predictive-path-integral-control.md)


---

# CHAPITRE 11 — Model Predictive Path Integral Control

Section du livre : Open-Loop Optimal Control

Page originale : https://pierrelucbacon.com/rlbook/model-predictive-path-integral-control

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md

> **Cours de Pierre-Luc Bacon — 11.** [Page publiée](https://pierrelucbacon.com/rlbook/model-predictive-path-integral-control) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/11-model-predictive-path-integral-control.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Model Predictive Path Integral Control

<a id="skip-to-article"></a>

The preceding chapters formulated deterministic trajectory optimization as a nonlinear program. Shooting and collocation turn the dynamics, costs, and constraints into a finite-dimensional problem that we can solve with an NLP solver. Gradient-based methods are effective when accurate derivatives are available. How can we improve a trajectory when we can simulate the system and evaluate its cost, but differentiating through that computation is difficult or expensive?

Model predictive path integral control (MPPI) uses sampling to construct an update. It draws candidate control sequences, simulates their trajectories, and forms a weighted average that favors lower-cost outcomes. This requires no derivatives of the dynamics or cost, and the candidate rollouts can run in parallel. The derivation begins with a distribution over control sequences: costs determine which sequences receive more probability, and fitting a Gaussian to that distribution gives the weighted-average update. This construction applies even to a deterministic simulator. An aircraft example extends the calculation to uncertain winds by estimating each candidate flight’s expected cost before assigning its weight. Executing the first action and planning again from the next observation connects these computations to the following chapter on receding-horizon control.

<a id="learning-goals"></a>

## Learning Goals

After working through the examples and exercises, you should be able to:

-   Calculate an MPPI update, including the correction for sampling around a nonzero nominal control sequence.
    
-   Derive exponential weighting from a KL-regularized objective and obtain the control update by fitting a Gaussian mean.
    
-   Distinguish samples used to explore controls from samples used to estimate a candidate’s expected cost under physical disturbances.
    
-   Assess a sampled plan using feasibility checks, weight concentration, and comparisons under shared disturbances.
    
-   Execute the first action of a sampled plan and update the remaining plan from new observations.
    

<a id="prerequisites"></a>

## Prerequisites

The algorithm uses the [single-shooting rollout](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/08-numerical-trajectory-optimization.md) and the [finite-horizon optimal-control formulation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md). The sampling derivation requires Gaussian distributions and expectations; KL divergence and importance sampling are developed here. The aircraft example uses conditional disturbance models from [Stochastic Dynamics and Partial Observation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/04-stochastic-dynamics-observation.md).

<a id="sec-mppi"></a>

## Improving a Control Sequence by Sampling

We already know how to evaluate a control sequence: simulate the system and compute the resulting cost. How can we improve that sequence? Instead of computing a gradient, we try many random variations, evaluate each one, and form a weighted average that gives more influence to the lower-cost candidates. That average becomes our next control sequence.

If the system has $d_u$ control components, then $\mathbf u_k\in\mathbb R^{d_u}$ contains the inputs applied together at time step $k$. The current plan $\mathbf U=(\mathbf u_0,\ldots,\mathbf u_{N-1})$ collects these vectors over all $N$ steps. Thus $\mathbf u_k$ is one step’s control vector, while $\mathbf U$ is the complete sequence, with $Nd_u$ entries when stacked into one vector.

Draw $K$ Gaussian perturbation sequences $\boldsymbol\epsilon^{(i)}$ and simulate each candidate $\mathbf V^{(i)}=\mathbf U+\boldsymbol\epsilon^{(i)}$. After assigning normalized weights $w_i$ to the resulting trajectories, form the new control sequence

<a id="DjeIttbYeI"></a>

$$
\mathbf U^+=\sum_{i=1}^K w_i\mathbf V^{(i)}
=\mathbf U+\sum_{i=1}^K w_i\boldsymbol\epsilon^{(i)},
\qquad w_i\geq0,\qquad \sum_{i=1}^K w_i=1.
$$

[(1)](#DjeIttbYeI "Link to this Equation")

The same trajectory weight multiplies every action in its sequence. How should those weights depend on the costs? Giving every candidate the same weight, $w_i=1/K$, would ignore the rollout results. Because the perturbations have mean zero, this update would return $\mathbf U$ on average, regardless of which candidates performed well. At the other extreme, assigning weight one to the lowest-cost candidate and zero to the others would select a single sequence. A candidate with a nearly identical cost would have no influence, and a small change in which candidate ranks first could switch the entire update.

MPPI allows several low-cost candidates to contribute, with their influence decreasing smoothly as cost increases. Consider first the initial sequence $\mathbf U=\mathbf0$. The candidate sequences are then the zero-mean Gaussian perturbations themselves. This Gaussian is the **reference distribution**: it remains fixed even when later updates move the sampling mean away from zero. Let $S_i$ be the accumulated state cost along rollout $i$, including its terminal cost. MPPI assigns it the positive score $\exp(-S_i/\lambda)$ and divides by the sum of all scores:

<a id="QpIsXvdfRj"></a>

$$
w_i=\frac{\exp(-S_i/\lambda)}{\sum_{j=1}^K\exp(-S_j/\lambda)},
\qquad \lambda>0.
$$

[(2)](#QpIsXvdfRj "Link to this Equation")

This is the softmax of the negative costs, with temperature $\lambda$. The minus sign makes lower costs receive larger scores, and the denominator makes the weights sum to one. The parameter $\lambda$ has the same units as cost, so $S_i/\lambda$ is dimensionless. To see how it sets the strength of the preference, compare two candidates. Their common denominator cancels:

<a id="gYDhdvQPUz"></a>

$$
\frac{w_i}{w_j}
=\frac{\exp(-S_i/\lambda)}{\exp(-S_j/\lambda)}
=\exp\!\left(-\frac{S_i-S_j}{\lambda}\right).
$$

[(3)](#gYDhdvQPUz "Link to this Equation")

If rollout $i$ costs $\lambda\log2$ more than rollout $j$, it receives half as much weight. Thus cost differences, rather than the arbitrary zero of the cost scale, determine relative influence. For a fixed batch, small $\lambda$ makes even modest cost differences strongly affect the weights; large $\lambda$ makes them less consequential. As $\lambda\to0^+$, the weights concentrate on the lowest-cost candidate, or split equally among tied minima. As $\lambda\to\infty$, they approach $1/K$. These are the two alternatives above, now connected by a continuous weighting rule.

The curves in [Figure 1](#fig-mppi-exponential-weights) show this dependence on cost and temperature. Each curve compares a rollout’s weight with the weight of the best candidate in the same batch.

<a id="fig-mppi-exponential-weights"></a>

<a id="mfJUm9V8lU"></a>
![Three exponential curves plot a rollout's weight relative to the best rollout against its excess cost. The curve for temperature one half falls fastest, temperature one falls at an intermediate rate, and temperature two falls slowest. A horizontal dotted line shows the equal-weight limit. At temperature one, an excess cost of log two gives half the best rollout's weight.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/a62491ae41-exponential-weights-13d3e3ef13ffb778ff86d56acb381443.svg)

[Figure 1:](#fig-mppi-exponential-weights "Link to this figure")Smaller temperatures reduce the influence of higher-cost trajectories more sharply. With $S_{\min}=\min_i S_i$, the horizontal axis is the excess cost $\Delta S=S_i-S_{\min}$, and the vertical axis is the ratio $w_i/w_{\mathrm{best}}=\exp(-\Delta S/\lambda)$. Costs and temperatures use the same arbitrary cost unit. The marked point shows that $\Delta S=\log2$ halves the relative weight when $\lambda=1$. The dotted horizontal line is the equal-weight limit as $\lambda\to\infty$. A ratio of one at $\Delta S=0$ does not mean that the best rollout receives all the normalized weight: the actual $w_i$ still sum to one across the batch.

The Gaussian reference already favors small controls. Its contribution to control effort will appear explicitly in the distributional objective below; $S_i$ includes only state and terminal costs. The displayed weights apply when sampling from this reference, with $\mathbf U=\mathbf0$. Sampling around a nonzero plan changes how often each candidate is drawn and requires a corresponding correction to its weight.

The computational attraction is that each rollout and cost evaluation can run independently, making large batches suitable for GPU execution [Williams _et al._, 2017](https://doi.org/10.48550/arXiv.1707.02342). This parallelism does not guarantee that a modest number of samples will find low-cost control sequences: long horizons, many control variables, and narrow feasible regions can make the search difficult. We will check both sampling quality and feasibility when using the update in the aircraft example.

So far, exponential weighting is a rule for combining a batch of trials. To justify the rule, we need an objective whose solution gives those weights, and a reason to use their average as the next plan. Both follow by treating the candidate sequences as samples from a distribution and optimizing that distribution before fitting a new control sequence to it.

<a id="sec-mppi-distribution"></a>

## From Trajectory Weights to MPPI

Which optimization problem gives the exponential weights and their weighted-average update? A distribution over control sequences lets us balance low trajectory cost against a preference for small inputs. The resulting distribution need not have a simple form, but fitting a Gaussian to it produces a mean that can serve as the next plan. Sampling then estimates this mean. Throughout this derivation, randomness comes from the search over controls; the simulator itself can be deterministic.

<a id="reference-and-sampling-distributions"></a>

### Reference and sampling distributions

For a general rollout, write $\mathbf{x}_{k+1}=\mathbf{f}_k(\mathbf{x}_k,\mathbf{v}_k)$, where $\mathbf v_k\in\mathbb R^{d_u}$ is the candidate control vector at step $k$. Collect these vectors into the complete candidate sequence $\mathbf V=(\mathbf v_0,\ldots,\mathbf v_{N-1})$, with the same structure as the nominal sequence $\mathbf U$. The initial state is fixed, so each input sequence determines a simulated state sequence. Define the state and terminal cost of a rollout by

<a id="Y10xOsR5gw"></a>

$$
S(\mathbf V)=c_N(\mathbf{x}_N)
+\sum_{k=0}^{N-1}c_k(\mathbf{x}_k).
$$

[(4)](#Y10xOsR5gw "Link to this Equation")

Each $c_k$ is the cost for one interval; if it comes from a continuous running cost, its discretization includes the interval length.

In the earlier optimal-control formulation, a stage cost $c_k(\mathbf x_k,\mathbf u_k)$ could penalize both the state and the control effort. Here $c_k(\mathbf x_k)$ contains only the state cost; the inputs still affect $S(\mathbf V)$ through the simulated states. Control effort will be accounted for separately by a KL-divergence penalty between the input distribution and a reference distribution.

Choose a Gaussian reference distribution $P_0$ centered at zero to express a preference for small inputs. As derived below, this choice makes the KL penalty a quadratic cost on the magnitude of the nominal controls; the penalty vanishes when the nominal sequence is zero. Use a separate Gaussian sampling distribution $Q_{\mathbf U}$ over complete input sequences, centered at the current plan $\mathbf U$. At each step $k$, the candidate control $\mathbf v_k$ has mean $\mathbf0$ under $P_0$ and mean $\mathbf u_k$ under $Q_{\mathbf U}$. Both use the same positive-definite covariance $\Sigma\in\mathbb R^{d_u\times d_u}$ for the control components at a single step. Assuming independence across time gives the joint densities over the complete sequence:

<a id="v2KXjeFJNv"></a>

$$
p_0(\mathbf V)=\prod_{k=0}^{N-1}\mathcal N(\mathbf v_k;\mathbf0,\Sigma),
\qquad
q_{\mathbf U}(\mathbf V)=
\prod_{k=0}^{N-1}\mathcal N(\mathbf v_k;\mathbf u_k,\Sigma).
$$

[(5)](#v2KXjeFJNv "Link to this Equation")

Centering the reference at zero is a modeling choice. A Gaussian reference could instead be centered on a prescribed baseline sequence; the KL penalty would then charge for squared deviations of the nominal controls from that baseline. In either case, the state and terminal costs can favor controls away from the reference mean when their benefits justify the effort.

The reference remains fixed during a planning update. The sampling mean is the entire nominal sequence $\mathbf U$. This mean is taken over repeated candidate draws, with a separate mean control vector $\mathbf u_k$ for each time step. Changing $\mathbf u_k$ moves the center of the candidate controls at step $k$. Initializing $\mathbf U=\mathbf0$ means setting every $\mathbf u_k=\mathbf0$, so the sampling and reference distributions initially coincide. Later updates can change the nominal controls at each step, moving the samples toward a new plan while the reference stays centered at zero. The sampler can therefore change where it searches without changing the reference that defines the objective.

<a id="exponentially-weighting-the-reference"></a>

### Exponentially weighting the reference

Sampling from the reference determines how often different input sequences appear in a batch. Assigning a cost weight to each draw then changes how much that occurrence contributes to the weighted average. The total weight assigned to a sequence depends on both its sampling frequency and its weight per occurrence, which is why these two factors multiply.

For example, first consider a reference with only two possible input sequences, $a$ and $b$, selected with probabilities $3/4$ and $1/4$. Suppose their costs are $S(a)=\lambda\log3$ and $S(b)=0$, so each draw of $a$ receives score $1/3$ and each draw of $b$ receives score 1. Their reference probabilities multiplied by these scores are

<a id="TtHqudpslp"></a>

$$
\frac34\times\frac13=\frac14
\quad\text{for }a,
\qquad
\frac14\times1=\frac14
\quad\text{for }b.
$$

[(6)](#TtHqudpslp "Link to this Equation")

Dividing by the sum, $1/2$, gives probability $1/2$ to each sequence. The reference samples $a$ three times as often, but each occurrence receives one third of the weight, so the two effects cancel.

For continuous inputs, the same operation multiplies the reference density $p_0(\mathbf V)$ by the score $e^{-S(\mathbf V)/\lambda}$ at each sequence $\mathbf V$, then divides by the integral of that product:

<a id="dkE3hwGa0q"></a>

$$
\begin{aligned}
p^\star(\mathbf V)
&=\frac{e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)}{Z},
\qquad \lambda>0,\\
Z&=\int e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)\,d\mathbf V
=\mathbb E_{P_0}[e^{-S(\mathbf V)/\lambda}].
\end{aligned}
$$

[(7)](#dkE3hwGa0q "Link to this Equation")

The score $e^{-S(\mathbf V)/\lambda}$ is not itself a probability density, and the product does not define a joint distribution of two random variables. Both factors concern the same input sequence: $p_0$ specifies its density before costs are considered, and the score adjusts that density according to its cost. The normalizing constant $Z$ makes the resulting density integrate to one.

Assume $S$ is measurable and bounded below and $0<Z<\infty$. The normalized result is a **Gibbs distribution**: two trajectories with equal reference density and cost difference $\Delta S$ have density ratio $e^{-\Delta S/\lambda}$. The parameter $\lambda$ has the units of cost and controls how strongly those costs affect the ratio.

The opening batch weights contain only the scores because drawing from $P_0$ already accounts for the reference probabilities. Multiplication by $p_0$ appears when we describe the distribution represented by those weighted samples. This explains how weighting changes a distribution; the particular choice of an exponential score is justified by the objective combining expected cost and KL divergence below.

<a id="the-objective-defined-by-the-weights"></a>

### The objective defined by the weights

The exponential weights solve an optimization problem over distributions of input sequences. We seek a distribution $Q$ that reduces expected state and terminal cost while paying a penalty for departing from $P_0$. Measure that departure with the **Kullback--Leibler divergence**. For densities $q,p$, it is

<a id="TrTPdRzpqu"></a>

$$
D_{\mathrm{KL}}(Q\|P)
=\mathbb E_{\mathbf V\sim Q}\left[\log\frac{q(\mathbf V)}{p(\mathbf V)}\right].
$$

[(8)](#TrTPdRzpqu "Link to this Equation")

This divergence is nonnegative and equals zero only when the two distributions agree. For it to be finite, $Q$ must put no probability where $P$ has zero density, a condition called absolute continuity. With $\lambda>0$ setting the cost of departure from the reference, the first optimization problem is

<a id="eq-mppi-distribution-objective"></a>

$$
\min_Q\;\mathcal J(Q),
\qquad
\mathcal J(Q)
=\mathbb E_{\mathbf V\sim Q}[S(\mathbf V)]
+\lambda D_{\mathrm{KL}}(Q\|P_0).
$$

[(9)](#eq-mppi-distribution-objective "Link to this Equation")

Here $Q$ ranges over distributions on complete input sequences for which both terms are finite; it is not restricted to a Gaussian family.

Recall that $P^\star$ is the distribution obtained by multiplying the reference density by the exponential cost score and normalizing. Its density is $p^\star(\mathbf V)=e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)/Z$. To verify that this distribution solves the optimization problem, we can express the difference between $\mathcal J(Q)$ and its minimum as a nonnegative divergence. Substituting this density into the logarithm gives

<a id="oJ7y3MBs78"></a>

$$
\log\frac{q(\mathbf V)}{p^\star(\mathbf V)}
=\log\frac{q(\mathbf V)}{p_0(\mathbf V)}
+\frac{S(\mathbf V)}{\lambda}+\log Z.
$$

[(10)](#oJ7y3MBs78 "Link to this Equation")

Taking the expectation under $Q$ recovers the two terms in $\mathcal J(Q)$:

<a id="rZPmpAuWRn"></a>

$$
\begin{aligned}
D_{\mathrm{KL}}(Q\|P^\star)
&=D_{\mathrm{KL}}(Q\|P_0)
+\frac{1}{\lambda}\mathbb E_Q[S(\mathbf V)]+\log Z\\
&=\frac{\mathcal J(Q)}{\lambda}+\log Z.
\end{aligned}
$$

[(11)](#rZPmpAuWRn "Link to this Equation")

Rearranging isolates the objective:

<a id="ffdDvQ6Jn8"></a>

$$
\mathcal J(Q)=-\lambda\log Z
+\lambda D_{\mathrm{KL}}(Q\|P^\star)
\geq-\lambda\log Z.
$$

[(12)](#ffdDvQ6Jn8 "Link to this Equation")

The quantity $Z$ is fixed by $S$, $P_0$, and $\lambda$, so the term $-\lambda\log Z$ does not depend on $Q$. Choosing $Q=P^\star$ makes the remaining term, $\lambda D_{\mathrm{KL}}(Q\|P^\star)$, equal to zero. Every other distribution gives a positive divergence and hence a larger objective value. This proves that $P^\star=\operatorname*{arg\,min}_Q\mathcal J(Q)$, with minimum value $\mathcal J(P^\star)=-\lambda\log Z$.

The exponential cost weight is contained in the definition of $P^\star$; it is no longer explicit in the KL identity because we took logarithms. Writing out the density of the minimizing distribution gives

<a id="k83n4NmKE1"></a>

$$
p^\star(\mathbf V)
=\frac{1}{Z}\,
\underbrace{e^{-S(\mathbf V)/\lambda}}_{\text{exponential cost weight}}
\,p_0(\mathbf V).
$$

[(13)](#k83n4NmKE1 "Link to this Equation")

Multiplying the reference density $p_0(\mathbf V)$ by the indicated factor and normalizing by $Z$ is the exponential weighting introduced above. The bound on $\mathcal J(Q)$ proves that the distribution constructed this way solves [(9)](#eq-mppi-distribution-objective).

For a Gaussian $Q_{\mathbf U}$ with the same covariance as the reference, the KL penalty is a quadratic function of its mean controls:

<a id="qAuS2wQNqo"></a>

$$
\lambda D_{\mathrm{KL}}(Q_{\mathbf U}\|P_0)
=\frac\lambda2\sum_{k=0}^{N-1}
\mathbf u_k^\top\Sigma^{-1}\mathbf u_k.
$$

[(14)](#qAuS2wQNqo "Link to this Equation")

For example, choose $\lambda\Sigma^{-1}=hR$, where $h$ is the interval length and $R\succ0$ specifies how costly each input direction is. Then this penalty is $\tfrac12 h\sum_k\mathbf u_k^\top R\mathbf u_k$, the discretization of the control-effort integral $\tfrac12\int\mathbf u(t)^\top R\mathbf u(t)\,dt$ for controls held constant on each interval. Thus, within this Gaussian family, departing from the zero-mean reference incurs a quadratic cost on the nominal controls. This accounts for control effort without adding it to $S$. Changing $\lambda$ with $\Sigma$ fixed changes this penalty as well as the concentration of the weights.

The solution $P^\star$ assigns probabilities to complete input sequences. A controller still needs a nominal sequence to store and execute. We obtain that sequence by approximating $P^\star$ with a Gaussian whose mean can be stored as a plan.

<a id="fitting-a-gaussian-mean"></a>

### Fitting a Gaussian mean

The density $p^\star(\mathbf V)=e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)/Z$ is generally neither Gaussian nor independent across time. To approximate this distribution, consider the same Gaussian family as our sampler, with a candidate mean sequence $\mathbf M=(\mathbf m_0,\ldots,\mathbf m_{N-1})$:

<a id="Ha7dL5TmAA"></a>

$$
q_{\mathbf M}(\mathbf V)
=\prod_{k=0}^{N-1}\mathcal N(\mathbf v_k;\mathbf m_k,\Sigma).
$$

[(15)](#Ha7dL5TmAA "Link to this Equation")

Only the mean sequence is adjustable; the covariance $\Sigma$ at each step remains fixed. The second optimization problem chooses the Gaussian that minimizes its divergence from $P^\star$ in the following direction:

<a id="eq-mppi-gaussian-objective"></a>

$$
\mathbf U^+
=\operatorname*{arg\,min}_{\mathbf M}
D_{\mathrm{KL}}(P^\star\|Q_{\mathbf M}).
$$

[(16)](#eq-mppi-gaussian-objective "Link to this Equation")

Here $P^\star$ is fixed, and the variable is a finite-dimensional mean sequence $\mathbf M$. Expanding this objective separates the two log densities:

<a id="qRBGfh8L1F"></a>

$$
D_{\mathrm{KL}}(P^\star\|Q_{\mathbf M})
=\mathbb E_{P^\star}[\log p^\star(\mathbf V)]
-\mathbb E_{P^\star}[\log q_{\mathbf M}(\mathbf V)].
$$

[(17)](#qRBGfh8L1F "Link to this Equation")

The first expectation does not depend on $\mathbf M$. In the second, the Gaussian normalization also stays fixed because $\Sigma$ is fixed. Substituting the Gaussian log density therefore gives

<a id="st0qutIKmM"></a>

$$
D_{\mathrm{KL}}(P^\star\|Q_{\mathbf M})
=C+\frac12\mathbb E_{P^\star}
\left[\sum_{k=0}^{N-1}
(\mathbf v_k-\mathbf m_k)^\top\Sigma^{-1}
(\mathbf v_k-\mathbf m_k)\right].
$$

[(18)](#st0qutIKmM "Link to this Equation")

The constant $C$ collects the terms in the divergence that do not depend on $\mathbf M$. Minimizing the divergence is thus equivalent to minimizing the expected squared distance from the candidate mean to an input sequence drawn from $P^\star$, with distances measured by $\Sigma^{-1}$. Assuming finite second moments, differentiation gives

<a id="R6BuVze20y"></a>

$$
\nabla_{\mathbf m_k}D_{\mathrm{KL}}(P^\star\|Q_{\mathbf M})
=\Sigma^{-1}\left(\mathbf m_k-\mathbb E_{P^\star}[\mathbf v_k]\right).
$$

[(19)](#R6BuVze20y "Link to this Equation")

Setting this gradient to zero yields the unique minimizer, since $\Sigma^{-1}$ is positive definite:

<a id="lUocb5J3ZS"></a>

$$
\mathbf u_k^+=\mathbb E_{P^\star}[\mathbf v_k],
\qquad k=0,\ldots,N-1.
$$

[(20)](#lUocb5J3ZS "Link to this Equation")

With an exact solution of [(16)](#eq-mppi-gaussian-objective), the updated Gaussian would have the same mean as $P^\star$. The equation above identifies that mean as the quantity we need to compute; it does not yet provide a way to evaluate it. We know the density of $P^\star$ up to its normalizing constant: for any candidate sequence $\mathbf V$, a rollout gives $S(\mathbf V)$, so we can evaluate $e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)$. In general, however, calculating $Z$ or $\mathbb E_{P^\star}[\mathbf v_k]$ requires high-dimensional integration, and we do not have a direct sampler for $P^\star$.

Importance sampling in [Correcting for where the samples were drawn](#sec-mppi-importance) will estimate this mean from candidates drawn from the Gaussian $Q_{\mathbf U}$, which we can sample. The normalized weights will account for the difference between the two distributions without requiring the value of $Z$. Thus the computed update will only approximate the mean of $P^\star$; the equality above describes the exact target of the calculation. The quadratic example below first provides a case where this target can be calculated analytically.

Even if its mean were computed exactly, the Gaussian would retain covariance $\Sigma$ at each step. It can therefore lose features of $P^\star$: if low-cost sequences form separate groups, their average can lie between those groups.

The first problem, [(9)](#eq-mppi-distribution-objective), chooses an entire distribution by minimizing $\mathbb E_Q[S(\mathbf V)]+\lambda
D_{\mathrm{KL}}(Q\|P_0)$. The second, [(16)](#eq-mppi-gaussian-objective), holds its solution $P^\star$ fixed and chooses a Gaussian mean by minimizing $D_{\mathrm{KL}}(P^\star\|Q_{\mathbf M})$. If we instead restricted the first problem to Gaussians, the identity above would give

<a id="ESrZFEn0TL"></a>

$$
\operatorname*{arg\,min}_{\mathbf M}
\left\{\mathbb E_{Q_{\mathbf M}}[S(\mathbf V)]
+\lambda D_{\mathrm{KL}}(Q_{\mathbf M}\|P_0)\right\}
=\operatorname*{arg\,min}_{\mathbf M}
D_{\mathrm{KL}}(Q_{\mathbf M}\|P^\star).
$$

[(21)](#ESrZFEn0TL "Link to this Equation")

The order of the distributions in this divergence is reversed relative to [(16)](#eq-mppi-gaussian-objective). KL divergence is not symmetric, so these two choices of Gaussian mean need not agree [Williams _et al._, 2017](https://doi.org/10.48550/arXiv.1707.02342).

<a id="a-one-step-quadratic-check"></a>

### A one-step quadratic check

For a scalar system $x_1=x_0+v$ with $x_0=0$ and target 1, take $S(v)=\tfrac\kappa2(v-1)^2$ with $\kappa>0$, $P_0=\mathcal N(0,1)$, and $\lambda=1$. The dynamics are deterministic: different endpoints result from trying different inputs. Multiplying the reference density by $e^{-S(v)}$ and completing the square gives

<a id="u9fWEIrCgS"></a>

$$
p^\star(v)\propto
\exp\!\left[-\frac12\bigl(v^2+\kappa(v-1)^2\bigr)\right]
\propto\exp\!\left[-\frac{1+\kappa}{2}
\left(v-\frac\kappa{1+\kappa}\right)^2\right].
$$

[(22)](#u9fWEIrCgS "Link to this Equation")

Thus the first optimization problem has solution $P^\star=\mathcal N(\kappa/(1+\kappa),1/(1+\kappa))$. Weighting has shifted the reference toward the target and reduced its variance. The second problem keeps the variance at its chosen value of one and adjusts only the Gaussian mean:

<a id="NAmtJEQWJf"></a>

$$
u^+=\operatorname*{arg\,min}_{m}
D_{\mathrm{KL}}\!\left(
\mathcal N\!\left(\frac{\kappa}{1+\kappa},\frac{1}{1+\kappa}\right)
\,\middle\|\,\mathcal N(m,1)\right)
=\frac{\kappa}{1+\kappa}.
$$

[(23)](#NAmtJEQWJf "Link to this Equation")

The resulting approximation is $Q_{u^+}=\mathcal N(\kappa/(1+\kappa),1)$. It has the correct mean but is broader than $P^\star$. Figure [Figure 2](#fig-mppi-gaussian-mean) shows both optimization steps for $\kappa=2\log2$.

<a id="fig-mppi-gaussian-mean"></a>

<a id="yaeZWuicqz"></a>
![Two density plots share the same input and probability-density scales. On the left, multiplying a zero-mean Gaussian reference by the exponential cost weight produces a narrower Gaussian centered at about 0.581. On the right, the approximating Gaussian shares that mean but retains the reference variance of one, so it is broader than the cost-weighted distribution.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/58f4703b00-gaussian-mean-3a9b75c0856ab5500ee76e5281476a02.svg)

[Figure 2:](#fig-mppi-gaussian-mean "Link to this figure")The two MPPI optimization problems change different properties of the input distribution. For the scalar rollout $x_1=v$, target 1, cost $S(v)=\tfrac\kappa2(v-1)^2$, $\kappa=2\log2$, and $\lambda=1$, the reference is $P_0=\mathcal N(0,1)$. Left: minimizing expected cost plus $D_{\mathrm{KL}}(Q\|P_0)$ gives the blue solid density $p^\star(v)\propto e^{-S(v)}p_0(v)$, with mean $u^+\approx0.581$ and variance $1/(1+\kappa)\approx0.419$. The gray dashed curve is the reference. Right: minimizing $D_{\mathrm{KL}}(P^\star\|Q_m)$ over $Q_m=\mathcal N(m,1)$ gives the orange dash-dotted density $q_{u^+}$, with the same mean as $p^\star$ and variance one. The vertical dotted lines mark the means. Both panels show analytic densities, without sampling error.

In this quadratic example, $u^+$ also minimizes the deterministic objective $\tfrac\kappa2(u-1)^2+\tfrac12u^2$: setting its derivative $\kappa(u-1)+u$ to zero gives $u=\kappa/(1+\kappa)$. This agreement checks the update in the example; taking the mean of $P^\star$ need not minimize the deterministic cost for a general rollout.

To check the finite-sample calculation, set $\kappa=2\log2$ and start from $u=0$. Suppose three draws from the reference, rounded for this calculation, are $-1,0,1$. Evaluating their costs gives

| Candidate input $v$ | Endpoint $x_1$ | Cost $S(v)$ | Unnormalized weight | Normalized weight |
| --- | --- | --- | --- | --- |
| \-1 | \-1 | $4\log 2$ | $1/16$ | $1/25$ |
| 0 | 0 | $\log 2$ | $1/2$ | $8/25$ |
| 1 | 1 | 0 | 1 | $16/25$ |

The weighted average is

<a id="IDw4uA72VO"></a>

$$
u^+=\frac1{25}(-1)+\frac8{25}(0)+\frac{16}{25}(1)=\frac35.
$$

[(24)](#IDw4uA72VO "Link to this Equation")

This three-sample estimate, 0.6, is close to the exact mean $2\log2/(1+2\log2)\approx0.581$. All three candidates contribute; the update does not simply select the best sampled input, 1. Sampling around the updated plan will produce a different mix of candidates, so preserving the same target mean requires adjusting their weights.

<a id="sec-mppi-importance"></a>

### Correcting for where the samples were drawn

The mean $\mathbf u_k^+=\mathbb E_{P^\star}[\mathbf v_k]$ is the exact solution of the Gaussian approximation problem. To estimate it for a general rollout, we have two available operations: draw a sequence from $Q_{\mathbf U}$, and evaluate its cost $S(\mathbf V)$. We can use these operations without a direct sampler for $P^\star$ or an analytic value for its normalizing constant $Z$.

Substituting the definition of $p^\star$ into the desired expectation and writing $Z$ as its defining integral gives

<a id="nWtgbPgTEu"></a>

$$
\mathbf u_k^+
=\frac{\int \mathbf v_k e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)\,d\mathbf V}
{\int e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)\,d\mathbf V}.
$$

[(25)](#nWtgbPgTEu "Link to this Equation")

Both integrals involve the unnormalized density that we can evaluate. Multiplying and dividing their integrands by $q_{\mathbf U}(\mathbf V)$ expresses them as expectations under the distribution we can sample:

<a id="HZLbkKQ9Nf"></a>

$$
\mathbf u_k^+
=\frac{\mathbb E_{Q_{\mathbf U}}
\left[e^{-S(\mathbf V)/\lambda}
\frac{p_0(\mathbf V)}{q_{\mathbf U}(\mathbf V)}\mathbf v_k\right]}
{\mathbb E_{Q_{\mathbf U}}
\left[e^{-S(\mathbf V)/\lambda}
\frac{p_0(\mathbf V)}{q_{\mathbf U}(\mathbf V)}\right]}.
$$

[(26)](#HZLbkKQ9Nf "Link to this Equation")

This change of sampling distribution is **importance sampling**. A batch from $Q_{\mathbf U}$ can estimate both expectations, using the score $e^{-S(\mathbf V)/\lambda}p_0(\mathbf V)/q_{\mathbf U}(\mathbf V)$ for each candidate. Dividing by the sum of these scores normalizes the sample weights, so we do not need to know $Z$.

For example, moving a scalar proposal to a positive mean makes positive inputs more common even if the target distribution has not changed. Weighting only by state cost would mistake that extra sampling frequency for additional target probability. The factor $p_0/q_{\mathbf U}$ removes it. Since both Gaussians have full support, every trajectory with positive target density remains accessible. Writing $\mathbf v_k=\mathbf u_k+\boldsymbol\epsilon_k$ and expanding their quadratic exponents gives

<a id="NPjiX4fUsd"></a>

$$
\begin{aligned}
\log\frac{p_0(\mathbf U+\boldsymbol\epsilon)}
{q_{\mathbf U}(\mathbf U+\boldsymbol\epsilon)}
&=-\frac12\sum_k\left[
(\mathbf u_k+\boldsymbol\epsilon_k)^\top\Sigma^{-1}
(\mathbf u_k+\boldsymbol\epsilon_k)
-\boldsymbol\epsilon_k^\top\Sigma^{-1}\boldsymbol\epsilon_k
\right]\\
&=-\sum_k\left[
\mathbf u_k^\top\Sigma^{-1}\boldsymbol\epsilon_k
+\frac12\mathbf u_k^\top\Sigma^{-1}\mathbf u_k\right].
\end{aligned}
$$

[(27)](#NPjiX4fUsd "Link to this Equation")

The last quadratic term is identical across samples and cancels from the normalized weights. Consequently each sampled sequence $i$ receives the corrected cost

<a id="WtmMxbC1kZ"></a>

$$
\widetilde S_i=S(\mathbf U+\boldsymbol\epsilon^{(i)})
+\lambda\sum_{k=0}^{N-1}
\mathbf u_k^\top\Sigma^{-1}\boldsymbol\epsilon_k^{(i)}.
$$

[(28)](#WtmMxbC1kZ "Link to this Equation")

<a id="a-stable-finite-sample-update"></a>

### A stable finite-sample update

The ratio of expectations above is exact. To compute an approximate update, replace both expectations by averages over $K$ independent samples from $Q_{\mathbf U}$. For numerical stability, subtract $\rho=\min_i\widetilde S_i$ before exponentiation. This common subtraction leaves normalized weights unchanged and avoids overflow:

<a id="MCw6KYyoo2"></a>

$$
w_i=\frac{e^{-(\widetilde S_i-\rho)/\lambda}}
{\sum_{j=1}^K e^{-(\widetilde S_j-\rho)/\lambda}},
\qquad
\mathbf u_k^+=\mathbf u_k+
\sum_{i=1}^K w_i\boldsymbol\epsilon_k^{(i)}.
$$

[(29)](#MCw6KYyoo2 "Link to this Equation")

The same full-trajectory weight updates every time slot. This ratio of sample averages is a self-normalized importance-sampling estimator. It is generally biased for finite $K$ and converges to the target mean when the relevant weighted moments are integrable. Further iterations move the proposal toward useful trajectories; with exact expectations, the target mean would already be independent of the proposal.

A quadratic rollout makes the effect of this correction explicit. Take $x_{k+1}=x_k+hv_k$, $x_0=0$, $N=10$, $h=0.1$, and terminal cost $2(x_N-1)^2$. With $\lambda=0.5$ and $\Sigma=5$, the exact target mean is 0.8 at every time step. Sampling around $u_k=0.4$ and omitting the correction instead estimates 0.88, even with arbitrarily many samples. Exercise [Exercise 2](#ex-mppi-likelihood-correction) derives both limits. Moving the proposal should change the accuracy of the estimate, not the mean being estimated.

<a id="receding-horizon-execution"></a>

### Receding-horizon execution

The update gives a sequence of actions for a particular initial state. Model error or physical disturbances can make the next observed state differ from the rollout prediction. Continuing with the stored sequence would ignore that discrepancy. Instead, apply only the first action and use the newly observed state as the initial condition for another planning problem. MPPI repeats the trajectory computation from that condition, as in the sampling controllers of [Williams _et al._ (2017)](https://doi.org/10.2514/1.G001921).

<a id="mppi"></a>

[Algorithm 1](#mppi "Link to this Algorithm") (Model Predictive Path Integral Control)

**Inputs:** Measured state $\mathbf x$, horizon $N$, rollout maps $\mathbf f_k$, state costs $c_k$, terminal cost $c_N$, covariance $\Sigma\succ0$, parameter $\lambda>0$, sample count $K$, and a finite number $I$ of sampling iterations per observation.

**Initialization:** Set the nominal sequence $\mathbf U$ to zero or to an available initial guess.

1.  At each observation, repeat the following $I$ times:
    
    1.  Save the current nominal sequence $\mathbf U$.
        
    2.  Independently for $i=1,\ldots,K$:
        
        1.  Draw $\boldsymbol\epsilon_k^{(i)}\sim\mathcal N(\mathbf0,\Sigma)$ for $k=0,\ldots,N-1$.
            
        2.  Set $\mathbf x_0^{(i)}=\mathbf x$ and $S_i=0$.
            
        3.  For $k=0,\ldots,N-1$, accumulate $S_i\leftarrow S_i+c_k(\mathbf x_k^{(i)})$ and simulate $\mathbf x_{k+1}^{(i)}=
            \mathbf f_k(\mathbf x_k^{(i)},
            \mathbf u_k+\boldsymbol\epsilon_k^{(i)})$.
            
        4.  Add the terminal cost and likelihood correction: $\widetilde S_i=S_i+c_N(\mathbf x_N^{(i)})
            +\lambda\sum_k\mathbf u_k^\top\Sigma^{-1}
            \boldsymbol\epsilon_k^{(i)}$.
            
    3.  Compute $\rho=\min_i\widetilde S_i$ and normalize $w_i\propto\exp[-(\widetilde S_i-\rho)/\lambda]$.
        
    4.  Update all controls simultaneously: $\mathbf u_k\leftarrow\mathbf u_k+
        \sum_iw_i\boldsymbol\epsilon_k^{(i)}$.
        
2.  Apply $\mathbf u_0$ for one control interval and obtain the next state observation.
    
3.  Shift the remaining sequence one slot forward, repeat its final control to fill the last slot, and return to step 1.
    

This version assumes unrestricted Gaussian inputs and finite rollout costs. Nonconvex state constraints need additional treatment: even an average of inputs from feasible trajectories can generate an infeasible trajectory. Clipping samples also changes their density, so the displayed Gaussian likelihood ratio does not apply unchanged to the clipped variables. A chosen exploration covariance different from the reference covariance requires the full corresponding density ratio.

The rollouts can be simulated in parallel. Their effectiveness still depends on overlap between proposal and target. The quantity $K_{\mathrm{eff}}=1/\sum_i w_i^2$ summarizes weight concentration: it is $K$ for equal weights and approaches one when a single rollout dominates. It diagnoses sampling concentration, rather than certifying optimality or constraint satisfaction. A finite-sample update can increase the rollout cost, particularly when only a few samples carry most of the weight. Concentrated weights suggest increasing the sample count or improving overlap between proposal and target. Increasing $\lambda$ with a fixed reference weakens state-cost weighting, but also changes the optimization objective. Altering the proposal covariance alone requires the corresponding likelihood correction. Receding-horizon execution supplies feedback through repeated observations; the stored sequence itself is open loop.

<a id="connection-to-diffusion-based-planning"></a>

### Connection to diffusion-based planning

The distribution over low-cost plans also connects this computation to modern diffusion-based trajectory optimization. In model-based diffusion, the objective defines a target density through an exponential cost weight. Gaussian perturbations and cost-weighted averages then provide estimates used to refine trajectories through a sequence of noise levels [Pan _et al._, 2024](https://proceedings.neurips.cc/paper_files/paper/2024/file/6a5c38a730b17f3827c09cf6b192be04-Paper-Conference.pdf). MPPI’s weighted mean provides a useful starting point for understanding that construction. The MPPI update here uses a fixed sampling covariance and does not train a denoising network or run a diffusion noise schedule. In both algorithms, random perturbations can serve only to explore controls. Physical disturbances introduce a separate source of variation: a single candidate plan can produce different costs under different disturbance realizations. The aircraft example uses several simulated winds to estimate the cost assigned to each candidate.

<a id="sec-aircraft-mppi"></a>

## Aircraft Planning Under Uncertain Winds

Consider an Airbus A320 flying from Montréal–Trudeau (CYUL) to Toronto–Pearson (CYYZ). The task is to choose climb, cruise, descent, and flight duration to use little fuel while arriving within 1 km horizontally and 30 m vertically of the destination. A favorable wind at one altitude may justify climbing, but its later evolution is uncertain. How can the sampled-control update account for these different possible outcomes when comparing candidate flights?

The method from [From Trajectory Weights to MPPI](#sec-mppi-distribution) can optimize an estimated expected cost from a simulator. It requires separate samples for candidate controls and for future winds: several winds must be evaluated before a candidate is assigned its cost weight. The following model makes those two random quantities explicit.

<a id="the-airborne-model-and-its-wind-state"></a>

### The airborne model and its wind state

In the OpenAP A320 point-mass model [Sun, 2022](https://doi.org/10.3390/aerospace9070383), the state is $(p_E,p_N,h,m,t)$: east and north position in a local map, altitude in meters, mass in kilograms, and elapsed time in seconds. Here $h$ denotes altitude; numerical time steps will be given in seconds. Controls are Mach number $M$, vertical speed $v_z$ in meters per second, and heading $\chi$ in radians clockwise from north. If $v=\mathrm{TAS}(M,h)$ is true airspeed and $\gamma=\arctan(v_z/v)$, the model is

<a id="j52IWh3jsu"></a>

$$
\begin{aligned}
\dot p_E &= v\cos\gamma\sin\chi+\bar w_E(p_E,p_N,h)+g_E,\\
\dot p_N &= v\cos\gamma\cos\chi+\bar w_N(p_E,p_N,h)+g_N,\\
\dot h &= v_z,\qquad
\dot m=-f_{\mathrm{fuel}}(m,v,h,v_z),\qquad \dot t=1.
\end{aligned}
$$

[(30)](#j52IWh3jsu "Link to this Equation")

The horizontal equations separate air-relative motion from wind-driven displacement: $\bar w$ is the fixed mean wind field and $g$ is a gust. Fuel flow $f_{\mathrm{fuel}}$ reduces mass as the aircraft flies. The heading convention and flight-path-angle approximation reproduce `OpenAP.top`’s point-mass equations. Conversions to knots, feet, and feet per minute occur only when calling OpenAP interfaces that require them. The numerical derivatives are tested against `OpenAP.top`’s original symbolic model at climb, cruise, and descent states. Optimization itself uses forward simulation and Gaussian sampling.

The reference flight covers the complete airborne leg, with the following initial and nominal conditions:

| Quantity | Value |
| --- | --- |
| Initial mass | $85\%$ of maximum takeoff mass |
| Departure and arrival altitude | 100 ft |
| Nominal cruise altitude | 7000 m |
| Nominal duration | 3600 s |

Taxi, runway operations, and traffic are outside this model. Mach number, vertical speed, heading, altitude, mass, and the geographic flight corridor have explicit bounds. Thrust, lift, and excess-energy inequalities reproduce the approximate `OpenAP.top` envelope checks. Adjacent command changes are also checked against limits of 0.2 Mach, 500 ft/min in vertical speed, and 15 degrees in heading. These are constraints of the teaching model.

The mean field $\bar w$ is the committed ERA5 pressure-level snapshot for June 1, 2023, at 12:00 UTC [Copernicus Climate Change Service (C3S), 2018](https://doi.org/10.24381/cds.bd0915c6). Preprocessing converts the original GRIB values once to a numerical array. The simulator interpolates in pressure, latitude, and longitude, using ISA pressure at the aircraft’s altitude. Outside the snapshot’s pressure range of 200–925 hPa, it holds the boundary value; in particular, winds near the ground use the lowest available pressure level. The snapshot remains fixed in time during a flight.

A gust observed now should influence the near-future forecast, but it should not determine the wind for the entire flight. An Ornstein–Uhlenbeck model represents this persistence and gradual loss of predictability for $g=(g_E,g_N)$. Its exact transition over a time increment $\Delta$ is

<a id="BJxh8QaC5X"></a>

$$
g_{t+\Delta}=e^{-\Delta/\tau}g_t+
\sqrt{1-e^{-2\Delta/\tau}}\,
\begin{bmatrix}\sigma_E&0\\0&\sigma_N\end{bmatrix}\xi,
\qquad \xi\sim\mathcal N(0,I),
$$

[(31)](#BJxh8QaC5X "Link to this Equation")

with $\tau=300$ s, $\sigma_E=5$ m/s, and $\sigma_N=4$ m/s. These parameters are illustrative assumptions, not estimates from the single ERA5 snapshot. The gust is spatially uniform in this example. The aircraft’s current state and current gust are observed at each replanning time. Conditional on that observation, the future gust has mean $e^{-\Delta/\tau}g_t$ and increasing conditional variance. Augmenting the aircraft state with $g_t$ makes this a fully observed Markov model. There is no observation filter in the example.

<a id="expected-cost-under-several-wind-futures"></a>

### Expected cost under several wind futures

A candidate flight can do well under one wind and poorly under another. Suppose two equally likely winds give the following costs:

| Candidate | First wind | Second wind | Expected cost |
| --- | --- | --- | --- |
| A | 0 | 20 | 10 |
| B | 8 | 8 | 8 |

Expected cost favors B. At $\lambda=1$, however, averaging exponential weights gives A the score $(1+e^{-20})/2\approx0.5$, while B receives $e^{-8}\approx0.00034$. A single favorable wind dominates A’s weight. Averaging such weights would therefore optimize a different criterion. Exercise [Exercise 3](#ex-mppi-aircraft-expected-cost) develops this distinction further.

For the intended expected-cost objective, first average costs across wind futures. If $z^{(i)}$ specifies a candidate flight and $W^{(\ell)}$ is one of $L$ futures conditional on the observed gust, use

<a id="wwM4pUk3Di"></a>

$$
\widehat C(z^{(i)})=\frac1L\sum_{\ell=1}^L
 C\bigl(z^{(i)},W^{(\ell)}\bigr).
$$

[(32)](#wwM4pUk3Di "Link to this Equation")

Every candidate receives the same ensemble of wind futures. Pairing the winds makes each cost difference compare two plans under the same conditions, which can reduce variance in their estimated difference. The ensemble is independent of the future wind that will actually occur.

The cost $C$ is fuel burned, plus quadratic penalties for horizontal and vertical arrival error and for envelope violations. Arrival error is scaled by tolerances of 1000 m horizontally and 30 m vertically. A squared unit of either scaled arrival error adds 80 kg-equivalent cost; envelope violations receive a larger penalty. The code records the physical errors separately from this combined objective.

<a id="smooth-flight-parameters-and-their-weights"></a>

### Smooth flight parameters and their weights

The aircraft has three control channels over a full flight. Perturbing each short interval independently would produce a large and irregular control sequence. Instead, a candidate is a vector $z\in\mathbb R^{13}$: one duration parameter and four interior knots for each of the three control channels. The knots define small, piecewise-linear perturbations around a geometric reference flight. The nominal reference accounts for the observed state and conditional mean wind; its forward simulation remains responsible for determining the actual endpoint. The duration is multiplied by $e^{0.025z_0}$ and limited to $[0.90,1.12]$ times the nominal remaining duration. This limited family keeps the first example computationally small. It does not span all feasible A320 trajectories.

The vertical-speed perturbation has zero time integral, so it preserves the reference altitude change. This is a restriction on the control parameterization. The simulator never projects the final aircraft position onto the destination. Mach and heading perturbations can change the arrival position, and every proposal must be checked after simulation.

Use a reference $p_0=\mathcal N(0,0.7^2I)$ and proposal $q_\mu=\mathcal N(\mu,0.7^2I)$ over the knot and duration parameters $z$. The weights and proposed mean are

<a id="uS32rtQ1R3"></a>

$$
w_i\propto
\exp\!\left[-\frac{\widehat C(z^{(i)})}{\lambda}\right]
\frac{p_0(z^{(i)})}{q_\mu(z^{(i)})},
\qquad \mu^+=\sum_iw_i z^{(i)},\qquad \lambda=25\ \text{kg-equivalent}.
$$

[(33)](#uS32rtQ1R3 "Link to this Equation")

The likelihood ratio is computed before the deterministic mapping from parameters to bounded duration and control tapes. Clipping the duration does not turn its physical distribution into a Gaussian; the Gaussian density remains a density over $z$. The proposal correction appears once per candidate, after disturbance averaging.

There are now two sample counts with different roles: $K$ candidate parameter vectors approximate the weighted mean, while $L$ wind futures approximate each candidate’s expected cost. The parameter reference regularizes the flight changes. It does not describe the physical gusts, which affect ground motion and have their own temporal dependence.

The update uses the distributional construction from [From Trajectory Weights to MPPI](#sec-mppi-distribution), with $\widehat C$ as its score. Even if expected costs were evaluated exactly, fitting a Gaussian mean would not generally solve the deterministic optimization over flight parameters. The finite sampling budget introduces another approximation, so the proposed plan must be checked before execution.

<a id="accepting-and-executing-a-plan"></a>

### Accepting and executing a plan

Prediction uses 60 s control intervals. Before accepting a weighted mean, the code constructs its control tape and replays it on a 10 s grid under the conditional mean wind. It checks the envelope and both arrival tolerances. The proposed plan must also improve the estimated cost on the shared wind ensemble. The best accepted plan so far is the incumbent. An invalid or non-improving update leaves that validated plan in place. The initial geometric reference must pass the same validation. At a later decision, the remaining previous plan is also replayed from the observed state and can be retained as the incumbent. Validation includes the change from the last executed command to the new first command. If neither reference is feasible, the simulation reports a planning failure.

These checks certify feasibility only under the conditional mean and at the checked resolution. The scenario evaluations expose possible arrival and constraint violations under other winds. Neither a weighted average nor a finite collection of successful scenarios guarantees feasibility for all Gaussian disturbances.

<a id="comparing-frozen-and-replanned-flights"></a>

### Comparing frozen and replanned flights

The experiment asks two separate questions: does reacting to observed wind improve arrival, and does sampling uncertain future wind improve on its conditional mean? Three execution strategies use paired physical wind realizations:

1.  **Frozen plan:** compute a full-trip plan using mean wind at departure and execute it for the rest of the flight.
    
2.  **Conditional-mean replanning:** observe state and gust every 60 s, optimize the remaining trip using the conditional mean gust, and execute the next minute of commands.
    
3.  **Stochastic replanning:** use the same observations and execution schedule, but average each candidate’s cost over a conditional ensemble of wind futures before updating its parameters.
    

The saved mean-wind flight is the validated deterministic reference used to construct the frozen plan. The two replanning variants build a geometric reference from the measured state and compare it with the remaining previous plan, then perform two Gaussian mean updates. They reuse the previous flight as a candidate incumbent, while resetting the perturbation coordinates around the new geometric reference. Within one decision, each accepted mean initializes the next sampling update. Extending the shifted-sequence warm start in [Algorithm 1](#mppi) to reuse the previous knot coordinates is a further computational experiment.

The realized gust trajectory has its own random-number stream. The optimizer receives only the current observed gust and generates independent conditional forecasts. All candidates at one decision share the forecast ensemble, which reduces noise in their cost differences. Controllers encounter the same underlying realized gust function even when their durations differ. Realized gusts are held over each 10 s execution interval; a 5 s replay checks numerical integration while preserving those realized inputs.

<a id="fig-aircraft-mppi-profiles"></a>

<a id="bi3EMpAJP6"></a>
![Complete flight profiles for the first paired gust realization. The frozen
plan executes the same commands as the mean-wind reference, so both burn the
same fuel in this model, but their ground positions differ. Replanning changes
commands in response to the observed position and gust. The horizontal line
in the final-approach panel marks the 1 km arrival tolerance.](../Assets/Website/c841edc672-flight_comparison-eaf8d9e5be5439143cb18c4c365a0b4f.svg)

[Figure 3:](#fig-aircraft-mppi-profiles "Link to this figure")Complete flight profiles for the first paired gust realization. The frozen plan executes the same commands as the mean-wind reference, so both burn the same fuel in this model, but their ground positions differ. Replanning changes commands in response to the observed position and gust. The horizontal line in the final-approach panel marks the 1 km arrival tolerance.

<a id="arrival-fuel-and-numerical-sensitivity"></a>

### Arrival, fuel, and numerical sensitivity

In the three recorded wind realizations, the frozen plan misses the arrival tolerance each time. Both replanning methods arrive within tolerance in all three trials. Their fuel difference is smaller than the distinction between arriving and missing the destination, so arrival and fuel are reported separately:

| Controller | Fuel (kg) | Arrival error (m) | Feasible arrivals | Largest constraint violation |
| --- | --- | --- | --- | --- |
| Mean-wind plan | 2577.8 | 66.2 | 1/1 | 0 |
| Frozen plan + gusts | 2577.8 | 2491.3 | 0/3 | 0 |
| Mean-wind replanning | 2587.0 | 102.9 | 3/3 | 1.15e-13 |
| Stochastic replanning | 2560.1 | 110.0 | 3/3 | 1.5e-13 |

The repeated runs use 3 independent gust seeds. The figures show mean and sample standard deviation across those seeds, with individual runs also plotted. The mean-wind plan is one deterministic reference run. Prediction uses 32 candidates, 6 shared wind scenarios, and 2 updates per decision. Arrival tolerances are 1000 m horizontally and 30 m vertically. Constraint residuals and replay differences are available in the downloadable metrics.

| Controller | Mean ESS | Total planning time per flight (s) | Rejected updates |
| --- | --- | --- | --- |
| Frozen plan + gusts | 11.7 | 1.3 | 0 |
| Mean-wind replanning | 22.2 | 56.1 | 110 |
| Stochastic replanning | 8.8 | 52.2 | 92 |

Planning times are measured wall-clock times on the build machine; they include validation and vary with competing workloads. Rejected-update counts are totals across the recorded flights. The largest 5 s versus 10 s replay difference is 0.261 m in position and 0.0020 kg in fuel. All vertical arrival errors are below 8.3e-13 m.

<a id="fig-aircraft-mppi-metrics"></a>

<a id="Vbuzleykf3"></a>
![Individual outcomes across three independent gust realizations, with mean and
sample-standard-deviation bars. The small trial count supports inspection of
these examples; it does not establish a reliable fuel advantage or a failure
probability. Tiny residuals near machine precision arise from floating-point
integration at the terminal altitude boundary.](../Assets/Website/3e570f1036-metrics-482b1b011eb06fb95c0f839b0539759e.svg)

[Figure 4:](#fig-aircraft-mppi-metrics "Link to this figure")Individual outcomes across three independent gust realizations, with mean and sample-standard-deviation bars. The small trial count supports inspection of these examples; it does not establish a reliable fuel advantage or a failure probability. Tiny residuals near machine precision arise from floating-point integration at the terminal altitude boundary.

Replanning compensates for displacement accumulated under the frozen plan. Whether sampling future gusts also improves fuel consumption depends on the wind model, the trajectory family, and the sampling budget. Conditional-mean replanning is therefore a substantive baseline. A favorable single run is insufficient evidence that the stochastic planner is better.

<a id="fig-aircraft-mppi-uncertainty"></a>

<a id="Lq9R6nKe7g"></a>
![Left: the predicted terminal-error 10th–90th percentile range from the current
planning ensemble. The conditional-mean planner has one deterministic future,
so its band has zero width. Right: conditional scenario endpoints at one
replanning time, with the 1 km arrival region. These small-ensemble ranges are
forecast diagnostics, not calibrated confidence regions or constraints.](../Assets/Website/b3868abc93-wind_uncertainty-da717caa7b0680022d262b6efbf67184.svg)

[Figure 5:](#fig-aircraft-mppi-uncertainty "Link to this figure")Left: the predicted terminal-error 10th–90th percentile range from the current planning ensemble. The conditional-mean planner has one deterministic future, so its band has zero width. Right: conditional scenario endpoints at one replanning time, with the 1 km arrival region. These small-ensemble ranges are forecast diagnostics, not calibrated confidence regions or constraints.

Increasing the number of candidate samples and increasing the number of wind scenarios address different approximations. Candidate counts of $16,32,64,128$ are compared at $L=6$; scenario counts of $1,3,6,12,24$ are compared at $K=32$. Four independent planning seeds are used at the initial full-trip decision. Each resulting plan is evaluated on 128 fresh, shared wind futures that no optimizer saw. This separates variation in the candidate search from variation in the estimated expected cost. Two projected updates need not improve monotonically with either sample count, and this first-decision check does not establish convergence of the entire feedback policy.

The endpoint comparisons in the recorded sweep are:

| Varied budget | Fixed budget | Mean held-out cost at the smaller budget | Mean held-out cost at the larger budget |
| --- | --- | --- | --- |
| $K:16\to128$ | $L=6$ | $57{,}396$ | $50{,}110$ |
| $L:1\to24$ | $K=32$ | $58{,}353$ | $51{,}319$ |

Costs are in kg-equivalent and include large penalties for rare unsuccessful wind futures. They are not fuel totals. In the candidate-count comparison, sample standard deviations across planning seeds are $10{,}008$ and $7{,}338$. Intermediate budgets give nonmonotone results, so these endpoints show sensitivity to sampling budgets without establishing convergence.

The [flight diagnostics](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/3cc30d7a35-metrics-a9ac709b7f9e1f3e53ac528c9ad56a8a.json) include fuel, arrival errors, fine-grid residuals, effective sample sizes, accepted and rejected updates, runtimes, and the sampling study. The local replay displays the corresponding paths and observations. To extend the experiment, increase the number of independent realized winds before drawing conclusions about reliability, and compare the gain from a richer control parameterization with the gain from more samples.

<a id="QYxO30Mqbx"></a>

[Démonstration interactive — Montréal–Toronto stochastic flight replay](https://pierrelucbacon.com/interactive/aircraft-mppi.html)

Select a controller and replay the recorded flight. The displayed forecast belongs to the most recent planning decision, while the gust display follows the observed realized wind.

<a id="summary-and-outlook"></a>

## Summary and Outlook

MPPI begins with the single-shooting rollout and changes how its candidate inputs are combined. A reference distribution favors small inputs; exponential state-cost weights favor useful trajectories; a Gaussian fit turns the resulting distribution into a stored control sequence. Importance correction preserves the target when samples are drawn around a nonzero nominal sequence.

The aircraft application separates control exploration from wind uncertainty and averages wind costs before assigning a candidate its weight. Increasing the number of candidate controls and increasing the number of wind futures address different estimation errors. Neither guarantees that a weighted mean is feasible or improves the cost, so candidate updates are validated before they replace the stored plan.

The controller still needs an execution rule. Applying one action, observing the result, and solving again provides feedback even though each stored sequence is open loop. [Receding-horizon control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md) develops that rule further, including the choice of horizon, terminal conditions, and feasibility safeguards. These questions apply whether the planner uses derivatives or sampled trajectories.

The method’s name also reflects a connection to expectations over entire stochastic paths. [Path-integral stochastic control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md), after stochastic dynamic programming, develops that connection and states the additional assumptions under which path weighting yields an optimal current feedback action.

<a id="computational-sources"></a>

## Computational Sources

The aircraft experiments use small numerical modules and read precomputed results when the book is built. The evaluator averages each candidate’s costs over a shared ensemble of possible wind futures.

-   [Gaussian importance weights and mean updates](https://pierrelucbacon.com/rlbook/build/mppi_control-0c830a2b265df882d92a3516f65b6185.py)
    
-   [Aircraft model, wind scenarios, and trajectory optimizer](https://pierrelucbacon.com/rlbook/build/aircraft_mppi-147cbc440efa9439a43626cd7004f3b4.py)
    
-   [Aircraft experiment and figure generator](https://pierrelucbacon.com/rlbook/build/build_aircraft_mppi_-4b7bd3f0e2e46e19a7a2fb50945e6643.py)
    
-   [ERA5 numerical snapshot](https://pierrelucbacon.com/rlbook/build/era5_wind-ccf3fa645fb1fcae71519b6897d0e143.npz) and [provenance and checksums](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/112f6a090f-era5_wind-ad3d7065ebb2bd6178fdcfce05d47e8a.json)
    

The experiment scripts record the physical parameters, planner settings, seeds, and validation diagnostics alongside their results. The [aircraft replay](https://pierrelucbacon.com/rlbook/build/aircraft-mppi-e065fbfce5cd9a8e42b7999fe30727ad.html) displays recorded simulations without a Python kernel. Regeneration commands are in the repository README.

<a id="exercises"></a>

## Exercises

<a id="ex-mppi-weights"></a>

[Exercise 1](#ex-mppi-weights "Link to this Exercise") (Weights and control updates)

An MPPI iteration has scalar nominal control $u=0$, perturbations $(-1,0,1)$, corrected trajectory costs $(\log4,\log2,0)$, and $\lambda=1$.

**(a)** Compute the normalized weights and the updated control.

**(b)** Add 1000 to every cost. Explain why the mathematical update is unchanged and how to compute it without numerical underflow.

**(c)** Keep the corrected costs fixed and let $\lambda$ approach zero. Which perturbation determines the limiting update?

Solution to [Exercise 1](#ex-mppi-weights)

**(a)** The unnormalized weights are $(1/4,1/2,1)$, whose sum is $7/4$. The normalized weights are $(1/7,2/7,4/7)$, giving $u^+=-(1/7)+(4/7)=3/7$.

**(b)** The common factor $e^{-1000}$ cancels between numerator and denominator. Direct evaluation would underflow in ordinary floating-point arithmetic. Subtracting the minimum corrected cost before exponentiating recovers the original three weights.

**(c)** The unique minimum cost belongs to perturbation 1. Its normalized weight approaches one, so $u^+\to1$. The qualification that corrected costs are fixed matters: a likelihood correction can itself depend on $\lambda$.

<a id="ex-mppi-likelihood-correction"></a>

[Exercise 2](#ex-mppi-likelihood-correction "Link to this Exercise") (The likelihood correction)

Consider the deterministic rollout $x_{k+1}=x_k+hv_k$ with $x_0=0$, target $a=1$, $N=10$ intervals of length $h=0.1$, and terminal cost $\tfrac\kappa2(x_N-a)^2$ with $\kappa=4$. Set $\lambda=0.5$ and choose a Gaussian reference covariance $\Sigma_h=\lambda/(rh)$ with $r=1$, so its KL penalty gives the quadratic mean-control effort. The proposal mean is $u_k=0.4$ at every step.

**(a)** Complete the square in the Gibbs density to find its mean. You may use the fact that the mean of a Gaussian equals the minimizer of the quadratic in its negative log density.

**(b)** Find the mean estimated when the weights include the state cost but omit the reference-to-proposal density ratio.

**(c)** Implement both estimators and compare their mean control, averaged over the ten time slots, as the sample count increases. Does increasing the sample count correct the discrepancy in part (b)?

Solution to [Exercise 2](#ex-mppi-likelihood-correction)

**(a)** Up to a constant, the negative log Gibbs density is

<a id="p5anaPv2M6"></a>

$$
\frac{rh}{2\lambda}\sum_kv_k^2
+\frac\kappa{2\lambda}\left(h\sum_kv_k-a\right)^2.
$$

[(34)](#p5anaPv2M6 "Link to this Equation")

Its first-order condition is $r v_k+\kappa(h\sum_jv_j-a)=0$. All coordinates of its minimizer are equal, giving

<a id="NSpdDO0Zzs"></a>

$$
\mathbb E_{P^\star}v_k=\frac{\kappa a}{r+\kappa Nh}=0.8.
$$

[(35)](#NSpdDO0Zzs "Link to this Equation")

The result is independent of the proposal mean because the likelihood ratio cancels the proposal density in the expectation.

**(b)** Omitting that ratio replaces the reference quadratic $\sum_kv_k^2$ by $\sum_k(v_k-0.4)^2$. The corresponding first-order condition is $r(v_k-0.4)+\kappa(h\sum_jv_j-a)=0$, so its mean is

<a id="gxeCS45AWI"></a>

$$
\frac{0.4r+\kappa a}{r+\kappa Nh}=0.88.
$$

[(36)](#gxeCS45AWI "Link to this Equation")

Thus the two procedures converge to different expectations.

**(c)** A minimal implementation uses the same perturbations for both estimates so that their difference is easier to observe:

```python
import numpy as np

rng = np.random.default_rng(728)
N, h, r, kappa, lam = 10, 0.1, 1.0, 4.0, 0.5
U = np.full(N, 0.4)
for K in (1_000, 10_000, 100_000):
    eps = rng.normal(size=(K, N)) * np.sqrt(lam / (r * h))
    inputs = U + eps
    cost = 0.5 * kappa * (h * inputs.sum(axis=1) - 1.0) ** 2
    corrected = cost + h * r * (eps @ U)
    estimates = []
    for scores in (corrected, cost):
        weights = np.exp(-(scores - scores.min()) / lam)
        weights /= weights.sum()
        estimates.append((weights @ inputs).mean())
    print(K, *estimates)
```

The estimates approach 0.8 and 0.88. More samples reduce Monte Carlo error; they do not repair an omitted likelihood ratio. Individual runs need not approach their limits monotonically.

<a id="ex-mppi-aircraft-expected-cost"></a>

[Exercise 3](#ex-mppi-aircraft-expected-cost "Link to this Exercise") (Stochastic aircraft rollouts and expected cost)

An aircraft simulator accepts a control sequence $\mathbf U$ and a gust history $W$, and returns cost $C(\mathbf U,W)$. The objective is $\mathbb E_W C(\mathbf U,W)$.

**(a)** A sampling optimizer generates one gust history per candidate control sequence and assigns weight proportional to $e^{-C(\mathbf U,W)/\lambda}$. Explain why collecting more such weighted samples does not generally recover the intended expected-cost objective.

**(b)** Consider a safe candidate with constant cost 1 and a risky candidate with cost 0 with probability 0.9 and 20 with probability 0.1. At $\lambda=1$, compare their expected costs and their exponential scores $-\log\mathbb E[e^{-C}]$.

**(c)** Describe a sampling design that ranks candidate controls by an estimate of expected cost. Does this design guarantee that the weighted mean is optimal or feasible?

Solution to [Exercise 3](#ex-mppi-aircraft-expected-cost)

**(a)** For a fixed candidate, averaging the weights estimates $\mathbb E_W[e^{-C/\lambda}]$, whereas the desired score depends on $\mathbb E_W C$. The exponential is nonlinear. Favorable gust histories receive disproportionate weight, so this procedure can favor a candidate whose expected cost is larger. The reference-to-proposal correction for control sampling does not remove this difference in the disturbance objective.

**(b)** The safe candidate has expected cost 1 and exponential score 1. The risky candidate has expected cost 2 but exponential score $-\log(0.9+0.1e^{-20})\approx0.105$. Expected cost favors the safe candidate; the exponential score favors the risky candidate.

**(c)** For each candidate, simulate multiple gust histories and form $\widehat C(\mathbf U)=L^{-1}\sum_{\ell=1}^L C(\mathbf U,W^{(\ell)})$. Then use $\widehat C$ as the candidate score in the sampling optimizer. Shared gust histories across candidates can make paired comparisons less variable. As the number of disturbance samples increases, this score estimates the intended expected cost. The subsequent Gaussian mean fit need not minimize that cost over deterministic plans. Finite sampling introduces further error, and an average of feasible plans may violate nonconvex constraints. The proposed plan still needs cost and feasibility checks.

<a id="ex-mppi-execution"></a>

[Exercise 4](#ex-mppi-execution "Link to this Exercise") (Shifting a plan and checking its mean)

A controller stores $(u_0,u_1,u_2)=(0.6,0.4,0.2)$ for three intervals. After the first interval it observes a new state.

**(a)** Which control was executed, and what sequence initializes the next planning problem if the final control is repeated? What other input to the rollout changes at this observation?

**(b)** Consider the separate one-step system $x_1=u$ with terminal constraint $x_1\in[-1.1,-0.9]\cup[0.9,1.1]$. Two feasible candidates are $u=-1$ and $u=1$. Is their equally weighted mean feasible? What should an implementation with a validated incumbent do if this mean is proposed?

Solution to [Exercise 4](#ex-mppi-execution)

**(a)** The controller executed 0.6. Its shifted initial guess is $(0.4,0.2,0.2)$, and the measured state becomes the initial state for every new rollout. The guess is then updated by sampling; it is not a commitment to execute all three entries.

**(b)** The mean is $u=0$, which produces $x_1=0$ outside both allowed intervals. Feasible samples do not ensure a feasible mean under nonconvex constraints. The implementation should validate the proposal and retain the feasible incumbent when that validation fails, as in the aircraft example.

<a id="self-checks"></a>

## Self-checks

<a id="ex-mppi-check-feedback"></a>

[Exercise 5](#ex-mppi-check-feedback "Link to this Exercise") (Sampling and feedback)

What makes the executed controller a feedback controller: drawing many trajectories, or conditioning a new plan on the next observed state?

Solution to [Exercise 5](#ex-mppi-check-feedback)

Conditioning a new plan on the observed state supplies feedback. A control sequence computed from many samples and then frozen still executes open loop.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Williams2017InformationTheoretic"></a>
2.  Williams, G., Drews, P., Goldfain, B., Rehg, J. M., & Theodorou, E. A. (2017). _Information Theoretic Model Predictive Control: Theory and Applications to Autonomous Driving_. [10.48550/arXiv.1707.02342](https://doi.org/10.48550/arXiv.1707.02342)
<a id="cite-williams2017mppi"></a>
4.  Williams, G., Aldrich, A., & Theodorou, E. A. (2017). Model Predictive Path Integral Control: From Theory to Parallel Computation. _Journal of Guidance, Control, and Dynamics_, _40_(2), 344–357. [10.2514/1.G001921](https://doi.org/10.2514/1.G001921)
<a id="cite-Pan2024ModelBasedDiffusion"></a>
6.  Pan, C., Yi, Z., Shi, G., & Qu, G. (2024). Model-Based Diffusion for Trajectory Optimization. _Advances in Neural Information Processing Systems_, _37_. [https://proceedings.neurips.cc/paper\_files/paper/2024/file/6a5c38a730b17f3827c09cf6b192be04-Paper-Conference.pdf](https://proceedings.neurips.cc/paper_files/paper/2024/file/6a5c38a730b17f3827c09cf6b192be04-Paper-Conference.pdf)
<a id="cite-Sun2022"></a>
8.  Sun, J. (2022). OpenAP.top: Open Flight Trajectory Optimization for Air Transport and Sustainability Research. _Aerospace_, _9_(7), 383. [10.3390/aerospace9070383](https://doi.org/10.3390/aerospace9070383)
<a id="cite-ERA5PressureLevels2018"></a>
10.  Copernicus Climate Change Service (C3S). (2018). _ERA5 hourly data on pressure levels from 1940 to present_. Copernicus Climate Change Service (C3S) Climate Data Store (CDS). [10.24381/cds.bd0915c6](https://doi.org/10.24381/cds.bd0915c6)

[

Open-Loop Optimal Control

Continuous-Time Transcription and Collocation


](10-continuous-time-collocation.md)[

Feedback Control

Receding-Horizon Control


](12-receding-horizon-control.md)


---

# CHAPITRE 12 — Receding-Horizon Control

Section du livre : Feedback Control

Page originale : https://pierrelucbacon.com/rlbook/receding-horizon-control

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md

> **Cours de Pierre-Luc Bacon — 12.** [Page publiée](https://pierrelucbacon.com/rlbook/receding-horizon-control) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/12-receding-horizon-control.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Receding-Horizon Control

<a id="skip-to-article"></a>

An open-loop trajectory specifies controls from an initial state to a final time. During execution, the control $\mathbf u_t$ depends only on the clock, reading precomputed values or interpolating between them. The [MPPI examples](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi) already used a different execution rule: apply one action, observe the new state, and update the remaining plan. Receding-horizon control applies this rule to any suitable finite-horizon optimizer, including the transcription methods developed in the preceding chapters.

Real systems face modeling errors, external disturbances, and measurement noise that accumulate over time. A precomputed trajectory becomes increasingly irrelevant as these perturbations push the actual system state away from the predicted path. The solution is to incorporate feedback, making control decisions that respond to the current state rather than blindly following a predetermined schedule. While dynamic programming provides the theoretical framework for deriving feedback policies through value functions and Bellman equations, there exists a more direct approach that leverages the trajectory optimization methods already developed.

Can the finite-horizon planner itself become a feedback controller by solving again whenever a new state is measured?

<a id="closing-the-loop-by-replanning"></a>

## Closing the Loop by Replanning

Which action from each finite-horizon solution should be applied before the state is measured and the horizon is shifted forward?

Model Predictive Control creates a feedback controller by repeatedly solving trajectory optimization problems. Rather than computing a single trajectory for the entire task duration, MPC solves a finite-horizon problem at each time step, starting from the current measured state. The controller then applies only the first control action from this solution before repeating the entire process. This strategy transforms any trajectory optimization method into a feedback controller.

The battery example in [Model Interfaces](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/05-model-interfaces.md#fast-charging-when-resistance-drifts) used a transparent current governor: it tested a local voltage and thermal envelope after updating one resistance parameter. MPC retains that structured model but optimizes an entire future current sequence and repeats the optimization as measurements arrive.

<a id="the-receding-horizon-principle"></a>

### The Receding Horizon Principle

The defining characteristic of MPC is its receding horizon strategy. At each time step, the controller solves an optimization problem looking a fixed duration into the future, but this prediction window constantly moves forward in time. The horizon “recedes” because it always starts from the current time and extends forward by the same amount.

Consider the discrete-time optimal control problem in Bolza form:

<a id="QDGrQtjfvV"></a>

$$
\begin{aligned}
\text{minimize} \quad & c_N(\mathbf{x}_N) + \sum_{k=0}^{N-1} c_k(\mathbf{x}_k, \mathbf{u}_k) \\
\text{subject to} \quad & \mathbf{x}_{k+1} = \mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k) \\
& \mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0} \\
& \mathbf{x}_{\text{min}} \leq \mathbf{x}_k \leq \mathbf{x}_{\text{max}} \\
& \mathbf{u}_{\text{min}} \leq \mathbf{u}_k \leq \mathbf{u}_{\text{max}} \\
\text{given} \quad & \mathbf{x}_0 = \mathbf{x}_{\text{current}}
\end{aligned}
$$

[(1)](#QDGrQtjfvV "Link to this Equation")

This is the Bolza problem of [Finite-Horizon Optimal Control Problems](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md), with its index counted from the current time rather than from the start of the task. If the state is measured at time $t$, then $\mathbf x_0=\mathbf x_{\text{current}}$ is that measurement, $\mathbf x_k$ is the state predicted for time $t+k$, and the $N$ controls $\mathbf u_0,\ldots,\mathbf u_{N-1}$ span the prediction horizon, as in the MPPI algorithm. For a time-varying task, $c_k$, $\mathbf f_k$, and $\mathbf g_k$ are the stage cost, dynamics, and constraints of time $t+k$. The terminal cost $c_N$ is charged at the end of the prediction horizon, not at the end of the task.

At time step $t$, this problem optimizes over the interval $[t, t+N]$. At the next time step $t+1$, the horizon shifts to $[t+1, t+N+1]$. What makes this work is that only the first control $\mathbf{u}_0^\star$ from each optimization is applied. The remaining controls $\mathbf{u}_1^\star, \ldots, \mathbf{u}_{N-1}^\star$ are discarded, though they may initialize the next optimization through warm-starting.

This receding horizon principle enables feedback without computing an explicit policy. By constantly updating predictions based on current measurements, MPC naturally corrects for disturbances and model errors. The apparent waste of computing but not using most of the trajectory is actually the mechanism that provides robustness.

<a id="horizon-selection-and-problem-formulation"></a>

### Horizon Selection and Problem Formulation

The choice of prediction horizon depends on the control objective. We distinguish between three cases, each requiring different mathematical formulations.

<a id="infinite-horizon-regulation"></a>

#### Infinite-Horizon Regulation

For stabilization problems where the system must operate indefinitely around an equilibrium, the dynamics, constraints, and stage cost are usually time-invariant, so we drop their index: $\mathbf f_k=\mathbf f$, $\mathbf g_k=\mathbf g$, and $c_k=c$. The true objective is:

<a id="raBPOBqQVy"></a>

$$
J_\infty = \sum_{k=0}^{\infty} c(\mathbf{x}_k, \mathbf{u}_k)
$$

[(2)](#raBPOBqQVy "Link to this Equation")

Since this cannot be solved directly, MPC approximates it with:

<a id="Lms0M1uSDE"></a>

$$
\begin{aligned}
\text{minimize} \quad & c_N(\mathbf{x}_N) + \sum_{k=0}^{N-1} c(\mathbf{x}_k, \mathbf{u}_k) \\
\text{subject to} \quad & \mathbf{x}_{k+1} = \mathbf{f}(\mathbf{x}_k, \mathbf{u}_k) \\
& \mathbf{x}_N \in \mathcal{X}_f \\
& \text{other constraints}
\end{aligned}
$$

[(3)](#Lms0M1uSDE "Link to this Equation")

The terminal cost $c_N(\mathbf{x}_N)$ approximates $\sum_{k=N}^{\infty} c(\mathbf{x}_k, \mathbf{u}_k)$, the cost-to-go beyond the horizon. The terminal constraint $\mathbf{x}_N \in \mathcal{X}_f$ ensures the state reaches a region where a known stabilizing controller exists. Without these terminal ingredients, the finite-horizon approximation may produce unstable behavior, as the controller ignores consequences beyond the horizon.

<a id="finite-duration-tasks"></a>

#### Finite-Duration Tasks

For a task ending at time $T$, the true objective from the current time $t$ is the remaining part of the Bolza objective, written in absolute time:

<a id="H38Lt23PFV"></a>

$$
J_{[t, T]} = c_T(\mathbf{x}_T) + \sum_{s=t}^{T-1} c_s(\mathbf{x}_s, \mathbf{u}_s)
$$

[(4)](#H38Lt23PFV "Link to this Equation")

The MPC formulation must adapt as time progresses. While the end of the task lies beyond the prediction horizon, the subproblem keeps the surrogate terminal cost $c_N$. Once $t+N\geq T$, the horizon shrinks to the $T-t$ remaining steps:

<a id="k6WMNA6yW2"></a>

$$
\text{minimize} \quad
\begin{cases}
c_N(\mathbf{x}_N) + \displaystyle\sum_{k=0}^{N-1} c_k(\mathbf{x}_k, \mathbf{u}_k), & t+N < T, \\[2ex]
c_T(\mathbf{x}_{T-t}) + \displaystyle\sum_{k=0}^{T-t-1} c_k(\mathbf{x}_k, \mathbf{u}_k), & t+N \geq T.
\end{cases}
$$

[(5)](#k6WMNA6yW2 "Link to this Equation")

In the second case, $\mathbf{x}_{T-t}$ is the prediction of the final state $\mathbf{x}_T$, so the task’s own terminal cost applies. As the task approaches completion, the horizon shrinks and the terminal cost switches from the approximation $c_N$ to the true final cost $c_T$. This prevents the controller from optimizing beyond task completion, which would produce meaningless or aggressive control actions.

<a id="periodic-tasks"></a>

#### Periodic Tasks

Some systems operate on repeating cycles where the optimal behavior depends on the time of day, week, or season. Consider a commercial building where heating costs are higher at night, electricity prices vary hourly, and occupancy patterns repeat daily. The MPC controller must account for these periodic patterns while planning over a finite horizon.

For tasks with period $T_p$, such as daily building operations, the formulation accounts for transitions across period boundaries:

<a id="yxECrsPled"></a>

$$
\begin{aligned}
\text{minimize} \quad & \sum_{k=0}^{N-1} c_k(\mathbf{x}_k, \mathbf{u}_k) \\
\text{where} \quad & \varphi_k = (t + k) \mod T_p \\
& c_k = \begin{cases}
c_{\text{day}} & \text{if } \varphi_k \in [6\text{am}, 6\text{pm}] \\
c_{\text{night}} & \text{otherwise}
\end{cases}
\end{aligned}
$$

[(6)](#yxECrsPled "Link to this Equation")

The stage cost $c_k$ changes with the phase $\varphi_k$ of the predicted time $t+k$ within the period. Constraints may similarly depend on the phase, reflecting different operational requirements at different times.

<a id="the-mpc-algorithm"></a>

### The MPC Algorithm

The complete MPC procedure implements the receding horizon principle through repeated optimization:

<a id="alg-mpc-complete"></a>

[Algorithm 1](#alg-mpc-complete "Link to this Algorithm") (Model Predictive Control with Horizon Management)

**Input:**

-   Nominal prediction horizon $N$
    
-   Sampling period $\Delta t$
    
-   Task type: {infinite, finite ending at time $T$, periodic with period $T_p$}
    
-   Cost functions and dynamics
    
-   Constraints
    

**Procedure:**

1.  Initialize time $t \leftarrow 1$
    
2.  Measure initial state $\mathbf{x}_{\text{current}}$
    
3.  **While** task continues:
    
    4.  **Determine effective horizon and costs:**
        
        -   If infinite task:
            
            -   $N_t \leftarrow N$
                
            -   Use terminal cost $c_N$ and constraint $\mathcal{X}_f$
                
        -   If finite task:
            
            -   $N_t \leftarrow \min(N, T - t)$
                
            -   If $t + N_t = T$: use final cost $c_T$
                
            -   Otherwise: use approximation $c_N$
                
        -   If periodic task:
            
            -   $N_t \leftarrow N$
                
            -   Adjust costs/constraints based on phase
                
    5.  **Solve optimization:** Minimize over $\mathbf{u}_{0:N_t-1}$ subject to dynamics, constraints, and $\mathbf{x}_0 = \mathbf{x}_{\text{current}}$
        
    6.  **Apply receding horizon control:**
        
        -   Extract $\mathbf{u}^\star_0$ from solution
            
        -   Apply to system for duration $\Delta t$
            
        -   Measure new state $\mathbf{x}_{\text{current}}$
            
        -   Advance time: $t \leftarrow t + 1$
            
4.  **End While**
    

<a id="successive-linearization-and-quadratic-approximations"></a>

### Successive Linearization and Quadratic Approximations

The [iLQR and DDP chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/09-iterative-trajectory-optimization.md) develops successive approximation as a way to improve one finite-horizon plan. Such a solver can also be used inside MPC: solve from the newly observed state, execute the first action, and repeat. Its backward-pass feedback gains and the outer decision to replan are distinct operations.

For many regulation and tracking problems, the nonlinear dynamics and costs we encounter can be approximated locally by linear and quadratic functions. The basic idea is to linearize the system around the current operating point and approximate the cost with a quadratic form. This reduces each MPC subproblem to a **quadratic program (QP)**, which can be solved reliably and very quickly using standard solvers.

Suppose the true dynamics are nonlinear,

<a id="EeLrJLm13p"></a>

$$
\mathbf{x}_{k+1} = \mathbf{f}_k(\mathbf{x}_k,\mathbf{u}_k).
$$

[(7)](#EeLrJLm13p "Link to this Equation")

Around a nominal trajectory $(\bar{\mathbf{x}}_k,\bar{\mathbf{u}}_k)$, we take a first-order expansion:

<a id="m4Rh8GA99A"></a>

$$
\mathbf{x}_{k+1} \approx \mathbf{f}_k(\bar{\mathbf{x}}_k,\bar{\mathbf{u}}_k) 
+ A_k(\mathbf{x}_k - \bar{\mathbf{x}}_k) 
+ B_k(\mathbf{u}_k - \bar{\mathbf{u}}_k),
$$

[(8)](#m4Rh8GA99A "Link to this Equation")

with the same Jacobians as in the iLQR derivation,

<a id="IdCcJqpJhs"></a>

$$
A_k = \left.\frac{\partial \mathbf{f}_k}{\partial \mathbf{x}}\right|_{(\bar{\mathbf{x}}_k,\bar{\mathbf{u}}_k)}, 
\qquad
B_k = \left.\frac{\partial \mathbf{f}_k}{\partial \mathbf{u}}\right|_{(\bar{\mathbf{x}}_k,\bar{\mathbf{u}}_k)}.
$$

[(9)](#IdCcJqpJhs "Link to this Equation")

Similarly, if the stage cost is nonlinear,

<a id="vcTYsuZZtk"></a>

$$
c_k(\mathbf{x}_k,\mathbf{u}_k),
$$

[(10)](#vcTYsuZZtk "Link to this Equation")

we approximate it quadratically near the nominal point:

<a id="kyzT1AanXL"></a>

$$
c_k(\mathbf{x}_k,\mathbf{u}_k) \;\approx\; 
\|\mathbf{x}_k - \mathbf{x}_k^{\mathrm{ref}}\|_{Q_k}^2 
+ \|\mathbf{u}_k - \mathbf{u}_k^{\mathrm{ref}}\|_{R_k}^2,
$$

[(11)](#kyzT1AanXL "Link to this Equation")

with positive semidefinite weighting matrices $Q_k$ and $R_k$, where $\|\mathbf{v}\|_{Q}^2=\mathbf{v}^\top Q\,\mathbf{v}$.

The resulting MPC subproblem has the form

<a id="KbFtJKIpnj"></a>

$$
\begin{aligned}
\min_{\mathbf{x}_{0:N},\mathbf{u}_{0:N-1}} \quad &
\|\mathbf{x}_N - \mathbf{x}_N^{\mathrm{ref}}\|_{P}^2
+ \sum_{k=0}^{N-1} 
\left(
\|\mathbf{x}_k - \mathbf{x}_k^{\mathrm{ref}}\|_{Q_k}^2
+ \|\mathbf{u}_k - \mathbf{u}_k^{\mathrm{ref}}\|_{R_k}^2
\right) \\
\text{s.t.} \quad &
\mathbf{x}_{k+1} = A_k \mathbf{x}_k + B_k \mathbf{u}_k + \mathbf{d}_k, \\
& \mathbf{u}_{\min} \leq \mathbf{u}_k \leq \mathbf{u}_{\max}, \\
& \mathbf{x}_{\min} \leq \mathbf{x}_k \leq \mathbf{x}_{\max}, \\
& \mathbf{x}_0 = \mathbf{x}_{\text{current}} ,
\end{aligned}
$$

[(12)](#KbFtJKIpnj "Link to this Equation")

where $\mathbf{d}_k = \mathbf{f}_k(\bar{\mathbf{x}}_k,\bar{\mathbf{u}}_k) - A_k \bar{\mathbf{x}}_k - B_k \bar{\mathbf{u}}_k$ captures the local affine offset. The terminal weight $P$ plays the role of the terminal cost $c_N$.

Because the dynamics are now linear and the cost quadratic, this optimization problem is a convex quadratic program. Quadratic programs are attractive in practice: they can be solved at kilohertz rates with mature numerical methods, making them the backbone of many real-time MPC implementations.

At each MPC step, the controller updates its linearization around the new operating point, constructs the local QP, and solves it. The process repeats, with the linear model and quadratic cost refreshed at every reoptimization. Despite the approximation, this yields a closed-loop controller that inherits the fast computation of QPs while retaining the ability to track trajectories of the underlying nonlinear system.

<a id="theoretical-guarantees"></a>

## Theoretical Guarantees

Repeated optimization creates feedback, but which terminal ingredients make feasibility persist and the closed-loop state converge?

The finite-horizon approximation in MPC brings a new challenge: the controller cannot see consequences beyond the horizon. Without proper design, this myopia can destabilize even simple systems. The solution is to carefully encode information about the infinite-horizon problem into the finite-horizon optimization through its terminal conditions.

Before diving into the mathematics, we should first establish what “stability” means and which tasks these theoretical guarantees address, as the notion of stability varies significantly across different control objectives.

<a id="stability-notions-across-control-tasks"></a>

### Stability Notions Across Control Tasks

The terminal conditions provide different types of guarantees depending on the control objective. For regulation problems, where the task is to drive the state to a fixed equilibrium $(\mathbf{x}_\mathrm{eq}, \mathbf{u}_\mathrm{eq})$ (often shifted to the origin), the stability guarantee is **asymptotic stability**: starting sufficiently close to the equilibrium, the closed-loop state satisfies $\mathbf{x}_t \to \mathbf{x}_\mathrm{eq}$ as $t\to\infty$ while constraints remain satisfied throughout the trajectory (**recursive feasibility**). This requires the stage cost $c(\mathbf{x},\mathbf{u})$ to be positive definite in the deviation from equilibrium.

When tracking a constant setpoint, the task becomes following a constant reference $(\mathbf{x}^\mathrm{ref},\mathbf{u}^\mathrm{ref})$ that solves the steady-state equations. This problem is handled by working in **error coordinates** $\tilde{\mathbf{x}}=\mathbf{x}-\mathbf{x}^\mathrm{ref}$ and $\tilde{\mathbf{u}}=\mathbf{u}-\mathbf{u}^\mathrm{ref}$, transforming the tracking problem into a regulation problem for the error system. The stability guarantee becomes asymptotic **tracking**, meaning $\tilde{\mathbf{x}}_t \to \mathbf{0}$, again with recursive feasibility.

The terminal conditions we discuss below primarily address regulation and constant reference tracking. Time-varying tracking and economic MPC require additional techniques such as tube MPC and dissipativity theory.

<a id="mpc-with-stability-guarantees"></a>

### MPC with Stability Guarantees

To provide theoretical guarantees, the finite-horizon MPC problem is augmented with three interconnected components. The **terminal cost** $c_N(\mathbf{x})$ approximates the cost-to-go beyond the horizon, providing a surrogate for the infinite-horizon tail that cannot be explicitly optimized. The **terminal constraint set** $\mathcal{X}_f$ defines a region where we have local knowledge of how to stabilize the system. Finally, the **terminal controller** $\pi_f(\mathbf{x})$ is a local feedback policy that stabilizes the system within $\mathcal{X}_f$.

These components must satisfy specific compatibility conditions to provide theoretical guarantees:

<a id="thm-mpc-stability"></a>

[Theorem 1](#thm-mpc-stability "Link to this Theorem") (Recursive Feasibility and Asymptotic Stability)

Consider the MPC problem with terminal cost $c_N$, terminal set $\mathcal{X}_f$, and local controller $\pi_f$. If the following conditions hold:

**Control invariance**: For all $\mathbf{x} \in \mathcal{X}_f$, we have $\mathbf{f}(\mathbf{x}, \pi_f(\mathbf{x})) \in \mathcal{X}_f$ (the set is invariant) and $\mathbf{g}(\mathbf{x}, \pi_f(\mathbf{x})) \leq \mathbf{0}$ (constraints remain satisfied).

**Lyapunov decrease**: For all $\mathbf{x} \in \mathcal{X}_f$:

<a id="um9GZg0PlO"></a>

$$
c_N(\mathbf{f}(\mathbf{x}, \pi_f(\mathbf{x}))) - c_N(\mathbf{x}) \leq -c(\mathbf{x}, \pi_f(\mathbf{x}))
$$

[(13)](#um9GZg0PlO "Link to this Equation")

where $c$ is the stage cost.

Then the MPC controller achieves recursive feasibility (if the problem is feasible at time $t$, it remains feasible at time $t+1$), asymptotic stability to the target equilibrium for regulation problems, and monotonic cost decrease along trajectories until the target is reached.

<a id="suboptimality-bounds"></a>

### Suboptimality Bounds

The finite-horizon MPC value $V_N(\mathbf{x})$ provides an upper bound approximation of the true infinite-horizon value $V_\infty(\mathbf{x})$. Understanding how close this approximation can be tells us about the effectiveness of short-horizon MPC.

The upper bound $V_N(\mathbf{x}) \geq V_\infty(\mathbf{x})$ follows immediately from the fact that MPC considers fewer control choices. The infinite-horizon controller can choose any sequence $(\mathbf{u}_0, \mathbf{u}_1, \mathbf{u}_2, \ldots)$, while the $N$\-horizon controller is restricted to sequences of the form $(\mathbf{u}_0, \ldots, \mathbf{u}_{N-1}, \pi_f(\mathbf{x}_N), \pi_f(\mathbf{x}_{N+1}), \ldots)$ where the tail follows the fixed terminal controller. Since the infinite-horizon problem optimizes over a larger feasible set, its optimal value cannot exceed that of the finite-horizon problem.

<a id="deriving-the-approximation-error"></a>

#### Deriving the Approximation Error

The interesting question is bounding the approximation error $\varepsilon_N = V_N(\mathbf{x}) - V_\infty(\mathbf{x})$. This error represents the cost of being forced to use $\pi_f$ beyond the horizon rather than continuing to optimize.

Let $(\mathbf{u}_0^\star, \mathbf{u}_1^\star, \ldots)$ denote the infinite-horizon optimal control sequence with corresponding state trajectory $(\mathbf{x}_0^\star, \mathbf{x}_1^\star, \ldots)$ where $\mathbf{x}_0^\star = \mathbf{x}$. The infinite-horizon cost is:

<a id="bihkrELZcX"></a>

$$
V_\infty(\mathbf{x}) = \sum_{k=0}^{\infty} c(\mathbf{x}_k^\star, \mathbf{u}_k^\star)
$$

[(14)](#bihkrELZcX "Link to this Equation")

Now consider what happens when we truncate this optimal sequence at horizon $N$ and continue with the terminal controller. The cost becomes:

<a id="PX0o50Yu5J"></a>

$$
\tilde{V}_N(\mathbf{x}) = \sum_{k=0}^{N-1} c(\mathbf{x}_k^\star, \mathbf{u}_k^\star) + c_N(\mathbf{x}_N^\star)
$$

[(15)](#PX0o50Yu5J "Link to this Equation")

where $c_N(\mathbf{x}_N^\star)$ approximates the tail cost $\sum_{k=N}^{\infty} c(\mathbf{x}_k^\star, \mathbf{u}_k^\star)$.

Since $V_N(\mathbf{x})$ is the optimal $N$\-horizon cost (which may do better than this particular truncated sequence), we have $V_N(\mathbf{x}) \leq \tilde{V}_N(\mathbf{x})$. The approximation error therefore satisfies:

<a id="oT5RBiYk0H"></a>

$$
\varepsilon_N \leq \tilde{V}_N(\mathbf{x}) - V_\infty(\mathbf{x}) = c_N(\mathbf{x}_N^\star) - \sum_{k=N}^{\infty} c(\mathbf{x}_k^\star, \mathbf{u}_k^\star)
$$

[(16)](#oT5RBiYk0H "Link to this Equation")

This bound shows that the approximation error depends on how well the terminal cost $c_N$ approximates the true tail cost along the infinite-horizon optimal trajectory.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Receding-horizon control turns a finite-horizon optimizer into feedback by reinitializing it from each measured state and applying only the first planned action. Terminal costs, terminal sets, and invariant local controllers connect the truncated problem to recursive feasibility and stability.

The basic loop leaves several design choices unresolved. How should the same replanning mechanism represent tracking, economic objectives, uncertainty, hybrid decisions, solver failures, and hard real-time deadlines? [MPC variants and reliable operation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/13-mpc-variants-reliability.md) organize those choices.

<a id="self-checks"></a>

## Self-checks

<a id="ex-mpc-check-1"></a>

[Exercise 1](#ex-mpc-check-1 "Link to this Exercise") (Receding horizon)

An MPC solver returns a sequence $(\mathbf{u}_0^\star,\ldots,\mathbf{u}_{N-1}^\star)$. Which controls are normally applied before the problem is solved again?

Solution to [Exercise 1](#ex-mpc-check-1)

Only the first control (or first short control block) is applied. The state is measured again and the horizon is shifted before re-optimizing.

<a id="ex-mpc-check-2"></a>

[Exercise 2](#ex-mpc-check-2 "Link to this Exercise") (Terminal ingredients)

What roles do a terminal cost and a terminal constraint play in finite-horizon MPC?

Solution to [Exercise 2](#ex-mpc-check-2)

The terminal cost approximates value beyond the horizon; the terminal constraint can keep the endpoint in a region from which a known controller remains feasible and stable.

<a id="ex-mpc-check-3"></a>

[Exercise 3](#ex-mpc-check-3 "Link to this Exercise") (Disturbance response)

Why does resolving the same finite-horizon optimization after each measurement provide feedback even if the prediction model is deterministic?

Solution to [Exercise 3](#ex-mpc-check-3)

The newly measured state contains the accumulated effect of disturbances and model error. Reinitializing the optimization from that state changes the planned controls accordingly.

[

Open-Loop Optimal Control

Model Predictive Path Integral Control


](11-model-predictive-path-integral-control.md)[

Feedback Control

MPC Variants and Reliable Operation


](13-mpc-variants-reliability.md)


---

# CHAPITRE 13 — MPC Variants and Reliable Operation

Section du livre : Feedback Control

Page originale : https://pierrelucbacon.com/rlbook/mpc-variants-reliability

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/13-mpc-variants-reliability.md

> **Cours de Pierre-Luc Bacon — 13.** [Page publiée](https://pierrelucbacon.com/rlbook/mpc-variants-reliability) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/13-mpc-variants-reliability.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# MPC Variants and Reliable Operation

<a id="skip-to-article"></a>

Receding-horizon control supplies feedback by repeatedly solving one nominal finite-horizon problem. How must that problem and its surrounding controller change when the task tracks a reference, values economic output, contains uncertainty or discrete modes, or misses its solver deadline?

Once the basic idea of receding-horizon control is clear, it is helpful to see how the same backbone accommodates many variations. In every case, we transcribe the continuous-time optimal control problem into a nonlinear program with the structure of the [receding-horizon subproblem](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/12-receding-horizon-control.md#the-receding-horizon-principle):

<a id="bqGsROLNWa"></a>

$$
\begin{aligned}
    \text{minimize} \quad & c_N(\mathbf{x}_N) + \sum_{k=0}^{N-1} c_k(\mathbf{x}_k, \mathbf{u}_k) \\
    \text{subject to} \quad & \mathbf{x}_{k+1} = \mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k) \\
                            & \mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0} \\
                            & \mathbf{x}_{\min} \leq \mathbf{x}_k \leq \mathbf{x}_{\max} \\
                            & \mathbf{u}_{\min} \leq \mathbf{u}_k \leq \mathbf{u}_{\max} \\
    \text{given} \quad & \mathbf{x}_0 = \mathbf{x}_{\text{current}} \enspace .
\end{aligned}
$$

[(1)](#bqGsROLNWa "Link to this Equation")

The components in this NLP come from discretizing the continuous-time problem over a prediction horizon of $N$ steps of length $\Delta t$, starting at the current time. The discrete transition $\mathbf{f}_k$ is determined by the integration scheme, and each stage cost $c_k$ includes the quadrature weight of its interval, as in the [collocation transcriptions](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md). With this blueprint in place, the rest is a matter of interpretation: how we define the cost, how we handle uncertainty, how we treat constraints, and what structure we exploit.

<a id="tracking-mpc"></a>

## Tracking MPC

How should the finite-horizon objective penalize deviation from a time-varying reference trajectory?

The most common setup is reference tracking. Here, we are given time-varying target trajectories $(\mathbf{x}_k^{\mathrm{ref}}, \mathbf{u}_k^{\mathrm{ref}})$, and the controller’s job is to keep the system close to these. The cost is typically quadratic:

<a id="exQvF7sOqA"></a>

$$
\begin{aligned}
    c_k(\mathbf{x}_k, \mathbf{u}_k) &= \| \mathbf{x}_k - \mathbf{x}_k^{\mathrm{ref}} \|_{Q}^2 + \| \mathbf{u}_k - \mathbf{u}_k^{\mathrm{ref}} \|_{R}^2 \\
    c_N(\mathbf{x}_N) &= \| \mathbf{x}_N - \mathbf{x}_N^{\mathrm{ref}} \|_{P}^2 \enspace .
\end{aligned}
$$

[(2)](#exQvF7sOqA "Link to this Equation")

When dynamics are linear and constraints are polyhedral, this yields a convex quadratic program at each time step.

<a id="regulatory-mpc"></a>

## Regulatory MPC

What changes when the target is a fixed equilibrium rather than a moving reference?

In regulation tasks, we aim to bring the system back to an equilibrium point $(\mathbf{x}_{\mathrm{eq}}, \mathbf{u}_{\mathrm{eq}})$, typically in the presence of disturbances. This is simply tracking MPC with constant references, so the stage cost no longer depends on $k$:

<a id="USuwbTkODG"></a>

$$
\begin{aligned}
    c(\mathbf{x}_k, \mathbf{u}_k) &= \| \mathbf{x}_k - \mathbf{x}_{\mathrm{eq}} \|_{Q}^2 + \| \mathbf{u}_k - \mathbf{u}_{\mathrm{eq}} \|_{R}^2 \\
    c_N(\mathbf{x}_N) &= \| \mathbf{x}_N - \mathbf{x}_{\mathrm{eq}} \|_{P}^2 \enspace .
\end{aligned}
$$

[(3)](#USuwbTkODG "Link to this Equation")

To guarantee stability, it is common to include a terminal constraint $\mathbf{x}_N \in \mathcal{X}_f$, where $\mathcal{X}_f$ is a control-invariant set under a known feedback law.

<a id="economic-mpc"></a>

## Economic MPC

Can the controller optimize production or revenue directly when the best operation need not remain near a prescribed setpoint?

Tracking and regulatory MPC penalize deviation from a prescribed reference. An economic controller instead optimizes the quantity produced by operating the system. The optimal state may vary continuously because there is no fixed reference trajectory.

<a id="wave-energy-capture"></a>

### Wave-Energy Capture

A hinged flap extracts energy from oscillating water through a power-take-off (PTO) device. A single rotational mode gives the model

<a id="XeLMQQceWV"></a>

$$
I\ddot q+b\dot q+kq=\tau_{\mathrm{wave}}(t)-\rho(t)\dot q,
$$

[(4)](#XeLMQQceWV "Link to this Equation")

where $q$ is flap angle and $\rho$ is the commanded PTO damping. The PTO torque and captured power are

<a id="nPojzX3tV1"></a>

$$
\tau_{\mathrm{PTO}}=-\rho\dot q,
\qquad
P_{\mathrm{capture}}=-\tau_{\mathrm{PTO}}\dot q=\rho\dot q^2.
$$

[(5)](#nPojzX3tV1 "Link to this Equation")

Restricting $\rho\geq0$ keeps the PTO passive because $\tau_{\mathrm{PTO}}\dot q=-\rho\dot q^2\leq0$. The actuator can remove mechanical energy from the flap, but it cannot inject energy into it.

A frozen-state calculation suggests using as much damping as possible. At $\dot q=0.4$ rad/s, damping values of 900 and 1900 N m s/rad yield instantaneous capture rates of 144 and 304 W. The calculation holds velocity fixed. In the dynamical system, stronger damping reduces future velocity, so captured energy need not increase monotonically with $\rho$. The constant-damping sweep below measures that delayed effect.

The experiment uses a deterministic sum of three wave-torque components for 45 s. The controller updates every $h=0.12$ s and predicts $N=18$ steps, or 2.16 s, into the future. Its finite-horizon problem is

<a id="aqWp6vhfkJ"></a>

$$
\begin{aligned}
\max_{\rho_{0:N-1}}\quad &
h\sum_{j=0}^{N-1}\rho_j\omega_j^2
-\lambda\sum_{j=0}^{N-1}
\left(\frac{\rho_j-\rho_{j-1}}{\rho_{\max}}\right)^2 \\
\text{subject to}\quad &
\mathbf{x}_{j+1}=F_h(\mathbf{x}_j,\rho_j,\tau_{\mathrm{wave}}), \\
&0\leq\rho_j\leq2400\ \mathrm{N\,m\,s/rad},\\
&|q_j|\leq0.55\ \mathrm{rad},\\
&|\rho_j\omega_j|\leq2800\ \mathrm{N\,m},\\
&|\rho_j-\rho_{j-1}|/h\leq5000\ \mathrm{N\,m\,s^{-2}/rad}.
\end{aligned}
$$

[(6)](#aqWp6vhfkJ "Link to this Equation")

Here $F_h$ is one Runge-Kutta step of the flap model and $\rho_{-1}$ is the damping applied during the previous control interval. Only $\rho_0$ is applied. The flap state is measured again, the horizon advances, and the nonlinear program is solved from the shifted previous solution.

Two passive controllers provide matched baselines. Constant damping requests $\rho=900$ N m s/rad. A phase-aware heuristic raises damping when the measured product $\tau_{\mathrm{wave}}\dot q$ is positive and lowers it otherwise. All three requests pass through the same damping, torque, and damping-rate projection before reaching the plant. The stroke constraint differs because it depends on predicted state evolution rather than on the current actuator command.

Before inspecting the trajectories, predict whether constant damping should maximize total captured energy. Also predict which controller should use the most actuator variation. The economic objective can favor operation close to the state and torque limits.

<a id="ouz1UxbtFm"></a>

```python
import sys
sys.path.insert(0, "code")

import pandas as pd
from IPython.display import HTML, display
import matplotlib.pyplot as plt

from wave_energy import (
    WaveParameters,
    create_animation as create_wave_animation,
    make_closed_loop_figure,
    make_tradeoff_figure,
    metrics_table as wave_metrics_table,
    run_comparison as run_wave_comparison,
    run_damping_sweep,
)

wave_parameters = WaveParameters()
wave_results = run_wave_comparison(wave_parameters, duration=45.0)
wave_sweep = run_damping_sweep(wave_parameters, duration=45.0)
```

<a id="EvXSX4FKBV"></a>

<a id="fig-wave-economic-mpc-trajectories"></a>

<a id="fig-wave-economic-mpc-trajectories-code"></a>

```python
wave_summary_figure = make_closed_loop_figure(wave_results, wave_parameters)
display(wave_summary_figure)
plt.close(wave_summary_figure)
```

[Figure 1:](#fig-wave-economic-mpc-trajectories "Link to this figure")Closed-loop response under the same deterministic three-frequency forcing. The economic MPC captures more energy by varying passive damping and operating close to the stroke and PTO-torque limits. Constant damping crosses the shaded stroke-feasible region, while the phase-aware baseline stays farther inside it. Every curve is generated by the nonlinear plant simulation.

<a id="fig-wave-economic-mpc-trajectories-outputs"></a>

![<Figure size 825x750 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/f5eeb5ba62-94a02ff0f3af8948afc0fbcc48afa70c.png)

The economic MPC captures approximately 47.3 kJ, compared with 39.9 kJ for phase-aware damping and 39.3 kJ for constant damping. It reaches the 0.55 rad stroke limit and the 2.8 kN m torque limit without exceeding either beyond numerical tolerance. Constant damping exceeds the stroke limit by about 0.084 rad. The phase-aware law remains feasible and uses less damping variation, but it leaves energy unharvested.

One of the 375 nonlinear programs terminates without satisfying the solver’s convergence flag. The implementation then applies the shifted feasible sequence through the common actuator projection. The resulting trajectory remains within the recorded limits, but the fallback is part of the result rather than evidence of recursive feasibility.

<a id="B1YUBHoZXp"></a>

```python
wave_table = pd.DataFrame(wave_metrics_table(wave_results))
for column in (
    "energy_kj",
    "peak_stroke_deg",
    "peak_torque_knm",
    "damping_variation_per_s",
    "stroke_violation_deg",
    "torque_violation_nm",
):
    wave_table[column] = wave_table[column].map(lambda x: f"{x:.3f}")
wave_table.rename(
    columns={
        "controller": "controller",
        "energy_kj": "captured energy (kJ)",
        "peak_stroke_deg": "peak stroke (deg)",
        "peak_torque_knm": "peak PTO torque (kN m)",
        "damping_variation_per_s": "damping variation per second",
        "stroke_violation_deg": "stroke violation (deg)",
        "torque_violation_nm": "torque violation (N m)",
    }
)
```

Loading...

The constant-damping sweep places the three controllers on a common energy-motion diagram. A larger constant damping initially improves capture, then suppresses the motion that produces power. The economic MPC lies above this static tradeoff because it changes damping with the predicted phase while respecting the stroke bound.

<a id="GEH6zeY2fc"></a>

<a id="fig-wave-economic-mpc-tradeoff"></a>

<a id="fig-wave-economic-mpc-tradeoff-code"></a>

```python
wave_tradeoff_figure = make_tradeoff_figure(
    wave_results,
    wave_sweep,
    wave_parameters,
)
display(wave_tradeoff_figure)
plt.close(wave_tradeoff_figure)
```

[Figure 2:](#fig-wave-economic-mpc-tradeoff "Link to this figure")Captured energy against peak flap stroke. Gray circles sweep constant passive damping from 100 to 2800 N m s/rad. The vertical dotted line is the 0.55 rad stroke constraint. Economic MPC obtains more energy than the fixed-damping sweep by scheduling damping over the predicted wave cycle. The phase-aware baseline is feasible but does not attain the MPC energy.

<a id="fig-wave-economic-mpc-tradeoff-outputs"></a>

![<Figure size 825x435 with 1 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6d189a5bd2-5011498365c5fc41bba261a22e1c7a4d.png)

The animation shows the economic-MPC trajectory and accumulated energy from the same executed simulation. The displayed damping is the action applied after the actuator projection.

<a id="X19v6HlpZE"></a>

<a id="fig-wave-economic-mpc-animation"></a>

<a id="fig-wave-economic-mpc-animation-code"></a>

```python
wave_animation = create_wave_animation(wave_results, wave_parameters, frame_stride=3)
wave_html = wave_animation.to_jshtml(fps=25)
plt.close(wave_animation._fig)
display(HTML(wave_html))
```

[Figure 3:](#fig-wave-economic-mpc-animation "Link to this figure")Time-compressed replay of the economic-MPC flap motion and captured energy. The controller re-solves an 18-step nonlinear program every 0.12 seconds and applies the first passive damping action.

<a id="fig-wave-economic-mpc-animation-outputs"></a>

Loading...

Inspect the economic-MPC solve

wave\_energy.py

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
```

[Download the complete wave-energy experiment](https://pierrelucbacon.com/rlbook/build/wave_energy-4b8d9646930c1000b54779f3ed32a00e.py)

This model assumes an accurate short-term wave forecast and one rigid flap mode. Real devices include radiation-memory effects, additional structural modes, losses, measurement error, and forecast uncertainty. Those omissions affect both predicted capture and constraint margins. Robust or stochastic MPC can represent some of this uncertainty, while data can be used to estimate the unmodeled residual dynamics.

<a id="robust-mpc"></a>

## Robust MPC

How can feasibility and performance be protected against every disturbance in a bounded uncertainty set?

Some systems are exposed to external disturbances or small errors in the model. In those cases, we want the controller to make decisions that will still work no matter what happens, as long as the disturbances stay within some known bounds. This is the idea behind **robust MPC**.

Instead of planning a single trajectory, the controller plans a “nominal” path (what would happen in the absence of any disturbance) and then adds a feedback correction to react to whatever disturbances actually occur. This looks like:

<a id="B7Ry1L5BI2"></a>

$$
\mathbf{u}_k = \bar{\mathbf{u}}_k + K (\mathbf{x}_k - \bar{\mathbf{x}}_k) \enspace ,
$$

[(7)](#B7Ry1L5BI2 "Link to this Equation")

where $\bar{\mathbf{u}}_k$ is the planned input and $K$ is a feedback gain that pulls the system back toward the nominal path if it deviates.

Because we know the worst-case size of the disturbance, we can estimate how far the real state might drift from the plan, and “shrink” the constraints accordingly. The result is that the nominal plan is kept safely away from constraint boundaries, so even if the system gets pushed around, it stays inside limits. This is often called **tube MPC** because the true trajectory stays inside a tube around the nominal one.

The main benefit is that we can handle uncertainty without solving a complicated worst-case optimization at every time step. All the uncertainty is accounted for in the design of the feedback $K$ and the tightened constraints.

<a id="stochastic-mpc"></a>

## Stochastic MPC

What becomes possible when uncertainty is represented by probabilities rather than only worst-case bounds?

If disturbances are random rather than adversarial, a natural goal is to optimize expected cost while enforcing constraints probabilistically. This gives rise to **stochastic MPC**, in which:

-   The cost becomes an expectation:
    
    <a id="Z3recinsmL"></a>
    
    $$
    \mathbb{E} \left[ c_N(\mathbf{x}_N) + \sum_{k=0}^{N-1} c_k(\mathbf{x}_k, \mathbf{u}_k) \right]
    $$
    
    [(8)](#Z3recinsmL "Link to this Equation")
    
-   Constraints are allowed to be violated with small probability:
    
    <a id="Uz0SWD8a7F"></a>
    
    $$
    \mathbb{P}[\mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0}] \geq 1 - \varepsilon
    $$
    
    [(9)](#Uz0SWD8a7F "Link to this Equation")
    

In practice, expectations are approximated using a finite set of disturbance scenarios drawn ahead of time. For each scenario, the system dynamics are simulated forward using the same control inputs $\mathbf{u}_k$, which are shared across all scenarios to respect non-anticipativity. The result is a single deterministic optimization problem with multiple parallel copies of the dynamics, one per sampled future. This retains the standard MPC structure, with only moderate growth in problem size.

Despite appearances, this is not dynamic programming. There is no value function or tree of all possible paths. There is only a finite set of futures chosen a priori, and optimized over directly. This scenario-based approach is common in energy systems such as hydro scheduling, where inflows are uncertain but sample trajectories can be generated from forecasts.

Risk constraints are typically enforced across all scenarios or encoded using risk measures like CVaR. For example, one might penalize violations that occur in the worst $(1 - \alpha)\%$ of samples, while still optimizing expected performance overall.

<a id="hybrid-and-mixed-integer-mpc"></a>

## Hybrid and Mixed-Integer MPC

How can mode switches, on-off devices, and logical decisions enter the same finite-horizon optimization?

When systems involve discrete switches (eg. on/off valves, mode selection, or combinatorial logic) the MPC problem must include integer or binary variables. These show up in constraints like

<a id="gsU8N7HX0A"></a>

$$
\boldsymbol{\delta}_k \in \{0,1\}^{n_\delta}, \qquad \mathbf{u}_k \in \mathcal{U}(\boldsymbol{\delta}_k)
$$

[(10)](#gsU8N7HX0A "Link to this Equation")

where $n_\delta$ counts the binary decisions at each step, along with mode-dependent dynamics and costs. The resulting formulation is a **mixed-integer nonlinear program** (MINLP). The receding-horizon idea is the same, but each solve is more expensive due to the combinatorial nature of the decision space.

<a id="distributed-and-decentralized-mpc"></a>

## Distributed and Decentralized MPC

When one optimization is too large or ownership is distributed, which information must local controllers exchange to coordinate their plans?

Large-scale systems often consist of interacting subsystems. Distributed MPC decomposes the global NLP into smaller ones that run in parallel, with coordination constraints enforcing consistency across shared variables:

<a id="IQgXm7ePbc"></a>

$$
\sum_{i} H^i \mathbf{z}^i_k = \mathbf{0} \qquad \text{(coupling constraint)}
$$

[(11)](#IQgXm7ePbc "Link to this Equation")

Each subsystem solves a local problem over its own state and input variables, then exchanges information with neighbors. Coordination can be done via primal–dual methods, ADMM, or consensus schemes, but each local block looks like a standard MPC problem.

<a id="adaptive-and-learning-based-mpc"></a>

## Adaptive and Learning-Based MPC

How can the prediction model improve from data without discarding the explicit constraints enforced by MPC?

In practice, we may not know the true model $\mathbf{f}_k$ or cost function $c_k$ precisely. In **adaptive MPC**, these are updated online from data:

<a id="lern8Ra76h"></a>

$$
\mathbf{x}_{k+1} = \mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k; \boldsymbol{\theta}_t), \qquad
c_k(\mathbf{x}_k, \mathbf{u}_k) = c_k(\mathbf{x}_k, \mathbf{u}_k; \boldsymbol{\psi}_t)
$$

[(12)](#lern8Ra76h "Link to this Equation")

The parameters $\boldsymbol{\theta}_t$ and $\boldsymbol{\psi}_t$ are learned in real time, and the subproblem solved at time $t$ uses their current estimates. When combined with policy distillation, value approximation, or trajectory imitation, this leads to overlaps with reinforcement learning where the MPC solutions act as supervision for a reactive policy.

<a id="robustness-and-failure-handling"></a>

## Robustness and Failure Handling

What should the closed-loop system do when the preferred MPC problem is infeasible, inaccurate, or unfinished at the control deadline?

The wave-energy example assumes that every optimization finishes before the next control update and that its prediction model remains accurate over the horizon. An operational MPC controller must also handle incompatible constraints, modeling errors, and missed computation deadlines.

A disturbance can move the measured state to a point from which the requested target is unreachable within the horizon. Model mismatch can make a trajectory feasible in prediction and infeasible on the plant. A solver can also stop because of an ill-conditioned local model or a changing active set. These cases require an explicit hierarchy of hard constraints, soft objectives, and fallback actions. The following mechanisms modify the finite-horizon problem or its deployment without changing the receding-horizon principle.

<a id="softening-constraints-through-slack-variables"></a>

## Softening Constraints Through Slack Variables

Which constraints may be violated at a quantified price so that the optimizer can still return a usable action?

The first approach to handling infeasibility recognizes that not all constraints carry equal importance. A chemical reactor’s temperature must never exceed the runaway threshold: this is a hard constraint that cannot be violated. However, maintaining temperature within an optimal efficiency band is merely desirable. This can be treated as a soft constraint that we prefer to satisfy but can relax when necessary.

This hierarchy motivates reformulating the optimization problem using **slack variables**:

<a id="V7qqAEacVQ"></a>

$$
\begin{aligned}
\min_{\mathbf{u}, \boldsymbol{\epsilon}} \quad & \sum_{k=0}^{N-1} \left( \|\mathbf{x}_k - \mathbf{x}_k^{\mathrm{ref}}\|_{Q}^2 + \|\mathbf{u}_k\|_{R}^2 + \mathbf{w}^\top \boldsymbol{\epsilon}_k \right) \\
\text{s.t.} \quad & \mathbf{x}_{k+1} = \mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k) \\
& \mathbf{g}_{\text{hard}}(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0} \\
& \mathbf{g}_{\text{soft}}(\mathbf{x}_k, \mathbf{u}_k) \leq \boldsymbol{\epsilon}_k \\
& \boldsymbol{\epsilon}_k \geq \mathbf{0}
\end{aligned}
$$

[(13)](#V7qqAEacVQ "Link to this Equation")

The penalty weights $\mathbf{w}$ encode our priorities. Safety constraints might use $w_j = 10^6$, while comfort constraints use $w_j = 1$. This reformulated problem is always feasible as long as the hard constraints alone admit a solution. That is: we can always make the slack variables $\boldsymbol{\epsilon}$ sufficiently large to satisfy the soft constraints.

Rather than treating constraints as binary hard/soft categories, we can establish a **constraint hierarchy** that enables graceful degradation:

<a id="q1r5fHpu5d"></a>

$$
\begin{aligned}
\text{Safety:} \quad & T_{\text{reactor}} \leq T_{\text{runaway}} - 10 \quad & w = \infty \text{ (hard)} \\
\text{Equipment:} \quad & 0 \leq u_{\text{valve}} \leq 100 \quad & w = 10^4 \\
\text{Efficiency:} \quad & T_{\text{optimal}} - 5 \leq T \leq T_{\text{optimal}} + 5 \quad & w = 10^2 \\
\text{Comfort:} \quad & |T - T_{\text{setpoint}}| \leq 1 \quad & w = 1
\end{aligned}
$$

[(14)](#q1r5fHpu5d "Link to this Equation")

As conditions deteriorate, the controller abandons objectives in reverse priority order, maintaining safety even when optimality becomes impossible.

<a id="feasibility-restoration"></a>

## Feasibility Restoration

If the main problem fails, can a secondary optimization recover a state from which the nominal constraints become satisfiable again?

When even soft constraints prove insufficient (perhaps due to catastrophic solver failure or corrupted problem structure) we need **feasibility restoration** that finds any feasible point regardless of optimality:

<a id="zGDYS0b4Fk"></a>

$$
\begin{aligned}
\min_{\mathbf{u}, \mathbf{s}} \quad & \|\mathbf{s}\|_1 \\
\text{s.t.} \quad & \mathbf{x}_{k+1} = \mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k) + \mathbf{s}_k \\
& \mathbf{x}_{\min} - \mathbf{s}_{x,k} \leq \mathbf{x}_k \leq \mathbf{x}_{\max} + \mathbf{s}_{x,k} \\
& \mathbf{u}_{\min} \leq \mathbf{u}_k \leq \mathbf{u}_{\max} \\
& \mathbf{s} \geq \mathbf{0}
\end{aligned}
$$

[(15)](#zGDYS0b4Fk "Link to this Equation")

This formulation temporarily relaxes even the dynamics constraints, finding the “least infeasible” solution. It answers the question: if we must violate something, what is the minimal violation required? Once feasibility is restored, we can warm-start the original problem from this point.

<a id="reference-governors"></a>

## Reference Governors

Can an unsafe reference be modified before it reaches an otherwise reliable inner controller?

Rather than reacting to infeasibility after it occurs, we can prevent it by filtering references through a **reference governor**. Consider an aircraft following waypoints. Instead of passing waypoints directly to the MPC, the governor asks: what is the closest approachable reference from our current state?

<a id="UCBTawqrmw"></a>

$$
\begin{aligned}
\kappa^\star &= \max\left\{\kappa \in [0,1] : \text{MPC}(\mathbf{x}_{\text{current}}, \kappa \mathbf{r}_{\text{desired}} + (1-\kappa)\mathbf{x}_{\text{current}}) \text{ is feasible}\right\}, \\
\mathbf{r}_{\text{filtered}} &= \kappa^\star \mathbf{r}_{\text{desired}} + (1-\kappa^\star)\mathbf{x}_{\text{current}}
\end{aligned}
$$

[(16)](#UCBTawqrmw "Link to this Equation")

The governor performs a line search between the current state (always feasible since staying put requires no action) and the desired reference (potentially infeasible). This guarantees the MPC always receives feasible problems while making maximum progress toward the goal.

For computational efficiency, we can pre-compute the **maximal output admissible set**:

<a id="aThsNQklKG"></a>

$$
\mathcal{O}_\infty = \{\mathbf{r} : \exists \text{ feasible trajectory from } \mathbf{x} \text{ to } \mathbf{r} \text{ respecting all constraints}\}
$$

[(17)](#aThsNQklKG "Link to this Equation")

Online, the governor simply projects the desired reference onto $\mathcal{O}_\infty$.

<a id="backup-controllers"></a>

## Backup Controllers

Which independently validated action should take over when the optimizer or its model cannot be trusted?

When MPC fails entirely (due to solver crashes, timeouts, or numerical failures) we need backup controllers that require minimal computation while guaranteeing stability and keeping the system away from dangerous regions.

The standard approach uses a pre-computed **local LQR controller** around the equilibrium:

<a id="lYxFwyq9cQ"></a>

$$
K_{\text{LQR}}, P = \text{LQR}(A, B, Q, R)
$$

[(18)](#lYxFwyq9cQ "Link to this Equation")

where $(A, B)$ are the linearized dynamics at equilibrium. When MPC fails:

<a id="rbxMwVNdax"></a>

$$
\mathbf{u}_{\text{backup}} = \begin{cases}
K_{\text{LQR}}(\mathbf{x} - \mathbf{x}_{\text{eq}}) & \text{if } \mathbf{x} \in \mathcal{X}_{\text{LQR}} \\
\mathbf{u}_{\text{safe}} & \text{otherwise}
\end{cases}
$$

[(19)](#rbxMwVNdax "Link to this Equation")

The region $\mathcal{X}_{\text{LQR}} = \{\mathbf{x} : (\mathbf{x} - \mathbf{x}_{\text{eq}})^\top P (\mathbf{x} - \mathbf{x}_{\text{eq}}) \leq \alpha\}$ represents the largest invariant set where LQR is guaranteed to work.

<a id="cascade-architectures"></a>

## Cascade Architectures

How can slower optimization and faster local feedback be layered without giving both loops conflicting authority?

Production MPC systems rarely rely on a single solver. Instead, they implement a **cascade of increasingly conservative controllers** that trade optimality for reliability:

```python
def get_control(self, x, time_budget):
    """
    Multi-level cascade for robust real-time control
    """
    time_remaining = time_budget
    
    # Level 1: Full nonlinear MPC
    if time_remaining > 5e-3:  # 5ms minimum
        try:
            u, solve_time = self.solve_nmpc(x, time_remaining)
            if converged:
                return u
        except:
            pass
        time_remaining -= solve_time
    
    # Level 2: Simplified linear MPC
    if time_remaining > 1e-3:  # 1ms minimum
        try:
            # Linearize around current state
            A, B = self.linearize_dynamics(x)
            u, solve_time = self.solve_lmpc(x, A, B, time_remaining)
            return u
        except:
            pass
        time_remaining -= solve_time
    
    # Level 3: Explicit MPC lookup
    if time_remaining > 1e-4:  # 0.1ms minimum
        region = self.find_critical_region(x)
        if region is not None:
            return self.explicit_control_law[region](x)
    
    # Level 4: LQR backup
    if self.in_lqr_region(x):
        return self.K_lqr @ (x - self.x_eq)
    
    # Level 5: Emergency safe mode
    return self.emergency_stop(x)
```

Each level trades optimality for reliability: Level 1 provides optimal but computationally expensive control, Level 2 offers suboptimal but faster solutions, Level 3 provides pre-computed instant evaluation, Level 4 ensures stabilizing control without tracking, and Level 5 implements safe shutdown.

Even when using backup controllers, we can maintain solution continuity through **persistent warm-starting**:

<a id="kc76XOFYX5"></a>

$$
\begin{aligned}
\mathbf{z}_{\text{warm}}^{(t+1)} = \begin{cases}
\text{shift}(\mathbf{z}^{(t)}) & \text{if MPC succeeded at time } t \\
\text{lift}(\mathbf{u}_{\text{backup}}^{(t)}) & \text{if backup controller used} \\
\text{propagate}(\mathbf{z}_{\text{warm}}^{(t)}) & \text{if maintaining virtual solution}
\end{cases}
\end{aligned}
$$

[(20)](#kc76XOFYX5 "Link to this Equation")

Here the superscript $(t)$ marks the solution computed at time $t$, and subscripts remain prediction steps. The **shift** operation takes a successful MPC solution and moves it forward by one time step, appending a terminal action: $[\mathbf{u}_1^{(t)}, \mathbf{u}_2^{(t)}, \ldots, \mathbf{u}_{N-1}^{(t)}, \pi_f(\mathbf{x}_N^{(t)})]$. This shifted sequence provides natural temporal continuity for the next optimization.

When MPC fails and backup control is applied, the **lift** operation extends the single backup action $\mathbf{u}_{\text{backup}}^{(t)}$ into a full horizon-length sequence, either by repetition or by simulating the backup controller forward. This creates a reasonable warm-start guess from limited information.

The **propagate** operation maintains a “virtual” trajectory by continuing to evolve the previous solution as if it were still being executed, even when the actual system follows backup control. This forward simulation keeps the warm-start temporally aligned and relevant for when MPC recovers.

<a id="inference-serving-under-a-latency-and-power-budget"></a>

## Inference Serving Under a Latency and Power Budget

How do deadlines, thermal limits, forecast error, and solver time interact in a receding-horizon controller for a real computing workload?

The offline frequency schedule in [Trajectory Optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md#example-offline-frequency-planning-for-inference) cannot react when a burst arrives earlier than forecast. Receding-horizon control uses the same aggregate model but replaces the initial forecast after each second. Measured NVIDIA L4 service-rate and phase-power curves calibrate the model, while the request and queue trajectories remain simulation outputs. The scheduling rule remains fixed at the reduced 512-token interleaved chunked-prefill model from the modeling chapter, so the comparison isolates feedback through the GPU clock.

At control time $t$, the state

<a id="qvq7GEqWrv"></a>

$$
x_t=(p_t,d_t,T_t,f_{t-1})
$$

[(21)](#qvq7GEqWrv "Link to this Equation")

contains queued prefill work, unfinished decode work, temperature, and the last applied clock. The controller forecasts ten one-second transitions. Arrivals are predicted from the trailing 30-second rate, while expected output work uses the empirical output-length distribution from the trace. The request-level plant receives the realized requests and output lengths instead.

The finite-horizon problem uses the normalized objective

<a id="GryK02Tj7y"></a>

$$
J_t=\sum_{k=0}^{9}\left[
\frac{E_k}{E_{\max}}
+20\delta_{k,\mathrm{TTFT}}^2
+10\delta_{k,\mathrm{TPOT}}^2
+0.05\Delta f_k^2
+1000(s_{P,k}^2+s_{T,k}^2)
\right]+20B_{10}^2,
$$

[(22)](#GryK02Tj7y "Link to this Equation")

where, as in the receding-horizon subproblem, $k$ counts seconds after the control time $t$. The variables $\delta_{k,\mathrm{TTFT}}$ and $\delta_{k,\mathrm{TPOT}}$ are normalized overruns of two aggregate delay estimates. The first divides predicted queued prefill tokens by the profiled prefill rate. The second divides the predicted number of active decode requests by the profiled decode rate. These estimates enter the optimization but do not equal realized request-level TTFT and TPOT; the detailed simulation computes the latter. The frequency difference $\Delta f_k$ is normalized by the profiled clock range. The slacks $s_{P,k}$ and $s_{T,k}$ penalize violations of the experimental power and thermal limits, and $B_{10}$ penalizes unfinished work at the end of the horizon. SLSQP receives at most 50 iterations and a tolerance of 10\-6. Only the first frequency is applied. The continuous result is rounded downward to the nearest profiled requested clock before the next state is observed. The replay reports the corresponding measured median realized clock separately, since the requested and realized values can differ under the experimental power cap.

A solver result is rejected if it is infeasible, non-finite, or arrives after the 0.8-second control budget. The fallback is a hysteretic reactive governor: it raises the clock by one profile level when weighted queue pressure reaches eight or the oldest prompt has waited one second, and lowers it by one level when temperature reaches 72 degrees C or pressure falls to one. Every fallback appears in the recorded trajectory rather than being removed from the aggregate metrics.

The comparison asks whether replanning improves the response to the shifted burst without hiding its energy cost. Four controllers receive identical requests and initial conditions:

1.  maximum clock throughout the experiment;
    
2.  the reactive governor used as the MPC fallback;
    
3.  the open-loop schedule optimized for the nominal trace;
    
4.  receding-horizon MPC.
    

<a id="RwBf2rvoWB"></a>

<a id="fig-inference-mpc"></a>

<a id="fig-inference-mpc-code"></a>

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
    view="mpc",
)))
```

[Figure 4:](#fig-inference-mpc "Link to this figure")Maximum-clock, reactive, open-loop, and MPC frequency control under the same shifted request trace and fixed reduced interleaved chunked-prefill model. Measured NVIDIA L4 curves calibrate each simulated trajectory. At each second, the dashed MPC segment is the current ten-second plan and the solid segment is the action history. Later plans are not revealed before they are computed.

<a id="fig-inference-mpc-outputs"></a>

Loading...

<a id="fig-inference-mpc-fallback"></a>

<a id="EZKrGh3mPl"></a>
![Static comparison of maximum-clock, reactive, open-loop, and receding-horizon frequency control.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/113a124045-mpc-129e51f4b8d464111b4547eec7312038.svg)

[Figure 5:](#fig-inference-mpc-fallback "Link to this figure")Static view of the closed-loop comparison. The online book provides playback and exposes the planned MPC horizon available at each control time.

The table compares the four frequency controllers under identical shifted arrivals and the fixed reduced interleaved chunked-prefill model. Fallback count records every MPC step that exceeded its feasibility, finiteness, or timing requirement.

<a id="mhC1YBoWPm"></a>

```python
import pandas as pd

mpc_metrics = pd.read_csv(
    "artifacts/inference_serving/metrics_mpc.csv"
).set_index("controller")
mpc_metrics[
    [
        "mean_ttft_s",
        "p95_ttft_s",
        "mean_tpot_s",
        "energy_j",
        "peak_queued_requests",
        "ttft_violation_rate",
        "tpot_violation_rate",
        "power_violation_w",
        "thermal_violation_c",
        "fallback_count",
    ]
].T.rename_axis("metric").round(3)
```

Loading...

[Download every closed-loop metric (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/bd6c9974dc-metrics_mpc-cd2def751ea0add08f4cce29d3ce2f58.csv)

On the shifted trace, maximum clock gives the lowest mean time to first token, 10.93 seconds, at 3,506.0 joules. Its 95th percentile is 18.41 seconds. MPC reduces energy to 3,341.8 joules, the lowest of the four controllers, while its mean and 95th-percentile times to first token are 11.53 and 19.01 seconds. The reactive governor records a mean of 12.51 seconds, a 95th percentile of 20.01 seconds, and 3,363.3 joules. The unchanged offline plan records 23.23 seconds, a 95th percentile of 31.28 seconds, and 3,646.8 joules.

Maximum clock and MPC both have a mean time per output token of 0.0417 seconds. The reactive governor records 0.0419 seconds, while the offline plan records 0.0466 seconds. The peak queue is 21 requests at maximum clock and 22 under MPC. It grows to 23 under the reactive governor and 30 under the offline plan. At the 60-second reporting horizon, maximum clock and MPC each leave nine requests unfinished. The reactive governor leaves 11, and the offline plan leaves 22. All 48 requests eventually complete during the post-horizon drain, whose energy is included in the reported totals.

Every controller violates the experimental TTFT limit for every request, and each has a 12.5% TPOT violation rate. MPC accepts 67 solves over the full rollout and invokes no fallback. Every accepted solve meets the 0.8-second deadline. On this trace, MPC improves both mean TTFT and energy relative to the reactive governor and the offline plan. Maximum clock remains 0.60 seconds faster in mean TTFT but consumes 164.2 joules more than MPC.

The displayed table focuses on latency, energy, queueing, constraint violations, and fallback count. The downloadable CSV also reports end-to-end latency, throughput, energy per output token, peak power and temperature, and unfinished work. The comparison therefore separates a faster response from a lower-energy response instead of assigning one score to each controller.

The measured profile supplies the service-rate and phase-power calibration; the controller trajectories are simulations of a single-GPU serving model. All four simulations reach a modeled phase power of 64.852 W at the highest requested clock. This value comes from the measured decode-phase mean for that profile level and is 0.052 W above the configured 64.800 W cap. The cap was an experimental setting rather than a hard sample-wise guarantee. None of the four simulations records a thermal or KV-capacity violation.

<a id="live-comparison-at-common-latency-targets"></a>

### Live Comparison at Common Latency Targets

The live experiment asks which clock policy uses the least measured GPU energy while meeting common request-level latency limits. Development measurements select a fixed clock and set the limits on the 95th percentile of time to first token and of per-request mean inter-token latency. The planned confirmation compares this fixed clock, maximum clock, the governor, and MPC including its fallback. A constant clock or governor can be the preferred policy if it meets both limits with lower measured energy.

Development and confirmation each use 32 requests from disjoint portions of the recorded trace, under steady and bursty arrival schedules. Each arrival window spans at least 240 seconds. The GPU has a 40 W board power cap and a 6,251 MHz requested memory clock. Service rates and idle power require fresh measurements at this cap; the original 64.8 W calibration remains archived. The live state distinguishes requests awaiting their first output from requests already streaming. A transition model fitted on mixed-serving data must pass whole-run validation before it can support MPC. These measurements test queue drainage under the workload the controller will actually encounter.

Confirmation plans five paired repetitions per schedule across three independent acquisitions, with counterbalanced method order. Each pair uses identical requests and arrival times. Energy includes the final request drain; an efficiency claim requires all five valid pairs and both methods to meet both frozen latency limits. Invalid trials and fallback decisions remain in the record. Development qualification and a frozen comparison protocol are still needed before confirmation can begin.

Two earlier development acquisitions completed the full steady workload at 210 MHz, using 8.55 and 8.30 kJ, but could not return to their startup temperature references before the cooling timeout. A subsequent qualification warms the GPU with the full steady workload before selecting its reference from a stable 300-second cooling window. Its final 60-second mean fixes the reference for the remaining trials; this stability criterion does not establish thermal equilibrium.

That warm-reference acquisition qualified both requested settings, 210 and 660 MHz, on the two designated arrival patterns. All 32 requests completed validly in each of the four trials. The separate warm-up does not count toward qualification. Energy was 7.65 and 8.29 kJ for the 210 MHz bursty and steady trials, and 7.09 and 8.43 kJ for the corresponding 660 MHz trials. Clock labels name requested settings: the 660 MHz request produced lower measured clocks during active inference, with medians of 360 MHz for bursty and 300 MHz for steady arrivals. These operating-point checks establish neither a common latency target nor an energy winner. Controller development and a frozen comparison protocol are still required before confirmation.

[Download the live experiment protocol and run instructions](https://pierrelucbacon.com/rlbook/build/README-592474bbf3df0150d6bb5b7d436291e3.md)

<a id="validation-of-the-thermal-constraint"></a>

### Validation of the Thermal Constraint

The controller in the recorded replay constrains a junction temperature predicted by a one-state thermal model. None of the simulated controllers violates that constraint, but this establishes feasibility only for the model used inside the optimizer.

A power-matched pair of workloads exposes the modeling problem. During the held-out experiment, a 55 W decode pulse and a 55 W prefill pulse consumed nearly the same electrical energy, with a difference of 0.2 percent. The measured peak temperature rise during prefill was nevertheless 2.00 degrees C larger than during decode. A one-state model driven only by board power receives nearly the same input for both pulses and has no variable with which to represent this difference.

The clock sweep used to calibrate the serving model was designed to measure service rate and power. Its one-state thermal fit had $R^2=0.0020$, so a separate experiment tested whether workload phase was needed in the thermal input. Both candidate models used

<a id="SzrytfU4gP"></a>

$$
\dot T(t)
=
-\frac{T(t)-T_{\mathrm{amb}}}{\tau}
+\frac{R}{\tau}P_{\mathrm{eff}}(t).
$$

[(23)](#SzrytfU4gP "Link to this Equation")

Here $T_{\mathrm{amb}}$ is an effective ambient temperature, $\tau$ is the thermal time constant, and $R$ is the steady-state thermal resistance. The two input models differ by one term:

<a id="JFHRKNgydY"></a>

$$
P_{\mathrm{eff}}(t)
=
\begin{cases}
P(t), & \text{power-only model},\\
P(t)\bigl(1+\beta I_{\mathrm{prefill}}(t)\bigr),
& \text{phase-gain model}.
\end{cases}
$$

[(24)](#JFHRKNgydY "Link to this Equation")

The indicator $I_{\mathrm{prefill}}$ equals one during prefill and zero during decode. The phase-gain model can therefore assign different effective thermal inputs to two workloads with the same measured board power. Its state dimension and measured input remain unchanged.

The training and validation split used separate workload pulses:

| Data split | Workloads and duration | Use |
| --- | --- | --- |
| Training | Decode and prefill at 46 W for 75 s and at 61 W for 45 s | Fit both candidate models |
| Validation | Decode and prefill at 55 W for 60 s | Evaluate the fixed models once |

The order of the four training pulses was counterbalanced. Every pulse began from a verified post-relock temperature within a one-degree-Celsius band. The acquisition retained a 77 degree C safe-down threshold and a 79 degree C abort threshold. Matching the measured junction temperature does not establish that the unobserved heat-sink temperature was also matched.

<a id="fig-inference-thermal-validation"></a>

<a id="ImAHkrmNu2"></a>
![Measured decode and prefill temperature rises on an NVIDIA L4 compared with fixed power-only and phase-gain one-state thermal models, followed by three validation errors against a one degree C acceptance boundary.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/8182f12adf-thermal-phase-valida-2555822b59479d6cb02c1d6de79f3220.svg)

[Figure 6:](#fig-inference-thermal-validation "Link to this figure")The power-only model predicts similar responses for the power-matched pulses. The phase-gain model separates them and lowers held-out RMSE, but its largest trajectory and phase-contrast errors remain above the fixed one-degree-Celsius acceptance boundary. The validation data were not used to fit either model.

On the held-out pair, the power-only model has an RMSE of 1.43 degrees C. Adding the workload-phase gain reduces this error to 0.87 degrees C. The fixed rule, however, requires all three validation errors to remain below 1 degree C. The phase-gain model reaches a worst trajectory error of 2.73 degrees C and a phase-contrast error of 1.43 degrees C, so the model is rejected.

The measured prefill peak rise exceeds the decode rise by 2.00 degrees C; the phase-gain model predicts a difference of 3.43 degrees C. Prefill draws 0.132 W less mean board power and consumes 6.66 J less energy than decode, with an energy ratio of 0.99797. Higher measured electrical input therefore cannot explain the larger prefill temperature rise in this pair.

These measurements come from one NVIDIA L4 serving Qwen2.5-7B-Instruct with vLLM 0.28.0. They do not establish a hardware-safety model or justify a mixed-serving thermal constraint.

The fitted gain gives prefill 1.147 times the effective thermal input of decode. This parameter is reproducible across the ten optimization starts. The training Jacobian also has full numerical rank, with condition number 384. These checks reduce concern about an ambiguous parameter fit, but they do not establish that one thermal state is sufficient. The validation residuals miss the rapid initial temperature rise and later reverse sign. Inherited thermal state, sensor timing and filtering, and phase-dependent heating remain possible explanations; these pulse measurements do not isolate their contributions.

<a id="fitting-the-complete-thermal-history"></a>

#### Fitting the Complete Thermal History

The expanded development comparison selects a two-state thermal model. It adds the completed 4 September pilot, including its failed sustained-serving trial, to the five historical acquisitions. All six acquisitions, including the earlier validation data, are development data for this comparison.

Each acquisition retains its continuous temperature history through cooldown, memory relocking, and workload segments. The two-state model carries an unobserved heat-sink temperature through these transitions rather than resetting it to the measured junction temperature at each pulse. The fit compares predictions with the sensor’s one-degree-Celsius bins. Each evaluation holds out one complete acquisition; the table averages its ten-second RMSE equally across the six acquisitions. These predictions use measured future board power, so they test the temperature model with its future input supplied.

| Thermal model | Mean run-weighted ten-second RMSE (degrees C) |
| --- | --- |
| One state | 0.726 |
| One state with phase gain, diagnostic only | 0.722 |
| Two states | 0.540 |
| Two states with phase gain, diagnostic only | 0.518 |

The unchanged selection rule requires at least 0.1 degrees C and a ten-percent improvement to add a state, without materially worsening one-second error or ten-second underprediction. The two-state model improves mean RMSE by 0.186 degrees C, or 25.58 percent, and passes those safeguards. Its fitted modes are about 1.72 and 154 seconds. These describe the model response under the recorded sensor alignment; they do not establish uniquely identified physical time constants. Phase-gain models remain diagnostic because mixed serving supplies no runtime phase-activity signal.

The gain is smaller within the failed sustained trial: ten-second RMSE falls from 0.907 to 0.825 degrees C across only nine forecast origins. The raw sensor peak is 77 degrees C, while the retained one-second observations peak at 76. The selected model was frozen before the 40 W acquisition. Fresh evaluation still needs power forecasts available when the controller acts. The model remains unaccepted for online advisory forecasts or hard thermal constraints; measured-temperature watchdogs operate independently.

[Download the six-acquisition thermal development report (JSON)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/33bb10f285-thermal_history_deve-59e11603509b8db1a9055ab69dadf1d5.json)

The original five-acquisition analysis retained one state because adding a second state improved RMSE by only 0.069 degrees C, below the same absolute threshold. Its data and report remain unchanged.

[Download the original five-acquisition report (JSON)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/3bc37ce0de-thermal_history_deve-34646dbb6b1e9d26544807d7714e0f93.json)

For the recorded MPC simulation, the temperature state and inequality remain a teaching model. The absence of a simulated thermal violation is not a hardware safety certificate. The arrival forecast is deliberately simple, output length is observed only at completion, and the scheduler is held fixed. Network delay, tokenization, multi-GPU communication, and model-quality effects are omitted. The shifted burst is one controlled disturbance, so relative performance on that trace does not establish dominance under other workloads.

[Download the one-second held-out trajectories and fixed-model predictions (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/c7811514e2-thermal_phase_valida-5fc4e699407deaceac0021b420c6fdd7.csv)

[Download the complete thermal fit and acceptance report (JSON)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/c6724a4a05-thermal_phase_fit_re-0673adbdf7c82e9c801adf478225e43b.json)

[Download the measured validation telemetry (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/be3eb964b8-l4_thermal_phase_tel-00cf4e0e7e21e1ea226f4204f7bb840b.csv)

Inspect the receding-horizon controller

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
```

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
```

[Download the complete inference-control implementation](https://pierrelucbacon.com/rlbook/build/inference_control-4281ed415b62adfe193289f0e3dfbe27.py)

<a id="summary-and-outlook"></a>

## Summary and Outlook

Tracking, regulation, economic control, robustness, stochastic predictions, and hybrid decisions all retain the same receding-horizon backbone while changing the objective, uncertainty model, or feasible set. Slack variables, reference governors, backup controllers, and cascades determine how the controller behaves when the preferred optimization problem is late or infeasible.

Reliable execution still requires solving a closely related optimization problem at every step. Can repeated structure be reused, or even approximated by a learned map from parameters to actions? [Parametric and approximate controllers](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/14-parametric-controllers.md) develop those alternatives.

<a id="self-checks"></a>

## Self-checks

<a id="ex-mpc-check-4"></a>

[Exercise 1](#ex-mpc-check-4 "Link to this Exercise") (Solver deadline)

Why does the inference MPC reject a feasible solution returned after its 0.8-second deadline?

Solution to [Exercise 1](#ex-mpc-check-4)

The decision is computed for the state at the start of a one-second interval. After the deadline, little time remains to apply it and the request queue may already have changed. The reactive fallback supplies a timely action with known bounds.

<a id="ex-mpc-check-5"></a>

[Exercise 2](#ex-mpc-check-5 "Link to this Exercise") (Thermal-model validation)

The phase-gain thermal model fits its four training pulses reproducibly and predicts the held-out trajectories better than the power-only model. It still fails one of three prespecified validation criteria. May its predicted temperature be used as a hard hardware-safety constraint? What remains useful about the experiment?

Solution to [Exercise 2](#ex-mpc-check-5)

No. A reproducible parameter estimate does not establish that the model class captures the relevant plant dynamics. The failed held-out criterion prevents the constraint from serving as a safety certificate. The experiment remains useful because it measures a discrepancy between power-matched workloads and quantifies the prediction improvement from a phase-dependent input. It does not identify the physical cause: inherited thermal state and sensor timing or filtering remain competing explanations to test with complete acquisition histories.

[

Feedback Control

Receding-Horizon Control


](12-receding-horizon-control.md)[

Feedback Control

Parametric and Approximate Controllers


](14-parametric-controllers.md)


---

# CHAPITRE 14 — Parametric and Approximate Controllers

Section du livre : Feedback Control

Page originale : https://pierrelucbacon.com/rlbook/parametric-controllers

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/14-parametric-controllers.md

> **Cours de Pierre-Luc Bacon — 14.** [Page publiée](https://pierrelucbacon.com/rlbook/parametric-controllers) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/14-parametric-controllers.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Parametric and Approximate Controllers

<a id="skip-to-article"></a>

Real-time model predictive control places strict limits on computation. In applications such as adaptive optics, the controller must run at kilohertz rates. A sampling frequency of 1000 Hz allows only one millisecond per step to compute and apply a control input. This makes efficiency a first-class concern.

The structure of MPC lends itself naturally to optimization reuse. Each time step requires solving a problem with the same dynamics and constraints. Only the initial state, forecasts, or reference signals change. Instead of treating each instance as a new problem, we can frame MPC as a _parametric optimization problem_ and focus on how the solution evolves with the parameter.

Can the previous solution, its local sensitivity, or a learned approximation replace part of the next online optimization without hiding when that approximation ceases to be valid?

<a id="general-framework-parametric-optimization"></a>

## General Framework: Parametric Optimization

How do the optimizer and optimal value change as the initial state, forecast, or reference parameter moves?

We begin with a general optimization problem indexed by a parameter $\boldsymbol{\theta} \in \Theta \subset \mathbb{R}^p$:

<a id="I0yG1b37mo"></a>

$$
\begin{aligned}
\min_{\mathbf{x} \in \mathbb{R}^n} \quad & f(\mathbf{x}; \boldsymbol{\theta}) \\
\text{s.t.} \quad & \mathbf{g}(\mathbf{x}; \boldsymbol{\theta}) \le \mathbf{0}, \\
& \mathbf{h}(\mathbf{x}; \boldsymbol{\theta}) = \mathbf{0}.
\end{aligned}
$$

[(1)](#I0yG1b37mo "Link to this Equation")

For each value of $\boldsymbol{\theta}$, we obtain a concrete optimization problem. The goal is to understand how the optimizer $\mathbf{x}^\star(\boldsymbol{\theta})$ and value function

<a id="XQhZd7FtDi"></a>

$$
v(\boldsymbol{\theta}) := \inf\{\, f(\mathbf{x}; \boldsymbol{\theta}) : \mathbf{x} \text{ feasible at } \boldsymbol{\theta}\,\}
$$

[(2)](#XQhZd7FtDi "Link to this Equation")

depend on $\boldsymbol{\theta}$.

When the problem is smooth and regular, the Karush–Kuhn–Tucker (KKT) conditions characterize optimality:

<a id="ISmZnJ6VvQ"></a>

$$
\begin{aligned}
\nabla_{\mathbf{x}} f(\mathbf{x}; \boldsymbol{\theta})
+ \nabla_{\mathbf{x}} \mathbf{g}(\mathbf{x}; \boldsymbol{\theta})^\top \boldsymbol{\lambda}
+ \nabla_{\mathbf{x}} \mathbf{h}(\mathbf{x}; \boldsymbol{\theta})^\top \boldsymbol{\nu} &= 0, \\
\mathbf{g}(\mathbf{x}; \boldsymbol{\theta}) \le 0, \quad
\boldsymbol{\lambda} \ge 0, \quad
\lambda_i g_i(\mathbf{x}; \boldsymbol{\theta}) &= 0, \\
\mathbf{h}(\mathbf{x}; \boldsymbol{\theta}) &= 0.
\end{aligned}
$$

[(3)](#ISmZnJ6VvQ "Link to this Equation")

If the active set remains fixed over changes in $\boldsymbol{\theta}$, the implicit function theorem ensures that the mappings

<a id="aJTInGNwMp"></a>

$$
\boldsymbol{\theta} \mapsto \mathbf{x}^\star(\boldsymbol{\theta}), \quad
\boldsymbol{\theta} \mapsto \boldsymbol{\lambda}^\star(\boldsymbol{\theta}), \quad
\boldsymbol{\theta} \mapsto \boldsymbol{\nu}^\star(\boldsymbol{\theta})
$$

[(4)](#aJTInGNwMp "Link to this Equation")

are differentiable.

In linear and quadratic programming, this structure becomes even more tractable. Consider a linear program with affine dependence on $\boldsymbol{\theta}$:

<a id="viZYT7VYPR"></a>

$$
\min_{\mathbf{x}} \ \mathbf{c}(\boldsymbol{\theta})^\top \mathbf{x}
\quad \text{s.t.} \quad \mathbf{A}(\boldsymbol{\theta})\mathbf{x} \le \mathbf{b}(\boldsymbol{\theta}).
$$

[(5)](#viZYT7VYPR "Link to this Equation")

Each active set determines a basis and thus a region in $\Theta$ where the solution is affine in $\boldsymbol{\theta}$. The feasible parameter space is partitioned into polyhedral regions, each with its own affine law.

Similarly, in strictly convex quadratic programs

<a id="sCiiaFsIO0"></a>

$$
\min_{\mathbf{x}} \ \tfrac{1}{2} \mathbf{x}^\top \mathbf{H} \mathbf{x} + \mathbf{q}(\boldsymbol{\theta})^\top \mathbf{x}
\quad \text{s.t.} \quad \mathbf{A}\mathbf{x} \le \mathbf{b}(\boldsymbol{\theta}), \qquad \mathbf{H} \succ 0,
$$

[(6)](#sCiiaFsIO0 "Link to this Equation")

each active set again leads to an affine optimizer, with piecewise-affine global structure and a piecewise-quadratic value function.

Parametric programming focuses on the structure of the map $\boldsymbol{\theta} \mapsto \mathbf{x}^\star(\boldsymbol{\theta})$, and the regions over which this map takes a simple form.

<a id="solution-sensitivity-via-the-implicit-function-theorem"></a>

### Solution Sensitivity via the Implicit Function Theorem

We often meet equations of the form

<a id="yA4XeS00SU"></a>

$$
F(y,\boldsymbol{\theta})=0,
$$

[(7)](#yA4XeS00SU "Link to this Equation")

where $y\in\mathbb{R}^m$ are unknowns and $\boldsymbol{\theta}\in\mathbb{R}^p$ are parameters. The **implicit function theorem** says that, if $F$ is smooth and the Jacobian with respect to $y$,

<a id="LOjn39uoa9"></a>

$$
\frac{\partial F}{\partial y}(y^\star,\boldsymbol{\theta}^\star),
$$

[(8)](#LOjn39uoa9 "Link to this Equation")

is invertible at a solution $(y^\star,\boldsymbol{\theta}^\star)$, then in a neighborhood of $\boldsymbol{\theta}^\star$ there exists a unique smooth mapping $y(\boldsymbol{\theta})$ with $F(y(\boldsymbol{\theta}),\boldsymbol{\theta})=0$ and $y(\boldsymbol{\theta}^\star)=y^\star$. Moreover, its derivative is

<a id="itXXkbRy5k"></a>

$$
\frac{d y}{d\boldsymbol{\theta}}(\boldsymbol{\theta}^\star)
\;=\;
-\Big(\tfrac{\partial F}{\partial y}(y^\star,\boldsymbol{\theta}^\star)\Big)^{-1}
\;\tfrac{\partial F}{\partial \boldsymbol{\theta}}(y^\star,\boldsymbol{\theta}^\star).
$$

[(9)](#itXXkbRy5k "Link to this Equation")

In words: if the square Jacobian in $y$ is nonsingular, the solution varies smoothly with the parameter, and we can differentiate it by solving one linear system.

Return to $(P_{\theta})$ and its KKT system. Collect the primal and dual variables into

<a id="U4fNinbTJl"></a>

$$
y \;:=\; (\mathbf{x},\,\boldsymbol{\lambda},\,\boldsymbol{\nu}),
$$

[(10)](#U4fNinbTJl "Link to this Equation")

and write the KKT equations as a single residual

<a id="WZPtCC6lg1"></a>

$$
F(y,\boldsymbol{\theta}) \;=\; 
\begin{bmatrix}
\nabla_{\mathbf{x}} f(\mathbf{x};\boldsymbol{\theta})
+ \nabla_{\mathbf{x}} \mathbf{g}(\mathbf{x};\boldsymbol{\theta})^\top \boldsymbol{\lambda}
+ \nabla_{\mathbf{x}} \mathbf{h}(\mathbf{x};\boldsymbol{\theta})^\top \boldsymbol{\nu} \\
\mathbf{h}(\mathbf{x};\boldsymbol{\theta}) \\
\mathbf{g}_\mathcal{A}(\mathbf{x};\boldsymbol{\theta})
\end{bmatrix}
\;=\; \mathbf{0}.
$$

[(11)](#WZPtCC6lg1 "Link to this Equation")

Here $\mathcal{A}$ denotes the set of inequality constraints active at the solution (the complementarity part is encoded by keeping $\mathcal{A}$ fixed; see below).

To invoke IFT, we need the Jacobian $\partial F/\partial y$ to be invertible at $(y^\star,\boldsymbol{\theta}^\star)$. Standard regularity conditions that ensure this are:

-   **LICQ (Linear Independence Constraint Qualification)** at $(\mathbf{x}^\star,\boldsymbol{\theta}^\star)$: the gradients of all active constraints are linearly independent.
    
-   **Second-order sufficiency** on the critical cone (the Lagrangian Hessian is positive definite on feasible directions).
    
-   **Strict complementarity** (optional but convenient): each active inequality has strictly positive multiplier.
    

Under these, the **KKT matrix**,

<a id="EML72Xnm0l"></a>

$$
K \;=\;
\frac{\partial F}{\partial y}(y^\star,\boldsymbol{\theta}^\star)
\;=\;
\begin{bmatrix}
\nabla^2_{\mathbf{x}\mathbf{x}} \mathcal{L}(\mathbf{x}^\star,\boldsymbol{\lambda}^\star,\boldsymbol{\nu}^\star;\boldsymbol{\theta}^\star)
& \nabla_{\mathbf{x}} \mathbf{g}_\mathcal{A}(\mathbf{x}^\star;\boldsymbol{\theta}^\star)^\top
& \nabla_{\mathbf{x}} \mathbf{h}(\mathbf{x}^\star;\boldsymbol{\theta}^\star)^\top \\
\nabla_{\mathbf{x}} \mathbf{g}_\mathcal{A}(\mathbf{x}^\star;\boldsymbol{\theta}^\star) & 0 & 0 \\
\nabla_{\mathbf{x}} \mathbf{h}(\mathbf{x}^\star;\boldsymbol{\theta}^\star) & 0 & 0
\end{bmatrix},
$$

[(12)](#EML72Xnm0l "Link to this Equation")

is nonsingular. Here $\mathcal{L}=f+\boldsymbol{\lambda}^\top \mathbf{g}+\boldsymbol{\nu}^\top \mathbf{h}$.

The right-hand side sensitivity to parameters is

<a id="S28VuP7wSw"></a>

$$
G \;=\; \frac{\partial F}{\partial \boldsymbol{\theta}}(y^\star,\boldsymbol{\theta}^\star)
\;=\;
\begin{bmatrix}
\nabla_{\boldsymbol{\theta}}\nabla_{\mathbf{x}} f
+ \sum_{i\in\mathcal{A}} \lambda_i^\star \nabla_{\boldsymbol{\theta}}\nabla_{\mathbf{x}} g_i
+ \sum_j \nu_j^\star \nabla_{\boldsymbol{\theta}}\nabla_{\mathbf{x}} h_j \\
\nabla_{\boldsymbol{\theta}} \mathbf{h} \\
\nabla_{\boldsymbol{\theta}} \mathbf{g}_\mathcal{A}
\end{bmatrix}_{(\mathbf{x}^\star,\boldsymbol{\theta}^\star)} .
$$

[(13)](#S28VuP7wSw "Link to this Equation")

IFT then gives **local differentiability of the optimizer and multipliers**:

<a id="UagUFNBpun"></a>

$$
\frac{d y^\star}{d\boldsymbol{\theta}}(\boldsymbol{\theta}^\star)
\;=\; -\,K^{-1} G.
$$

[(14)](#UagUFNBpun "Link to this Equation")

The formula above is valid **as long as the active set $\mathcal{A}$ does not change**. If a constraint switches between active/inactive, the mapping remains piecewise smooth, but the derivative may jump. In MPC, this is exactly why warm-starts are very effective most of the time and occasionally require a refactorization when the active set flips.

In parametric MPC, $\boldsymbol{\theta}$ gathers the current state, references, and forecasts. The IFT tells us that, under regularity and a stable active set, the optimal trajectory and first input vary smoothly with $\boldsymbol{\theta}$. The linear map $-K^{-1}G$ is exactly the object used in sensitivity-based warm starts and real-time iterations: small changes in $\boldsymbol{\theta}$ can be propagated through a single KKT solve to update the primal–dual guess before taking one or two Newton/SQP steps.

<a id="predictor-corrector-mpc"></a>

### Predictor-Corrector MPC

We start with a smooth root-finding problem

<a id="c0t9cwBqki"></a>

$$
F(y)=0,\qquad F:\mathbb{R}^m\to\mathbb{R}^m.
$$

[(15)](#c0t9cwBqki "Link to this Equation")

**Newton’s method** iterates

<a id="dlPKSMVezr"></a>

$$
y^{(t+1)} \;=\; y^{(t)} - \big[\nabla F(y^{(t)})\big]^{-1} F\big(y^{(t)}\big),
$$

[(16)](#dlPKSMVezr "Link to this Equation")

or equivalently solves the linearized system

<a id="gicOhKU6fV"></a>

$$
\nabla F(y^{(t)})\,\Delta y^{(t)} = -F\big(y^{(t)}\big),\qquad y^{(t+1)}=y^{(t)}+\Delta y^{(t)}.
$$

[(17)](#gicOhKU6fV "Link to this Equation")

Convergence is local and fast when the Jacobian is nonsingular and the initial guess is close.

Now suppose the root depends on a parameter:

<a id="hV2ipwAA92"></a>

$$
F\big(y,\theta\big)=0,\qquad \theta\in\mathbb{R}.
$$

[(18)](#hV2ipwAA92 "Link to this Equation")

We want the solution path $\theta\mapsto y^\star(\theta)$. **Numerical continuation** advances $\theta$ in small steps and uses the previous solution as a warm start for the next Newton solve. This is the simplest and most effective way to “track” solutions of parametric systems.

At a known solution $(y^\star,\theta^\star)$, differentiate $F(y^\star(\theta),\theta)=0$ with respect to $\theta$:

<a id="ZJUbOMwBY5"></a>

$$
\nabla_y F(y^\star,\theta^\star)\,\frac{dy^\star}{d\theta}(\theta^\star) \;+\; \nabla_\theta F(y^\star,\theta^\star) \;=\; 0.
$$

[(19)](#ZJUbOMwBY5 "Link to this Equation")

If $\nabla_y F$ is invertible (IFT conditions), the **tangent** is

<a id="QpxPpwX8j9"></a>

$$
\frac{dy^\star}{d\theta}(\theta^\star) \;=\; -\big[\nabla_y F(y^\star,\theta^\star)\big]^{-1}\,\nabla_\theta F(y^\star,\theta^\star).
$$

[(20)](#QpxPpwX8j9 "Link to this Equation")

This is exactly the **implicit differentiation** formula. Continuation uses it as a **predictor**:

<a id="z7NQZIvitL"></a>

$$
y_{\text{pred}} \;=\; y^\star(\theta^\star) \;+\; \Delta\theta\;\frac{dy^\star}{d\theta}(\theta^\star).
$$

[(21)](#z7NQZIvitL "Link to this Equation")

Then a few **corrector** steps apply Newton to $F(\,\cdot\,,\theta^\star+\Delta\theta)=0$ starting from $y_{\text{pred}}$. If Newton converges quickly, the step $\Delta\theta$ was appropriate; otherwise reduce $\Delta\theta$ and retry.

For parametric KKT systems, set $y=(\mathbf{x},\boldsymbol{\lambda},\boldsymbol{\nu})$ where $\mathbf{x}$ stacks the primal decision variables (states and inputs), and $F(y,\theta)=0$ the KKT residual with $\theta$ collecting state, references, forecasts. The **KKT matrix** $K=\partial F/\partial y$ and **parameter sensitivity** $G=\partial F/\partial \theta$ give the tangent

<a id="ql9t4Pni76"></a>

$$
\frac{dy^\star}{d\theta} \;=\; -\,K^{-1}G.
$$

[(22)](#ql9t4Pni76 "Link to this Equation")

Continuation then becomes:

1.  **Predictor**: $y_{\text{pred}} = y^\star + (\Delta\theta)\,(-K^{-1}G)$.
    
2.  **Corrector**: a few Newton/SQP steps on the KKT equations at the new $\theta$.
    

In MPC, this yields efficient **warm starts** across time. As the parameter $\theta_t$ (current state and references) changes slightly, we predict the new primal-dual point and correct with 1–2 iterations, which is often enough to reach tolerance in real time.

<a id="amortized-optimization-and-neural-approximation-of-controllers"></a>

## Amortized Optimization and Neural Approximation of Controllers

Can a trained function approximate the parametric optimizer closely enough to replace most online solves?

The idea of reusing structure across similar optimization problems is not exclusive to parametric programming. In machine learning, a related concept known as **amortized optimization** aims to reduce the cost of repeated inference by replacing explicit optimization with a function that has been _learned_ to approximate the solution map. This approach shifts the computational burden from online solving to offline training.

The goal is to construct a function $\hat{\pi}_{\phi}(\boldsymbol{\theta})$, typically parameterized by a neural network, that maps the input $\boldsymbol{\theta}$ to an approximate solution $\hat{z}^\star(\boldsymbol{\theta})$ or control action $\hat{\mathbf{u}}_0^\star(\boldsymbol{\theta})$. Once trained, this map can be evaluated quickly at runtime, with no need to solve an optimization problem explicitly.

Amortized optimization has emerged in several contexts:

-   In **probabilistic inference**, where variational autoencoders (VAEs) amortize the computation of posterior distributions across a dataset.
    
-   In **meta-learning**, where the objective is to learn a model that generalizes across tasks by internalizing how to adapt.
    
-   In **hyperparameter optimization**, where learning a surrogate model can guide the search over configuration space efficiently.
    

This perspective has also begun to influence control. Recent work investigates how to **amortize nonlinear MPC (NMPC)** policies into neural networks. The training data come from solving many instances of the underlying optimal control problem offline. The resulting neural policy $\hat{\pi}_\phi$ acts as a differentiable, low-latency controller that can generalize to new situations within the training distribution.

Compared to explicit MPC, which partitions the parameter space and stores exact solutions region by region, amortized control smooths over the domain by learning an approximate policy globally. It is less precise, but scalable to high-dimensional problems where enumeration of regions is impossible.

Neural network amortization is advantageous due to the expressivity of these models. However, the challenge is ensuring **constraint satisfaction and safety**, which are hard to guarantee with unconstrained neural approximators. Hybrid approaches attempt to address this by combining a neural warm-start policy with a final projection step, or by embedding the network within a constrained optimization layer. Other strategies include learning structured architectures that respect known physics or control symmetries.

<a id="imitation-learning-framework"></a>

## Imitation Learning Framework

Which state distribution and supervised target make an approximate controller match the optimizer where it will actually be deployed? Consider a fixed horizon $N$ and parameter vector $\boldsymbol{\theta}$ encoding the current state, references, and forecasts. The oracle MPC controller solves

<a id="JZ9ZSkGoaT"></a>

$$
\begin{aligned}
z^\star(\boldsymbol{\theta}) \in \arg\min_{z=(\mathbf{x}_{0:N},\mathbf{u}_{0:N-1})}
&\; J(z;\boldsymbol{\theta})\\
\text{s.t. }& \mathbf{x}_{k+1}=f(\mathbf{x}_k,\mathbf{u}_k;\boldsymbol{\theta}),\quad k=0..N-1,\\
& g(\mathbf{x}_k,\mathbf{u}_k;\boldsymbol{\theta})\le 0,\; h(\mathbf{x}_N;\boldsymbol{\theta})=0.
\end{aligned}
$$

[(23)](#JZ9ZSkGoaT "Link to this Equation")

The applied action is $\pi^\star(\boldsymbol{\theta}) := \mathbf{u}_0^\star(\boldsymbol{\theta})$. Our goal is to learn a fast surrogate mapping $\hat{\pi}_\phi:\boldsymbol{\theta}\mapsto \hat{\mathbf{u}}_0 \approx \pi^\star(\boldsymbol{\theta})$ that can be evaluated in microseconds, optionally followed by a safety projection layer.

**Supervised learning from oracle solutions.** One first samples parameters $\boldsymbol{\theta}^{(i)}$ from the operational domain and solves the corresponding NMPC problems offline. The resulting dataset

<a id="rkQQIc23dt"></a>

$$
\mathcal{D} = \{ (\boldsymbol{\theta}^{(i)},\, \mathbf{u}_0^\star(\boldsymbol{\theta}^{(i)})) \}_{i=1}^M
$$

[(24)](#rkQQIc23dt "Link to this Equation")

is then used to train a neural network $\hat{\pi}_\phi$ by minimizing

<a id="eTrElPlx2d"></a>

$$
\min_\phi \; \frac{1}{M}\sum_{i=1}^M \big\|\hat{\pi}_\phi(\boldsymbol{\theta}^{(i)}) - \mathbf{u}_0^\star(\boldsymbol{\theta}^{(i)})\big\|^2 .
$$

[(25)](#eTrElPlx2d "Link to this Equation")

Once trained, the network acts as a surrogate for the optimizer, providing instantaneous evaluations that approximate the MPC law.

<a id="example-propofol-infusion-control"></a>

## Example: Propofol Infusion Control

How does a parametric receding-horizon controller translate a measured patient state into a constrained infusion decision?

This problem explores the control of propofol infusion in total intravenous anesthesia (TIVA). Our presentation follows the problem formulation developped by [Sawaguchi _et al._ (2008)](https://doi.org/10.1109/tbme.2008.915670). The primary objective is to maintain the desired level of unconsciousness while minimizing adverse reactions and ensuring quick recovery after surgery.

The level of unconsciousness is measured by the Bispectral Index (BIS), which is obtained using an electroencephalography (EEG) device. The BIS ranges from 0 (complete suppression of brain activity) to 100 (fully awake), with the target range for general anesthesia typically between 40 and 60.

The goal is to design a control system that regulates the infusion rate of propofol to maintain the BIS within the target range. This can be formulated as an optimal control problem:

<a id="lnih0DaD4t"></a>

$$
\begin{align*}
\min_{u(t)} & \int_{0}^{T} \left( BIS(t) - BIS_{\text{target}} \right)^2 + \lambda\, u(t)^2 \, dt \\
\text{subject to:} \\
\dot{x}_1 &= -(k_{10} + k_{12} + k_{13})x_1 + k_{21}x_2 + k_{31}x_3 + \frac{u(t)}{V_1} \\
\dot{x}_2 &= k_{12}x_1 - k_{21}x_2 \\
\dot{x}_3 &= k_{13}x_1 - k_{31}x_3 \\
\dot{x}_e &= k_{e0}(x_1 - x_e) \\
BIS(t) &= E_0 - E_{\text{max}}\frac{x_e^\gamma}{x_e^\gamma + EC_{50}^\gamma}
\end{align*}
$$

[(26)](#lnih0DaD4t "Link to this Equation")

Where:

-   $u(t)$ is the propofol infusion rate (mg/kg/h)
    
-   $x_1$, $x_2$, and $x_3$ are the drug concentrations in different body compartments
    
-   $x_e$ is the effect-site concentration
    
-   $k_{ij}$ are rate constants for drug transfer between compartments
    
-   $BIS(t)$ is the Bispectral Index
    
-   $\lambda$ is a regularization parameter penalizing excessive drug use
    
-   $E_0$, $E_{\text{max}}$, $EC_{50}$, and $\gamma$ are parameters of the pharmacodynamic model
    

The specific dynamics model used in this problem is so-called “Pharmacokinetic-Pharmacodynamic Model” and consists of three main components:

1.  **Pharmacokinetic Model**, which describes how the drug distributes through the body over time. It’s based on a three-compartment model:
    
    -   Central compartment (blood and well-perfused organs)
        
    -   Shallow peripheral compartment (muscle and other tissues)
        
    -   Deep peripheral compartment (fat)
        
2.  **Effect Site Model**, which represents the delay between drug concentration in the blood and its effect on the brain.
    
3.  **Pharmacodynamic Model** that relates the effect-site concentration to the observed BIS.
    

The propofol infusion control problem presents several interesting challenges from a research perspective. First, there is a delay in how fast the drug can reach a different compartments in addition to the BIS measurements which can lag. This could lead to instability if not properly addressed in the control design.

Furthermore, every patient is different from another. Hence, we cannot simply learn a single controller offline and hope that it will generalize to an entire patient population. We will account for this variability through Model Predictive Control (MPC) and dynamically adapt to the model mismatch through replanning. How a patient will react to a given dose of drug also varies and must be carefully controlled to avoid overdoses. This adds an additional layer of complexity since we have to incorporate safety constraints. Finally, the patient might suddenly change state, for example due to surgical stimuli, and the controller must be able to adapt quickly to compensate for the disturbance to the system.

<a id="QTKLmGxKLj"></a>

Source

```python
#  label: fig-mpc-propofol
#  caption: Closed-loop MPC for propofol infusion keeps the Bispectral Index near the target (top), regulates infusion rates (middle), and tracks the effect-site concentration (bottom).

%config InlineBackend.figure_format = 'retina'
import numpy as np
from scipy.optimize import minimize
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

class Patient:
    def __init__(self, age, weight):
        self.age = age
        self.weight = weight
        self.set_pk_params()
        self.set_pd_params()

    def set_pk_params(self):
        self.v1 = 4.27 * (self.weight / 70) ** 0.71 * (self.age / 30) ** (-0.39)
        self.v2 = 18.9 * (self.weight / 70) ** 0.64 * (self.age / 30) ** (-0.62)
        self.v3 = 238 * (self.weight / 70) ** 0.95
        self.cl1 = 1.89 * (self.weight / 70) ** 0.75 * (self.age / 30) ** (-0.25)
        self.cl2 = 1.29 * (self.weight / 70) ** 0.62
        self.cl3 = 0.836 * (self.weight / 70) ** 0.77
        self.k10 = self.cl1 / self.v1
        self.k12 = self.cl2 / self.v1
        self.k13 = self.cl3 / self.v1
        self.k21 = self.cl2 / self.v2
        self.k31 = self.cl3 / self.v3
        self.ke0 = 0.456

    def set_pd_params(self):
        self.E0 = 100
        self.Emax = 100
        self.EC50 = 3.4
        self.gamma = 3

def pk_model(x, u, patient):
    x1, x2, x3, xe = x
    dx1 = -(patient.k10 + patient.k12 + patient.k13) * x1 + patient.k21 * x2 + patient.k31 * x3 + u / patient.v1
    dx2 = patient.k12 * x1 - patient.k21 * x2
    dx3 = patient.k13 * x1 - patient.k31 * x3
    dxe = patient.ke0 * (x1 - xe)
    return np.array([dx1, dx2, dx3, dxe])

def pd_model(ce, patient):
    return patient.E0 - patient.Emax * (ce ** patient.gamma) / (ce ** patient.gamma + patient.EC50 ** patient.gamma)

def simulate_step(x, u, patient, dt):
    x_next = x + dt * pk_model(x, u, patient)
    bis = pd_model(x_next[3], patient)
    return x_next, bis

def objective(u, x0, patient, dt, N, target_bis):
    x = x0.copy()
    total_cost = 0
    for i in range(N):
        x, bis = simulate_step(x, u[i], patient, dt)
        total_cost += (bis - target_bis)**2 + 0.1 * u[i]**2
    return total_cost

def mpc_step(x0, patient, dt, N, target_bis):
    u0 = 10 * np.ones(N)  # Initial guess
    bounds = [(0, 20)] * N  # Infusion rate between 0 and 20 mg/kg/h
    
    result = minimize(objective, u0, args=(x0, patient, dt, N, target_bis),
                      method='SLSQP', bounds=bounds)
    
    return result.x[0]  # Return only the first control input

def run_mpc_simulation(patient, T, dt, N, target_bis):
    rng = np.random.default_rng(2026)
    steps = int(T / dt)
    x = np.zeros((steps+1, 4))
    bis = np.zeros(steps+1)
    u = np.zeros(steps)
    
    for i in range(steps):
        # Add noise to the current state to simulate real-world uncertainty
        x_noisy = x[i] + rng.normal(0, 0.01, size=4)
        
        # Use noisy state for MPC planning
        u[i] = mpc_step(x_noisy, patient, dt, N, target_bis)
        
        # Evolve the true state using the deterministic model
        x[i+1], bis[i] = simulate_step(x[i], u[i], patient, dt)
    
    bis[-1] = pd_model(x[-1, 3], patient)
    return x, bis, u

# Set up the problem
patient = Patient(age=40, weight=70)
T = 120  # Total time in minutes
dt = 0.5  # Time step in minutes
N = 20  # Prediction horizon
target_bis = 50  # Target BIS value

# Run MPC simulation
x, bis, u = run_mpc_simulation(patient, T, dt, N, target_bis)

# Plot results
t = np.arange(0, T+dt, dt)
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(10, 12), sharex=True)

ax1.plot(t, bis)
ax1.set_ylabel('BIS')
ax1.set_ylim(0, 100)
ax1.axhline(y=target_bis, color='r', linestyle='--')

ax2.plot(t[:-1], u)
ax2.set_ylabel('Infusion Rate (mg/kg/h)')

ax3.plot(t, x[:, 3])
ax3.set_ylabel('Effect-site Concentration (µg/mL)')
ax3.set_xlabel('Time (min)')

plt.tight_layout()

print(f"Initial BIS: {bis[0]:.2f}")
print(f"Final BIS: {bis[-1]:.2f}")
print(f"Mean infusion rate: {np.mean(u):.2f} mg/kg/h")
print(f"Final effect-site concentration: {x[-1, 3]:.2f} µg/mL")
```

```
Initial BIS: 100.00
Final BIS: 50.20
Mean infusion rate: 8.86 mg/kg/h
Final effect-site concentration: 3.39 µg/mL
```

![<Figure size 1000x1200 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/bbaa7e1389-9fc519cdbdb508834e70546b83367eef.png)

<a id="summary-and-outlook"></a>

## Summary and Outlook

Parametric optimization treats successive MPC problems as members of one family rather than unrelated nonlinear programs. Sensitivity updates, predictor-corrector steps, and learned controller approximations trade online optimization time against approximation error and the need to detect a change of active set or operating regime.

MPC has now produced closed-loop behavior by solving a new finite-horizon problem after each observation. Can state-contingent decisions instead be computed across a family of possible states before the next state is known? [Finite-horizon dynamic programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) begins that second construction of feedback.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Sawaguchi2008"></a>
2.  Sawaguchi, Y., Furutani, E., Shirakami, G., Araki, M., & Fukuda, K. (2008). A Model-Predictive Hypnosis Control System Under Total Intravenous Anesthesia. _IEEE Transactions on Biomedical Engineering_, _55_(3), 874–887. [10.1109/tbme.2008.915670](https://doi.org/10.1109/tbme.2008.915670)

[

Feedback Control

MPC Variants and Reliable Operation


](13-mpc-variants-reliability.md)[

Dynamic Programming

Finite-Horizon Dynamic Programming


](15-finite-horizon-dp.md)


---

# CHAPITRE 15 — Finite-Horizon Dynamic Programming

Section du livre : Dynamic Programming

Page originale : https://pierrelucbacon.com/rlbook/finite-horizon-dp

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md

> **Cours de Pierre-Luc Bacon — 15.** [Page publiée](https://pierrelucbacon.com/rlbook/finite-horizon-dp) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/15-finite-horizon-dp.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Finite-Horizon Dynamic Programming

<a id="skip-to-article"></a>

MPC creates feedback by solving a new trajectory problem from each measured state. Can the decisions for an entire family of states be computed in advance instead? Dynamic programming decomposes a finite-horizon control problem into cost-to-go functions indexed by time and state.

The deterministic discrete-time optimal control problem provides the starting point. Stochastic successors will enter in the next chapter through conditional expectations.

Consider a typical DOCP of Bolza type:

<a id="OWCnCHSceF"></a>

$$
\begin{align*}
\text{minimize} \quad & J \triangleq c_\mathrm{T}(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t, \mathbf{u}_t) \\
\text{subject to} \quad 
& \mathbf{x}_{t+1} = \mathbf{f}_t(\mathbf{x}_t, \mathbf{u}_t), \quad t = 1, \ldots, T-1, \\
& \mathbf{u}_{lb} \leq \mathbf{u}_t \leq \mathbf{u}_{ub}, \quad t = 1, \ldots, T, \\
& \mathbf{x}_{lb} \leq \mathbf{x}_t \leq \mathbf{x}_{ub}, \quad t = 1, \ldots, T, \\
\text{given} \quad & \mathbf{x}_1
\end{align*}
$$

[(1)](#OWCnCHSceF "Link to this Equation")

Rather than considering only the total cost from the initial time to the final time, dynamic programming introduces the concept of cost from an arbitrary point in time to the end. This leads to the definition of the “cost-to-go” or “value function” $J_k(\mathbf{x}_k)$:

<a id="XtQeU14P26"></a>

$$
J_k(\mathbf{x}_k) \triangleq c_\mathrm{T}(\mathbf{x}_T) + \sum_{t=k}^{T-1} c_t(\mathbf{x}_t, \mathbf{u}_t)
$$

[(2)](#XtQeU14P26 "Link to this Equation")

This function represents the total cost incurred from stage $k$ onwards to the end of the time horizon, given that the system is initialized in state $\mathbf{x}_k$ at stage $k$. Suppose the problem has been solved from stage $k+1$ to the end, yielding the optimal cost-to-go $J_{k+1}^\star(\mathbf{x}_{k+1})$ for any state $\mathbf{x}_{k+1}$ at stage $k+1$. The question then becomes: how does this information inform the decision at stage $k$?

Given knowledge of the optimal behavior from $k+1$ onwards, the task reduces to determining the optimal action $\mathbf{u}_k$ at stage $k$. This control should minimize the sum of the immediate cost $c_k(\mathbf{x}_k, \mathbf{u}_k)$ and the optimal future cost $J_{k+1}^\star(\mathbf{x}_{k+1})$, where $\mathbf{x}_{k+1}$ is the resulting state after applying action $\mathbf{u}_k$. Mathematically, this is expressed as:

<a id="ffrJMuPUek"></a>

$$
J_k^\star(\mathbf{x}_k) = \min_{\mathbf{u}_k} \left[ c_k(\mathbf{x}_k, \mathbf{u}_k) + J_{k+1}^\star(\mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k)) \right]
$$

[(3)](#ffrJMuPUek "Link to this Equation")

This equation is known as Bellman’s equation, named after Richard Bellman, who formulated the principle of optimality:

> An optimal policy has the property that whatever the previous state and decision, the remaining decisions must constitute an optimal policy with regard to the state resulting from the previous decision.

In other words, any sub-path of an optimal path, from any intermediate point to the end, must itself be optimal. This principle is the basis for the backward induction procedure which computes the optimal value function and provides closed-loop control capabilities without having to use an explicit NLP solver.

Dynamic programming can handle nonlinear systems and non-quadratic cost functions naturally. It provides a global optimal solution, when one exists, and can incorporate state and control constraints with relative ease. However, as the dimension of the state space increases, this approach suffers from what Bellman termed the “curse of dimensionality.” The computational complexity and memory requirements grow exponentially with the state dimension, rendering direct application of dynamic programming intractable for high-dimensional problems.

Fortunately, learning-based methods offer efficient tools to combat the curse of dimensionality on two fronts: by using function approximation (e.g., neural networks) to avoid explicit discretization, and by leveraging randomization through Monte Carlo methods inherent in the learning paradigm. Most of this course is dedicated to those ideas.

<a id="backward-recursion"></a>

## Backward Recursion

How does the terminal cost propagate backward into an optimal action and value for every earlier state?

The principle of optimality provides a methodology for solving optimal control problems. Beginning at the final time horizon and working backwards, at each stage the local optimization problem given by Bellman’s equation is solved. This process, termed backward recursion or backward induction, constructs the optimal value function stage by stage.

<a id="backward-recursion-deterministic"></a>

[Algorithm 1](#backward-recursion-deterministic "Link to this Algorithm") (Backward Recursion for Dynamic Programming)

**Input:** Terminal cost function $c_\mathrm{T}(\cdot)$, stage cost functions $c_t(\cdot, \cdot)$, system dynamics $f_t(\cdot, \cdot)$, time horizon $\mathrm{T}$

**Output:** Optimal value functions $J_t^\star(\cdot)$ and optimal control policies $\pi_t^\star(\cdot)$ for $t = 1, \ldots, T$

1.  Initialize $J_T^\star(\mathbf{x}) = c_\mathrm{T}(\mathbf{x})$ for all $\mathbf{x}$ in the state space
    
2.  For $t = T-1, T-2, \ldots, 1$:
    
    1.  For each state $\mathbf{x}$ in the state space:
        
        1.  Compute $J_t^\star(\mathbf{x}) = \min_{\mathbf{u}} \left[ c_t(\mathbf{x}, \mathbf{u}) + J_{t+1}^\star(f_t(\mathbf{x}, \mathbf{u})) \right]$
            
        2.  Compute $\pi_t^\star(\mathbf{x}) = \arg\min_{\mathbf{u}} \left[ c_t(\mathbf{x}, \mathbf{u}) + J_{t+1}^\star(f_t(\mathbf{x}, \mathbf{u})) \right]$
            
    2.  End For
        
3.  End For
    
4.  Return $J_t^\star(\cdot)$, $\pi_t^\star(\cdot)$ for $t = 1, \ldots, T$
    

Upon completion of this backward pass, we now have access to the optimal control to take at any stage and in any state. Furthermore, we can simulate optimal trajectories from any initial state and applying the optimal policy at each stage to generate the optimal trajectory.

<a id="thm-bolza-backward"></a>

[Theorem 1](#thm-bolza-backward "Link to this Theorem") (Backward induction solves deterministic Bolza DOCP)

**Setting.** Let $\mathbf{x}_{t+1}=\mathbf{f}_t(\mathbf{x}_t,\mathbf{u}_t)$ for $t=1,\dots,T-1$, with admissible action sets $\mathcal{U}_t(\mathbf{x})\neq\varnothing$. Let stage costs $c_t(\mathbf{x},\mathbf{u})$ and terminal cost $c_\mathrm{T}(\mathbf{x})$ be real-valued and bounded below. Assume for every $(t,\mathbf{x})$ the one-step problem

<a id="e5GTr59qvN"></a>

$$
\min_{\mathbf{u}\in\mathcal{U}_t(\mathbf{x})}\big\{c_t(\mathbf{x},\mathbf{u})+J_{t+1}^\star(\mathbf{f}_t(\mathbf{x},\mathbf{u}))\big\}
$$

[(4)](#e5GTr59qvN "Link to this Equation")

admits a minimizer (e.g., compact $\mathcal{U}_t(\mathbf{x})$ and continuity suffice).

Define $J_T^\star(\mathbf{x}) \equiv c_\mathrm{T}(\mathbf{x})$ and for $t=T-1,\dots,1$

<a id="vGBBdOTV2P"></a>

$$
J_t^\star(\mathbf{x}) \;\triangleq\; \min_{\mathbf{u}\in\mathcal{U}_t(\mathbf{x})}
\Big[c_t(\mathbf{x},\mathbf{u})+J_{t+1}^\star\big(\mathbf{f}_t(\mathbf{x},\mathbf{u})\big)\Big],
$$

[(5)](#vGBBdOTV2P "Link to this Equation")

and select any minimizer $\boldsymbol{\pi}_t^\star(\mathbf{x})\in\arg\min(\cdot)$.

**Claim.** For every initial state $\mathbf{x}_1$, the control sequence $\boldsymbol{\pi}_1^\star(\mathbf{x}_1),\dots,\boldsymbol{\pi}_{T-1}^\star(\mathbf{x}_{T-1})$ generated by these selectors is optimal for the Bolza problem, and $J_1^\star(\mathbf{x}_1)$ equals the optimal cost. Moreover, $J_t^\star(\cdot)$ is the optimal cost-to-go from stage $t$ for every state, i.e., backward induction recovers the entire value function.

Proof 1

We give a direct proof by backward induction. The general idea is that any feasible sequence can be improved by replacing its tail with an optimal continuation, so optimal solutions can be built stage by stage. This is sometimes called a “cut-and-paste” argument.

**Step 1 (verification of the recursion at a fixed stage).**  
Fix $t\in\{1,\dots,T-1\}$ and $\mathbf{x}\in\mathbb{X}$. Consider any admissible control sequence $\mathbf{u}_t,\dots,\mathbf{u}_{T-1}$ starting from $\mathbf{x}_t=\mathbf{x}$ and define the induced states $\mathbf{x}_{k+1}=\mathbf{f}_k(\mathbf{x}_k,\mathbf{u}_k)$. Its total cost from $t$ is

<a id="iIlEQ1T00e"></a>

$$
c_t(\mathbf{x}_t,\mathbf{u}_t)+\sum_{k=t+1}^{T-1}c_k(\mathbf{x}_k,\mathbf{u}_k)+c_\mathrm{T}(\mathbf{x}_T).
$$

[(6)](#iIlEQ1T00e "Link to this Equation")

By definition of $J_{t+1}^\star$, the tail cost satisfies

<a id="PzYhSKIJAQ"></a>

$$
\sum_{k=t+1}^{T-1}c_k(\mathbf{x}_k,\mathbf{u}_k)+c_\mathrm{T}(\mathbf{x}_T)
\;\ge\; J_{t+1}^\star(\mathbf{x}_{t+1})
\;=\; J_{t+1}^\star\big(\mathbf{f}_t(\mathbf{x},\mathbf{u}_t)\big).
$$

[(7)](#PzYhSKIJAQ "Link to this Equation")

Hence the total cost is bounded below by

<a id="K3KkYm9Jbm"></a>

$$
c_t(\mathbf{x},\mathbf{u}_t)+J_{t+1}^\star\big(\mathbf{f}_t(\mathbf{x},\mathbf{u}_t)\big).
$$

[(8)](#K3KkYm9Jbm "Link to this Equation")

Taking the minimum over $\mathbf{u}_t\in\mathcal{U}_t(\mathbf{x})$ yields

<a id="inLo5VgUxI"></a>

$$
\text{(any admissible cost from $t$)}\;\ge\;J_t^\star(\mathbf{x}).
\tag{$\ast$}
$$

[(9)](#inLo5VgUxI "Link to this Equation")

**Step 2 (existence of an optimal prefix at stage $t$).**  
By assumption, there exists $\boldsymbol{\pi}_t^\star(\mathbf{x})$ attaining the minimum in the definition of $J_t^\star(\mathbf{x})$. If we now **paste** to $\boldsymbol{\pi}_t^\star(\mathbf{x})$ an optimal tail policy from $t+1$ (whose existence we will establish inductively), the resulting sequence attains cost exactly

<a id="BfMCqvYqHd"></a>

$$
c_t\big(\mathbf{x},\boldsymbol{\pi}_t^\star(\mathbf{x})\big)
+J_{t+1}^\star\!\Big(\mathbf{f}_t\big(\mathbf{x},\boldsymbol{\pi}_t^\star(\mathbf{x})\big)\Big)
=J_t^\star(\mathbf{x}),
$$

[(10)](#BfMCqvYqHd "Link to this Equation")

which matches the lower bound $(\ast)$; hence it is optimal from $t$.

**Step 3 (backward induction over time).**  
Base case $t=T$. The statement holds because $J_T^\star(\mathbf{x})=c_\mathrm{T}(\mathbf{x})$ and there is no control to choose.

Inductive step. Assume the tail statement holds for $t+1$: from any state $\mathbf{x}_{t+1}$ there exists an optimal control sequence realizing $J_{t+1}^\star(\mathbf{x}_{t+1})$. Then by Steps 1–2, selecting $\boldsymbol{\pi}_t^\star(\mathbf{x}_t)$ at stage $t$ and concatenating the optimal tail from $t+1$ yields an optimal sequence from $t$ with value $J_t^\star(\mathbf{x}_t)$.

By backward induction, the claim holds for all $t$, in particular for $t=1$ and any initial $\mathbf{x}_1$. Therefore the backward recursion both **certifies** optimality (verification) and **constructs** an optimal policy (synthesis), while recovering the full family $\{J_t^\star\}_{t=1}^T$.

Remark 1 (No “big NLP” required)

The Bolza DOCP over the whole horizon couples all controls through the dynamics and is typically posed as a single large nonlinear program. The proof shows you can solve **$T-1$ sequences of one-step problems** instead: at each $(t,\mathbf{x})$ minimize

<a id="VDdUD8dA5h"></a>

$$
\mathbf{u}\mapsto c_t(\mathbf{x},\mathbf{u}) + J_{t+1}^\star(\mathbf{f}_t(\mathbf{x},\mathbf{u})).
$$

[(11)](#VDdUD8dA5h "Link to this Equation")

In finite state–action spaces this becomes pure table lookup and argmin. In continuous spaces you still solve local one-step minimizations, but you avoid a monolithic horizon-coupled NLP.

Remark 2 (Graph interpretation (optional intuition))

Unroll time to form a DAG whose nodes are $(t,\mathbf{x})$ and whose edges correspond to feasible controls with edge weight $c_t(\mathbf{x},\mathbf{u})$. The terminal node cost is $c_\mathrm{T}(\cdot)$. The Bolza problem is a shortest-path problem on this DAG. The equation

<a id="l2myDnYLIz"></a>

$$
J_t^\star(\mathbf{x})=\min_{\mathbf{u}}\{c_t(\mathbf{x},\mathbf{u})+J_{t+1}^\star(\mathbf{f}_t(\mathbf{x},\mathbf{u}))\}
$$

[(12)](#l2myDnYLIz "Link to this Equation")

is exactly the dynamic programming recursion for shortest paths on acyclic graphs, hence backward induction is optimal.

<a id="example-optimal-harvest-in-resource-management"></a>

### Example: Optimal Harvest in Resource Management

Dynamic programming is often used in resource management and conservation biology to devise policies to be implemented by decision makers and stakeholders : for eg. in fishereries, or timber harvesting. Per [Conroy & Peterson (2013)](https://doi.org/10.1002/9781118506196), we consider a population of a particular species, whose abundance we denote by $x_t$, where $t$ represents discrete time steps. Our objective is to maximize the cumulative harvest over a finite time horizon, while also considering the long-term sustainability of the population. This optimization problem can be formulated as:

<a id="HJfpYjPYuV"></a>

$$
\text{maximize} \quad \sum_{t=t_0}^{t_f} F(x_t \cdot h_t) + F_\mathrm{T}(x_{t_f})
$$

[(13)](#HJfpYjPYuV "Link to this Equation")

Here, $F(\cdot)$ represents the immediate reward function associated with harvesting, $h_t$ is the harvest rate at time $t$, and $F_\mathrm{T}(\cdot)$ denotes a terminal value function that could potentially assign value to the final population state. In this particular problem, we assign no terminal value to the final population state, setting $F_\mathrm{T}(x_{t_f}) = 0$ and allowing us to focus solely on the cumulative harvest over the time horizon.

In our model population model, the abundance of a specicy $x$ ranges from 1 to 100 individuals. The decision variable is the harvest rate $h$, which can take values from the set $D = \{0, 0.1, 0.2, 0.3, 0.4, 0.5\}$. The population dynamics are governed by a modified logistic growth model:

<a id="f7wwJSBnxl"></a>

$$
x_{t+1} = x_t + 0.3x_t(1 - x_t/125) - h_tx_t
$$

[(14)](#f7wwJSBnxl "Link to this Equation")

where the 0.3 represents the growth rate and 125 is the carrying capacity (the maximum population size given the available resources). The logistic growth model returns continuous values; however our DP formulation uses a discrete state space. Therefore, we also round the the outcomes to the nearest integer.

Applying the principle of optimality, we can express the optimal value function $J^\star(x_t,t)$ recursively:

<a id="b1pGqySSK0"></a>

$$
J^\star(x_t, t) = \max_{h_t \in D} (F(x, h, t) + J^*(x_{t+1}, t+1))
$$

[(15)](#b1pGqySSK0 "Link to this Equation")

with the boundary condition $J^*(x_{t_f}) = 0$.

It’s worth noting that while this example uses a relatively simple model, the same principles can be applied to more complex scenarios involving stochasticity, multiple species interactions, or spatial heterogeneity.

<a id="IsgDUckGiT"></a>

Source

```python
#  label: dp-harvest-policy
#  caption: Dynamic programming harvest example: printed output shows the optimal policy table, resulting population trajectory, and per-period harvests for an initial population of 50 fish.

%config InlineBackend.figure_format = 'retina'
import numpy as np

# Parameters
r_max = 0.3
K = 125
T = 20  # Number of time steps
N_max = 100  # Maximum population size to consider
h_max = 0.5  # Maximum harvest rate
h_step = 0.1  # Step size for harvest rate

# Create state and decision spaces
N_space = np.arange(1, N_max + 1)
h_space = np.arange(0, h_max + h_step, h_step)

# Initialize value function and policy
V = np.zeros((T + 1, len(N_space)))
policy = np.zeros((T, len(N_space)))

# Terminal value function (F_T)
def terminal_value(N):
    return 0

# State return function (F)
def state_return(N, h):
    return N * h

# State dynamics function
def state_dynamics(N, h):
    return N + r_max * N * (1 - N / K) - N * h

# Backward iteration
for t in range(T - 1, -1, -1):
    for i, N in enumerate(N_space):
        max_value = float('-inf')
        best_h = 0

        for h in h_space:
            if h > 1:  # Ensure harvest rate doesn't exceed 100%
                continue

            next_N = state_dynamics(N, h)
            if next_N < 1:  # Ensure population doesn't go extinct
                continue

            next_N_index = np.searchsorted(N_space, next_N)
            if next_N_index == len(N_space):
                next_N_index -= 1

            value = state_return(N, h) + V[t + 1, next_N_index]

            if value > max_value:
                max_value = value
                best_h = h

        V[t, i] = max_value
        policy[t, i] = best_h

# Function to simulate the optimal policy with conversion to Python floats
def simulate_optimal_policy(initial_N, T):
    trajectory = [float(initial_N)]  # Ensure first value is a Python float
    harvests = []

    for t in range(T):
        N = trajectory[-1]
        N_index = np.searchsorted(N_space, N)
        if N_index == len(N_space):
            N_index -= 1

        h = policy[t, N_index]
        harvests.append(float(N * h))  # Ensure harvest is a Python float

        next_N = state_dynamics(N, h)
        trajectory.append(float(next_N))  # Ensure next population value is a Python float

    return trajectory, harvests

# Example usage
initial_N = 50
trajectory, harvests = simulate_optimal_policy(initial_N, T)

print("Optimal policy:")
print(policy)
print("\nPopulation trajectory:", trajectory)
print("Harvests:", harvests)
print("Total harvest:", sum(harvests))
```

```
Optimal policy:
[[0.2 0.2 0.2 ... 0.4 0.4 0.5]
 [0.2 0.2 0.2 ... 0.4 0.4 0.5]
 [0.2 0.2 0.2 ... 0.4 0.4 0.4]
 ...
 [0.2 0.2 0.2 ... 0.5 0.5 0.5]
 [0.2 0.5 0.5 ... 0.5 0.5 0.5]
 [0.2 0.5 0.5 ... 0.5 0.5 0.5]]

Population trajectory: [50.0, 54.0, 63.2016, 53.614938617856, 62.80047226002128, 65.89520835342945, 62.063500827311884, 65.23169346891407, 61.5424456170318, 64.7610004703774, 61.171531280797, 64.42514256278633, 60.90621923290014, 52.003257133909514, 61.11382126799714, 64.37282756165249, 60.86484408994034, 39.80100508132969, 28.038916051902078, 20.544298889444192, 15.422475391094192]
Harvests: [5.0, 0.0, 18.960480000000004, 0.0, 6.280047226002129, 13.17904167068589, 6.206350082731189, 13.046338693782815, 6.15424456170318, 12.95220009407548, 6.1171531280797, 12.885028512557268, 18.271865769870047, 0.0, 6.111382126799715, 12.874565512330499, 30.43242204497017, 19.900502540664846, 14.019458025951039, 10.272149444722096]
Total harvest: 212.66322943492605
```

<a id="handling-continuous-spaces-with-interpolation"></a>

## Handling Continuous Spaces with Interpolation

When the next state falls between stored grid points, which interpolation rule supplies its continuation value without destroying the recursion?

In many real-world problems, such as our resource management example, the state space is inherently continuous. Dynamic programming, however, is usually defined on discrete state spaces. To reconcile this, we approximate the value function on a finite grid of points and use interpolation to estimate its value elsewhere.

In our earlier example, we acted as if population sizes could only be whole numbers: 1 fish, 2 fish, 3 fish. But real measurements don’t fit neatly. What do you do with a survey that reports 42.7 fish? Our reflex in the code example was to round to the nearest integer, effectively saying “let’s just call it 43.” This corresponds to **nearest-neighbor interpolation**, also known as discretization. It’s the zeroth-order case: you assume the value between grid points is constant and equal to the closest one. In practice, this amounts to overlaying a grid on the continuous landscape and forcing yourself to stand at the intersections. In our demo code, this step was carried out with [`numpy.searchsorted`](https://numpy.org/doc/2.0/reference/generated/numpy.searchsorted.html).

While easy to implement, nearest-neighbor interpolation can introduce artifacts:

1.  Decisions may change abruptly, even if the state only shifts slightly.
    
2.  Precision is lost, especially in regimes where small variations matter.
    
3.  The curse of dimensionality forces an impractically fine grid if many state variables are added.
    

To address these issues, we can use **higher-order interpolation**. Instead of taking the nearest neighbor, we estimate the value at off-grid points by leveraging multiple nearby values.

<a id="backward-recursion-with-interpolation"></a>

### Backward Recursion with Interpolation

Suppose we have computed $J_{k+1}^\star(\mathbf{x})$ only at grid points $\mathbf{x} \in \mathcal{X}_\text{grid}$. To evaluate Bellman’s equation at an arbitrary $\mathbf{x}_{k+1}$, we interpolate. Formally, let $I_{k+1}(\mathbf{x})$ be the interpolation operator that extends the value function from $\mathcal{X}_\text{grid}$ to the continuous space. Then:

<a id="s1vtddg7hC"></a>

$$
J_k^\star(\mathbf{x}_k) 
= \min_{\mathbf{u}_k} 
\Big[ c_k(\mathbf{x}_k, \mathbf{u}_k) 
+ I_{k+1}\big(\mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k)\big) \Big].
$$

[(16)](#s1vtddg7hC "Link to this Equation")

For instance, in one dimension, linear interpolation gives:

<a id="JnKFur0OZE"></a>

$$
I_{k+1}(x) = J_{k+1}^\star(x_l) + \frac{x - x_l}{x_u - x_l} \big(J_{k+1}^\star(x_u) - J_{k+1}^\star(x_l)\big),
$$

[(17)](#JnKFur0OZE "Link to this Equation")

where $x_l$ and $x_u$ are the nearest grid points bracketing $x$. Linear interpolation is often sufficient, but higher-order methods (cubic splines, radial basis functions) can yield smoother and more accurate estimates. The choice of interpolation scheme and grid layout both affect accuracy and efficiency. A finer grid improves resolution but increases computational cost, motivating strategies like adaptive grid refinement or replacing interpolation altogether with parametric function approximation which we are going to see later in this book.

In higher-dimensional spaces, naive interpolation becomes prohibitively expensive due to the curse of dimensionality. Several approaches such as tensorized multilinear interpolation, radial basis functions, and machine learning models address this challenge by extending a common principle: they approximate the value function at unobserved points using information from a finite set of evaluations. However, as dimensionality continues to grow, even tensor methods face scalability limits, which is why flexible parametric models like neural networks have become essential tools for high-dimensional function approximation.

<a id="backward-recursion-interp"></a>

[Algorithm 2](#backward-recursion-interp "Link to this Algorithm") (Backward Recursion with Interpolation)

**Input:**

-   Terminal cost $c_\mathrm{T}(\cdot)$
    
-   Stage costs $c_t(\cdot,\cdot)$
    
-   Dynamics $f_t(\cdot,\cdot)$
    
-   Time horizon $T$
    
-   State grid $\mathcal{X}_\text{grid}$
    
-   Action set $\mathcal{U}$
    
-   Interpolation method $\mathcal{I}(\cdot)$ (e.g., linear, cubic spline, RBF, neural network)
    

**Output:** Value functions $J_t^\star(\cdot)$ and policies $\pi_t^\star(\cdot)$ for all $t$

1.  **Initialize terminal values:**
    
    -   Compute $J_T^\star(\mathbf{x}) = c_\mathrm{T}(\mathbf{x})$ for all $\mathbf{x} \in \mathcal{X}_\text{grid}$
        
    -   Fit interpolator: $I_T \leftarrow \mathcal{I}(\{\mathbf{x}, J_T^\star(\mathbf{x})\}_{\mathbf{x} \in \mathcal{X}_\text{grid}})$
        
2.  **Backward recursion:**  
    For $t = T-1, T-2, \dots, 0$:
    
    a. **Bellman update at grid points:**  
    For each $\mathbf{x} \in \mathcal{X}_\text{grid}$:
    
    -   For each $\mathbf{u} \in \mathcal{U}$:
        
        -   Compute next state: $\mathbf{x}_\text{next} = f_t(\mathbf{x}, \mathbf{u})$
            
        -   **Interpolate future cost:** $\hat{J}_{t+1}(\mathbf{x}_\text{next}) = I_{t+1}(\mathbf{x}_\text{next})$
            
        -   Compute total cost: $J_t(\mathbf{x}, \mathbf{u}) = c_t(\mathbf{x}, \mathbf{u}) + \hat{J}_{t+1}(\mathbf{x}_\text{next})$
            
    -   **Minimize over actions:** $J_t^\star(\mathbf{x}) = \min_{\mathbf{u} \in \mathcal{U}} J_t(\mathbf{x}, \mathbf{u})$
        
    -   Store optimal action: $\pi_t^\star(\mathbf{x}) = \arg\min_{\mathbf{u} \in \mathcal{U}} J_t(\mathbf{x}, \mathbf{u})$
        
    
    b. **Fit interpolator for current stage:**  
    $I_t \leftarrow \mathcal{I}(\{\mathbf{x}, J_t^\star(\mathbf{x})\}_{\mathbf{x} \in \mathcal{X}_\text{grid}})$
    
3.  **Return:** Interpolated value functions $\{I_t\}_{t=0}^T$ and policies $\{\pi_t^\star\}_{t=0}^{T-1}$
    

<a id="example-optimal-harvest-with-linear-interpolation"></a>

#### Example: Optimal Harvest with Linear Interpolation

Here is a demonstration of the backward recursion procedure using linear interpolation.

<a id="qolepFVsQi"></a>

Source

```python
#  label: dp-harvest-interp
#  caption: Backward recursion with linear interpolation: console output summarizes the smoothed optimal policy, state trajectory, and harvest totals for the resource management example.


import numpy as np

# Parameters
r_max = 0.3
K = 125
T = 20  # Number of time steps
N_max = 100  # Maximum population size to consider
h_max = 0.5  # Maximum harvest rate
h_step = 0.1  # Step size for harvest rate

# Create state and decision spaces
N_space = np.arange(1, N_max + 1)
h_space = np.arange(0, h_max + h_step, h_step)

# Initialize value function and policy
V = np.zeros((T + 1, len(N_space)))
policy = np.zeros((T, len(N_space)))

# Terminal value function (F_T)
def terminal_value(N):
    return 0

# State return function (F)
def state_return(N, h):
    return N * h

# State dynamics function
def state_dynamics(N, h):
    return N + r_max * N * (1 - N / K) - N * h

# Function to linearly interpolate between grid points in N_space
def interpolate_value_function(V, N_space, next_N, t):
    if next_N <= N_space[0]:
        return V[t, 0]  # Below or at minimum population, return minimum value
    if next_N >= N_space[-1]:
        return V[t, -1]  # Above or at maximum population, return maximum value
    
    # Find indices to interpolate between
    lower_idx = np.searchsorted(N_space, next_N) - 1
    upper_idx = lower_idx + 1
    
    # Linear interpolation
    N_lower = N_space[lower_idx]
    N_upper = N_space[upper_idx]
    weight = (next_N - N_lower) / (N_upper - N_lower)
    return (1 - weight) * V[t, lower_idx] + weight * V[t, upper_idx]

# Backward iteration with interpolation
for t in range(T - 1, -1, -1):
    for i, N in enumerate(N_space):
        max_value = float('-inf')
        best_h = 0
        
        for h in h_space:
            if h > 1:  # Ensure harvest rate doesn't exceed 100%
                continue
            
            next_N = state_dynamics(N, h)
            if next_N < 1:  # Ensure population doesn't go extinct
                continue
            
            # Interpolate value for next_N
            value = state_return(N, h) + interpolate_value_function(V, N_space, next_N, t + 1)
            
            if value > max_value:
                max_value = value
                best_h = h
        
        V[t, i] = max_value
        policy[t, i] = best_h

# Function to simulate the optimal policy using interpolation
def simulate_optimal_policy(initial_N, T):
    trajectory = [initial_N]
    harvests = []

    for t in range(T):
        N = trajectory[-1]
        
        # Interpolate optimal harvest rate
        if N <= N_space[0]:
            h = policy[t, 0]
        elif N >= N_space[-1]:
            h = policy[t, -1]
        else:
            lower_idx = np.searchsorted(N_space, N) - 1
            upper_idx = lower_idx + 1
            weight = (N - N_space[lower_idx]) / (N_space[upper_idx] - N_space[lower_idx])
            h = (1 - weight) * policy[t, lower_idx] + weight * policy[t, upper_idx]
        
        harvests.append(float(N * h))  # Ensure harvest is a Python float
        next_N = state_dynamics(N, h)
        trajectory.append(float(next_N))  # Ensure next population value is a Python float

    return trajectory, harvests

# Example usage
initial_N = 50
trajectory, harvests = simulate_optimal_policy(initial_N, T)

print("Optimal policy:")
print(policy)
print("\nPopulation trajectory:", trajectory)
print("Harvests:", harvests)
print("Total harvest:", sum(harvests))
```

```
Optimal policy:
[[0.  0.  0.  ... 0.4 0.4 0.4]
 [0.  0.  0.  ... 0.4 0.4 0.4]
 [0.  0.  0.  ... 0.4 0.4 0.4]
 ...
 [0.  0.  0.3 ... 0.5 0.5 0.5]
 [0.2 0.5 0.5 ... 0.5 0.5 0.5]
 [0.2 0.5 0.5 ... 0.5 0.5 0.5]]

Population trajectory: [50, 59.0, 62.445600000000006, 62.793456961535966, 60.906514028106535, 64.1847685511936, 60.71600257278426, 64.0117639631371, 60.5789261378371, 63.88717626457206, 60.48012279248407, 63.79731874379539, 60.40881570882111, 63.73243881376377, 60.3573056779798, 63.685556376683536, 60.32007179593332, 39.523630889226936, 27.8698229545787, 20.431713488016012, 15.34347899187751]
Harvests: [0.0, 5.9, 9.027135936000038, 11.26173625265758, 6.0906514028106535, 12.83695371023872, 6.071600257278426, 12.80235279262742, 6.057892613783711, 12.777435252914414, 6.0480122792484075, 12.759463748759078, 6.040881570882111, 12.746487762752755, 6.03573056779798, 12.737111275336709, 30.16003589796666, 19.761815444613468, 13.93491147728935, 10.215856744008006]
Total harvest: 213.2660649869655
```

Due to pedagogical considerations, this example is using our own implementation of the linear interpolation procedure. However, a more general and practical approach would be to use a built-in interpolation procedure in NumPy. Because our state space has a single dimension, we can simply use [scipy.interpolate.interp1d](https://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.interp1d.html) which offers various interpolation methods through its `kind` argument, including ‘linear’, ‘nearest’, ‘zero’, ‘slinear’, ‘quadratic’, and ‘cubic’.

Here’s a more general implementation which here uses cubic interpolation through the `scipy.interpolate.interp1d` function:

<a id="stF2gYHAru"></a>

Source

```python
#  label: dp-harvest-cubic
#  caption: Cubic interpolation further smooths the optimal harvest policy. This output prints the leading rows of the policy table along with the resulting trajectory and harvest statistics.


import numpy as np
from scipy.interpolate import interp1d

rng = np.random.default_rng(2026)

# Parameters
r_max = 0.3
K = 125
T = 20  # Number of time steps
N_max = 100  # Maximum population size to consider
h_max = 0.5  # Maximum harvest rate
h_step = 0.1  # Step size for harvest rate

# Create state and decision spaces
N_space = np.arange(1, N_max + 1)
h_space = np.arange(0, h_max + h_step, h_step)

# Initialize value function and policy
V = np.zeros((T + 1, len(N_space)))
policy = np.zeros((T, len(N_space)))

# Terminal value function (F_T)
def terminal_value(N):
    return 0

# State return function (F)
def state_return(N, h):
    return N * h

# State dynamics function
def state_dynamics(N, h):
    return N + r_max * N * (1 - N / K) - N * h

# Function to create interpolation function for a given time step
def create_interpolator(V_t, N_space):
    return interp1d(N_space, V_t, kind='cubic', bounds_error=False, fill_value=(V_t[0], V_t[-1]))

# Backward iteration with interpolation
for t in range(T - 1, -1, -1):
    interpolator = create_interpolator(V[t+1], N_space)
    
    for i, N in enumerate(N_space):
        max_value = float('-inf')
        best_h = 0

        for h in h_space:
            if h > 1:  # Ensure harvest rate doesn't exceed 100%
                continue

            next_N = state_dynamics(N, h)
            if next_N < 1:  # Ensure population doesn't go extinct
                continue

            # Use interpolation to get the value for next_N
            value = state_return(N, h) + interpolator(next_N)

            if value > max_value:
                max_value = value
                best_h = h

        V[t, i] = max_value
        policy[t, i] = best_h

# Function to simulate the optimal policy using interpolation
def simulate_optimal_policy(initial_N, T):
    trajectory = [initial_N]
    harvests = []

    for t in range(T):
        N = trajectory[-1]
        
        # Create interpolator for the policy at time t
        policy_interpolator = interp1d(N_space, policy[t], kind='cubic', bounds_error=False, fill_value=(policy[t][0], policy[t][-1]))
        
        h = policy_interpolator(N)
        harvests.append(float(N * h))  # Ensure harvest is a Python float

        next_N = state_dynamics(N, h)
        trajectory.append(float(next_N))  # Ensure next population value is a Python float

    return trajectory, harvests

# Example usage
initial_N = 50
trajectory, harvests = simulate_optimal_policy(initial_N, T)

print("Optimal policy (first few rows):")
print(policy[:5])
print("\nPopulation trajectory:", trajectory)
print("Harvests:", harvests)
print("Total harvest:", sum(harvests))
```

```
Optimal policy (first few rows):
[[0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]]

Population trajectory: [50, 59.0, 62.445600000000006, 62.855816819468515, 66.38501069094303, 62.46338144008508, 66.19082983826176, 62.307060290079974, 65.86630883298251, 62.0275406161329, 65.08602250342238, 61.40579635061663, 65.16431296091169, 61.453283417050585, 65.25607512917725, 61.51516182245858, 65.3615391678991, 42.035857104726354, 29.387853805711547, 21.437532761435143, 16.047063462998082]
Harvests: [3.3073317494565994e-20, 5.8999999999999995, 8.96477607806749, 5.84550227506383, 13.260405311492967, 5.647548383617885, 13.22607620843378, 5.815662115341462, 13.186571332467969, 6.31598238982395, 13.039176123074048, 5.613609913801768, 13.068992991332264, 5.569578810421298, 13.097683026436256, 5.526294879593217, 32.68102988779014, 21.017928552363177, 14.693926902855772, 10.718766380713353]
Total harvest: 213.18951156269063
```

<a id="linear-quadratic-regulator-via-dynamic-programming"></a>

## Linear Quadratic Regulator via Dynamic Programming

What form do the value function and feedback law take when the dynamics are linear and every cost is quadratic?

The [successive-approximation chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/09-iterative-trajectory-optimization.md) obtained a quadratic tail by eliminating controls backward. In the linear-quadratic case, that tail is the optimal cost-to-go. Bellman’s equation therefore gives another derivation of the same Riccati recursion.

Linear dynamics and quadratic costs give a backward recursion that can be solved in closed form. The value function remains quadratic at every stage, and the optimal policy is a linear feedback law. No state grid, interpolation scheme, or general function approximator is needed. The recursion tracks a finite sequence of matrices.

Consider a discrete-time linear system:

<a id="nQ8DMeDYEq"></a>

$$
\mathbf{x}_{t+1} = A_t\mathbf{x}_t + B_t\mathbf{u}_t
$$

[(18)](#nQ8DMeDYEq "Link to this Equation")

where $\mathbf{x}_t \in \mathbb{R}^n$ is the state and $\mathbf{u}_t \in \mathbb{R}^m$ is the control input. The matrices $A_t \in \mathbb{R}^{n \times n}$ and $B_t \in \mathbb{R}^{n \times m}$ describe the system dynamics at time $t$.

The cost function to be minimized is quadratic:

<a id="OyVN6TZMLl"></a>

$$
J = \frac{1}{2}\mathbf{x}_T^\top Q_T \mathbf{x}_T + \frac{1}{2}\sum_{t=0}^{T-1} \left(\mathbf{x}_t^\top Q_t \mathbf{x}_t + \mathbf{u}_t^\top R_t \mathbf{u}_t\right)
$$

[(19)](#OyVN6TZMLl "Link to this Equation")

where $Q_T \succeq 0$ (positive semidefinite), $Q_t \succeq 0$, and $R_t \succ 0$ (positive definite) are symmetric matrices of appropriate dimensions. The positive definiteness of $R_t$ ensures the minimization problem is well-posed.

A quadratic terminal cost implies a quadratic value function at every earlier stage. Suppose the optimal cost-to-go at stage $t$ has the form

<a id="osfGzcauAn"></a>

$$
J_t^\star(\mathbf{x}_t) = \frac{1}{2}\mathbf{x}_t^\top P_t \mathbf{x}_t
$$

[(20)](#osfGzcauAn "Link to this Equation")

for some positive semidefinite matrix $P_t$. At the terminal time, this is true by definition: $P_T = Q_T$.

Backward induction verifies the hypothesis. Assume $J_{t+1}^\star(\mathbf{x}_{t+1}) = \frac{1}{2}\mathbf{x}_{t+1}^\top P_{t+1} \mathbf{x}_{t+1}$. Bellman’s equation at stage $t$ is

<a id="M7LC8qiO0W"></a>

$$
J_t^\star(\mathbf{x}_t) = \min_{\mathbf{u}_t} \left[ \frac{1}{2}\mathbf{x}_t^\top Q_t \mathbf{x}_t + \frac{1}{2}\mathbf{u}_t^\top R_t \mathbf{u}_t + J_{t+1}^\star(\mathbf{x}_{t+1}) \right]
$$

[(21)](#M7LC8qiO0W "Link to this Equation")

Substituting the dynamics $\mathbf{x}_{t+1} = A_t\mathbf{x}_t + B_t\mathbf{u}_t$ and the quadratic form for $J_{t+1}^\star$:

<a id="EAKXR1xxVg"></a>

$$
J_t^\star(\mathbf{x}_t) = \min_{\mathbf{u}_t} \left[ \frac{1}{2}\mathbf{x}_t^\top Q_t \mathbf{x}_t + \frac{1}{2}\mathbf{u}_t^\top R_t \mathbf{u}_t + \frac{1}{2}(A_t\mathbf{x}_t + B_t\mathbf{u}_t)^\top P_{t+1} (A_t\mathbf{x}_t + B_t\mathbf{u}_t) \right]
$$

[(22)](#EAKXR1xxVg "Link to this Equation")

Expanding the last term:

<a id="aDjb7BhJsz"></a>

$$
(A_t\mathbf{x}_t + B_t\mathbf{u}_t)^\top P_{t+1} (A_t\mathbf{x}_t + B_t\mathbf{u}_t) = \mathbf{x}_t^\top A_t^\top P_{t+1} A_t \mathbf{x}_t + 2\mathbf{x}_t^\top A_t^\top P_{t+1} B_t \mathbf{u}_t + \mathbf{u}_t^\top B_t^\top P_{t+1} B_t \mathbf{u}_t
$$

[(23)](#aDjb7BhJsz "Link to this Equation")

The expression inside the minimization becomes:

<a id="UiGVRtWGZL"></a>

$$
\frac{1}{2}\mathbf{x}_t^\top Q_t \mathbf{x}_t + \frac{1}{2}\mathbf{u}_t^\top R_t \mathbf{u}_t + \frac{1}{2}\mathbf{x}_t^\top A_t^\top P_{t+1} A_t \mathbf{x}_t + \mathbf{x}_t^\top A_t^\top P_{t+1} B_t \mathbf{u}_t + \frac{1}{2}\mathbf{u}_t^\top B_t^\top P_{t+1} B_t \mathbf{u}_t
$$

[(24)](#UiGVRtWGZL "Link to this Equation")

Collecting terms involving $\mathbf{u}_t$:

<a id="j4BLfAeQQD"></a>

$$
= \frac{1}{2}\mathbf{x}_t^\top (Q_t + A_t^\top P_{t+1} A_t) \mathbf{x}_t + \mathbf{x}_t^\top A_t^\top P_{t+1} B_t \mathbf{u}_t + \frac{1}{2}\mathbf{u}_t^\top (R_t + B_t^\top P_{t+1} B_t) \mathbf{u}_t
$$

[(25)](#j4BLfAeQQD "Link to this Equation")

This is a quadratic function of $\mathbf{u}_t$. To find the minimizer, we take the gradient with respect to $\mathbf{u}_t$ and set it to zero:

<a id="GXI3dRedGA"></a>

$$
\frac{\partial}{\partial \mathbf{u}_t} = (R_t + B_t^\top P_{t+1} B_t) \mathbf{u}_t + B_t^\top P_{t+1} A_t \mathbf{x}_t = 0
$$

[(26)](#GXI3dRedGA "Link to this Equation")

Since $R_t + B_t^\top P_{t+1} B_t$ is positive definite (both $R_t$ and $P_{t+1}$ are positive semidefinite with $R_t$ strictly positive), we can solve for the optimal control:

<a id="pU5FezBFh9"></a>

$$
\mathbf{u}_t^\star = -(R_t + B_t^\top P_{t+1} B_t)^{-1} B_t^\top P_{t+1} A_t \mathbf{x}_t
$$

[(27)](#pU5FezBFh9 "Link to this Equation")

Define the gain matrix:

<a id="hcUVIx69H5"></a>

$$
K_t = (R_t + B_t^\top P_{t+1} B_t)^{-1} B_t^\top P_{t+1} A_t
$$

[(28)](#hcUVIx69H5 "Link to this Equation")

so that $\mathbf{u}_t^\star = -K_t\mathbf{x}_t$. This is a **linear feedback policy**: the optimal control is simply a linear function of the current state.

Substituting $\mathbf{u}_t^\star$ back into the cost-to-go expression and simplifying (by completing the square), we obtain:

<a id="RBCevRWZSO"></a>

$$
J_t^\star(\mathbf{x}_t) = \frac{1}{2}\mathbf{x}_t^\top P_t \mathbf{x}_t
$$

[(29)](#RBCevRWZSO "Link to this Equation")

where $P_t$ satisfies the **discrete-time Riccati equation**:

<a id="MyuIdcBXyK"></a>

$$
P_t = Q_t + A_t^\top P_{t+1} A_t - A_t^\top P_{t+1} B_t (R_t + B_t^\top P_{t+1} B_t)^{-1} B_t^\top P_{t+1} A_t
$$

[(30)](#MyuIdcBXyK "Link to this Equation")

The resulting backward recursion is:

<a id="backward-recursion-lqr"></a>

[Algorithm 3](#backward-recursion-lqr "Link to this Algorithm") (Backward Recursion for LQR)

**Input:** System matrices $A_t, B_t$, cost matrices $Q_t, R_t, Q_T$, time horizon $T$

**Output:** Cost matrices $P_t$ and gain matrices $K_t$ for $t = 0, \ldots, T-1$

1.  **Initialize:** $P_T = Q_T$
    
2.  **For** $t = T-1, T-2, \ldots, 0$:
    
    1.  Compute the gain matrix:
        
        <a id="VeBpasiRRs"></a>
        
        $$
        K_t = (R_t + B_t^\top P_{t+1} B_t)^{-1} B_t^\top P_{t+1} A_t
        $$
        
        [(31)](#VeBpasiRRs "Link to this Equation")
        
    2.  Compute the cost matrix via the Riccati equation:
        
        <a id="pDPHFVClZk"></a>
        
        $$
        P_t = Q_t + A_t^\top P_{t+1} A_t - A_t^\top P_{t+1} B_t (R_t + B_t^\top P_{t+1} B_t)^{-1} B_t^\top P_{t+1} A_t
        $$
        
        [(32)](#pDPHFVClZk "Link to this Equation")
        
3.  **End For**
    
4.  **Return:** $\{P_0, \ldots, P_T\}$ and $\{K_0, \ldots, K_{T-1}\}$
    

**Optimal policy:** $\mathbf{u}_t^\star = -K_t\mathbf{x}_t$

**Optimal cost-to-go:** $J_t^\star(\mathbf{x}_t) = \frac{1}{2}\mathbf{x}_t^\top P_t \mathbf{x}_t$

<a id="local-stabilization-of-the-cart-pole"></a>

### Local Stabilization of the Cart-Pole

The cart-pole in the trajectory-optimization chapter started from the downward configuration and required a large nonlinear maneuver to reach the top. Once it is near the upright equilibrium, a smaller problem remains: reject local deviations by moving the cart in response to the measured state. The nonlinear state and input are the same as before,

<a id="RBWddFYBcK"></a>

$$
\mathbf{x}=(p,v,\theta,\omega), \qquad
u=\text{horizontal cart acceleration},
$$

[(33)](#RBWddFYBcK "Link to this Equation")

with $\theta=0$ at upright. Linearizing the discrete RK4 update $F_h$ at $(\mathbf{x}^\star,u^\star)=(0,0)$ gives

<a id="mROYKw7Oe0"></a>

$$
\delta\mathbf{x}_{k+1}
\approx A\,\delta\mathbf{x}_k+B\,\delta u_k,
\qquad
A=\left.\frac{\partial F_h}{\partial\mathbf{x}}\right|_{(0,0)},
\quad
B=\left.\frac{\partial F_h}{\partial u}\right|_{(0,0)}.
$$

[(34)](#mROYKw7Oe0 "Link to this Equation")

The experiment uses $h=0.02$ s, $Q=\operatorname{diag}(2,0.2,80,3)$, and $R=0.15$. For this time-invariant infinite-horizon case, the Riccati recursion converges to a fixed matrix $P$ that satisfies the discrete algebraic Riccati equation. The corresponding policy is $u_k=-K\delta\mathbf{x}_k$.

The unconstrained linear closed loop is asymptotically stable when every eigenvalue of $A-BK$ lies inside the unit disk. The physical implementation adds two constraints that are absent from that eigenvalue calculation: acceleration is clipped to $|u|\leq 8\;\mathrm{m\,s^{-2}}$, and the cart must remain inside a 2.4 m rail. Three deterministic nonlinear rollouts distinguish the claims supported by the linearization:

1.  An uncontrolled pole begins $5^\circ$ from upright.
    
2.  The LQR controller begins from the same $5^\circ$ displacement.
    
3.  The same controller begins $45^\circ$ from upright with the same actuator and rail limits.
    

<a id="TsSfJJE5rK"></a>

```python
from pathlib import Path
import sys

code_directory = Path.cwd() / "code"
if str(code_directory) not in sys.path:
    sys.path.insert(0, str(code_directory))

from cartpole_control import (
    CartPoleParameters,
    design_lqr,
    format_lqr_metrics,
    make_lqr_animation,
    make_lqr_figure,
    run_lqr_cases,
)

cartpole_parameters = CartPoleParameters()
lqr_design = design_lqr(cartpole_parameters)
lqr_cases = run_lqr_cases(cartpole_parameters)
```

<a id="R4fplKK08B"></a>

<a id="fig-cartpole-lqr-limits"></a>

<a id="fig-cartpole-lqr-limits-code"></a>

```python
print(format_lqr_metrics(lqr_cases, lqr_design))
make_lqr_figure(lqr_cases, cartpole_parameters)
```

[Figure 1:](#fig-cartpole-lqr-limits "Link to this figure")The discrete linear closed loop is stable, and the nonlinear controller recovers from a 5 degree perturbation. Without control, the same initial displacement grows. From 45 degrees, the commanded acceleration saturates and the cart reaches its rail limit, so the local controller does not complete the recovery. All curves use the same nonlinear plant; only the initial state and controller differ.

<a id="fig-cartpole-lqr-limits-outputs"></a>

```
closed-loop spectral radius: 0.9824
uncontrolled, 5 deg    not stabilized final angle= -71.71 deg max |x|= 0.00 m max |u|= 0.0 m/s^2
LQR, 5 deg             stabilized     final angle=  -0.00 deg max |x|= 0.15 m max |u|= 4.0 m/s^2
LQR, 45 deg            rail limit     final angle= 146.84 deg max |x|= 2.40 m max |u|= 8.0 m/s^2
```

![<Figure size 1080x352.5 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/2de24230e2-89b6e9eda1b9b68338de380035bf2770.png)

![<Figure size 1080x352.5 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6b5bb89660-c0c70ec142daea90e804c1c5ecc56cfa.png)

The closed-loop eigenvalues certify asymptotic stability of the unconstrained linearized model, not every trajectory of the nonlinear constrained plant. The $5^\circ$ rollout remains in a region where the linear approximation supplies useful actions. The $45^\circ$ rollout immediately asks for more acceleration than the actuator can provide, then exhausts the available rail. Increasing the entries of $Q$ cannot remove those physical limits.

<a id="LjtYrBdYul"></a>

<a id="anim-cartpole-lqr"></a>

<a id="anim-cartpole-lqr-code"></a>

```python
from IPython.display import HTML, display
import matplotlib.pyplot as plt

lqr_animation = make_lqr_animation(lqr_cases, cartpole_parameters)
display(HTML(lqr_animation.to_jshtml()))
plt.close(lqr_animation._fig)
```

[Figure 2:](#anim-cartpole-lqr "Link to this figure")Nonlinear validation of the local LQR controller. The left panel shows the uncontrolled fall from 5 degrees, the center panel shows recovery from the same state, and the right panel shows the 45 degree rollout ending at the rail limit. Python generates each frame from the recorded trajectories.

<a id="anim-cartpole-lqr-outputs"></a>

Loading...

Balancing a pen on a finger motivates the action channel because the finger stabilizes the object by moving its base. The cart-pole model replaces the contact by a planar frictionless hinge. A real pen can slip, detach, flex, and rotate out of the plane, while sensing and hand motion introduce delays. The calculation establishes local stabilization for the stated rigid-body model; the classroom demonstration shares its instability and feedback mechanism, not all of its equations.

Inspect the linearization and LQR design

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
```

[Download the shared nonlinear cart-pole and LQR source](https://pierrelucbacon.com/rlbook/build/cartpole_control-d3957d6280d7c1453fe01480d080b46a.py).

<a id="summary-and-outlook"></a>

## Summary and Outlook

Backward recursion replaces one trajectory optimization with a sequence of state-indexed subproblems. Interpolation extends the recursion beyond a finite state grid, and the linear-quadratic case reduces the value function to a Riccati recursion and the policy to linear state feedback.

These recursions still assign one successor to each state and action. How do the value and policy change when a decision must account for a distribution of possible successors? [Stochastic dynamic programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/16-stochastic-dp.md) replaces the deterministic continuation value by a conditional expectation.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Conroy2013"></a>
2.  Conroy, M. J., & Peterson, J. T. (2013). _Decision Making in Natural Resource Management: A Structured, Adaptive Approach: A Structured, Adaptive Approach_. Wiley. [10.1002/9781118506196](https://doi.org/10.1002/9781118506196)

[

Feedback Control

Parametric and Approximate Controllers


](14-parametric-controllers.md)[

Dynamic Programming

Stochastic Dynamic Programming and Markov Decision Processes


](16-stochastic-dp.md)


---

# CHAPITRE 16 — Stochastic Dynamic Programming and Markov Decision Processes

Section du livre : Dynamic Programming

Page originale : https://pierrelucbacon.com/rlbook/stochastic-dp

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/16-stochastic-dp.md

> **Cours de Pierre-Luc Bacon — 16.** [Page publiée](https://pierrelucbacon.com/rlbook/stochastic-dp) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/16-stochastic-dp.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Stochastic Dynamic Programming and Markov Decision Processes

<a id="skip-to-article"></a>

Finite-horizon dynamic programming chooses an action from each state and time, then follows one deterministic successor. How should the recursion change when an action induces a distribution of successors and the decision rule itself may be randomized or depend on history? Stochastic dynamic programming answers by averaging continuation values under a transition kernel.

<a id="decision-rules-and-policies"></a>

## Decision Rules and Policies

Which combinations of state, history, and randomization may a decision rule use when selecting an action?

Before diving into stochastic systems, we need to establish terminology for the different types of strategies a decision maker might employ. In the deterministic setting, we implicitly used feedback controllers of the form $u(\mathbf{x}, t)$. In the stochastic setting, we must be more precise about what information policies can use and how they select actions.

A **decision rule** is a prescription for action selection in each state at a specified decision epoch. These rules can vary in their complexity based on two main criteria:

1.  **Dependence on history**: Markovian or History-dependent
    
2.  **Action selection method**: Deterministic or Randomized
    

**Markovian decision rules** depend only on the current state, while **history-dependent rules** consider the entire sequence of past states and actions. Formally, a history $h_t$ at time $t$ is:

<a id="YEZc0W0X5M"></a>

$$
h_t = (s_1, a_1, \ldots, s_{t-1}, a_{t-1}, s_t)
$$

[(1)](#YEZc0W0X5M "Link to this Equation")

The set of all possible histories at time $t$, denoted $H_t$, grows exponentially with $t$:

-   $H_1 = \mathcal{S}$ (just the initial state)
    
-   $H_2 = \mathcal{S} \times \mathcal{A} \times \mathcal{S}$
    
-   $H_t = \mathcal{S} \times (\mathcal{A} \times \mathcal{S})^{t-1}$
    

**Deterministic rules** select an action with certainty, while **randomized rules** specify a probability distribution over the action space.

These classifications lead to four types of decision rules:

1.  **Markovian Deterministic (MD)**: $\pi_t: \mathcal{S} \rightarrow \mathcal{A}_s$
    
2.  **Markovian Randomized (MR)**: $\pi_t: \mathcal{S} \rightarrow \mathcal{P}(\mathcal{A}_s)$
    
3.  **History-dependent Deterministic (HD)**: $\pi_t: H_t \rightarrow \mathcal{A}_s$
    
4.  **History-dependent Randomized (HR)**: $\pi_t: H_t \rightarrow \mathcal{P}(\mathcal{A}_s)$
    

where $\mathcal{P}(\mathcal{A}_s)$ denotes the set of probability distributions over $\mathcal{A}_s$.

A **policy** $\boldsymbol{\pi}$ is a sequence of decision rules, one for each decision epoch:

<a id="A7Y4r6bCZt"></a>

$$
\boldsymbol{\pi} = (\pi_1, \pi_2, ..., \pi_{N-1})
$$

[(2)](#A7Y4r6bCZt "Link to this Equation")

The set of all policies of class $K$ (where $K \in \{HR, HD, MR, MD\}$) is denoted as $\Pi^K$. These policy classes form a hierarchy:

<a id="KhLTks1FPQ"></a>

$$
\Pi^{MD} \subset \Pi^{MR} \subset \Pi^{HR}, \quad \Pi^{MD} \subset \Pi^{HD} \subset \Pi^{HR}
$$

[(3)](#KhLTks1FPQ "Link to this Equation")

The largest set $\Pi^{HR}$ contains all possible policies. We ask: under what conditions can we restrict attention to the much simpler set $\Pi^{MD}$ without loss of optimality?

Notation: rules vs. policies

-   **Decision rule (kernel).** A map from information to action distributions:
    
    -   Markov, deterministic: $\pi_t:\mathcal{S}\to\mathcal{A}_s$
        
    -   Markov, randomized: $\pi_t(\cdot\mid s)\in\Delta(\mathcal{A}_s)$
        
    -   History-dependent: $\pi_t(\cdot\mid h_t)\in\Delta(\mathcal{A}_{s_t})$
        
-   **Policy (sequence).** $\boldsymbol{\pi}=(\pi_1,\pi_2,\ldots)$.
    
-   **Stationary policy.** $\boldsymbol{\pi}=\mathrm{const}(\pi)$ with $\pi_t\equiv\pi \ \forall t$.  
    By convention, we identify $\pi$ with its stationary policy $\mathrm{const}(\pi)$ when no confusion arises.
    

<a id="stochastic-system-dynamics"></a>

## Stochastic System Dynamics

How does a transition kernel replace the single deterministic successor in the finite-horizon model?

In the stochastic setting, our system evolution takes the form:

<a id="LLtOti1ZGv"></a>

$$
\mathbf{x}_{t+1} = \mathbf{f}_t(\mathbf{x}_t, \mathbf{u}_t, \mathbf{w}_t)
$$

[(4)](#LLtOti1ZGv "Link to this Equation")

Here, $\mathbf{w}_t$ represents a random disturbance or noise term at time $t$ due to the inherent uncertainty in the system’s behavior. The stage cost function may also incorporate stochastic influences:

<a id="uI1ImFck24"></a>

$$
c_t(\mathbf{x}_t, \mathbf{u}_t, \mathbf{w}_t)
$$

[(5)](#uI1ImFck24 "Link to this Equation")

In this context, our objective shifts from minimizing a deterministic cost to minimizing the expected total cost:

<a id="mHNSXP4iMd"></a>

$$
\mathbb{E}\left[c_\mathrm{T}(\mathbf{x}_T) + \sum_{t=1}^{T-1} c_t(\mathbf{x}_t, \mathbf{u}_t, \mathbf{w}_t)\right]
$$

[(6)](#mHNSXP4iMd "Link to this Equation")

where the expectation is taken over the distributions of the random variables $\mathbf{w}_t$. The principle of optimality still holds in the stochastic case, but Bellman’s optimality equation now involves an expectation:

<a id="jzmfdEcd9B"></a>

$$
J_k^\star(\mathbf{x}_k) = \min_{\mathbf{u}_k} \mathbb{E}_{\mathbf{w}_k}\left[c_k(\mathbf{x}_k, \mathbf{u}_k, \mathbf{w}_k) + J_{k+1}^\star(\mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k, \mathbf{w}_k))\right]
$$

[(7)](#jzmfdEcd9B "Link to this Equation")

In practice, this expectation is often computed by discretizing the distribution of $\mathbf{w}_k$ when the set of possible disturbances is very large or even continuous. Let’s say we approximate the distribution with $K$ discrete values $\mathbf{w}_k^i$, each occurring with probability $p_k^i$. Then our Bellman equation becomes:

<a id="BhIVDRBRYh"></a>

$$
J_k^\star(\mathbf{x}_k) = \min_{\mathbf{u}_k} \sum_{i=1}^K p_k^i \left(c_k(\mathbf{x}_k, \mathbf{u}_k, \mathbf{w}_k^i) + J_{k+1}^\star(\mathbf{f}_k(\mathbf{x}_k, \mathbf{u}_k, \mathbf{w}_k^i))\right)
$$

[(8)](#BhIVDRBRYh "Link to this Equation")

<a id="optimality-equations-in-the-stochastic-setting"></a>

## Optimality Equations in the Stochastic Setting

How is the deterministic continuation value replaced by an expectation over all possible next states?

When dealing with stochastic systems, a central question arises: what information should our control policy use? In the most general case, a policy might use the entire history of observations and actions. However, as we’ll see, the Markovian structure of our problems allows for dramatic simplifications.

Let $h_t = (s_1, a_1, s_2, a_2, \ldots, s_{t-1}, a_{t-1}, s_t)$ denote the complete history up to time $t$. In the stochastic setting, the history-based optimality equations become:

<a id="honYdLbMPN"></a>

$$
u_t(h_t) = \sup_{a\in A_{s_t}}\left\{ r_t(s_t,a) + \sum_{j\in S} p_t(j\mid s_t,a)\, u_{t+1}(h_t,a,j) \right\},\quad u_N(h_N)=r_N(s_N)
$$

[(9)](#honYdLbMPN "Link to this Equation")

where we now explicitly use the transition probabilities $p_t(j|s_t,a)$ rather than a deterministic dynamics function.

<a id="stoch-principle-opt"></a>

[Theorem 1](#stoch-principle-opt "Link to this Theorem") (Principle of optimality for stochastic systems)

Let $u_t^*$ be the optimal expected return from epoch $t$ onward. Then:

**a.** $u_t^*$ satisfies the optimality equations:

<a id="VfNCmtCW3F"></a>

$$
u_t^*(h_t) = \sup_{a \in A_{s_t}} \left\{ r_t(s_t, a) + \sum_{j \in S} p_t(j|s_t, a) u_{t+1}^*(h_t, a, j) \right\}
$$

[(10)](#VfNCmtCW3F "Link to this Equation")

with boundary condition $u_N^*(h_N) = r_N(s_N)$.

**b.** Any policy $\pi^*$ that selects actions attaining the supremum (or maximum) in the above equation at each history is optimal.

**Intuition:** This formalizes Bellman’s principle of optimality: “An optimal policy has the property that whatever the initial state and initial decision are, the remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision.” The recursive structure means that optimal local decisions (choosing the best action at each step) lead to global optimality, even with uncertainty captured by the transition probabilities.

A simplification occurs when we examine these history-based equations more closely. The Markov property of our system dynamics and rewards means that the optimal return actually depends on the history only through the current state:

<a id="stoch-state-suff"></a>

[Proposition 1](#stoch-state-suff "Link to this Proposition") (State sufficiency for stochastic MDPs)

In finite-horizon stochastic MDPs with Markovian dynamics and rewards, the optimal return $u_t^*(h_t)$ depends on the history only through the current state $s_t$. Thus we can write $u_t^*(h_t) = v_t^*(s_t)$ for some function $v_t^*$ that depends only on state and time.

Proof 1

Following Puterman (1994) Theorem 4.4.2. We proceed by backward induction.

**Base case:** At the terminal time $N$, we have $u_N^*(h_N) = r_N(s_N)$ by the boundary condition. Since the terminal reward depends only on the final state $s_N$ and not on how we arrived there, $u_N^*(h_N) = u_N^*(s_N)$.

**Inductive step:** Assume $u_{t+1}^*(h_{t+1})$ depends on $h_{t+1}$ only through $s_{t+1}$ for all $t+1, \ldots, N$. Then from the optimality equation:

<a id="a59chEoEYG"></a>

$$
u_t^*(h_t) = \sup_{a \in A_{s_t}} \left\{ r_t(s_t, a) + \sum_{j \in S} p_t(j|s_t, a) u_{t+1}^*(h_t, a, j) \right\}
$$

[(11)](#a59chEoEYG "Link to this Equation")

By the induction hypothesis, $u_{t+1}^*(h_t, a, j)$ depends only on the next state $j$, so:

<a id="k6SZd5q7Lc"></a>

$$
u_t^*(h_t) = \sup_{a \in A_{s_t}} \left\{ r_t(s_t, a) + \sum_{j \in S} p_t(j|s_t, a) u_{t+1}^*(j) \right\}
$$

[(12)](#k6SZd5q7Lc "Link to this Equation")

Since the expression in brackets depends on $h_t$ only through the current state $s_t$ (the rewards and transition probabilities are Markovian), we conclude that $u_t^*(h_t) = u_t^*(s_t)$.

**Intuition:** The Markov property means that the current state contains all information needed to predict future evolution. The past provides no additional value for decision-making. This result allows us to work with value functions $v_t^*(s)$ indexed only by state and time, dramatically simplifying both theory and computation.

This state-sufficiency result, combined with the fact that randomization never helps when maximizing expected returns, leads to a dramatic simplification of the policy space:

<a id="stoch-policy-reduction"></a>

[Theorem 2](#stoch-policy-reduction "Link to this Theorem") (Policy reduction for stochastic MDPs)

For finite-horizon stochastic MDPs with finite state and action sets:

<a id="aj145ZSiln"></a>

$$
\sup_{\pi \in \Pi^{\mathrm{HR}}} v_\pi(s,t) = \max_{\pi \in \Pi^{\mathrm{MD}}} v_\pi(s,t)
$$

[(13)](#aj145ZSiln "Link to this Equation")

That is, there exists an optimal policy that is both deterministic and Markovian.

Proof 2

Sketch following Puterman (1994) Lemma 4.3.1 and Theorem 4.4.2. First, Lemma 4.3.1 shows that for any function $w$ and any distribution $q$ over actions, $\sup_a w(a) \ge \sum_a q(a) w(a)$. Thus randomization cannot improve the expected value over choosing a single maximizing action. Second, by state sufficiency (Proposition [Proposition 1](#stoch-state-suff) and Puterman (1994) Thm. 4.4.2(a)), the optimal return depends on the history only through $(s_t,t)$. Therefore, selecting at each $(s_t,t)$ an action that attains the maximum yields a deterministic Markov decision rule which is optimal whenever the maximum is attained. If only a supremum exists, $\varepsilon$\-optimal selectors exist by choosing actions within $\varepsilon$ of the supremum (see Puterman (1994) Thm. 4.3.4).

**Intuition:** Even in stochastic systems, randomization in the policy doesn’t help when maximizing expected returns: you should always choose the action with the highest expected value. Combined with state sufficiency, this means simple state-to-action mappings are optimal.

These results justify focusing on deterministic Markov policies and lead to the backward recursion algorithm for stochastic systems:

<a id="backward-recursion-stochastic"></a>

[Algorithm 1](#backward-recursion-stochastic "Link to this Algorithm") (Backward Recursion for Stochastic Dynamic Programming)

**Input:** Terminal cost function $c_\mathrm{T}(\cdot)$, stage cost functions $c_t(\cdot, \cdot, \cdot)$, system dynamics $\mathbf{f}_t(\cdot, \cdot, \cdot)$, time horizon $\mathrm{T}$, disturbance distributions

**Output:** Optimal value functions $J_t^\star(\cdot)$ and optimal control policies $\pi_t^\star(\cdot)$ for $t = 1, \ldots, T$

1.  Initialize $J_T^\star(\mathbf{x}) = c_\mathrm{T}(\mathbf{x})$ for all $\mathbf{x}$ in the state space
    
2.  For $t = T-1, T-2, \ldots, 1$:
    
    1.  For each state $\mathbf{x}$ in the state space:
        
        1.  Compute $J_t^\star(\mathbf{x}) = \min_{\mathbf{u}} \mathbb{E}_{\mathbf{w}_t}\left[c_t(\mathbf{x}, \mathbf{u}, \mathbf{w}_t) + J_{t+1}^\star(\mathbf{f}_t(\mathbf{x}, \mathbf{u}, \mathbf{w}_t))\right]$
            
        2.  Compute $\pi_t^\star(\mathbf{x}) = \arg\min_{\mathbf{u}} \mathbb{E}_{\mathbf{w}_t}\left[c_t(\mathbf{x}, \mathbf{u}, \mathbf{w}_t) + J_{t+1}^\star(\mathbf{f}_t(\mathbf{x}, \mathbf{u}, \mathbf{w}_t))\right]$
            
    2.  End For
        
3.  End For
    
4.  Return $J_t^\star(\cdot)$, $\pi_t^\star(\cdot)$ for $t = 1, \ldots, T$
    

While SDP provides us with a framework to for handling uncertainty, it makes the curse of dimensionality even more difficult to handle in practice. Both the state space and the disturbance space must be discretized. This can lead to a combinatorial explosion in the number of scenarios to be evaluated at each stage.

However, just as we tackled the challenges of continuous state spaces with discretization and interpolation, we can devise efficient methods to handle the additional complexity of evaluating expectations. This problem essentially becomes one of numerical integration. When the set of disturbances is continuous (as is often the case with continuous state spaces), we enter a domain where numerical quadrature methods could be applied. But these methods tend to scale poorly as the number of dimensions grows. This is where more efficient techniques, often rooted in Monte Carlo methods, come into play. Two ingredients tackle the curse of dimensionality:

1.  Function approximation (through discretization, interpolation, neural networks, etc.)
    
2.  Monte Carlo integration (simulation)
    

These two elements essentially distill the key ingredients of machine learning, which is the direction we’ll be exploring in this course.

<a id="example-stochastic-optimal-harvest-in-resource-management"></a>

## Example: Stochastic Optimal Harvest in Resource Management

How does uncertain growth change the harvest policy and the distribution of realized returns?

Building upon our previous deterministic model, we now introduce stochasticity to more accurately reflect the uncertainties inherent in real-world resource management scenarios [Conroy & Peterson, 2013](https://doi.org/10.1002/9781118506196). As before, we consider a population of a particular species, whose abundance we denote by $x_t$, where $t$ represents discrete time steps. Our objective remains to maximize the cumulative harvest over a finite time horizon, while also considering the long-term sustainability of the population. However, we now account for two sources of stochasticity: partial controllability of harvest and environmental variability affecting growth rates. The optimization problem can be formulated as:

<a id="NcifeUXqKt"></a>

$$
\text{maximize} \quad \mathbb{E}\left[\sum_{t=t_0}^{t_f} F(x_t \cdot h_t)\right]
$$

[(14)](#NcifeUXqKt "Link to this Equation")

Here, $F(\cdot)$ represents the immediate reward function associated with harvesting, and $h_t$ is the realized harvest rate at time $t$. The expectation $\mathbb{E}[\cdot]$ over both harvest and growth rates, which we view as random variables. In our stochastic model, the abundance $x$ still ranges from 1 to 100 individuals. The decision variable is now the desired harvest rate $d_t$, which can take values from the set $D = {0, 0.1, 0.2, 0.3, 0.4, 0.5}$. However, the realized harvest rate $h_t$ is stochastic and follows a discrete distribution:

<a id="YfEnZMLYvl"></a>

$$
h_t = \begin{cases}
0.75d_t & \text{with probability } 0.25 \\
d_t & \text{with probability } 0.5 \\
1.25d_t & \text{with probability } 0.25
\end{cases}
$$

[(15)](#YfEnZMLYvl "Link to this Equation")

By expressing the harvest rate as a random variable, we mean to capture the fact that harvesting is a not completely under our control: we might obtain more or less what we had intended to. Furthermore, we generalize the population dynamics to the stochastic case via:

$$

x\_{t+1} = x\_t + r\_tx\_t(1 - x\_t/K) - h\_tx\_t $$

where $K = 125$ is the carrying capacity. The growth rate $r_t$ is now stochastic and follows a discrete distribution:

<a id="N71QNYFT9u"></a>

$$
r_t = \begin{cases}
0.85r_{\text{max}} & \text{with probability } 0.25 \\
1.05r_{\text{max}} & \text{with probability } 0.5 \\
1.15r_{\text{max}} & \text{with probability } 0.25
\end{cases}
$$

[(16)](#N71QNYFT9u "Link to this Equation")

where $r_{\text{max}} = 0.3$ is the maximum growth rate. Applying the principle of optimality, we can express the optimal value function $J^\star(x_t, t)$ recursively:

<a id="MDRsEqEQ6V"></a>

$$
J^\star(x_t, t) = \max_{d(t) \in D} \mathbb{E}\left[F(x_t \cdot h_t) + J^\star(x_{t+1}, t+1)\right]
$$

[(17)](#MDRsEqEQ6V "Link to this Equation")

where the expectation is taken over the harvest and growth rate random variables. The boundary condition remains $J^*(x_{t_f}) = 0$. We can now adapt our previous code to account for the stochasticity in our model. One important difference is that simulating a solution in this context requires multiple realizations of our process. This is an important consideration when evaluating reinforcement learning methods in practice, as success cannot be claimed based on a single successful trajectory.

<a id="vM0aOmlCld"></a>

Source

```python
#  label: dp-harvest-stochastic
#  caption: Stochastic resource management simulation: the cell reports the optimal policy sample, average trajectory, and visualizes ensemble trajectories plus the distribution of total harvest.

import numpy as np
from scipy.interpolate import interp1d

rng = np.random.default_rng(2026)

# Parameters
r_max = 0.3
K = 125
T = 30  # Number of time steps
N_max = 100  # Maximum population size to consider
h_max = 0.5  # Maximum harvest rate
h_step = 0.1  # Step size for harvest rate

# Create state and decision spaces
N_space = np.linspace(1, N_max, 100)  # Using more granular state space
h_space = np.arange(0, h_max + h_step, h_step)

# Stochastic parameters
h_outcomes = np.array([0.75, 1.0, 1.25])
h_probs = np.array([0.25, 0.5, 0.25])
r_outcomes = np.array([0.85, 1.05, 1.15]) * r_max
r_probs = np.array([0.25, 0.5, 0.25])

# Initialize value function and policy
V = np.zeros((T + 1, len(N_space)))
policy = np.zeros((T, len(N_space)))

# State return function (F)
def state_return(N, h):
    return N * h

# State dynamics function (stochastic)
def state_dynamics(N, h, r):
    return N + r * N * (1 - N / K) - h * N

# Function to create interpolation function for a given time step
def create_interpolator(V_t, N_space):
    return interp1d(N_space, V_t, kind='linear', bounds_error=False, fill_value=(V_t[0], V_t[-1]))

# Backward iteration with stochastic dynamics
for t in range(T - 1, -1, -1):
    interpolator = create_interpolator(V[t+1], N_space)
    
    for i, N in enumerate(N_space):
        max_value = float('-inf')
        best_h = 0

        for h in h_space:
            if h > 1:  # Ensure harvest rate doesn't exceed 100%
                continue

            expected_value = 0
            for h_factor, h_prob in zip(h_outcomes, h_probs):
                for r_factor, r_prob in zip(r_outcomes, r_probs):
                    realized_h = h * h_factor
                    realized_r = r_factor

                    next_N = state_dynamics(N, realized_h, realized_r)
                    if next_N < 1:  # Ensure population doesn't go extinct
                        continue

                    # Use interpolation to get the value for next_N
                    value = state_return(N, realized_h) + interpolator(next_N)
                    expected_value += value * h_prob * r_prob

            if expected_value > max_value:
                max_value = expected_value
                best_h = h

        V[t, i] = max_value
        policy[t, i] = best_h

# Function to simulate the optimal policy using interpolation (stochastic version)
def simulate_optimal_policy(initial_N, T, num_simulations=100):
    all_trajectories = []
    all_harvests = []

    for _ in range(num_simulations):
        trajectory = [initial_N]
        harvests = []

        for t in range(T):
            N = trajectory[-1]
            
            # Create interpolator for the policy at time t
            policy_interpolator = interp1d(N_space, policy[t], kind='linear', bounds_error=False, fill_value=(policy[t][0], policy[t][-1]))
            
            intended_h = policy_interpolator(N)
            
            # Apply stochasticity
            h_factor = rng.choice(h_outcomes, p=h_probs)
            r_factor = rng.choice(r_outcomes, p=r_probs)
            
            realized_h = intended_h * h_factor
            harvests.append(N * realized_h)

            next_N = state_dynamics(N, realized_h, r_factor)
            trajectory.append(next_N)

        all_trajectories.append(trajectory)
        all_harvests.append(harvests)

    return all_trajectories, all_harvests

# Example usage
initial_N = 50
trajectories, harvests = simulate_optimal_policy(initial_N, T)

# Calculate average trajectory and total harvest
avg_trajectory = np.mean(trajectories, axis=0)
avg_total_harvest = np.mean([sum(h) for h in harvests])

print("Optimal policy (first few rows):")
print(policy[:5])
print("\nAverage population trajectory:", avg_trajectory)
print("Average total harvest:", avg_total_harvest)

# Plot results
%config InlineBackend.figure_format = 'retina'
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

plt.figure(figsize=(12, 6))
plt.subplot(121)
for traj in trajectories[:20]:  # Plot first 20 trajectories
    plt.plot(range(T+1), traj, alpha=0.3)
plt.plot(range(T+1), avg_trajectory, 'r-', linewidth=2)
plt.title('Population Trajectories')
plt.xlabel('Time')
plt.ylabel('Population')

plt.subplot(122)
plt.hist([sum(h) for h in harvests], bins=20)
plt.title('Distribution of Total Harvest')
plt.xlabel('Total Harvest')
plt.ylabel('Frequency')

plt.tight_layout()
```

```
Optimal policy (first few rows):
[[0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]
 [0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.  0.
  0.  0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3
  0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.4 0.4 0.4 0.4 0.4 0.4
  0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4]]

Average population trajectory: [50.         59.315      63.05075554 62.44820296 62.42420013 62.08230114
 62.48912074 62.38525648 62.30572025 62.92791959 62.63807851 61.8843089
 62.49390308 61.90724971 62.54202248 62.82646214 62.72525486 61.84964529
 62.48319799 62.59056227 62.81887677 62.05344894 62.43721639 62.75546564
 62.76975159 62.61454886 61.56668355 42.12757241 29.72876407 21.52260235
 16.43615057]
Average total harvest: 313.49385676447304
```

![<Figure size 1200x600 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/662f0188f0-cd4c331bc9637c2c4d4435f57b8f9aed.png)

<a id="markov-decision-process-formulation"></a>

## Markov Decision Process Formulation

Which state, action, transition, reward, and horizon objects define the common finite MDP representation?

Rather than expressing the stochasticity in our system through a disturbance term as a parameter to a deterministic difference equation, we often work with an alternative representation (more common in operations research) which uses the Markov Decision Process formulation. The idea is that when we model our system in this way with the disturbance term being drawn indepently of the previous stages, the induced trajectory are those of a Markov chain. Hence, we can re-cast our control problem in that language, leading to the so-called Markov Decision Process framework in which we express the system dynamics in terms of transition probabilities rather than explicit state equations. In this framework, we express the probability that the system is in a given state using the transition probability function:

<a id="T3RpQZhdpk"></a>

$$
p_t(\mathbf{x}_{t+1} | \mathbf{x}_t, \mathbf{u}_t)
$$

[(18)](#T3RpQZhdpk "Link to this Equation")

This function gives the probability of transitioning to state $\mathbf{x}_{t+1}$ at time $t+1$, given that the system is in state $\mathbf{x}_t$ and action $\mathbf{u}_t$ is taken at time $t$. Therefore, $p_t$ specifies a conditional probability distribution over the next states: namely, the sum (for discrete state spaces) or integral over the next state should be 1.

Given the control theory formulation of our problem via a deterministic dynamics function and a noise term, we can derive the corresponding transition probability function through the following relationship:

<a id="W5efZig4Lg"></a>

$$
\begin{aligned}
p_t(\mathbf{x}_{t+1} | \mathbf{x}_t, \mathbf{u}_t) &= \mathbb{P}(\mathbf{W}_t \in \left\{\mathbf{w} \in \mathbf{W}: \mathbf{x}_{t+1} = f_t(\mathbf{x}_t, \mathbf{u}_t, \mathbf{w})\right\}) \\
&= \sum_{\left\{\mathbf{w} \in \mathbf{W}: \mathbf{x}_{t+1} = f_t(\mathbf{x}_t, \mathbf{u}_t, \mathbf{w})\right\}} q_t(\mathbf{w})
\end{aligned}
$$

[(19)](#W5efZig4Lg "Link to this Equation")

Here, $q_t(\mathbf{w})$ represents the probability density or mass function of the disturbance $\mathbf{W}_t$ (assuming discrete state spaces). When dealing with continuous spaces, the above expression simply contains an integral rather than a summation.

For a system with deterministic dynamics and no disturbance, the transition probabilities become much simpler and be expressed using the indicator function. Given a deterministic system with dynamics:

<a id="K604LhKTTN"></a>

$$
\mathbf{x}_{t+1} = f_t(\mathbf{x}_t, \mathbf{u}_t)
$$

[(20)](#K604LhKTTN "Link to this Equation")

The transition probability function can be expressed as:

<a id="Ob7QbHXGN5"></a>

$$
p_t(\mathbf{x}_{t+1} | \mathbf{x}_t, \mathbf{u}_t) = \begin{cases}
1 & \text{if } \mathbf{x}_{t+1} = f_t(\mathbf{x}_t, \mathbf{u}_t) \\
0 & \text{otherwise}
\end{cases}
$$

[(21)](#Ob7QbHXGN5 "Link to this Equation")

With this transition probability function, we can recast our Bellman optimality equation:

<a id="mbzgvb1PZF"></a>

$$
J_t^\star(\mathbf{x}_t) = \max_{\mathbf{u}_t \in \mathbf{U}} \left\{ c_t(\mathbf{x}_t, \mathbf{u}_t) + \sum_{\mathbf{x}_{t+1}} p_t(\mathbf{x}_{t+1} | \mathbf{x}_t, \mathbf{u}_t) J_{t+1}^\star(\mathbf{x}_{t+1}) \right\}
$$

[(22)](#mbzgvb1PZF "Link to this Equation")

Here, ${c}(\mathbf{x}_t, \mathbf{u}_t)$ represents the expected immediate reward (or negative cost) when in state $\mathbf{x}_t$ and taking action $\mathbf{u}_t$ at time $t$. The summation term computes the expected optimal value for the future states, weighted by their transition probabilities.

This formulation offers several advantages:

1.  It makes the Markovian nature of the problem explicit: the future state depends only on the current state and action, not on the history of states and actions.
    
2.  For discrete-state problems, the entire system dynamics can be specified by a set of transition matrices, one for each possible action.
    
3.  It allows us to bridge the gap with the wealth of methods in the field of probabilistic graphical models and statistical machine learning techniques for modelling and analysis.
    

<a id="notation-in-operations-reseach"></a>

## Notation in Operations Reseach

How do equivalent reward, cost, transition, and policy conventions map across reinforcement learning and operations research?

The presentation above was intended to bridge the gap between the control-theoretic perspective and the world of closed-loop control through the idea of determining the value function of a parametric optimal control problem. We then saw how the backward induction procedure was applicable to both the deterministic and stochastic cases by taking the expectation over the disturbance variable. We then said that we can alternatively work with a representation of our system where instead of writing our model as a deterministic dynamics function taking a disturbance as an input, we would rather work directly via its transition probability function, which gives rise to the Markov chain interpretation of our system in simulation.

Note that the notation used in control theory tends to differ from that found in operations research communities, in which the field of dynamic programming flourished. We summarize those (purely notational) differences in this section.

In operations research, the system state at each decision epoch is typically denoted by $s \in \mathcal{S}$, where $S$ is the set of possible system states. When the system is in state $s$, the decision maker may choose an action $a$ from the set of allowable actions $\mathcal{A}_s$. The union of all action sets is denoted as $\mathcal{A} = \bigcup_{s \in \mathcal{S}} \mathcal{A}_s$.

The dynamics of the system are described by a transition probability function $p_t(j | s, a)$, which represents the probability of transitioning to state $j \in \mathcal{S}$ at time $t+1$, given that the system is in state $s$ at time $t$ and action $a \in \mathcal{A}_s$ is chosen. This transition probability function satisfies:

<a id="w2ri8ccV6v"></a>

$$
\sum_{j \in \mathcal{S}} p_t(j | s, a) = 1
$$

[(23)](#w2ri8ccV6v "Link to this Equation")

It’s worth noting that in operations research, we typically work with reward maximization rather than cost minimization, which is more common in control theory. However, we can easily switch between these perspectives by simply negating the quantity. That is, maximizing a reward function is equivalent to minimizing its negative, which we would then call a cost function.

The reward function is denoted by $r_t(s, a)$, representing the reward received at time $t$ when the system is in state $s$ and action $a$ is taken. In some cases, the reward may also depend on the next state, in which case it is denoted as $r_t(s, a, j)$. The expected reward can then be computed as:

<a id="kKVbRIz9D9"></a>

$$
r_t(s, a) = \sum_{j \in \mathcal{S}} r_t(s, a, j) p_t(j | s, a)
$$

[(24)](#kKVbRIz9D9 "Link to this Equation")

Combined together, these elemetns specify a Markov decision process, which is fully described by the tuple:

<a id="pcFqmARBgg"></a>

$$
\{T, S, \mathcal{A}_s, p_t(\cdot | s, a), r_t(s, a)\}
$$

[(25)](#pcFqmARBgg "Link to this Equation")

where $\mathrm{T}$ represents the set of decision epochs (the horizon).

<a id="what-is-an-optimal-policy"></a>

## What is an Optimal Policy?

Against which competing policy class and initial states must a policy be compared before it can be called optimal?

Let’s go back to the starting point and define what it means for a policy to be optimal in a Markov Decision Problem. For this, we will be considering different possible search spaces (policy classes) and compare policies based on the ordering of their value from any possible start state. The value of a policy $\boldsymbol{\pi}$ (optimal or not) is defined as the expected total reward obtained by following that policy from a given starting state. Formally, for a finite-horizon MDP with $N$ decision epochs, we define the value function $v^{\boldsymbol{\pi}}(s, t)$ as:

<a id="bcVqtZCLQv"></a>

$$
v^{\boldsymbol{\pi}}(s, t) \triangleq \mathbb{E}\left[\sum_{k=t}^{N-1} r_t(S_k, A_k) + r_N(S_N) \mid S_t = s\right]
$$

[(26)](#bcVqtZCLQv "Link to this Equation")

where $S_t$ is the state at time $t$, $A_t$ is the action taken at time $t$, and $r_t$ is the reward function. For simplicity, we write $v^{\boldsymbol{\pi}}(s)$ to denote $v^{\boldsymbol{\pi}}(s, 1)$, the value of following policy $\boldsymbol{\pi}$ from state $s$ at the first stage over the entire horizon $N$.

In finite-horizon MDPs, our goal is to identify an optimal policy, denoted by $\boldsymbol{\pi}^*$, that maximizes total expected reward over the horizon $N$. Specifically:

<a id="x7CohX4LVM"></a>

$$
v^{\boldsymbol{\pi}^*}(s) \geq v^{\boldsymbol{\pi}}(s), \quad \forall s \in \mathcal{S}, \quad \forall \boldsymbol{\pi} \in \Pi^{\text{HR}}
$$

[(27)](#x7CohX4LVM "Link to this Equation")

We call $\boldsymbol{\pi}^*$ an **optimal policy** because it yields the highest possible value across all states and all policies within the policy class $\Pi^{\text{HR}}$. We denote by $v^*$ the maximum value achievable by any policy:

<a id="GQliD3TrPE"></a>

$$
v^*(s) = \max_{\boldsymbol{\pi} \in \Pi^{\text{HR}}} v^{\boldsymbol{\pi}}(s), \quad \forall s \in \mathcal{S}
$$

[(28)](#GQliD3TrPE "Link to this Equation")

In reinforcement learning literature, $v^*$ is typically referred to as the “optimal value function,” while in some operations research references, it might be called the “value of an MDP.” An optimal policy $\boldsymbol{\pi}^*$ is one for which its value function equals the optimal value function:

<a id="LT8XH72Y47"></a>

$$
v^{\boldsymbol{\pi}^*}(s) = v^*(s), \quad \forall s \in \mathcal{S}
$$

[(29)](#LT8XH72Y47 "Link to this Equation")

This notion of optimality applies to every state. Policies optimal in this sense are sometimes called “uniformly optimal policies.” A weaker notion of optimality, often encountered in reinforcement learning practice, is optimality with respect to an initial distribution of states. In this case, we seek a policy $\boldsymbol{\pi} \in \Pi^{\text{HR}}$ that maximizes:

<a id="Ut3PWARr6R"></a>

$$
\sum_{s \in \mathcal{S}} v^{\boldsymbol{\pi}}(s) P_1(S_1 = s)
$$

[(30)](#Ut3PWARr6R "Link to this Equation")

where $P_1(S_1 = s)$ is the probability of starting in state $s$.

The maximum value can be achieved by searching over the space of deterministic Markovian Policies. Consequently:

<a id="U8X6cQEzUs"></a>

$$
v^*(s) = \max_{\boldsymbol{\pi} \in \Pi^{\mathrm{HR}}} v^{\boldsymbol{\pi}}(s) = \max _{\boldsymbol{\pi} \in \Pi^{M D}} v^{\boldsymbol{\pi}}(s), \quad s \in S
$$

[(31)](#U8X6cQEzUs "Link to this Equation")

This equality significantly simplifies the computational complexity of our algorithms, as the search problem can now be decomposed into $N$ sub-problems in which we only have to search over the set of possible actions. This is the backward induction algorithm, which we present a second time, but departing this time from the control-theoretic notation and using the MDP formalism:

<a id="backward-induction"></a>

[Algorithm 2](#backward-induction "Link to this Algorithm") (Backward Induction)

**Input:** State space $S$, Action space $A$, Transition probabilities $p_t$, Reward function $r_t$, Time horizon $N$

**Output:** Optimal value functions $v^*$

1.  Initialize:
    
    -   Set $t = N$
        
    -   For all $s_N \in S$:
        
        <a id="FsMtzhKcqw"></a>
        
        $$
        v^*(s_N, N) = r_N(s_N)
        $$
        
        [(32)](#FsMtzhKcqw "Link to this Equation")
        
2.  For $t = N-1$ to 1:
    
    -   For each $s_t \in S$: a. Compute the optimal value function:
        
        <a id="EMIcuguNHQ"></a>
        
        $$
        v^*(s_t, t) = \max_{a \in A_{s_t}} \left\{r_t(s_t, a) + \sum_{j \in S} p_t(j | s_t, a) v^*(j, t+1)\right\}
        $$
        
        [(33)](#EMIcuguNHQ "Link to this Equation")
        
        b. Determine the set of optimal actions:
        
        <a id="T73WkeBheS"></a>
        
        $$
        A_{s_t,t}^* = \arg\max_{a \in A_{s_t}} \left\{r_t(s_t, a) + \sum_{j \in S} p_t(j | s_t, a) v^*(j, t+1)\right\}
        $$
        
        [(34)](#T73WkeBheS "Link to this Equation")
        
3.  Return the optimal value functions $u_t^*$ and optimal action sets $A_{s_t,t}^*$ for all $t$ and $s_t$
    

Note that the same procedure can also be used for finding the value of a policy with minor changes;

<a id="backward-policy-evaluation"></a>

[Algorithm 3](#backward-policy-evaluation "Link to this Algorithm") (Policy Evaluation)

**Input:**

-   State space $S$
    
-   Action space $A$
    
-   Transition probabilities $p_t$
    
-   Reward function $r_t$
    
-   Time horizon $N$
    
-   A markovian deterministic policy $\boldsymbol{\pi} = (\pi_1, \ldots, \pi_{N-1})$
    

**Output:** Value function $v^{\boldsymbol{\pi}}$ for policy $\boldsymbol{\pi}$

1.  Initialize:
    
    -   Set $t = N$
        
    -   For all $s_N \in S$:
        
        <a id="bbpmQw57hN"></a>
        
        $$
        v^{\boldsymbol{\pi}}(s_N, N) = r_N(s_N)
        $$
        
        [(35)](#bbpmQw57hN "Link to this Equation")
        
2.  For $t = N-1$ to 1:
    
    -   For each $s_t \in S$: a. Compute the value function for the given policy:
        
        <a id="oL0O7BRqtw"></a>
        
        $$
        v^{\boldsymbol{\pi}}(s_t, t) = r_t(s_t, \pi_t(s_t)) + \sum_{j \in S} p_t(j | s_t, \pi_t(s_t)) v^{\boldsymbol{\pi}}(j, t+1)
        $$
        
        [(36)](#oL0O7BRqtw "Link to this Equation")
        
3.  Return the value function $v^{\boldsymbol{\pi}}(s_t, t)$ for all $t$ and $s_t$
    

This code could also finally be adapted to support randomized policies using:

<a id="KOVaIgz7Xx"></a>

$$
v^{\boldsymbol{\pi}}(s_t, t) = \sum_{a_t \in \mathcal{A}_{s_t}} \pi_t(a_t \mid s_t) \left( r_t(s_t, a_t) + \sum_{j \in S} p_t(j | s_t, a_t) v^{\boldsymbol{\pi}}(j, t+1) \right)
$$

[(37)](#KOVaIgz7Xx "Link to this Equation")

<a id="summary-and-outlook"></a>

## Summary and Outlook

Stochastic dynamic programming separates decision rules by the information and randomization they use, then evaluates each action by averaging its continuation value over the transition kernel. Finite-horizon optimality remains a backward recursion because the terminal date supplies the boundary condition.

For continuous-time systems driven by Gaussian disturbances, the same short-time recursion gives the Hamilton--Jacobi--Bellman equation. [Path-integral stochastic control](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md) examines a class of such systems for which optimal feedback can be estimated from weighted trajectories.

What replaces that boundary when decisions continue indefinitely? [The infinite-horizon formulation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/18-infinite-horizon-mdps.md) uses discounting to obtain bounded value functions and fixed-point equations whose solutions no longer depend on a terminal time.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Puterman1994"></a>
2.  Puterman, M. L. (1994). _Markov Decision Processes: Discrete Stochastic Dynamic Programming_. John Wiley & Sons.
<a id="cite-Conroy2013"></a>
4.  Conroy, M. J., & Peterson, J. T. (2013). _Decision Making in Natural Resource Management: A Structured, Adaptive Approach: A Structured, Adaptive Approach_. Wiley. [10.1002/9781118506196](https://doi.org/10.1002/9781118506196)

[

Dynamic Programming

Finite-Horizon Dynamic Programming


](15-finite-horizon-dp.md)[

Dynamic Programming

Path-Integral Stochastic Control


](17-path-integral-stochastic-control.md)

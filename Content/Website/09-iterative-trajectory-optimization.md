> **Cours de Pierre-Luc Bacon — 09.** [Page publiée](https://pierrelucbacon.com/rlbook/iterative-trajectory-optimization) · [Source numérotée](../09-iterative-trajectory-optimization.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# iLQR and Differential Dynamic Programming

<a id="skip-to-article"></a>

A boat approaching a quay must arrive in the right place, face along the berth, and lose its remaining momentum. A sequence of thrust commands determines all three outcomes. The [shooting formulation](08-numerical-trajectory-optimization.md) turns this task into an optimization over those commands: simulate a candidate sequence, measure its cost, and improve it. How can an optimizer use the time structure of the simulation when computing that improvement?

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

The chapter uses the [finite-horizon optimal-control formulation](06-discrete-time-optimal-control.md), [single shooting](08-numerical-trajectory-optimization.md), and first and second derivatives. The [sequential-methods discussion](08-numerical-trajectory-optimization.md#sequential-methods) introduces general SQP subproblems, and the [initial-value-problem appendix](30-appendix-ivps.md) reviews numerical integration. Neither dynamic programming nor a previous derivation of LQR is required.

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

The replay reads recorded simulations, so exploring it does not rerun an optimizer. Recomputing a plan from newly observed states is the additional step introduced in [receding-horizon control](12-receding-horizon-control.md).

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
    
-   [Numerical diagnostics and source hashes](../Assets/Website/d50da40a2e-metrics-e6ba7fc06c666ace72cc6d7eaf029a7c.json)
    
-   [Thermoacoustic model and costs](https://pierrelucbacon.com/rlbook/build/thermoacoustic_pulld-9ee6468c40051f66b47c636fa671347d.py)
    
-   [Thermoacoustic geometry figure](https://pierrelucbacon.com/rlbook/build/thermoacoustic_geome-b7b8acda58731e6ecacfcaf10a958f7d.py)
    
-   [Thermoacoustic experiment builder](https://pierrelucbacon.com/rlbook/build/build_thermoacoustic-69410e1d4f08f6115d2bf55fa2becd83.py)
    
-   [Thermoacoustic diagnostics](../Assets/Website/334f4983c3-metrics-adbb88abcc4191fb585d76c00baceac2.json)
    
-   [Thermoacoustic replay data](../Assets/Website/3b5a4c4b9f-thermoacoustic-refri-c73132288faaff6741ae7e0674dbece4.json)
    

Run `uv run python scripts/build_boat_docking_artifacts.py` from the repository root to reproduce the solves, figures, results table, and browser data. Normal book builds read those artifacts. Tests independently check the derivatives, the composed DDP curvature, the scalar calculation, and agreement between backward elimination and a dense quadratic solve.

Run `uv run python scripts/build_thermoacoustic_pulldown_artifacts.py` to regenerate the refrigerator results table, figures, diagnostics, and the browser replay data.

<a id="summary-and-outlook"></a>

## Summary and Outlook

A feasible nonlinear rollout supplies the point around which dynamics and costs are approximated. Backward elimination of a local quadratic problem then supplies both a feedforward change and a state-dependent correction. iLQR repeats that calculation with linearized dynamics; DDP includes the second-order chain-rule terms from the transition. Nonlinear rollouts, regularization, and acceptance tests connect these local calculations to a decreasing sequence of actual trajectory costs. The refrigerator applies the same calculation to a bounded driver amplitude, with energy use and terminal temperature competing in the objective.

The docking and refrigerator experiments both use discrete transitions obtained by integrating ordinary differential equations. [Continuous-time transcription and collocation](10-continuous-time-collocation.md) develops other ways to represent continuous trajectories inside a finite optimization problem. Later, [finite-horizon dynamic programming](15-finite-horizon-dp.md) gives a broader interpretation of the quadratic tail: in the linear-quadratic case, the function produced by elimination is the optimal cost-to-go.

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

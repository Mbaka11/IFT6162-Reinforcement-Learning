# IFT-6.2.rl — Document 03 — Chapitres 17 à 24

Texte pédagogique de Pierre-Luc Bacon ; copie organisée pour l’auto-apprentissage. Ce document contient les pages complètes extraites du site, sans résumé de remplacement. Consulter les titres « CHAPITRE NN » pour retrouver leur numéro exact.

Sommaire général : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/ChatGPT/COURSE_INDEX.md



---

# CHAPITRE 17 — Path-Integral Stochastic Control

Section du livre : Dynamic Programming

Page originale : https://pierrelucbacon.com/rlbook/path-integral-stochastic-control

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md

> **Cours de Pierre-Luc Bacon — 17.** [Page publiée](https://pierrelucbacon.com/rlbook/path-integral-stochastic-control) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/17-path-integral-stochastic-control.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Path-Integral Stochastic Control

<a id="skip-to-article"></a>

Stochastic dynamic programming chooses a feedback action by minimizing immediate cost plus expected continuation cost. In continuous time, that recursion becomes a partial differential equation for the value function. Can forward simulations compute the optimal action without solving this equation over a grid of states?

For a class of systems with quadratic control effort and matching physical noise, a logarithmic transformation turns the value equation into a linear one. Its solution is an expectation over trajectories, which can be estimated by sampling. This gives conditions under which the weighted updates introduced in the [MPPI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md) compute an optimal current feedback action. A particle moving through two competing passages then shows how physical uncertainty can change the preferred route.

<a id="learning-goals"></a>

## Learning Goals

After working through the derivation and experiments, you should be able to:

-   Derive the stochastic Hamilton--Jacobi--Bellman equation from the short-time Bellman recursion.
    
-   State the noise and control-cost matching condition and use it to obtain a path-integral representation of the value function.
    
-   Estimate a current feedback action from weighted noise increments, including the correction for a controlled sampling process.
    
-   Distinguish an optimal feedback action from a Gaussian fit to a distribution over open-loop control sequences.
    
-   Compare stochastic and mean-dynamics controllers using paired disturbances, numerical reference solutions, and discretization checks.
    

<a id="prerequisites"></a>

## Prerequisites

This chapter uses the Bellman recursion and state-dependent policies from [Finite-Horizon Dynamic Programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) and [Stochastic Dynamic Programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/16-stochastic-dp.md). Gaussian increments are reviewed from [Stochastic Dynamics and Partial Observation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/04-stochastic-dynamics-observation.md). The comparison with MPPI uses the Gaussian mean fit and importance-sampling correction in [From Trajectory Weights to MPPI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi-distribution). The continuous-time value equation and its transformation are derived below.

<a id="sec-path-integral-control"></a>

## Stochastic Feedback Control

How does the Bellman recursion change when controls and disturbances act continuously in time? A scalar model with Gaussian increments gives the noise scaling needed to take the short-time limit. The resulting value function accounts for future actions responding to future observations.

<a id="a-model-with-physical-noise"></a>

### A model with physical noise

Consider a scalar position whose control $u_k$ sets its average velocity over an interval of length $h$. Suppose the motion also has an independent Gaussian displacement during each interval:

<a id="CMoH3YbDb2"></a>

$$
x_{k+1}=x_k+hu_k+\sqrt{\nu h}\,\xi_k,
\qquad \xi_k\sim\mathcal N(0,1),\qquad \nu>0.
$$

[(1)](#CMoH3YbDb2 "Link to this Equation")

Here $\nu$ is the variance of the physical displacement per unit time. Over $N$ intervals, the accumulated noise variance is $N\nu h$. Thus subdividing a fixed duration into smaller steps preserves the total variance. The factor $\sqrt h$ gives this property: using $h$ instead would make the total noise variance vanish as the steps become smaller.

Brownian motion is the continuous-time process that supplies these independent Gaussian increments. If $W_s$ denotes standard Brownian motion, then $W_{s+h}-W_s\sim\mathcal N(0,h)$. The continuous-time model is written

<a id="AETvyXl0ru"></a>

$$
dX_s=u_s\,ds+\sqrt\nu\,dW_s.
$$

[(2)](#AETvyXl0ru "Link to this Equation")

For a control held constant over one interval, integrating this equation gives the Gaussian transition above exactly. The notation $dW_s$ denotes an increment of the random process. It is not an ordinary velocity that can be evaluated and multiplied by a time step.

This physical randomness remains even when the control is fixed. A simulator draws independent increments to represent possible futures from the observed state; those draws do not predict the particular disturbance the system will experience. To use the rollout notation from [From Trajectory Weights to MPPI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi-distribution), write the same transition as $x_{k+1}=x_k+h(u_k+\epsilon_k)$, where $\epsilon_k=\sqrt{\nu/h}\,\xi_k$. Its variance is $\nu/h$ because it is multiplied by $h$ to produce the physical displacement. In this model, physical noise determines the perturbation covariance used in the path-integral derivation.

<a id="the-stochastic-control-problem"></a>

### The stochastic control problem

Let $\mathbf X_s\in\mathbb R^n$ follow the control-affine diffusion

<a id="hlzw0Ul8vj"></a>

$$
d\mathbf X_s=
[\mathbf a(s,\mathbf X_s)+D(s,\mathbf X_s)\mathbf u_s]\,ds
+B(s,\mathbf X_s)\,d\mathbf W_s.
$$

[(3)](#hlzw0Ul8vj "Link to this Equation")

The drift $\mathbf a$ describes uncontrolled motion, $D$ maps the $m$\-dimensional control into state motion, and $B$ maps Brownian noise into state fluctuations. For the scalar particle, these objects are $\mathbf a=0$, $D=1$, and $B=\sqrt\nu$. Controls may depend on the current state and time, but not on future noise.

For a fixed terminal time $t_f$, define

<a id="MeqBrjvBS6"></a>

$$
V(t,\mathbf x)=\inf_{\mathbf u}
\mathbb E_{t,\mathbf x}^{\mathbf u}\left[
c_f(\mathbf X_{t_f})+
\int_t^{t_f}\left(c(s,\mathbf X_s)
+\frac12\mathbf u_s^\top R\mathbf u_s\right)ds\right],
\qquad R\succ0.
$$

[(4)](#MeqBrjvBS6 "Link to this Equation")

The expectation is conditional on $\mathbf X_t=\mathbf x$ and follows the chosen feedback controller. The infimum ranges over controllers whose current action uses only information available at the current time. The value $V$ is the smallest expected remaining cost from that state.

Assume the coefficients are sufficiently regular for the diffusion to exist without explosion, the costs are bounded below with finite expectations, and the value function is once continuously differentiable in time and twice in state. These assumptions permit the following classical differential calculation. The control set is $\mathbb R^m$, and the noise and effort must satisfy

<a id="KJ3NQu524f"></a>

$$
B B^\top=\lambda D R^{-1}D^\top,\qquad \lambda>0.
$$

[(5)](#KJ3NQu524f "Link to this Equation")

The equality is pointwise in time and state. It matches both the directions and magnitudes of control and noise. For the scalar Brownian particle, $D=1$, $B=\sqrt\nu$, and $R=r$, so $\lambda=r\nu$. Independent choices of all three quantities would generally violate the equality. Unactuated state coordinates are allowed, but additional independent noise outside the control directions does not satisfy this model.

<a id="the-stochastic-hamilton-jacobi-bellman-equation"></a>

### The stochastic Hamilton--Jacobi--Bellman equation

The stochastic Bellman recursion compares immediate cost with expected optimal continuation cost. Over a short interval $\delta$, its continuous-time form is:

<a id="UBDmgxnByg"></a>

$$
V(t,\mathbf x)=\inf_{\mathbf u}
\mathbb E\left[
\left(c(t,\mathbf x)+\frac12\mathbf u^\top R\mathbf u\right)\delta
+V(t+\delta,\mathbf X_{t+\delta})\right]+o(\delta).
$$

[(6)](#UBDmgxnByg "Link to this Equation")

For this expansion the control is fixed over the short interval. The state increment has mean $(\mathbf a+D\mathbf u)\delta+o(\delta)$ and covariance $BB^\top\delta+o(\delta)$. Its second-order contribution therefore survives division by $\delta$. Expanding the last expectation gives

<a id="TrDarz63Lb"></a>

$$
\mathbb E[V(t+\delta,\mathbf X_{t+\delta})]
=V+\delta\left[
V_t+(\mathbf a+D\mathbf u)^\top\nabla V
+\frac12\operatorname{tr}(BB^\top\nabla^2V)\right]+o(\delta).
$$

[(7)](#TrDarz63Lb "Link to this Equation")

Subtracting $V$, dividing by $\delta$, and taking the limit gives the stochastic Hamilton--Jacobi--Bellman (HJB) equation:

<a id="rl86RVZq1m"></a>

$$
0=V_t+c+\mathbf a^\top\nabla V
+\frac12\operatorname{tr}(BB^\top\nabla^2V)
+\min_{\mathbf u}\left\{
\frac12\mathbf u^\top R\mathbf u+\mathbf u^\top D^\top\nabla V
\right\}.
$$

[(8)](#rl86RVZq1m "Link to this Equation")

For the particle, the diffusion contribution is $\nu V_{xx}/2$. Brownian displacements are of order $\sqrt\delta$, so their squared displacements contribute at order $\delta$, the same order as drift and running cost. Omitting the second derivative would replace this stochastic recursion by a deterministic one.

Only the terms inside braces depend on the current action. Since $R$ is positive definite, differentiating this strictly convex quadratic gives its unique minimizer:

<a id="UQ6sdqbcM7"></a>

$$
R\mathbf u+D^\top\nabla V=\mathbf0,
\qquad \mathbf u^\star=-R^{-1}D^\top\nabla V.
$$

[(9)](#UQ6sdqbcM7 "Link to this Equation")

Substitution removes the minimization and leaves

<a id="Wcc6tBHnAZ"></a>

$$
0=V_t+c+\mathbf a^\top\nabla V
-\frac12\nabla V^\top D R^{-1}D^\top\nabla V
+\frac12\operatorname{tr}(BB^\top\nabla^2V),
\qquad V(t_f,\mathbf x)=c_f(\mathbf x).
$$

[(10)](#Wcc6tBHnAZ "Link to this Equation")

The term quadratic in $\nabla V$ makes this equation nonlinear, even though the control minimization itself was explicit.

<a id="path-integral-representation"></a>

## Path-Integral Representation

Can the nonlinear value equation be transformed into an expectation that we can estimate with forward simulations? The noise-matching condition allows a logarithmic change of variables to cancel the term quadratic in the value gradient. The resulting linear equation has a probabilistic solution.

<a id="the-logarithmic-transformation"></a>

### The logarithmic transformation

The minimized HJB equation contains both a term quadratic in $\nabla V$ and a diffusion term involving $\nabla^2V$. A logarithm can connect these terms because its second derivative includes a squared first derivative. Define $\Psi=e^{-V/\lambda}$, or equivalently $V=-\lambda\log\Psi$. The positive function $\Psi$ is called the desirability: states with lower optimal cost have larger $\Psi$. Its derivatives are

<a id="AgpHQVaCS0"></a>

$$
V_t=-\lambda\frac{\Psi_t}{\Psi},\qquad
\nabla V=-\lambda\frac{\nabla\Psi}{\Psi},\qquad
\nabla^2V=-\lambda\frac{\nabla^2\Psi}{\Psi}
+\lambda\frac{\nabla\Psi\nabla\Psi^\top}{\Psi^2}.
$$

[(11)](#AgpHQVaCS0 "Link to this Equation")

After substitution into HJB, the quadratic terms combine as

<a id="dd083KTg8u"></a>

$$
\frac{\lambda}{2\Psi^2}
\nabla\Psi^\top
\left(BB^\top-\lambda DR^{-1}D^\top\right)\nabla\Psi.
$$

[(12)](#dd083KTg8u "Link to this Equation")

Noise matching sets this expression to zero. Multiplying the remaining equation by $-\Psi/\lambda$ produces the linear backward equation

<a id="m4z2NKDeF6"></a>

$$
\Psi_t+\mathbf a^\top\nabla\Psi
+\frac12\operatorname{tr}(BB^\top\nabla^2\Psi)
-\frac{c}{\lambda}\Psi=0,
\qquad
\Psi(t_f,\mathbf x)=e^{-c_f(\mathbf x)/\lambda}.
$$

[(13)](#m4z2NKDeF6 "Link to this Equation")

This cancellation is the restriction behind the path-integral solution [Kappen, 2005](https://doi.org/10.1088/1742-5468/2005/11/P11011). An arbitrary control penalty or arbitrary additional diffusion leaves a nonlinear equation after the transformation.

<a id="a-forward-expectation"></a>

### A forward expectation

The linear equation has a probabilistic solution. Let $P_0$ be the law of trajectories generated by the uncontrolled process $d\mathbf X_s=\mathbf a\,ds+B\,d\mathbf W_s$. Along one such trajectory, consider

<a id="BAeci9jVKU"></a>

$$
M_s=\exp\left[-\frac1\lambda\int_t^s c(r,\mathbf X_r)\,dr\right]
\Psi(s,\mathbf X_s).
$$

[(14)](#BAeci9jVKU "Link to this Equation")

The stochastic chain rule, or Itô’s formula, expands changes in $\Psi$ using the same first and second derivatives as the short-time calculation. The drift of $M_s$ is its exponential factor times $\Psi_t+\mathbf a^\top\nabla\Psi+
\tfrac12\operatorname{tr}(BB^\top\nabla^2\Psi)-c\Psi/\lambda$, which vanishes. Assuming the remaining stochastic integral is integrable and has mean zero, $\mathbb E[M_{t_f}\mid\mathbf X_t=\mathbf x]=M_t$. Using the terminal condition therefore yields

<a id="qtfE78pp4k"></a>

$$
\Psi(t,\mathbf x)=
\mathbb E_{P_0}\left[
e^{-S/\lambda}\mid\mathbf X_t=\mathbf x\right],
\qquad
S=c_f(\mathbf X_{t_f})+\int_t^{t_f}c(s,\mathbf X_s)\,ds.
$$

[(15)](#qtfE78pp4k "Link to this Equation")

This is the Feynman--Kac representation. The expectation integrates over whole sample paths of the uncontrolled diffusion, hence the name _path integral_. It replaces a backward partial differential equation with forward simulations starting at the particular state of interest. The quadratic control cost is absent from $S$ because its effect is already incorporated through noise matching and the logarithm.

<a id="quadratic-cost-and-optimal-feedback"></a>

### Quadratic cost and optimal feedback

For the scalar particle with terminal cost $c_f(x)=\tfrac\kappa2(x-a)^2$, with $\kappa>0$, and no running state cost, the uncontrolled endpoint is $X_{t_f}\sim\mathcal N(x,\nu\tau)$, where $\tau=t_f-t>0$. The expectation is an ordinary Gaussian integral:

<a id="yIQl9TvE6n"></a>

$$
\Psi(t,x)=\frac1{\sqrt{2\pi\nu\tau}}
\int_{\mathbb R}\exp\left[-\frac12\left(
\frac{(y-x)^2}{\nu\tau}+\frac\kappa\lambda(y-a)^2
\right)\right]dy.
$$

[(16)](#yIQl9TvE6n "Link to this Equation")

Both terms in the exponent are quadratic in the endpoint $y$. Completing the square with $\bar y=(\lambda x+\kappa\nu\tau a)/(\lambda+\kappa\nu\tau)$ gives

<a id="shuEwclXU7"></a>

$$
\frac{(y-x)^2}{\nu\tau}+\frac\kappa\lambda(y-a)^2
=\left(\frac1{\nu\tau}+\frac\kappa\lambda\right)(y-\bar y)^2
+\frac{\kappa(x-a)^2}{\lambda+\kappa\nu\tau}.
$$

[(17)](#shuEwclXU7 "Link to this Equation")

The constant term leaves the integral, and integrating the remaining Gaussian supplies its normalization factor. Using $\lambda=r\nu$ yields

<a id="nzhyoQLoh5"></a>

$$
\Psi(t,x)=
\left(1+\frac{\kappa\tau}{r}\right)^{-1/2}
\exp\left[-\frac{\kappa(x-a)^2}
{2\lambda(1+\kappa\tau/r)}\right].
$$

[(18)](#nzhyoQLoh5 "Link to this Equation")

Taking its logarithm and differentiating gives a value and feedback law that can be checked without Monte Carlo:

<a id="JmjmgHcnTj"></a>

$$
V(t,x)=\frac{\kappa r(x-a)^2}{2(r+\kappa\tau)}
+\frac\lambda2\log\left(1+\frac{\kappa\tau}{r}\right),
\qquad
u^\star(t,x)=\frac{\kappa(a-x)}{r+\kappa\tau}.
$$

[(19)](#JmjmgHcnTj "Link to this Equation")

Noise increases the optimal expected cost through the logarithmic term. For this quadratic example it does not change the feedback law. This is **certainty equivalence**. Nonquadratic state costs or barriers are needed to observe decisions that depend on the diffusion strength.

At $x=0$, $a=1$, $r=1$, and $\tau=1$, the current action is $\kappa/(1+\kappa)$, the mean found in the deterministic quadratic check in [From Trajectory Weights to MPPI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi-distribution). Here the controller also responds to later observations by reevaluating $u^\star(t,x)$ at the new state and time. Agreement of the initial actions does not make the execution rules identical. Exercise [Exercise 2](#ex-mppi-certainty-equivalence) verifies the value equation directly.

<a id="sampling-the-optimal-action"></a>

## Sampling the Optimal Action

How can sampled trajectories estimate the feedback action without numerically differentiating the value function? The first noise increment changes both the next state and the expected future cost weight. Their correlation supplies the derivative needed for the current action.

<a id="estimating-the-control-from-noise-increments"></a>

### Estimating the control from noise increments

The value representation still appears to require a state derivative to obtain the control. For the particle, however, a positive first noise increment changes the remaining expected weight by approximately $\Psi_x\sqrt\nu\,\Delta W$. Multiplying by $\Delta W$ and averaging keeps this term because $\mathbb E[(\Delta W)^2]=\delta$; terms constant in the increment average to zero. Thus the correlation of the first increment with the future weight estimates a state derivative.

To express this calculation for several control directions, take $D$ to have full column rank and write $B=DL$, with constant invertible $L$ satisfying $LL^\top=\lambda R^{-1}$. Conditional on a short initial increment, the remaining expected weight is $\Psi(t+\delta,\mathbf X_{t+\delta})$ times the initial running-cost factor. Its first-order expansion and $\mathbb E[\Delta\mathbf W\Delta\mathbf W^\top]=\delta I$ give

<a id="pPVvDXQ083"></a>

$$
\mathbb E_{P_0}[e^{-S/\lambda}L\Delta\mathbf W]
=\delta\,LL^\top D(t,\mathbf x)^\top
\nabla\Psi(t,\mathbf x)+o(\delta).
$$

[(20)](#pPVvDXQ083 "Link to this Equation")

The deterministic terms have zero correlation with the mean-zero noise. Dividing by $\delta\Psi$ recovers the optimal control:

<a id="GnBFnE2kyZ"></a>

$$
\mathbf u^\star(t,\mathbf x)=
\lim_{\delta\downarrow0}
\frac{\mathbb E_{P_0}
[e^{-S/\lambda}L(\mathbf W_{t+\delta}-\mathbf W_t)]}
{\delta\,\mathbb E_{P_0}[e^{-S/\lambda}]}.
$$

[(21)](#GnBFnE2kyZ "Link to this Equation")

Low-cost future paths receive greater weight, and their initial random displacements determine which control direction to apply now. The formula is conditional on the specified current state; estimates for future times require the corresponding state conditioning.

<a id="sampling-around-a-controlled-trajectory"></a>

### Sampling around a controlled trajectory

Uncontrolled simulations may rarely reach the target. Instead, simulate under an adapted sampling control $\bar{\mathbf u}$ with the same diffusion, and denote the resulting trajectory law by $Q_{\bar{\mathbf u}}$. Girsanov’s change-of-measure formula gives

<a id="O36BM1H1dq"></a>

$$
\frac{dP_0}{dQ_{\bar{\mathbf u}}}
=\exp\left[-\frac1\lambda\left(
\frac12\int_t^{t_f}\bar{\mathbf u}_s^\top R\bar{\mathbf u}_s\,ds
+\int_t^{t_f}\bar{\mathbf u}_s^\top RL\,d\mathbf W_s^{\bar{\mathbf u}}
\right)\right].
$$

[(22)](#O36BM1H1dq "Link to this Equation")

Here $\mathbf W^{\bar{\mathbf u}}$ is Brownian motion under the sampling law. Sufficient conditions include the usual exponential-integrability condition $\mathbb E_{Q_{\bar{\mathbf u}}}
\exp[\tfrac12\int_t^{t_f}\|L^{-1}\bar{\mathbf u}_s\|^2ds]<\infty$, which ensures that this likelihood ratio defines a probability measure. The ratio is the continuous-time counterpart of the Gaussian density expansion in [From Trajectory Weights to MPPI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi-distribution): the accumulated squared mean shift supplies the first integral and the mean-noise cross terms supply the second.

Absorb the ratio into a corrected path cost,

<a id="XPKIl82wos"></a>

$$
S^{\bar{\mathbf u}}=S+
\frac12\int_t^{t_f}\bar{\mathbf u}_s^\top R\bar{\mathbf u}_s\,ds
+\int_t^{t_f}\bar{\mathbf u}_s^\top RL\,d\mathbf W_s^{\bar{\mathbf u}}.
$$

[(23)](#XPKIl82wos "Link to this Equation")

Its stochastic integral has mean zero but must remain inside the exponential weight. The control estimator then becomes

<a id="XYRmV9saAX"></a>

$$
\mathbf u^\star(t,\mathbf x)=\bar{\mathbf u}(t,\mathbf x)+
\lim_{\delta\downarrow0}
\frac{\mathbb E_{Q_{\bar{\mathbf u}}}
[e^{-S^{\bar{\mathbf u}}/\lambda}L\Delta\mathbf W^{\bar{\mathbf u}}]}
{\delta\,\mathbb E_{Q_{\bar{\mathbf u}}}
[e^{-S^{\bar{\mathbf u}}/\lambda}]}.
$$

[(24)](#XYRmV9saAX "Link to this Equation")

The weighted perturbation corrects the current sampling control. The exact result holds for different admissible sampling controls, although their Monte Carlo variances can differ substantially [Thijssen & Kappen, 2015](https://doi.org/10.1103/PhysRevE.91.032104).

<a id="discretization-and-the-mppi-update"></a>

### Discretization and the MPPI update

For simulation with step $h$, Euler--Maruyama gives

<a id="bQNCfVHPsW"></a>

$$
\mathbf x_{k+1}=\mathbf x_k+h\mathbf a_k
+hD_k(\mathbf u_k+\boldsymbol\epsilon_k),
\qquad
\boldsymbol\epsilon_k=\frac{L\boldsymbol\xi_k}{\sqrt h},
\qquad \boldsymbol\xi_k\sim\mathcal N(\mathbf0,I).
$$

[(25)](#bQNCfVHPsW "Link to this Equation")

The random state increment is $\sqrt h\,D_kL\boldsymbol\xi_k$, so its covariance is $hD_kLL^\top D_k^\top=hB_kB_k^\top$, as required by the diffusion. The input perturbation itself has covariance $\Sigma_h=\lambda R^{-1}/h$. Halving $h$ therefore increases its standard deviation by $\sqrt2$, while reducing the standard deviation of the physical state increment by $\sqrt2$. The two scalings refer to different quantities. Let $S_h$ denote the terminal state cost plus a quadrature approximation of the running state cost. With $\lambda\Sigma_h^{-1}=hR$, approximating the integrals in $S^{\bar{\mathbf u}}$ yields

<a id="iX7W73XJ4A"></a>

$$
S_h+\sum_{k=0}^{N-1}h\left(
\frac12\mathbf u_k^\top R\mathbf u_k
+\mathbf u_k^\top R\boldsymbol\epsilon_k\right).
$$

[(26)](#iX7W73XJ4A "Link to this Equation")

For a deterministic nominal sequence, the first term inside the sum is common to every rollout and cancels in normalized weights. The remaining cross term is exactly the discrete likelihood correction $\lambda\sum_k\mathbf u_k^\top\Sigma_h^{-1}\boldsymbol\epsilon_k$. For a state-dependent sampling controller, the quadratic term generally varies across trajectories and must be retained.

The weighted perturbation has the same form as the update in [From Trajectory Weights to MPPI](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi-distribution). That derivation fits a Gaussian to the Gibbs law $P^*$ with density proportional to $e^{-S/\lambda}p_0$, where $p_0$ is a reference density over input sequences. Its result and the stochastic control result describe different objects:

| Calculation | Result before numerical approximation | Approximation used in computation |
| --- | --- | --- |
| Gibbs weighting and Gaussian fitting | Mean of $P^*$, an exact fit within the fixed-covariance Gaussian family | Finite importance samples estimate that mean; fitting discards other features of $P^*$ |
| Matched stochastic control | Optimal current feedback action from the limiting first-noise expectation | Time discretization and finite samples approximate the conditional expectation |

The distributional mean describes an entire open-loop sequence. The stochastic-control formula gives a current feedback action conditioned on a specified state. Its future feedback actions require the future states as well. For general nonlinear constrained models, neither Gaussian averaging nor finite sampling guarantees global optimality or feasibility.

The expectation in the original control objective remains an ordinary expected cost. Exponential weighting over the uncontrolled diffusion solves that objective because of the HJB transformation and noise matching. Exponentiating costs from arbitrary disturbance scenarios of an unrelated model does not establish the same result. In particular, physical disturbance uncertainty and extra numerical exploration must be specified separately whenever the matched diffusion interpretation does not apply.

<a id="sec-brownian-passages"></a>

## Brownian Motion Through Competing Passages

When does uncertainty change the direction of the optimal force? The quadratic example cannot answer this question because its optimal action has certainty equivalence. We now keep the same fully observed particle and quadratic effort, and change the geometry of the state cost.

Imagine a particle starting at $x=-0.3$. Between times 1 and 2, it should stay in one of two openings: a narrow interval $[-0.18,0.18]$ near its starting position, or a wider interval $[-1.7,-0.7]$ farther to the left. One possible trajectory moves right into the narrow opening, stays there while the passage is active, and then approaches the terminal target $x=0$ at time 3. Another moves left into the wider opening and returns toward the target afterward. With weak fluctuations, the shorter route requires less effort. Stronger fluctuations make remaining inside the narrow opening more difficult.

The horizontal coordinate in the figures is time, and the vertical coordinate is the particle’s scalar position. The openings describe a cost that depends on both time and position; they are not a second dynamical state. This construction follows the double-slit and unequal-passage examples of [Kappen (2005)](https://doi.org/10.1088/1742-5468/2005/11/P11011). The finite penalties and numerical parameters below are adaptations for a runnable teaching example.

<a id="fig-brownian-passages"></a>

<a id="jHGFT7g9hf"></a>
![Paired realizations at two physical noise levels. Gray regions incur a finite
penalty. Blue paths use sampled path-integral feedback; dashed orange paths use
feedback obtained by planning under mean dynamics. The same Brownian increments
act on both controllers within each trial. Here r=1 and \lambda=\nu r.](../Assets/Website/1d1bb08900-brownian-passages-c81498b27c139d170c1e1ea876211800.svg)

[Figure 1:](#fig-brownian-passages "Link to this figure")Paired realizations at two physical noise levels. Gray regions incur a finite penalty. Blue paths use sampled path-integral feedback; dashed orange paths use feedback obtained by planning under mean dynamics. The same Brownian increments act on both controllers within each trial. Here $r=1$ and $\lambda=\nu r$.

<a id="a-finite-width-double-slit-with-an-analytic-solution"></a>

### A finite-width double slit with an analytic solution

The full passage requires a sequence of successful positions. To isolate the decision about when to choose a route, first replace that duration by a single crossing time $t_s<T$. The particle pays a lump penalty $F$ if $X_{t_s}$ lies outside a union of intervals $\mathcal A=\bigcup_j[a_j,b_j]$, and a terminal cost $\kappa X_T^2/2$. The diffusion and effort remain

<a id="NGOqsJeav1"></a>

$$
dX_s=u_s\,ds+\sqrt\nu\,dW_s,
\qquad \frac r2u_s^2,
\qquad \lambda=\nu r.
$$

[(27)](#NGOqsJeav1 "Link to this Equation")

The desirability $\Psi=e^{-V/\lambda}$ is the expected exponential weight under uncontrolled Brownian motion, as derived in [Stochastic Feedback Control](#sec-path-integral-control). Conditioning on $Y=X_{t_s}$ separates the crossing from the terminal transport:

<a id="frqvdivfnE"></a>

$$
\Psi(t,x)=\int_{\mathbb R}
\mathcal N(y;x,\nu(t_s-t))
 e^{-F\mathbf1_{\{y\notin\mathcal A\}}/\lambda}
 \Psi_{\mathrm{free}}(t_s,y)\,dy.
$$

[(28)](#frqvdivfnE "Link to this Equation")

The quadratic calculation above gives

<a id="t8yBw3KupW"></a>

$$
\Psi_{\mathrm{free}}(t,x)=
\sqrt{\frac r{r+\kappa(T-t)}}
\exp\!\left[-\frac{\kappa x^2}{2\nu(r+\kappa(T-t))}\right].
$$

[(29)](#t8yBw3KupW "Link to this Equation")

Multiplying the two Gaussian factors and completing the square leaves a normalized Gaussian in $y$. Write $\delta=t_s-t$ for the time until crossing and $A=r/\kappa+T-t_s$ for the remaining time after crossing plus the effort-to-terminal-cost ratio. The Gaussian product has mean and variance

<a id="p9MyLBzF7h"></a>

$$
\beta=\frac A{A+\delta},\qquad m=\beta x,\qquad
s^2=\nu\delta\beta.
$$

[(30)](#p9MyLBzF7h "Link to this Equation")

The terminal cost pulls its mean toward zero: $0<\beta<1$. Under this cost-weighted Gaussian, the probability of lying in an opening is

<a id="bwXapcTCow"></a>

$$
P_{\mathcal A}(x)=\sum_j\left[
\Phi\!\left(\frac{b_j-m}{s}\right)
-\Phi\!\left(\frac{a_j-m}{s}\right)\right],
$$

[(31)](#bwXapcTCow "Link to this Equation")

where $\Phi$ is the standard normal cumulative distribution function. Inside an opening, the crossing weight is one; outside, it is $e^{-F/\lambda}$. Averaging these two values gives

<a id="ivuDKdklv9"></a>

$$
\Psi(t,x)=\Psi_{\mathrm{free}}(t,x)
\underbrace{\left[e^{-F/\lambda}
 +(1-e^{-F/\lambda})P_{\mathcal A}(x)\right]}_{G(t,x)},
\qquad
u^*(t,x)=-\frac{\kappa x}{r+\kappa(T-t)}
+\nu\frac{\partial_xG(t,x)}{G(t,x)}.
$$

[(32)](#ivuDKdklv9 "Link to this Equation")

This is an analytic benchmark for finite passage widths and a finite penalty. Taking $F\to\infty$ prohibits crossing outside an opening. For symmetric openings shrinking to points at $\pm a$, their equal terminal costs cancel from the control ratio, giving

<a id="WAqjaIFelA"></a>

$$
u^*(t,x)=\frac{a\tanh(ax/(\nu\delta))-x}{\delta}.
$$

[(33)](#WAqjaIFelA "Link to this Equation")

At $x=0$, symmetry forces $u^*=0$. The response to a small displacement is

<a id="q7lXXuH3Ae"></a>

$$
\partial_xu^*(t,0)=\frac1\delta
\left(\frac{a^2}{\nu\delta}-1\right).
$$

[(34)](#q7lXXuH3Ae "Link to this Equation")

If $\nu\delta>a^2$, the force returns a small displacement toward the center: there is time to postpone commitment. If $\nu\delta<a^2$, the force amplifies the displacement toward one opening. A realized fluctuation can then determine which route the feedback follows. At the exact symmetry point, an action of zero expresses symmetry; it does not guarantee that a single realized path will pass through the center of either opening.

<a id="fig-brownian-feedback"></a>

<a id="C4WVkr614H"></a>
![Left: the symmetric narrow-slit limit, with a=\nu=1, changes its response near
x=0 as the crossing approaches. Right: forward importance sampling is checked
against the finite-width formula at x=0.2, using openings [-1.15,-0.85] and
[0.85,1.15], t_s=2, T=3, r=\kappa=\nu=1, and F=20. Each estimate
averages 32 independent batches of 4096 samples; bars show 95% confidence
intervals for that mean.](../Assets/Website/43dd14ca19-brownian-feedback-5fb028d7e8f563a44c636d26801ac2a0.svg)

[Figure 2:](#fig-brownian-feedback "Link to this figure")Left: the symmetric narrow-slit limit, with $a=\nu=1$, changes its response near $x=0$ as the crossing approaches. Right: forward importance sampling is checked against the finite-width formula at $x=0.2$, using openings $[-1.15,-0.85]$ and $[0.85,1.15]$, $t_s=2$, $T=3$, $r=\kappa=\nu=1$, and $F=20$. Each estimate averages 32 independent batches of 4096 samples; bars show 95% confidence intervals for that mean.

<a id="staying-inside-unequal-passages"></a>

### Staying inside unequal passages

A finite-thickness passage requires staying in an opening for a duration. For the geometry in [Figure 1](#fig-brownian-passages), define

<a id="ltxkpuYraX"></a>

$$
q(t,x)=40\,\mathbf1_{\{1<t\leq2\}}
\mathbf1_{\{x\notin[-0.18,0.18]\cup[-1.7,-0.7]\}},
\qquad
J(u)=\mathbb E\!\left[
\frac12X_3^2+\int_0^3\left(q(s,X_s)+\frac12u_s^2\right)ds
\right].
$$

[(35)](#ltxkpuYraX "Link to this Equation")

We hold $r=\kappa=1$ fixed and compare $\nu=0.015$ with $\nu=0.3$. The matching condition requires changing $\lambda$ from 0.015 to 0.3 at the same time. Keeping a separate fixed temperature would change the relationship to this stochastic-control problem.

The simulation uses $h=0.025$ and evaluates the passage penalty at the right endpoint of each transition. At each decision, the path-integral controller samples 4096 futures up to the end of the passage. The terminal quadratic tail from time 2 to time 3 is integrated analytically. Three Gaussian trajectory proposals generate the futures: one guides the particle toward each opening, and one retains zero drift. Their mixture improves coverage when successful passage trajectories are rare under passive sampling.

The trajectory probability of this mixture must appear in the correction. If $q_j$ is the density of the complete sequence of increments under route $j$, the denominator is $q_{\mathrm{mix}}=\frac13\sum_{j=1}^3q_j$. The same route is chosen for an entire simulated future, so a product of per-step mixture densities would describe a different sampling procedure. Let $p_0$ be the joint density of the uncontrolled increments, each distributed as $\mathcal N(0,\nu h)$. For sampled increment sequences $\Delta x^{(i)}$, normalize the following weights to sum to one and use their weighted first increment to estimate the action:

<a id="BtccUp603l"></a>

$$
w_i\propto e^{-S_i/\lambda}\frac{p_0(\Delta x^{(i)})}
 {q_{\mathrm{mix}}(\Delta x^{(i)})},
\qquad
u(t,x)\approx\frac1h\sum_iw_i\Delta x^{(i)}_0.
$$

[(36)](#BtccUp603l "Link to this Equation")

The guiding routes choose where to sample. The weighted first increment chooses the actual force. The physical Brownian increment applied after this choice comes from a separate random-number stream.

<a id="fig-brownian-samples"></a>

<a id="R0qbZgoOh9"></a>
![Futures from one high-noise update at t=0. Blue curves are among the
highest-weight samples; gray curves have smaller weights. The right panel
shows how many samples carry most of the normalized weight. The effective
sample size, 1/\sum_iw_i^2, diagnoses weight concentration rather than
measuring the number of physically possible futures.](../Assets/Website/9ca7a51551-brownian-samples-d1b1d2f1b28c3be7c86331263cae5b1b.svg)

[Figure 3:](#fig-brownian-samples "Link to this figure")Futures from one high-noise update at $t=0$. Blue curves are among the highest-weight samples; gray curves have smaller weights. The right panel shows how many samples carry most of the normalized weight. The effective sample size, $1/\sum_iw_i^2$, diagnoses weight concentration rather than measuring the number of physically possible futures.

An independent reference evaluates the discretized Feynman--Kac expectation by backward Gaussian convolution on a position grid:

<a id="bfxgWxxwgh"></a>

$$
\Psi_k(x)=\int\mathcal N(y;x,\nu h)
 e^{-h q(t_{k+1},y)/\lambda}\Psi_{k+1}(y)\,dy,
\qquad \Psi_N(x)=e^{-x^2/(2\lambda)}.
$$

[(37)](#bfxgWxxwgh "Link to this Equation")

Differentiating the Gaussian kernel gives the same first-increment estimator without Monte Carlo sampling. This is a reference for the time-discretized path-integral formula. Executing its force as piecewise constant feedback still introduces a time-step approximation to continuous-time optimal control. We do not identify its finite-step realized cost with the exact continuous-time value.

The comparison controller solves a deterministic dynamic program with the same state cost and control effort, using $x_{k+1}=x_k+hu_k$. This baseline asks what is lost by replacing the future diffusion by its mean. It applies its first action to the observed noisy state and recomputes the action after each step. Both methods therefore use feedback; they differ in whether planning accounts for the future diffusion. The deterministic position grid has spacing 0.0025, corresponding to action spacing 0.1, with a numerical action limit of 24. The reference convolution uses spacing 0.005 on $[-6,6]$.

<a id="passage-choice-cost-and-failures"></a>

### Passage choice, cost, and failures

Does accounting for diffusion change which passage is used, and does that choice reduce realized cost? The comparison uses 128 independent physical disturbance sequences, paired across controllers. Pairing gives the methods the same fluctuations, so an apparent improvement cannot be explained by one method receiving an easier collection of disturbances.

| Physical noise | Sampled path-integral cost | Mean-dynamics cost | Numerical-reference cost |
| --- | --- | --- | --- |
| $\nu=0.015$ | $0.221\pm0.085$ | $5.310\pm0.914$ | $0.197\pm0.078$ |
| $\nu=0.3$ | $1.808\pm0.289$ | $11.303\pm1.184$ | $1.767\pm0.279$ |

The entries are means with normal-approximation 95% confidence intervals across trials. The sampled controller and the independent numerical reference give similar mean costs. Mean-dynamics planning has larger cost at both noise levels, even though it also replans from the observed state.

At low noise, neither planning method occupies the wide passage at time 1.5. At high noise, their choices separate:

| Controller, $\nu=0.3$ | Wide-passage trials | Wilson 95% interval for the proportion |
| --- | --- | --- |
| Sampled path-integral feedback | $126/128$ | $[0.945,0.996]$ |
| Mean-dynamics planning | $32/128$ | $[0.183,0.332]$ |

Occupancy includes every trial, including those that incur a penalty. Accounting for the stronger diffusion favors the wider route despite its detour. This is the effect that the quadratic target alone could not show.

A finite penalty still allows failed passages. A trial fails if any checked position lies outside both openings during $1<t\leq2$:

| Physical noise | Sampled path-integral failures | Mean-dynamics failures |
| --- | --- | --- |
| $\nu=0.015$ | $17/128$ | $94/128$ |
| $\nu=0.3$ | $28/128$ | $122/128$ |

At high noise, mean control effort is 1.142 for sampled feedback and 1.531 for mean-dynamics planning. The cost difference includes both the effort and the accumulated penalty for positions outside the passages.

<a id="fig-brownian-outcomes"></a>

<a id="sEFbeDJjgM"></a>
![Costs and passage outcomes under paired physical disturbances. Cost bars are
95% intervals for means; proportion bars are Wilson 95% intervals. The numerical
reference and the sampled controller have similar outcomes. The finite
penalty does not impose a probability-of-failure guarantee.](../Assets/Website/8977e86062-brownian-outcomes-36e9927c18241e9a7a6510a02f50e5cf.svg)

[Figure 4:](#fig-brownian-outcomes "Link to this figure")Costs and passage outcomes under paired physical disturbances. Cost bars are 95% intervals for means; proportion bars are Wilson 95% intervals. The numerical reference and the sampled controller have similar outcomes. The finite penalty does not impose a probability-of-failure guarantee.

<a id="sampling-error-and-discretization-error"></a>

### Sampling error and discretization error

The reference solution lets us vary numerical accuracy separately from physical noise. At the high-noise initial state, increasing the candidate count from 256 to 16384 reduces the first-action root-mean-square error against the convolution reference from 0.910 to 0.103 across 32 independent batches. Refining the time step from 0.05 to 0.00625 changes the reference first action from \-0.681 to \-0.749. Near the route-switching regime, this sensitivity is larger: for $\nu=0.15$, the same refinement changes the action from \-0.173 to \-0.412. The finite-grid demonstration should therefore be interpreted at its stated resolution. Crossings between checked times are not counted.

Refining the deterministic grid from 0.0025 to 0.00125 changes its paired mean cost from 5.310 to 4.915 at low noise and from 11.303 to 11.446 at high noise. No executed control reaches the numerical action limit. The cost gap persists under this refinement, although the deterministic baseline itself is not fully converged. Expanding the convolution domain from $[-6,6]$ to $[-8,8]$ leaves its initial high-noise action unchanged to the displayed precision. All settings, trial arrays, and convergence sweeps are retained in the [experiment results](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/8e777f41a3-results-dc2f160e2689c1b7bf700c1d78e5952b.json).

<a id="KDdHt1LwaJ"></a>

[Démonstration interactive — Brownian passage replay](https://pierrelucbacon.com/interactive/brownian-mppi.html)

Replay a paired trial, change the physical noise level, and inspect accumulated control effort and outside visits. The replay uses saved trajectories.

The mean-dynamics controller often waits near an opening’s edge. Which term in its predicted objective assigns a cost to remaining close to that edge, and which future events does that prediction omit? The stochastic controller accounts for the cost of correcting future fluctuations, which can favor a wider passage even when reaching it requires more travel.

<a id="summary-and-outlook"></a>

## Summary and Outlook

The stochastic HJB equation is the continuous-time Bellman equation for feedback control under physical noise. With quadratic effort and matching control and noise directions, the logarithmic transformation turns this nonlinear equation into a linear one. The transformed value is an exponential expectation over uncontrolled trajectories, and correlations with the first noise increment give the optimal current action.

Importance sampling allows those trajectories to be drawn around a useful control. Time discretization then produces the weighted-perturbation form used by MPPI. The continuous-time result concerns an action conditioned on the current state; finite samples and a finite time step introduce errors, and a stored sequence still requires replanning to supply feedback.

The quadratic example has certainty equivalence, whereas competing passages make future fluctuations affect the route choice. Paired trials and numerical reference calculations separate that modeling effect from sampling and discretization errors. The matching assumption also limits the theory’s scope: the aircraft optimizer in [Aircraft Planning Under Uncertain Winds](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-aircraft-mppi) uses a general distributional fit to estimated expected costs, which by itself does not establish optimal feedback.

<a id="computational-sources"></a>

## Computational Sources

The passage experiments read precomputed results when the book is built. The path sampler and reference calculation have separate implementations:

-   [Brownian dynamics, path sampler, and reference solutions](https://pierrelucbacon.com/rlbook/build/brownian_mppi-f4e9b4981bfb173261d81cde87ed2f9f.py)
    
-   [Brownian experiment and figure generator](https://pierrelucbacon.com/rlbook/build/build_brownian_mppi_-efb19b87da87296deeaceafd49a2a191.py)
    
-   [Experiment parameters and results](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/8e777f41a3-results-dc2f160e2689c1b7bf700c1d78e5952b.json)
    
-   [Paired trial arrays](https://pierrelucbacon.com/rlbook/build/trials-1689a6e0a91cd97135dff499454a6f78.npz)
    

The [Brownian replay](https://pierrelucbacon.com/rlbook/build/brownian-mppi-d371089ef4cac1c9f517ddea3533540a.html) displays the recorded simulations without a Python kernel. Regeneration commands are in the repository README.

<a id="exercises"></a>

## Exercises

<a id="ex-mppi-noise-scaling"></a>

[Exercise 1](#ex-mppi-noise-scaling "Link to this Exercise") (Noise matching and time discretization)

Consider $dX_s=u_s\,ds+\sigma\,dW_s$ with running effort $\tfrac12ru_s^2$, where $r>0$ and $\sigma>0$.

**(a)** Find $\lambda$ and the control-perturbation variance needed for $x_{k+1}=x_k+h(u_k+\epsilon_k)$ to match the diffusion.

**(b)** If $h$ is halved, how must the standard deviation of $\epsilon_k$ change? What happens to the physical variance accumulated over a fixed time horizon if the perturbation variance is instead held fixed?

**(c)** A stochastic double integrator obeys $dX_s=V_s\,ds$ and $dV_s=u_s\,ds+\sigma\,dW_s$. Does its unactuated position coordinate violate noise matching? Would adding an independent Brownian increment directly to $dX_s$ preserve it?

Solution to [Exercise 1](#ex-mppi-noise-scaling)

**(a)** Matching requires $\sigma^2=\lambda/r$, hence $\lambda=r\sigma^2$. The random position increment must have variance $\sigma^2h$. Since it equals $h\epsilon_k$, its perturbation variance is $\operatorname{Var}(\epsilon_k)=\sigma^2/h=\lambda/(rh)$.

**(b)** The variance doubles and the standard deviation increases by $\sqrt2$. With fixed perturbation variance $s^2$ and duration $T$, the accumulated position variance is $(T/h)h^2s^2=Ths^2$, which vanishes as $h\to0$. That discretization approaches deterministic dynamics instead of the prescribed diffusion.

**(c)** In state order $(X,V)$, take $D=(0,1)^\top$ and $B=(0,\sigma)^\top$. Then $BB^\top=\lambda D r^{-1}D^\top$ with the value of $\lambda$ above. Both noise and control act on velocity, so the unactuated position causes no problem. Independent position noise would add a positive entry to the position variance that the right side cannot represent.

<a id="ex-mppi-certainty-equivalence"></a>

[Exercise 2](#ex-mppi-certainty-equivalence "Link to this Exercise") (Certainty equivalence and nonlinear costs)

For $dX=u\,ds+\sqrt\nu\,dW$, minimize expected terminal cost $\tfrac\kappa2(X_{t_f}-a)^2$ plus running effort $\tfrac r2u^2$. Assume $r,\kappa>0$, set $\lambda=r\nu$, and write $\tau=t_f-t$.

**(a)** Verify that the value function

<a id="UbXkJVzj9S"></a>

$$
V(t,x)=\frac{\kappa r(x-a)^2}{2(r+\kappa\tau)}
+\frac{r\nu}{2}\log(1+\kappa\tau/r)
$$

[(38)](#UbXkJVzj9S "Link to this Equation")

satisfies the scalar HJB equation and the terminal condition.

**(b)** Derive the optimal feedback and explain which part of the value changes with $\nu$ when $r$ is held fixed.

**(c)** Does this example show that noise never changes an optimal decision? Suggest a modification for which that conclusion is unsupported.

Solution to [Exercise 2](#ex-mppi-certainty-equivalence)

**(a)** Write $P(t)=\kappa r/(r+\kappa\tau)$ and $b(t)=(r\nu/2)\log(1+\kappa\tau/r)$, so $V=P(x-a)^2/2+b$. Their derivatives are $\dot P=P^2/r$ and $\dot b=-\nu P/2$. Substituting $V_x=P(x-a)$ and $V_{xx}=P$ into $V_t-V_x^2/(2r)+\nu V_{xx}/2=0$ cancels both the quadratic and constant terms. At $t=t_f$, $P=\kappa$ and $b=0$, giving the terminal cost.

**(b)** The feedback is $u^\star=-V_x/r=\kappa(a-x)/(r+\kappa\tau)$. Only the state-independent term $b(t)$ depends on $\nu$. It increases expected cost but disappears on taking the state derivative.

**(c)** The cancellation uses the quadratic value function and control-independent additive noise. A state penalty with an obstacle, two separated target regions, or a nonlinear drift need not preserve that structure. For example, two passages with different widths can require different expected control effort to counter diffusion even when their deterministic path lengths are comparable.

<a id="ex-mppi-paired-passages"></a>

[Exercise 3](#ex-mppi-paired-passages "Link to this Exercise") (Comparing passage controllers with paired trials)

Use the saved [passage trials](https://pierrelucbacon.com/rlbook/build/trials-1689a6e0a91cd97135dff499454a6f78.npz). The arrays named `<noise>_<method>_cost` contain one cost per trial, with `noise` equal to `low_noise` or `high_noise` and `method` equal to `path_integral` or `mean_dynamics`. Matching indices use the same physical Brownian increments.

**(a)** For each noise level, compute the trial differences $d_j=C_j^{\mathrm{PI}}-C_j^{\mathrm{mean}}$. Report their sample mean and the normal-approximation 95% interval $\bar d\pm1.96s_d/\sqrt n$, where $s_d$ is the sample standard deviation.

**(b)** Explain why this interval answers a different question from an interval for the cost of one future particle trajectory. Why should the difference be formed before its standard error is computed?

**(c)** Design a follow-up experiment that distinguishes a sampling error from an error in time discretization. Specify what is held fixed in each comparison and which reference solution is used. State what the saved failures prevent you from claiming about the controller.

Solution to [Exercise 3](#ex-mppi-paired-passages)

**(a)** The calculation uses the within-trial difference:

```python
import numpy as np

with np.load("artifacts/brownian_mppi/trials.npz") as trials:
    for noise in ("low_noise", "high_noise"):
        d = (trials[f"{noise}_path_integral_cost"]
             - trials[f"{noise}_mean_dynamics_cost"])
        half_width = 1.96 * d.std(ddof=1) / np.sqrt(d.size)
        print(noise, d.mean(), half_width)
```

The mean differences are approximately $-5.090\pm0.883$ at low noise and $-9.496\pm1.070$ at high noise. Negative values favor path-integral feedback.

**(b)** This interval describes uncertainty in the estimated mean cost difference across independent trials. An individual realized cost can be far from that mean. Pairing also contributes a covariance term: $\operatorname{Var}(C^{\mathrm{PI}}-C^{\mathrm{mean}})
=\operatorname{Var}(C^{\mathrm{PI}})+\operatorname{Var}(C^{\mathrm{mean}})
-2\operatorname{Cov}(C^{\mathrm{PI}},C^{\mathrm{mean}})$. Computing the differences preserves the covariance produced by shared physical disturbances; treating the two arrays as independent discards it.

**(c)** Hold the model, state, time step, and reference grid fixed while varying candidate count across independent sampling seeds. Compare the first action with the backward-convolution action at that time step. Separately, vary the time step in the reference calculation while keeping physical coefficients fixed, including $\lambda=r\nu$ and the corresponding perturbation scaling. These comparisons isolate Monte Carlo error and time resolution. The observed failures and unchecked crossings between time steps rule out a claim of guaranteed passage feasibility.

<a id="self-checks"></a>

## Self-checks

<a id="ex-mppi-check-noise"></a>

[Exercise 4](#ex-mppi-check-noise "Link to this Exercise") (Physical noise and sampling)

If the optimizer stops generating candidate trajectories, does the Brownian particle stop fluctuating? Which source of randomness has been removed?

Solution to [Exercise 4](#ex-mppi-check-noise)

The physical Brownian increments remain. Stopping the sampler removes simulated futures used to estimate an update; it does not change the particle’s process noise.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Kappen2005PathIntegrals"></a>
2.  Kappen, H. J. (2005). Path integrals and symmetry breaking for optimal control theory. _Journal of Statistical Mechanics: Theory and Experiment_, _2005_(11), P11011. [10.1088/1742-5468/2005/11/P11011](https://doi.org/10.1088/1742-5468/2005/11/P11011)
<a id="cite-Thijssen2015Feedback"></a>
4.  Thijssen, S., & Kappen, H. J. (2015). Path integral control and state-dependent feedback. _Physical Review E_, _91_(3), 032104. [10.1103/PhysRevE.91.032104](https://doi.org/10.1103/PhysRevE.91.032104)

[

Dynamic Programming

Stochastic Dynamic Programming and Markov Decision Processes


](16-stochastic-dp.md)[

Dynamic Programming

Infinite-Horizon Markov Decision Processes


](18-infinite-horizon-mdps.md)


---

# CHAPITRE 18 — Infinite-Horizon Markov Decision Processes

Section du livre : Dynamic Programming

Page originale : https://pierrelucbacon.com/rlbook/infinite-horizon-mdps

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/18-infinite-horizon-mdps.md

> **Cours de Pierre-Luc Bacon — 18.** [Page publiée](https://pierrelucbacon.com/rlbook/infinite-horizon-mdps) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/18-infinite-horizon-mdps.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Infinite-Horizon Markov Decision Processes

<a id="skip-to-article"></a>

Finite-horizon stochastic dynamic programming obtains its boundary condition from the terminal reward. What value equation remains when the process has no terminal date? Discounting makes the infinite reward stream bounded and turns the Bellman equations into fixed-point problems.

The undiscounted expected total reward of policy $\boldsymbol{\pi} \in
\Pi^{\mathrm{HR}}$ is

<a id="RtNIxCHNQR"></a>

$$
v^{\boldsymbol{\pi}}(s) = \mathbb{E}\left[\sum_{t=1}^{\infty} r(S_t, A_t)\right]
$$

[(1)](#RtNIxCHNQR "Link to this Equation")

One drawback of this model is that we could easily encounter values that are $+\infty$ or $-\infty$, even in a setting as simple as a single-state MDP which loops back into itself and where the accrued reward is nonzero.

Therefore, it is often more convenient to work with an alternative formulation which guarantees the existence of a limit: the expected total discounted reward of policy $\boldsymbol{\pi} \in \Pi^{\mathrm{HR}}$ is defined to be:

<a id="s24kr9wXuM"></a>

$$
v_\gamma^{\boldsymbol{\pi}}(s) \equiv \lim_{N \rightarrow \infty} \mathbb{E}\left[\sum_{t=1}^N \gamma^{t-1} r(S_t, A_t)\right]
$$

[(2)](#s24kr9wXuM "Link to this Equation")

for $0 \leq \gamma < 1$ and when $\max_{s \in \mathcal{S}} \max_{a \in \mathcal{A}_s}|r(s, a)| = R_{\max} < \infty$, in which case, $|v_\gamma^{\boldsymbol{\pi}}(s)| \leq (1-\gamma)^{-1} R_{\max}$.

Finally, another possibility for the infinite-horizon setting is the so-called average reward or gain of policy $\boldsymbol{\pi} \in \Pi^{\mathrm{HR}}$ defined as:

<a id="tmJBhRvKHM"></a>

$$
g^{\boldsymbol{\pi}}(s) \equiv \lim_{N \rightarrow \infty} \frac{1}{N} \mathbb{E}\left[\sum_{t=1}^N r(S_t, A_t)\right]
$$

[(3)](#tmJBhRvKHM "Link to this Equation")

We won’t be working with this formulation in this course due to its inherent practical and theoretical complexities.

Extending the previous notion of optimality from finite-horizon models, a policy $\boldsymbol{\pi}^*$ is said to be discount optimal for a given $\gamma$ if:

<a id="ues6xO9PJ8"></a>

$$
v_\gamma^{\boldsymbol{\pi}^*}(s) \geq v_\gamma^{\boldsymbol{\pi}}(s) \quad \text { for each } s \in S \text { and all } \boldsymbol{\pi} \in \Pi^{\mathrm{HR}}
$$

[(4)](#ues6xO9PJ8 "Link to this Equation")

Furthermore, the value of a discounted MDP $v_\gamma^*(s)$, is defined by:

<a id="jeK7Ycvjx3"></a>

$$
v_\gamma^*(s) \equiv \max _{\boldsymbol{\pi} \in \Pi^{\mathrm{HR}}} v_\gamma^{\boldsymbol{\pi}}(s)
$$

[(5)](#jeK7Ycvjx3 "Link to this Equation")

More often, we refer to $v_\gamma$ by simply calling it the optimal value function.

As for the finite-horizon setting, the infinite horizon discounted model does not require history-dependent policies, since for any $\boldsymbol{\pi} \in \Pi^{HR}$ there exists a $\boldsymbol{\pi}^{\prime} \in \Pi^{MR}$ with identical total discounted reward:

<a id="kWPjp59fZp"></a>

$$
v_\gamma^*(s) \equiv \max_{\boldsymbol{\pi} \in \Pi^{HR}} v_\gamma^{\boldsymbol{\pi}}(s)=\max_{\boldsymbol{\pi} \in \Pi^{MR}} v_\gamma^{\boldsymbol{\pi}}(s) .
$$

[(6)](#kWPjp59fZp "Link to this Equation")

<a id="random-horizon-interpretation-of-discounting"></a>

## Random Horizon Interpretation of Discounting

Can geometric termination give the discount factor a probabilistic meaning rather than treating it only as an algebraic device? The use of discounting can be motivated both from a modeling perspective and as a means to ensure that the total reward remains bounded. From the modeling perspective, we can view discounting as a way to weight more or less importance on the immediate rewards vs. the long-term consequences. There is also another interpretation which stems from that of a finite horizon model but with an uncertain end time. More precisely:

Let $v_\nu^{\boldsymbol{\pi}}(s)$ denote the expected total reward obtained by using policy $\boldsymbol{\pi}$ when the horizon length $\nu$ is random. We define it by:

<a id="lZzjTX8aL3"></a>

$$
v_\nu^{\boldsymbol{\pi}}(s) \equiv \mathbb{E}_s^{\boldsymbol{\pi}}\left[\mathbb{E}_\nu\left\{\sum_{t=1}^\nu r(S_t, A_t)\right\}\right]
$$

[(7)](#lZzjTX8aL3 "Link to this Equation")

<a id="prop-5-3-1"></a>

[Theorem 1](#prop-5-3-1 "Link to this Theorem") (Random horizon interpretation of discounting)

Suppose that the horizon $\nu$ follows a geometric distribution with parameter $\gamma$, $0 \leq \gamma < 1$, independent of the policy such that $P(\nu=n) = (1-\gamma) \gamma^{n-1}, \, n=1,2, \ldots$, then $v_\nu^{\boldsymbol{\pi}}(s) = v_\gamma^{\boldsymbol{\pi}}(s)$ for all $s \in \mathcal{S}$ .

Proof 1

See proposition 5.3.1 in Puterman (1994).

By definition of the finite-horizon value function and the law of total expectation:

<a id="TGNGDWmNkH"></a>

$$
v_\nu^{\boldsymbol{\pi}}(s) = \sum_{n=1}^{\infty} P(\nu=n) \cdot v_n^{\boldsymbol{\pi}}(s) = \sum_{n=1}^{\infty} (1-\gamma) \gamma^{n-1} \cdot E_s^{\boldsymbol{\pi}} \left\{\sum_{t=1}^n r(S_t, A_t)\right\}.
$$

[(8)](#TGNGDWmNkH "Link to this Equation")

Combining the expectation with the sum over $n$:

<a id="QYlXpbRYJJ"></a>

$$
v_\nu^{\boldsymbol{\pi}}(s) = E_s^{\boldsymbol{\pi}} \left\{\sum_{n=1}^{\infty} (1-\gamma) \gamma^{n-1} \sum_{t=1}^n r(S_t, A_t)\right\}.
$$

[(9)](#QYlXpbRYJJ "Link to this Equation")

**Reordering the summations:** Under the bounded reward assumption $|r(s,a)| \leq R_{\max}$ and $\gamma < 1$, we have

<a id="IEZbj28c6E"></a>

$$
E_s^{\boldsymbol{\pi}} \left\{\sum_{n=1}^{\infty} \sum_{t=1}^n |r(S_t, A_t)| \cdot (1-\gamma) \gamma^{n-1}\right\} \leq R_{\max} \sum_{n=1}^{\infty} n (1-\gamma) \gamma^{n-1} = \frac{R_{\max}}{1-\gamma} < \infty,
$$

[(10)](#IEZbj28c6E "Link to this Equation")

which justifies exchanging the order of summation by Fubini’s theorem.

To reverse the order, note that the pair $(n,t)$ with $1 \leq t \leq n$ can be reindexed by fixing $t$ first and letting $n$ range from $t$ to $\infty$:

<a id="PDS1A35IDG"></a>

$$
\sum_{n=1}^{\infty} \sum_{t=1}^n = \sum_{t=1}^{\infty} \sum_{n=t}^{\infty}.
$$

[(11)](#PDS1A35IDG "Link to this Equation")

Therefore:

<a id="EwhwdnK7Fz"></a>

$$
\begin{align*}
v_\nu^{\boldsymbol{\pi}}(s) &= E_s^{\boldsymbol{\pi}} \left\{\sum_{t=1}^{\infty} r(S_t, A_t) \sum_{n=t}^{\infty} (1-\gamma) \gamma^{n-1}\right\}.
\end{align*}
$$

[(12)](#EwhwdnK7Fz "Link to this Equation")

**Evaluating the inner sum:** Using the substitution $m = n - t + 1$ (so $n = m + t - 1$):

<a id="VCJyCh9rKr"></a>

$$
\begin{align*}
\sum_{n=t}^{\infty} (1-\gamma) \gamma^{n-1} &= \sum_{m=1}^{\infty} (1-\gamma) \gamma^{m+t-2} \\
&= \gamma^{t-1} (1-\gamma) \sum_{m=1}^{\infty} \gamma^{m-1} \\
&= \gamma^{t-1} (1-\gamma) \cdot \frac{1}{1-\gamma} = \gamma^{t-1}.
\end{align*}
$$

[(13)](#VCJyCh9rKr "Link to this Equation")

Substituting back:

<a id="iTs9XZN71G"></a>

$$
v_\nu^{\boldsymbol{\pi}}(s) = E_s^{\boldsymbol{\pi}} \left\{\sum_{t=1}^{\infty} \gamma^{t-1} r(S_t, A_t)\right\} = v_\gamma^{\boldsymbol{\pi}}(s).
$$

[(14)](#iTs9XZN71G "Link to this Equation")

<a id="vector-representation-in-markov-decision-processes"></a>

## Vector Representation in Markov Decision Processes

How do transition kernels, rewards, and policies become matrices and vectors that expose the Bellman equations as operator equations?

Let V be the set of bounded real-valued functions on a discrete state space S. This means any function $f \in V$ satisfies the condition:

<a id="ukXkyU3c0F"></a>

$$
\|f\| = \max_{s \in S} |f(s)| < \infty.
$$

[(15)](#ukXkyU3c0F "Link to this Equation")

where notation $\|f\|$ represents the sup-norm (or $\ell_\infty$\-norm) of the function $f$.

When working with discrete state spaces, we can interpret elements of V as vectors and linear operators on V as matrices, allowing us to leverage tools from linear algebra. The sup-norm ($\ell_\infty$ norm) of matrix $\mathbf{H}$ is defined as:

<a id="NkB6upyRpf"></a>

$$
\|\mathbf{H}\| \equiv \max_{s \in S} \sum_{j \in S} |\mathbf{H}_{s,j}|
$$

[(16)](#NkB6upyRpf "Link to this Equation")

where $\mathbf{H}_{s,j}$ represents the $(s, j)$\-th component of the matrix $\mathbf{H}$.

For a Markovian decision rule $\pi \in \Pi^{MD}$, we define:

<a id="WmcTCzdGjL"></a>

$$
\begin{align*}
\mathbf{r}_\pi(s) &\equiv r(s, \pi(s)), \quad \mathbf{r}_\pi \in \mathbb{R}^{|S|}, \\
[\mathbf{P}_\pi]_{s,j} &\equiv p(j \mid s, \pi(s)), \quad \mathbf{P}_\pi \in \mathbb{R}^{|S| \times |S|}.
\end{align*}
$$

[(17)](#WmcTCzdGjL "Link to this Equation")

For a randomized decision rule $\pi \in \Pi^{MR}$, these definitions extend to:

<a id="sXW898JJJb"></a>

$$
\begin{align*}
\mathbf{r}_\pi(s) &\equiv \sum_{a \in A_s} \pi(a \mid s) \, r(s, a), \\
[\mathbf{P}_\pi]_{s,j} &\equiv \sum_{a \in A_s} \pi(a \mid s) \, p(j \mid s, a).
\end{align*}
$$

[(18)](#sXW898JJJb "Link to this Equation")

In both cases, $\mathbf{r}_\pi$ denotes a reward vector in $\mathbb{R}^{|S|}$, with each component $\mathbf{r}_\pi(s)$ representing the reward associated with state $s$. Similarly, $\mathbf{P}_\pi$ is a transition probability matrix in $\mathbb{R}^{|S| \times |S|}$, capturing the transition probabilities under decision rule $\pi$.

For a nonstationary Markovian policy $\boldsymbol{\pi} = (\pi_1, \pi_2, \ldots) \in \Pi^{MR}$, the expected total discounted reward is given by:

<a id="W7uBzrFZGt"></a>

$$
\mathbf{v}_\gamma^{\boldsymbol{\pi}}(s)=\mathbb{E}\left[\sum_{t=1}^{\infty} \gamma^{t-1} r\left(S_t, A_t\right) \,\middle|\, S_1 = s\right].
$$

[(19)](#W7uBzrFZGt "Link to this Equation")

Using vector notation, this can be expressed as:

<a id="iZ1DRlfTX3"></a>

$$
\begin{aligned}
\mathbf{v}_\gamma^{\boldsymbol{\pi}} &= \sum_{t=1}^{\infty} \gamma^{t-1} \mathbf{P}_{\boldsymbol{\pi}}^{t-1} \mathbf{r}_{\pi_1} \\
&= \mathbf{r}_{\pi_1} + \gamma \mathbf{P}_{\pi_1} \mathbf{r}_{\pi_2} + \gamma^2 \mathbf{P}_{\pi_1} \mathbf{P}_{\pi_2} \mathbf{r}_{\pi_3} + \cdots \\
&= \mathbf{r}_{\pi_1} + \gamma \mathbf{P}_{\pi_1} \left( \mathbf{r}_{\pi_2} + \gamma \mathbf{P}_{\pi_2} \mathbf{r}_{\pi_3} + \gamma^2 \mathbf{P}_{\pi_2} \mathbf{P}_{\pi_3} \mathbf{r}_{\pi_4} + \cdots \right).
\end{aligned}
$$

[(20)](#iZ1DRlfTX3 "Link to this Equation")

This formulation leads to a recursive relationship:

<a id="dN2u7KnaD5"></a>

$$
\begin{align*}
\mathbf{v}_\gamma^{\boldsymbol{\pi}} &= \mathbf{r}_{\pi_1} + \gamma \mathbf{P}_{\pi_1} \mathbf{v}_\gamma^{\boldsymbol{\pi}^{\prime}}\\
&=\sum_{t=1}^{\infty} \gamma^{t-1} \mathbf{P}_{\boldsymbol{\pi}}^{t-1} \mathbf{r}_{\pi_t}
\end{align*}
$$

[(21)](#dN2u7KnaD5 "Link to this Equation")

where $\boldsymbol{\pi}^{\prime} = (\pi_2, \pi_3, \ldots)$.

For a stationary policy $\boldsymbol{\pi} = \mathrm{const}(\pi)$ with constant decision rule $\pi$, the total expected reward simplifies to:

<a id="WmW1FkZFbr"></a>

$$
\begin{align*}
\mathbf{v}_\gamma^{\pi} &= \mathbf{r}_\pi+ \gamma \mathbf{P}_\pi \mathbf{v}_\gamma^{\pi} \\
&=\sum_{t=1}^{\infty} \gamma^{t-1} \mathbf{P}_\pi^{t-1} \mathbf{r}_{\pi}
\end{align*}
$$

[(22)](#WmW1FkZFbr "Link to this Equation")

This last expression is called a Neumann series expansion, and it’s guaranteed to exists under the assumptions of bounded reward and discount factor strictly less than one.

<a id="neumann-series"></a>

[Theorem 2](#neumann-series "Link to this Theorem") (Neumann Series and Invertibility)

The **spectral radius** of a matrix $\mathbf{H}$ is defined as:

<a id="Y0Jbo7XHxA"></a>

$$
\rho(\mathbf{H}) \equiv \max_{i} |\lambda_i(\mathbf{H})|
$$

[(23)](#Y0Jbo7XHxA "Link to this Equation")

where $\lambda_i(\mathbf{H})$ are the eigenvalues of $\mathbf{H}$.

**Neumann Series Existence:** For any matrix $\mathbf{H}$, the Neumann series

<a id="NK7Sht2R3c"></a>

$$
\sum_{t=0}^{\infty} \mathbf{H}^t = \mathbf{I} + \mathbf{H} + \mathbf{H}^2 + \cdots
$$

[(24)](#NK7Sht2R3c "Link to this Equation")

converges if and only if $\rho(\mathbf{H}) < 1$. When this condition holds, the matrix $(\mathbf{I} - \mathbf{H})$ is invertible and

<a id="bYTZwPLcrp"></a>

$$
(\mathbf{I} - \mathbf{H})^{-1} = \sum_{t=0}^{\infty} \mathbf{H}^t.
$$

[(25)](#bYTZwPLcrp "Link to this Equation")

Note that for any induced matrix norm $\|\cdot\|$ (i.e., a norm satisfying $\|\mathbf{H}\mathbf{v}\| \leq \|\mathbf{H}\| \cdot \|\mathbf{v}\|$ for all vectors $\mathbf{v}$) and any matrix $\mathbf{H}$, the spectral radius is bounded by:

<a id="ABHUxYdI7V"></a>

$$
\rho(\mathbf{H}) \leq \|\mathbf{H}\|.
$$

[(26)](#ABHUxYdI7V "Link to this Equation")

This inequality provides a practical way to verify the convergence condition $\rho(\mathbf{H}) < 1$ by checking the simpler condition $\|\mathbf{H}\| < 1$ rather than trying to compute the eigenvalues directly.

We can now verify that $(\mathbf{I} - \gamma \mathbf{P}_\pi)$ is invertible and the Neumann series converges.

1.  **Norm of the transition matrix:** Since $\mathbf{P}_\pi$ is a stochastic matrix (each row sums to 1 and all entries are non-negative), its $\ell_\infty$\-norm is:
    
    <a id="j0ROyFaKBw"></a>
    
    $$
    \|\mathbf{P}_\pi\| = \max_{s \in S} \sum_{j \in S} [\mathbf{P}_\pi]_{s,j} = \max_{s \in S} 1 = 1.
    $$
    
    [(27)](#j0ROyFaKBw "Link to this Equation")
    
2.  **Norm of the scaled matrix:** Using the homogeneity property of norms, we have:
    
    <a id="dK0gKjAGhC"></a>
    
    $$
    \|\gamma \mathbf{P}_\pi\| = |\gamma| \cdot \|\mathbf{P}_\pi\| = |\gamma| \cdot 1 = |\gamma|.
    $$
    
    [(28)](#dK0gKjAGhC "Link to this Equation")
    
3.  **Bounding the spectral radius:** Since the spectral radius is bounded by the matrix norm:
    
    <a id="OoWQzAb0ho"></a>
    
    $$
    \rho(\gamma \mathbf{P}_\pi) \leq \|\gamma \mathbf{P}_\pi\| = |\gamma|.
    $$
    
    [(29)](#OoWQzAb0ho "Link to this Equation")
    
4.  **Verifying convergence:** Since $0 \leq \gamma < 1$ by assumption, we have:
    
    <a id="vCM8QAdIZT"></a>
    
    $$
    \rho(\gamma \mathbf{P}_\pi) \leq |\gamma| < 1.
    $$
    
    [(30)](#vCM8QAdIZT "Link to this Equation")
    
    This strict inequality guarantees that $(\mathbf{I} - \gamma \mathbf{P}_\pi)$ is invertible and the Neumann series converges.
    

Therefore, the Neumann series expansion converges and yields:

<a id="vShtXI1uaM"></a>

$$
\mathbf{v}_\gamma^{\pi} = (\mathbf{I} - \gamma \mathbf{P}_\pi)^{-1} \mathbf{r}_\pi = \sum_{t=0}^{\infty} (\gamma \mathbf{P}_\pi)^t \mathbf{r}_\pi = \sum_{t=1}^{\infty} \gamma^{t-1} \mathbf{P}_\pi^{t-1} \mathbf{r}_\pi.
$$

[(31)](#vShtXI1uaM "Link to this Equation")

Consequently, for a stationary policy, $\mathbf{v}_\gamma^{\pi}$ can be determined as the solution to the linear equation:

<a id="XnkHLrY74s"></a>

$$
\mathbf{v} = \mathbf{r}_\pi+ \gamma \mathbf{P}_\pi\mathbf{v},
$$

[(32)](#XnkHLrY74s "Link to this Equation")

which can be rearranged to:

<a id="tnScIWA9cz"></a>

$$
(\mathbf{I} - \gamma \mathbf{P}_\pi) \mathbf{v} = \mathbf{r}_\pi.
$$

[(33)](#tnScIWA9cz "Link to this Equation")

We can also characterize $\mathbf{v}_\gamma^{\pi}$ as the solution to an operator equation. More specifically, define the transformation $\mathrm{L}_\pi$ by

<a id="ouRWAuDgAo"></a>

$$
\mathrm{L}_\pi \mathbf{v} \equiv \mathbf{r}_\pi+\gamma \mathbf{P}_\pi\mathbf{v}
$$

[(34)](#ouRWAuDgAo "Link to this Equation")

for any $\mathbf{v} \in V$. Intuitively, $\mathrm{L}_\pi$ takes a value function $\mathbf{v}$ as input and returns a new value function that combines immediate rewards ($\mathbf{r}_\pi$) with discounted future values ($\gamma \mathbf{P}_\pi\mathbf{v}$).

Note

While we often refer to $\mathrm{L}_\pi$ as a “linear operator” in the RL literature, it is technically an **affine operator** (or affine transformation), not a linear operator in the strict sense. To see why, recall that a linear operator $\mathcal{T}$ must satisfy:

1.  **Additivity:** $\mathcal{T}(\mathbf{v}_1 + \mathbf{v}_2) = \mathcal{T}(\mathbf{v}_1) + \mathcal{T}(\mathbf{v}_2)$
    
2.  **Homogeneity:** $\mathcal{T}(\alpha \mathbf{v}) = \alpha \mathcal{T}(\mathbf{v})$ for all scalars $\alpha$
    

However, $\mathrm{L}_\pi$ fails the additivity test:

<a id="Qvnz6DwGOD"></a>

$$
\mathrm{L}_\pi(\mathbf{v}_1 + \mathbf{v}_2) = \mathbf{r}_\pi + \gamma \mathbf{P}_\pi(\mathbf{v}_1 + \mathbf{v}_2) = \mathbf{r}_\pi + \gamma \mathbf{P}_\pi\mathbf{v}_1 + \gamma \mathbf{P}_\pi\mathbf{v}_2
$$

[(35)](#Qvnz6DwGOD "Link to this Equation")

while

<a id="b3gdmE2EWY"></a>

$$
\mathrm{L}_\pi(\mathbf{v}_1) + \mathrm{L}_\pi(\mathbf{v}_2) = (\mathbf{r}_\pi + \gamma \mathbf{P}_\pi\mathbf{v}_1) + (\mathbf{r}_\pi + \gamma \mathbf{P}_\pi\mathbf{v}_2) = 2\mathbf{r}_\pi + \gamma \mathbf{P}_\pi\mathbf{v}_1 + \gamma \mathbf{P}_\pi\mathbf{v}_2.
$$

[(36)](#b3gdmE2EWY "Link to this Equation")

The presence of the constant term $\mathbf{r}_\pi$ makes $\mathrm{L}_\pi$ affine rather than linear. An affine operator has the form $\mathcal{A}(\mathbf{v}) = \mathbf{b} + \mathcal{T}(\mathbf{v})$, where $\mathbf{b}$ is a constant vector and $\mathcal{T}$ is a linear operator. In our case, $\mathbf{b} = \mathbf{r}_\pi$ and $\mathcal{T}(\mathbf{v}) = \gamma \mathbf{P}_\pi\mathbf{v}$.

Despite this technical distinction, the term “linear operator” is commonly used in the reinforcement learning literature when referring to $\mathrm{L}_\pi$, following a slight abuse of terminology.

Therefore, we view $\mathrm{L}_\pi$ as an operator mapping elements of $V$ to $V$: i.e., $\mathrm{L}_\pi: V \rightarrow V$. The fact that the value function of a policy is the solution to a fixed-point equation can then be expressed with the statement:

<a id="OsvBrf6Ti2"></a>

$$
\mathbf{v}_\gamma^{\pi}=\mathrm{L}_\pi \mathbf{v}_\gamma^{\pi}.
$$

[(37)](#OsvBrf6Ti2 "Link to this Equation")

This is a **fixed-point equation**: the value function $\mathbf{v}_\gamma^{\pi}$ is a fixed point of the operator $\mathrm{L}_\pi$.

<a id="solving-operator-equations"></a>

## Solving Operator Equations

Which iterative and Newton-like methods solve a fixed point when direct matrix inversion is unavailable or inappropriate?

The operator equation we encountered in MDPs, $\mathbf{v}_\gamma^{\pi} = \mathrm{L}_\pi \mathbf{v}_\gamma^{\pi}$, is a specific instance of a more general class of problems known as operator equations. These equations appear in various fields of mathematics and applied sciences, ranging from differential equations to functional analysis.

Operator equations can take several forms, each with its own characteristics and solution methods:

1.  **Fixed Point Form**: $x = \mathrm{T}(x)$, where $\mathrm{T}: X \rightarrow X$. Common in fixed-point problems, such as our MDP equation, we seek a fixed point $x^*$ such that $x^* = \mathrm{T}(x^*)$.
    
2.  **General Operator Equation**: $\mathrm{T}(x) = y$, where $\mathrm{T}: X \rightarrow Y$. Here, $X$ and $Y$ can be different spaces. We seek an $x \in X$ that satisfies the equation for a given $y \in Y$.
    
3.  **Nonlinear Equation**: $\mathrm{T}(x) = 0$, where $\mathrm{T}: X \rightarrow Y$. A special case of the general operator equation where we seek roots or zeros of the operator.
    
4.  **Variational Inequality**: Find $x^* \in K$ such that $\langle \mathrm{T}(x^*), x - x^* \rangle \geq 0$ for all $x \in K$. Here, $K$ is a closed convex subset of $X$, and $\mathrm{T}: K \rightarrow X^*$ (the dual space of $X$). These problems often arise in optimization, game theory, and partial differential equations.
    

<a id="successive-approximation-method"></a>

### Successive Approximation Method

For equations in fixed point form, a common numerical solution method is successive approximation, also known as fixed-point iteration:

<a id="successive-approximation"></a>

[Algorithm 1](#successive-approximation "Link to this Algorithm") (Successive Approximation)

**Input:** An operator $\mathrm{T}: X \rightarrow X$, an initial guess $x_0 \in X$, and a tolerance $\epsilon > 0$  
**Output:** An approximate fixed point $x^*$ such that $\|x^* - \mathrm{T}(x^*)\| < \epsilon$

1.  Initialize $n = 0$
    
2.  **repeat**  
    3\. Compute $x_{n+1} = \mathrm{T}(x_n)$  
    4\. If $\|x_{n+1} - x_n\| < \epsilon$, **return** $x_{n+1}$  
    5\. Set $n = n + 1$
    
3.  **until** convergence or maximum iterations reached
    

The convergence of successive approximation depends on the properties of the operator $\mathrm{T}$. In the simplest and most common setting, we assume $\mathrm{T}$ is a contraction mapping. The Banach Fixed-Point Theorem then guarantees that $\mathrm{T}$ has a unique fixed point, and the successive approximation method will converge to this fixed point from any starting point. Specifically, $\mathrm{T}$ is a contraction if there exists a constant $q \in [0,1)$ such that for all $x,y \in X$:

<a id="Y4rCu7MvjR"></a>

$$
d(\mathrm{T}(x), \mathrm{T}(y)) \leq q \cdot d(x,y)
$$

[(38)](#Y4rCu7MvjR "Link to this Equation")

where $d$ is the metric on $X$. In this case, the rate of convergence is linear, with error bound:

<a id="H26mpyiSii"></a>

$$
d(x_n, x^*) \leq \frac{q^n}{1-q} d(x_1, x_0)
$$

[(39)](#H26mpyiSii "Link to this Equation")

However, the contraction mapping condition is not the only one that can lead to convergence. For instance, if $\mathrm{T}$ is nonexpansive (i.e., Lipschitz continuous with Lipschitz constant 1) and $X$ is a Banach space with certain geometrical properties (e.g., uniformly convex), then under additional conditions (e.g., $\mathrm{T}$ has at least one fixed point), the successive approximation method can still converge, albeit potentially more slowly than in the contraction case.

In practice, when dealing with specific problems like MDPs or differential equations, the properties of the operator often naturally align with one of these convergence conditions. For example, in discounted MDPs, the Bellman operator is a contraction in the supremum norm, which guarantees the convergence of value iteration.

<a id="newton-kantorovich-method"></a>

### Newton-Kantorovich Method

The Newton-Kantorovich method is a generalization of Newton’s method from finite dimensional vector spaces to infinite dimensional function spaces: rather than iterating in the space of vectors, we are iterating in the space of functions.

Newton’s method is often written as the familiar update:

<a id="kElTMSpHx0"></a>

$$
x_{k+1} = x_k - [DF(x_k)]^{-1} F(x_k),
$$

[(40)](#kElTMSpHx0 "Link to this Equation")

which makes it look as though the essence of the method is “take a derivative and invert it.” But the real workhorse behind Newton’s method (both in finite and infinite dimensions) is **linearization**.

At each step, the idea is to replace the nonlinear operator $F:X \to Y$ by a local surrogate model of the form

<a id="dOw24ZP97I"></a>

$$
F(x+h) \approx F(x) + Lh,
$$

[(41)](#dOw24ZP97I "Link to this Equation")

where $L$ is a linear map capturing how small perturbations in the input propagate to changes in the output. This is a Taylor-like expansion in Banach spaces: the role of the derivative is precisely to provide the correct notion of such a linear operator.

To find a root of $F$, we impose the condition that the surrogate vanishes at the next iterate:

<a id="IF3mKnhu6l"></a>

$$
0 = F(x+h) \approx F(x) + Lh.
$$

[(42)](#IF3mKnhu6l "Link to this Equation")

Solving this linear equation gives the increment $h$. In finite dimensions, $L$ is the Jacobian matrix; in Banach spaces, it must be the **Fréchet derivative**.

But what exactly is a Fréchet derivative in infinite dimensions? To understand this, we need to generalize the concept of derivative from finite-dimensional calculus. In infinite-dimensional spaces, there are several notions of differentiability, each with different strengths and requirements:

**1\. Gâteaux (Directional) Derivative**

We say that the Gâteaux derivative of $F$ at $x$ in a specific direction $h$ is:

<a id="oSMuFHkzD4"></a>

$$
F'(x; h) = \lim_{t \to 0} \frac{F(x + th) - F(x)}{t}
$$

[(43)](#oSMuFHkzD4 "Link to this Equation")

This quantity measures how the function $F$ changes along the ray $x + th$. While this limit may exist for each direction $h$ separately, it doesn’t guarantee that the derivative is linear in $h$. This is a key limitation: the Gâteaux derivative can exist in all directions but still fail to provide a good linear approximation.

**2\. Hadamard Directional Derivative**

Rather than considering a single direction of perturbation, we now consider a bundle of perturbations around $h$. We ask how the function changes as we approach the target direction from nearby directions. We say that $F$ has a Hadamard directional derivative if:

<a id="mApEJVMi40"></a>

$$
F'(x; h) = \lim_{\substack{t \downarrow 0 \\ h' \to h}} \frac{F(x + t h') - F(x)}{t}
$$

[(44)](#mApEJVMi40 "Link to this Equation")

This is a stronger condition than Gâteaux differentiability because it requires the limit to be uniform over nearby directions. However, it still doesn’t guarantee linearity in $h$.

**3\. Fréchet Derivative**

The strongest and most natural notion: $F$ is Fréchet differentiable at $x$ if there exists a bounded linear operator $L$ such that:

<a id="TNYwHzGFu4"></a>

$$
\lim_{h \to 0} \frac{\|F(x + h) - F(x) - Lh\|}{\|h\|} = 0
$$

[(45)](#TNYwHzGFu4 "Link to this Equation")

This definition directly addresses the inadequacy of the previous notions. Unlike Gâteaux and Hadamard derivatives, the Fréchet derivative explicitly requires the existence of a linear operator $L$ that provides a good approximation. Key properties:

-   $L$ must be **linear** in $h$ (unlike the directional derivatives above)
    
-   The approximation error is $o(\|h\|)$, uniform in all directions
    
-   This is the “true” derivative: it generalizes the Jacobian matrix to infinite dimensions
    
-   Notation: $L = F'(x)$ or $DF(x)$
    

**Relationship:**

<a id="QpykmaYzEK"></a>

$$
\text{Fréchet differentiable} \Rightarrow \text{Hadamard directionally diff.} \Rightarrow \text{Gâteaux directionally diff.}
$$

[(46)](#QpykmaYzEK "Link to this Equation")

In the context of the Newton-Kantorovich method, we work with an operator $F: X \to Y$ where both $X$ and $Y$ are Banach spaces. The Fréchet derivative $F'(x)$ is the best linear approximation of $F$ near $x$, and it’s exactly this linear operator $L$ that we use in our linearization $F(x+h) \approx F(x) + F'(x)h$.

Now apart from those mathematical technicalities, Newton-Kantorovich has in essence the same structure as that of the original Newton’s method. That is, it applies the following sequence of steps:

1.  **Linearize the Operator**: Given an approximation $x_n$, we consider the Fréchet derivative of $F$, denoted by $F'(x_n)$. This derivative is a linear operator that provides a local approximation of $F$ near $x_n$.
    
2.  **Set Up the Newton Step**: The method then solves the linearized equation for a correction $h_n$:
    
    <a id="VLbDKPBVfZ"></a>
    
    $$
    F'(x_n) h_n = -F(x_n).
    $$
    
    [(47)](#VLbDKPBVfZ "Link to this Equation")
    
    This equation represents a linear system where $h_n$ is chosen so that the linearized operator $F(x_n) + F'(x_n)h_n$ equals zero.
    
3.  **Update the Solution**: The new approximation $x_{n+1}$ is then given by:
    
    <a id="TDDauWsGRf"></a>
    
    $$
    x_{n+1} = x_n + h_n.
    $$
    
    [(48)](#TDDauWsGRf "Link to this Equation")
    
    This correction step refines $x_n$, bringing it closer to the true solution.
    
4.  **Repeat Until Convergence**: We repeat the linearization and update steps until the solution $x_n$ converges to the desired tolerance, which can be verified by checking that $\|F(x_n)\|$ is sufficiently small, or by monitoring the norm $\|x_{n+1} - x_n\|$.
    

The convergence of Newton-Kantorovich does not hinge on $F$ being a contraction over the entire domain (as it could be the case for successive approximation). The convergence properties of the Newton-Kantorovich method are as follows:

1.  **Local Convergence**: Under mild conditions (e.g., $F$ is Fréchet differentiable and $F'(x)$ is invertible near the solution), the method converges locally. This means that if the initial guess is sufficiently close to the true solution, the method will converge.
    
2.  **Global Convergence**: Global convergence is not guaranteed in general. However, under stronger conditions (e.g., $F$ is analytic and satisfies certain bounds), the method can converge globally.
    
3.  **Rate of Convergence**: When the method converges, it typically exhibits quadratic convergence. This means that the error at each step is proportional to the square of the error at the previous step:
    
    <a id="SamEEoyqZA"></a>
    
    $$
    \|x_{n+1} - x^*\| \leq C\|x_n - x^*\|^2
    $$
    
    [(49)](#SamEEoyqZA "Link to this Equation")
    
    where $x^*$ is the true solution and $C$ is some constant. This quadratic convergence is significantly faster than the linear convergence typically seen in methods like successive approximation.
    

<a id="optimality-equations-for-infinite-horizon-mdps"></a>

## Optimality Equations for Infinite-Horizon MDPs

How does actionwise maximization turn fixed-policy evaluation into the Bellman optimality equation?

Recall that in the finite-horizon setting, the optimality equations are:

<a id="i8szgiLCzU"></a>

$$
v_n(s) = \max_{a \in A_s} \left\{r(s, a) + \gamma \sum_{j \in S} p(j | s, a) v_{n+1}(j)\right\}
$$

[(50)](#i8szgiLCzU "Link to this Equation")

where $v_n(s)$ is the value function at time step $n$ for state $s$, $A_s$ is the set of actions available in state $s$, $r(s, a)$ is the reward function, $\gamma$ is the discount factor, and $p(j | s, a)$ is the transition probability from state $s$ to state $j$ given action $a$.

Intuitively, we would expect that by taking the limit of $n$ to infinity, we might get the nonlinear equations:

<a id="M7k1MY0ca6"></a>

$$
v(s) = \max_{a \in A_s} \left\{r(s, a) + \gamma \sum_{j \in S} p(j | s, a) v(j)\right\}
$$

[(51)](#M7k1MY0ca6 "Link to this Equation")

which are called the optimality equations or Bellman equations for infinite-horizon MDPs.

We can adopt an operator-theoretic perspective by defining operators on the space $V$ of bounded real-valued functions on the state space $S$. For a deterministic Markov rule $\pi \in \Pi^{MD}$, define the **policy-evaluation operator**:

<a id="sOFT1PLQ6Y"></a>

$$
(\mathsf{L}_\pi v)(s) = r(s,\pi(s)) + \gamma \sum_{j \in \mathcal{S}} p(j|s,\pi(s)) v(j)
$$

[(52)](#sOFT1PLQ6Y "Link to this Equation")

The **Bellman optimality operator** is then:

<a id="Lom6rzhJjh"></a>

$$
\mathsf{L} \mathbf{v} \equiv \max_{\pi \in \Pi^{MD}} \left\{\mathbf{r}_\pi + \gamma \mathbf{P}_\pi \mathbf{v}\right\}
$$

[(53)](#Lom6rzhJjh "Link to this Equation")

where $\Pi^{MD}$ is the set of Markov deterministic decision rules, $\mathbf{r}_\pi$ is the reward vector under decision rule $\pi$, and $\mathbf{P}_\pi$ is the transition probability matrix under decision rule $\pi$.

Note that while we write $\max_{\pi \in \Pi^{MD}}$, we do not implement the above operator by enumerating all decision rules. Rather, the fact that we compare policies based on their value functions in a componentwise fashion means that maximizing over the space of Markovian deterministic rules reduces to the following update in component form:

<a id="bFJXvmGMuy"></a>

$$
(\mathsf{L} \mathbf{v})(s) = \max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right\}
$$

[(54)](#bFJXvmGMuy "Link to this Equation")

For convenience, we define the **greedy selector** $\mathrm{Greedy}(v) \in \Pi^{MD}$ that extracts an optimal decision rule from a value function:

<a id="kDT1rKFEMt"></a>

$$
\mathrm{Greedy}(v)(s) \in \arg\max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right\}
$$

[(55)](#kDT1rKFEMt "Link to this Equation")

In Puterman’s terminology, such a greedy selector is called **$v$\-improving** (or **conserving** when it achieves the maximum). This operator will be useful for expressing algorithms succinctly:

-   **Value iteration:** $v_{k+1} = \mathsf{L} v_k$, then extract $\pi = \mathrm{Greedy}(v^*)$
    
-   **Policy iteration:** $\pi_{k+1} = \mathrm{Greedy}(v^{\pi_k})$ with $v^{\pi_k}$ solving $v = \mathrm{L}_{\pi_k}v$
    

The equivalence between these two forms can be shown mathematically, as demonstrated in the following proposition and proof.

Proposition 1

The operator $\mathsf{L}$ defined as a maximization over Markov deterministic decision rules:

<a id="ZXvgE3PEu0"></a>

$$
(\mathsf{L} \mathbf{v})(s) = \max_{\pi \in \Pi^{MD}} \left\{r(s,\pi(s)) + \gamma \sum_{j \in \mathcal{S}} p(j|s,\pi(s)) v(j)\right\}
$$

[(56)](#ZXvgE3PEu0 "Link to this Equation")

is equivalent to the componentwise maximization over actions:

<a id="sRiBaPW9hp"></a>

$$
(\mathsf{L} \mathbf{v})(s) = \max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right\}
$$

[(57)](#sRiBaPW9hp "Link to this Equation")

Proof 2

Fix $s$. Let

<a id="eM5BKmkPQb"></a>

$$
Q_v(s,a) \triangleq r(s,a)+\gamma\sum_{j}p(j\mid s,a)\,v(j).
$$

[(58)](#eM5BKmkPQb "Link to this Equation")

For any rule $\pi \in \Pi^{MD}$, we have $(\mathsf{L}_\pi v)(s)=Q_v(s,\pi(s))\le \max_{a\in\mathcal{A}_s}Q_v(s,a)$.

Taking the maximum over $\pi$ gives

<a id="CEAS2FvseN"></a>

$$
\max_{\pi\in\Pi^{MD}}(\mathsf{L}_\pi v)(s) \le \max_{a\in\mathcal{A}_s}Q_v(s,a).
$$

[(59)](#CEAS2FvseN "Link to this Equation")

Conversely, choose a **greedy selector** $\pi^v\in\Pi^{MD}$ such that for each $s$,

<a id="YB46qHqgUi"></a>

$$
\pi^v(s)\in\arg\max_{a\in\mathcal{A}_s}Q_v(s,a)
$$

[(60)](#YB46qHqgUi "Link to this Equation")

(possible since $\mathcal{A}_s$ is finite; otherwise use a measurable $\varepsilon$\-greedy selector). Then

<a id="VqBQkG1QpJ"></a>

$$
(\mathsf{L} _{\pi^v}v)(s)=Q_v(s,\pi^v(s))=\max_{a\in\mathcal{A}_s}Q_v(s,a),
$$

[(61)](#VqBQkG1QpJ "Link to this Equation")

so $\max_{\pi}(\mathsf{L}_\pi v)(s)\ge \max_{a}Q_v(s,a)$. Combining both inequalities yields equality.

<a id="algorithms-for-solving-the-optimality-equations"></a>

## Algorithms for Solving the Optimality Equations

What computational trade-off separates value iteration, policy evaluation, and policy improvement?

The optimality equations are operator equations. Therefore, we can apply general numerical methods to solve them. Applying the successive approximation method to the Bellman optimality equation yields a method known as “value iteration” in dynamic programming. A direct application of the blueprint for successive approximation yields the following algorithm:

<a id="value-iteration"></a>

[Algorithm 2](#value-iteration "Link to this Algorithm") (Value Iteration)

**Input** Given an MDP $(S, A, P, R, \gamma)$ and tolerance $\varepsilon > 0$

**Output** Compute an $\varepsilon$\-optimal value function $v$ and policy $\pi$

1.  Initialize $v_0(s) = 0$ for all $s \in S$
    
2.  $n \leftarrow 0$
    
3.  **repeat**
    
    1.  For each $s \in S$:
        
        1.  $v_{n+1}(s) \leftarrow (\mathsf{L} v_n)(s) = \max_{a \in A} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a)v_n(j)\right\}$
            
    2.  $\delta \leftarrow \|v_{n+1} - v_n\|_\infty$
        
    3.  $n \leftarrow n + 1$
        
4.  **until** $\delta < \frac{\varepsilon(1-\gamma)}{2\gamma}$
    
5.  Extract greedy policy: $\pi \leftarrow \mathrm{Greedy}(v_n)$ where
    
    <a id="XnNbPZimIG"></a>
    
    $$
    \mathrm{Greedy}(v)(s) \in \arg\max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a)v(j)\right\}
    $$
    
    [(62)](#XnNbPZimIG "Link to this Equation")
    
6.  **return** $v_n, \pi$
    

The termination criterion in this algorithm is based on a specific bound that provides guarantees on the quality of the solution. This is in contrast to supervised learning, where we often use arbitrary termination criteria based on computational budget or early stopping when the learning curve flattens. This is because establishing implementable generalization bounds in supervised learning is challenging.

However, in the dynamic programming context, we can derive various bounds that can be implemented in practice. These bounds help us terminate our procedure with a guarantee on the precision of our value function and, correspondingly, on the optimality of the resulting policy.

<a id="value-iteration-convergence"></a>

[Proposition 2](#value-iteration-convergence "Link to this Proposition") (Convergence of Value Iteration)

(Adapted from Puterman (1994) theorem 6.3.1)

Let $v_0$ be any initial value function, $\varepsilon > 0$ a desired accuracy, and let $\{v_n\}$ be the sequence of value functions generated by value iteration, i.e., $v_{n+1} = \mathsf{L} v_n$ for $n \geq 0$, where $\mathsf{L}$ is the Bellman optimality operator. Then:

1.  $v_n$ converges to the optimal value function $v^*_\gamma$,
    
2.  The algorithm terminates in finite time,
    
3.  The resulting policy $\pi_\varepsilon$ is $\varepsilon$\-optimal, and
    
4.  When the algorithm terminates, $v_{n+1}$ is within $\varepsilon/2$ of $v^*_\gamma$.
    

Proof 3

Parts 1 and 2 follow directly from the fact that $\mathsf{L}$ is a contraction mapping. Hence, by Banach’s fixed-point theorem, it has a unique fixed point (which is $v^*_\gamma$), and repeated application of $\mathsf{L}$ will converge to this fixed point. Moreover, this convergence happens at a geometric rate, which ensures that we reach the termination condition in finite time.

To show that the Bellman optimality operator $\mathsf{L}$ is a contraction mapping, we need to prove that for any two value functions $v$ and $u$:

<a id="w8YQhMXgou"></a>

$$
\|\mathsf{L} v - \mathsf{L} u\|_\infty \leq \gamma \|v - u\|_\infty
$$

[(63)](#w8YQhMXgou "Link to this Equation")

where $\gamma \in [0,1)$ is the discount factor and $\|\cdot\|_\infty$ is the supremum norm.

Let’s start by writing out the definition of $\mathsf{L} v$ and $\mathsf{L} u$:

<a id="sElYfZKbnq"></a>

$$
\begin{align*}
(\mathsf{L} v)(s) &= \max_{a \in A} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a)v(j)\right\}\\
(\mathsf{L} u)(s) &= \max_{a \in A} \left\{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a)u(j)\right\}
\end{align*}
$$

[(64)](#sElYfZKbnq "Link to this Equation")

For any state $s$, let $a_v$ be the action that achieves the maximum for $(\mathsf{L} v)(s)$, and $a_u$ be the action that achieves the maximum for $(\mathsf{L} u)(s)$. By the definition of these maximizers:

<a id="myPitM5SiA"></a>

$$
\begin{align*}
(\mathsf{L} v)(s) &\geq r(s,a_u) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a_u)v(j)\\
(\mathsf{L} u)(s) &\geq r(s,a_v) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a_v)u(j)
\end{align*}
$$

[(65)](#myPitM5SiA "Link to this Equation")

Subtracting these inequalities:

<a id="hQP07wFAe5"></a>

$$
\begin{align*}
(\mathsf{L} v)(s) - (\mathsf{L} u)(s) &\leq \gamma \sum_{j \in \mathcal{S}} p(j|s,a_v)(v(j) - u(j))\\
(\mathsf{L} u)(s) - (\mathsf{L} v)(s) &\leq \gamma \sum_{j \in \mathcal{S}} p(j|s,a_u)(u(j) - v(j))
\end{align*}
$$

[(66)](#hQP07wFAe5 "Link to this Equation")

Taking the absolute value and using the fact that $\sum_{j \in \mathcal{S}} p(j|s,a) = 1$:

<a id="ZK9VPJ2eNl"></a>

$$
|(\mathsf{L} v)(s) - (\mathsf{L} u)(s)| \leq \gamma \max_{j \in \mathcal{S}} |v(j) - u(j)| = \gamma \|v - u\|_\infty
$$

[(67)](#ZK9VPJ2eNl "Link to this Equation")

Since this holds for all $s \in \mathcal{S}$, taking the supremum over $s$ gives:

<a id="tXajjRDADo"></a>

$$
\|\mathsf{L} v - \mathsf{L} u\|_\infty \leq \gamma \|v - u\|_\infty
$$

[(68)](#tXajjRDADo "Link to this Equation")

Thus, $\mathsf{L}$ is a contraction mapping with contraction factor $\gamma$.

Now, let’s prove parts 3 and 4. Suppose the algorithm has just terminated, i.e., $\|v_{n+1} - v_n\|_\infty < \frac{\varepsilon(1-\gamma)}{2\gamma}$ for some $n$. We want to show that our current value function $v_{n+1}$ and the policy $\pi_\varepsilon$ derived from it are close to optimal.

By the triangle inequality:

<a id="m6PliS2LEz"></a>

$$
\|v^{\pi_\varepsilon}_\gamma - v^*_\gamma\|_\infty \leq \|v^{\pi_\varepsilon}_\gamma - v_{n+1}\|_\infty + \|v_{n+1} - v^*_\gamma\|_\infty
$$

[(69)](#m6PliS2LEz "Link to this Equation")

For the first term, since $v^{\pi_\varepsilon}_\gamma$ is the fixed point of $\mathrm{L}_{\pi_\varepsilon}$ and $\pi_\varepsilon$ is greedy with respect to $v_{n+1}$ (i.e., $\mathrm{L}_{\pi_\varepsilon}v_{n+1} = \mathsf{L} v_{n+1}$):

<a id="qPwiF7ftqY"></a>

$$
\begin{aligned}
\|v^{\pi_\varepsilon}_\gamma - v_{n+1}\|_\infty &= \|\mathrm{L}_{\pi_\varepsilon}v^{\pi_\varepsilon}_\gamma - v_{n+1}\|_\infty \\
&\leq \|\mathrm{L}_{\pi_\varepsilon}v^{\pi_\varepsilon}_\gamma - \mathrm{L}_{\pi_\varepsilon}v_{n+1}\|_\infty + \|\mathrm{L}_{\pi_\varepsilon}v_{n+1} - v_{n+1}\|_\infty \\
&= \|\mathrm{L}_{\pi_\varepsilon}v^{\pi_\varepsilon}_\gamma - \mathrm{L}_{\pi_\varepsilon}v_{n+1}\|_\infty + \|\mathsf{L} v_{n+1} - v_{n+1}\|_\infty \\
&\leq \gamma\|v^{\pi_\varepsilon}_\gamma - v_{n+1}\|_\infty + \gamma\|v_{n+1} - v_n\|_\infty
\end{aligned}
$$

[(70)](#qPwiF7ftqY "Link to this Equation")

where we used that both $\mathsf{L}$ and $\mathrm{L}_{\pi_\varepsilon}$ are contractions with factor $\gamma$, and that $v_{n+1} = \mathsf{L} v_n$.

Rearranging:

<a id="OWxYQPK2WN"></a>

$$
\|v^{\pi_\varepsilon}_\gamma - v_{n+1}\|_\infty \leq \frac{\gamma}{1-\gamma}\|v_{n+1} - v_n\|_\infty
$$

[(71)](#OWxYQPK2WN "Link to this Equation")

Similarly, since $v^*_\gamma$ is the fixed point of $\mathsf{L}$:

<a id="xYlHnCkJXE"></a>

$$
\|v_{n+1} - v^*_\gamma\|_\infty = \|\mathsf{L} v_n - \mathsf{L} v^*_\gamma\|_\infty \leq \gamma\|v_n - v^*_\gamma\|_\infty \leq \frac{\gamma}{1-\gamma}\|v_{n+1} - v_n\|_\infty
$$

[(72)](#xYlHnCkJXE "Link to this Equation")

Since $\|v_{n+1} - v_n\|_\infty < \frac{\varepsilon(1-\gamma)}{2\gamma}$:

<a id="yLsY5gYpQL"></a>

$$
\|v^{\pi_\varepsilon}_\gamma - v_{n+1}\|_\infty \leq \frac{\gamma}{1-\gamma} \cdot \frac{\varepsilon(1-\gamma)}{2\gamma} = \frac{\varepsilon}{2}
$$

[(73)](#yLsY5gYpQL "Link to this Equation")

<a id="ONcK7gqqVW"></a>

$$
\|v_{n+1} - v^*_\gamma\|_\infty \leq \frac{\gamma}{1-\gamma} \cdot \frac{\varepsilon(1-\gamma)}{2\gamma} = \frac{\varepsilon}{2}
$$

[(74)](#ONcK7gqqVW "Link to this Equation")

Combining these:

<a id="SWS7n3wU2J"></a>

$$
\|v^{\pi_\varepsilon}_\gamma - v^*_\gamma\|_\infty \leq \frac{\varepsilon}{2} + \frac{\varepsilon}{2} = \varepsilon
$$

[(75)](#SWS7n3wU2J "Link to this Equation")

This completes the proof, showing that $v_{n+1}$ is within $\varepsilon/2$ of $v^*_\gamma$ (part 4) and $\pi_\varepsilon$ is $\varepsilon$\-optimal (part 3).

<a id="bellman-contraction-laboratory"></a>

### Bellman contraction laboratory

Use the controls below to change the discount factor, transition persistence, reward asymmetry, and starting value. Before moving $\gamma$, predict how it will change the slope of the error envelope. The middle panel compares the observed error and Bellman residual with the contraction bound; the text below reports the final greedy policy.

<a id="fig-bellman-contraction-fallback"></a>

<a id="RchOgTUrBg"></a>
![Static Bellman contraction laboratory preview](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/b895558bb4-bellman-contraction--fbeb5146f60e3f02f63e5419f7d7b2cd.png)

[Figure 1:](#fig-bellman-contraction-fallback "Link to this figure")Static preview of value-iteration traces and a geometric contraction bound. The online book provides controls for $\gamma$, transitions, rewards, and the initial value.

<a id="exact-scheduling-mdp-for-inference-serving"></a>

## Exact Scheduling MDP for Inference Serving

How can a large request-level system be reduced to a finite MDP, and which predictive distinctions disappear in that reduction?

The inference examples have so far treated the scheduling rule as fixed and the GPU clock as the action. A different decision interface fixes the clock and asks which phase should receive the next unit of service. Prefill admits new requests into decode and consumes cache; decode advances requests already producing output tokens. Serving either phase delays the other.

An exact request-level Markov state would contain every prompt length, generated token count, cache allocation, and waiting time. For computation, these quantities are aggregated into the finite state

<a id="rX1AT56bTd"></a>

$$
s=(p,d,a)\in\{0,\ldots,6\}^2\times\{0,\ldots,4\},
$$

[(76)](#rX1AT56bTd "Link to this Equation")

where $p$ counts waiting prefill jobs, $d$ counts active decode jobs, and $a$ is the oldest prefill-age bin. The actions are

<a id="td1yPGUMbY"></a>

$$
\mathcal A=\{\text{prefill},\text{decode},\text{idle}\}.
$$

[(77)](#td1yPGUMbY "Link to this Equation")

An action is masked when its phase is empty. Prefill is also masked at $d=6$, which represents the cache limit in this abstraction. A Bernoulli arrival probability for each 0.1-second decision period is calibrated from the load-normalized version of the same five-minute Azure trace used in the modeling chapter.

The phase rates and powers come from one measured NVIDIA L4 run of Qwen/Qwen2.5-7B-Instruct served by vLLM 0.28.0. The reduced MDP uses the 1,125 MHz requested clock level; its batch-balanced median realized graphics clock was 939.375 MHz. The measured prefill rate and the trace’s mean prompt length determine the Bernoulli probability that a prefill action completes one aggregate prompt. A successful completion moves that job into decode. The measured decode rate and mean output length similarly determine one aggregate expected completion budget per decode action. That budget is shared symmetrically across the active jobs, so adding jobs does not multiply the model’s expected completion capacity. Queue counts are capped at six, and arrivals beyond that cap are recorded as drops. These choices define a complete transition matrix $P_{ss'}^u$ on 245 states.

The one-step cost assigns separate penalties to congestion, old prompt work, decode stalls, dropped requests, and energy:

<a id="dD7qImBY8x"></a>

$$
c(s,u)=p+d+4\mathbf 1\{a=4\}
+2d\mathbf 1\{u\ne\text{decode}\}
+10\mathbb E[N_{\mathrm{drop}}\mid s,u]
+0.1\frac{E(u)}{E_{\max}}.
$$

[(78)](#dD7qImBY8x "Link to this Equation")

For prefill, decode, and idle, respectively, the measured profile gives $E(u)=(6.427,6.274,2.339)$ joules per decision period. Each value is the measured phase-power summary at the requested 1,125 MHz level multiplied by 0.1 seconds, rather than a direct request-level energy measurement. Only the ratio $E(u)/E_{\max}$ enters the stage cost.

With $\gamma=0.99$, cost-minimizing value iteration applies

<a id="JcWqk1vK4S"></a>

$$
\begin{aligned}
Q_n(s,u)&=c(s,u)+\gamma\sum_{s'}P_{ss'}^uV_n(s'),\\
V_{n+1}(s)&=\min_{u\in\mathcal A(s)}Q_n(s,u).
\end{aligned}
$$

[(79)](#JcWqk1vK4S "Link to this Equation")

Iteration stops when $\lVert V_{n+1}-V_n\rVert_\infty<10^{-10}$. The final Bellman residual is checked independently and must be below 10\-8.

Policy slices compare the optimal phase decision across the two queue lengths and the age of the oldest prompt. A replay applies the resulting policy to fixed evaluation episodes and compares it with the decode-priority rule.

<a id="FlhkJarr9q"></a>

<a id="fig-inference-scheduling-dp"></a>

<a id="fig-inference-scheduling-dp-code"></a>

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
    view="scheduling",
)))
```

[Figure 2:](#fig-inference-scheduling-dp "Link to this figure")Exact value iteration on the measured-L4-calibrated inference-scheduling MDP. All five age slices yield the same rule: serve decode when a decode job is active, otherwise serve prefill, and idle only when the system is empty. The replay samples queue transitions from the reduced model at its fixed measured-profile clock; these trajectories are simulated, not direct vLLM observations.

<a id="fig-inference-scheduling-dp-outputs"></a>

Loading...

<a id="fig-inference-scheduling-dp-fallback"></a>

<a id="aDlcCXLiCe"></a>
![Static policy slices for prefill, decode, and idle actions in the reduced scheduling MDP.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/18e509432a-scheduling-8d922de8c9d6a63f10569833037c80f4.svg)

[Figure 3:](#fig-inference-scheduling-dp-fallback "Link to this figure")Policy slices at oldest-age bins zero, two, and four. The interactive version adds an age selector and controls for playing, stepping through, and scrubbing a fixed episode sampled from the reduced transition model. The queue trajectory is simulated rather than observed directly from vLLM.

The reduced scheduling MDP has the following transition parameters and value-iteration certificate. The Bellman residual applies only to this finite model.

<a id="tADTbMuZ8k"></a>

```python
import pandas as pd

dp_row = pd.read_csv("artifacts/inference_serving/metrics_dp.csv").iloc[0]
pd.DataFrame(
    {
        "value": [
            f"{dp_row['bellman_residual']:.3e}",
            f"{int(dp_row['iterations']):,}",
            dp_row["profile_status"],
            f"{dp_row['arrival_probability']:.6f}",
            f"{dp_row['prefill_completion_probability']:.6f}",
            f"{dp_row['decode_completion_probability']:.6f}",
            f"{dp_row['prefill_energy_j']:.3f}",
            f"{dp_row['decode_energy_j']:.3f}",
            f"{dp_row['idle_energy_j']:.3f}",
        ]
    },
    index=[
        "Bellman residual",
        "value-iteration sweeps",
        "profile provenance",
        "arrival probability",
        "prefill completion probability",
        "aggregate decode completion budget",
        "prefill energy (J)",
        "decode energy (J)",
        "idle energy (J)",
    ],
).rename_axis("quantity")
```

Loading...

[Download the dynamic-programming certificate (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/33cc66ffef-metrics_dp-bb1c6b4ce69fee7e33f6d5cb996bd821.csv)

Value iteration required 2,454 sweeps on this high-discount problem. Its independently recomputed Bellman residual is $9.823\times10^{-11}$, below both the 10\-8 acceptance threshold and the 10\-10 stopping tolerance. The certificate concerns the supplied 245-state transition matrix. The optimal policy serves decode whenever $d>0$, serves prefill when $d=0$ and $p>0$, and idles only in the empty state. The same rule appears in all five age slices. For this calibration, the decode-stall penalty and aggregate completion budget make the transparent decode-priority heuristic exactly optimal within the reduced model. A richer state or a different cost can produce a switching boundary instead.

The result is exact for the stated finite MDP, not for vLLM. Aggregating request ages and lengths removes distinctions that can affect head-of-line waiting and cache release. The calibrated transition kernel is stationary, the clock is fixed, temperature is absent from the state, and the action set excludes mixed prefill-decode batches. Measurements from one L4 deployment calibrate the phase rates and powers; they do not establish scheduling performance across L4 systems. The request-level replay from the earlier chapters remains a model-audit tool, not part of the optimality proof.

Inspect the scheduling MDP and value iteration

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
```

[Download the complete inference-control implementation](https://pierrelucbacon.com/rlbook/build/inference_control-4281ed415b62adfe193289f0e3dfbe27.py)

<a id="newton-kantorovich-applied-to-bellman-optimality"></a>

### Newton-Kantorovich Applied to Bellman Optimality

We now apply the Newton-Kantorovich framework to the Bellman optimality equation. Let

<a id="QQAHuzWWKD"></a>

$$
(\mathsf{L} v)(s) = \max_{a \in A(s)} \left\{ r(s,a) + \gamma \sum_{s'} p(s' \mid s,a) v(s') \right\}.
$$

[(80)](#QQAHuzWWKD "Link to this Equation")

The problem is to find $v$ such that $\mathsf{L} v = v$, or equivalently $\mathrm{B}(v) := \mathsf{L} v - v = 0$. The operator $\mathsf{L}$ is piecewise affine, hence not globally differentiable, but it is directionally differentiable everywhere in the Hadamard sense and Fréchet differentiable at points where the maximizer is unique.

We consider three complementary perspectives for understanding and computing its derivative.

<a id="perspective-1-max-of-affine-maps"></a>

#### Perspective 1: Max of Affine Maps

In tabular form, for finite state and action spaces, the Bellman operator can be written as a pointwise maximum of affine maps:

<a id="tvfvaA9GnX"></a>

$$
(\mathsf{L} v)(s) = \max_{a \in A(s)} \left\{ r(s,a) + \gamma (P_a v)(s) \right\},
$$

[(81)](#tvfvaA9GnX "Link to this Equation")

where $P_a \in \mathbb{R}^{|S| \times |S|}$ is the transition matrix associated with action $a$. Each $Q_a v := r^a + \gamma P_a v$ is affine in $v$. The operator $\mathsf{L}$ therefore computes the upper envelope of a finite set of affine functions at each state.

At any $v$, let the **active set** at state $s$ be

<a id="NbJI5WKA1V"></a>

$$
\mathcal{A}^*(s; v) := \arg\max_{a \in A(s)} (Q_a v)(s).
$$

[(82)](#NbJI5WKA1V "Link to this Equation")

Then the Hadamard directional derivative exists and is given by

<a id="oPO4DD1NZq"></a>

$$
(\mathsf{L} '(v; h))(s) = \max_{a \in \mathcal{A}^*(s; v)} \gamma (P_a h)(s).
$$

[(83)](#oPO4DD1NZq "Link to this Equation")

If the active set is a singleton, this expression becomes linear in $h$, and $\mathsf{L}$ is Fréchet differentiable at $v$, with

<a id="c0JNflgdWO"></a>

$$
\mathsf{L}'(v) = \gamma P_{\pi_v},
$$

[(84)](#c0JNflgdWO "Link to this Equation")

where $\pi_v(s) := a^*(s)$ is the greedy policy at $v$.

<a id="perspective-2-envelope-theorem"></a>

#### Perspective 2: Envelope Theorem

Consider now a value function approximated as a linear combination of basis functions:

<a id="GmjsxXU73d"></a>

$$
v_c(s) = \sum_j c_j \phi_j(s).
$$

[(85)](#GmjsxXU73d "Link to this Equation")

At a node $s_i$, define the parametric maximization

<a id="MwyP9Bmeqm"></a>

$$
v_i(c) := (\mathsf{L} v_c)(s_i) = \max_{a \in A(s_i)} \left\{ r(s_i,a) + \gamma \sum_j c_j \mathbb{E}_{s' \mid s_i, a}[\phi_j(s')] \right\}.
$$

[(86)](#MwyP9Bmeqm "Link to this Equation")

Define

<a id="d2UYIblYL3"></a>

$$
F_i(a, c) := r(s_i,a) + \gamma \sum_j c_j \mathbb{E}_{s' \mid s_i, a}[\phi_j(s')],
$$

[(87)](#d2UYIblYL3 "Link to this Equation")

so that $v_i(c) = \max_a F_i(a, c)$. Since $F_i$ is linear in $c$, we can apply the **envelope theorem** (Danskin’s theorem): if the optimizer $a_i^*(c)$ is unique or selected measurably, then

<a id="IBYQ45gpOK"></a>

$$
\frac{\partial v_i}{\partial c_j}(c) = \gamma \mathbb{E}_{s' \mid s_i, a_i^*(c)}[\phi_j(s')].
$$

[(88)](#IBYQ45gpOK "Link to this Equation")

We do not need to differentiate the optimizer $a_i^*(c)$ itself. The result extends to the subdifferential case when ties occur, where the Jacobian becomes set-valued.

This result is useful when solving the collocation equation $\Phi c = v(c)$. Newton’s method requires the Jacobian $v'(c)$, and this expression allows us to compute it without involving any derivatives of the optimal action.

<a id="perspective-3-the-implicit-function-theorem"></a>

#### Perspective 3: The Implicit Function Theorem

The third perspective applies the implicit function theorem to understand when the Bellman operator is differentiable despite containing a max operator. The maximization problem defines an implicit relationship between the value function and the optimal action, and the implicit function theorem tells us when this relationship is smooth enough to differentiate through.

The Bellman operator is defined as

<a id="WPZ2gw5WLU"></a>

$$
(\mathsf{L} v)(s) = \max_{a} \left\{ r(s,a) + \gamma \sum_j p(j \mid s,a) v(j) \right\}.
$$

[(89)](#WPZ2gw5WLU "Link to this Equation")

The difficulty is that the max operator encodes a discrete selection: which action achieves the maximum. To apply the implicit function theorem, we reformulate this as follows. For each action $a$, define the **action-value function**:

<a id="lSIooTffkP"></a>

$$
Q_a(v, s) := r(s,a) + \gamma \sum_j p(j \mid s,a) v(j).
$$

[(90)](#lSIooTffkP "Link to this Equation")

The optimal action at $v$ satisfies the **optimality condition**:

<a id="sT5QaVvo9c"></a>

$$
Q_{a^*(s)}(v, s) \geq Q_a(v, s) \quad \text{for all } a.
$$

[(91)](#sT5QaVvo9c "Link to this Equation")

Now suppose that at a particular $v$, action $a^*(s)$ is a **strict local maximizer** in the sense that there exists $\delta > 0$ such that

<a id="Xft81BYOSU"></a>

$$
Q_{a^*(s)}(v, s) > Q_a(v, s) + \delta \quad \text{for all } a \neq a^*(s).
$$

[(92)](#Xft81BYOSU "Link to this Equation")

This strict inequality is the regularity condition needed for the implicit function theorem. It ensures that the optimal action is unique at $v$ and remains so in a neighborhood of $v$.

To see why, consider any perturbation $v + h$ with $\|h\|$ small. Since $Q_a$ is linear in $v$, we have:

<a id="yFXLdukEep"></a>

$$
Q_a(v+h, s) = Q_a(v, s) + \gamma \sum_j p(j \mid s,a) h(j).
$$

[(93)](#yFXLdukEep "Link to this Equation")

The perturbation term is bounded: $|\gamma \sum_j p(j \mid s,a) h(j)| \leq \gamma \|h\|$. Therefore, for $\|h\| < \delta/\gamma$, the strict gap ensures that

<a id="BnuJ6ZFpTy"></a>

$$
Q_{a^*(s)}(v+h, s) > Q_a(v+h, s) \quad \text{for all } a \neq a^*(s).
$$

[(94)](#BnuJ6ZFpTy "Link to this Equation")

Thus $a^*(s)$ remains the unique maximizer throughout the neighborhood $\{v + h : \|h\| < \delta/\gamma\}$.

The implicit function theorem now applies: in this neighborhood, the mapping $v \mapsto a^*(s; v)$ is **constant** (and hence smooth), taking the value $a^*(s)$. This allows us to write

<a id="Lna4XbcKE0"></a>

$$
(\mathsf{L} v)(s) = Q_{a^*(s)}(v, s) = r(s,a^*(s)) + \gamma \sum_j p(j \mid s,a^*(s)) v(j)
$$

[(95)](#Lna4XbcKE0 "Link to this Equation")

as an explicit formula that holds throughout the neighborhood. Since $Q_{a^*(s)}(\cdot, s)$ is an affine (hence smooth) function of $v$, we can differentiate it:

<a id="Bbqssjb5ti"></a>

$$
\frac{d}{dv} (\mathsf{L} v)(s) = \gamma P_{a^*(s)}.
$$

[(96)](#Bbqssjb5ti "Link to this Equation")

More precisely, for any perturbation $h$:

<a id="xhe03aAwvb"></a>

$$
(\mathsf{L} (v+h))(s) = (\mathsf{L} v)(s) + \gamma \sum_j p(j \mid s,a^*(s)) h(j) + o(\|h\|).
$$

[(97)](#xhe03aAwvb "Link to this Equation")

This is the Fréchet derivative:

<a id="Z26QCQv51W"></a>

$$
\mathsf{L}'(v) = \gamma P_{\pi_v},
$$

[(98)](#Z26QCQv51W "Link to this Equation")

where $\pi_v(s) = a^*(s)$ is the greedy policy.

**The role of the implicit function theorem**: It guarantees that when the maximizer is unique with a strict gap (the regularity condition), the argmax function $v \mapsto a^*(s; v)$ is locally constant, which removes the non-differentiability of the max operator. Without this regularity condition (specifically, at points where multiple actions tie for optimality), the implicit function theorem does not apply, and the operator is not Fréchet differentiable. The active set perspective (Perspective 1) and the envelope theorem (Perspective 2) provide the tools to handle these non-smooth points.

<a id="connection-to-policy-iteration"></a>

### Connection to Policy Iteration

We return to the Newton-Kantorovich step:

<a id="wDTYv8O02D"></a>

$$
(I - \mathsf{L}'(v_n)) h_n = v_n - \mathsf{L} v_n,
\quad
v_{n+1} = v_n - h_n.
$$

[(99)](#wDTYv8O02D "Link to this Equation")

Suppose $\mathsf{L}'(v_n) = \gamma P_{\pi_{v_n}}$ for the greedy policy $\pi_{v_n}$. Then

<a id="vfOUcDAq9k"></a>

$$
(I - \gamma P_{\pi_{v_n}}) v_{n+1} = r^{\pi_{v_n}},
$$

[(100)](#vfOUcDAq9k "Link to this Equation")

which is exactly policy evaluation for $\pi_{v_n}$. Recomputing the greedy policy from $v_{n+1}$ yields the next iterate.

Thus, **policy iteration is Newton-Kantorovich** applied to the Bellman optimality equation. At points of nondifferentiability (when ties occur), the operator is still semismooth, and policy iteration corresponds to a semismooth Newton method. The envelope theorem is what justifies the simplification of the Jacobian to $\gamma P_{\pi_v}$, bypassing the need to differentiate through the optimizer. This completes the equivalence.

<a id="the-semismooth-newton-perspective"></a>

### The Semismooth Newton Perspective

The three perspectives we developed above (the active set view, the envelope theorem, and the implicit function theorem) all point toward a deeper framework for understanding Newton-type methods on non-smooth operators. This framework, known as semismooth Newton methods, was developed precisely to handle operators like the Bellman operator that are piecewise smooth but not globally differentiable. The connection between policy iteration and semismooth Newton methods has been rigorously developed in recent work [Gargiani _et al._ (2022)](https://doi.org/10.1109/LCSYS.2022.3181213).

The classical Newton-Kantorovich method assumes the operator is Fréchet differentiable everywhere. The derivative exists, is unique, and varies continuously with the base point. But the Bellman operator $\mathsf{L}$ violates this assumption at any value function where multiple actions tie for optimality at some state. At such points, the implicit function theorem fails, and there is no unique Fréchet derivative.

Semismooth Newton methods address this by replacing the notion of a single Jacobian with a generalized derivative that captures the behavior of the operator near non-smooth points. The most commonly used generalized derivative is the Clarke subdifferential, which we can think of as the convex hull of all possible “candidate Jacobians” that arise from limits approaching the non-smooth point from different directions.

For the Bellman residual $\mathrm{B}(v) = \mathsf{L} v - v$, the Clarke subdifferential at a point $v$ can be characterized explicitly using our first perspective. Recall that at each state $s$, we defined the active set $\mathcal{A}^*(s; v) = \arg\max_a Q_a(v, s)$. When this set contains multiple actions, the operator is not Fréchet differentiable. However, it remains directionally differentiable in all directions, and the Clarke subdifferential consists of all matrices of the form

<a id="l1kssccr3i"></a>

$$
\partial \mathrm{B}(v) = \left\{ I - \gamma P_\pi : \pi(s) \in \mathcal{A}^*(s; v) \text{ for all } s \right\}.
$$

[(101)](#l1kssccr3i "Link to this Equation")

In words, the generalized Jacobian is the set of all matrices $I - \gamma P_\pi$ where $\pi$ is any policy that selects an action from the active set at each state. When the maximizer is unique everywhere, this set reduces to a singleton, and we recover the classical Fréchet derivative. When ties occur, the set has multiple elements: precisely the convex combinations mentioned in Perspective 1.

The semismooth Newton method for solving $\mathrm{B}(v) = 0$ proceeds by selecting an element $J_k \in \partial \mathrm{B}(v_k)$ at each iteration and solving

<a id="JKrhzFGA1t"></a>

$$
J_k h_k = -\mathrm{B}(v_k), \quad v_{k+1} = v_k + h_k.
$$

[(102)](#JKrhzFGA1t "Link to this Equation")

What this tells us is that any choice from the Clarke subdifferential yields a valid Newton-like update. In the context of the Bellman equation, choosing $J_k = I - \gamma P_{\pi_k}$ where $\pi_k$ is any greedy policy corresponds exactly to the policy evaluation step in policy iteration. The freedom in selecting which action to choose when ties occur translates to the freedom in selecting which element of the subdifferential to use.

Under appropriate regularity conditions (specifically, when the residual function is BD-regular or CD-regular), the semismooth Newton method converges locally at a quadratic rate [Gargiani _et al._ (2022)](https://doi.org/10.1109/LCSYS.2022.3181213). This means that near the solution, the error decreases quadratically:

<a id="zjgxBCHJ0I"></a>

$$
\|v_{k+1} - v^*\| \leq C \|v_k - v^*\|^2.
$$

[(103)](#zjgxBCHJ0I "Link to this Equation")

This theoretical result explains an empirical observation that has long been noted in practice: policy iteration typically converges in very few iterations, often just a handful, even when the state and action spaces are enormous and the space of possible policies is exponentially large.

The semismooth Newton framework also suggests a spectrum of methods interpolating between value iteration and policy iteration. Value iteration can be interpreted as a Newton-like method where we choose $J_k = I$ at every iteration, ignoring the dependence of $\mathsf{L}$ on $v$ entirely. This choice guarantees global convergence through the contraction property but sacrifices the quadratic local convergence rate. Policy iteration, at the other extreme, uses the full generalized Jacobian $J_k = I - \gamma P_{\pi_k}$, achieving quadratic convergence but at the cost of solving a linear system at each iteration.

Between these extremes lie methods that use approximate Jacobians. One natural variant is to choose $J_k = \alpha I$ for some scalar $\alpha > 1$. This leads to the update

<a id="lygC7P5WVH"></a>

$$
v_{k+1} = \frac{\alpha - 1}{\alpha} v_k + \frac{1}{\alpha} \mathsf{L} v_k.
$$

[(104)](#lygC7P5WVH "Link to this Equation")

This is known as $\alpha$\-value iteration or successive over-relaxation when $\alpha > 1$. For appropriate choices of $\alpha$, this method retains global convergence while achieving better local rates than standard value iteration, and it requires only pointwise operations rather than solving a linear system. The Newton perspective thus unifies existing algorithms and generates new ones by systematically exploring different approximations to the generalized Jacobian.

The connection to semismooth Newton methods places policy iteration within a broader mathematical framework that extends far beyond dynamic programming. Semismooth Newton methods are used in optimization (for complementarity problems and variational inequalities), in PDE-constrained optimization (for problems with control constraints), and in economics (for equilibrium problems). The Bellman equation, viewed through this lens, is simply one instance of a piecewise smooth equation, and the tools developed for such equations apply directly.

<a id="policy-iteration"></a>

### Policy Iteration

While we derived policy iteration-like steps from the Newton-Kantorovich method, it’s worth examining policy iteration as a standalone algorithm, as it has been traditionally presented in the field of dynamic programming.

The policy iteration algorithm for discounted Markov decision problems is as follows:

<a id="policy-iteration-standard"></a>

[Algorithm 3](#policy-iteration-standard "Link to this Algorithm") (Policy Iteration)

**Input:** MDP $(S, A, P, R, \gamma)$ **Output:** Optimal policy $\pi^*$

1.  Initialize: $n = 0$, select an arbitrary decision rule $\pi_0 \in \Pi^{MD}$
    
2.  **repeat** 3. (Policy evaluation) Obtain $\mathbf{v}^n$ by solving:
    
    <a id="z4mDX3YIup"></a>
    
    $$
    (\mathbf{I}-\gamma \mathbf{P}_{\pi_n}) \mathbf{v} = \mathbf{r}_{\pi_n}
    $$
    
    [(105)](#z4mDX3YIup "Link to this Equation")
    
    4.  (Policy improvement) Choose $\pi_{n+1} = \mathrm{Greedy}(\mathbf{v}^n)$ where:
        
        <a id="TbxIPjCdaJ"></a>
        
        $$
        \pi_{n+1} \in \arg\max_{\pi \in \Pi^{MD}}\left\{\mathbf{r}_\pi+\gamma \mathbf{P}_\pi \mathbf{v}^n\right\}
        $$
        
        [(106)](#TbxIPjCdaJ "Link to this Equation")
        
        equivalently, for each $s$:
        
        <a id="LNkhXX1SNf"></a>
        
        $$
        \pi_{n+1}(s) \in \arg\max_{a \in \mathcal{A}_s}\left\{r(s,a)+\gamma \sum_j p(j|s,a) \mathbf{v}^n(j)\right\}
        $$
        
        [(107)](#LNkhXX1SNf "Link to this Equation")
        
        Set $\pi_{n+1} = \pi_n$ if possible.
        
    5.  If $\pi_{n+1} = \pi_n$, **return** $\pi^* = \pi_n$
        
    6.  $n = n + 1$
        
3.  **until** convergence
    

As opposed to value iteration, this algorithm produces a sequence of both deterministic Markovian decision rules $\{\pi_n\}$ and value functions $\{\mathbf{v}^n\}$. We recognize in this algorithm the linearization step of the Newton-Kantorovich procedure, which takes place here in the policy evaluation step 3 where we solve the linear system $(\mathbf{I}-\gamma \mathbf{P}_{\pi_n}) \mathbf{v} = \mathbf{r}_{\pi_n}$. In practice, this linear system could be solved either using direct methods (eg. Gaussian elimination), using simple iterative methods such as the successive approximation method for policy evaluation, or more sophisticated methods such as GMRES.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Discounting converts an infinite stream of rewards into a bounded value and makes the Bellman maps contractions in the sup norm. Value iteration applies successive approximation; policy iteration alternates a fixed-policy linear solve with greedy improvement. The inference-scheduling example also shows the price of state reduction: a smaller MDP averages over distinctions that can still affect future completions.

The hard maximum in the Bellman operator selects one action and is nondifferentiable at ties. Can the decision rule remain stochastic while the operator becomes smooth? [Smooth and regularized dynamic programming](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md) answers by placing a convex regularizer on the action distribution.

<a id="self-checks"></a>

## Self-checks

<a id="ex-dp-check-1"></a>

[Exercise 1](#ex-dp-check-1 "Link to this Exercise") (Contraction factor)

If two value functions differ by at most $\varepsilon$ in sup norm, by at most how much can their discounted Bellman updates differ?

Solution to [Exercise 1](#ex-dp-check-1)

At most $\gamma\varepsilon$. The discounted Bellman operator is a $\gamma$\-contraction in the sup norm.

<a id="ex-dp-check-2"></a>

[Exercise 2](#ex-dp-check-2 "Link to this Exercise") (Residual certificate)

Value iteration produces a Bellman residual $\|Tv-v\|_\infty=0.02$ with $\gamma=0.9$. Give the standard upper bound on $\|v-v^*\|_\infty$.

Solution to [Exercise 2](#ex-dp-check-2)

$\|v-v^*\|_\infty\leq \|Tv-v\|_\infty/(1-\gamma)=0.02/0.1=0.2$.

<a id="ex-dp-check-3"></a>

[Exercise 3](#ex-dp-check-3 "Link to this Exercise") (Evaluation versus improvement)

Which step of policy iteration requires solving a linear fixed-policy problem, and which step takes an actionwise maximum?

Solution to [Exercise 3](#ex-dp-check-3)

Policy evaluation solves $(I-\gamma P_\pi)v=r_\pi$. Policy improvement computes action values from that $v$ and chooses a greedy action in each state.

<a id="ex-dp-check-4"></a>

[Exercise 4](#ex-dp-check-4 "Link to this Exercise") (Reduced scheduling state)

Name one pair of request-level serving states that map to the same reduced state $(p,d,a)$ but can have different future completion distributions.

Solution to [Exercise 4](#ex-dp-check-4)

Two states can have the same numbers of waiting and decoding requests and the same oldest prefill-age bin while their active requests have different remaining output lengths. The reduced state discards those lengths, so its transition kernel averages over them.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Puterman1994"></a>
2.  Puterman, M. L. (1994). _Markov Decision Processes: Discrete Stochastic Dynamic Programming_. John Wiley & Sons.
<a id="cite-Gargiani2022"></a>
4.  Gargiani, M., Zanelli, A., Liao-McPherson, D., Summers, T. H., & Lygeros, J. (2022). Dynamic Programming Through the Lens of Semismooth Newton-Type Methods. _IEEE Control Systems Letters_, _6_, 2996–3001. [10.1109/LCSYS.2022.3181213](https://doi.org/10.1109/LCSYS.2022.3181213)

[

Dynamic Programming

Path-Integral Stochastic Control


](17-path-integral-stochastic-control.md)[

Dynamic Programming

Smooth and Regularized Dynamic Programming


](19-regularized-dp.md)


---

# CHAPITRE 19 — Smooth and Regularized Dynamic Programming

Section du livre : Dynamic Programming

Page originale : https://pierrelucbacon.com/rlbook/regularized-dp

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md

> **Cours de Pierre-Luc Bacon — 19.** [Page publiée](https://pierrelucbacon.com/rlbook/regularized-dp) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/19-regularized-dp.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Smooth and Regularized Dynamic Programming

<a id="skip-to-article"></a>

Infinite-horizon dynamic programming selects actions with a hard maximum. That operator is nondifferentiable at ties and produces a deterministic greedy choice. Can a modified control objective produce both a smooth Bellman operator and a stochastic optimal policy? Convex regularization supplies the link.

While the standard Bellman optimality equations use the max operator to determine the best action, an alternative formulation known as the smooth or soft Bellman optimality equations replaces this with a softmax operator. This approach originated from Rust (1987) and was later rediscovered in the context of maximum entropy inverse reinforcement learning Ziebart _et al._ (2008), which then led to soft Q-learning Haarnoja _et al._ (2017) and soft actor-critic Haarnoja _et al._ (2018), a state-of-the-art deep reinforcement learning algorithm.

In the infinite-horizon setting, the smooth Bellman optimality equations take the form:

<a id="iBQ5isxMBu"></a>

$$
v_\gamma^\star(s) = \frac{1}{\beta} \log \sum_{a \in A_s} \exp\left(\beta\left(r(s, a) + \gamma \sum_{j \in S} p(j | s, a) v_\gamma^\star(j)\right)\right)
$$

[(1)](#iBQ5isxMBu "Link to this Equation")

Adopting an operator-theoretic perspective, we can define a nonlinear operator $\mathrm{L}_\beta$ such that the smooth value function of an MDP is then the solution to the following fixed-point equation:

<a id="vJkQuSrSTV"></a>

$$
(\mathrm{L}_\beta \mathbf{v})(s) = \frac{1}{\beta} \log \sum_{a \in \mathcal{A}_s} \exp\left(\beta\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right)\right)
$$

[(2)](#vJkQuSrSTV "Link to this Equation")

As $\beta \to \infty$, $\mathrm{L}_\beta$ converges to the standard Bellman operator $\mathsf{L}$. Furthermore, it can be shown that the smooth Bellman operator is a contraction mapping in the supremum norm, and therefore has a unique fixed point. However, as opposed to the usual “hard” setting, the fixed point of $\mathrm{L}_\beta$ is associated with the value function of an optimal stochastic policy defined by the softmax distribution:

<a id="P4YB4xFaoq"></a>

$$
\pi(a|s) = \frac{\exp\left(\beta\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v_\gamma^\star(j)\right)\right)}{\sum_{a' \in \mathcal{A}_s} \exp\left(\beta\left(r(s,a') + \gamma \sum_{j \in \mathcal{S}} p(j|s,a') v_\gamma^\star(j)\right)\right)}
$$

[(3)](#P4YB4xFaoq "Link to this Equation")

Despite the confusing terminology, the above “softmax” policy is simply the smooth counterpart to the argmax operator in the original optimality equation: it acts as a soft-argmax.

This formulation is interesting for several reasons. First, smoothness is a desirable property from an optimization standpoint. Unlike $\gamma$, we view $\beta$ as a hyperparameter of our algorithm, which we can control to achieve the desired level of accuracy.

Second, while presented from an intuitive standpoint where we replace the max by the log-sum-exp (a smooth maximum) and the argmax by the softmax (a smooth argmax), this formulation can also be obtained from various other perspectives, offering theoretical tools and solution methods. For example, Rust (1987) derived this algorithm by considering a setting in which the rewards are stochastic and perturbed by a Gumbel noise variable. When considering the corresponding augmented state space and integrating the noise, we obtain smooth equations. This interpretation is leveraged by Rust for modeling purposes.

<a id="smooth-value-iteration-algorithm"></a>

### Smooth Value Iteration Algorithm

The smooth value iteration algorithm replaces the max operator in standard value iteration with the logsumexp operator. Here’s the algorithm structure:

<a id="smooth-value-iteration"></a>

[Algorithm 1](#smooth-value-iteration "Link to this Algorithm") (Smooth Value Iteration)

**Input:** MDP $(S, A, r, p, \gamma)$, inverse temperature $\beta > 0$, tolerance $\epsilon > 0$

**Output:** Approximate optimal value function $v$ and stochastic policy $\pi$

1.  Initialize $v(s) \leftarrow 0$ for all $s \in S$
    
2.  **repeat**
    
3.  $\quad \Delta \leftarrow 0$
    
4.  $\quad$ **for** each state $s \in S$ **do**
    
5.  $\quad\quad$ **for** each action $a \in A_s$ **do**
    
6.  $\quad\quad\quad q(s,a) \leftarrow r(s,a) + \gamma \sum_{j \in S} p(j|s,a) v(j)$
    
7.  $\quad\quad$ **end for**
    
8.  $\quad\quad v_{\text{new}}(s) \leftarrow \frac{1}{\beta} \log \sum_{a \in A_s} \exp(\beta \cdot q(s,a))$
    
9.  $\quad\quad \Delta \leftarrow \max(\Delta, |v_{\text{new}}(s) - v(s)|)$
    
10.  $\quad\quad v(s) \leftarrow v_{\text{new}}(s)$
     
11.  $\quad$ **end for**
     
12.  **until** $\Delta < \epsilon$
     
13.  Extract policy: **for** each state $s \in S$ **do**
     
14.  $\quad$ Compute $q(s,a)$ for all $a \in A_s$ as in lines 5-7
     
15.  $\quad \pi(a|s) \leftarrow \frac{\exp(\beta \cdot q(s,a))}{\sum_{a' \in A_s} \exp(\beta \cdot q(s,a'))}$ for all $a \in A_s$
     
16.  **end for**
     
17.  **return** $v, \pi$
     

**Differences from standard value iteration:**

-   Line 8 uses $\frac{1}{\beta} \log \sum_a \exp(\beta \cdot q(s,a))$ instead of $\max_a q(s,a)$
    
-   Line 15 extracts a stochastic policy using softmax instead of a deterministic argmax policy
    
-   As $\beta \to \infty$, the algorithm converges to standard value iteration
    
-   Lower $\beta$ values produce more stochastic policies with higher entropy
    

There is also a way to obtain this equation by starting from the energy-based formulation often used in supervised learning, in which we convert an unnormalized probability distribution into a distribution using the softmax transformation. This is essentially what Ziebart _et al._ (2008) did in their paper. Furthermore, this perspective bridges with the literature on probabilistic graphical models, in which we can now cast the problem of finding an optimal smooth policy into one of maximum likelihood estimation (an inference problem). This is the idea of control as inference, which also admits the converse - that of inference as control - used nowadays for deriving fast samples and amortized inference techniques using reinforcement learning Levine _et al._ (2018).

Finally, it’s worth noting that we can also derive this form by considering an entropy-regularized formulation in which we penalize for the entropy of our policy in the reward function term. This formulation admits a solution that coincides with the smooth Bellman equations Haarnoja _et al._ (2017).

<a id="alternative-soft-maximum-gaussian-uncertainty-weighted-aggregation"></a>

## Alternative Soft Maximum: Gaussian Uncertainty-Weighted Aggregation

Can uncertainty-dependent action weights smooth selection differently from a single global softmax temperature?

The logsumexp operator provides one way to soften the hard maximum, but alternative approaches exist. When Q-value estimates have heterogeneous uncertainty (some actions estimated more precisely than others), we can weight actions by the probability they are optimal under a Gaussian uncertainty model. D'Eramo _et al._ (2016) proposed computing weights as:

<a id="kiMtMGxIAv"></a>

$$
w_{a'} = \int_{-\infty}^{+\infty} \phi\left(\frac{x - \hat{\mu}_{a'}}{\hat{\sigma}_{a'}/\sqrt{n}}\right) \prod_{b \neq a'} \Phi\left(\frac{x - \hat{\mu}_b}{\hat{\sigma}_b/\sqrt{n}}\right) dx
$$

[(4)](#kiMtMGxIAv "Link to this Equation")

where $\hat{\mu}_{a'}$ and $\hat{\sigma}_{a'}$ are the sample mean and standard deviation of Q-value estimates, $n$ is the sample size, and $\phi$, $\Phi$ are the standard normal PDF and CDF. The soft Bellman target becomes $v(s') = \sum_{a'} w_{a'} q(s', a')$, a probability-weighted expectation rather than a hard maximum.

This differs from logsumexp in that it adapts to state-action-specific uncertainty (actions with tighter confidence intervals receive more weight), whereas logsumexp applies uniform smoothing via temperature $\beta$. The Gaussian-weighted approach requires maintaining variance estimates and computing integrals, making it more expensive than logsumexp. However, it provides a principled way to reduce overestimation bias in Q-learning while avoiding the pessimism of double Q-learning. We return to this estimator in the [simulation-based methods chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md) when discussing overestimation bias mitigation strategies.

<a id="gumbel-noise-on-the-rewards"></a>

## Gumbel Noise on the Rewards

Why does adding independent Gumbel perturbations to action rewards produce a log-sum-exp value before the perturbation is observed?

We can obtain the smooth Bellman equation by considering a setting in which we have Gumbel noise added to the reward function. This derivation provides both theoretical insight and connects to practical modeling scenarios where rewards have random perturbations.

<a id="step-1-define-the-augmented-mdp-with-gumbel-noise"></a>

### Step 1: Define the Augmented MDP with Gumbel Noise

At each time period and state $s$, we draw an **action-indexed shock vector**:

<a id="NlqXt3mXVY"></a>

$$
\boldsymbol{\epsilon}_t(s) = \big(\epsilon_t(s,a)\big)_{a \in \mathcal{A}_s}, \quad \text{where } \epsilon_t(s,a) \text{ i.i.d.} \sim \mathrm{Gumbel}(\mu_\epsilon, 1/\beta)
$$

[(5)](#NlqXt3mXVY "Link to this Equation")

These shocks are independent across time periods, states, and actions, and are independent of the MDP transition dynamics $p(\cdot | s, a)$.

The **Gumbel distribution** with location parameter $\mu$ and scale parameter $1/\beta$ has probability density function:

<a id="Rf0Lw81zGN"></a>

$$
f(x; \mu, \beta) = \beta\exp\left(-\beta(x-\mu)-\exp(-\beta(x-\mu))\right)
$$

[(6)](#Rf0Lw81zGN "Link to this Equation")

To generate a Gumbel-distributed random variable, we can use inverse transform sampling: $X = \mu - \frac{1}{\beta} \ln(-\ln(U))$ where $U$ is uniform on $(0,1)$.

Zero-Mean Shocks

To ensure the shocks have zero mean, we set $\mu_\epsilon = -\gamma_E/\beta$ where $\gamma_E \approx 0.5772$ is the Euler-Mascheroni constant. This choice eliminates an additive constant that would otherwise appear in the smooth Bellman equation. For simplicity, we will adopt this convention throughout.

We now define an **augmented MDP** with:

-   **Augmented state**: $\tilde{s} = (s, \boldsymbol{\epsilon})$ where $s \in \mathcal{S}$ and $\boldsymbol{\epsilon} \in \mathbb{R}^{|\mathcal{A}_s|}$
    
-   **Augmented reward**: $\tilde{r}(\tilde{s}, a) = r(s,a) + \epsilon(a)$
    
-   **Augmented transition**: $\tilde{p}(\tilde{s}' | \tilde{s}, a) = p(s' | s, a) \cdot p(\boldsymbol{\epsilon}')$
    

The transition factorizes because the next shock vector $\boldsymbol{\epsilon}'$ is drawn independently of the current state and action (conditional independence).

The Augmented State Space is Infinite-Dimensional

Even if the original state space $\mathcal{S}$ and action space $\mathcal{A}$ are finite, the augmented state space $\tilde{\mathcal{S}} = \mathcal{S} \times \mathbb{R}^{|\mathcal{A}|}$ is **uncountably infinite** because each shock vector $\boldsymbol{\epsilon}$ is a continuous random variable. Therefore:

-   We cannot enumerate the augmented states
    
-   Tabular dynamic programming methods do not apply directly
    
-   The augmented value function $\tilde{v}(s, \boldsymbol{\epsilon})$ maps a continuous space to $\mathbb{R}$
    

**This motivates why we immediately marginalize over the shocks** to obtain a finite-dimensional representation.

<a id="step-2-the-hard-bellman-equation-on-the-augmented-state-space"></a>

### Step 2: The Hard Bellman Equation on the Augmented State Space

The Bellman optimality equation for the augmented MDP is:

<a id="MQ61nH09Rp"></a>

$$
\tilde{v}(s, \boldsymbol{\epsilon}) = \max_{a \in \mathcal{A}_s} \left\{ r(s,a) + \epsilon(a) + \gamma \mathbb{E}_{s', \boldsymbol{\epsilon}'}\left[\tilde{v}(s', \boldsymbol{\epsilon}') \mid s, a\right] \right\}
$$

[(7)](#MQ61nH09Rp "Link to this Equation")

Here the expectation is over the **next augmented state** $(s', \boldsymbol{\epsilon}')$, which includes both the next state $s' \sim p(\cdot | s, a)$ and the next shock vector $\boldsymbol{\epsilon}' \sim p(\cdot)$.

This is a perfectly well-defined Bellman equation, and an optimal stationary policy exists:

<a id="ogL1h7ulKp"></a>

$$
\pi(s, \boldsymbol{\epsilon}) \in \operatorname{argmax}_{a \in \mathcal{A}_s} \left\{ r(s,a) + \epsilon(a) + \gamma \mathbb{E}_{s', \boldsymbol{\epsilon}'}\left[\tilde{v}(s', \boldsymbol{\epsilon}') \mid s, a\right] \right\}
$$

[(8)](#ogL1h7ulKp "Link to this Equation")

However, this equation is **computationally intractable** because:

-   The state space is continuous and infinite-dimensional
    
-   The shocks are fresh each period
    
-   We would need to solve for $\tilde{v}$ over an uncountable domain
    

**We never solve this equation directly.** Instead, we use it as a mathematical device to derive the smooth Bellman equation.

<a id="step-3-define-the-ex-ante-inclusive-value-function"></a>

### Step 3: Define the Ex-Ante (Inclusive) Value Function

The idea here is to consider the **expected value before observing the current shocks**. We define what some authors in econometrics call the **inclusive value** or **ex-ante value**:

<a id="DMVU27ZsNe"></a>

$$
v(s) := \mathbb{E}_{\boldsymbol{\epsilon}}\big[\tilde{v}(s, \boldsymbol{\epsilon})\big]
$$

[(9)](#DMVU27ZsNe "Link to this Equation")

This is the value of being in state $s$ **before** we observe the current-period shock vector $\boldsymbol{\epsilon}$.

Two Different Value Functions

It is crucial to distinguish:

-   $\tilde{v}(s, \boldsymbol{\epsilon})$: the value **after** observing shocks (conditional on $\boldsymbol{\epsilon}$), defined on the augmented state space
    
-   $v(s)$: the value **before** observing shocks (marginalizing over $\boldsymbol{\epsilon}$), defined on the original state space
    

The function $v(s)$ is what we actually compute and care about. The augmented value $\tilde{v}$ exists only as a proof device.

<a id="step-4-separate-the-deterministic-and-random-components"></a>

### Step 4: Separate the Deterministic and Random Components

Now we take the expectation of the augmented Bellman equation with respect to the **current shocks only** (everything that does not depend on the current $\boldsymbol{\epsilon}$ can be pulled out).

First, note that by the law of iterated expectations and independence of shocks across time:

<a id="wUjrEWGTsw"></a>

$$
\mathbb{E}_{\boldsymbol{\epsilon}'}\big[\tilde{v}(s', \boldsymbol{\epsilon}')\big] = v(s')
$$

[(10)](#wUjrEWGTsw "Link to this Equation")

This follows from our definition of $v$ and the fact that the next shock is independent of everything else.

Now define the **deterministic part** of the right-hand side:

<a id="G5TeEEKx6j"></a>

$$
x_a(s) := r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)
$$

[(11)](#G5TeEEKx6j "Link to this Equation")

This is the expected return from taking action $a$ in state $s$ **without the shock**. Using this notation, the augmented Bellman equation becomes:

<a id="Bz9y94O1FK"></a>

$$
\tilde{v}(s, \boldsymbol{\epsilon}) = \max_{a \in \mathcal{A}_s} \left\{ x_a(s) + \epsilon(a) \right\}
$$

[(12)](#Bz9y94O1FK "Link to this Equation")

Taking the expectation over $\boldsymbol{\epsilon}$ on both sides:

<a id="KmzpgEAYrY"></a>

$$
v(s) = \mathbb{E}_{\boldsymbol{\epsilon}}\left[\max_{a \in \mathcal{A}_s} \left\{ x_a(s) + \epsilon(a) \right\}\right]
$$

[(13)](#KmzpgEAYrY "Link to this Equation")

Expectation of a Max, Not Max of an Expectation

Notice carefully: we have $\mathbb{E}[\max(\cdot)]$, **not** $\max \mathbb{E}[\cdot]$. We are **not** swapping max and expectation.

The expression $\mathbb{E}_{\boldsymbol{\epsilon}}[\max_a \{x_a + \epsilon(a)\}]$ is the expected value of the maximum of Gumbel-perturbed utilities. The Gumbel random utility identity evaluates this quantity in closed form.

<a id="step-5-apply-the-gumbel-random-utility-identity"></a>

### Step 5: Apply the Gumbel Random Utility Identity

We now invoke a result from extreme value theory:

<a id="gumbel-random-utility"></a>

[Lemma 1](#gumbel-random-utility "Link to this Lemma") (Gumbel Random Utility Identity)

Let $\epsilon_1, \ldots, \epsilon_m$ be i.i.d. $\mathrm{Gumbel}(\mu_\epsilon, 1/\beta)$ random variables. For any deterministic values $x_1, \ldots, x_m \in \mathbb{R}$:

<a id="u1JekXAV58"></a>

$$
\max_{i=1,\ldots,m} \{x_i + \epsilon_i\} \overset{d}{=} \frac{1}{\beta} \log \sum_{i=1}^m \exp(\beta x_i) + \zeta
$$

[(14)](#u1JekXAV58 "Link to this Equation")

where $\zeta \sim \mathrm{Gumbel}(\mu_\epsilon, 1/\beta)$ (same distribution as the original shocks).

Taking expectations:

<a id="rJHkSF43eJ"></a>

$$
\mathbb{E}\left[\max_{i=1,\ldots,m} \{x_i + \epsilon_i\}\right] = \frac{1}{\beta} \log \sum_{i=1}^m \exp(\beta x_i) + \mu_\epsilon + \frac{\gamma_E}{\beta}
$$

[(15)](#rJHkSF43eJ "Link to this Equation")

where $\gamma_E \approx 0.5772$ is the Euler-Mascheroni constant.

**With mean-zero shocks** ($\mu_\epsilon = -\gamma_E/\beta$), the constant term vanishes:

<a id="h5NE5HVisl"></a>

$$
\mathbb{E}\left[\max_{i=1,\ldots,m} \{x_i + \epsilon_i\}\right] = \frac{1}{\beta} \log \sum_{i=1}^m \exp(\beta x_i)
$$

[(16)](#h5NE5HVisl "Link to this Equation")

Applying this identity to our problem (with mean-zero shocks):

<a id="rqRamH3cXx"></a>

$$
v(s) = \mathbb{E}_{\boldsymbol{\epsilon}}\left[\max_{a \in \mathcal{A}_s} \{x_a(s) + \epsilon(a)\}\right] = \frac{1}{\beta} \log \sum_{a \in \mathcal{A}_s} \exp(\beta x_a(s))
$$

[(17)](#rqRamH3cXx "Link to this Equation")

Substituting the definition of $x_a(s)$:

<a id="YFhNt4YG3i"></a>

$$
v(s) = \frac{1}{\beta} \log \sum_{a \in \mathcal{A}_s} \exp\left(\beta\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right)\right)
$$

[(18)](#YFhNt4YG3i "Link to this Equation")

We have arrived at the **smooth Bellman equation**.

<a id="step-6-summary-of-the-derivation"></a>

### Step 6: Summary of the Derivation

To recap the logical flow:

1.  We constructed an augmented MDP with state $(s, \boldsymbol{\epsilon})$ where shocks perturb rewards
    
2.  We wrote the standard Bellman equation for this augmented MDP (hard max, but over an infinite-dimensional state space)
    
3.  We defined the ex-ante value $v(s) = \mathbb{E}_{\boldsymbol{\epsilon}}[\tilde{v}(s, \boldsymbol{\epsilon})]$ to eliminate the continuous shock component
    
4.  We separated deterministic and random terms: $\tilde{v}(s, \boldsymbol{\epsilon}) = \max_a \{x_a(s) + \epsilon(a)\}$
    
5.  We applied the Gumbel identity to evaluate $\mathbb{E}_{\boldsymbol{\epsilon}}[\max_a \{\cdots\}]$ in closed form as a log-sum-exp
    

The augmented MDP with shocks exists **only as a mathematical device**. We never approximate $\tilde{v}$, never discretize $\boldsymbol{\epsilon}$, and never enumerate the augmented state space. The only computational object we work with is $v(s)$ on the original (finite) state space, which satisfies the smooth Bellman equation.

<a id="deriving-the-optimal-smooth-policy"></a>

### Deriving the Optimal Smooth Policy

Now that we have derived the smooth value function, we can also obtain the corresponding optimal policy. The question is: **what policy should we follow in the original MDP (without explicitly conditioning on shocks)?**

In the augmented MDP, the optimal policy is deterministic but depends on the shock realization:

<a id="YDDwolY1lQ"></a>

$$
\pi(s, \boldsymbol{\epsilon}) \in \operatorname{argmax}_{a \in \mathcal{A}_s} \left\{ r(s,a) + \epsilon(a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j) \right\}
$$

[(19)](#YDDwolY1lQ "Link to this Equation")

However, we want a policy for the **original** state space $s$ (not the augmented state). We obtain this by **marginalizing over the current shocks**, essentially asking: “what is the probability that action $a$ is optimal when we average over all possible shock realizations?”

Define an indicator function:

<a id="q6eZgBIxb8"></a>

$$
I_a(\boldsymbol{\epsilon}) = \begin{cases} 
   1 & \text{if } a \in \operatorname{argmax}_{a' \in \mathcal{A}_s} \left\{ x_{a'}(s) + \epsilon(a') \right\} \\
   0 & \text{otherwise}
   \end{cases}
$$

[(20)](#q6eZgBIxb8 "Link to this Equation")

where $x_a(s) = r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)$ as before.

The ex-ante probability that action $a$ is optimal at state $s$ is:

<a id="QjKnfLKrcD"></a>

$$
\pi(a|s) = \mathbb{E}_{\boldsymbol{\epsilon}}[I_a(\boldsymbol{\epsilon})] = \mathbb{P}_{\boldsymbol{\epsilon}}\left(a \in \operatorname{argmax}_{a'} \left\{ x_{a'}(s) + \epsilon(a') \right\}\right)
$$

[(21)](#QjKnfLKrcD "Link to this Equation")

This is the probability that action $a$ achieves the maximum when utilities are perturbed by Gumbel noise.

<a id="gumbel-softmax"></a>

[Lemma 2](#gumbel-softmax "Link to this Lemma") (Gumbel-Max Probability (Softmax))

Let $\epsilon_1, \ldots, \epsilon_m$ be i.i.d. $\mathrm{Gumbel}(\mu_\epsilon, 1/\beta)$ random variables. For any deterministic values $x_1, \ldots, x_m \in \mathbb{R}$, the probability that index $i$ achieves the maximum is:

<a id="Az7WmC0f55"></a>

$$
\mathbb{P}\left(i \in \operatorname{argmax}_j \{x_j + \epsilon_j\}\right) = \frac{\exp(\beta x_i)}{\sum_{j=1}^m \exp(\beta x_j)}
$$

[(22)](#Az7WmC0f55 "Link to this Equation")

This holds regardless of the location parameter $\mu_\epsilon$.

Applying this result to our problem:

<a id="Wc36PSnRty"></a>

$$
\pi(a|s) = \frac{\exp\left(\beta x_a(s)\right)}{\sum_{a' \in \mathcal{A}_s} \exp\left(\beta x_{a'}(s)\right)} = \frac{\exp\left(\beta\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a)v(j)\right)\right)}{\sum_{a' \in \mathcal{A}_s} \exp\left(\beta\left(r(s,a') + \gamma \sum_{j \in \mathcal{S}} p(j|s,a')v(j)\right)\right)}
$$

[(23)](#Wc36PSnRty "Link to this Equation")

This is the **softmax policy** or **Gibbs/Boltzmann policy** with inverse temperature $\beta$.

**Properties:**

-   As $\beta \to \infty$: the policy becomes deterministic, concentrating on the action(s) with highest $x_a(s)$ (recovers standard greedy policy)
    
-   As $\beta \to 0$: the policy becomes uniform over all actions (maximum entropy)
    
-   For finite $\beta > 0$: the policy is stochastic, with probability mass proportional to exponentiated Q-values
    

This completes the derivation: the smooth Bellman equation yields a value function $v(s)$, and the corresponding optimal policy is the softmax over Q-values.

<a id="regularized-markov-decision-processes"></a>

## Regularized Markov Decision Processes

Which convex penalty on action distributions generates a desired smooth maximum through conjugate duality?

Regularized MDPs [Geist _et al._ (2019)](https://proceedings.mlr.press/v97/geist19a.html) provide another perspective on how the smooth Bellman equations come to be. This framework offers a more general approach in which we seek to find optimal policies under the infinite horizon criterion while also accounting for a regularizer that influences the kind of policies we try to obtain.

Let’s set up some necessary notation. First, recall that the policy evaluation operator for a stationary policy with decision rule $\pi$ is defined as:

<a id="he8LG8deRH"></a>

$$
\mathsf{L}_\pi \mathbf{v} = \mathbf{r}_\pi + \gamma \mathbf{P}_\pi \mathbf{v}
$$

[(24)](#he8LG8deRH "Link to this Equation")

where $\mathbf{r}_\pi$ is the expected reward vector under policy $\pi$, $\gamma$ is the discount factor, and $\mathbf{P}_\pi$ is the state transition probability matrix under $\pi$. A complementary object to the value function is the q-function (or Q-factor) representation:

<a id="nAuYgoxGU0"></a>

$$
\begin{align*}
q_\gamma^{\pi}(s, a) &= r(s, a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v_\gamma^{\pi}(j) \\
v_\gamma^{\pi}(s) &= \sum_{a \in \mathcal{A}_s} \pi(a | s) q_\gamma^{\pi}(s, a) 
\end{align*}
$$

[(25)](#nAuYgoxGU0 "Link to this Equation")

The policy evaluation operator can then be written in terms of the q-function as:

<a id="RwilOUHzna"></a>

$$
[\mathsf{L}_\pi v](s) = \langle \pi(\cdot | s), q(s, \cdot) \rangle
$$

[(26)](#RwilOUHzna "Link to this Equation")

<a id="legendre-fenchel-transform"></a>

### Legendre-Fenchel Transform

The workhorse behind the theory of regularized MDPs is the Legendre-Fenchel transform, also known as the convex conjugate. For a strongly convex function $\Omega: \Delta_{\mathcal{A}} \rightarrow \mathbb{R}$, its Legendre-Fenchel transform $\Omega^*: \mathbb{R}^{\mathcal{A}} \rightarrow \mathbb{R}$ is defined as:

<a id="AVRCLvM4zZ"></a>

$$
\Omega^*(q(s, \cdot)) = \max_{\pi(\cdot|s) \in \Delta_{\mathcal{A}}} \langle \pi(\cdot | s), q(s, \cdot) \rangle - \Omega(\pi(\cdot | s))
$$

[(27)](#AVRCLvM4zZ "Link to this Equation")

An important property of this transform is that it has a unique maximizing argument, given by the gradient of $\Omega^*$. This gradient is Lipschitz and satisfies:

<a id="eUVphlwT4g"></a>

$$
\nabla \Omega^*(q(s, \cdot)) = \arg\max_\pi \langle \pi(\cdot | s), q(s, \cdot) \rangle - \Omega(\pi(\cdot | s))
$$

[(28)](#eUVphlwT4g "Link to this Equation")

An important example of a regularizer is the negative entropy, which gives rise to the smooth Bellman equations as we are about to see.

<a id="regularized-bellman-operators"></a>

## Regularized Bellman Operators

How do the regularizer and its convex conjugate alter Bellman evaluation, policy improvement, and their contraction properties?

With these concepts in place, we can now define the regularized Bellman operators:

1.  **Regularized Policy Evaluation Operator** $(\mathrm{L}_{\pi,\Omega})$:
    
    <a id="VcyNcO57gH"></a>
    
    $$
    [\mathrm{L}_{\pi,\Omega} v](s) = \langle q(s,\cdot), \pi(\cdot | s) \rangle - \Omega(\pi(\cdot | s))
    $$
    
    [(29)](#VcyNcO57gH "Link to this Equation")
    
2.  **Regularized Bellman Optimality Operator** $(\mathrm{L}_\Omega)$:
    
    <a id="VlUA2B1cYW"></a>
    
    $$
    [\mathrm{L}_\Omega v](s) = [\max_\pi \mathrm{L}_{\pi,\Omega} v ](s) = \Omega^*(q(s, \cdot))
    $$
    
    [(30)](#VlUA2B1cYW "Link to this Equation")
    

It can be shown that the addition of a regularizer in these regularized operators still preserves the contraction properties, and therefore the existence of a solution to the optimality equations and the convergence of successive approximation.

The regularized value function of a stationary policy with decision rule $\pi$, denoted by $v_{\pi,\Omega}$, is the unique fixed point of the operator equation:

<a id="U71z9nzoWU"></a>

$$
\text{find $v$ such that } \enspace v = \mathrm{L}_{\pi,\Omega} v
$$

[(31)](#U71z9nzoWU "Link to this Equation")

Under the usual assumptions on the discount factor and the boundedness of the reward, the value of a policy can also be found in closed form by solving for $\mathbf{v}$ in the linear system of equations:

<a id="lNbO6tg4K1"></a>

$$
(\mathbf{I} - \gamma \mathbf{P}_\pi) \mathbf{v} =  \mathbf{r}_\pi - \boldsymbol{\Omega}_\pi
$$

[(32)](#lNbO6tg4K1 "Link to this Equation")

where $[\boldsymbol{\Omega}_\pi](s) = \Omega(\pi(\cdot|s))$ is the vector of regularization terms at each state.

The associated state-action value function $q_{\pi,\Omega}$ is given by:

<a id="n8UAewiI7X"></a>

$$
\begin{align*}
q_{\pi,\Omega}(s, a) &= r(s, a) + \sum_{j \in \mathcal{S}} \gamma p(j|s,a) v_{\pi,\Omega}(j) \\
v_{\pi,\Omega}(s) &= \sum_{a \in \mathcal{A}_s} \pi(a | s) q_{\pi,\Omega}(s, a) - \Omega(\pi(\cdot | s))
\end{align*}
$$

[(33)](#n8UAewiI7X "Link to this Equation")

The regularized optimal value function $v^*_\Omega$ is then the unique fixed point of $\mathrm{L}_\Omega$ in the fixed point equation:

<a id="lLvcmtM4cq"></a>

$$
\text{find $v$ such that } v = \mathrm{L}_\Omega v
$$

[(34)](#lLvcmtM4cq "Link to this Equation")

The associated state-action value function $q^*_\Omega$ is given by:

<a id="kfshyJMVau"></a>

$$
\begin{align*}
q^*_\Omega(s, a) &= r(s, a) + \sum_{j \in \mathcal{S}} \gamma p(j|s,a) v^*_\Omega(j) \\
v^*_\Omega(s) &= \Omega^*(q^*_\Omega(s, \cdot))\end{align*}
$$

[(35)](#kfshyJMVau "Link to this Equation")

An important result in the theory of regularized MDPs is that there exists a unique optimal regularized policy. Specifically, if $\pi^*_\Omega$ is a conserving decision rule (i.e., $\pi^*_\Omega = \arg\max_\pi \mathrm{L}_{\pi,\Omega} v^*_\Omega$), then the randomized stationary policy $\boldsymbol{\pi} = \mathrm{const}(\pi^*_\Omega)$ is the unique optimal regularized policy.

In practice, once we have found $v^*_\Omega$, we can derive the optimal decision rule by taking the gradient of the convex conjugate evaluated at the optimal action-value function:

<a id="Rl9mTAOeYK"></a>

$$
\pi^*(\cdot | s) = \nabla \Omega^*(q^*_\Omega(s, \cdot))
$$

[(36)](#Rl9mTAOeYK "Link to this Equation")

<a id="recovering-the-smooth-bellman-equations"></a>

### Recovering the Smooth Bellman Equations

Under this framework, we can recover the smooth Bellman equations by choosing $\Omega$ to be the negative entropy, and obtain the softmax policy as the gradient of the convex conjugate. Let’s show this explicitly:

1.  Using the negative entropy regularizer:
    
    <a id="eIEHg8S3VN"></a>
    
    $$
    \Omega(d(\cdot|s)) = \sum_{a \in \mathcal{A}_s} d(a|s) \ln d(a|s)
    $$
    
    [(37)](#eIEHg8S3VN "Link to this Equation")
    
2.  The convex conjugate:
    
    <a id="KH8ObrJHoP"></a>
    
    $$
    \Omega^*(q(s, \cdot)) = \ln \sum_{a \in \mathcal{A}_s} \exp q(s,a)
    $$
    
    [(38)](#KH8ObrJHoP "Link to this Equation")
    
3.  Now, let’s write out the regularized Bellman optimality equation:
    
    <a id="uegPIWynGi"></a>
    
    $$
    v^*_\Omega(s) = \Omega^*(q^*_\Omega(s, \cdot))
    $$
    
    [(39)](#uegPIWynGi "Link to this Equation")
    
4.  Substituting the expressions for $\Omega^*$ and $q^*_\Omega$:
    
    <a id="jflpS39dMZ"></a>
    
    $$
    v^*_\Omega(s) = \ln \sum_{a \in \mathcal{A}_s} \exp \left(r(s, a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v^*_\Omega(j)\right)
    $$
    
    [(40)](#jflpS39dMZ "Link to this Equation")
    

This matches the form of the smooth Bellman equation we derived earlier, with the log-sum-exp operation replacing the max operation of the standard Bellman equation.

Furthermore, the optimal policy is given by the gradient of $\Omega^*$:

<a id="d97Kon5F7Z"></a>

$$
d^*(a|s) = \nabla \Omega^*(q^*_\Omega(s, \cdot)) = \frac{\exp(q^*_\Omega(s,a))}{\sum_{a' \in \mathcal{A}_s} \exp(q^*_\Omega(s,a'))}
$$

[(41)](#d97Kon5F7Z "Link to this Equation")

This is the familiar softmax policy we encountered in the smooth MDP setting.

<a id="smooth-policy-iteration-algorithm"></a>

### Smooth Policy Iteration Algorithm

Now that we’ve seen how the regularized MDP framework leads to smooth Bellman equations, we present smooth policy iteration. Unlike value iteration which directly iterates the Bellman operator, policy iteration alternates between policy evaluation and policy improvement steps.

<a id="smooth-policy-evaluation"></a>

[Algorithm 2](#smooth-policy-evaluation "Link to this Algorithm") (Smooth Policy Evaluation)

**Input:** MDP $(S, A, r, p, \gamma)$, policy $\pi$, inverse temperature $\beta > 0$, tolerance $\epsilon > 0$

**Output:** Value function $v^\pi$ for policy $\pi$

1.  Initialize $v(s) \leftarrow 0$ for all $s \in S$
    
2.  Set $\alpha \leftarrow 1/\beta$
    
3.  **repeat**
    
4.  $\quad \Delta \leftarrow 0$
    
5.  $\quad$ **for** each state $s \in S$ **do**
    
6.  $\quad\quad v_{\text{old}} \leftarrow v(s)$
    
7.  $\quad\quad$ **for** each action $a \in A_s$ **do**
    
8.  $\quad\quad\quad q(s,a) \leftarrow r(s,a) + \gamma \sum_{j \in S} p(j|s,a) v(j)$
    
9.  $\quad\quad$ **end for**
    
10.  $\quad\quad$ Compute expected Q-value: $\bar{q} \leftarrow \sum_{a \in A_s} \pi(a|s) \cdot q(s,a)$
     
11.  $\quad\quad$ Compute policy entropy: $H \leftarrow -\sum_{a \in A_s} \pi(a|s) \log \pi(a|s)$
     
12.  $\quad\quad v(s) \leftarrow \bar{q} + \alpha H$
     
13.  $\quad\quad \Delta \leftarrow \max(\Delta, |v(s) - v_{\text{old}}|)$
     
14.  $\quad$ **end for**
     
15.  **until** $\Delta < \epsilon$
     
16.  **return** $v$
     

<a id="policy-iteration-smooth"></a>

[Algorithm 3](#policy-iteration-smooth "Link to this Algorithm") (Smooth Policy Iteration)

**Input:** MDP $(S, A, r, p, \gamma)$, inverse temperature $\beta > 0$, tolerance $\epsilon > 0$

**Output:** Approximate optimal value function $v$ and stochastic policy $\pi$

1.  Initialize $\pi(a|s) \leftarrow 1/|A_s|$ for all $s \in S, a \in A_s$ (uniform policy)
    
2.  **repeat**
    
3.  $\quad$ **Policy Evaluation:**
    
4.  $\quad\quad$ $v \leftarrow$ SmoothPolicyEvaluation($S, A, r, p, \gamma, \pi, \beta, \epsilon$)
    
5.  $\quad$ **Policy Improvement:**
    
6.  $\quad$ policy\_stable $\leftarrow$ true
    
7.  $\quad$ **for** each state $s \in S$ **do**
    
8.  $\quad\quad \pi_{\text{old}}(\cdot|s) \leftarrow \pi(\cdot|s)$
    
9.  $\quad\quad$ **for** each action $a \in A_s$ **do**
    
10.  $\quad\quad\quad q(s,a) \leftarrow r(s,a) + \gamma \sum_{j \in S} p(j|s,a) v(j)$
     
11.  $\quad\quad$ **end for**
     
12.  $\quad\quad$ **for** each action $a \in A_s$ **do**
     
13.  $\quad\quad\quad \pi(a|s) \leftarrow \frac{\exp(\beta \cdot q(s,a))}{\sum_{a' \in A_s} \exp(\beta \cdot q(s,a'))}$
     
14.  $\quad\quad$ **end for**
     
15.  $\quad\quad$ **if** $\|\pi(\cdot|s) - \pi_{\text{old}}(\cdot|s)\| > \epsilon$ **then**
     
16.  $\quad\quad\quad$ policy\_stable $\leftarrow$ false
     
17.  $\quad\quad$ **end if**
     
18.  $\quad$ **end for**
     
19.  **until** policy\_stable
     
20.  **return** $v, \pi$
     

**Key properties of smooth policy iteration:**

1.  **Entropy-regularized evaluation**: The policy evaluation step (line 12 of [Algorithm 2](#smooth-policy-evaluation)) accounts for the entropy bonus $\alpha H(\pi(\cdot|s))$ where $\alpha = 1/\beta$
    
2.  **Stochastic policy improvement**: The policy improvement step (lines 12-14 of [Algorithm 3](#policy-iteration-smooth)) uses softmax instead of deterministic argmax, producing a stochastic policy
    
3.  **Temperature parameter**:
    
    -   Higher $\beta$ produces policies closer to deterministic (lower entropy)
        
    -   Lower $\beta$ produces more stochastic policies (higher entropy)
        
    -   As $\beta \to \infty$, the method recovers standard policy iteration
        
4.  **Convergence**: Like standard policy iteration, this algorithm converges to the unique optimal regularized value function and policy
    

<a id="equivalence-between-smooth-bellman-equations-and-entropy-regularized-mdps"></a>

### Equivalence Between Smooth Bellman Equations and Entropy-Regularized MDPs

We have now seen two distinct ways to arrive at smooth Bellman equations. Earlier in this chapter, we introduced the logsumexp operator as a smooth approximation to the max operator, motivated by analytical tractability and the desire for differentiability. Just now, we derived the same equations through the lens of regularized MDPs, where we explicitly penalize the entropy of policies. These two perspectives are mathematically equivalent: solving the smooth Bellman equation with inverse temperature parameter $\beta$ yields exactly the same optimal value function and optimal policy as solving the entropy-regularized MDP with regularization strength $\alpha = 1/\beta$. The two formulations are not merely similar. They describe identical optimization problems.

To see this equivalence clearly, consider the standard MDP problem with rewards $r(s,a)$ and transition probabilities $p(j|s,a)$. The regularized MDP framework tells us to solve:

<a id="b3wI1GjD8h"></a>

$$
\max_\pi \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t r(s_t, a_t) \right] + \alpha \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t H(\pi(\cdot|s_t)) \right],
$$

[(42)](#b3wI1GjD8h "Link to this Equation")

where $H(\pi(\cdot|s)) = -\sum_a \pi(a|s) \ln \pi(a|s)$ is the entropy of the policy at state $s$, and $\alpha > 0$ is the entropy regularization strength.

We can rewrite this objective by absorbing the entropy term into a modified reward function. Define the entropy-augmented reward:

<a id="kuraHJlnzX"></a>

$$
\tilde{r}(s,a,\pi) = r(s,a) + \alpha H(\pi(\cdot|s)).
$$

[(43)](#kuraHJlnzX "Link to this Equation")

However, this formulation makes the reward depend on the entire policy at each state, which is awkward. We can reformulate this more cleanly by expanding the entropy term. Recall that the entropy is:

<a id="RAmqPh6cJj"></a>

$$
H(\pi(\cdot|s)) = -\sum_a \pi(a|s) \ln \pi(a|s).
$$

[(44)](#RAmqPh6cJj "Link to this Equation")

When we take the expectation over actions drawn from $\pi$, we have:

<a id="HlajibAJzH"></a>

$$
\mathbb{E}_{a \sim \pi(\cdot|s)} [H(\pi(\cdot|s))] = \sum_a \pi(a|s) \left[-\sum_{a'} \pi(a'|s) \ln \pi(a'|s)\right] = -\sum_{a'} \pi(a'|s) \ln \pi(a'|s),
$$

[(45)](#HlajibAJzH "Link to this Equation")

since the entropy doesn’t depend on which action is actually sampled. But we can also write this as:

<a id="Q1KqhprqOT"></a>

$$
H(\pi(\cdot|s)) = -\sum_a \pi(a|s) \ln \pi(a|s) = \mathbb{E}_{a \sim \pi(\cdot|s)}[-\ln \pi(a|s)].
$$

[(46)](#Q1KqhprqOT "Link to this Equation")

This shows that adding $\alpha H(\pi(\cdot|s))$ to the expected reward at state $s$ is equivalent to adding $-\alpha \ln \pi(a|s)$ to the reward of taking action $a$ at state $s$. More formally:

<a id="On5XNbCChj"></a>

$$
\begin{align*}
&\mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t r(s_t, a_t) \right] + \alpha \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t H(\pi(\cdot|s_t)) \right] \\
&= \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t r(s_t, a_t) \right] + \alpha \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t \mathbb{E}_{a_t \sim \pi(\cdot|s_t)}[-\ln \pi(a_t|s_t)] \right] \\
&= \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t \left( r(s_t, a_t) - \alpha \ln \pi(a_t|s_t) \right) \right].
\end{align*}
$$

[(47)](#On5XNbCChj "Link to this Equation")

The entropy bonus at each state, when averaged over the policy, becomes a per-action penalty proportional to the negative log probability of the action taken. This reformulation is more useful because the modified reward now depends only on the state, the action taken, and the probability assigned to that specific action by the policy, not on the entire distribution over actions.

This expression shows that entropy regularization is equivalent to adding a state-action dependent penalty term $-\alpha \ln \pi(a|s)$ to the reward. Intuititively, this terms amounts to paying a cost for low-entropy (deterministic) policies.

Now, when we write down the Bellman equation for this entropy-regularized problem, at each state $s$ we need to find the decision rule $d(\cdot|s) \in \Delta(\mathcal{A}_s)$ (a probability distribution over actions) that maximizes:

<a id="JdL3gyF3ER"></a>

$$
v(s) = \max_{d(\cdot|s) \in \Delta(\mathcal{A}_s)} \sum_a d(a|s) \left[ r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j) - \alpha \ln d(a|s) \right].
$$

[(48)](#JdL3gyF3ER "Link to this Equation")

Here $\Delta(\mathcal{A}_s) = \{d(\cdot|s) : d(a|s) \geq 0, \sum_a d(a|s) = 1\}$ denotes the probability simplex over actions available at state $s$. The optimization is over randomized decision rules at each state, constrained to be valid probability distributions.

This is a convex optimization problem with a linear constraint. We form the Lagrangian:

<a id="SjRlKZHyye"></a>

$$
\mathcal{L}(d, \lambda) = \sum_a d(a|s) \left[ r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j) - \alpha \ln d(a|s) \right] - \lambda \left(\sum_a d(a|s) - 1\right),
$$

[(49)](#SjRlKZHyye "Link to this Equation")

where $\lambda$ is the Lagrange multiplier enforcing the normalization constraint. Taking the derivative with respect to $d(a|s)$ and setting it to zero:

<a id="iZdrkJsI5g"></a>

$$
r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j) - \alpha(1 + \ln d^*(a|s)) - \lambda = 0.
$$

[(50)](#iZdrkJsI5g "Link to this Equation")

Solving for $d^*(a|s)$:

<a id="vutv6tmRXT"></a>

$$
d^*(a|s) = \exp\left(\frac{1}{\alpha}\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j) - \lambda\right)\right).
$$

[(51)](#vutv6tmRXT "Link to this Equation")

Using the normalization constraint $\sum_a d^*(a|s) = 1$ to solve for $\lambda$:

<a id="xgVvJ7J7oF"></a>

$$
\sum_a \exp\left(\frac{1}{\alpha}\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right)\right) = \exp\left(\frac{\lambda}{\alpha}\right).
$$

[(52)](#xgVvJ7J7oF "Link to this Equation")

Therefore:

<a id="Dv11kEKoBU"></a>

$$
\lambda = \alpha \ln \sum_a \exp\left(\frac{1}{\alpha}\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right)\right).
$$

[(53)](#Dv11kEKoBU "Link to this Equation")

Substituting this back into the Bellman equation and simplifying:

<a id="OaFFdHJU4n"></a>

$$
v(s) = \alpha \ln \sum_a \exp\left(\frac{1}{\alpha}\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right)\right).
$$

[(54)](#OaFFdHJU4n "Link to this Equation")

Setting $\beta = 1/\alpha$ (the inverse temperature), this becomes:

<a id="RwSR2eSFiH"></a>

$$
v(s) = \frac{1}{\beta} \ln \sum_a \exp\left(\beta\left(r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j)\right)\right).
$$

[(55)](#RwSR2eSFiH "Link to this Equation")

We recover the smooth Bellman equation we derived earlier using the logsumexp operator. The inverse temperature parameter $\beta$ controls how closely the logsumexp approximates the max: as $\beta \to \infty$, we recover the standard Bellman equation, while for finite $\beta$, we have a smooth approximation that corresponds to optimizing with entropy regularization strength $\alpha = 1/\beta$.

The optimal policy is:

<a id="nWWXl4nWPn"></a>

$$
\pi^*(a|s) = \frac{\exp\left(\beta q^*(s,a)\right)}{\sum_{a'} \exp\left(\beta q^*(s,a')\right)} = \text{softmax}_\beta(q^*(s,\cdot))(a),
$$

[(56)](#nWWXl4nWPn "Link to this Equation")

which is exactly the softmax policy parametrized by inverse temperature.

The derivation establishes the complete equivalence: the value function $v^*$ that solves the smooth Bellman equation is identical to the optimal value function $v^*_\Omega$ of the entropy-regularized MDP (with $\Omega$ being negative entropy and $\alpha = 1/\beta$), and the softmax policy that is greedy with respect to this value function achieves the maximum of the entropy-regularized objective. Both approaches yield the same numerical solution: the same values at every state and the same policy prescriptions. The only difference is how we conceptualize the problem: as smoothing the Bellman operator for computational tractability, or as explicitly trading off reward maximization against policy entropy.

This equivalence has important implications. When we use smooth Bellman equations with a logsumexp operator, we are implicitly solving an entropy-regularized MDP. Conversely, when we explicitly add entropy regularization to an MDP objective, we arrive at smooth Bellman equations as the natural description of optimality. This dual perspective will prove valuable in understanding various algorithms and theoretical results. For instance, in soft actor-critic methods and other maximum entropy reinforcement learning algorithms, the connection between smooth operators and entropy regularization provides both computational benefits (differentiability) and conceptual clarity (why we want stochastic policies).

<a id="entropy-regularized-dynamic-programming-algorithms"></a>

### Entropy-Regularized Dynamic Programming Algorithms

While the smooth Bellman equations (using logsumexp) and entropy-regularized formulations are mathematically equivalent, it is instructive to present the algorithms explicitly in the entropy-regularized form, where the entropy bonus appears directly in the update equations.

<a id="entropy-regularized-value-iteration"></a>

[Algorithm 4](#entropy-regularized-value-iteration "Link to this Algorithm") (Entropy-Regularized Value Iteration)

**Input:** MDP $(S, A, r, p, \gamma)$, entropy weight $\alpha > 0$, tolerance $\epsilon > 0$

**Output:** Approximate optimal value function $v$ and stochastic policy $\pi$

1.  Initialize $\pi(a|s) \leftarrow 1/|A_s|$ for all $s \in S, a \in A_s$ (uniform policy)
    
2.  Initialize $v(s) \leftarrow 0$ for all $s \in S$
    
3.  **repeat**
    
4.  $\quad \Delta \leftarrow 0$
    
5.  $\quad$ **for** each state $s \in S$ **do**
    
6.  $\quad\quad$ **Policy Improvement:** Update policy for current value estimate
    
7.  $\quad\quad$ **for** each action $a \in A_s$ **do**
    
8.  $\quad\quad\quad q(s,a) \leftarrow r(s,a) + \gamma \sum_{j \in S} p(j|s,a) v(j)$
    
9.  $\quad\quad$ **end for**
    
10.  $\quad\quad$ **for** each action $a \in A_s$ **do**
     
11.  $\quad\quad\quad \pi_{\text{new}}(a|s) \leftarrow \frac{\exp(q(s,a)/\alpha)}{\sum_{a' \in A_s} \exp(q(s,a')/\alpha)}$
     
12.  $\quad\quad$ **end for**
     
13.  $\quad\quad$ **Value Update:** Compute regularized value
     
14.  $\quad\quad v_{\text{new}}(s) \leftarrow \sum_{a \in A_s} \pi_{\text{new}}(a|s) \cdot q(s,a) + \alpha H(\pi_{\text{new}}(\cdot|s))$
     
15.  $\quad\quad$ where $H(\pi_{\text{new}}(\cdot|s)) = -\sum_{a \in A_s} \pi_{\text{new}}(a|s) \log \pi_{\text{new}}(a|s)$
     
16.  $\quad\quad \Delta \leftarrow \max(\Delta, |v_{\text{new}}(s) - v(s)|)$
     
17.  $\quad\quad v(s) \leftarrow v_{\text{new}}(s)$
     
18.  $\quad\quad \pi(\cdot|s) \leftarrow \pi_{\text{new}}(\cdot|s)$
     
19.  $\quad$ **end for**
     
20.  **until** $\Delta < \epsilon$
     
21.  **return** $v, \pi$
     

**Features:**

-   Line 11 updates the policy using the softmax of Q-values, with temperature $\alpha$
    
-   Line 14 explicitly computes the entropy-regularized value: expected Q-value plus entropy bonus
    
-   The algorithm maintains and updates a stochastic policy throughout
    
-   As $\alpha \to 0$ (or equivalently $\beta \to \infty$), this recovers standard value iteration
    

<a id="policy-iteration-entropy-regularized"></a>

[Algorithm 5](#policy-iteration-entropy-regularized "Link to this Algorithm") (Entropy-Regularized Policy Iteration)

**Input:** MDP $(S, A, r, p, \gamma)$, entropy weight $\alpha > 0$, tolerance $\epsilon > 0$

**Output:** Approximate optimal value function $v$ and stochastic policy $\pi$

1.  Initialize $\pi(a|s) \leftarrow 1/|A_s|$ for all $s \in S, a \in A_s$ (uniform policy)
    
2.  **repeat**
    
3.  $\quad$ **Policy Evaluation:** Solve for $v^\pi$ such that for all $s \in S$:
    
4.  $\quad\quad$ **Option 1 (Iterative):**
    
5.  $\quad\quad$ Initialize $v(s) \leftarrow 0$ for all $s \in S$
    
6.  $\quad\quad$ **repeat**
    
7.  $\quad\quad\quad$ **for** each state $s \in S$ **do**
    
8.  $\quad\quad\quad\quad$ Compute $q^\pi(s,a) \leftarrow r(s,a) + \gamma \sum_{j \in S} p(j|s,a) v(j)$ for all $a \in A_s$
    
9.  $\quad\quad\quad\quad v_{\text{new}}(s) \leftarrow \sum_{a \in A_s} \pi(a|s) \cdot q^\pi(s,a) + \alpha H(\pi(\cdot|s))$
    
10.  $\quad\quad\quad$ **end for**
     
11.  $\quad\quad\quad$ **if** $\max_s |v_{\text{new}}(s) - v(s)| < \epsilon$ **then break**
     
12.  $\quad\quad\quad v \leftarrow v_{\text{new}}$
     
13.  $\quad\quad$ **until** convergence
     
14.  $\quad\quad$ **Option 2 (Direct):** Solve linear system $(\mathbf{I} - \gamma \mathbf{P}_\pi) \mathbf{v} = \mathbf{r}_\pi + \alpha \mathbf{H}_\pi$
     
15.  $\quad\quad$ where $[\mathbf{r}_\pi](s) = \sum_a \pi(a|s) r(s,a)$ and $[\mathbf{H}_\pi](s) = H(\pi(\cdot|s))$
     
16.  $\quad$ **Policy Improvement:**
     
17.  $\quad$ policy\_changed $\leftarrow$ false
     
18.  $\quad$ **for** each state $s \in S$ **do**
     
19.  $\quad\quad \pi_{\text{old}}(\cdot|s) \leftarrow \pi(\cdot|s)$
     
20.  $\quad\quad$ **for** each action $a \in A_s$ **do**
     
21.  $\quad\quad\quad q(s,a) \leftarrow r(s,a) + \gamma \sum_{j \in S} p(j|s,a) v(j)$
     
22.  $\quad\quad$ **end for**
     
23.  $\quad\quad$ **for** each action $a \in A_s$ **do**
     
24.  $\quad\quad\quad \pi(a|s) \leftarrow \frac{\exp(q(s,a)/\alpha)}{\sum_{a' \in A_s} \exp(q(s,a')/\alpha)}$
     
25.  $\quad\quad$ **end for**
     
26.  $\quad\quad$ **if** $\|\pi(\cdot|s) - \pi_{\text{old}}(\cdot|s)\| > \epsilon$ **then**
     
27.  $\quad\quad\quad$ policy\_changed $\leftarrow$ true
     
28.  $\quad\quad$ **end if**
     
29.  $\quad$ **end for**
     
30.  **until** policy\_changed $=$ false
     
31.  **return** $v, \pi$
     

**Features:**

-   **Policy Evaluation** (lines 3-15): Computes the value of the current policy including entropy bonus
    
    -   Option 1: Iterative method (successive approximation)
        
    -   Option 2: Direct solution via linear system
        
-   **Policy Improvement** (lines 16-29): Updates policy to softmax over Q-values
    
-   Line 14 shows the vector form: the linear system includes the entropy vector $\mathbf{H}_\pi$
    
-   The algorithm alternates between evaluating the current stochastic policy and improving it
    
-   Converges to the unique optimal entropy-regularized policy
    

<a id="summary-and-outlook"></a>

## Summary and Outlook

Entropy regularization replaces hard action selection with a smooth conjugate operator and produces a stochastic optimal policy. Gumbel perturbations, log-sum-exp Bellman updates, and regularized policy iteration describe the same construction from probabilistic, variational, and algorithmic viewpoints.

Smoothness changes the operator but does not remove the need to represent its unknown value function. How can an infinite-dimensional functional equation be reduced to finitely many coefficients and test conditions? [Weighted-residual methods](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/20-weighted-residual-methods.md) provide the general approximation machinery.

<a id="self-checks"></a>

## Self-checks

<a id="ex-smoothing-check-1"></a>

[Exercise 1](#ex-smoothing-check-1 "Link to this Exercise") (Temperature limit)

What happens to a softmax policy as the entropy temperature $\alpha$ approaches zero, assuming a unique maximizing action?

Solution to [Exercise 1](#ex-smoothing-check-1)

Its probability concentrates on the maximizing action, so the soft policy approaches the ordinary greedy deterministic policy.

<a id="ex-smoothing-check-2"></a>

[Exercise 2](#ex-smoothing-check-2 "Link to this Exercise") (Smooth maximum)

Why is log-sum-exp often easier to optimize through than a hard maximum?

Solution to [Exercise 2](#ex-smoothing-check-2)

Log-sum-exp is differentiable and blends information from all actions. A hard maximum is nondifferentiable at ties and passes local gradient information only through selected maximizers.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-rust1987optimal"></a>
2.  Rust, J. (1987). Optimal Replacement of GMC Bus Engines: An Empirical Model of Harold Zurcher. _Econometrica_, _55_(5), 999–1033.
<a id="cite-ziebart2008maximum"></a>
4.  Ziebart, B. D., Maas, A. L., Bagnell, J. A., & Dey, A. K. (2008). Maximum Entropy Inverse Reinforcement Learning. _Proceedings of the 23rd AAAI Conference on Artificial Intelligence_, 1433–1438.
<a id="cite-haarnoja2017reinforcement"></a>
6.  Haarnoja, T., Tang, H., Abbeel, P., & Levine, S. (2017). Reinforcement Learning with Deep Energy-Based Policies. _Proceedings of the 34th International Conference on Machine Learning_, _70_, 1352–1361.
<a id="cite-haarnoja2018soft"></a>
8.  Haarnoja, T., Zhou, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor. _Proceedings of the 35th International Conference on Machine Learning (ICML)_, 1861–1870.
<a id="cite-levine2018reinforcement"></a>
10.  Levine, S., Kumar, A., Tucker, G., & Fu, J. (2018). Reinforcement Learning as a Framework for Control: A Survey. _arXiv Preprint arXiv:1806.04222_.
<a id="cite-deramo2016estimating"></a>
12.  D’Eramo, C., Nuara, A., Restelli, M., & Nowe, A. (2016). Estimating the Maximum Expected Value through Gaussian Approximation. _Proceedings of the 33rd International Conference on Machine Learning_, _48_, 1032–1040.
<a id="cite-geist2019"></a>
14.  Geist, M., Scherrer, B., & Pietquin, O. (2019). A Theory of Regularized Markov Decision Processes. In K. Chaudhuri & R. Salakhutdinov (Eds.), _Proceedings of the 36th International Conference on Machine Learning_ (Vol. 97, pp. 2160–2169). PMLR. [https://proceedings.mlr.press/v97/geist19a.html](https://proceedings.mlr.press/v97/geist19a.html)

[

Dynamic Programming

Infinite-Horizon Markov Decision Processes


](18-infinite-horizon-mdps.md)[

Approximate Value Methods

Weighted-Residual Methods


](20-weighted-residual-methods.md)


---

# CHAPITRE 20 — Weighted-Residual Methods

Section du livre : Approximate Value Methods

Page originale : https://pierrelucbacon.com/rlbook/weighted-residual-methods

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/20-weighted-residual-methods.md

> **Cours de Pierre-Luc Bacon — 20.** [Page publiée](https://pierrelucbacon.com/rlbook/weighted-residual-methods) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/20-weighted-residual-methods.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Weighted-Residual Methods

<a id="skip-to-article"></a>

Regularized and ordinary Bellman equations are both functional equations: the unknown is a function rather than a finite vector. How can such an equation be approximated by finitely many coefficients while retaining a precise condition on its residual?

The Bellman optimality equation $\mathsf{L} v = v$, whose contraction property underlies the convergence of value iteration, is a functional equation: an equation where the unknown is an entire function rather than a finite-dimensional vector. When the state space is continuous or very large, we cannot represent the value function exactly on a computer. We must instead work with finite-dimensional approximations. This motivates weighted residual methods (also called minimum residual methods), a general framework for transforming infinite-dimensional problems into tractable finite-dimensional ones [Chakraverty _et al._ (2019)](https://doi.org/10.1002/9781119423461.ch3)[Atkinson & Potra (1987)](https://doi.org/10.1137/0724087).

Learning Goals

After completing this chapter, you should be able to:

-   Explain why functional equations require finite-dimensional approximation and how weighted residual methods provide a systematic framework
    
-   Distinguish between Galerkin, collocation, and least-squares methods by their choice of test functions
    
-   Apply function iteration and Newton’s method to solve projected Bellman equations
    
-   State conditions under which projected value iteration converges (monotonicity for sup-norm, on-policy weighting for weighted $L^2$)
    
-   Derive the LSTD equations as Galerkin projection with stationary distribution weighting
    

**Prerequisites:** Bellman operator and contraction property, basic numerical quadrature, linear algebra (matrix inverses, orthogonal projection).

<a id="a-motivating-example-optimal-stopping-with-continuous-states"></a>

## A Motivating Example: Optimal Stopping with Continuous States

What fails when an exact value function lives on a continuum but only finitely many coefficients can be stored?

Before developing the general theory, consider a concrete example that illustrates the core challenge. An agent observes a state $s \in [0, 1]$ and must decide whether to **stop** (receive reward $s$ and end the episode) or **continue** (receive nothing, and the state redraws uniformly on $[0, 1]$). With discount factor $\gamma = 0.9$, the Bellman optimality equation is:

<a id="mIy9u38XTy"></a>

$$
v^*(s) = \max\left\{ s, \; \gamma \int_0^1 v^*(s') \, ds' \right\}.
$$

[(1)](#mIy9u38XTy "Link to this Equation")

The first term is the immediate payoff from stopping; the second is the discounted expected continuation value. Since the continuation value $\bar{v} = \int_0^1 v^*(s') ds'$ is a constant (it doesn’t depend on the current state $s$), the optimal policy has a **threshold structure**: stop if $s \geq s^*$ for some threshold $s^*$, continue otherwise.

At the threshold, the agent is indifferent: $s^* = \gamma \bar{v}$. Computing $\bar{v}$ by integrating $v^*$:

<a id="THikQEIHrF"></a>

$$
\bar{v} = \int_0^{s^*} \gamma \bar{v} \, ds' + \int_{s^*}^1 s' \, ds' = s^* \gamma \bar{v} + \frac{1 - (s^*)^2}{2}.
$$

[(2)](#THikQEIHrF "Link to this Equation")

Substituting $s^* = \gamma \bar{v}$ and solving gives the exact threshold and value.

<a id="cCDVvkDxee"></a>

Source

```python
#  label: fig-optimal-stopping-exact
#  caption: The exact value function for the optimal stopping problem.

%config InlineBackend.figure_format = 'retina'
import numpy as np
import matplotlib.pyplot as plt

gamma = 0.9

# Solve for exact threshold
v_bar_exact = (1 - np.sqrt(1 - gamma**2)) / gamma**2
s_star_exact = gamma * v_bar_exact

print(f"Exact solution:")
print(f"  Threshold s* = {s_star_exact:.6f}")
print(f"  Continuation value v̄ = {v_bar_exact:.6f}")

# The exact value function
def v_exact(s):
    return np.where(s >= s_star_exact, s, gamma * v_bar_exact)

# Plot the exact value function
s_grid = np.linspace(0, 1, 200)
plt.figure(figsize=(8, 4))
plt.plot(s_grid, v_exact(s_grid), 'b-', linewidth=2, label='Exact $v^*(s)$')
plt.axvline(s_star_exact, color='r', linestyle='--', label=f'Threshold $s^* = {s_star_exact:.3f}$')
plt.xlabel('State $s$')
plt.ylabel('Value $v^*(s)$')
plt.legend()
plt.title('Optimal Stopping: Exact Value Function')
plt.grid(True, alpha=0.3)
plt.tight_layout()
```

```
Exact solution:
  Threshold s* = 0.626789
  Continuation value v̄ = 0.696432
```

![<Figure size 800x400 with 1 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/35397a894a-56c6de38ac1e8d4f23233f282e9ff7e6.png)

The exact value function is piecewise linear: constant at $\gamma \bar{v}$ below the threshold, equal to $s$ above it. Now suppose we want to approximate $v^*$ using a **polynomial basis** with $n$ terms:

<a id="Qo5Be2nZGE"></a>

$$
\hat{v}(s; \theta) = \sum_{j=0}^{n-1} \theta_j s^j = \theta_0 + \theta_1 s + \theta_2 s^2 + \cdots
$$

[(3)](#Qo5Be2nZGE "Link to this Equation")

The **residual** at state $s$ measures how far our approximation is from satisfying the Bellman equation:

<a id="ZNrqpQ0Z4e"></a>

$$
R(s; \theta) = \max\left\{ s, \; \gamma \int_0^1 \hat{v}(s'; \theta) \, ds' \right\} - \hat{v}(s; \theta).
$$

[(4)](#ZNrqpQ0Z4e "Link to this Equation")

For a perfect solution, $R(s; \theta) = 0$ for all $s \in [0, 1]$. But a polynomial cannot exactly represent the kink at $s^*$. We must choose how to make the residual “small” across the state space.

**Collocation** picks $n$ points $\{s_1, \ldots, s_n\}$ and requires the residual to vanish exactly there:

<a id="OpdXXiHhFl"></a>

$$
R(s_i; \theta) = 0, \quad i = 1, \ldots, n.
$$

[(5)](#OpdXXiHhFl "Link to this Equation")

**Galerkin** requires the residual to be orthogonal to each basis function:

<a id="FYfO9uDxjf"></a>

$$
\int_0^1 R(s; \theta) s^{j} w(s) \, ds = 0, \quad j = 0, \ldots, n-1.
$$

[(6)](#FYfO9uDxjf "Link to this Equation")

<a id="YelQCmUYUC"></a>

Source

```python
#  label: fig-collocation-comparison
#  caption: Polynomial collocation approximation with 5 Chebyshev nodes.

from scipy.integrate import quad

def chebyshev_nodes(n, a=0, b=1):
    """Chebyshev nodes on [a, b]."""
    k = np.arange(1, n + 1)
    nodes = 0.5 * (a + b) + 0.5 * (b - a) * np.cos((2*k - 1) * np.pi / (2*n))
    return np.sort(nodes)

def collocation_solve(n, gamma, max_iter=100, tol=1e-8):
    """Solve optimal stopping via polynomial collocation."""
    nodes = chebyshev_nodes(n)
    Phi = np.vander(nodes, n, increasing=True)
    
    theta = np.zeros(n)
    for iteration in range(max_iter):
        def v_approx(s):
            return sum(theta[j] * s**j for j in range(n))
        
        v_bar, _ = quad(v_approx, 0, 1)
        targets = np.maximum(nodes, gamma * v_bar)
        theta_new = np.linalg.solve(Phi, targets)
        
        if np.linalg.norm(theta_new - theta) < tol:
            return theta_new, iteration + 1
        theta = theta_new
    return theta, max_iter

# Solve with different numbers of basis functions
for n in [3, 5, 8]:
    theta, iters = collocation_solve(n, gamma)
    def v_approx(s, theta=theta, n=n):
        return sum(theta[j] * s**j for j in range(n))
    errors = [abs(v_approx(s) - v_exact(s)) for s in np.linspace(0, 1, 1000)]
    print(f"n = {n}: converged in {iters} iters, max error = {max(errors):.6f}")

# Plot comparison for n=5
n = 5
theta, _ = collocation_solve(n, gamma)
v_approx_5 = lambda s: sum(theta[j] * s**j for j in range(n))

plt.figure(figsize=(8, 4))
plt.plot(s_grid, v_exact(s_grid), 'b-', linewidth=2, label='Exact')
plt.plot(s_grid, [v_approx_5(s) for s in s_grid], 'r--', linewidth=2, label=f'Collocation ($n={n}$)')
plt.scatter(chebyshev_nodes(n), [v_approx_5(s) for s in chebyshev_nodes(n)], 
            color='red', s=50, zorder=5, label='Collocation nodes')
plt.xlabel('State $s$')
plt.ylabel('Value')
plt.legend()
plt.title('Polynomial Collocation Approximation')
plt.grid(True, alpha=0.3)
plt.tight_layout()
```

```
n = 3: converged in 49 iters, max error = 0.053991
n = 5: converged in 41 iters, max error = 0.052626
n = 8: converged in 54 iters, max error = 0.015880
```

![<Figure size 800x400 with 1 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6ef6ff6ef9-1a4f5465d97e8e6583322a43f5026935.png)

This example illustrates the fundamental tension in weighted residual methods: with finite parameters, we cannot satisfy the Bellman equation everywhere. We must choose how to allocate our approximation capacity. The rest of this chapter develops the general theory behind these choices.

<a id="testing-whether-a-residual-vanishes"></a>

## Testing Whether a Residual Vanishes

Which scalar conditions can certify that a functional residual is zero, small, or orthogonal to selected directions?

Consider a functional equation $\mathsf{N}(f) = 0$, where $\mathsf{N}$ is an operator and the unknown $f$ is an entire function (in our case, the Bellman optimality equation $\mathsf{L} v = v$, which we can write as $\mathsf{N}(v) \equiv \mathsf{L} v - v = 0$). Suppose we have found a candidate approximate solution $\hat{f}$. To verify it satisfies $\mathsf{N}(\hat{f}) = 0$, we compute the **residual function** $R(s) = \mathsf{N}(\hat{f})(s)$. For a true solution, this residual should be the **zero function**: $R(s) = 0$ for every state $s$.

How might we test whether a function is zero? One approach: sample many input points $\{s_1, s_2, \ldots, s_m\}$, check whether $R(s_i) = 0$ at each, and summarize the results into a single scalar test by computing a weighted sum $\sum_{i=1}^m w_i R(s_i)$ with weights $w_i > 0$. If $R$ is zero everywhere, this sum is zero. If $R$ is nonzero somewhere, we can choose points and weights to make the sum nonzero. For vectors in finite dimensions, the inner product $\langle \mathbf{r}, \mathbf{y} \rangle = \sum_{i=1}^n r_i y_i$ implements exactly this idea: it tests $\mathbf{r}$ by weighting and summing. Indeed, a vector $\mathbf{r} \in \mathbb{R}^n$ equals zero if and only if $\langle \mathbf{r}, \mathbf{y} \rangle = 0$ for every vector $\mathbf{y} \in \mathbb{R}^n$. To see why, suppose $\mathbf{r} \neq \mathbf{0}$. Choosing $\mathbf{y} = \mathbf{r}$ gives $\langle \mathbf{r}, \mathbf{r} \rangle = \|\mathbf{r}\|^2 > 0$, contradicting the claim that all inner products vanish.

The same principle extends to functions. A function $R$ equals the zero function if and only if its “inner product” with every “test function” $p$ vanishes:

<a id="dyGJuTquLx"></a>

$$
R = 0 \quad \text{if and only if} \quad \langle R, p \rangle_w = \int_{\mathcal{S}} R(s) p(s) w(s) ds = 0 \quad \text{for all test functions } p,
$$

[(7)](#dyGJuTquLx "Link to this Equation")

where $w(s) > 0$ is a weight function that is part of the inner product definition. Why does this work? For the same reason as in finite dimensions: if $R$ is not the zero function, there must be some region where $R(s) \neq 0$. We can then choose a test function $p$ that is nonzero in that same region (for instance, $p(s) = R(s)$ itself), which will produce $\langle R, p \rangle_w = \int R(s) p(s) w(s) ds > 0$, witnessing that $R$ is nonzero. Conversely, if $R$ is the zero function, then $\langle R, p \rangle_w = 0$ for any test function $p$.

This ability to **distinguish between different functions using inner products** is a fundamental principle from functional analysis. Just as we can test a vector by taking inner products with other vectors, we can test a function by taking inner products with other functions.

Connection to Functional Analysis

The principle that “a function equals zero if and only if it has zero inner product with all test functions” is a consequence of the **Hahn-Banach theorem**, one of the cornerstones of functional analysis. The theorem guarantees that for any nonzero function $R$ in a suitable function space, there exists a continuous linear functional (which can be represented as an inner product with some test function $p$) that produces a nonzero value when applied to $R$. This is often phrased as “the dual space separates points.”

While you don’t need to know the Hahn-Banach theorem to use weighted residual methods, it provides the rigorous mathematical foundation ensuring that our inner product tests are theoretically sound. The constructive argument we gave above (choosing $p = R$) works in simple cases with well-behaved functions, but the Hahn-Banach theorem extends this guarantee to much more general settings.

This transforms the pointwise condition “$R(s) = 0$ for all $s$” (infinitely many conditions, one per state) into an equivalent condition about inner products. We still cannot test against _all_ possible test functions, since there are infinitely many of those too. But the inner product perspective suggests a natural computational strategy: choose a finite collection of test functions $\{p_1, \ldots, p_n\}$ and use them to construct $n$ conditions that we can actually compute.

<a id="from-variational-conditions-to-optimization"></a>

### From Variational Conditions to Optimization

Making a residual “small” is an optimization problem. We want to find $\theta$ that minimizes $\lVert R(\cdot; \theta) \rVert$ for some norm. Different methods correspond to different choices of norm:

-   Minimize the weighted $L^2$ norm $\lVert R \rVert_w^2 = \int R(s)^2 w(s) ds$
    
-   Minimize a discrete norm $\sum_j \omega_j R(s_j)^2$ at selected points
    
-   Minimize $\lVert R \rVert$ in a dual norm induced by the approximation space
    

The first-order conditions for these optimization problems take the form $\langle R, p_j \rangle_w = 0$ for appropriate “test functions” $p_j$. The variational formulation is useful for analysis, but we are simply minimizing the residual in a chosen norm.

The rest of this chapter develops the computational framework: how to parameterize the unknown function, define the residual, choose a norm, and solve the resulting finite-dimensional problem.

<a id="the-general-framework"></a>

## The General Framework

How do an approximation space, residual, test space, and solver combine into a reusable finite-dimensional method?

Consider an operator equation of the form

<a id="SwCXnzMhvG"></a>

$$
\mathsf{N}(f) = 0,
$$

[(8)](#SwCXnzMhvG "Link to this Equation")

where $\mathsf{N}: B_1 \to B_2$ is a continuous operator between complete normed vector spaces $B_1$ and $B_2$. For the Bellman equation, we have $\mathsf{N}(v) = \mathsf{L} v - v$, so that solving $\mathsf{N}(v) = 0$ is equivalent to finding the fixed point $v = \mathsf{L} v$.

Just as we transcribed infinite-dimensional continuous optimal control problems into finite-dimensional discrete optimal control problems in earlier chapters, we seek a finite-dimensional approximation to this infinite-dimensional functional equation. Recall that for continuous optimal control, we adopted control parameterization: we represented the control trajectory using a finite set of basis functions (piecewise constants, polynomials, splines) and searched over the finite-dimensional coefficient space instead of the infinite-dimensional function space. For integrals in the objective and constraints, we used numerical quadrature to approximate them with finite sums.

We follow the same strategy here. We parameterize the value function using a finite set of basis functions $\{\varphi_1, \ldots, \varphi_n\}$, commonly polynomials (Chebyshev, Legendre), though other function classes (splines, radial basis functions, neural networks) are possible, and search for coefficients $\theta = (\theta_1, \ldots, \theta_n)$ in $\mathbb{R}^n$. When integrals appear in the Bellman operator or projection conditions, we approximate them using numerical quadrature. The projection method approach consists of several conceptual steps that accomplish this transcription.

<a id="step-1-choose-a-finite-dimensional-approximation-space"></a>

### Step 1: Choose a Finite-Dimensional Approximation Space

We begin by selecting a basis $\Phi = \{\varphi_1, \varphi_2, \ldots, \varphi_n\}$ and approximating the unknown function as a linear combination:

<a id="zCVHw4yycF"></a>

$$
\hat{f}(x) = \sum_{i=1}^n \theta_i \varphi_i(x).
$$

[(9)](#zCVHw4yycF "Link to this Equation")

The choice of basis functions $\varphi_i$ is problem-dependent. Common choices include:

-   **Polynomials**: For smooth problems, we might use Chebyshev polynomials or other orthogonal polynomial families
    
-   **Splines**: For problems where we expect the solution to have regions of different smoothness
    
-   **Radial basis functions**: For high-dimensional problems where tensor product methods become intractable
    

The number of basis functions $n$ determines the flexibility of our approximation. In practice, we start with small $n$ and increase it until the approximation quality is satisfactory. The only unknowns now are the coefficients $\theta = (\theta_1, \ldots, \theta_n)$.

While the classical presentation of projection methods focuses on polynomial bases, the framework applies equally well to other function classes. Neural networks, for instance, can be viewed through this lens: a neural network $\hat{f}(x; \theta)$ with parameters $\theta$ defines a flexible function class, and many training procedures can be interpreted as projection methods with specific choices of test functions or residual norms. The distinction is that classical methods typically use predetermined basis functions with linear coefficients, while neural networks use adaptive nonlinear features. Throughout this chapter, we focus on the classical setting to develop the core concepts, but the principles extend naturally to modern function approximators.

<a id="step-2-define-the-residual-function"></a>

### Step 2: Define the Residual Function

Since we are approximating $f$ with $\hat{f}$, the operator $\mathsf{N}$ will generally not vanish exactly. Instead, we obtain a **residual function**:

<a id="twHezlpIvC"></a>

$$
R(x; \theta) = \mathsf{N}(\hat{f}(\cdot; \theta))(x).
$$

[(10)](#twHezlpIvC "Link to this Equation")

This residual measures how far our candidate solution is from satisfying the equation at each point $x$. As we discussed in the introduction, we want to make this residual small—an optimization problem whose formulation depends on how we measure “small.”

<a id="step-3-impose-conditions-on-the-residual"></a>

### Step 3: Impose Conditions on the Residual

The basis and residual reduce the functional equation to $n$ scalar conditions on $\theta$. The choice of conditions determines the method:

| **Method** | **Residual criterion** | **Conditions** ($n$ equations) |
| --- | --- | --- |
| Least squares | $\displaystyle\lVert R \rVert_w^2 = \int R(x; \theta)^2 w(x) dx$ | $\displaystyle\int R \cdot \frac{\partial R}{\partial \theta_j} \, w \, dx = 0$, $j = 1, \ldots, n$ |
| Galerkin | $\lVert R \rVert_{\mathcal{V}^*}$ (dual norm of approx. space) | $\displaystyle\int R(x; \theta) \varphi_j(x) w(x) dx = 0$, $j = 1, \ldots, n$ |
| Collocation | Exact pointwise satisfaction | $R(x_i; \theta) = 0$, $i = 1, \ldots, n$ |

Each criterion yields $n$ equations in the $n$ unknowns $\theta_1,\ldots,\theta_n$.

<a id="collocation-make-the-residual-zero-at-selected-points"></a>

#### Collocation: Make the Residual Zero at Selected Points

The simplest approach is to choose $n$ points $\{x_1, \ldots, x_n\}$ and require the residual to vanish exactly at each:

<a id="lJbE4KyRWJ"></a>

$$
R(x_i; \theta) = 0, \quad i = 1, \ldots, n.
$$

[(11)](#lJbE4KyRWJ "Link to this Equation")

This gives $n$ equations for $n$ unknowns. Collocation is computationally attractive because it avoids integration entirely—we only evaluate $R$ at discrete points. The resulting system is:

<a id="xjW9iy9zOK"></a>

$$
\mathsf{N}(\hat{f}(\cdot; \theta))(x_i) = 0, \quad i = 1, \ldots, n.
$$

[(12)](#xjW9iy9zOK "Link to this Equation")

For a linear operator, this is a linear system; for the Bellman equation, it is nonlinear due to the max.

_Verify for yourself: with $n = 2$ collocation points and $n = 2$ basis functions, the system $\boldsymbol{\Phi}\theta = t$ is a $2 \times 2$ linear system. What must be true about the collocation matrix $\boldsymbol{\Phi}$ for this system to have a unique solution?_

The choice of collocation points matters. **Orthogonal collocation** (or **spectral collocation**) places points at the zeros of the $n$\-th orthogonal polynomial in a family (Chebyshev, Legendre, etc.). For Chebyshev polynomials $T_0, T_1, \ldots, T_{n-1}$, we place collocation points at the zeros of $T_n(x)$. These points are also optimal nodes for Gauss quadrature, so:

-   We get the computational simplicity of pointwise evaluation $R(x_i) = 0$
    
-   When we need integrals (inside the Bellman operator), the collocation points double as quadrature nodes with exactness for polynomials up to degree $2n-1$
    
-   For smooth problems, spectral approximations achieve **exponential convergence**: the error decreases like $O(e^{-cn})$ as we add basis functions, compared to $O(h^{p+1})$ for piecewise polynomials
    

The Chebyshev interpolation theorem guarantees that forcing $R(x_i; \theta) = 0$ at these carefully chosen points makes $R(x; \theta)$ small everywhere, with well-conditioned systems and near-optimal interpolation error.

<a id="galerkin-make-the-residual-orthogonal-to-the-approximation-space"></a>

#### Galerkin: Make the Residual Orthogonal to the Approximation Space

The Galerkin method requires the residual to be orthogonal to each basis function:

<a id="TFd0sdajU9"></a>

$$
\int_{\mathcal{S}} R(x; \theta) \varphi_i(x) w(x) dx = 0, \quad i = 1, \ldots, n.
$$

[(13)](#TFd0sdajU9 "Link to this Equation")

To understand why this is optimal, consider the approximation space $\mathcal{V} = \text{span}\{\varphi_1, \ldots, \varphi_n\}$ as an $n$\-dimensional subspace. If the residual $R$ is orthogonal to all basis functions, then by linearity, $R$ is orthogonal to every function in $\mathcal{V}$:

<a id="e38Jsg2dOl"></a>

$$
\langle R, g \rangle_w = \left\langle R, \sum_{i=1}^n c_i \varphi_i \right\rangle_w = \sum_{i=1}^n c_i \langle R, \varphi_i \rangle_w = 0 \quad \text{for all } g \in \mathcal{V}.
$$

[(14)](#e38Jsg2dOl "Link to this Equation")

The residual has “zero overlap” with our approximation space—it is as “invisible” to our basis as possible. This is the defining property of orthogonal projection.

In what sense is Galerkin minimizing a norm? The **dual norm** of $R$ with respect to $\mathcal{V}$ measures $R$ by its largest inner product with functions in $\mathcal{V}$:

<a id="rNZ5rHYDU7"></a>

$$
\lVert R \rVert_{\mathcal{V}^*} = \sup_{\substack{g \in \mathcal{V} \\ \lVert g \rVert_w = 1}} \lvert \langle R, g \rangle_w \rvert.
$$

[(15)](#rNZ5rHYDU7 "Link to this Equation")

The Galerkin conditions $\langle R, \varphi_j \rangle_w = 0$ for all $j$ imply $\langle R, g \rangle_w = 0$ for all $g \in \mathcal{V}$, so $\lVert R \rVert_{\mathcal{V}^*} = 0$. Galerkin makes the residual “invisible” when measured against the approximation space—it minimizes the dual norm to zero.

A finite-dimensional analogy: to approximate a vector $\mathbf{v} \in \mathbb{R}^3$ using only the $xy$\-plane, the best approximation is $\hat{\mathbf{v}} = (v_1, v_2, 0)$. The error $\mathbf{r} = \mathbf{v} - \hat{\mathbf{v}} = (0, 0, v_3)$ points purely in the $z$\-direction, orthogonal to the plane. The Galerkin condition generalizes this: the residual is orthogonal to the approximation space.

Galerkin requires integration to compute the conditions, making it more expensive per iteration than collocation. However, when using orthogonal polynomial bases with matching weight functions, the integrals simplify and the resulting systems are well-conditioned.

<a id="least-squares-minimize-the-l-2-norm-of-the-residual"></a>

#### Least Squares: Minimize the $L^2$ Norm of the Residual

The most direct approach is to minimize the weighted $L^2$ norm of the residual:

<a id="RKxysnHZuK"></a>

$$
\min_\theta \int_{\mathcal{S}} R(x; \theta)^2 w(x) dx.
$$

[(16)](#RKxysnHZuK "Link to this Equation")

The first-order conditions are:

<a id="vULYB1Qi0b"></a>

$$
\int_{\mathcal{S}} R(x; \theta) \frac{\partial R(x; \theta)}{\partial \theta_j} w(x) dx = 0, \quad j = 1, \ldots, n.
$$

[(17)](#vULYB1Qi0b "Link to this Equation")

This directly minimizes how far our approximation is from satisfying the equation. For the Bellman equation $R = \mathsf{L}\hat{v} - \hat{v}$, this is **Bellman residual minimization**: we minimize $\lVert \mathsf{L}\hat{v} - \hat{v} \rVert_w^2$.

The gradient $\frac{\partial R}{\partial \theta_j}$ involves differentiating the operator $\mathsf{N}$. For the Bellman operator with its max, this requires the Envelope Theorem (discussed in Step 4). The need to differentiate through the operator distinguishes least squares from Galerkin and collocation.

<a id="fitted-q-iteration-project-then-iterate"></a>

#### Fitted Q-Iteration: Project, Then Iterate

For iterative methods, there is a computationally simpler alternative to minimizing the residual directly. **Fitted Q-Iteration (FQI)** uses a two-step iteration:

1.  Apply the Bellman operator to get a target: $f_k = \mathsf{L} \hat{v}_k$
    
2.  Project the target back onto the approximation space: $\hat{v}_{k+1} = \arg\min_\theta \lVert \hat{v}(\cdot; \theta) - f_k \rVert_w^2$
    

The projection step solves $\min_\theta \lVert \hat{v} - f_k \rVert_w^2$, whose first-order conditions are $\langle \hat{v} - f_k, \varphi_j \rangle_w = 0$. This is a standard least-squares fit of the basis to the target values. Combining these steps gives:

<a id="B4pyiWPpJT"></a>

$$
\hat{v}_{k+1} = \Pi_w \, \mathsf{L} \hat{v}_k,
$$

[(18)](#B4pyiWPpJT "Link to this Equation")

where $\Pi_w$ denotes orthogonal projection onto $\text{span}\{\varphi_j\}$ with respect to the weighted inner product.

FQI does **not** minimize the Bellman residual $\lVert \mathsf{L}\hat{v} - \hat{v} \rVert^2$ directly. It projects, then iterates. FQI’s projection step uses only the gradient of $\hat{v}$ with respect to $\theta$ (the “semi-gradient”), while Bellman residual minimization requires differentiating through $\mathsf{L}$ (the “full gradient”). We return to this distinction when discussing temporal difference learning.

<a id="step-4-solve-the-finite-dimensional-problem"></a>

### Step 4: Solve the Finite-Dimensional Problem

The conditions from Step 3 give us a finite-dimensional problem to solve:

-   **Collocation**: $n$ equations $R(x_i; \theta) = 0$
    
-   **Galerkin**: $n$ equations $\int R(x; \theta) \varphi_i(x) w(x) dx = 0$
    
-   **Least squares**: minimize $\int R(x; \theta)^2 w(x) dx$
    

In each case, we have $n$ equations (or first-order conditions) in $n$ unknowns $\theta_1, \ldots, \theta_n$. For the Bellman equation, these systems are nonlinear due to the max operator.

<a id="computational-cost-and-conditioning"></a>

#### Computational Cost and Conditioning

The **computational cost per iteration** varies significantly across methods:

-   **Collocation**: Cheapest to evaluate since $P_i(\theta) = R(x_i; \theta)$ requires only pointwise evaluation (no integration). The Jacobian is also cheap: $J_{ij} = \frac{\partial R(x_i; \theta)}{\partial \theta_j}$.
    
-   **Galerkin and moments**: More expensive due to integration. Computing $P_i(\theta) = \int R(x; \theta) p_i(x) w(x) dx$ requires numerical quadrature. Each Jacobian entry requires integrating $\frac{\partial R}{\partial \theta_j} p_i w$.
    
-   **Least squares**: Most expensive when done via the objective function, which requires integrating $R^2 w$. However, the first-order conditions reduce it to a system like Galerkin, with test functions $p_i = \partial R / \partial \theta_i$.
    

For methods requiring integration, the choice of quadrature rule should match the basis. Gaussian quadrature with nodes at orthogonal polynomial zeros is efficient. When combined with collocation at those same points, the quadrature is exact for polynomials up to a certain degree. This coordination between quadrature and collocation makes **orthogonal collocation** effective.

The **conditioning** of the system depends on the choice of test functions. The Jacobian matrix has entries:

<a id="L72SC3Oeax"></a>

$$
J_{ij} = \frac{\partial P_i}{\partial \theta_j} = \left\langle \frac{\partial R(\cdot; \theta)}{\partial \theta_j}, p_i \right\rangle_w.
$$

[(19)](#L72SC3Oeax "Link to this Equation")

When test functions are orthogonal (or nearly so), the Jacobian tends to be well-conditioned. This is why orthogonal polynomial bases are preferred in Galerkin methods: they produce Jacobians with controlled condition numbers. Poorly chosen basis functions or collocation points can lead to nearly singular Jacobians, causing numerical instability. Orthogonal bases and carefully chosen collocation points (like Chebyshev nodes) help maintain good conditioning.

<a id="two-main-solution-approaches"></a>

#### Two Main Solution Approaches

We have two fundamentally different ways to solve the projection equations: **function iteration** (exploiting fixed-point structure) and **Newton’s method** (exploiting smoothness). The choice depends on whether the original operator equation has contraction properties and how well those properties are preserved by the finite-dimensional approximation.

<a id="method-1-function-iteration-successive-approximation"></a>

##### Method 1: Function Iteration (Successive Approximation)

When the operator equation has the form $f = \mathsf{T} f$ where $\mathsf{T}$ is a contraction, the most natural approach is to iterate the operator directly:

<a id="izF5Cixlc3"></a>

$$
\hat{f}^{(k+1)} = \mathsf{T} \hat{f}^{(k)}.
$$

[(20)](#izF5Cixlc3 "Link to this Equation")

The infinite-dimensional iteration becomes a finite-dimensional iteration in coefficient space once we choose our weighted residual method. Given a current approximation $\hat{f}^{(k)}(x; \theta^{(k)})$, how do we find the coefficients $\theta^{(k+1)}$ for the next iterate $\hat{f}^{(k+1)}$?

Different weighted residual methods answer this differently. For **collocation**, we proceed in two steps:

1.  **Evaluate the operator**: At each collocation point $x_i$, compute what the next iterate should be: $t_i^{(k)} = (\mathsf{T} \hat{f}^{(k)})(x_i)$. These $n$ target values tell us what $\hat{f}^{(k+1)}$ should equal at the collocation points.
    
2.  **Find matching coefficients**: Determine $\theta^{(k+1)}$ so that $\hat{f}^{(k+1)}(x_i; \theta^{(k+1)}) = t_i^{(k)}$ for all $i$. This is a linear system: $\sum_j \theta_j^{(k+1)} \varphi_j(x_i) = t_i^{(k)}$.
    

In matrix form: $\boldsymbol{\Phi} \theta^{(k+1)} = t^{(k)}$, where $\boldsymbol{\Phi}$ is the collocation matrix with entries $\Phi_{ij} = \varphi_j(x_i)$. Solving this system gives $\theta^{(k+1)} = \boldsymbol{\Phi}^{-1} t^{(k)}$.

For **Galerkin**, the projection condition $\langle \hat{f}^{(k+1)} - \mathsf{T} \hat{f}^{(k+1)}, \varphi_i \rangle_w = 0$ directly gives a system for $\theta^{(k+1)}$. When $\mathsf{T}$ is linear in its argument (as in many integral equations), this is a linear system. When $\mathsf{T}$ is nonlinear (as in the Bellman equation), we must solve a nonlinear system at each iteration, though each solution still only involves $n$ unknowns rather than an infinite-dimensional function.

When $\mathsf{T}$ is a contraction in the infinite-dimensional space with constant $\gamma < 1$, iterating it pulls any starting function toward the unique fixed point. The hope is that the finite-dimensional operator, evaluating $\mathsf{T}$ and projecting back onto the span of the basis functions, inherits this contraction property. When it does, function iteration converges globally from any initial guess, with each iteration reducing the error by a factor of roughly $\gamma$. This is computationally attractive: we only evaluate the operator and solve a linear system (for collocation) or a relatively simple system (for other methods).

However, the finite-dimensional approximation doesn’t always preserve contraction. High-order polynomial bases, in particular, can create oscillations between basis functions that amplify rather than contract errors. Even when contraction is preserved, convergence can be painfully slow when $\gamma$ is close to 1, the “weak contraction” regime common in economic problems with patient agents ($\gamma \approx 0.95$ or higher). Finally, not all operator equations naturally present themselves as contractions; some require reformulation (like $f = f - \alpha \mathsf{N}(f)$), and finding a good $\alpha$ can be problem-specific.

<a id="method-2-newtons-method"></a>

##### Method 2: Newton’s Method

Alternatively, we can treat the projection equations as a rootfinding problem $G(\theta) = 0$ where $G_i(\theta) = P_i(\theta)$ for test function methods, or solve the first-order conditions for least squares. **Newton’s method** uses the update:

<a id="Nrpa9YfhS4"></a>

$$
\theta^{(k+1)} = \theta^{(k)} - J_G(\theta^{(k)})^{-1} G(\theta^{(k)}),
$$

[(21)](#Nrpa9YfhS4 "Link to this Equation")

where $J_G(\theta)$ is the Jacobian of $G$ at $\theta$.

To apply this update, we must compute the Jacobian entries $J_{ij} = \frac{\partial G_i}{\partial \theta_j}$. For collocation, $G_i(\theta) = \hat{f}(x_i; \theta) - (\mathsf{T} \hat{f}(\cdot; \theta))(x_i)$, so:

<a id="GKD3MwiCtq"></a>

$$
\frac{\partial G_i}{\partial \theta_j} = \frac{\partial \hat{f}(x_i; \theta)}{\partial \theta_j} - \frac{\partial (\mathsf{T} \hat{f}(\cdot; \theta))(x_i)}{\partial \theta_j}.
$$

[(22)](#GKD3MwiCtq "Link to this Equation")

The first term is straightforward (it’s just $\varphi_j(x_i)$ for a linear approximation). The second term requires differentiating the operator $\mathsf{T}$ with respect to the parameters.

When $\mathsf{T}$ involves optimization (as in the Bellman operator $\mathsf{L} v = \max_a \{r(s,a) + \gamma \mathbb{E}[v(s')]\}$), computing this derivative appears problematic because the max operator is not differentiable. However, the **Envelope Theorem** resolves this difficulty.

_Before reading the box below, try differentiating $v(\theta) = \max_x f(x, \theta)$ using the chain rule. What term involving $\partial x^*/\partial \theta$ appears? Why might this term vanish at an optimum?_

The Envelope Theorem

**Setup:** Consider a smooth objective function $f(\mathbf{x}, \boldsymbol{\theta})$ and define the optimal value:

<a id="SlNWEn37rN"></a>

$$
v(\boldsymbol{\theta}) = \max_{\mathbf{x}} f(\mathbf{x}, \boldsymbol{\theta}).
$$

[(23)](#SlNWEn37rN "Link to this Equation")

Let $\mathbf{x}^*(\boldsymbol{\theta})$ denote the maximizer, satisfying the first-order condition $\nabla_{\mathbf{x}} f(\mathbf{x}^*(\boldsymbol{\theta}), \boldsymbol{\theta}) = \mathbf{0}$.

**The Result:** To find how the optimal value changes with $\boldsymbol{\theta}$, we can compute:

<a id="Vxjm285cF0"></a>

$$
\nabla_{\boldsymbol{\theta}} v(\boldsymbol{\theta}) = \nabla_{\boldsymbol{\theta}} f(\mathbf{x}^*(\boldsymbol{\theta}), \boldsymbol{\theta}).
$$

[(24)](#Vxjm285cF0 "Link to this Equation")

That is, differentiate the objective with respect to $\boldsymbol{\theta}$ while treating the maximizer $\mathbf{x}^*$ as constant. We don’t need to compute $\frac{\partial \mathbf{x}^*}{\partial \boldsymbol{\theta}}$ because at the optimum, small changes in $\mathbf{x}$ don’t affect the value (first-order condition), so the direct effect dominates.

**Why it works:** By the chain rule, $\nabla_{\boldsymbol{\theta}} v = \nabla_{\boldsymbol{\theta}} f + \underbrace{(\nabla_{\mathbf{x}} f)^{\top}}_{\mathbf{0} \text{ at optimum}} \frac{\partial \mathbf{x}^*}{\partial \boldsymbol{\theta}}$.

**Application to Bellman equations:** For $[\mathsf{L} v](s) = \max_a \{r(s,a) + \gamma \mathbb{E}[v(s')]\}$, the derivative with respect to parameters in $v$ can be computed by treating the optimal action as constant. For example, if $v(s; \theta) = \sum_j \theta_j \varphi_j(s)$:

<a id="nIat0hpR5t"></a>

$$
\frac{\partial [\mathsf{L} v](s)}{\partial \theta_j} = \gamma \mathbb{E}[\varphi_j(s') \mid s, a^*(s; \theta)],
$$

[(25)](#nIat0hpR5t "Link to this Equation")

where $a^*(s; \theta)$ is the optimal action given parameters $\theta$.

**Important assumptions:** The objective $f$ is smooth, the maximizer is unique and in the interior (or constraints are smooth with stable active sets), and the first-order condition holds.

With the Envelope Theorem providing a tractable way to compute Jacobians for problems involving optimization, Newton’s method becomes practical for weighted residual methods applied to Bellman equations and similar problems. The method offers **quadratic convergence** near the solution. Once in the neighborhood of the true fixed point, Newton’s method typically converges in just a few iterations. Unlike function iteration, it doesn’t rely on the finite-dimensional approximation preserving any contraction property, making it applicable to a broader range of problems, particularly those with high-order polynomial bases or large discount factors where function iteration struggles.

However, Newton’s method demands more from both the algorithm and the user. Each iteration requires computing and solving a full Jacobian system, making the per-iteration cost significantly higher than function iteration. The method is also sensitive to initialization: started far from the solution, Newton’s method may diverge or converge to spurious fixed points that the finite-dimensional problem introduces but the original infinite-dimensional problem lacks. When applying the Envelope Theorem, implementation becomes more complex. We must track the optimal action at each evaluation point and compute the Jacobian entries using the formula above (expected basis function values at next states under optimal actions), though the economic interpretation (tracking how value propagates through optimal decisions) often makes the computation conceptually clearer than explicit derivative calculations would be.

<a id="comparison-and-practical-recommendations"></a>

##### Comparison and Practical Recommendations

| **Method** | **Convergence** | **Per-iteration cost** | **Initial guess sensitivity** |
| --- | --- | --- | --- |
| **Function iteration** | Linear (when contraction holds) | Low | Robust |
| **Newton’s method** | Quadratic (near solution) | Moderate (Jacobian + solve) | Requires good initial guess |

Which method to use? When the problem has strong contraction (small $\gamma$, well-conditioned bases, shape-preserving approximations like linear interpolation or splines), function iteration is simple and robust. For weak contraction (large $\gamma$, high-order polynomials), a hybrid approach works well: run function iteration for several iterations to enter the basin of attraction, then switch to Newton’s method for rapid final convergence. When the finite-dimensional approximation destroys contraction entirely (common with non-monotone bases), Newton’s method may be necessary from the start, though careful initialization (from a coarser approximation or perturbation methods) is required.

Quasi-Newton methods like BFGS or Broyden offer a middle ground. They approximate the Jacobian using function evaluations only, avoiding explicit derivative computations while maintaining superlinear convergence. This can be useful when computing the exact Jacobian via the Envelope Theorem is expensive or when the approximation quality is acceptable.

<a id="step-5-verify-the-solution"></a>

### Step 5: Verify the Solution

Once we have computed a candidate solution $\hat{f}$, we must verify its quality. Projection methods optimize $\hat{f}$ with respect to specific criteria (specific test functions or collocation points), but we should check that the residual is small everywhere, including directions or points we did not optimize over.

Typical diagnostic checks include:

-   Computing $\|R(\cdot; \theta)\|$ using a more accurate quadrature rule than was used in the optimization
    
-   Evaluating $R(x; \theta)$ at many points not used in the fitting process
    
-   If using Galerkin with the first $n$ basis functions, checking orthogonality against higher-order basis functions
    

In summary, we have established a template: parameterize the unknown function using basis functions, define a residual measuring how far from a solution we are, and impose conditions via inner products with test functions. Different test functions yield different methods: Galerkin uses the basis itself, collocation uses delta functions at chosen points, and least squares uses residual gradients. We now apply this framework to the Bellman equation.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Weighted-residual methods replace an unknown function by finitely many basis coefficients and determine them by testing the residual. Collocation tests at selected points, Galerkin methods test against basis functions, and least squares minimizes an aggregate residual. Each choice specifies what it means for an approximate function to satisfy the original equation.

The framework is independent of the equation being solved. What additional stability questions arise when the residual is a Bellman residual and the underlying operator is a contraction? [Approximate Bellman equations](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md) connect the projection to value and Q iteration.

<a id="self-checks"></a>

## Self-checks

<a id="ex-projection-check-1"></a>

[Exercise 1](#ex-projection-check-1 "Link to this Exercise") (Orthogonality condition)

In a Galerkin method with basis functions $\phi_i$, against which functions is the Bellman residual required to be orthogonal?

Solution to [Exercise 1](#ex-projection-check-1)

Against the same basis functions: $\langle \phi_i,\mathsf{L} v-v\rangle=0$ for every $i$.

<a id="ex-projection-check-2"></a>

[Exercise 2](#ex-projection-check-2 "Link to this Exercise") (Collocation versus least squares)

What is the main distinction between collocation and least-squares residual fitting?

Solution to [Exercise 2](#ex-projection-check-2)

Collocation forces the residual to vanish at selected points. Least squares minimizes an aggregate squared residual over a sampling or weighting distribution.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Chakraverty2019"></a>
2.  Chakraverty, S., Mahato, N. R., Karunakar, P., & Rao, T. D. (2019). Weighted Residual Methods. In _Advanced Numerical and Semi-Analytical Methods for Differential Equations_ (pp. 25–44). John Wiley & Sons, Inc. [10.1002/9781119423461.ch3](https://doi.org/10.1002/9781119423461.ch3)
<a id="cite-AtkinsonPotra1987"></a>
4.  Atkinson, K. E., & Potra, F. A. (1987). Projection and Iterated Projection Methods for Nonlinear Integral Equations. _SIAM Journal on Numerical Analysis_, _24_(6), 1352–1373. [10.1137/0724087](https://doi.org/10.1137/0724087)

[

Dynamic Programming

Smooth and Regularized Dynamic Programming


](19-regularized-dp.md)[

Approximate Value Methods

Approximate Bellman Equations


](21-approximate-bellman-equations.md)


---

# CHAPITRE 21 — Approximate Bellman Equations

Section du livre : Approximate Value Methods

Page originale : https://pierrelucbacon.com/rlbook/approximate-bellman-equations

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md

> **Cours de Pierre-Luc Bacon — 21.** [Page publiée](https://pierrelucbacon.com/rlbook/approximate-bellman-equations) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/21-approximate-bellman-equations.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Approximate Bellman Equations

<a id="skip-to-article"></a>

Weighted-residual methods specify approximation spaces and tests for a general functional equation. What changes when the residual contains a Bellman operator whose contraction properties are responsible for convergence?

Consider the Bellman optimality equation $v(s) = \mathsf{L} v(s) = \max_{a \in \mathcal{A}_s} \{ r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) v(j) \}$. For a candidate approximation $\hat{v}(s) = \sum_{i=1}^n \theta_i \varphi_i(s)$, the residual is:

<a id="SwTzEPHkvh"></a>

$$
R(s; \theta) = \mathsf{L}\hat{v}(s) - \hat{v}(s) = \max_{a \in \mathcal{A}_s} \left\{ r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) \hat{v}(j) \right\} - \sum_{i=1}^n \theta_i \varphi_i(s).
$$

[(1)](#SwTzEPHkvh "Link to this Equation")

We examine how collocation and Galerkin, the two most common weighted residual methods for Bellman equations, specialize the general solution approaches from Step 4.

<a id="collocation"></a>

### Collocation

For collocation, we choose $n$ states $\{s_1, \ldots, s_n\}$ and require the Bellman equation to hold exactly at these points:

<a id="IN3HGb8Y41"></a>

$$
\sum_{j=1}^n \theta_j \varphi_j(s_i) = \max_{a \in \mathcal{A}_{s_i}} \left\{ r(s_i,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s_i,a) \sum_{\ell=1}^n \theta_\ell \varphi_\ell(j) \right\}, \quad i = 1, \ldots, n.
$$

[(2)](#IN3HGb8Y41 "Link to this Equation")

It helps to define the **parametric Bellman operator** $\mathrm{L}_\varphi: \mathbb{R}^n \to \mathbb{R}^n$ by $[\mathrm{L}_\varphi(\theta)]_i = [\mathsf{L}\hat{v}(\cdot; \theta)](s_i)$, the Bellman operator evaluated at collocation point $s_i$. Let $\boldsymbol{\Phi}$ be the $n \times n$ matrix with entries $\Phi_{ij} = \varphi_j(s_i)$. Then the collocation equations become $\boldsymbol{\Phi} \theta = \mathrm{L}_\varphi(\theta)$.

Under function iteration, the current coefficients $\theta^{(k)}$ produce the target values $t_i^{(k)}=[\mathrm{L}_\varphi(\theta^{(k)})]_i$ at the collocation points. The linear system $\boldsymbol{\Phi}\theta^{(k+1)}=t^{(k)}$ then interpolates those values. Each iteration therefore applies the Bellman operator and constructs its polynomial interpolant at the selected points.

<a id="collocation-function-iteration"></a>

[Algorithm 1](#collocation-function-iteration "Link to this Algorithm") (Collocation with Function Iteration)

**Input** Collocation points $\{s_1, \ldots, s_n\}$, basis functions $\{\varphi_1, \ldots, \varphi_n\}$, initial $\theta^{(0)}$, tolerance $\varepsilon > 0$

**Output** Converged coefficients $\theta^*$

1.  Form collocation matrix $\boldsymbol{\Phi}$ with $\Phi_{ij} = \varphi_j(s_i)$
    
2.  $k \leftarrow 0$
    
3.  **repeat**
    
    1.  For each $i = 1, \ldots, n$:
        
        1.  $t_i^{(k)} \leftarrow \max_{a \in \mathcal{A}_{s_i}} \left\{ r(s_i, a) + \gamma \sum_{j \in \mathcal{S}} p(j|s_i, a) \sum_{\ell=1}^n \theta_\ell^{(k)} \varphi_\ell(j) \right\}$
            
    2.  Solve $\boldsymbol{\Phi} \theta^{(k+1)} = t^{(k)}$
        
    3.  $k \leftarrow k + 1$
        
4.  **until** $\|\theta^{(k)} - \theta^{(k-1)}\| < \varepsilon$
    
5.  **return** $\theta^{(k)}$
    

When the state space is continuous, we approximate expectations using numerical quadrature (Gauss-Hermite for normal shocks, etc.). The method is simple and robust when the finite-dimensional approximation preserves contraction, but can be slow for large discount factors.

**Newton’s method** for collocation treats the problem as rootfinding: $G(\theta) = \boldsymbol{\Phi} \theta - \mathrm{L}_\varphi(\theta) = 0$. The Jacobian is $J_G = \boldsymbol{\Phi} - J_{\mathrm{L}_\varphi}$, where the Envelope Theorem (Step 4) gives us $[J_{\mathrm{L}_\varphi}]_{ij} = \gamma \sum_{s'} p(s'|s_i, a_i^*(\theta)) \varphi_j(s')$. Here $a_i^*(\theta)$ is the optimal action at collocation point $s_i$ given the current coefficients.

<a id="collocation-newton"></a>

[Algorithm 2](#collocation-newton "Link to this Algorithm") (Collocation with Newton’s Method)

**Input** Collocation points $\{s_1, \ldots, s_n\}$, basis functions $\{\varphi_1, \ldots, \varphi_n\}$, initial $\theta^{(0)}$, tolerance $\varepsilon > 0$

**Output** Converged coefficients $\theta^*$

1.  Form collocation matrix $\boldsymbol{\Phi}$ with $\Phi_{ij} = \varphi_j(s_i)$
    
2.  $k \leftarrow 0$
    
3.  **repeat**
    
    1.  For each $i = 1, \ldots, n$:
        
        1.  $t_i^{(k)} \leftarrow \max_{a \in \mathcal{A}_{s_i}} \left\{ r(s_i, a) + \gamma \sum_{j \in \mathcal{S}} p(j|s_i, a) \sum_{\ell=1}^n \theta_\ell^{(k)} \varphi_\ell(j) \right\}$
            
        2.  Store $a_i^* \in \arg\max$ achieving the maximum
            
    2.  Compute Jacobian: $[J_{\mathrm{L}_\varphi}]_{ij} = \gamma \sum_{j \in \mathcal{S}} p(j|s_i, a_i^*) \varphi_j(j)$ for all $i,j$
        
    3.  Solve $(\boldsymbol{\Phi} - J_{\mathrm{L}_\varphi}) \Delta\theta = \boldsymbol{\Phi} \theta^{(k)} - t^{(k)}$
        
    4.  $\theta^{(k+1)} \leftarrow \theta^{(k)} - \Delta\theta$
        
    5.  $k \leftarrow k + 1$
        
4.  **until** $\|\Delta\theta\| < \varepsilon$
    
5.  **return** $\theta^{(k)}$
    

This converges rapidly near the solution but requires good initialization and more computation per iteration than function iteration. The method is equivalent to policy iteration: each step evaluates the value of the current greedy policy, then improves it.

Why is collocation popular for Bellman equations? Because it avoids integration when testing the residual. We only evaluate the Bellman operator at $n$ discrete points. In contrast, Galerkin requires integrating the residual against each basis function.

<a id="worked-example-collocation-on-the-optimal-stopping-problem"></a>

#### Worked Example: Collocation on the Optimal Stopping Problem

Returning to our motivating example, let us trace through the collocation algorithm with $n = 4$ polynomial basis functions at Chebyshev nodes:

<a id="of8OOT5uFe"></a>

Source

```python
import numpy as np
from scipy.integrate import quad

gamma = 0.9
n = 4

# Chebyshev nodes on [0, 1]
k = np.arange(1, n + 1)
nodes = 0.5 + 0.5 * np.cos((2*k - 1) * np.pi / (2*n))
nodes = np.sort(nodes)

# Vandermonde matrix
Phi = np.vander(nodes, n, increasing=True)

# Exact solution
v_bar_exact = (1 - np.sqrt(1 - gamma**2)) / gamma**2
s_star_exact = gamma * v_bar_exact
def v_exact(s):
    return np.where(s >= s_star_exact, s, gamma * v_bar_exact)

# Collocation iteration
theta = np.zeros(n)
print("Collocation iteration trace:")
print(f"{'Iter':<6} {'||theta||':<12} {'Max error':<12}")
print("-" * 30)

for iteration in range(15):
    def v_approx(s, th=theta):
        return sum(th[j] * s**j for j in range(n))
    v_bar, _ = quad(v_approx, 0, 1)
    test_points = np.linspace(0, 1, 100)
    max_error = max(abs(v_approx(s) - v_exact(s)) for s in test_points)
    print(f"{iteration:<6} {np.linalg.norm(theta):<12.6f} {max_error:<12.6f}")
    
    targets = np.maximum(nodes, gamma * v_bar)
    theta_new = np.linalg.solve(Phi, targets)
    if np.linalg.norm(theta_new - theta) < 1e-10:
        print(f"\nConverged in {iteration + 1} iterations")
        break
    theta = theta_new
```

```
Collocation iteration trace:
Iter   ||theta||    Max error   
------------------------------
0      0.000000     1.000000    
1      1.000000     0.626789    
2      1.613062     0.198576    
3      0.706118     0.087935    
4      1.044850     0.039335    
5      1.292433     0.032162    
6      1.412062     0.033449    
7      1.467070     0.034028    
8      1.492030     0.034289    
9      1.503301     0.034406    
10     1.508381     0.034459    
11     1.510668     0.034483    
12     1.511698     0.034493    
13     1.512161     0.034498    
14     1.512370     0.034500
```

<a id="galerkin"></a>

### Galerkin

For Galerkin, we use the basis functions themselves as test functions. The conditions are:

<a id="nqCwJgIA6Q"></a>

$$
\int_{\mathcal{S}} [\mathsf{L}\hat{v}(s; \theta) - \hat{v}(s; \theta)] \varphi_i(s) w(s) ds = 0, \quad i = 1, \ldots, n.
$$

[(3)](#nqCwJgIA6Q "Link to this Equation")

where $w(s)$ is a weight function (often the stationary distribution $d^\pi(s)$ in RL applications, or simply $w(s) = 1$). Expanding this:

<a id="CaTCanCAZC"></a>

$$
\int_{\mathcal{S}} \left[ \max_a \left\{ r(s,a) + \gamma \mathbb{E}[v(s')] \right\} - \sum_j \theta_j \varphi_j(s) \right] \varphi_i(s) w(s) ds = 0.
$$

[(4)](#CaTCanCAZC "Link to this Equation")

**Function iteration** for Galerkin works differently than for collocation. Given $\theta^{(k)}$, we cannot simply evaluate the Bellman operator and fit. Instead, we must solve an integral equation. At each iteration, we seek $\theta^{(k+1)}$ satisfying:

<a id="VcGy0jWIWz"></a>

$$
\int_{\mathcal{S}} \sum_j \theta_j^{(k+1)} \varphi_j(s) \varphi_i(s) w(s) ds = \int_{\mathcal{S}} [\mathsf{L}\hat{v}(s; \theta^{(k)})] \varphi_i(s) w(s) ds.
$$

[(5)](#VcGy0jWIWz "Link to this Equation")

<a id="galerkin-function-iteration"></a>

[Algorithm 3](#galerkin-function-iteration "Link to this Algorithm") (Galerkin with Function Iteration)

**Input** Basis functions $\{\varphi_1, \ldots, \varphi_n\}$, weight function $w(s)$, initial $\theta^{(0)}$, tolerance $\varepsilon > 0$

**Output** Converged coefficients $\theta^*$

1.  Compute mass matrix $M_{ij} = \int_{\mathcal{S}} \varphi_i(s) \varphi_j(s) w(s) ds$ via numerical integration
    
2.  $k \leftarrow 0$
    
3.  **repeat**
    
    1.  For each $i = 1, \ldots, n$:
        
        1.  $b_i^{(k)} \leftarrow \int_{\mathcal{S}} [\mathsf{L}\hat{v}(s; \theta^{(k)})] \varphi_i(s) w(s) ds$ via numerical integration
            
    2.  Solve $M \theta^{(k+1)} = b^{(k)}$
        
    3.  $k \leftarrow k + 1$
        
4.  **until** $\|\theta^{(k)} - \theta^{(k-1)}\| < \varepsilon$
    
5.  **return** $\theta^{(k)}$
    

The left side is a linear system (the “mass matrix” $M_{ij} = \int \varphi_i \varphi_j w$), and the right side requires integrating the Bellman operator output against each test function. When the basis functions are orthogonal polynomials with matching weight $w$, the mass matrix is diagonal, simplifying the solve. But we still need numerical integration to evaluate the right side. This makes Galerkin substantially more expensive than collocation per iteration.

**Newton’s method** for Galerkin similarly requires integration. The residual is $R(s; \theta) = \mathsf{L}\hat{v}(s; \theta) - \hat{v}(s; \theta)$, and we need $G_i(\theta) = \int R(s; \theta) \varphi_i(s) w(s) ds = 0$. The Jacobian entry is:

<a id="lwpGU3goIR"></a>

$$
J_{ij} = \int \left[ \frac{\partial \mathsf{L}\hat{v}(s; \theta)}{\partial \theta_j} - \varphi_j(s) \right] \varphi_i(s) w(s) ds.
$$

[(6)](#lwpGU3goIR "Link to this Equation")

<a id="galerkin-newton"></a>

[Algorithm 4](#galerkin-newton "Link to this Algorithm") (Galerkin with Newton’s Method)

**Input** Basis functions $\{\varphi_1, \ldots, \varphi_n\}$, weight function $w(s)$, initial $\theta^{(0)}$, tolerance $\varepsilon > 0$

**Output** Converged coefficients $\theta^*$

1.  $k \leftarrow 0$
    
2.  **repeat**
    
    1.  For each $i = 1, \ldots, n$:
        
        1.  $G_i^{(k)} \leftarrow \int_{\mathcal{S}} [\mathsf{L}\hat{v}(s; \theta^{(k)}) - \hat{v}(s; \theta^{(k)})] \varphi_i(s) w(s) ds$
            
        2.  For each $j = 1, \ldots, n$:
            
            1.  $J_{ij} \leftarrow \int_{\mathcal{S}} \left[ \gamma \mathbb{E}[\varphi_j(s') \mid s, a^*(s;\theta^{(k)})] - \varphi_j(s) \right] \varphi_i(s) w(s) ds$
                
    2.  Solve $J \Delta\theta = G^{(k)}$
        
    3.  $\theta^{(k+1)} \leftarrow \theta^{(k)} - \Delta\theta$
        
    4.  $k \leftarrow k + 1$
        
3.  **until** $\|\Delta\theta\| < \varepsilon$
    
4.  **return** $\theta^{(k)}$
    

The Envelope Theorem gives $\frac{\partial \mathsf{L}\hat{v}(s; \theta)}{\partial \theta_j} = \gamma \mathbb{E}[\varphi_j(s') \mid s, a^*(s;\theta)]$, so we must integrate expected basis function values (under optimal actions) against test functions and weight. This requires both numerical integration and careful tracking of optimal actions across the state space, making it substantially more complex than collocation’s pointwise evaluation.

The advantage of Galerkin over collocation lies in its theoretical properties: when using orthogonal polynomials, Galerkin provides optimal approximation in the weighted $L^2$ norm. For smooth problems, this can yield better accuracy per degree of freedom than collocation. In practice, collocation’s computational simplicity usually outweighs Galerkin’s theoretical optimality for Bellman equations, especially in high-dimensional problems where integration becomes prohibitively expensive.

The algorithms above reduce the infinite-dimensional Bellman fixed-point problem to finite-dimensional coefficient computation. Collocation avoids integration entirely by requiring exact satisfaction at discrete points, while Galerkin imposes weighted orthogonality conditions requiring numerical quadrature. Both can be solved via function iteration (when contraction is preserved) or Newton’s method (for faster convergence near the solution). The discrete MDP specialization below reveals connections to algorithms widely used in reinforcement learning.

Exercises: Collocation and Galerkin

1.  **Effect of collocation points.** For the optimal stopping problem, compare collocation with $n=4$ Chebyshev nodes versus $n=4$ equally-spaced nodes. Which choice gives smaller maximum error?
    
2.  **Threshold location.** The optimal stopping policy has a threshold structure. Using your polynomial approximation $\hat{v}(s)$, estimate the threshold by finding where $\hat{v}(s) = s$. Compare to the exact threshold.
    
3.  **Orthogonal polynomials.** For $\mathcal{S} = [-1, 1]$, write out the Galerkin conditions using Chebyshev polynomials $T_i$ and weight $w(x) = 1/\sqrt{1-x^2}$. What makes this choice computationally convenient?
    
4.  **Newton vs. function iteration.** How does the iteration count depend on $\gamma$? Try $\gamma \in \{0.5, 0.9, 0.99\}$.
    

<a id="galerkin-for-discrete-mdps-lstd-and-lspi"></a>

### Galerkin for Discrete MDPs: LSTD and LSPI

When the state space is discrete and finite, the Galerkin conditions simplify dramatically. The integrals become sums, and we can write everything in matrix form. This specialization shows the connection to algorithms widely used in reinforcement learning.

For a discrete state space $\mathcal{S} = \{s_1, \ldots, s_m\}$, the Galerkin orthogonality conditions

<a id="hTkrn0PmJD"></a>

$$
\int_{\mathcal{S}} [\mathsf{L}\hat{v}(s; \theta) - \hat{v}(s; \theta)] \varphi_i(s) w(s) ds = 0
$$

[(7)](#hTkrn0PmJD "Link to this Equation")

become weighted sums over states:

<a id="AUwkE2qHwv"></a>

$$
\sum_{s \in \mathcal{S}} \xi(s) [\mathsf{L}\hat{v}(s; \theta) - \hat{v}(s; \theta)] \varphi_i(s) = 0, \quad i = 1, \ldots, n,
$$

[(8)](#AUwkE2qHwv "Link to this Equation")

where $\xi(s) \geq 0$ with $\sum_s \xi(s) = 1$ is a probability distribution over states. Define the feature matrix $\boldsymbol{\Phi} \in \mathbb{R}^{m \times n}$ with entries $\Phi_{si} = \varphi_i(s)$ (each row contains the features for one state), and let $\boldsymbol{\Xi} = \text{diag}(\xi)$ be the diagonal matrix with the state distribution on the diagonal.

<a id="policy-evaluation-lstd"></a>

#### Policy Evaluation: LSTD

For **policy evaluation** with a fixed policy $\pi$, the Bellman operator is linear:

<a id="tZAfI2E8qa"></a>

$$
[\mathsf{L}_\pi \hat{v}](s) = r(s, \pi(s)) + \gamma \sum_{j \in \mathcal{S}} p(j|s, \pi(s)) \hat{v}(j).
$$

[(9)](#tZAfI2E8qa "Link to this Equation")

With linear function approximation $\hat{v}(s) = \boldsymbol{\varphi}(s)^\top \theta = \sum_i \theta_i \varphi_i(s)$, this becomes:

<a id="bAsTeAdpmG"></a>

$$
[\mathsf{L}_\pi \hat{v}](s) = r(s, \pi(s)) + \gamma \sum_{j \in \mathcal{S}} p(j|s, \pi(s)) \sum_i \theta_i \varphi_i(j).
$$

[(10)](#bAsTeAdpmG "Link to this Equation")

Let $\mathbf{r}_\pi \in \mathbb{R}^m$ be the vector of rewards $[\mathbf{r}_\pi]_s = r(s, \pi(s))$, and $\mathbf{P}_\pi \in \mathbb{R}^{m \times m}$ be the transition matrix with $[\mathbf{P}_\pi]_{sj} = p(j|s, \pi(s))$. Then $\mathsf{L}_\pi \hat{v} = \mathbf{r}_\pi + \gamma \mathbf{P}_\pi \boldsymbol{\Phi} \theta$ in vector form.

The Galerkin conditions require $\langle \mathsf{L}_\pi \hat{v} - \hat{v}, \varphi_i \rangle_\xi = 0$ for all basis functions, which in matrix form is:

<a id="o9IT1vhAVt"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\mathbf{r}_\pi + \gamma \mathbf{P}_\pi \boldsymbol{\Phi} \theta - \boldsymbol{\Phi} \theta) = \mathbf{0}.
$$

[(11)](#o9IT1vhAVt "Link to this Equation")

Rearranging:

<a id="eq-lstd-galerkin"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_\pi \boldsymbol{\Phi}) \theta = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{r}_\pi.
$$

[(12)](#eq-lstd-galerkin "Link to this Equation")

This is the **LSTD (Least Squares Temporal Difference)** solution. The matrix $\mathbf{A} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_\pi \boldsymbol{\Phi})$ and vector $\mathbf{b} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{r}_\pi$ give the linear system $\mathbf{A} \theta = \mathbf{b}$.

When $\xi$ is the stationary distribution of policy $\pi$ (so $\xi^\top \mathbf{P}_\pi = \xi^\top$), this system has a unique solution, and the projected Bellman operator $\mathsf{P} \mathsf{L}_\pi$ is a contraction in the weighted $L^2$ norm $\|\cdot\|_\xi$. This is the theoretical foundation for TD learning with linear function approximation. The fixed point computed here is the same one that TD(0) converges to stochastically; we derive the incremental algorithm in the Monte Carlo chapter.

_Check that the dimensions work out: if we have $m$ states and $n$ basis functions, what are the dimensions of $\boldsymbol{\Phi}$, $\boldsymbol{\Xi}$, $\mathbf{P}_\pi$, and the matrix $\mathbf{A} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi}(\boldsymbol{\Phi} - \gamma \mathbf{P}_\pi \boldsymbol{\Phi})$?_

<a id="worked-example-lstd-for-policy-evaluation"></a>

##### Worked Example: LSTD for Policy Evaluation

To illustrate LSTD concretely, consider a 3-state Markov chain under a fixed policy:

<a id="jtAHvz1ycW"></a>

$$
\mathbf{P}_\pi = \begin{pmatrix} 0.7 & 0.2 & 0.1 \\ 0.3 & 0.4 & 0.3 \\ 0.1 & 0.3 & 0.6 \end{pmatrix}, \quad \mathbf{r}_\pi = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}.
$$

[(13)](#jtAHvz1ycW "Link to this Equation")

<a id="hj8g1d9LQP"></a>

Source

```python
import numpy as np

P_pi = np.array([[0.7, 0.2, 0.1], [0.3, 0.4, 0.3], [0.1, 0.3, 0.6]])
r_pi = np.array([1.0, 2.0, 0.0])
gamma = 0.9

# Feature matrix: phi_1(s) = 1, phi_2(s) = s
states = np.array([1, 2, 3])
Phi = np.column_stack([np.ones(3), states])

# Uniform weighting
xi = np.ones(3) / 3
Xi = np.diag(xi)

# LSTD matrices
A = Phi.T @ Xi @ (Phi - gamma * P_pi @ Phi)
b = Phi.T @ Xi @ r_pi

theta_lstd = np.linalg.solve(A, b)
v_lstd = Phi @ theta_lstd
v_exact = np.linalg.solve(np.eye(3) - gamma * P_pi, r_pi)

print(f"LSTD solution: theta = ({theta_lstd[0]:.4f}, {theta_lstd[1]:.4f})")
print(f"\n{'State':<8} {'Exact':<12} {'LSTD':<12} {'Error':<12}")
print("-" * 44)
for s in range(3):
    print(f"{s+1:<8} {v_exact[s]:<12.4f} {v_lstd[s]:<12.4f} {v_lstd[s] - v_exact[s]:<12.4f}")

# Verify orthogonality
residual = r_pi + gamma * P_pi @ v_lstd - v_lstd
print(f"\nGalerkin orthogonality: <residual, phi_1> = {np.sum(xi * residual * Phi[:,0]):.6f}")
```

```
LSTD solution: theta = (12.2772, -0.9901)

State    Exact        LSTD         Error       
--------------------------------------------
1        10.0207      11.2871      1.2664      
2        10.8717      10.2970      -0.5746     
3        8.3418       9.3069       0.9652      

Galerkin orthogonality: <residual, phi_1> = 0.000000
```

<a id="the-bellman-optimality-equation-function-iteration-and-newtons-method"></a>

#### The Bellman Optimality Equation: Function Iteration and Newton’s Method

For the **Bellman optimality equation**, the max operator introduces nonlinearity:

<a id="YNpDPEs8vB"></a>

$$
[\mathsf{L}\hat{v}](s) = \max_{a \in \mathcal{A}_s} \left\{ r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) \hat{v}(j) \right\}.
$$

[(14)](#YNpDPEs8vB "Link to this Equation")

The Galerkin conditions become:

<a id="YenMsrUO8c"></a>

$$
F(\theta) \equiv \boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\mathsf{L}\hat{v}(\cdot; \theta) - \boldsymbol{\Phi} \theta) = \mathbf{0},
$$

[(15)](#YenMsrUO8c "Link to this Equation")

where the Bellman operator must be evaluated at each state $s$ to find the optimal action and compute the target value. This is a system of $n$ nonlinear equations in $n$ unknowns.

**Function iteration** applies the Bellman operator and projects back. Given $\theta^{(k)}$, compute the greedy policy $\pi^{(k)}(s) = \arg\max_a \{r(s,a) + \gamma \sum_{j \in \mathcal{S}} p(j|s,a) \boldsymbol{\varphi}(j)^\top \theta^{(k)}\}$ at each state, then solve:

<a id="ZsGGGwb6jp"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi}) \theta^{(k+1)} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{r}_{\pi^{(k)}}.
$$

[(16)](#ZsGGGwb6jp "Link to this Equation")

This evaluates the current greedy policy using LSTD, then implicitly improves by computing a new greedy policy at the next iteration. However, convergence can be slow when the finite-dimensional approximation poorly preserves contraction.

**Newton’s method** treats $G(\theta) = 0$ as a rootfinding problem and uses the Jacobian to accelerate convergence. The Jacobian of $G$ is:

<a id="Qnt2GJ0cqQ"></a>

$$
J_G(\theta) = \frac{\partial G}{\partial \theta} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \left( \frac{\partial \mathsf{L}\hat{v}(\cdot; \theta)}{\partial \theta} - \boldsymbol{\Phi} \right).
$$

[(17)](#Qnt2GJ0cqQ "Link to this Equation")

To compute $\frac{\partial \mathsf{L}\hat{v}(s; \theta)}{\partial \theta_j}$, we use the Envelope Theorem from Step 4. At the current $\theta^{(k)}$, let $a^*(s; \theta^{(k)})$ be the optimal action at state $s$. Then:

<a id="Lt4Tb1HROF"></a>

$$
\frac{\partial [\mathsf{L}\hat{v}](s; \theta^{(k)})}{\partial \theta_j} = \gamma \sum_{j \in \mathcal{S}} p(j|s, a^*(s; \theta^{(k)})) \varphi_j(j).
$$

[(18)](#Lt4Tb1HROF "Link to this Equation")

Define the policy $\pi^{(k)}(s) = a^*(s; \theta^{(k)})$. The Jacobian becomes:

<a id="Y6PfMeiplp"></a>

$$
J_G(\theta^{(k)}) = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi} - \boldsymbol{\Phi}) = -\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi}).
$$

[(19)](#Y6PfMeiplp "Link to this Equation")

The Newton update $\theta^{(k+1)} = \theta^{(k)} - J_G(\theta^{(k)})^{-1} G(\theta^{(k)})$ simplifies. We have:

<a id="jqRl46YrtA"></a>

$$
G(\theta^{(k)}) = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\mathsf{L}\hat{v}(\cdot; \theta^{(k)}) - \boldsymbol{\Phi} \theta^{(k)}).
$$

[(20)](#jqRl46YrtA "Link to this Equation")

At each state $s$, the greedy value is $[\mathsf{L}\hat{v}(\cdot; \theta^{(k)})](s) = r(s, \pi^{(k)}(s)) + \gamma \sum_j p(j|s, \pi^{(k)}(s)) \boldsymbol{\varphi}(j)^\top \theta^{(k)}$, which equals $[\mathrm{L}_{\pi^{(k)}} \hat{v}(\cdot; \theta^{(k)})](s)$. Thus:

<a id="eWZOXD9HxN"></a>

$$
G(\theta^{(k)}) = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\mathbf{r}_{\pi^{(k)}} + \gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi} \theta^{(k)} - \boldsymbol{\Phi} \theta^{(k)}).
$$

[(21)](#eWZOXD9HxN "Link to this Equation")

The Newton step becomes:

<a id="WticRqjXCt"></a>

$$
\theta^{(k+1)} = \theta^{(k)} + [\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi})]^{-1} \boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\mathbf{r}_{\pi^{(k)}} + \gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi} \theta^{(k)} - \boldsymbol{\Phi} \theta^{(k)}).
$$

[(22)](#WticRqjXCt "Link to this Equation")

Multiplying through and simplifying:

<a id="UBrOKoDxrL"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_{\pi^{(k)}} \boldsymbol{\Phi}) \theta^{(k+1)} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{r}_{\pi^{(k)}}.
$$

[(23)](#UBrOKoDxrL "Link to this Equation")

This is **LSPI (Least Squares Policy Iteration)**. Each Newton step:

1.  Computes the greedy policy $\pi^{(k)}(s) = \arg\max_a \{r(s,a) + \gamma \sum_j p(j|s,a) \boldsymbol{\varphi}(j)^\top \theta^{(k)}\}$
    
2.  Solves the LSTD equation for this policy to get $\theta^{(k+1)}$
    

Newton’s method for the Galerkin-projected Bellman optimality equation is equivalent to policy iteration in the function approximation setting. Just as Newton’s method for collocation corresponded to policy iteration (Step 4), Newton’s method for discrete Galerkin gives LSPI.

Galerkin projection with linear function approximation reduces policy iteration to a sequence of linear systems, each solvable in closed form. For discrete MDPs, we can compute the matrices $\boldsymbol{\Phi}^\top \boldsymbol{\Xi} \boldsymbol{\Phi}$ and $\boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{P}_\pi \boldsymbol{\Phi}$ exactly.

<a id="extension-to-nonlinear-approximators"></a>

## Extension to Nonlinear Approximators

What remains of the residual formulation when the value function is represented by a nonlinear model rather than a linear basis expansion?

The weighted residual methods developed so far have focused on linear function classes: polynomial bases, piecewise linear interpolants, and linear combinations of fixed basis functions. Neural networks, kernel methods, and decision trees do not fit this template. How does the framework extend to nonlinear approximators?

Recall the Galerkin approach for linear approximation $v_{\boldsymbol{\theta}} = \sum_{i=1}^d \theta_i \varphi_i$. The orthogonality conditions $\langle v - \mathsf{L} v, \varphi_i \rangle_w = 0$ for all $i$ define a linear system with a closed-form solution. These equations arise from minimizing $\|v - \mathsf{L} v\|_w^2$ over the subspace, since at the minimum, the gradient with respect to each coefficient must vanish. The connection between norm minimization and orthogonality holds generally. For any norm $\|\cdot\|_w$ induced by an inner product $\langle \cdot, \cdot \rangle_w$, minimizing $\|f(\boldsymbol{\theta})\|_w^2$ with respect to parameters requires $\frac{\partial}{\partial \theta_i} \|f(\boldsymbol{\theta})\|_w^2 = 0$. Since $\|f\|_w^2 = \langle f, f \rangle_w$, the chain rule gives $2\langle f, \frac{\partial f}{\partial \theta_i} \rangle_w = 0$. Minimizing the residual norm is thus equivalent to requiring orthogonality $\langle f, \frac{\partial f}{\partial \theta_i} \rangle_w = 0$ for all $i$. The equivalence holds for any choice of inner product: weighted $L^2$ integrals for Galerkin, sums over collocation points for collocation, or sampled expectations for neural networks.

For nonlinear function classes parameterized by $\boldsymbol{\theta} \in \mathbb{R}^p$ (neural networks, kernel expansions), the same minimization principle applies:

<a id="hYPzd4OI0S"></a>

$$
\boldsymbol{\theta}^* = \arg\min_{\boldsymbol{\theta}} \|v_{\boldsymbol{\theta}} - \mathsf{L} v_{\boldsymbol{\theta}}\|_w^2.
$$

[(24)](#hYPzd4OI0S "Link to this Equation")

The first-order stationarity condition yields orthogonality:

<a id="qYSGrKG2XW"></a>

$$
\Big\langle v_{\boldsymbol{\theta}} - \mathsf{L} v_{\boldsymbol{\theta}}, \frac{\partial v_{\boldsymbol{\theta}}}{\partial \theta_i} \Big\rangle_w = 0 \quad \text{for all } i.
$$

[(25)](#qYSGrKG2XW "Link to this Equation")

The test functions are now the partial derivatives $\frac{\partial v_{\boldsymbol{\theta}}}{\partial \theta_i}$, which span the tangent space to the manifold $\{v_{\boldsymbol{\theta}} : \boldsymbol{\theta} \in \mathbb{R}^p\}$ at the current parameters. In the linear case $v_{\boldsymbol{\theta}} = \sum_i \theta_i \varphi_i$, the partial derivative $\frac{\partial v_{\boldsymbol{\theta}}}{\partial \theta_i} = \varphi_i$ recovers the fixed basis functions of Galerkin. For nonlinear parameterizations, the test functions change with $\boldsymbol{\theta}$, and the orthogonality conditions define a nonlinear system solved by iterative gradient descent.

The **dual pairing** formulation Legrand & Junca (2025) extends this framework to settings where test objects need not be regular functions. We have been informal about this distinction in our treatment of collocation, but the Dirac deltas $\delta(x - x_i)$ used there are not classical functions. They are distributions, defined rigorously only through their action on test functions via $\langle \mathsf{N}(v), \delta(x - x_i) \rangle = (\mathsf{N} v)(x_i)$. The simple calculus argument for orthogonality does not apply directly to such objects; the dual pairing framework provides the proper mathematical foundation. The induced dual norm $\|\mathsf{N}(v)\|_* = \sup_{\|w\|=1} |\langle \mathsf{N}(v), w \rangle|$ measures residuals by their worst-case effect on test functions, a perspective that has inspired adversarial formulations [Zang _et al._ (2020)](https://doi.org/10.1016/j.jcp.2020.109409) where both trial and test functions are learned.

The minimum residual framework thus connects classical projection methods to modern function approximation. The unifying principle is orthogonality of residuals to test functions. Linear methods use fixed test functions and admit closed-form solutions. Nonlinear methods use parameter-dependent test functions and require iterative optimization.

We now turn to the question of convergence: when does the iteration $v_{k+1} = \mathsf{P} \mathsf{L} v_k$ converge?

<a id="monotone-projection-and-the-preservation-of-contraction"></a>

## Monotone Projection and the Preservation of Contraction

Which approximation maps preserve order and sup-norm contraction when composed with a Bellman operator?

The informal discussion of shape preservation hints at a deeper theoretical question: **when does the function iteration method converge?** Recall from our discussion of collocation that function iteration proceeds in two steps:

1.  Apply the Bellman operator at collocation points: $t^{(k)} = v(\theta^{(k)})$ where $t_i^{(k)} = \mathsf{L}\hat{v}^{(k)}(s_i)$
    
2.  Fit new coefficients to match these targets: $\boldsymbol{\Phi} \theta^{(k+1)} = t^{(k)}$, giving $\theta^{(k+1)} = \boldsymbol{\Phi}^{-1} v(\theta^{(k)})$
    

We can reinterpret this iteration in **function space** rather than coefficient space. Let $\mathsf{P}$ be the **projection operator** that takes any function $f$ and returns its approximation in $\text{span}\{\varphi_1, \ldots, \varphi_n\}$. For collocation, $\mathsf{P}$ is the interpolation operator: $(\mathsf{P} f)(s)$ is the unique linear combination of basis functions that matches $f$ at the collocation points. Then Step 2 can be written as: fit $\hat{v}^{(k+1)}$ so that $\hat{v}^{(k+1)}(s_i) = \mathsf{L}\hat{v}^{(k)}(s_i)$ for all collocation points, which means $\hat{v}^{(k+1)} = \mathsf{P}(\mathsf{L}\hat{v}^{(k)})$.

In other words, function iteration is equivalent to **projected value iteration in function space**:

<a id="k4zr7Oepfe"></a>

$$
\hat{v}^{(k+1)} = \mathsf{P} \mathsf{L} \hat{v}^{(k)}.
$$

[(26)](#k4zr7Oepfe "Link to this Equation")

We know that standard value iteration $v_{k+1} = \mathsf{L} v_k$ converges because $\mathsf{L}$ is a $\gamma$\-contraction in the sup norm. But now we’re iterating with the **composed operator** $\mathsf{P} \mathsf{L}$ instead of $\mathsf{L}$ alone.

This $\mathsf{P} \mathsf{L}$ structure is not specific to collocation. It is inherent in all projection methods. The general pattern is always the same: apply the Bellman operator to get a target function $\mathsf{L}\hat{v}^{(k)}$, then project it back onto our approximation space to get $\hat{v}^{(k+1)}$. The projection step defines an operator $\mathsf{P}$ that depends on our choice of test functions:

-   For **collocation**, $\mathsf{P}$ interpolates values at collocation points
    
-   For **Galerkin**, $\mathsf{P}$ is orthogonal projection with respect to $\langle \cdot, \cdot \rangle_w$
    
-   For **least squares**, $\mathsf{P}$ minimizes the weighted residual norm
    

But regardless of which projection method we use, iteration takes the form $\hat{v}^{(k+1)} = \mathsf{P} \mathsf{L}\hat{v}^{(k)}$.

The central question is whether the composition $\mathsf{P} \mathsf{L}$ inherits the contraction property of $\mathsf{L}$. If not, the iteration may diverge, oscillate, or converge to a spurious fixed point even though the original problem is well-posed.

<a id="monotone-approximators-and-stability"></a>

### Monotone Approximators and Stability

The answer turns out to depend on specific properties of the approximation operator $\mathsf{P}$. This theory was developed independently across multiple research communities: computational economics Judd (1992)Judd (1996)McGrattan (1997)Santos & Vigo-Aguiar (1998), economic dynamics Stachurski (2009), and reinforcement learning Gordon (1995)Gordon (1999). These communities arrived at essentially the same mathematical conditions.

<a id="monotonicity-implies-nonexpansiveness"></a>

#### Monotonicity Implies Nonexpansiveness

It turns out that approximation operators satisfying simple structural properties automatically preserve contraction.

<a id="monotone-nonexpansive"></a>

[Proposition 1](#monotone-nonexpansive "Link to this Proposition") (Monotone operators are nonexpansive (Stachurski))

Let $\mathsf{P}: \mathcal{V} \to \mathcal{V}$ be a linear operator on the space $\mathcal{V}$ of bounded real-valued functions on $\mathcal{S}$. If $\mathsf{P}$ satisfies:

1.  **Monotonicity**: $f \leq g$ pointwise implies $\mathsf{P} f \leq \mathsf{P} g$
    
2.  **Constant preservation**: $\mathsf{P}\mathbf{1} = \mathbf{1}$ where $\mathbf{1}$ is the constant function equal to 1
    

Then $\mathsf{P}$ is nonexpansive in the sup norm: $\|\mathsf{P} f - \mathsf{P} g\|_\infty \leq \|f - g\|_\infty$ for all $f, g \in \mathcal{V}$.

Proof 1

Let $M = \|f - g\|_\infty$. Then $-M \leq f(s) - g(s) \leq M$ for all $s$, which can be written as $g - M\mathbf{1} \leq f \leq g + M\mathbf{1}$. By monotonicity, $\mathsf{P}(g - M\mathbf{1}) \leq \mathsf{P} f \leq \mathsf{P}(g + M\mathbf{1})$. By linearity and constant preservation, $\mathsf{P} g - M\mathbf{1} \leq \mathsf{P} f \leq \mathsf{P} g + M\mathbf{1}$, which means $|\mathsf{P} f(s) - \mathsf{P} g(s)| \leq M$ for all $s$. Therefore $\|\mathsf{P} f - \mathsf{P} g\|_\infty \leq \|f - g\|_\infty$.

This proposition shows that monotonicity and constant preservation automatically imply nonexpansiveness. There is no need to verify this separately. The intuition is that a monotone, constant-preserving operator acts like a weighted average that respects order structure and cannot amplify differences between functions.

<a id="preservation-of-contraction"></a>

#### Preservation of Contraction

Combining nonexpansiveness with the contraction property of the Bellman operator yields the main stability result.

<a id="santos-vigo-aguiar-stability"></a>

[Theorem 1](#santos-vigo-aguiar-stability "Link to this Theorem") (Stability of projected value iteration (Santos-Vigo-Aguiar))

Let $\mathsf{L}: \mathcal{V} \to \mathcal{V}$ be a $\gamma$\-contraction on the space $\mathcal{V}$ of bounded functions with respect to the sup norm. Let $\mathsf{P}: \mathcal{V} \to \mathcal{V}$ be a linear approximation operator satisfying monotonicity and constant preservation.

Then the composed operator $\mathsf{P} \mathsf{L}$ is a $\gamma$\-contraction, and projected value iteration $v_{k+1} = \mathsf{P} \mathsf{L} v_k$ converges globally to a unique fixed point $v_\mathsf{P} \in \text{Range}(\mathsf{P})$ with approximation error:

<a id="urhnG52wWY"></a>

$$
\|v_\mathsf{P} - v^*\|_\infty \leq \frac{1}{1-\gamma} \|\mathsf{P} v^* - v^*\|_\infty,
$$

[(27)](#urhnG52wWY "Link to this Equation")

where $v^*$ is the true value function.

Proof 2

By [Proposition 1](#monotone-nonexpansive), $\mathsf{P}$ is nonexpansive since it satisfies monotonicity and constant preservation. Since $\mathsf{L}$ is a $\gamma$\-contraction, we have $\|\mathsf{L} f - \mathsf{L} g\|_\infty \leq \gamma\|f-g\|_\infty$. Therefore:

<a id="djul9LJFyN"></a>

$$
\|\mathsf{P} \mathsf{L} f - \mathsf{P} \mathsf{L} g\|_\infty \leq \|\mathsf{L} f - \mathsf{L} g\|_\infty \leq \gamma\|f-g\|_\infty,
$$

[(28)](#djul9LJFyN "Link to this Equation")

showing that $\mathsf{P} \mathsf{L}$ is a $\gamma$\-contraction. The error bound follows from fixed-point analysis: $v^* - v_\mathsf{P} = (I - \mathsf{P} \mathsf{L})^{-1}(v^* - \mathsf{P} v^*)$, and since $\mathsf{P} \mathsf{L}$ is a $\gamma$\-contraction, $\|(I - \mathsf{P} \mathsf{L})^{-1}\| \leq (1-\gamma)^{-1}$.

This error bound tells us that the fixed-point error is controlled by how well $\mathsf{P}$ can represent $v^*$. If $v^* \in \text{Range}(\mathsf{P})$, then $\mathsf{P} v^* = v^*$ and the error vanishes. Otherwise, the error is proportional to the approximation error $\|\mathsf{P} v^* - v^*\|_\infty$, amplified by the factor $(1-\gamma)^{-1}$.

<a id="averagers-in-discrete-state-problems"></a>

#### Averagers in Discrete-State Problems

For discrete-state problems, the monotonicity conditions have a natural interpretation as **averaging with nonnegative weights**. This characterization was developed by Gordon in the context of reinforcement learning.

<a id="gordon-averager"></a>

[Definition 1](#gordon-averager "Link to this Definition") (Averager (Gordon))

An operator $\mathsf{P}: \mathbb{R}^{|\mathcal{S}|} \to \mathbb{R}^{|\mathcal{S}|}$ is an **averager** if $\mathsf{P} v = Wv$ where $W$ is a $|\mathcal{S}| \times |\mathcal{S}|$ stochastic matrix: $w_{ij} \geq 0$ and $\sum_j w_{ij} = 1$ for all $i$.

Averagers automatically satisfy the monotonicity conditions: linearity follows from matrix multiplication, monotonicity follows from nonnegativity of entries, and constant preservation follows from row sums equaling one.

<a id="gordon-stability"></a>

[Theorem 2](#gordon-stability "Link to this Theorem") (Stability with averagers (Gordon))

If $\mathsf{P}$ is an averager and $\mathsf{L}$ is the Bellman operator (a $\gamma$\-contraction), then $\mathsf{P} \mathsf{L}$ is a $\gamma$\-contraction, and value iteration $v_{k+1} = \mathsf{P} \mathsf{L} v_k$ converges to a unique fixed point.

This specializes the Santos-Vigo-Aguiar theorem to discrete states, expressed in the probabilistic language of stochastic matrices. The stochastic matrix characterization connects to Markov chain theory: $\mathsf{P} v$ represents expected values after one transition, and the monotonicity property reflects the fact that expectations preserve order.

**Examples of averagers** include state aggregation (averaging values within groups), K-nearest neighbors (averaging over nearest states), kernel smoothing with positive kernels, and multilinear interpolation on grids (barycentric weights are nonnegative and sum to one). **Counterexamples** include linear least squares regression (projection matrix may have negative entries) and high-order polynomial interpolation (Runge phenomenon produces negative weights).

The following table summarizes which common approximation operators satisfy the monotonicity conditions:

| **Method** | **Monotone?** | **Notes** |
| --- | --- | --- |
| Piecewise linear interpolation | Yes | Always an averager; guaranteed stability |
| Multilinear interpolation (grid) | Yes | Barycentric weights are nonnegative and sum to one |
| Shape-preserving splines (Schumaker) | Yes | Designed to maintain monotonicity |
| State aggregation | Yes | Exact averaging within groups |
| Kernel smoothing (positive kernels) | Yes | If kernel integrates to one |
| High-order polynomial interpolation | No | Oscillations violate monotonicity (Runge phenomenon) |
| Least squares projection (arbitrary basis) | No | Projection matrix may have negative entries |
| Fourier/spectral methods | No | Not monotone-preserving in general |
| Neural networks | No | Highly flexible but no monotonicity guarantees |

The distinction between “safe” (monotone) and “potentially unstable” (non-monotone) approximators provides rigorous foundation for the folk wisdom that linear interpolation is reliable while high-order polynomials can be dangerous for value iteration. But notice that the table’s verdict on “least squares projection” is somewhat abstract. It doesn’t specifically address the three weighted residual methods we introduced at the start of this chapter.

The choice of solution method determines which approximation operators are safe to use. Successive approximation (fixed-point iteration) requires monotone approximators to guarantee convergence. Rootfinding methods like Newton’s method do not require monotonicity. Stability depends on numerical properties of the Jacobian rather than contraction preservation. These considerations suggest hybrid strategies. One approach runs a few iterations with a monotone method to generate an initial guess, then switches to Newton’s method with a smooth approximation for rapid final convergence.

<a id="connecting-back-to-collocation-galerkin-and-least-squares"></a>

### Connecting Back to Collocation, Galerkin, and Least Squares

We have now developed a general stability theory for projected value iteration and surveyed which approximation operators are monotone. But what does this mean for the three specific weighted residual methods we introduced at the start of this chapter: **collocation**, **Galerkin**, and **least squares**? Each method defines a different projection operator $\mathsf{P}$, and we now need to determine which satisfy the monotonicity conditions that guarantee convergence.

Collocation with piecewise linear interpolation is monotone. When we use collocation with piecewise linear basis functions on a grid, the projection operator performs linear interpolation between grid points. At any state $s$ between grid points $s_i$ and $s_{i+1}$, the interpolated value is:

<a id="zukIZPtbmf"></a>

$$
(\mathsf{P} v)(s) = \frac{s_{i+1} - s}{s_{i+1} - s_i} v(s_i) + \frac{s - s_i}{s_{i+1} - s_i} v(s_{i+1}).
$$

[(29)](#zukIZPtbmf "Link to this Equation")

The interpolation weights (barycentric coordinates) are nonnegative and sum to one, making this an averager in Gordon’s sense. Therefore collocation with piecewise linear bases satisfies the monotonicity conditions and the Santos-Vigo-Aguiar stability theorem applies. The folk wisdom that “linear interpolation is safe for value iteration” has rigorous theoretical foundation.

Galerkin projection is generally not monotone. The Galerkin projection operator for a general basis $\{\varphi_1, \ldots, \varphi_n\}$ has the form:

<a id="re9OJWvG4B"></a>

$$
\mathsf{P} = \boldsymbol{\Phi}(\boldsymbol{\Phi}^\top \mathbf{W} \boldsymbol{\Phi})^{-1} \boldsymbol{\Phi}^\top \mathbf{W},
$$

[(30)](#re9OJWvG4B "Link to this Equation")

where $\mathbf{W}$ is a diagonal weight matrix and $\boldsymbol{\Phi}$ contains the basis function evaluations. This projection matrix typically has **negative entries**. To see why, consider a simple example with polynomial basis functions $\{1, x, x^2\}$ on $[-1, 1]$. The projection of a function onto this space involves computing $(\boldsymbol{\Phi}^\top \mathbf{W} \boldsymbol{\Phi})^{-1}$, and the resulting operator can map nonnegative functions to functions with negative values. This is the same phenomenon underlying the Runge phenomenon in high-order polynomial interpolation: the projection weights oscillate in sign.

Since Galerkin projection is not monotone, the sup norm contraction theory does not guarantee convergence of projected value iteration $v_{k+1} = \mathsf{P} \mathsf{L} v_k$ with Galerkin.

Least squares methods share the non-monotonicity issue. The least squares projection operator minimizes $\|\mathsf{N}(\hat{f})\|_w^2$ and has the same mathematical form as Galerkin projection. It is a linear projection onto $\text{span}\{\varphi_1, \ldots, \varphi_n\}$ with respect to a weighted inner product. Like Galerkin, the projection matrix typically contains negative entries and violates monotonicity.

The monotone approximator framework successfully covers collocation with simple bases, but leaves two important methods, Galerkin and least squares, without convergence guarantees. These methods are used in least-squares temporal difference learning (LSTD) and modern reinforcement learning with linear function approximation. We need a different analytical framework to understand when these non-monotone projections lead to convergent algorithms.

Monotone projections (piecewise linear interpolation, state aggregation) automatically preserve the Bellman operator’s contraction property, guaranteeing convergence of projected value iteration. Non-monotone projections (Galerkin, high-order polynomials) may destroy contraction in the sup norm, requiring either different solution methods (Newton) or analysis in different norms. The next section develops the latter approach for policy evaluation.

Exercises: Monotonicity and Convergence

1.  **Verifying monotonicity.** Consider piecewise linear interpolation on a 5-point grid. Write out the interpolation weights for a point between grid points 2 and 3. Verify that all weights are nonnegative and sum to one.
    
2.  **A non-monotone example.** Using Lagrange interpolation with 4 equally spaced nodes on $[0, 1]$, compute the interpolation weights for the point $x = 0.1$. Show that some weights are negative.
    
3.  **State aggregation.** Consider a discrete MDP with states $\{1, 2, 3, 4\}$ aggregated into two groups: $\{1, 2\}$ and $\{3, 4\}$. Write out the aggregation operator as a matrix.
    
4.  **Contraction constant.** For the composed operator $\mathsf{P} \mathsf{L}$ with a monotone $\mathsf{P}$, prove that the contraction constant is exactly $\gamma$.
    

<a id="beyond-monotone-approximators"></a>

## Beyond Monotone Approximators

If an orthogonal projection is not monotone, which weighting and policy conditions can still make the projected Bellman map contractive?

The monotone approximator theory gives us a clean sufficient condition for convergence: if $\mathsf{P}$ is monotone (and constant-preserving), then $\mathsf{P}$ is non-expansive in the sup norm $\|\cdot\|_\infty$. Since $\mathsf{L}$ is a $\gamma$\-contraction in the sup norm, their composition $\mathsf{P} \mathsf{L}$ is also a $\gamma$\-contraction in the sup norm, guaranteeing convergence of projected value iteration.

But what if $\mathsf{P}$ is not monotone? Can we still guarantee convergence? Galerkin and least squares projections typically violate monotonicity, yet they are widely used in practice, particularly in reinforcement learning through least-squares temporal difference learning (LSTD). In general, proving convergence for non-monotone projections is difficult. However, for the special case of **policy evaluation**, computing the value function $v_\pi$ of a fixed policy $\pi$, we can establish convergence by working in a different norm.

<a id="the-policy-evaluation-problem-and-lstd"></a>

### The Policy Evaluation Problem and LSTD

Consider the policy evaluation problem: given policy $\pi$, we want to solve the policy Bellman equation $v_\pi = r_\pi + \gamma \mathbf{P}_\pi v_\pi$, where $r_\pi$ and $\mathbf{P}_\pi$ are the reward vector and transition matrix under $\pi$. This is the core computational task in policy iteration, actor-critic algorithms, and temporal difference learning. In reinforcement learning, we typically learn from sampled experience: trajectories $(s_0, a_0, r_1, s_1, a_1, r_2, s_2, \ldots)$ generated by following $\pi$. If the Markov chain induced by $\pi$ is ergodic, the state distribution converges to a stationary distribution $\xi$ satisfying $\xi^\top \mathbf{P}_\pi = \xi^\top$.

This distribution determines which states appear frequently in our data. States visited often contribute more samples and have more influence on any learned approximation. States visited rarely contribute little. For a linear approximation $v_\theta(s) = \sum_j \theta_j \varphi_j(s)$, the **least-squares temporal difference (LSTD)** algorithm computes coefficients by solving:

<a id="E12Ei8KLTs"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} - \gamma \mathbf{P}_\pi \boldsymbol{\Phi}) \boldsymbol{\theta} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{r}_\pi,
$$

[(31)](#E12Ei8KLTs "Link to this Equation")

where $\boldsymbol{\Phi}$ is the matrix of basis function evaluations and $\boldsymbol{\Xi} = \text{diag}(\xi)$. We write this matrix equation for analysis purposes, but the actual algorithm does not compute it this way. For large state spaces, we cannot enumerate all states to form $\boldsymbol{\Phi}$ or explicitly represent the transition matrix $\mathbf{P}_\pi$. Instead, the practical algorithm accumulates sums from sampled transitions $(s, r, s')$, incrementally building the matrices $\boldsymbol{\Phi}^\top \boldsymbol{\Xi} \boldsymbol{\Phi}$ and $\boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{P}_\pi \boldsymbol{\Phi}$ without ever forming the full objects. The algorithm is derived from first principles through temporal difference learning, and the Galerkin perspective provides an interpretation of what it computes.

<a id="lstd-as-projected-bellman-equation"></a>

### LSTD as Projected Bellman Equation

To see what this equation means, let $\hat{v} = \boldsymbol{\Phi} \boldsymbol{\theta}$ be the solution. Expanding the parentheses:

<a id="sjqVgvQiMP"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} \boldsymbol{\Phi} \boldsymbol{\theta} - \gamma \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{P}_\pi \boldsymbol{\Phi} \boldsymbol{\theta} = \boldsymbol{\Phi}^\top \boldsymbol{\Xi} \mathbf{r}_\pi.
$$

[(32)](#sjqVgvQiMP "Link to this Equation")

Moving all terms to the left side and factoring out $\boldsymbol{\Phi}^\top \boldsymbol{\Xi}$:

<a id="oiXE17SCca"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\boldsymbol{\Phi} \boldsymbol{\theta} - \gamma \mathbf{P}_\pi \boldsymbol{\Phi} \boldsymbol{\theta} - \mathbf{r}_\pi) = \mathbf{0}.
$$

[(33)](#oiXE17SCca "Link to this Equation")

Since $\hat{v} = \boldsymbol{\Phi} \boldsymbol{\theta}$ and the policy Bellman operator is $\mathsf{L}_\pi \hat{v} = \mathbf{r}_\pi + \gamma \mathbf{P}_\pi \hat{v}$, we can write:

<a id="rGvKJtR3K9"></a>

$$
\boldsymbol{\Phi}^\top \boldsymbol{\Xi} (\hat{v} - \mathsf{L}_\pi \hat{v}) = \mathbf{0}.
$$

[(34)](#rGvKJtR3K9 "Link to this Equation")

Let $\boldsymbol{\varphi}_j$ denote the $j$\-th column of $\boldsymbol{\Phi}$, which contains the evaluations of the $j$\-th basis function at all states. The equation above says that for each $j$:

<a id="buSnw3yzmV"></a>

$$
\boldsymbol{\varphi}_j^\top \boldsymbol{\Xi} (\hat{v} - \mathsf{L}_\pi \hat{v}) = 0.
$$

[(35)](#buSnw3yzmV "Link to this Equation")

But $\boldsymbol{\varphi}_j^\top \boldsymbol{\Xi} (\hat{v} - \mathsf{L}_\pi \hat{v})$ is exactly the $\xi$\-weighted inner product $\langle \boldsymbol{\varphi}_j, \hat{v} - \mathsf{L}_\pi \hat{v} \rangle_\xi$. So the residual $\hat{v} - \mathsf{L}_\pi \hat{v}$ is orthogonal to every basis function, and therefore orthogonal to the entire subspace $\text{span}(\boldsymbol{\Phi})$.

By definition, the orthogonal projection $\mathsf{P} y$ of a vector $y$ onto a subspace is the unique vector in that subspace such that $y - \mathsf{P} y$ is orthogonal to the subspace. Here, $\hat{v}$ lies in $\text{span}(\boldsymbol{\Phi})$ (since $\hat{v} = \boldsymbol{\Phi} \boldsymbol{\theta}$), and we have just shown that $\mathsf{L}_\pi \hat{v} - \hat{v}$ is orthogonal to $\text{span}(\boldsymbol{\Phi})$. Therefore, $\hat{v} = \mathsf{P} \mathsf{L}_\pi \hat{v}$, where $\mathsf{P}$ is orthogonal projection onto $\text{span}(\boldsymbol{\Phi})$ with respect to the $\xi$\-weighted inner product:

<a id="aF9UlTeFBJ"></a>

$$
\langle u, v \rangle_\xi = u^\top \boldsymbol{\Xi} v, \qquad \|v\|_\xi = \sqrt{v^\top \boldsymbol{\Xi} v}, \qquad \mathsf{P} = \boldsymbol{\Phi}(\boldsymbol{\Phi}^\top \boldsymbol{\Xi} \boldsymbol{\Phi})^{-1} \boldsymbol{\Phi}^\top \boldsymbol{\Xi}.
$$

[(36)](#aF9UlTeFBJ "Link to this Equation")

The weighting by $\xi$ is not arbitrary. Temporal difference learning performs stochastic updates using individual transitions: $\theta_{k+1} = \theta_k + \alpha_k (r + \gamma v_{\theta_k}(s') - v_{\theta_k}(s)) \nabla v_{\theta_k}(s)$, with states sampled from $\xi$. The ODE analysis of this stochastic process (Borkar-Meyn theory) shows convergence to a fixed point, which can be expressed in closed form as the $\xi$\-weighted projected Bellman operator. LSTD is an algorithm that computes this analytical fixed point.

<a id="orthogonal-projection-is-non-expansive"></a>

### Orthogonal Projection is Non-Expansive

Suppose $\xi$ is the steady-state distribution: $\xi^\top \mathbf{P}_\pi = \xi^\top$. Our goal is to establish that $\mathsf{P} \mathsf{L}_\pi$ is a contraction in $\|\cdot\|_\xi$. If we can establish that $\mathsf{P}$ is non-expansive in this norm and that $\mathsf{L}_\pi$ is a $\gamma$\-contraction in $\|\cdot\|_\xi$, then their composition will be a $\gamma$\-contraction:

<a id="PG9EqKWCX4"></a>

$$
\|\mathsf{P} \mathsf{L}_\pi v - \mathsf{P} \mathsf{L}_\pi w\|_\xi \leq \|\mathsf{L}_\pi v - \mathsf{L}_\pi w\|_\xi \leq \gamma \|v - w\|_\xi.
$$

[(37)](#PG9EqKWCX4 "Link to this Equation")

First, we establish that orthogonal projection is non-expansive. For any vector $v$, we can decompose $v = \mathsf{P} v + (v - \mathsf{P} v)$, where $(v - \mathsf{P} v)$ is orthogonal to the subspace $\text{span}(\boldsymbol{\Phi})$. By the Pythagorean theorem in the $\|\cdot\|_\xi$ inner product:

<a id="VdqzWoh07d"></a>

$$
\|v\|_\xi^2 = \|\mathsf{P} v\|_\xi^2 + \|v - \mathsf{P} v\|_\xi^2.
$$

[(38)](#VdqzWoh07d "Link to this Equation")

Since $\|v - \mathsf{P} v\|_\xi^2 \geq 0$, we have:

<a id="biT0syNs49"></a>

$$
\|v\|_\xi^2 \geq \|\mathsf{P} v\|_\xi^2.
$$

[(39)](#biT0syNs49 "Link to this Equation")

Taking square roots of both sides (which preserves the inequality since both norms are non-negative):

<a id="QqAo2hDP2f"></a>

$$
\|\mathsf{P} v\|_\xi \leq \|v\|_\xi.
$$

[(40)](#QqAo2hDP2f "Link to this Equation")

This holds for all $v$, so $\mathsf{P}$ is non-expansive in $\|\cdot\|_\xi$.

<a id="contraction-of-bellmanpi-in-cdot-xi"></a>

### Contraction of $\mathsf{L}_\pi$ in $\|\cdot\|_\xi$

To show $\mathsf{L}_\pi = r_\pi + \gamma \mathbf{P}_\pi$ is a $\gamma$\-contraction, we need to verify:

<a id="os2W41y8I2"></a>

$$
\|\mathsf{L}_\pi v - \mathsf{L}_\pi w\|_\xi = \|\gamma \mathbf{P}_\pi (v - w)\|_\xi = \gamma \|\mathbf{P}_\pi (v - w)\|_\xi.
$$

[(41)](#os2W41y8I2 "Link to this Equation")

This will be at most $\gamma \|v - w\|_\xi$ if $\mathbf{P}_\pi$ is non-expansive, meaning $\|\mathbf{P}_\pi z\|_\xi \leq \|z\|_\xi$ for any vector $z$. We therefore need to establish that $\mathbf{P}_\pi$ is non-expansive in $\|\cdot\|_\xi$.

_Before reading the proof below, try to show that $\mathbf{P}_\pi$ is non-expansive in $\|\cdot\|_\xi$. Hint: what property of $\xi$ relates it to $\mathbf{P}_\pi$?_

Consider the squared norm of $\mathbf{P}_\pi z$. By definition of the weighted norm:

<a id="Tnp9qDqm5U"></a>

$$
\|\mathbf{P}_\pi z\|_\xi^2 = \sum_s \xi(s) [(\mathbf{P}_\pi z)(s)]^2.
$$

[(42)](#Tnp9qDqm5U "Link to this Equation")

The $s$\-th component of $\mathbf{P}_\pi z$ is $(\mathbf{P}_\pi z)(s) = \sum_{s'} p(s'|s,\pi(s)) z(s')$. This is a weighted average of the values $z(s')$ with weights $p(s'|s,\pi(s))$ that sum to one. Therefore:

<a id="PBYX5XJZtv"></a>

$$
\|\mathbf{P}_\pi z\|_\xi^2 = \sum_s \xi(s) \left[\sum_{s'} p(s'|s,\pi(s)) z(s')\right]^2.
$$

[(43)](#PBYX5XJZtv "Link to this Equation")

Since the function $x \mapsto x^2$ is convex, Jensen’s inequality applied to the probability distribution $p(\cdot|s,\pi(s))$ gives:

<a id="C5TXH3r0y9"></a>

$$
\left[\sum_{s'} p(s'|s,\pi(s)) z(s')\right]^2 \leq \sum_{s'} p(s'|s,\pi(s)) z(s')^2.
$$

[(44)](#C5TXH3r0y9 "Link to this Equation")

Substituting this into the norm expression:

<a id="HXYEhD4vmv"></a>

$$
\|\mathbf{P}_\pi z\|_\xi^2 \leq \sum_s \xi(s) \sum_{s'} p(s'|s,\pi(s)) z(s')^2 = \sum_{s'} z(s')^2 \sum_s \xi(s) p(s'|s,\pi(s)).
$$

[(45)](#HXYEhD4vmv "Link to this Equation")

The stationarity condition $\xi^\top \mathbf{P}_\pi = \xi^\top$ means $\sum_s \xi(s) p(s'|s,\pi(s)) = \xi(s')$ for all $s'$. Therefore:

<a id="lzodxsLc8X"></a>

$$
\|\mathbf{P}_\pi z\|_\xi^2 \leq \sum_{s'} z(s')^2 \xi(s') = \|z\|_\xi^2.
$$

[(46)](#lzodxsLc8X "Link to this Equation")

Taking square roots, $\|\mathbf{P}_\pi z\|_\xi \leq \|z\|_\xi$, so $\mathbf{P}_\pi$ is non-expansive in $\|\cdot\|_\xi$. This makes $\mathsf{L}_\pi = r_\pi + \gamma \mathbf{P}_\pi$ a $\gamma$\-contraction in $\|\cdot\|_\xi$. Composing with the non-expansive projection:

<a id="Nx2TViWs6h"></a>

$$
\|\mathsf{P} \mathsf{L}_\pi v - \mathsf{P} \mathsf{L}_\pi w\|_\xi \leq \|\mathsf{L}_\pi v - \mathsf{L}_\pi w\|_\xi \leq \gamma \|v - w\|_\xi.
$$

[(47)](#Nx2TViWs6h "Link to this Equation")

By Banach’s fixed-point theorem, $\mathsf{P} \mathsf{L}_\pi$ has a unique fixed point and iterates converge from any initialization.

<a id="interpretation-the-on-policy-condition"></a>

### Interpretation: The On-Policy Condition

The result shows that convergence depends on matching the weighting to the operator. We cannot choose an arbitrary weighted $L^2$ norm and expect $\mathsf{P} \mathsf{L}_\pi$ to be a contraction. Instead, the weighting $\xi$ must have a specific relationship with the transition matrix $\mathbf{P}_\pi$ in the operator $\mathsf{L}_\pi$: namely, $\xi$ must be the stationary distribution of $\mathbf{P}_\pi$. This is what makes the weighted geometry compatible with the operator’s structure. When this match holds, Jensen’s inequality gives us non-expansiveness of $\mathbf{P}_\pi$ in the $\|\cdot\|_\xi$ norm, and the composition $\mathsf{P} \mathsf{L}_\pi$ inherits the contraction property.

In reinforcement learning, this has a practical interpretation. When we learn by following policy $\pi$ and collecting transitions $(s, a, r, s')$, the states we visit are distributed according to the stationary distribution of $\pi$. This is **on-policy learning**. The LSTD algorithm uses data sampled from this distribution, which means the empirical weighting naturally matches the operator structure. Our analysis shows that the iterative algorithm $v_{k+1} = \mathsf{P} \mathsf{L}_\pi v_k$ converges to the same fixed point that LSTD computes in closed form.

This is fundamentally different from the monotone approximator theory. There, we required structural properties of $\mathsf{P}$ itself (monotonicity, constant preservation) to guarantee that $\mathsf{P}$ preserves the sup-norm contraction property of $\mathsf{L}$. Here, we place no such restriction on $\mathsf{P}$. Galerkin projection is not monotone. Instead, convergence depends on matching the norm to the operator. When $\xi$ does not match the stationary distribution, as in off-policy learning where data comes from a different behavior policy, the Jensen inequality argument breaks down. The operator $\mathbf{P}_\pi$ need not be non-expansive in $\|\cdot\|_\xi$, and $\mathsf{P} \mathsf{L}_\pi$ may fail to contract. This explains divergence phenomena such as Baird’s counterexample Baird (1995).

Exercises: LSTD and the On-Policy Condition

1.  **Computing the stationary distribution.** For the 3-state Markov chain in the LSTD example, compute the stationary distribution $\xi$ satisfying $\xi^\top \mathbf{P}_\pi = \xi^\top$.
    
2.  **LSTD with stationary weighting.** Recompute the LSTD solution using the stationary distribution instead of uniform weighting. Compare the approximation error.
    
3.  **Off-policy divergence.** Consider a weighting $\xi' = (0.9, 0.05, 0.05)$ that does not match the stationary distribution. Implement projected value iteration and observe whether it converges.
    
4.  **Proving non-expansiveness fails off-policy.** For $\xi' = (0.9, 0.05, 0.05)$, find a vector $z$ such that $\|\mathbf{P} z\|_{\xi'} > \|z\|_{\xi'}$.
    

<a id="the-bellman-optimality-case"></a>

### The Bellman Optimality Case

Can we extend this weighted $L^2$ analysis to the Bellman optimality operator $\mathsf{L} v = \max_a [r_a + \gamma \mathbf{P}_a v]$? The answer is no, at least not with this approach. The obstacle appears at the Jensen inequality step. For policy evaluation, we had:

<a id="tV1EuJ68RQ"></a>

$$
\|\mathbf{P}_\pi z\|_\xi^2 = \sum_s \xi(s) \left[\sum_{s'} p(s'|s,\pi(s)) z(s')\right]^2.
$$

[(48)](#tV1EuJ68RQ "Link to this Equation")

The inner term is a convex combination of the values $z(s')$, which allowed us to apply Jensen’s inequality to the convex function $x \mapsto x^2$. For the optimal Bellman operator, we would need to bound:

<a id="lbEh9qmPT5"></a>

$$
\left[\max_{a} \sum_{s'} p(s'|s,a) z(s')\right]^2.
$$

[(49)](#lbEh9qmPT5 "Link to this Equation")

But the maximum of convex combinations is not itself a convex combination. It is a pointwise maximum. Jensen’s inequality does not apply. We cannot conclude that $\max_a [\mathbf{P}_a z]$ is non-expansive in any weighted $L^2$ norm.

Is convergence of $\mathsf{P} \mathsf{L}$ with Galerkin projection impossible, or merely difficult to prove? The situation is subtle. In practice, fitted Q-iteration and approximate value iteration with neural networks often work well, suggesting that some form of stability exists. But there are also well-documented divergence examples (e.g., Q-learning with linear function approximation can diverge). The theoretical picture remains incomplete. Some results exist for restricted function classes or under strong assumptions on the MDP structure, but no general convergence guarantee like the policy evaluation result is available. The interplay between the max operator, the projection, and the norm geometry is not well understood. This is an active area of research in reinforcement learning theory.

Despite these theoretical gaps, the practical algorithm template is straightforward. We now present fitted-value iteration as a meta-algorithm that combines any supervised learning method with the Bellman operator.

<a id="fitted-value-q-iteration-fvi-fqi"></a>

## Fitted-Value/Q Iteration (FVI/FQI)

How does projected fixed-point iteration become a repeated supervised fitting problem for values or action values?

We have developed weighted residual methods through abstract functional equations: choose test functions, impose orthogonality conditions $\langle R, p_i \rangle_w = 0$, solve for coefficients. What are we actually computing when we solve these equations by successive approximation? The answer is simpler than the formalism suggests: **function iteration with a fitting step**.

Recall that the weighted residual conditions $\langle v - \mathsf{L} v, p_i \rangle_w = 0$ define a fixed-point problem $v = \mathsf{P} \mathsf{L} v$, where $\mathsf{P}$ is a projection operator onto $\text{span}(\boldsymbol{\Phi})$. We can solve this by iteration: $v_{k+1} = \mathsf{P} \mathsf{L} v_k$. Under appropriate conditions (monotonicity of $\mathsf{P}$, or matching the weight to the operator for policy evaluation), this converges to a solution.

In parameter space, this iteration becomes a fitting procedure. Consider Galerkin projection with a finite state space of $n$ states. Let $\boldsymbol{\Phi}$ be the $n \times d$ matrix of basis evaluations, $\mathbf{W}$ the diagonal weight matrix, and $\mathbf{y}$ the vector of Bellman operator evaluations: $y_i = (\mathsf{L} v_k)(s_i)$. The projection is:

<a id="I0BY74KVYm"></a>

$$
\boldsymbol{\theta}_{k+1} = (\boldsymbol{\Phi}^\top \mathbf{W} \boldsymbol{\Phi})^{-1} \boldsymbol{\Phi}^\top \mathbf{W} \mathbf{y}.
$$

[(50)](#I0BY74KVYm "Link to this Equation")

This is weighted least-squares regression of $\boldsymbol{\Phi}\boldsymbol{\theta}$ on the targets $\mathbf{y}$. Collocation instead requires the exact interpolation $\boldsymbol{\Phi}\boldsymbol{\theta}_{k+1}=\mathbf{y}$ at the selected points. In continuous state spaces, sampled states can approximate the Galerkin integrals and produce a finite-dimensional regression problem.

This extends beyond linear basis functions. Neural networks, decision trees, and kernel methods all implement variants of this procedure. Given data $\{(s_i, y_i)\}$ where $y_i = (\mathsf{L} v_k)(s_i)$, each method produces a function $v_{k+1}: \mathcal{S} \to \mathbb{R}$ from the targets. The projection operator $\mathsf{P}$ is one such approximation rule. Galerkin uses weighted projection, while square collocation uses exact interpolation at the selected points.

<a id="fitted-value-iteration"></a>

[Algorithm 5](#fitted-value-iteration "Link to this Algorithm") (Fitted-Value Iteration)

**Inputs:** Finite state set $\mathcal{S}$ (or sample $\{s_i\}_{i=1}^n$), discount factor $\gamma$, function class $\mathcal{F}$, fitting procedure $\mathtt{fit}$, convergence tolerance $\epsilon$

**Output:** Approximate value function $\hat{v} \approx v^*$

1.  Initialize $v_0 \in \mathcal{F}$ arbitrarily
    
2.  Set $k \leftarrow 0$
    
3.  **repeat**
    
4.  $\quad$ **for** each state $s_i \in \mathcal{S}$ **do**
    
5.  $\quad\quad$ Compute target: $y_i \leftarrow \displaystyle\max_{a \in \mathcal{A}} \Big\{ r(s_i, a) + \gamma \sum_{s'} p(s' \mid s_i, a) v_k(s') \Big\}$
    
6.  $\quad$ **end for**
    
7.  $\quad$ Fit new approximation: $v_{k+1} \leftarrow \mathtt{fit}\big(\{(s_i, y_i)\}_{i=1}^n; \mathcal{F}\big)$
    
8.  $\quad$ $k \leftarrow k+1$
    
9.  **until** $\|v_k - v_{k-1}\| < \epsilon$ (or maximum iterations reached)
    
10.  **return** $v_k$
     

The operation $\mathtt{fit}$ may solve a linear system, run gradient descent, or train an ensemble. For a linear space $\mathcal{F}$, weighted squared-error fitting gives the Galerkin projection. A square collocation system gives exact interpolation when its evaluation matrix is nonsingular. Fitted-value iteration alternates between generating Bellman targets and constructing a new function from them.

The following code demonstrates fitted-value iteration on the optimal stopping problem:

<a id="LSUUaVoeAc"></a>

Source

```python
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

gamma = 0.9
v_bar_exact = (1 - np.sqrt(1 - gamma**2)) / gamma**2
s_star_exact = gamma * v_bar_exact
def v_exact(s):
    return np.where(s >= s_star_exact, s, gamma * v_bar_exact)

def fitted_value_iteration(s_grid, gamma, degree, max_iter=50, tol=1e-6):
    X = s_grid.reshape(-1, 1)
    v = np.zeros(len(s_grid))
    
    for k in range(max_iter):
        # Use trapezoidal rule for E[v] under uniform distribution on [0,1]
        v_bar = np.trapezoid(v, s_grid)
        targets = np.maximum(s_grid, gamma * v_bar)
        
        model = make_pipeline(PolynomialFeatures(degree), Ridge(alpha=1e-6))
        model.fit(X, targets)
        v_new = model.predict(X)
        
        if np.linalg.norm(v_new - v) < tol:
            return v_new, k + 1
        v = v_new
    return v, max_iter

s_grid = np.linspace(0, 1, 50)
print(f"{'Degree':<10} {'Iterations':<12} {'Max Error':<12}")
print("-" * 34)
for deg in [3, 5, 8]:
    v, iters = fitted_value_iteration(s_grid, gamma, deg)
    max_error = np.max(np.abs(v - v_exact(s_grid)))
    print(f"{deg:<10} {iters:<12} {max_error:<12.6f}")
```

```
Degree     Iterations   Max Error   
----------------------------------
3          26           0.035112    
5          25           0.022469    
8          25           0.020715
```

A limitation of FVI/FQI is that it assumes we can evaluate the Bellman operator exactly. Computing $y_i = (\mathsf{L} v_k)(s_i)$ requires knowing transition probabilities and summing over all next states. In practice, we often have only a simulator or observed data. The next chapter shows how to approximate these expectations from samples, connecting the fitted-value iteration framework to simulation-based methods.

<a id="summary"></a>

## Summary

Projected Bellman iteration composes an approximation map with a Bellman operator. Monotone interpolation and state aggregation preserve sup-norm contraction, while non-monotone projections require a compatible weighting and can lose the fixed-point guarantee. Fitted value and Q iteration expose the computational pattern: evaluate Bellman targets, fit an approximator, and repeat.

Exact target evaluation still assumes access to the transition probabilities or an exact expectation. How can the same Bellman update be estimated when the model supplies only samples? [Monte Carlo Bellman estimation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md) replaces the exact integral by sampled averages and makes their variance and maximization bias explicit.

<a id="self-checks"></a>

## Self-checks

<a id="ex-projection-check-3"></a>

[Exercise 1](#ex-projection-check-3 "Link to this Exercise") (Weighting shift)

If the projection weighting distribution puts almost no mass on an important state region, what failure should you expect?

Solution to [Exercise 1](#ex-projection-check-3)

The approximation may be accurate under the weighted norm yet poor in that neglected region, leading to bad values or decisions there.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-LegrandJunca2025"></a>
2.  Legrand, M., & Junca, S. (2025). _Weighted Residual Solution Methods_.
<a id="cite-Zang2020"></a>
4.  Zang, Y., Bao, G., Ye, X., & Zhou, H. (2020). Weak adversarial networks for high-dimensional partial differential equations. _Journal of Computational Physics_, _411_, 109409. [10.1016/j.jcp.2020.109409](https://doi.org/10.1016/j.jcp.2020.109409)
<a id="cite-Judd1992"></a>
6.  Judd, K. L. (1992). Projection methods for solving aggregate growth models. _Journal of Economic Theory_, _58_(2), 410–452.
<a id="cite-Judd1996"></a>
8.  Judd, K. L. (1996). Approximation, perturbation, and projection methods in economic analysis. In H. M. Amman, D. A. Kendrick, & J. Rust (Eds.), _Handbook of Computational Economics_ (Vol. 1, pp. 509–585). Elsevier.
<a id="cite-McGrattan1997"></a>
10.  McGrattan, E. R. (1997). _Application of Weighted Residual Methods to Dynamic Economic Models_.
<a id="cite-SantosVigoAguiar1998"></a>
12.  Santos, M. S., & Vigo-Aguiar, J. (1998). Analysis of a numerical dynamic programming algorithm applied to economic models. _Econometrica_, _66_(2), 409–426.
<a id="cite-Stachurski2009"></a>
14.  Stachurski, J. (2009). _Economic Dynamics: Theory and Computation_. MIT Press.
<a id="cite-Gordon1995"></a>
16.  Gordon, G. J. (1995). Stable function approximation in dynamic programming. _Proceedings of the Twelfth International Conference on International Conference on Machine Learning_, 261–268.
<a id="cite-Gordon1999"></a>
18.  Gordon, G. J. (1999). _Approximate Solutions to Markov Decision Problems_ \[Phdthesis\]. Carnegie Mellon University.
<a id="cite-Baird1995"></a>
20.  Baird, L. (1995). Residual algorithms: Reinforcement learning with function approximation. _Proceedings of the Twelfth International Conference on Machine Learning_, 30–37.

[

Approximate Value Methods

Weighted-Residual Methods


](20-weighted-residual-methods.md)[

Approximate Value Methods

Monte Carlo Bellman Estimation


](22-monte-carlo-bellman-estimation.md)


---

# CHAPITRE 22 — Monte Carlo Bellman Estimation

Section du livre : Approximate Value Methods

Page originale : https://pierrelucbacon.com/rlbook/monte-carlo-bellman-estimation

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md

> **Cours de Pierre-Luc Bacon — 22.** [Page publiée](https://pierrelucbacon.com/rlbook/monte-carlo-bellman-estimation) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/22-monte-carlo-bellman-estimation.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Monte Carlo Bellman Estimation

<a id="skip-to-article"></a>

The projection methods from the previous chapter showed how to transform the infinite-dimensional fixed-point problem $\mathsf{L} v = v$ into a finite-dimensional one by choosing basis functions $\{\varphi_i\}$ and imposing conditions that make the residual $R(s) = \mathsf{L} v(s) - v(s)$ small. Different projection conditions (Galerkin orthogonality, collocation at points, least squares minimization) yield different finite-dimensional systems to solve.

However, we left unresolved the question of how to evaluate the Bellman operator itself. Applying $\mathsf{L}$ at any state requires computing an expectation:

Can that expectation and the outer projection integrals be estimated when the model supplies samples rather than an explicit transition density?

<a id="uUaHut7twP"></a>

$$
(\mathsf{L} v)(s) = \max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \int v(s')p(ds'|s,a)\right\}
$$

[(1)](#uUaHut7twP "Link to this Equation")

For discrete state spaces with a manageable number of states, this expectation is a finite sum we can compute exactly. For continuous or high-dimensional state spaces, we need numerical integration. The projection methods framework is compatible with any quadrature scheme, but leaves the choice of integration method unspecified.

This chapter addresses the **integration subproblem** that arises at two levels in approximate dynamic programming. First, we must evaluate the transition expectation $\int v(s')p(ds'|s,a)$ within the Bellman operator itself. Second, when using projection methods like Galerkin or least squares, we encounter outer integrations for enforcing orthogonality conditions or minimizing residuals over distributions of states. Both require numerical approximation in continuous or high-dimensional spaces.

We begin by examining deterministic numerical integration methods: quadrature rules that approximate integrals by evaluating integrands at carefully chosen points with associated weights. We discuss how to coordinate the choice of quadrature with the choice of basis functions to balance approximation accuracy and computational cost. Then we turn to **Monte Carlo integration**, which approximates expectations using random samples rather than deterministic quadrature points. This shift from deterministic to stochastic integration is what brings us into machine learning territory. When we replace exact transition probabilities with samples drawn from simulations or real interactions, projection methods combined with Monte Carlo integration become what the operations research community calls **simulation-based approximate dynamic programming** and what the machine learning community calls **reinforcement learning**. By relying on samples rather than explicit probability functions, we move from model-based planning to data-driven learning.

<a id="evaluating-the-bellman-operator-with-numerical-quadrature"></a>

## Evaluating the Bellman Operator with Numerical Quadrature

Before introducing random samples, which deterministic nodes and weights can approximate the transition expectation?

Before turning to Monte Carlo methods, we examine the structure of the numerical integration problem. When we apply the Bellman operator to an approximate value function $\hat{v}(s; \theta) = \sum_i \theta_i \varphi_i(s)$, we must evaluate integrals of the form:

<a id="Ile9r9Jups"></a>

$$
\int \hat{v}(s'; \theta) \, p(s'|s,a) \, ds' = \int \left(\sum_i \theta_i \varphi_i(s')\right) p(s'|s,a) \, ds' = \sum_i \theta_i \int \varphi_i(s') \, p(s'|s,a) \, ds'
$$

[(2)](#Ile9r9Jups "Link to this Equation")

This shows two independent approximations:

1.  **Value function approximation**: We represent $v$ using basis functions $\{\varphi_i\}$ and coefficients $\theta$
    
2.  **Quadrature approximation**: We approximate each integral $\int \varphi_i(s') p(s'|s,a) ds'$ numerically
    

These choices are independent but should be coordinated. To see why, consider what happens in projection methods when we iterate $\hat{v}^{(k+1)} = \mathsf{P} \mathsf{L} \hat{v}^{(k)}$. In practice, we cannot evaluate $\mathsf{L}$ exactly due to the integrals, so we compute $\hat{v}^{(k+1)} = \mathsf{P} \widetilde{\mathsf{L}} \hat{v}^{(k)}$ instead, where $\widetilde{\mathsf{L}}$ denotes the Bellman operator with numerical quadrature.

The error in a single iteration can be bounded by the triangle inequality. Let $v$ denote the true fixed point $v = \mathsf{L} v$. Then:

<a id="jHKXG92E1j"></a>

$$
\begin{aligned}
\|v - \hat{v}^{(k+1)}\| &= \|v - \mathsf{P} \widetilde{\mathsf{L}} \hat{v}^{(k)}\| \\
&\le \|v - \mathsf{P} \mathsf{L} v\| + \|\mathsf{P} \mathsf{L} v - \mathsf{P} \mathsf{L} \hat{v}^{(k)}\| + \|\mathsf{P} \mathsf{L} \hat{v}^{(k)} - \mathsf{P} \widetilde{\mathsf{L}} \hat{v}^{(k)}\| \\
&= \underbrace{\|v - \mathsf{P} \mathsf{L} v\|}_{\text{best approximation error}} + \underbrace{\|\mathsf{P} \mathsf{L} v - \mathsf{P} \mathsf{L} \hat{v}^{(k)}\|}_{\text{contraction of iterate error}} + \underbrace{\|\mathsf{P} \mathsf{L} \hat{v}^{(k)} - \mathsf{P} \widetilde{\mathsf{L}} \hat{v}^{(k)}\|}_{\text{quadrature error}}
\end{aligned}
$$

[(3)](#jHKXG92E1j "Link to this Equation")

The first term is the best we can do with our basis (how well $\mathsf{P}$ approximates the true solution). The second term decreases with iterations when $\mathsf{P} \mathsf{L}$ is a contraction. The third term is the error from replacing exact integrals with quadrature, and it does not vanish as iterations proceed.

To make this concrete, consider evaluating $(\mathsf{L} \hat{v})(s)$ for our current approximation $\hat{v}(s; \theta) = \sum_i \theta_i \varphi_i(s)$. We want:

<a id="XY0wx0TN8I"></a>

$$
(\mathsf{L} \hat{v})(s) = \max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \sum_i \theta_i \int \varphi_i(s') p(s'|s,a) ds' \right\}
$$

[(4)](#XY0wx0TN8I "Link to this Equation")

But we compute instead:

<a id="sUKt3fSOZb"></a>

$$
(\widetilde{\mathsf{L}} \hat{v})(s) = \max_{a \in \mathcal{A}_s} \left\{r(s,a) + \gamma \sum_i \theta_i \sum_j w_j \varphi_i(s'_j) \right\}
$$

[(5)](#sUKt3fSOZb "Link to this Equation")

where $\{(s'_j, w_j)\}$ are quadrature nodes and weights. If the quadrature error $\|(\mathsf{L} \hat{v})(s) - (\widetilde{\mathsf{L}} \hat{v})(s)\|$ is large relative to the basis approximation quality, we cannot exploit the expressive power of the basis. For instance, degree-10 Chebyshev polynomials represent smooth functions to $O(10^{-8})$ accuracy, but combined with rectangle-rule quadrature (error $O(h^2) \approx 10^{-2}$), the quadrature term dominates the error bound. We pay the cost of storing and manipulating 10 coefficients but achieve only $O(h^2)$ convergence in the quadrature mesh size.

This echoes the coordination principle from continuous optimal control (Chapter on trajectory optimization): when transcribing a continuous-time problem, we use the same quadrature nodes for both the running cost integral and the dynamics integral. There, coordination ensures that “where we pay” aligns with “where we enforce” the dynamics. Here, coordination ensures that integration accuracy matches approximation accuracy. Both are instances of balancing multiple sources of error in numerical methods.

Standard basis-quadrature pairings achieve this balance:

-   Piecewise constant or linear elements with midpoint or trapezoidal rules
    
-   Chebyshev polynomials with Gauss-Chebyshev quadrature
    
-   Legendre polynomials with Gauss-Legendre quadrature
    
-   Hermite polynomials with Gauss-Hermite quadrature (for Gaussian shocks)
    

To make this concrete, we examine what these pairings look like in practice for collocation and Galerkin projection.

<a id="orthogonal-collocation-with-chebyshev-polynomials"></a>

### Orthogonal Collocation with Chebyshev Polynomials

Consider approximating the value function using Chebyshev polynomials of degree $n-1$:

<a id="RM7LuIkTDd"></a>

$$
\hat{v}(s; \theta) = \sum_{i=0}^{n-1} \theta_i T_i(s)
$$

[(6)](#RM7LuIkTDd "Link to this Equation")

For orthogonal collocation, we place collocation points at the zeros of $T_n(s)$, denoted $\{s_j\}_{j=1}^n$. At each collocation point, we require the Bellman equation to hold exactly:

<a id="B8Mdk81GqZ"></a>

$$
\hat{v}(s_j; \theta) = \max_{a \in \mathcal{A}} \left\{r(s_j,a) + \gamma \int \hat{v}(s'; \theta) p(ds'|s_j,a)\right\}
$$

[(7)](#B8Mdk81GqZ "Link to this Equation")

The integral on the right must be approximated using quadrature. With Chebyshev-Gauss quadrature using the same nodes $\{s_k\}_{k=1}^n$ and weights $\{w_k\}_{k=1}^n$, this becomes:

<a id="eMxhtxg3Cn"></a>

$$
\hat{v}(s_j; \theta) = \max_{a \in \mathcal{A}} \left\{r(s_j,a) + \gamma \sum_{k=1}^n w_k \hat{v}(s_k; \theta) p(s_k|s_j,a)\right\}
$$

[(8)](#eMxhtxg3Cn "Link to this Equation")

Substituting the basis representation $\hat{v}(s_k; \theta) = \sum_{i=0}^{n-1} \theta_i T_i(s_k)$:

<a id="kENbMsxrSk"></a>

$$
\sum_{i=0}^{n-1} \theta_i T_i(s_j) = \max_{a \in \mathcal{A}} \left\{r(s_j,a) + \gamma \sum_{k=1}^n w_k p(s_k|s_j,a) \sum_{i=0}^{n-1} \theta_i T_i(s_k)\right\}
$$

[(9)](#kENbMsxrSk "Link to this Equation")

Rearranging:

<a id="RzY4vBvcOi"></a>

$$
\sum_{i=0}^{n-1} \theta_i T_i(s_j) = \max_{a \in \mathcal{A}} \left\{r(s_j,a) + \gamma \sum_{i=0}^{n-1} \theta_i \underbrace{\sum_{k=1}^n w_k T_i(s_k) p(s_k|s_j,a)}_{B_{ji}^a}\right\}
$$

[(10)](#RzY4vBvcOi "Link to this Equation")

This yields a system of $n$ nonlinear equations (one per collocation point):

<a id="bGZ9pqyI1Z"></a>

$$
\sum_{i=0}^{n-1} T_i(s_j) \theta_i = \max_{a \in \mathcal{A}} \left\{r(s_j,a) + \gamma \sum_{i=0}^{n-1} B_{ji}^a \theta_i\right\}, \quad j=1,\ldots,n
$$

[(11)](#bGZ9pqyI1Z "Link to this Equation")

The matrix elements $B_{ji}^a$ can be precomputed once the quadrature nodes, weights, and transition probabilities are known. Solving this system gives the coefficient vector $\theta$.

<a id="galerkin-projection-with-hermite-polynomials"></a>

### Galerkin Projection with Hermite Polynomials

For a problem with Gaussian shocks, we might use Hermite polynomials $\{H_i(s)\}_{i=0}^{n-1}$ weighted by the Gaussian density $\phi(s)$. The Galerkin condition requires:

<a id="anAX9utasT"></a>

$$
\int \left(\mathsf{L} \hat{v}(s; \theta) - \hat{v}(s; \theta)\right) H_j(s) \phi(s) ds = 0, \quad j=0,\ldots,n-1
$$

[(12)](#anAX9utasT "Link to this Equation")

Expanding the Bellman operator:

<a id="yq51ysGK3g"></a>

$$
\int \left[\max_{a \in \mathcal{A}} \left\{r(s,a) + \gamma \int \hat{v}(s'; \theta) p(ds'|s,a)\right\} - \hat{v}(s; \theta)\right] H_j(s) \phi(s) ds = 0
$$

[(13)](#yq51ysGK3g "Link to this Equation")

We approximate this outer integral using Gauss-Hermite quadrature with nodes $\{s_\ell\}_{\ell=1}^m$ and weights $\{w_\ell\}_{\ell=1}^m$:

<a id="v56tM3o7La"></a>

$$
\sum_{\ell=1}^m w_\ell \left[\max_{a \in \mathcal{A}} \left\{r(s_\ell,a) + \gamma \int \hat{v}(s'; \theta) p(ds'|s_\ell,a)\right\} - \hat{v}(s_\ell; \theta)\right] H_j(s_\ell) = 0
$$

[(14)](#v56tM3o7La "Link to this Equation")

The inner integral (transition expectation) is also approximated using Gauss-Hermite quadrature:

<a id="pnwFgdTPkc"></a>

$$
\int \hat{v}(s'; \theta) p(ds'|s_\ell,a) \approx \sum_{k=1}^m w_k \hat{v}(s_k; \theta) p(s_k|s_\ell,a)
$$

[(15)](#pnwFgdTPkc "Link to this Equation")

Substituting the basis representation and collecting terms:

<a id="fGB0Q5znLv"></a>

$$
\sum_{\ell=1}^m w_\ell H_j(s_\ell) \max_{a \in \mathcal{A}} \left\{r(s_\ell,a) + \gamma \sum_{i=0}^{n-1} \theta_i \sum_{k=1}^m w_k H_i(s_k) p(s_k|s_\ell,a)\right\} = \sum_{\ell=1}^m w_\ell H_j(s_\ell) \sum_{i=0}^{n-1} \theta_i H_i(s_\ell)
$$

[(16)](#fGB0Q5znLv "Link to this Equation")

This gives $n$ nonlinear equations in $n$ unknowns. The right-hand side simplifies using orthogonality: when using the same quadrature nodes for projection and integration, $\sum_{\ell=1}^m w_\ell H_j(s_\ell) H_i(s_\ell) = \delta_{ij} \|H_j\|^2$.

In both cases, the basis-quadrature pairing ensures that:

1.  The quadrature nodes appear in both the transition expectation and the outer projection
    
2.  The quadrature accuracy matches the polynomial approximation order
    
3.  Precomputed matrices capture the dynamics, making iterations efficient
    

<a id="monte-carlo-integration"></a>

## Monte Carlo Integration

How do independent random samples trade deterministic quadrature bias for sampling variance and dimension-independent convergence?

Deterministic quadrature rules work well when the state space has low dimension, the transition density is smooth, and we can evaluate it cheaply at arbitrary points. In many stochastic control problems none of these conditions truly hold. The state may be high dimensional, the dynamics may be given by a simulator rather than an explicit density, and the cost of each call to the model may be large. In that regime, deterministic quadrature becomes brittle. Monte Carlo methods offer a different way to approximate expectations, one that relies only on the ability to **sample** from the relevant distributions.

<a id="monte-carlo-as-randomized-quadrature"></a>

### Monte Carlo as randomized quadrature

Consider a single expectation of the form

<a id="ngYsD5WPCz"></a>

$$
J = \int f(x)\,p(dx) = \mathbb{E}[f(X)],
$$

[(17)](#ngYsD5WPCz "Link to this Equation")

where $X \sim p$ and $f$ is some integrable function. Monte Carlo integration approximates $J$ by drawing independent samples $X^{(1)},\ldots,X^{(N)} \sim p$ and forming the sample average

<a id="wpkFoz0NSU"></a>

$$
\hat{J}_N \equiv \frac{1}{N}\sum_{n=1}^N f\bigl(X^{(n)}\bigr).
$$

[(18)](#wpkFoz0NSU "Link to this Equation")

This estimator has two basic properties that will matter throughout this chapter.

First, it is **unbiased**:

<a id="Z0PeOnb3pR"></a>

$$
\mathbb{E}[\hat{J}_N]
= \mathbb{E}\left[\frac{1}{N}\sum_{n=1}^N f(X^{(n)})\right]
= \frac{1}{N}\sum_{n=1}^N \mathbb{E}[f(X^{(n)})]
= \mathbb{E}[f(X)]
= J.
$$

[(19)](#Z0PeOnb3pR "Link to this Equation")

Second, its variance scales as $1/N$. If we write

<a id="KMiY9MSjLf"></a>

$$
\sigma^2 \equiv \mathrm{Var}[f(X)],
$$

[(20)](#KMiY9MSjLf "Link to this Equation")

then independence of the samples gives

<a id="MXpuwKlMwt"></a>

$$
\mathrm{Var}(\hat{J}_N)
= \frac{1}{N^2}\sum_{n=1}^N \mathrm{Var}\bigl(f(X^{(n)})\bigr)
= \frac{\sigma^2}{N}.
$$

[(21)](#MXpuwKlMwt "Link to this Equation")

The central limit theorem then says that for large $N$,

<a id="S6cvtC4fQg"></a>

$$
\sqrt{N}\,(\hat{J}_N - J) \Longrightarrow \mathcal{N}(0,\sigma^2),
$$

[(22)](#S6cvtC4fQg "Link to this Equation")

so the integration error decays at rate $O(N^{-1/2})$. This rate is slow compared to high-order quadrature in low dimension, but it has one crucial advantage: it does not explicitly depend on the dimension of $x$. Monte Carlo integration pays in variance, not in an exponential growth in the number of nodes.

It is often helpful to view Monte Carlo as **randomized quadrature**. A deterministic quadrature rule selects nodes $x_j$ and weights $w_j$ in advance and computes

<a id="zgNkYje3ir"></a>

$$
\sum_j w_j f(x_j).
$$

[(23)](#zgNkYje3ir "Link to this Equation")

Monte Carlo can be written in the same form: if we draw $X^{(n)}$ from density $p$, the sample average

<a id="Q8oBnZJRTv"></a>

$$
\hat{J}_N = \frac{1}{N}\sum_{n=1}^N f(X^{(n)})
$$

[(24)](#Q8oBnZJRTv "Link to this Equation")

is just a quadrature rule with random nodes and equal weights. More advanced Monte Carlo schemes, such as importance sampling, change both the sampling distribution and the weights, but the basic idea remains the same.

<a id="monte-carlo-evaluation-of-the-bellman-operator"></a>

### Monte Carlo evaluation of the Bellman operator

We now apply this to the Bellman operator. For a fixed value function $v$ and a given state-action pair $(s,a)$, the transition part of the Bellman operator is

<a id="MZAT4X3lvA"></a>

$$
\int v(s')\,p(ds' \mid s,a)
= \mathbb{E}\left[v(S') \mid S = s, A = a\right].
$$

[(25)](#MZAT4X3lvA "Link to this Equation")

If we can simulate next states $S'^{(1)},\ldots,S'^{(N)}$ from the transition kernel $p(\cdot \mid s,a)$, either by calling a simulator or by interacting with the environment, we can approximate this expectation by

<a id="nEVPleid9G"></a>

$$
\widehat{\mathbb{E}}_N\bigl[v(S') \mid s,a\bigr]
\equiv
\frac{1}{N}\sum_{n=1}^N v\bigl(S'^{(n)}\bigr).
$$

[(26)](#nEVPleid9G "Link to this Equation")

If the immediate reward is also random, say

<a id="Hfnvf8S3B2"></a>

$$
r = r(S,A,S') \quad \text{with} \quad (S', r) \sim p(\cdot \mid s,a),
$$

[(27)](#Hfnvf8S3B2 "Link to this Equation")

we can approximate the full one-step return

<a id="cgDqb9LH7u"></a>

$$
\mathbb{E}\bigl[r + \gamma v(S') \mid S = s, A = a\bigr]
$$

[(28)](#cgDqb9LH7u "Link to this Equation")

by

<a id="I8bHNyFAXC"></a>

$$
\widehat{G}_N(s,a)
\equiv
\frac{1}{N}\sum_{n=1}^N \bigl[r^{(n)} + \gamma v(S'^{(n)})\bigr],
$$

[(29)](#I8bHNyFAXC "Link to this Equation")

where $(r^{(n)}, S'^{(n)})$ are independent samples given $(s,a)$. Again, this is an unbiased estimator of the Bellman expectation for fixed $v$.

Plugging this into the Bellman operator gives a **Monte Carlo Bellman operator**:

<a id="j13qKJzumd"></a>

$$
(\widehat{\mathsf{L}}_N v)(s)
\equiv
\max_{a \in \mathcal{A}_s}
\left\{
\widehat{G}_N(s,a)
\right\}.
$$

[(30)](#j13qKJzumd "Link to this Equation")

The expectation inside the braces is now replaced by a random sample average. In model-based settings, we implement this by simulating many next states for each candidate action $a$ at state $s$. In model-free settings, we obtain samples from real interactions and re-use them to estimate the expectation.

At this stage nothing about approximation or projection has entered yet. For a fixed value function $v$, Monte Carlo provides unbiased, noisy evaluations of $(\mathsf{L} v)(s)$. The approximation question arises once we couple this stochastic evaluation with basis functions and projections.

<a id="sampling-the-outer-expectations"></a>

### Sampling the outer expectations

Projection methods introduce a second layer of integration. In Galerkin and least squares schemes, we choose a distribution $\mu$ over states (and sometimes actions) and enforce conditions of the form

<a id="hotxubflNx"></a>

$$
\int R(s; \theta)\,p_i(s)\, \mu(ds) = 0
\quad \text{or} \quad
\int R(s; \theta)^2\,\mu(ds) \text{ is minimized}.
$$

[(31)](#hotxubflNx "Link to this Equation")

Here $R(s; \theta)$ is the residual function, such as

<a id="MKCSV9Mxni"></a>

$$
R(s; \theta) = (\mathsf{L} \hat{v})(s;\theta) - \hat{v}(s;\theta),
$$

[(32)](#MKCSV9Mxni "Link to this Equation")

and $p_i$ are test functions or derivatives of the residual with respect to parameters.

Note a subtle but important shift in perspective from the previous chapter. There, the weight function $w(s)$ in the inner product $\langle f, g \rangle_w = \int f(s) g(s) w(s) ds$ could be any positive weight function (not necessarily normalized). For Monte Carlo integration, however, we need a probability distribution we can sample from. We write $\mu$ for this sampling distribution and express projection conditions as integrals with respect to $\mu$: $\int R(s; \theta) p_i(s) \mu(ds)$. If a problem was originally formulated with an unnormalized weight $w(s)$, we must either (i) normalize it to define $\mu$, or (ii) use importance sampling with a different $\mu$ and reweight samples by $w(s)/\mu(s)$. In reinforcement learning, $\mu$ is typically the empirical state visitation distribution from collected trajectories.

These outer integrals over $s$ are generally not easier to compute than the inner transition expectations. Monte Carlo gives a way to approximate them as well. If we can draw states $S^{(1)},\ldots,S^{(M)} \sim \mu$, we can approximate, for example, the Galerkin orthogonality conditions by

<a id="c92EOTw0z5"></a>

$$
\int R(s; \theta)\,p_i(s)\,\mu(ds)
\approx
\frac{1}{M}\sum_{m=1}^M R\bigl(S^{(m)}; \theta\bigr)\,p_i\bigl(S^{(m)}\bigr).
$$

[(33)](#c92EOTw0z5 "Link to this Equation")

Similarly, a least squares objective

<a id="DIQpSsBclw"></a>

$$
\int R(s; \theta)^2\,\mu(ds)
$$

[(34)](#DIQpSsBclw "Link to this Equation")

is approximated by the empirical risk

<a id="oSJhBG9Ogy"></a>

$$
\frac{1}{M}\sum_{m=1}^M R\bigl(S^{(m)}; \theta\bigr)^2.
$$

[(35)](#oSJhBG9Ogy "Link to this Equation")

If we now substitute Monte Carlo estimates for both the inner transition expectations and the outer projection conditions, we obtain fully simulation-based schemes. We no longer need explicit access to the transition kernel $p(\cdot \mid s,a)$ or the state distribution $\mu$. It is enough to be able to **sample** from them, either through a simulator or by interacting with the real system.

<a id="simulation-based-projection-methods"></a>

### Simulation-Based Projection Methods

Monte Carlo integration replaces both levels of integration in approximate dynamic programming. The transition expectation in the Bellman operator becomes $\frac{1}{N}\sum_{n=1}^N v(S'^{(n)})$, and the outer integrals for projection become empirical averages over sampled states. Writing $\mathsf{P}_M$ for projection using $M$ state samples and $\widehat{\mathsf{L}}_N$ for the Monte Carlo Bellman operator with $N$ transition samples, the iteration becomes

<a id="T8kvPere8d"></a>

$$
\hat{v}^{(k+1)} = \mathsf{P}_M\,\widehat{\mathsf{L}}_N \hat{v}^{(k)}.
$$

[(36)](#T8kvPere8d "Link to this Equation")

In the typical reinforcement learning setting, $N=1$: each observed transition $(s_i, a_i, r_i, s'_i)$ provides exactly one sample of the next state. This means we work with high-variance single-sample estimates $r_i + \gamma v(s'_i)$ rather than averaged returns. Variance reduction comes from aggregating information across different transitions through the function approximator and from collecting long trajectories with many transitions. We examine this single-sample constraint in detail after introducing Q-functions below.

Unlike deterministic quadrature, which introduces a fixed bias at each iteration, Monte Carlo introduces random error with zero mean but nonzero variance. However, combining Monte Carlo with the maximization in the Bellman operator creates a systematic problem: while the estimate of the expected return for any individual action is unbiased, taking the maximum over these noisy estimates introduces upward bias. This overestimation compounds through value iteration and degrades the resulting policies. We address this challenge in the [next chapter on fitted Q-iteration](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md).

<a id="interactive-sample-size-diagnostic"></a>

### Interactive sample-size diagnostic

Before moving across the figure, predict what multiplying $N$ by four should do to the root mean squared error. Hover over a point to compare the empirical result with the $1/\sqrt{N}$ prediction.

<a id="mVkxUUsb2t"></a>

Source

```python
import altair as alt
import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
true_mean, sigma, trials = 2.0, 3.0, 4000
sample_sizes = 2 ** np.arange(0, 11)
summary = []

for n in sample_sizes:
    estimates = rng.normal(true_mean, sigma, size=(trials, n)).mean(axis=1)
    summary.append({
        "N": int(n),
        "Mean estimate": estimates.mean(),
        "Empirical RMSE": np.sqrt(np.mean((estimates - true_mean) ** 2)),
        "Theory RMSE": sigma / np.sqrt(n),
    })

mc_summary = pd.DataFrame(summary)
hover_n = alt.selection_point(fields=["N"], nearest=True, on="pointerover", empty=False)

mean_chart = (
    alt.Chart(mc_summary)
    .mark_line(point=True, color="#2563eb")
    .encode(
        x=alt.X("N:Q", scale=alt.Scale(type="log", base=2), title="Samples N"),
        y=alt.Y("Mean estimate:Q", scale=alt.Scale(zero=False)),
        opacity=alt.condition(hover_n, alt.value(1), alt.value(0.55)),
        tooltip=["N:Q", alt.Tooltip("Mean estimate:Q", format=".4f")],
    )
    .add_params(hover_n)
    .properties(height=180, title="The sample mean remains unbiased")
)

rmse_long = mc_summary.melt(
    id_vars="N", value_vars=["Empirical RMSE", "Theory RMSE"],
    var_name="Series", value_name="RMSE"
)
rmse_chart = (
    alt.Chart(rmse_long)
    .mark_line(point=True)
    .encode(
        x=alt.X("N:Q", scale=alt.Scale(type="log", base=2), title="Samples N"),
        y=alt.Y("RMSE:Q", scale=alt.Scale(type="log")),
        color=alt.Color("Series:N", legend=alt.Legend(orient="top")),
        tooltip=["Series:N", "N:Q", alt.Tooltip("RMSE:Q", format=".4f")],
    )
    .properties(height=180, title="Error falls at the Monte Carlo rate")
)

alt.vconcat(mean_chart, rmse_chart).resolve_scale(color="independent")
```

Loading...

<a id="amortizing-action-selection-via-q-functions"></a>

### Amortizing Action Selection via Q-Functions

Monte Carlo integration enables model-free approximate dynamic programming: we no longer need explicit transition probabilities $p(s'|s,a)$, only the ability to sample next states. However, one computational challenge remains. The standard formulation of an optimal decision rule is

<a id="zN6nKmdy3b"></a>

$$
\pi(s) = \arg\max_{a \in \mathcal{A}} \left\{r(s,a) + \gamma \int v(s')p(ds'|s,a)\right\}.
$$

[(37)](#zN6nKmdy3b "Link to this Equation")

Even with an optimal value function $v^*$ in hand, extracting an action at state $s$ requires evaluating the transition expectation for each candidate action. In the model-free setting, this means we must draw Monte Carlo samples from each action’s transition distribution every time we select an action. This repeated sampling “at inference time” wastes computation, especially when the same state is visited multiple times.

We can amortize this computation by working at a different level of representation. Define the **state-action value function** (or **Q-function**)

<a id="pfpKTsu00l"></a>

$$
q(s,a) = r(s,a) + \gamma \int v(s')p(ds'|s,a).
$$

[(38)](#pfpKTsu00l "Link to this Equation")

The Q-function caches the result of evaluating each action at each state. Once we have $q$, action selection reduces to a finite maximization:

<a id="VL4mhLN1jb"></a>

$$
\pi(s) = \arg\max_{a \in \mathcal{A}(s)} q(s,a).
$$

[(39)](#VL4mhLN1jb "Link to this Equation")

No integration appears in this expression. The transition expectation has been precomputed and stored in $q$ itself.

The optimal Q-function $q^*$ satisfies its own Bellman equation. Substituting the definition of $v^*(s) = \max_a q^*(s,a)$ into the expression for $q$:

<a id="D1QKamxoC7"></a>

$$
q^*(s,a) = r(s,a) + \gamma \int p(ds'|s,a) \max_{a' \in \mathcal{A}(s')} q^*(s', a').
$$

[(40)](#D1QKamxoC7 "Link to this Equation")

This defines a Bellman operator on Q-functions:

<a id="xQr4VMfDCD"></a>

$$
(\mathsf{L} q)(s,a) = r(s,a) + \gamma \int p(ds'|s,a)\max_{a' \in \mathcal{A}(s')} q(s', a').
$$

[(41)](#xQr4VMfDCD "Link to this Equation")

Like the Bellman operator on value functions, $\mathsf{L}$ is a $\gamma$\-contraction in the sup-norm, guaranteeing a unique fixed point $q^*$. We can thus apply the same projection and Monte Carlo techniques developed for value functions to Q-functions. The computational cost shifts from action selection (repeated sampling at decision time) to training (evaluating expectations during the iterations of approximate value iteration). Once $q$ is learned, acting is cheap.

<a id="simadp-parametric-q-value-iteration"></a>

[Algorithm 1](#simadp-parametric-q-value-iteration "Link to this Algorithm") (Parametric Q-Value Iteration)

**Input** Given an MDP $(S, A, P, R, \gamma)$, base points $\mathcal{B} \subset S$, function approximator class $q(s,a; \boldsymbol{\theta})$, maximum iterations $N$, tolerance $\varepsilon > 0$, initial parameters $\boldsymbol{\theta}_0$

**Output** Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$ (e.g., random initialization)
    
2.  $n \leftarrow 0$
    
3.  **repeat**
    
    1.  $\mathcal{D} \leftarrow \emptyset$
        
    2.  For each $(s,a) \in \mathcal{B} \times A$:
        
        1.  $y_{s,a} \leftarrow r(s,a) + \gamma \int p(ds'|s,a)\max_{a' \in A} q(s',a'; \boldsymbol{\theta}_n)$
            
        2.  $\mathcal{D} \leftarrow \mathcal{D} \cup \{((s,a), y_{s,a})\}$
            
    3.  $\boldsymbol{\theta}_{n+1} \leftarrow \texttt{fit}(\mathcal{D}, \boldsymbol{\theta}_{\text{init}}=\boldsymbol{\theta}_0, K=\infty)$
        
    4.  $\delta \leftarrow \frac{1}{|\mathcal{D}||A|}\sum_{(s,a) \in \mathcal{D} \times A} (q(s,a; \boldsymbol{\theta}_{n+1}) - q(s,a; \boldsymbol{\theta}_n))^2$
        
    5.  $n \leftarrow n + 1$
        
4.  **until** ($\delta < \varepsilon$ or $n \geq N$)
    
5.  **return** $\boldsymbol{\theta}_n$
    

The algorithm above evaluates the expectation $\int p(ds'|s,a)\max_{a'} q(s',a'; \boldsymbol{\theta}_n)$ at each state-action pair. In principle, we could approximate this integral using many Monte Carlo samples: draw $N$ next states from $p(\cdot|s,a)$ and average $\frac{1}{N}\sum_{i=1}^N \max_{a'} q(s'_i, a')$ to reduce variance. This is standard Monte Carlo integration applied to the Bellman operator.

<a id="the-single-sample-paradigm"></a>

### The Single-Sample Paradigm

Most reinforcement learning algorithms do not follow this pattern. Instead, they work with datasets of **transition tuples** $\mathcal{D} = \{(s_i, a_i, r_i, s'_i)\}_{i=1}^M$, where each tuple records a single observed next state $s'_i$ from executing action $a_i$ in state $s_i$. Each transition provides exactly one sample of the dynamics: the target becomes $y_i = r_i + \gamma \max_{a'} q(s'_i, a')$ using only the single observed $s'_i$.

This design choice has two origins. First, it reflects genuine constraints in some problem settings. A robot executing action $a$ in state $s$ observes one outcome $s'$ and cannot rewind to the exact same state to sample alternative continuations. Real physical systems, biological experiments, and costly interactions (clinical trials, manufacturing processes) provide one sample per executed action. However, many domains where RL is applied do not face this constraint. Game emulators support state saving and restoration, physics simulators can reset to arbitrary configurations, and software environments can be cloned cheaply. The single-sample pattern persists in these settings not from necessity but from algorithmic convention.

Second, and perhaps more fundamentally, the single-sample paradigm emerged from reinforcement learning’s roots in computational neuroscience and models of biological intelligence. Early work viewed RL as a model of animal learning, where organisms experience one consequence per action and must learn from streaming sensory data. This perspective shaped the field’s algorithmic agenda: develop methods that learn from single sequential experiences, as biological agents do. Temporal difference learning, Q-learning, and actor-critic methods all follow this template.

These origins matter because they established design choices that persist even when the original constraints do not apply. In many practical applications, we have fast simulators that support arbitrary state initialization (e.g., physics engines for robotics, game emulators for Atari). We could collect multiple next-state samples per $(s,a)$ pair to reduce variance in target computation. However, most algorithms do not exploit this capability. The transition tuple $(s_i, a_i, r_i, s'_i)$ with $N=1$ remains the standard data structure, and methods compensate for high variance through other means: larger replay buffers, function approximation that pools information across samples, multi-step returns, and careful optimization strategies.

This creates an asymmetry in how algorithms use Monte Carlo integration. For the outer expectation (sampling which states to evaluate at), algorithms freely adjust sample size: offline methods reuse entire datasets, replay buffers store thousands of transitions, online methods process one sample per step. For the inner expectation (sampling next states to evaluate the Bellman operator at a given $(s,a)$), the overwhelming majority of practical methods use $N=1$ regardless of whether the environment permits larger samples.

The single-sample paradigm shapes three aspects of algorithm design:

1.  **Data structure**: Algorithms store and manipulate tuples $\{(s_i, a_i, r_i, s'_i)\}$, not state-action pairs with multiple next-state samples
    
2.  **Variance reduction**: Comes from aggregation across different samples through function approximation and from trajectory length, not from repeated sampling at fixed $(s,a)$
    
3.  **Target computation**: Each transition yields exactly one target $y_i = r_i + \gamma \max_{a'} q(s'_i, a')$ evaluated at the single observed $s'_i$
    

The algorithms that follow in the next chapters all adopt this single-sample structure. Understanding its origins clarifies when the design choice might be revisited: in domains with cheap, resettable simulators and high target variance, averaging multiple next-state samples per $(s,a)$ pair offers a direct variance reduction mechanism that is rarely exploited in current practice.

<a id="overestimation-bias-and-mitigation-strategies"></a>

## Overestimation Bias and Mitigation Strategies

What systematic bias appears when the same noisy action estimates are used for both selection and evaluation?

Monte Carlo integration provides unbiased estimates of individual expectations, but when we apply the Bellman operator’s maximization to these noisy estimates, a systematic problem arises: taking the maximum over noisy values creates upward bias. This overestimation compounds through iterative algorithms and can severely degrade the quality of learned policies. This section examines the sources of this bias and presents two approaches for mitigating it.

<a id="sources-of-overestimation-bias"></a>

### Sources of Overestimation Bias

When we apply Monte Carlo integration to the Bellman operator, each individual expectation is unbiased. The problem arises when we maximize over these noisy estimates. To make this precise, consider a given state-action pair $(s,a)$ and value function $v$. Define the true continuation value

<a id="tz1HiZggyZ"></a>

$$
\mu(s,a) \equiv \int v(s')\,p(ds' \mid s,a),
$$

[(42)](#tz1HiZggyZ "Link to this Equation")

and its Monte Carlo approximation with $N$ samples:

<a id="Har6UDQQ6O"></a>

$$
\hat{\mu}_N(s,a) \equiv \frac{1}{N}\sum_{i=1}^N v(s'_i), \quad s'_i \sim p(\cdot|s,a).
$$

[(43)](#Har6UDQQ6O "Link to this Equation")

Each estimator is unbiased: $\mathbb{E}[\hat{\mu}_N(s,a)] = \mu(s,a)$. The Monte Carlo Bellman operator is

<a id="duKLAnO0Tb"></a>

$$
(\widehat{\mathsf{L}}_N v)(s) = \max_{a \in \mathcal{A}_s} \left\{ r(s,a) + \gamma \hat{\mu}_N(s,a)\right\}.
$$

[(44)](#duKLAnO0Tb "Link to this Equation")

While each $\hat{\mu}_N(s,a)$ is unbiased, the maximization introduces systematic overestimation. To see why, let $a^*$ be the truly optimal action. The maximum of any collection is at least as large as any particular element:

<a id="JHCgRDGp3W"></a>

$$
\mathbb{E}\big[\max_a \{r(s,a) + \gamma \hat{\mu}_N(s,a)\}\big] \ge \mathbb{E}\big[r(s,a^*) + \gamma \hat{\mu}_N(s,a^*)\big] = r(s,a^*) + \gamma \mu(s,a^*) = (\mathsf{L} v)(s).
$$

[(45)](#JHCgRDGp3W "Link to this Equation")

The inequality is strict whenever multiple actions have nonzero variance. The maximization selects whichever action happens to receive a positive noise realization, and that inflated estimate contributes to the target value. This is Jensen’s inequality for the max operator: $\mathbb{E}[\max_a Y_a] \ge \max_a \mathbb{E}[Y_a]$ for random variables $\{Y_a\}$, since the max is convex. Even though we start with unbiased estimators, taking the maximum breaks unbiasedness.

The next diagnostic holds every true action value at zero. Use the legend to isolate an estimator and hover over the points. The maximum estimator becomes increasingly optimistic as the number of actions grows, while independent evaluation removes that effect in expectation.

<a id="uJTgM12qJB"></a>

Source

```python
import altair as alt
import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
replications, samples_per_action = 6000, 5
bias_rows = []

for actions in [2, 4, 8, 16, 32]:
    selection_estimates = rng.normal(
        size=(replications, actions, samples_per_action)
    ).mean(axis=2)
    evaluation_estimates = rng.normal(
        size=(replications, actions, samples_per_action)
    ).mean(axis=2)
    selected = selection_estimates.argmax(axis=1)
    maximum = selection_estimates.max(axis=1)
    double = evaluation_estimates[np.arange(replications), selected]
    for name, values in [("Maximum estimator", maximum), ("Double estimator", double)]:
        bias_rows.append({
            "Actions": actions,
            "Estimator": name,
            "Bias": values.mean(),
            "Monte Carlo SE": values.std(ddof=1) / np.sqrt(replications),
        })

bias_data = pd.DataFrame(bias_rows)
estimator_pick = alt.selection_point(fields=["Estimator"], bind="legend")

(
    alt.Chart(bias_data)
    .mark_line(point=alt.OverlayMarkDef(size=70))
    .encode(
        x=alt.X("Actions:Q", scale=alt.Scale(type="log", base=2)),
        y=alt.Y("Bias:Q", scale=alt.Scale(zero=True)),
        color=alt.Color("Estimator:N", legend=alt.Legend(orient="top")),
        opacity=alt.condition(estimator_pick, alt.value(1), alt.value(0.18)),
        tooltip=["Estimator:N", "Actions:Q", alt.Tooltip("Bias:Q", format=".4f")],
    )
    .add_params(estimator_pick)
    .properties(height=320, title="Selection and evaluation with independent noise")
)
```

Loading...

Operationally, this means that repeatedly sampling fresh states and taking the max will not, on average, converge to the true value but systematically land above it. Unlike noise that averages out, this bias persists no matter how many samples we draw. Worse, it compounds across iterations as overestimates feed into future target computations.

Remark 1 (Connection to deterministic policies)

This inequality also underlies why deterministic policies are optimal in MDPs ([Theorem 2](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/16-stochastic-dp.md#stoch-policy-reduction)): $\max_a w(a) \ge \sum_a q(a) w(a)$ shows randomization cannot improve expected returns. The same mathematical principle appears in two contexts: (1) deterministic policies suffice, (2) maximization over noisy estimates creates upward bias.

Monte Carlo value iteration applies $v_{k+1} = \widehat{\mathsf{L}}_N v_k$ repeatedly. The overestimation bias does not stay confined to a single iteration: it accumulates through the recursion. At iteration 2, we compute Monte Carlo estimates $\hat{\mu}_N(s,a) = \frac{1}{N}\sum_{i=1}^N v_1(s'_i)$, but $v_1$ is already biased upward from iteration 1. Averaging an overestimated function and then maximizing over noisy estimates compounds the bias: $\mathbb{E}[v_k] \ge \mathbb{E}[v_{k-1}] \ge \cdots \ge v^*$. Without correction, this feedback loop can produce severely inflated value estimates that yield poor policies.

<a id="learning-the-bias-correction"></a>

### Learning the Bias Correction

One approach, developed by Keane and Wolpin [Keane & Wolpin (1994)](https://doi.org/10.2307/2109768) in the context of dynamic discrete choice models, treats the bias itself as a quantity to be learned and subtracted. For a given value function $v$ and Monte Carlo sample size $N$, define the bias at state $s$ as

<a id="uxOROO59YJ"></a>

$$
\delta(s) = \mathbb{E}\big[(\widehat{\mathsf{L}}_N v)(s)\big] - (\mathsf{L} v)(s) \ge 0.
$$

[(46)](#uxOROO59YJ "Link to this Equation")

While we cannot compute $\delta(s)$ directly (we lack both the expectation and the exact Bellman application), the bias has structure. It depends on observable quantities: the number of actions $|\mathcal{A}_s|$, the sample size $N$, and the spread of action values. When one action dominates, $\delta(s)$ is small. When several actions have similar values, noise is more likely to flip the maximizer, increasing $\delta(s)$.

Rather than deriving $\delta(s)$ analytically, Keane and Wolpin proposed learning it empirically. The strategy follows a “simulate on a subset, interpolate everywhere” template common in econometric dynamic programming. At a carefully chosen set of states, we run both high-fidelity simulation (many samples or exact integration) and the low-fidelity $N$\-sample estimate used in value iteration. The gap between these estimates provides training data for the bias. We then fit a regression model $g_\eta$ that predicts $\delta(s)$ from features of the state and action-value distribution. During value iteration, we subtract the predicted bias from the raw Monte Carlo maximum.

Useful features for predicting the bias include the spread of action values (from a separate high-fidelity simulation), the number of actions, and gaps to the best action. These are cheap to compute and track regimes where maximization bias is large. The procedure can be summarized as:

<a id="keane-wolpin-bias-correction"></a>

[Algorithm 2](#keane-wolpin-bias-correction "Link to this Algorithm") (Keane-Wolpin Bias-Corrected Value Iteration)

**Input:** MDP, current value $v_k$, sample size $N$, learned bias correction $g_\eta$

**Output:** Bias-corrected next value $v_{k+1}$

1.  **For** each state $s$ **do**:
    
    -   **For** each action $a$ **do**:
        
        -   Draw $N$ samples: $s'_1, \ldots, s'_N \sim p(\cdot|s,a)$
            
        -   Compute $\hat{\mu}_N(s,a) = \frac{1}{N}\sum_{i=1}^N v_k(s'_i)$
            
    -   Compute raw max: $M(s) = \max_a \{r(s,a) + \gamma \hat{\mu}_N(s,a)\}$
        
    -   Construct features $\phi(s)$ from action-value spread (using separate high-fidelity estimate)
        
    -   Bias-corrected value: $v_{k+1}(s) = M(s) - g_\eta(\phi(s))$
        

The regression model $g_\eta$ is trained offline by comparing high and low-fidelity simulations at a grid of states, then applied during each value iteration step. This approach has been influential in econometrics for structural estimation problems. However, it has seen limited adoption in reinforcement learning. The computational overhead is substantial: it requires high-fidelity simulation at training states, careful feature engineering, and maintaining the regression model throughout learning. More critically, the circular dependency between the bias estimate and the value function can amplify errors if $g_\eta$ is misspecified.

<a id="analytical-bias-correction"></a>

### Analytical Bias Correction

[Lee _et al._ (2013)](https://doi.org/10.1109/adprl.2013.6614994)[Lee & Powell (2019)](https://doi.org/10.1109/tac.2019.2912443) developed an alternative that derives the bias analytically using extreme value theory rather than learning it empirically. Their analysis considers the distributional structure of the noise in Monte Carlo estimates. When rewards are Gaussian with variance $\sigma^2$, the bias in $\max_a \widehat{R}(s,a)$ can be computed from extreme value theory.

For a single-state MDP where all randomness comes from stochastic rewards, suppose that for each action $a$, the observed reward is $\widehat{R}(s,a) = \mu_a + \varepsilon_a$ where $\varepsilon_a \sim \mathcal{N}(0, \sigma^2)$. When we form the target $\max_a \widehat{R}(s,a)$, we are taking the maximum of $M = |\mathcal{A}(s)|$ independent Gaussians. After appropriate centering and scaling, this maximum converges in distribution to a Gumbel random variable. The expected bias can be computed as:

<a id="CqUaG5212M"></a>

$$
\mathbb{E}\left[\max_{a} \varepsilon_a\right] \approx \sigma \left(\frac{\xi}{b_M} + b_M\right)
$$

[(47)](#CqUaG5212M "Link to this Equation")

where $b_M = \sqrt{2\log M - \log\log M - \log 4\pi}$ and $\xi \approx 0.5772$ is the Euler-Mascheroni constant. This quantity is positive and grows with the number of actions $M$. The bias scales with the noise level $\sigma$ and with the action space size.

The corrected target becomes:

<a id="Vec5dO2omn"></a>

$$
\tilde{y}_i = r_i + \gamma \max_{a'} q(s'_i, a'; \boldsymbol{\theta}^{(n)}) - B(s_i, a_i)
$$

[(48)](#Vec5dO2omn "Link to this Equation")

where the bias correction term is:

<a id="wY8FB5cxGQ"></a>

$$
B(s,a) = \left(\frac{\xi}{b_{|A(s)|}} + b_{|A(s)|}\right) \hat{\sigma}(s,a)
$$

[(49)](#wY8FB5cxGQ "Link to this Equation")

Here $\hat{\sigma}(s,a) = \sqrt{\widehat{\text{Var}}[R(s,a)]}$ is the estimated standard deviation of the reward at state-action pair $(s,a)$. This can be computed from multiple observed reward samples at the same $(s,a)$ pair if available.

This approach is exact for single-state MDPs where Q-values equal expected rewards and all bias comes from reward noise. For general multi-state MDPs, the situation is more complex. The bias arises from the max operator over Q-values at the next state $s'$, not from reward stochasticity at the current state. Lee and Powell’s multistate extension addresses this by introducing a separate correction term $B^T$ for transition stochasticity, estimated empirically by averaging $\max_{a'} q(s', a')$ over multiple sampled next states from the same $(s,a)$ pair, rather than using an analytical formula. The single-state analytical correction remains valuable for bandit problems and as a first-order approximation when reward variance dominates, but does not directly address max-operator bias from function approximation error in the Q-values themselves. The correction is optimal specifically for Gaussian errors. If the true errors have heavier tails, the correction may be insufficient.

Lee-Powell’s analytical formula can be viewed as deriving what Keane-Wolpin learned empirically, replacing the regression model with a closed-form expression from extreme value theory. The trade-off is generality versus computational cost: Keane-Wolpin adapts to any noise structure but requires expensive high-fidelity simulations at training states; Lee-Powell assumes Gaussian noise but evaluates instantly once $\hat{\sigma}$ is estimated. Both subtract a correction term from targets while preserving squared error loss.

An alternative to explicit bias correction is to replace the hard max operator with a soft maximum. The [regularized MDP chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md) discusses smooth Bellman operators that use logsumexp or Gaussian uncertainty-weighted aggregation to avoid the discontinuity and overestimation inherent in taking a hard maximum. These approaches modify the Bellman operator itself rather than correcting its bias after the fact, preserving squared error loss while constructing smoother targets. Another approach, examined in the [next chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md), changes the loss function itself to match the noise structure in TD targets.

<a id="decoupling-selection-and-evaluation"></a>

### Decoupling Selection and Evaluation

An alternative approach modifies the estimator itself to break the coupling that creates bias. In the standard Monte Carlo update $\max_a \{r(s,a) + \gamma \hat{\mu}_N(s,a)\}$, the same noisy estimate both selects which action looks best and provides the value assigned to that action. To see the problem, decompose the estimator into its mean and noise:

<a id="HhjtpaWWSi"></a>

$$
\hat{\mu}_N(s,a) = \mu(s,a) + \varepsilon_a,
$$

[(50)](#HhjtpaWWSi "Link to this Equation")

where $\varepsilon_a$ is zero-mean noise. Whichever action happens to have the largest $\varepsilon_a$ gets selected, and that same positive noise inflates the target value:

<a id="gXajdfyx8J"></a>

$$
Y = r(s,a^\star) + \gamma \mu(s,a^\star) + \gamma \varepsilon_{a^\star},
$$

[(51)](#gXajdfyx8J "Link to this Equation")

where $a^\star = \arg\max_a \{r(s,a) + \gamma \mu(s,a) + \gamma \varepsilon_a\}$. This coupling (using the same random variable $\varepsilon_{a^\star}$ for both selection and evaluation) produces $\mathbb{E}[Y] \ge \max_a \{r(s,a) + \gamma \mu(s,a)\}$.

Double Q-learning Van Hasselt _et al._ (2016) breaks this coupling by maintaining two independent Monte Carlo estimates. Conceptually, for each action $a$ at state $s$, we would draw two separate sets of samples from $p(\cdot|s,a)$:

<a id="LwMsYlLApJ"></a>

$$
\hat{\mu}^{(1)}_N(s,a) = \mu(s,a) + \varepsilon^{(1)}_a, \quad \hat{\mu}^{(2)}_N(s,a) = \mu(s,a) + \varepsilon^{(2)}_a,
$$

[(52)](#LwMsYlLApJ "Link to this Equation")

where $\varepsilon^{(1)}_a$ and $\varepsilon^{(2)}_a$ are **independent zero-mean noise terms**. We use the first estimate to select the action but the second to evaluate it:

<a id="H4aR5yVOlQ"></a>

$$
a^\star = \arg\max_{a} \left\{r(s,a) + \gamma \hat{\mu}^{(1)}_N(s,a)\right\}, \quad Y = r(s,a^\star) + \gamma \hat{\mu}^{(2)}_N(s,a^\star).
$$

[(53)](#H4aR5yVOlQ "Link to this Equation")

Note that $a^\star$ is a random variable. It is the result of maximizing over noisy estimates $\hat{\mu}^{(1)}_N(s,a)$, and therefore depends on the noise $\varepsilon^{(1)}$. The target value $Y$ uses the second estimator $\hat{\mu}^{(2)}_N(s,a^\star)$, evaluating it at the randomly selected action $a^\star$. Expanding the target value to make the dependencies explicit:

<a id="QpbTwbgnhU"></a>

$$
Y = r(s,a^\star) + \gamma \hat{\mu}^{(2)}_N(s,a^\star) = r(s,a^\star) + \gamma \mu(s,a^\star) + \gamma \varepsilon^{(2)}_{a^\star},
$$

[(54)](#QpbTwbgnhU "Link to this Equation")

where $a^\star$ itself depends on $\varepsilon^{(1)}$. To see why this eliminates evaluation bias, write the expectation as a nested expectation:

<a id="PsU65DeQG2"></a>

$$
\mathbb{E}[Y] = \mathbb{E}_{\varepsilon^{(1)}}\Big[\mathbb{E}_{\varepsilon^{(2)}}\big[r(s,a^\star) + \gamma \mu(s,a^\star) + \gamma \varepsilon^{(2)}_{a^\star} \mid a^\star\big]\Big].
$$

[(55)](#PsU65DeQG2 "Link to this Equation")

The inner expectation, conditioned on the selected action $a^\star$, equals:

<a id="gXSXFGTg1C"></a>

$$
\mathbb{E}_{\varepsilon^{(2)}}\big[r(s,a^\star) + \gamma \mu(s,a^\star) + \gamma \varepsilon^{(2)}_{a^\star} \mid a^\star\big] = r(s,a^\star) + \gamma \mu(s,a^\star),
$$

[(56)](#gXSXFGTg1C "Link to this Equation")

because $\mathbb{E}[\varepsilon^{(2)}_{a^\star} \mid a^\star] = 0$. Why does this conditional expectation vanish? Because $a^\star$ is a random variable determined entirely by $\varepsilon^{(1)}$ (through the argmax operation), while $\varepsilon^{(2)}$ is independent of $\varepsilon^{(1)}$. Therefore, $\varepsilon^{(2)}$ is independent of $a^\star$. By the fundamental property of independence, for any random variables $X$ and $Y$ where $X \perp Y$, we have $\mathbb{E}[X \mid Y] = \mathbb{E}[X]$. Applying this:

<a id="htWRelNrYT"></a>

$$
\mathbb{E}[\varepsilon^{(2)}_{a^\star} \mid a^\star] = \mathbb{E}[\varepsilon^{(2)}_{a^\star}] = 0,
$$

[(57)](#htWRelNrYT "Link to this Equation")

where the final equality holds because each $\varepsilon^{(2)}_a$ has zero mean. Taking the outer expectation:

<a id="zqorRWHBv5"></a>

$$
\mathbb{E}[Y] = \mathbb{E}_{\varepsilon^{(1)}}\big[r(s,a^\star) + \gamma \mu(s,a^\star)\big].
$$

[(58)](#zqorRWHBv5 "Link to this Equation")

The evaluation noise contributes zero on average because it is independent of the selection. However, double Q-learning does not eliminate all bias. Two distinct sources of bias arise when maximizing over noisy estimates:

1.  **Selection bias**: Using $\arg\max_a \{r(s,a) + \gamma \mu(s,a) + \gamma \varepsilon^{(1)}_a\}$ tends to select actions that received positive noise. The noise $\varepsilon^{(1)}$ causes us to favor actions that got lucky, so $a^\star$ is not uniformly distributed but skewed toward actions with positive $\varepsilon^{(1)}_a$. This means $\mathbb{E}_{\varepsilon^{(1)}}[\mu(s,a^\star)] \ge \max_a \mu(s,a)$.
    
2.  **Evaluation bias**: In the standard estimator, we use the _same_ noisy estimate $\hat{\mu}_N(s,a^\star)$ that selected $a^\star$ to also evaluate it. If $a^\star$ was selected because $\varepsilon_{a^\star}$ happened to be large and positive, that same inflated estimate provides the target value. This creates additional bias beyond the selection effect.
    

Double Q-learning eliminates evaluation bias by using independent noise for evaluation: even though $a^\star$ is biased toward actions with positive $\varepsilon^{(1)}$, the evaluation uses $\varepsilon^{(2)}$ which is independent of the selection, so $\mathbb{E}[\varepsilon^{(2)}_{a^\star} \mid a^\star] = 0$. Selection bias remains, but removing evaluation bias substantially reduces total overestimation.

Remark 2 (Implementation via different Q-functions)

The conceptual framework above assumes we can draw multiple independent samples from $p(\cdot|s,a)$ for each state-action pair. In practice, this would require resetting a simulator to the same state and sampling multiple times, which is often infeasible. The practical implementation achieves the same effect differently: maintain two Q-functions that are trained on different data or updated at different times (e.g., one is a slowly-updating target network). Since the two Q-functions experience different noise realizations during training, their errors remain less correlated than if we used a single Q-function for both selection and evaluation. This is how Double DQN works, as developed in the [FQI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md#double-deep-q-network-double-dqn).

The following algorithm implements this principle with Monte Carlo integration. We maintain two Q-functions and alternate which one selects actions and which one evaluates them. The bias reduction mechanism applies whether we store Q-values in a table or use function approximation.

Note that this algorithm is written in the theoretical form that assumes we can draw $N$ samples from each $(s,a)$ pair. In practice with single-trajectory data ($N=1$, one quadruple $(s,a,r,s')$ per transition), the double Q-learning principle still applies but we work with the single observed next state $s'$ and maintain two Q-functions that are trained on different subsets of data or updated at different frequencies to achieve the independence needed for bias reduction.

<a id="double-q-value-iteration"></a>

[Algorithm 3](#double-q-value-iteration "Link to this Algorithm") (Double Q Value Iteration with Monte Carlo)

**Input:** MDP, state sample $\mathcal{S}$, Monte Carlo sample size $N$, maximum iterations $K$

**Output:** Two Q-functions $q^{(1)}$, $q^{(2)}$

1.  Initialize $q^{(1)}_0(s,a)$ and $q^{(2)}_0(s,a)$ for all $s,a$
    
2.  $k \leftarrow 0$
    
3.  **repeat**
    
4.  $\quad$ **for** each $s \in \mathcal{S}$ **do**
    
5.  $\quad\quad$ **for** each $a \in \mathcal{A}(s)$ **do**
    
6.  $\quad\quad\quad$ Draw $N$ next states: $s'_1, \ldots, s'_N \sim p(\cdot \mid s,a)$
    
7.  $\quad\quad\quad$ **// Compute targets using decoupled selection-evaluation**
    
8.  $\quad\quad\quad$ **for** $i = 1, \ldots, N$ **do**
    
9.  $\quad\quad\quad\quad$ $a^{(1)}_i \leftarrow \arg\max_{a'} q^{(1)}_k(s'_i, a')$
    
10.  $\quad\quad\quad\quad$ $a^{(2)}_i \leftarrow \arg\max_{a'} q^{(2)}_k(s'_i, a')$
     
11.  $\quad\quad\quad$ **end for**
     
12.  $\quad\quad\quad$ $q^{(1)}_{k+1}(s,a) \leftarrow r(s,a) + \frac{\gamma}{N}\sum_{i=1}^N q^{(2)}_k(s'_i, a^{(1)}_i)$
     
13.  $\quad\quad\quad$ $q^{(2)}_{k+1}(s,a) \leftarrow r(s,a) + \frac{\gamma}{N}\sum_{i=1}^N q^{(1)}_k(s'_i, a^{(2)}_i)$
     
14.  $\quad\quad$ **end for**
     
15.  $\quad$ **end for**
     
16.  $\quad$ $k \leftarrow k+1$
     
17.  **until** convergence or $k \geq K$
     
18.  **return** $q^{(1)}_k$, $q^{(2)}_k$
     

At lines 9 and 12, $q^{(1)}$ selects the action but $q^{(2)}$ evaluates it. The noise in $q^{(1)}$ influences which action is chosen, but the independent noise in $q^{(2)}$ does not inflate the evaluation. Lines 10 and 13 apply the same principle symmetrically for updating $q^{(2)}$.

<a id="weighted-estimators-a-third-approach"></a>

### Weighted Estimators: A Third Approach

The Keane-Wolpin and double Q-learning approaches represent two strategies for addressing overestimation bias: explicit correction and decoupled estimation. A third approach, developed by D’Eramo et al. D'Eramo _et al._ (2016), replaces the hard maximum with a probability-weighted average that accounts for uncertainty in value estimates.

The **maximum estimator (ME)** used in standard Q-learning takes the maximum of sample mean Q-values:

<a id="lTpil3cEJh"></a>

$$
\hat{\mu}^{ME}_* = \max_{a \in \mathcal{A}} \hat{\mu}_a
$$

[(59)](#lTpil3cEJh "Link to this Equation")

where $\hat{\mu}_a$ is the sample mean Q-value for action $a$. While each individual $\hat{\mu}_a$ may be unbiased, the maximum is systematically upward biased. The bias can be bounded by:

<a id="RMDcYj1n1W"></a>

$$
\text{Bias}(\hat{\mu}^{ME}_*) \leq \sqrt{\frac{M-1}{M}\sum_{a=1}^M \frac{\sigma_a^2}{n_a}}
$$

[(60)](#RMDcYj1n1W "Link to this Equation")

where $M = |\mathcal{A}|$ is the number of actions, $\sigma_a^2$ is the variance of Q-values for action $a$, and $n_a$ is the number of samples used to estimate it.

The **double estimator (DE)** from double Q-learning reduces this bias by decoupling selection and evaluation, but introduces negative bias:

<a id="RVk66uQzo4"></a>

$$
\mathbb{E}[\hat{\mu}^{DE}_*] \leq \max_a \mu_a
$$

[(61)](#RVk66uQzo4 "Link to this Equation")

This pessimism can be problematic when one action is clearly superior to others, as the estimator may systematically undervalue the optimal action.

The **weighted estimator (WE)** provides a middle ground. Instead of taking a hard maximum, compute a weighted average where weights reflect the probability that each action is optimal. Under a Gaussian approximation for the sampling distribution of Q-value estimates, the weight for action $a$ is:

<a id="aXGSF093Yu"></a>

$$
w_a = \mathbb{P}\left(a \in \arg\max_{a' \in \mathcal{A}} \hat{\mu}_{a'}\right) = \int_{-\infty}^{+\infty} \phi\left(\frac{x - \hat{\mu}_a}{\hat{\sigma}_a/\sqrt{n_a}}\right) \prod_{b \neq a} \Phi\left(\frac{x - \hat{\mu}_b}{\hat{\sigma}_b/\sqrt{n_b}}\right) dx
$$

[(62)](#aXGSF093Yu "Link to this Equation")

where $\phi$ and $\Phi$ are the standard normal PDF and CDF. This integral computes the probability that action $a$ achieves the maximum by integrating over all possible true values $x$. For each $x$, the $\phi$ term gives the probability density that action $a$ has true value $x$, while the product of $\Phi$ terms gives the probability that all other actions have true values below $x$.

The weighted estimator then becomes:

<a id="C9Tz0Sn7X1"></a>

$$
\hat{\mu}^{WE}_* = \sum_{a \in \mathcal{A}} w_a \hat{\mu}_a
$$

[(63)](#C9Tz0Sn7X1 "Link to this Equation")

D’Eramo et al. established that this estimator satisfies $\text{Bias}(\hat{\mu}^{WE}_*) \leq \text{Bias}(\hat{\mu}^{ME}_*)$ and $\text{Bias}(\hat{\mu}^{WE}_*) \geq \text{Bias}(\hat{\mu}^{DE}_*)$. The weighted estimator thus provides a middle ground between the optimism of ME and the pessimism of DE.

The relative performance depends on the problem structure. When one action is clearly superior ($\mu_1 - \mu_2 \gg \sigma$), the signal dominates the noise and ME performs well with minimal overestimation. When multiple actions have similar values ($\mu_1 \approx \mu_2$), eliminating overestimation becomes critical and DE excels despite its pessimism. In intermediate cases, which represent most practical scenarios, WE adapts to the actual uncertainty and avoids both extremes.

The weighted estimator can be incorporated into Q-learning by maintaining variance estimates alongside Q-values and computing the weighted target at each step. The weights $w_a$ themselves can serve as an exploration policy that naturally adapts to estimation uncertainty. This approach adapts automatically to heterogeneous uncertainty across actions and provides balanced bias, but requires maintaining variance estimates (adding memory overhead) and computing integrals (expensive for large action spaces). The method assumes Gaussian sampling distributions, though it proves robust in practice even when this assumption is violated.

The weighted estimator relates to the smooth Bellman operators discussed in the [regularized MDP chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md). Both replace the discontinuous hard maximum with smooth aggregation, but weighted estimation adapts to state-action-specific uncertainty while logsumexp applies uniform smoothing via temperature. The choice among ME, DE, and WE depends on computational constraints and problem characteristics. When variance estimates are available and action spaces are small, WE offers a principled approach that balances the extremes of overestimation and underestimation. When maintaining variance is expensive or action spaces are large, double Q-learning provides a simpler alternative that eliminates evaluation bias without explicit probability weighting.

<a id="summary-and-forward-look"></a>

## Summary and Forward Look

This chapter developed the simulation-based approach to approximate dynamic programming by replacing analytical integration with Monte Carlo sampling. We showed how deterministic quadrature rules give way to randomized estimation when transition densities are expensive to evaluate or the state space is high-dimensional. We need only the ability to **sample** from transition distributions, not to compute their densities explicitly.

Three foundational components emerged:

1.  **Monte Carlo Bellman operator**: Replace exact expectations $\int v(s')p(ds'|s,a)$ with sample averages $\frac{1}{N}\sum v(s'_i)$, typically with $N=1$ in practice
    
2.  **Q-functions**: Cache state-action values to amortize the cost of action selection, eliminating the need for repeated sampling at decision time
    
3.  **Bias mitigation**: Address the systematic overestimation that arises from maximizing over noisy estimates through four approaches: learning empirical corrections (Keane-Wolpin), analytical adjustment from extreme value theory (Lee-Powell), decoupling selection from evaluation (double Q-learning), and probability-weighted aggregation (weighted estimators)
    

The algorithms presented here still assume that repeated samples can be drawn from each state-action pair and that optimization budgets are unconstrained. What changes when each stored transition contains one realized successor and a function approximator must be fitted from a finite buffer? [Fitted Q-iteration and DQN](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md) make those data and optimization choices explicit.

<a id="self-checks"></a>

## Self-checks

<a id="ex-montecarlo-check-1"></a>

[Exercise 1](#ex-montecarlo-check-1 "Link to this Exercise") (Sample-mean rate)

If independent samples have standard deviation $\sigma$, what is the standard deviation of their sample mean based on $N$ samples?

Solution to [Exercise 1](#ex-montecarlo-check-1)

$\sigma/\sqrt{N}$. Reducing it by a factor of two therefore requires four times as many samples.

<a id="ex-montecarlo-check-2"></a>

[Exercise 2](#ex-montecarlo-check-2 "Link to this Exercise") (Sign before simulation)

Several actions have equal true values and independent noisy estimates. What sign do you expect for the bias of their maximum?

Solution to [Exercise 2](#ex-montecarlo-check-2)

Positive. Maximization preferentially selects estimates with favorable noise, so the expected maximum exceeds the common true value.

<a id="ex-montecarlo-check-3"></a>

[Exercise 3](#ex-montecarlo-check-3 "Link to this Exercise") (Double estimation)

Which dependence is broken when one estimate selects the maximizing action and an independent estimate evaluates it?

Solution to [Exercise 3](#ex-montecarlo-check-3)

The evaluation noise is made independent of the lucky noise that caused selection. This removes the reuse of the same positive error for both selection and evaluation.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Keane1994"></a>
2.  Keane, M. P., & Wolpin, K. I. (1994). The Solution and Estimation of Discrete Choice Dynamic Programming Models by Simulation and Interpolation: Monte Carlo Evidence. _The Review of Economics and Statistics_, _76_(4), 648. [10.2307/2109768](https://doi.org/10.2307/2109768)
<a id="cite-lee2013bias"></a>
4.  Lee, D., Defourny, B., & Powell, W. B. (2013). Bias-corrected Q-learning to control max-operator bias in Q-learning. _2013 IEEE Symposium on Adaptive Dynamic Programming and Reinforcement Learning (ADPRL)_, 93–99. [10.1109/adprl.2013.6614994](https://doi.org/10.1109/adprl.2013.6614994)
<a id="cite-lee2019biascorrected"></a>
6.  Lee, D., & Powell, W. B. (2019). Bias-Corrected Q-Learning With Multistate Extension. _IEEE Transactions on Automatic Control_, _64_(10), 4011–4023. [10.1109/tac.2019.2912443](https://doi.org/10.1109/tac.2019.2912443)
<a id="cite-van2016deep"></a>
8.  Van Hasselt, H., Guez, A., & Silver, D. (2016). Deep Reinforcement Learning with Double Q-learning. _Proceedings of the AAAI Conference on Artificial Intelligence_, _30_(1).
<a id="cite-deramo2016estimating"></a>
10.  D’Eramo, C., Nuara, A., Restelli, M., & Nowe, A. (2016). Estimating the Maximum Expected Value through Gaussian Approximation. _Proceedings of the 33rd International Conference on Machine Learning_, _48_, 1032–1040.

[

Approximate Value Methods

Approximate Bellman Equations


](21-approximate-bellman-equations.md)[

Approximate Value Methods

Fitted Q-Iteration and DQN


](23-fitted-q-iteration.md)


---

# CHAPITRE 23 — Fitted Q-Iteration and DQN

Section du livre : Approximate Value Methods

Page originale : https://pierrelucbacon.com/rlbook/fitted-q-iteration

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md

> **Cours de Pierre-Luc Bacon — 23.** [Page publiée](https://pierrelucbacon.com/rlbook/fitted-q-iteration) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/23-fitted-q-iteration.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Fitted Q-Iteration and DQN

<a id="skip-to-article"></a>

The [previous chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md) established the theoretical foundations of simulation-based approximate dynamic programming: Monte Carlo integration for evaluating expectations, Q-functions for efficient action selection, and techniques for mitigating overestimation bias. Those developments assumed we could sample freely from transition distributions and choose optimization parameters without constraint. This chapter develops a unified framework for fitted Q-iteration algorithms that spans both offline and online settings. We begin with batch algorithms that learn from fixed datasets, then show how the same template generates online methods like DQN through systematic variations in data collection, optimization strategy, and function approximation.

How do the buffer, Bellman target, function approximator, and optimization budget combine when only one observed successor is available for each stored transition?

<a id="design-choices-in-fqi-methods"></a>

## Design Choices in FQI Methods

Which algorithmic variants arise from changing the buffer, target operator, approximator, initialization, and number of fitting steps?

All FQI methods share the same two-level structure built on three core ingredients: a buffer $\mathcal{B}_t$ of transitions inducing an empirical distribution $\hat{P}_{\mathcal{B}_t}$, a target function $g$ that computes regression targets from the current Q-function, and an optimization procedure to fit the Q-function to the resulting targets. At iteration $n$, the outer loop constructs targets from individual transitions using the target function: for each transition $(s_i, a_i, r_i, s'_i)$, we compute $y_i^{(n)} = g(s_i, a_i, r_i, s'_i; \boldsymbol{\theta}_n)$ where typically $g(s,a,r,s'; \boldsymbol{\theta}) = r + \gamma \max_{a'} q(s',a'; \boldsymbol{\theta})$. The inner loop solves the regression problem $\min_{\boldsymbol{\theta}} \mathbb{E}_{((s,a),y) \sim \hat{P}_n^{\text{fit}}}[\ell(q(s, a; \boldsymbol{\theta}), y)]$ to find parameters that match these targets. We can write this abstractly as:

<a id="IMIcE96XSY"></a>

$$
\begin{aligned}
&\textbf{repeat } n = 0, 1, 2, \ldots \\
&\quad \text{Sample transitions from } \hat{P}_{\mathcal{B}_n} \text{ and construct targets via } g(\cdot; \boldsymbol{\theta}_n) \\
&\quad \boldsymbol{\theta}^{(n+1)} \leftarrow \texttt{fit}(\hat{P}_n^{\text{fit}}, \boldsymbol{\theta}_{\text{init}}, K) \\
&\textbf{until } \text{convergence}
\end{aligned}
$$

[(1)](#IMIcE96XSY "Link to this Equation")

The `fit` operation minimizes the regression loss using $K$ optimization steps (gradient descent for neural networks, tree construction for ensembles, matrix inversion for linear models) starting from initialization $\boldsymbol{\theta}_{\text{init}}$. Standard supervised learning uses random initialization ($\boldsymbol{\theta}_{\text{init}} = \boldsymbol{\theta}_0$) and runs to convergence ($K = \infty$). Reinforcement learning algorithms vary these choices: warm starting from the previous iteration ($\boldsymbol{\theta}_{\text{init}} = \boldsymbol{\theta}^{(n)}$), partial optimization ($K \in \{10, \ldots, 100\}$), or single-step updates ($K=1$).

The buffer $\mathcal{B}_t$ may stay fixed (batch setting) or change (online setting), but the targets always change because they depend on the evolving target function $g(\cdot; \boldsymbol{\theta}_n)$. In practice, we typically have one observed next state per transition, giving $g(s_i, a_i, r_i, s'_i; \boldsymbol{\theta}) = r_i + \gamma \max_{a'} q(s'_i, a'; \boldsymbol{\theta})$ for transition tuples $(s_i, a_i, r_i, s'_i)$.

Remark 1 (Notation: Buffer vs Regression Distribution)

We maintain a careful distinction between two empirical distributions throughout:

-   **Buffer distribution** $\hat{P}_{\mathcal{B}_t}$ over transitions $\tau = (s, a, r, s')$: The empirical distribution induced by the replay buffer $\mathcal{B}_t$, which contains raw experience tuples. This is fixed (offline) or evolves via online collection (adding new transitions, dropping old ones).
    
-   **Regression distribution** $\hat{P}_t^{\text{fit}}$ over pairs $((s,a), y)$: The empirical distribution over supervised learning targets. This changes every outer iteration $n$ as we recompute targets using the current target function $g(\cdot; \boldsymbol{\theta}_n)$.
    

The relationship: at iteration $n$, we construct $\hat{P}_n^{\text{fit}}$ from $\hat{P}_{\mathcal{B}_n}$ by applying the target function:

<a id="JVYnQlFZD4"></a>

$$
\hat{P}_n^{\text{fit}} = (\mathrm{id}, g(\cdot; \boldsymbol{\theta}_n))_\# \hat{P}_{\mathcal{B}_n}
$$

[(2)](#JVYnQlFZD4 "Link to this Equation")

where $g(s,a,r,s'; \boldsymbol{\theta}_n) = r + \gamma \max_{a'} q(s', a'; \boldsymbol{\theta}_n)$ or uses the smooth logsumexp operator.

This distinction matters pedagogically: the **buffer distribution** $\hat{P}_{\mathcal{B}_t}$ is fixed (offline) or evolves via online collection, while the **regression distribution** $\hat{P}_t^{\text{fit}}$ evolves via target recomputation. Fitted Q-iteration is the outer loop over target recomputation, not the inner loop over gradient steps.

This template provides a blueprint for instantiating concrete algorithms. Six design axes generate algorithmic diversity: the function approximator (trees, neural networks, linear models), the Bellman operator (hard max vs smooth logsumexp, discussed in the [regularized MDP chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md)), the inner optimization strategy (full convergence, $K$ steps, or single step), the initialization scheme (cold vs warm start), the data collection mechanism (offline, online, replay buffer), and bias mitigation approaches (none, double Q-learning, learned correction). While individual algorithms include additional refinements, these axes capture the primary sources of variation. The table below shows how several well-known methods instantiate this template:

| **Algorithm** | **Approximator** | **Bellman** | **Inner Loop** | **Initialization** | **Data** | **Bias Fix** |
| --- | --- | --- | --- | --- | --- | --- |
| FQI Ernst _et al._ (2005) | Extra Trees | Hard | Full | Cold | Offline | None |
| NFQI Riedmiller (2005) | Neural Net | Hard | Full | Warm | Offline | None |
| Q-learning Watkins (1989) | Any | Hard | K=1 | Warm | Online | None |
| DQN Mnih _et al._ (2013) | Deep NN | Hard | K=1 | Warm | Replay | None |
| Double DQN Van Hasselt _et al._ (2016) | Deep NN | Hard | K=1 | Warm | Replay | Double Q |
| Soft Q Haarnoja _et al._ (2017) | Neural Net | Smooth | K steps | Warm | Replay | None |

This table omits continuous action methods (NFQCA, DDPG, SAC), which introduce an additional design dimension. We address those in the [continuous action chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md). The initialization choice becomes particularly important when moving from batch to online algorithms.

<a id="plug-in-approximation-with-empirical-distributions"></a>

### Plug-In Approximation with Empirical Distributions

The exact Bellman operator involves expectations under the true transition law (combined with the behavior policy), which we denote abstractly by $P$ over transitions $\tau = (s,a,r,s')$:

<a id="H5pzJJJRHS"></a>

$$
(\mathsf{L} q)(s,a) = r(s,a) + \gamma \int \max_{a'} q(s',a')\, P(ds' \mid s,a)
$$

[(3)](#H5pzJJJRHS "Link to this Equation")

In fitted Q-iteration we never see $P$ directly. Instead, we collect a finite set of transitions in a buffer $\mathcal{B}_t = \{\tau_1,\dots,\tau_{|\mathcal{B}_t|}\}$ and work with the **empirical distribution**

<a id="PvMMaPtNRw"></a>

$$
\hat{P}_{\mathcal{B}_t} = \frac{1}{|\mathcal{B}_t|} \sum_{\tau \in \mathcal{B}_t} \delta_\tau
$$

[(4)](#PvMMaPtNRw "Link to this Equation")

where $\delta_\tau$ denotes a Dirac delta (point mass) centered at transition $\tau$. Each $\delta_\tau$ is a probability distribution that places mass 1 at the single point $\tau$ and mass 0 everywhere else. The sum creates a mixture distribution: a uniform distribution over the finite set of observed transitions. Sampling from $\hat{P}_{\mathcal{B}_t}$ means picking one transition uniformly at random from the buffer.

For any integrand $g(\tau)$ (loss, TD error, gradient term), expectations under $P$ are approximated by expectations under $\hat{P}_{\mathcal{B}_t}$ using the **sample average estimator**:

<a id="K2XTyM6F10"></a>

$$
\mathbb{E}_{\tau \sim P}\big[g(\tau)\big] \;\approx\; \mathbb{E}_{\tau \sim \hat{P}_{\mathcal{B}_t}}\big[g(\tau)\big] = \frac{1}{|\mathcal{B}_t|} \sum_{\tau \in \mathcal{B}_t} g(\tau)
$$

[(5)](#K2XTyM6F10 "Link to this Equation")

This is exactly the sample average estimator from the Monte Carlo chapter, applied now to transitions. Conceptually, fitted Q-iteration performs **plug-in approximate dynamic programming**. The plug-in principle is a general approach from statistics: when an algorithm requires an unknown population quantity, substitute its sample-based estimator. Here, we replace the unknown transition law $P$ with the empirical distribution $\hat{P}_{\mathcal{B}_t}$ and run value iteration using this empirical Bellman operator:

<a id="xYZiRrnpbM"></a>

$$
(\widehat{\mathsf{L}}_{\mathcal{B}_t} q)(s,a) \triangleq r(s,a) + \gamma\; \mathbb{E}_{(r',s') \mid (s,a)\sim \hat{P}_{\mathcal{B}_t}} \Big[\max_{a'} q(s',a')\Big]
$$

[(6)](#xYZiRrnpbM "Link to this Equation")

From a computational viewpoint, we could describe all of this using sample averages and mini-batch gradients. The empirical distribution notation provides three benefits. First, it unifies offline and online algorithms: both perform value iteration under an empirical law $\hat{P}_{\mathcal{B}_t}$, differing only in whether $\mathcal{B}_t$ remains fixed or evolves. Second, it shows that methods like DQN perform stochastic optimization of a sample average approximation objective $\mathbb{E}_{\tau \sim \hat{P}_{\mathcal{B}_t}}[\ell(\cdot)]$, not some ad hoc non-stationary procedure. Third, it cleanly separates two sources of approximation that we will examine shortly: statistical bootstrap (resampling from $\hat{P}_{\mathcal{B}_t}$) versus temporal-difference bootstrap (using estimated values in targets).

Remark 2 (Mathematical Formulation of Empirical Distributions)

The empirical distribution $\hat{P}_{\mathcal{B}_t} = \frac{1}{|\mathcal{B}_t|}\sum_{\tau \in \mathcal{B}_t} \delta_{\tau}$ is a discrete probability measure over $|\mathcal{B}_t|$ points regardless of whether state and action spaces are continuous or discrete. For any measurable set $A \subseteq \mathcal{S} \times \mathcal{A} \times \mathbb{R} \times \mathcal{S}$:

<a id="xSpMjA3hy9"></a>

$$
\hat{P}_{\mathcal{B}_t}(A) = \frac{1}{|\mathcal{B}_t|}\sum_{\tau \in \mathcal{B}_t} \mathbb{1}[\tau \in A] = \frac{|\{\tau \in \mathcal{B}_t : \tau \in A\}|}{|\mathcal{B}_t|}
$$

[(7)](#xSpMjA3hy9 "Link to this Equation")

The empirical distribution assigns probability $1/|\mathcal{B}_t|$ to each observed tuple and zero elsewhere.

<a id="data-buffers-and-the-unified-template"></a>

### Data, Buffers, and the Unified Template

Fitted Q-iteration is built around three ingredients at any time $t$:

1.  A **replay buffer** $\mathcal{B}_t$ containing transitions, inducing an empirical distribution $\hat{P}_{\mathcal{B}_t}$
    
2.  A **target function** $g(s,a,r,s'; \boldsymbol{\theta}) : \mathcal{S} \times \mathcal{A} \times \mathbb{R} \times \mathcal{S} \times \Theta \mapsto \mathbb{R}$ that computes regression targets for individual transitions. Unlike the Bellman operator $\mathcal{T}$ which acts on function spaces, $g$ operates on transition tuples with parameters $\boldsymbol{\theta}$ (after the semicolon) specifying the current Q-function. Typically $g(s,a,r,s'; \boldsymbol{\theta}) = r + \gamma \max_{a'} q(s',a'; \boldsymbol{\theta})$ (hard max) or uses the smooth logsumexp operator.
    
3.  A **loss function** $\ell$ and **optimization budget** (replay ratio, number of gradient steps)
    

Pushing transitions through the target function transforms $\hat{P}_{\mathcal{B}_t}$ into a regression distribution $\hat{P}_t^{\text{fit}}$ over pairs $((s,a), y)$, as described in the notation remark above. The inner loop minimizes the empirical risk $\mathbb{E}_{((s,a),y)\sim \hat{P}_t^{\text{fit}}} [\ell(q(s,a;\boldsymbol{\theta}), y)]$ via stochastic gradient descent on mini-batches.

Different algorithms correspond to different ways of evolving the buffer $\mathcal{B}_t$ and different replay ratios:

-   **Offline FQI.** We start from a fixed dataset $\mathcal{D}$ and never collect new data. The buffer is constant, $\mathcal{B}_t \equiv \mathcal{D}$ and $\hat{P}_{\mathcal{B}_t} \equiv \hat{P}_{\mathcal{D}}$, and only the target function $g(\cdot; \boldsymbol{\theta}_t)$ changes as the Q-function evolves.
    
-   **Replay (DQN-style).** The buffer is a **circular buffer** of fixed capacity $B$. At each interaction step we append the new transition and, if the buffer is full, drop the oldest one: $\mathcal{B}_t = \{\tau_{t-B+1},\ldots,\tau_t\}$ and $\hat{P}_{\mathcal{B}_t} = \frac{1}{|\mathcal{B}_t|} \sum_{\tau \in \mathcal{B}_t} \delta_{\tau}$. The empirical distribution slides forward through time, but at each update we still sample uniformly from the current buffer.
    
-   **Fully online Q-learning.** Tabular Q-learning is the degenerate case with buffer size $B=1$: we only keep the most recent transition. Then $\hat{P}_{\mathcal{B}_t}$ is supported on a single point and each update uses that one sample once.
    

The **replay ratio** (optimization steps per environment transition) quantifies data reuse:

<a id="OsmyCXvXzh"></a>

$$
\text{Replay ratio} = \begin{cases}
K \cdot N_{\text{epochs}} \cdot N / b & \text{Offline (batch size } b \text{ from } N \text{ transitions)} \\
b & \text{DQN (one step per transition, batch size } b \text{)} \\
1 & \text{Online Q-learning}
\end{cases}
$$

[(8)](#OsmyCXvXzh "Link to this Equation")

where $K$ is the number of gradient steps per outer iteration. Large replay ratios reuse the same empirical distribution $\hat{P}_{\mathcal{B}_t}$ many times, implementing sample average approximation (offline FQI). Small replay ratios use each sample once, implementing stochastic approximation (online Q-learning). Higher replay ratios reduce variance of estimates under $\hat{P}_{\mathcal{B}_t}$ but risk overfitting to the idiosyncrasies of the current empirical law, especially when it reflects outdated policies or narrow coverage.

Remark 3 (Two Notions of Bootstrap)

This perspective separates two different “bootstraps” that appear in FQI:

1.  **Statistical bootstrap over data.** By sampling with replacement from $\hat{P}_{\mathcal{B}_t}$, we approximate expectations under the (unknown) transition distribution $P$ with expectations under the empirical distribution $\hat{P}_{\mathcal{B}_t}$. This is identical to bootstrap resampling in statistics. Mini-batch training is exactly this: we treat the observed transitions as if they were the entire population and approximate expectations by repeatedly resampling from the empirical law. The replay ratio controls how many such bootstrap samples we take per environment interaction.
    
2.  **Temporal-difference bootstrap over values.** When we compute $y = r + \gamma \max_{a'} q(s',a';\boldsymbol{\theta})$, we replace the unknown continuation value by our current estimate. This is the TD notion of bootstrapping and the source of maximization bias studied in the previous chapter.
    

FQI, DQN, and their variants combine both: the empirical distribution $\hat{P}_{\mathcal{B}_t}$ encodes how we reuse data (statistical bootstrap), and the target function $g$ encodes how we bootstrap values (TD bootstrap). Most bias-correction techniques (Keane–Wolpin, Double Q-learning, Gumbel losses) modify the second kind of bootstrapping while leaving the statistical bootstrap unchanged.

Every algorithm in this chapter minimizes an empirical risk of the form $\mathbb{E}_{((s,a),y)\sim \hat{P}_t^{\text{fit}}} [\ell(q(s,a;\boldsymbol{\theta}), y)]$, where expectations are computed via the sample average estimator over the buffer. Algorithmic diversity arises from choices of buffer evolution, target function, loss, and optimization schedule.

<a id="batch-algorithms-ernsts-fqi-and-nfqi"></a>

## Batch Algorithms: Ernst’s FQI and NFQI

How does fitted Q iteration operate when the transition dataset is fixed before learning begins?

We begin with the simplest case from the buffer perspective. We are given a fixed transition dataset $\mathcal{D} = \{(s_i,a_i,r_i,s'_i)\}_{i=1}^N$ and never collect new data. The replay buffer is frozen:

<a id="ONFU5e04TF"></a>

$$
\mathcal{B}_t \equiv \mathcal{D}, \qquad \hat{P}_{\mathcal{B}_t} \equiv \hat{P}_{\mathcal{D}}
$$

[(9)](#ONFU5e04TF "Link to this Equation")

so the only thing that changes across iterations is the target function $g(\cdot; \boldsymbol{\theta}_n)$ induced by the current Q-function. Every outer iteration of FQI samples from the same empirical distribution $\hat{P}_{\mathcal{D}}$ but pushes it through a new target function, producing a new regression distribution $\hat{P}_n^{\text{fit}}$.

At each outer iteration $n$, we construct the input set $X^{(n)} = \{(s_i, a_i)\}_{i=1}^N$ from the same transitions (the state-action pairs remain fixed), compute targets $y_i^{(n)} = g(s_i, a_i, r_i, s'_i; \boldsymbol{\theta}^{(n)}) = r_i + \gamma \max_{a'} q(s'_i, a'; \boldsymbol{\theta}^{(n)})$ using the current Q-function, and solve the regression problem $\boldsymbol{\theta}^{(n+1)} \leftarrow \texttt{fit}(X^{(n)}, y^{(n)}, \boldsymbol{\theta}_{\text{init}}, K)$. The buffer $\mathcal{B}_t = \mathcal{D}$ never changes, but the targets change at every iteration because they depend on the evolving target function $g(\cdot; \boldsymbol{\theta}_n)$. Each transition $(s_i, a_i, r_i, s'_i)$ provides a single Monte Carlo sample $s'_i$ for evaluating the Bellman operator at $(s_i, a_i)$, giving us $\widehat{\mathsf{L}}_1 q$ with $N=1$.

The following algorithm is simply approximate value iteration where expectations under the transition kernel $P$ are replaced by expectations under the fixed empirical distribution $\hat{P}_{\mathcal{D}}$:

<a id="fitted-q-iteration-batch"></a>

[Algorithm 1](#fitted-q-iteration-batch "Link to this Algorithm") (Generic Fitted Q-Iteration (Batch))

**Input:** Dataset $\mathcal{D} = \{(s_i, a_i, r_i, s'_i)\}_{i=1}^N$, function approximator $q(s,a; \boldsymbol{\theta})$, discount factor $\gamma$, maximum iterations $n_{\max}$

**Output:** Learned Q-function parameters $\boldsymbol{\theta}$

1.  Initialize $\boldsymbol{\theta}_0$
    
2.  $n \leftarrow 0$
    
3.  **repeat** $\quad$ // **Outer loop: Value Iteration**
    
4.  $\quad$ **// Construct regression dataset with Bellman targets**
    
5.  $\quad$ $X^{(n)} \leftarrow \{(s_i, a_i) : (s_i, a_i, r_i, s'_i) \in \mathcal{D}\}$
    
6.  $\quad$ **for** each $(s_i, a_i, r_i, s'_i) \in \mathcal{D}$ **do**
    
7.  $\quad\quad$ $y_i^{(n)} \leftarrow r_i + \gamma \max_{a' \in \mathcal{A}} q(s'_i, a'; \boldsymbol{\theta}_n)$
    
8.  $\quad$ **end for**
    
9.  $\quad$ **// Inner loop: Fit Q-function to targets (projection step)**
    
10.  $\quad$ $\boldsymbol{\theta}_{n+1} \leftarrow \texttt{fit}(X^{(n)}, y^{(n)}, \boldsymbol{\theta}_{\text{init}}, K)$
     
11.  $\quad$ $n \leftarrow n+1$
     
12.  **until** convergence or $n \geq n_{\max}$
     
13.  **return** $\boldsymbol{\theta}_n$
     

The `fit` operation in line 10 abstracts the inner optimization loop that minimizes $\sum_{i=1}^N \ell(q(s_i, a_i; \boldsymbol{\theta}), y_i^{(n)})$. This line encodes the algorithmic choice of which function approximator to use and how to optimize it. The initialization $\boldsymbol{\theta}_{\text{init}}$ and number of optimization steps $K$ control whether we use cold or warm starting and whether we optimize to convergence or perform partial updates.

**Fitted Q-Iteration (FQI)**: Ernst et al. Ernst _et al._ (2005) instantiate this template with extremely randomized trees (extra trees), an ensemble method that partitions the state-action space into regions with piecewise constant Q-values. The `fit` operation trains the ensemble until completion using the tree construction algorithm. Trees handle high-dimensional inputs naturally and the ensemble reduces overfitting. FQI uses cold start initialization: $\boldsymbol{\theta}_{\text{init}} = \boldsymbol{\theta}_0$ (randomly initialized) at every iteration, since trees don’t naturally support incremental refinement. The loss $\ell$ is squared error. This method demonstrated that batch reinforcement learning could work with complex function approximators on continuous-state problems.

**Neural Fitted Q-Iteration (NFQI)**: Riedmiller Riedmiller (2005) replaces the tree ensemble with a neural network $q(s,a; \boldsymbol{\theta})$, providing smooth interpolation across the state-action space. The `fit` operation runs gradient-based optimization (RProp, chosen for its insensitivity to hyperparameter choices) to convergence: train the network until the loss stops decreasing (multiple epochs through the full dataset $\mathcal{D}$), corresponding to $K=\infty$ in our framework. NFQI uses warm start initialization: $\boldsymbol{\theta}_{\text{init}} = \boldsymbol{\theta}_n$ at iteration $n$, meaning the network continues learning from the previous iteration’s weights rather than resetting. This ensures the network accurately represents the projected Bellman operator before moving to the next outer iteration. For episodic tasks with goal and forbidden regions, Riedmiller uses modified target computations (detailed below).

Remark 4 (Goal State Heuristics in NFQI)

For episodic tasks with goal states $S^+$ and forbidden states $S^-$, Riedmiller modifies the target structure:

<a id="GQBdIZsJ0V"></a>

$$
y_i^{(n)} = \begin{cases}
c(s_i, a_i, s'_i) & \text{if } s'_i \in S^+ \text{ (goal reached)} \\
C^- & \text{if } s'_i \in S^- \text{ (forbidden state, typically } C^- = 1.0\text{)} \\
c(s_i, a_i, s'_i) + \gamma \max_{a'} q(s'_i, a'; \boldsymbol{\theta}_n) & \text{otherwise}
\end{cases}
$$

[(10)](#GQBdIZsJ0V "Link to this Equation")

where $c(s, a, s')$ is the immediate cost. Goal states have zero future cost (no bootstrapping), forbidden states have high penalty, and regular states use the standard Bellman backup. Additionally, the **hint-to-goal heuristic** adds synthetic transitions $(s, a, s')$ where $s \in S^+$ with target value $c(s,a,s') = 0$ to explicitly clamp the Q-function to zero in the goal region. This stabilizes learning by encoding the boundary condition without requiring additional prior knowledge.

<a id="experiment-scheduling-from-fixed-transition-data"></a>

### Experiment: Scheduling from Fixed Transition Data

The reduced inference-scheduling MDP in [Infinite-Horizon MDPs](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/18-infinite-horizon-mdps.md#exact-scheduling-mdp-for-inference-serving) has an exact value-iteration solution because its transition matrix is known. Suppose instead that only a fixed table of transitions is retained. Each row contains a reduced state $(p,d,a)$, a scheduling action, the cost $c$, and the next reduced state. The generic reward-maximizing form above becomes a cost-minimizing form after a sign change. FQI can reuse those rows, but it receives no direct evidence for a state-action region that the behavior policy never visits. Any prediction there comes from the regressor’s inductive bias.

Each transition row is sampled from the finite MDP, not logged directly from vLLM. Its arrival model comes from the normalized Azure trace, while its phase rates and powers come from one NVIDIA L4 measurement run of Qwen/Qwen2.5-7B-Instruct served by vLLM 0.28.0. The data sets therefore inherit a measured hardware calibration and all of the reduced model’s aggregation assumptions.

Two sampling procedures produce matched data sets of 50,000 transitions. The **broad** data set draws a reduced state uniformly and then draws uniformly among its feasible actions. The **narrow** data set follows trajectories from the empty system under a decode-priority heuristic and selects a random feasible action with probability 0.05. Both use seed 0 and the same MDP. Their different state-action sampling distributions are the controlled change.

Each fitted-Q sweep constructs targets

<a id="fg8cFa1jNK"></a>

$$
y_i^{(n)}=c_i+0.99\min_{u'\in\mathcal A(s_i')}
q_n(s_i',u')
$$

[(11)](#fg8cFa1jNK "Link to this Equation")

and fits a joint state-action Extra-Trees regressor. The ensemble contains 200 trees with maximum depth 12 and minimum leaf size 2. The random seed is 0; successive tree fits use the deterministic seeds 0 through 49 across 50 fitted-Q sweeps. The three scheduling actions enter as a one-hot input, matching the joint state-action representation in the generic batch algorithm above.

Changing only the sampling distribution tests how coverage affects an otherwise identical FQI procedure. The exact dynamic-programming policy and both fitted policies are evaluated on the same 2,000 seeded episodes, each 300 steps long. Return and policy disagreement measure agreement with the reduced MDP objective and its exact solution. Mean waiting time, decode stalls, dropped arrivals, and observed state-action coverage locate operational differences.

<a id="cTqgmVC1dE"></a>

<a id="fig-inference-scheduling-fqi"></a>

<a id="fig-inference-scheduling-fqi-code"></a>

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
    view="fqi",
)))
```

[Figure 1:](#fig-inference-scheduling-fqi "Link to this figure")Extra-Trees FQI on two fixed 50,000-transition data sets sampled from the same measured-L4-calibrated scheduling MDP. These are model transitions, not vLLM logs. The broad data set samples states and feasible actions uniformly; the narrow data set follows decode priority with 5 percent random actions. Policy slices compare each fitted policy with the exact value-iteration policy and mark whether the displayed action occurs in its training buffer.

<a id="fig-inference-scheduling-fqi-outputs"></a>

Loading...

<a id="fig-inference-scheduling-fqi-fallback"></a>

<a id="P98fMYJiGh"></a>
![Static comparison of exact value iteration with fitted Q policies learned from broad and narrow transition data.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/afe82a045c-fqi-31fc97b2b6d0bde31db46aecdbc22e10.svg)

[Figure 2:](#fig-inference-scheduling-fqi-fallback "Link to this figure")Static policy slices for oldest-age bin four. At each displayed state, a white circle marks that the buffer contains visits to the action selected by the displayed policy. The interactive version adds age selection, playback, stepping, and scrubbing through a queue trajectory sampled from the reduced transition model rather than observed directly from vLLM.

Exact dynamic programming and the two fitted-Q policies use the same 2,000 seeded episodes of 300 steps. Coverage is computed from the feasible state-action pairs present in each fixed transition buffer.

<a id="zgnuUmQHs6"></a>

```python
import pandas as pd

fqi_metrics = pd.read_csv(
    "artifacts/inference_serving/metrics_fqi.csv"
).set_index("controller")
fqi_metrics[
    [
        "mean_discounted_return",
        "mean_queue_length",
        "mean_waiting_time_s",
        "mean_decode_stalls",
        "mean_dropped_arrivals",
        "coverage_fraction",
        "policy_disagreement_fraction",
    ]
].T.rename_axis("metric").round(3)
```

Loading...

[Download every fitted-Q metric (CSV)](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/7e62ae3b3e-metrics_fqi-05eea8b33b5a05af09576768f08f3a43.csv)

The broad buffer covers every feasible state-action pair, yet its fitted policy disagrees with the exact policy on 13.88 percent of states. Its mean discounted return is \-375.20, compared with \-317.34 for the exact policy. Mean waiting time rises from 3.023 to 3.751 seconds.

The narrow buffer covers 13.86 percent of feasible pairs and disagrees with the exact policy on 68.16 percent of states. Its mean discounted return is \-1096.71, and its mean waiting time is 21.200 seconds. Return is the negative of discounted cost, so higher values are better.

The exact policy incurs no decode stalls in these finite evaluations. Broad FQI averages 79.30 stalls per episode, while narrow FQI averages 216.81. Broad FQI has a lower mean expected dropped-arrival count than the exact policy, 0.452 versus 0.555, because the discounted stage cost also penalizes queue length, age, decode stalls, and energy. The narrow policy’s mean expected count is 2.781.

The two data sets have equal size, so the difference between their policies cannot be attributed to the number of transition rows. Coverage, finite-sample noise, and the piecewise-constant Extra-Trees approximation can all contribute. Full coverage is not sufficient to recover the exact policy with finite data and this regressor, while the narrow buffer leaves most Bellman targets unsupported.

The hardware calibration is measured, while training and evaluation remain inside the stated 245-state MDP. These results concern offline coverage under that abstraction. They are not a benchmark of vLLM scheduling or of NVIDIA L4 hardware across deployments.

Inspect the fitted-Q experiment

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
```

[Download the complete inference-control implementation](https://pierrelucbacon.com/rlbook/build/inference_control-4281ed415b62adfe193289f0e3dfbe27.py)

<a id="from-nested-to-flattened-q-iteration"></a>

## From Nested to Flattened Q-Iteration

Can the outer Bellman loop and inner regression loop be interleaved without losing track of which parameters generate and fit each target?

Fitted Q-iteration has an inherently nested structure: an outer loop performs approximate value iteration by computing Bellman targets, and an inner loop performs regression by fitting the function approximator to those targets. This nested structure shows that FQI is approximate dynamic programming with function approximation, distinct from supervised learning with changing targets.

When the inner loop uses gradient descent for $K$ steps, we have:

<a id="YRmpsGvmkw"></a>

$$
\texttt{fit}(\mathcal{D}_n^{\text{fit}}, \boldsymbol{\theta}_n, K) = \boldsymbol{\theta}_n - \alpha \sum_{k=0}^{K-1} \nabla_{\boldsymbol{\theta}} \mathcal{L}(\boldsymbol{\theta}_n^{(k)}; \mathcal{D}_n^{\text{fit}})
$$

[(12)](#YRmpsGvmkw "Link to this Equation")

This is a sequence of updates $\boldsymbol{\theta}_n^{(k+1)} = \boldsymbol{\theta}_n^{(k)} - \alpha \nabla_{\boldsymbol{\theta}} \mathcal{L}(\boldsymbol{\theta}_n^{(k)}; \mathcal{D}_n^{\text{fit}})$ for $k = 0, \ldots, K-1$ starting from $\boldsymbol{\theta}_n^{(0)} = \boldsymbol{\theta}_n$. Since these inner updates are themselves a loop, we can algebraically rewrite the nested loops as a single flattened loop. This flattening is purely representational. The algorithm remains approximate value iteration, but the presentation obscures the conceptual structure.

In the flattened form, the parameters used for computing targets are called the **target network** $\boldsymbol{\theta}_{\text{target}}$, which corresponds to $\boldsymbol{\theta}_n$ in the nested form. The target network gets updated every $K$ steps, marking the boundaries between outer iterations.

In contrast, the parameters being actively trained via gradient descent at each step are called the **online network** $\boldsymbol{\theta}_t$. In the nested view, these correspond to $\boldsymbol{\theta}_n^{(k)}$ within the inner loop. The term “online” here refers to the fact that these parameters are continuously updated at each gradient step, not that data must be collected online. The distinction is between the actively-training parameters ($\boldsymbol{\theta}_t$) and the frozen parameters used for target computation ($\boldsymbol{\theta}_{\text{target}}$).

The online/target terminology is standard in the deep RL community. Many modern algorithms, especially those that collect data online like DQN, are presented in flattened form. This can make them appear different from batch methods when they are the same template with different design choices.

Tree ensemble methods like random forests or extra trees have no continuous parameter space and no gradient-based optimization. The `fit` operation builds the entire tree structure in one pass. There’s no sequence of incremental updates to unfold into a single loop. Ernst’s FQI Ernst _et al._ (2005) retains the explicit nested structure with cold start initialization at each outer iteration, while neural methods can be flattened.

<a id="making-the-nested-structure-explicit"></a>

### Making the Nested Structure Explicit

To see how flattening works, we first make the nested structure completely explicit by expanding the `fit` operation to show the inner gradient descent loop. In terms of the buffer notation, the inner loop approximately minimizes the empirical risk:

<a id="NzjdNIfux2"></a>

$$
\mathbb{E}_{((s,a),y)\sim \hat{P}_n^{\text{fit}}}[\ell(q(s,a;\boldsymbol{\theta}), y)]
$$

[(13)](#NzjdNIfux2 "Link to this Equation")

induced by the fixed buffer $\mathcal{B}_n = \mathcal{D}$ and target function $g(\cdot; \boldsymbol{\theta}_n)$. Starting from the generic batch FQI template ([Algorithm 1](#fitted-q-iteration-batch)), we replace the abstract `fit` call with explicit gradient updates:

<a id="nfqi-explicit-inner"></a>

[Algorithm 2](#nfqi-explicit-inner "Link to this Algorithm") (Neural Fitted Q-Iteration with Explicit Inner Loop)

**Input**: MDP $(S, A, P, R, \gamma)$, offline transition dataset $\mathcal{D}$, neural network $q(s,a; \boldsymbol{\theta})$, learning rate $\alpha$, inner optimization steps $K$, initialization $\boldsymbol{\theta}_0$

**Output**: Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$ randomly
    
2.  $n \leftarrow 0$ $\quad$ // **Outer loop counter (value iteration)**
    
3.  **repeat**
    
    1.  **// Compute Bellman targets using current Q-function**
        
    2.  $\mathcal{D}_n^{\text{fit}} \leftarrow \emptyset$
        
    3.  **for** each $(s,a,r,s') \in \mathcal{D}$ **do**
        
        1.  $y_{s,a} \leftarrow r + \gamma \max_{a' \in A} q(s',a'; \boldsymbol{\theta}_n)$
            
        2.  $\mathcal{D}_n^{\text{fit}} \leftarrow \mathcal{D}_n^{\text{fit}} \cup \{((s,a), y_{s,a})\}$
            
    4.  **// Inner optimization loop: fit to targets via gradient descent**
        
    5.  $\boldsymbol{\theta}_n^{(0)} \leftarrow \boldsymbol{\theta}_n$ $\quad$ // Warm start from previous outer iteration
        
    6.  $k \leftarrow 0$ $\quad$ // **Inner loop counter (regression)**
        
    7.  **repeat**
        
        1.  $\boldsymbol{\theta}_n^{(k+1)} \leftarrow \boldsymbol{\theta}_n^{(k)} - \alpha \nabla_{\boldsymbol{\theta}} \mathcal{L}(\boldsymbol{\theta}_n^{(k)}; \mathcal{D}_n^{\text{fit}})$
            
        2.  $k \leftarrow k + 1$
            
    8.  **until** $k = K$ $\quad$ // Partial optimization: exactly K gradient steps
        
    9.  $\boldsymbol{\theta}_{n+1} \leftarrow \boldsymbol{\theta}_n^{(K)}$
        
    10.  $n \leftarrow n + 1$
         
4.  **until** training complete
    
5.  **return** $\boldsymbol{\theta}_n$
    

This makes the two-level structure completely transparent. The outer loop (indexed by $n$) computes targets $y_{s,a} = r + \gamma \max_{a'} q(s',a'; \boldsymbol{\theta}_n)$ using the parameters $\boldsymbol{\theta}_n$ from the end of the previous outer iteration. These targets remain **fixed** throughout the entire inner loop. The inner loop (indexed by $k$) performs $K$ gradient steps to fit $q(s,a; \boldsymbol{\theta})$ to the regression dataset $\mathcal{D}_n^{\text{fit}} = \{((s_i, a_i), y_i)\}$, warm starting from $\boldsymbol{\theta}_n$ (the parameters that computed the targets). After $K$ steps, the inner loop produces $\boldsymbol{\theta}_{n+1} = \boldsymbol{\theta}_n^{(K)}$, which becomes the starting point for the next outer iteration.

The notation $\boldsymbol{\theta}_n^{(k)}$ indicates that we are at inner step $k$ within outer iteration $n$. The targets depend only on $\boldsymbol{\theta}_n = \boldsymbol{\theta}_n^{(0)}$, not on the intermediate inner iterates $\boldsymbol{\theta}_n^{(k)}$ for $k > 0$.

<a id="flattening-into-a-single-loop"></a>

### Flattening into a Single Loop

We can now flatten the nested structure by treating all gradient steps uniformly and using a global step counter $t$ instead of separate outer/inner counters. We introduce a **target network** $\boldsymbol{\theta}_{\text{target}}$ that holds the parameters used for computing targets. This target network gets updated every $K$ steps, which marks what would have been the boundary between outer iterations. The transformation works as follows: we replace the outer counter $n$ and inner counter $k$ with a single counter $t$, where $t = nK + k$. When $n$ advances from $n$ to $n+1$, this corresponds to $K$ steps of $t$: from $t = nK$ to $t = (n+1)K$. The target network $\boldsymbol{\theta}_{\text{target}}$ equals $\boldsymbol{\theta}_n$ throughout outer iteration $n$ and gets updated via $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_t$ every $K$ steps (when $t \bmod K = 0$). Parameters that were $\boldsymbol{\theta}_n^{(k)}$ in nested form become $\boldsymbol{\theta}_t$ in flattened form.

This transformation is purely algebraic. No algorithmic behavior changes, only the presentation:

<a id="nfqi-flattened"></a>

[Algorithm 3](#nfqi-flattened "Link to this Algorithm") (Flattened Neural Fitted Q-Iteration)

**Input**: MDP $(S, A, P, R, \gamma)$, offline transition dataset $\mathcal{D}$, neural network $q(s,a; \boldsymbol{\theta})$, learning rate $\alpha$, target update frequency $K$, initialization $\boldsymbol{\theta}_0$

**Output**: Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$ randomly
    
2.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_0$
    
3.  $t \leftarrow 0$ $\quad$ // **Single flattened loop counter**
    
4.  **while** training **do**
    
    1.  **// Compute targets using fixed target network**
        
    2.  $\mathcal{D}_t^{\text{fit}} \leftarrow \emptyset$
        
    3.  **for** each $(s,a,r,s') \in \mathcal{D}$ **do**
        
        1.  $y_{s,a} \leftarrow r + \gamma \max_{a' \in A} q(s',a'; \boldsymbol{\theta}_{\text{target}})$
            
        2.  $\mathcal{D}_t^{\text{fit}} \leftarrow \mathcal{D}_t^{\text{fit}} \cup \{((s,a), y_{s,a})\}$
            
    4.  **// Gradient step on online network**
        
    5.  $\boldsymbol{\theta}_{t+1} \leftarrow \boldsymbol{\theta}_t - \alpha \nabla_{\boldsymbol{\theta}} \mathcal{L}(\boldsymbol{\theta}_t; \mathcal{D}_t^{\text{fit}})$
        
    6.  **// Periodic target network update (marks outer iteration boundary)**
        
    7.  **if** $t \bmod K = 0$ **then**
        
        1.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_t$
            
    8.  $t \leftarrow t + 1$
        
5.  **return** $\boldsymbol{\theta}_t$
    

At step $t$, we have $n = \lfloor t/K \rfloor$ (outer iteration) and $k = t \bmod K$ (position within inner loop). The target network $\boldsymbol{\theta}_{\text{target}}$ equals $\boldsymbol{\theta}_n$ throughout the $K$ steps from $t = nK$ to $t = (n+1)K - 1$, then gets updated to $\boldsymbol{\theta}_{n+1}$ at $t = (n+1)K$. The parameters $\boldsymbol{\theta}_t$ correspond to $\boldsymbol{\theta}_n^{(k)}$ in the nested form. The flattening reindexes the iteration structure: with $K=10$, outer iteration $n=3$, inner step $k=7$ becomes global step $t = 3 \cdot 10 + 7 = 37$.

Flattening replaces the pair $(n,k)$ by a single global step index $t$, but the underlying empirical distribution $\hat{P}_{\mathcal{D}}$ remains the same. We still sample from the fixed offline dataset throughout.

The target network arises directly from flattening the nested FQI structure. When DQN is presented with a target network that updates every $K$ steps, this is approximate value iteration in flattened form. The algorithm still performs outer loop (value iteration) and inner loop (regression), but the presentation obscures this structure. The periodic target updates mark the boundaries between outer iterations. DQN is batch approximate DP in flattened form, using online data collection with a replay buffer.

<a id="smooth-target-updates-via-exponential-moving-average"></a>

### Smooth Target Updates via Exponential Moving Average

An alternative to periodic hard updates is **exponential moving average (EMA)** (also called Polyak averaging), which updates the target network smoothly at every step rather than synchronizing it every $K$ steps:

<a id="nfqi-flattened-ema"></a>

[Algorithm 4](#nfqi-flattened-ema "Link to this Algorithm") (Flattened Neural Fitted Q-Iteration with EMA Target Updates)

**Input**: MDP $(S, A, P, R, \gamma)$, offline transition dataset $\mathcal{D}$, neural network $q(s,a; \boldsymbol{\theta})$, learning rate $\alpha$, EMA rate $\tau \in (0, 1)$, initialization $\boldsymbol{\theta}_0$

**Output**: Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$ randomly
    
2.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_0$
    
3.  $t \leftarrow 0$ $\quad$ // **Single flattened loop counter**
    
4.  **while** training **do**
    
    1.  **// Compute targets using fixed target network**
        
    2.  $\mathcal{D}_t^{\text{fit}} \leftarrow \emptyset$
        
    3.  **for** each $(s,a,r,s') \in \mathcal{D}$ **do**
        
        1.  $y_{s,a} \leftarrow r + \gamma \max_{a' \in A} q(s',a'; \boldsymbol{\theta}_{\text{target}})$
            
        2.  $\mathcal{D}_t^{\text{fit}} \leftarrow \mathcal{D}_t^{\text{fit}} \cup \{((s,a), y_{s,a})\}$
            
    4.  **// Gradient step on online network**
        
    5.  $\boldsymbol{\theta}_{t+1} \leftarrow \boldsymbol{\theta}_t - \alpha \nabla_{\boldsymbol{\theta}} \mathcal{L}(\boldsymbol{\theta}_t; \mathcal{D}_t^{\text{fit}})$
        
    6.  **// CHANGED: Smooth EMA update at every step**
        
    7.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \tau\boldsymbol{\theta}_{t+1} + (1-\tau)\boldsymbol{\theta}_{\text{target}}$
        
    8.  $t \leftarrow t + 1$
        
5.  **return** $\boldsymbol{\theta}_t$
    

With EMA updates, the target network slowly tracks the online network instead of making discrete jumps. For small $\tau$ (typically $\tau \in [0.001, 0.01]$), the target lags behind the online network by roughly $1/\tau$ steps. This provides smoother learning dynamics and avoids the discontinuous changes in targets that occur with periodic hard updates. The EMA approach became popular with DDPG Lillicrap _et al._ (2015) for continuous control and is now standard in algorithms like TD3 Fujimoto _et al._ (2018) and SAC Haarnoja _et al._ (2018).

<a id="online-algorithms-dqn-and-extensions"></a>

## Online Algorithms: DQN and Extensions

What changes when the buffer evolves during learning and a neural Q-function is updated from replayed transitions?

We now keep the same fitted Q-iteration template but allow the buffer $\mathcal{B}_t$ and its empirical distribution $\hat{P}_{\mathcal{B}_t}$ to evolve while we learn. Instead of repeatedly sampling from a fixed $\hat{P}_{\mathcal{D}}$, we collect new transitions during learning and store them in a circular replay buffer.

Note that “online” here takes on a second meaning: we collect data online (interacting with the environment) while also maintaining the online network (actively-updated parameters $\boldsymbol{\theta}_t$) and target network (frozen parameters $\boldsymbol{\theta}_{\text{target}}$) distinction from the flattened FQI structure. The online network now plays a dual role: it is both the parameters being trained and the policy used to collect new data for the buffer.

Deep Q-Network (DQN) instantiates the online template with moderate choices along the design axes: buffer capacity $B \approx 10^6$, mini-batch size $b \approx 32$, and target network update frequency $K \approx 10^4$. DQN is not an ad hoc collection of tricks. It is fitted Q-iteration in flattened form (as developed in the nested-to-flattened transformation earlier) with an evolving buffer $\mathcal{B}_t$ and low replay ratio.

<a id="deep-q-network-dqn"></a>

### Deep Q-Network (DQN)

Deep Q-Network (DQN) maintains a circular replay buffer of capacity $B$ (typically $B \approx 10^6$). At each environment step, we store the new transition and sample a mini-batch of size $b$ from the buffer for training. This increases the replay ratio, reducing gradient variance at the cost of older, potentially off-policy data.

DQN uses two copies of the Q-network parameters:

-   The **online network** $\boldsymbol{\theta}_t$: actively updated at each gradient step (corresponds to $\boldsymbol{\theta}_n^{(k)}$ in the nested view). It serves a dual role: (1) the policy for collecting new data via $\varepsilon$\-greedy action selection, and (2) the parameters being trained.
    
-   The **target network** $\boldsymbol{\theta}_{\text{target}}$: frozen parameters updated every $K$ steps (corresponds to $\boldsymbol{\theta}_n$ in the nested view). Used only for computing Bellman targets.
    

As shown in the nested-to-flattened section, the target network is not a stabilization trick but the natural consequence of periodic outer-iteration boundaries in flattened FQI. The target network keeps targets fixed for $K$ gradient steps, which corresponds to the inner loop in the nested view:

<a id="dqn"></a>

[Algorithm 5](#dqn "Link to this Algorithm") (Deep Q-Network (DQN))

**Input**: MDP $(S, A, P, R, \gamma)$, neural network $q(s,a; \boldsymbol{\theta})$, learning rate $\alpha$, target update frequency $K$, replay buffer capacity $B$, mini-batch size $b$, exploration rate $\varepsilon$

**Output**: Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$ randomly
    
2.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_0$
    
3.  Initialize replay buffer $\mathcal{B}$ with capacity $B$
    
4.  $t \leftarrow 0$
    
5.  **while** training **do**
    
    1.  Observe current state $s$
        
    2.  **// Use online network to collect data**
        
    3.  Select action: $a \leftarrow \begin{cases} \arg\max_{a'} q(s,a';\boldsymbol{\theta}_t) & \text{with probability } 1-\varepsilon \\ \text{random action} & \text{with probability } \varepsilon \end{cases}$
        
    4.  Execute $a$, observe reward $r$ and next state $s'$
        
    5.  Store $(s,a,r,s')$ in $\mathcal{B}$, replacing oldest if full
        
    6.  Sample mini-batch of $b$ transitions $\{(s_i,a_i,r_i,s_i')\}_{i=1}^b$ from $\mathcal{B}$
        
    7.  For each sampled transition $(s_i,a_i,r_i,s_i')$:
        
        1.  $y_i \leftarrow r_i + \gamma \color{blue}{\max_{a' \in A} q(s_i',a'; \boldsymbol{\theta}_{\text{target}})}$ (both selection AND evaluation with target network)
            
    8.  $\boldsymbol{\theta}_{t+1} \leftarrow \boldsymbol{\theta}_t - \alpha \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b (q(s_i,a_i;\boldsymbol{\theta}_t) - y_i)^2$
        
    9.  **if** $t \bmod K = 0$ **then**
        
        1.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_t$
            
    10.  $t \leftarrow t + 1$
         
6.  **return** $\boldsymbol{\theta}_t$
    

<a id="double-deep-q-network-double-dqn"></a>

### Double Deep Q-Network (Double DQN)

Double DQN addresses overestimation bias by decoupling action selection from evaluation. Instead of using the target network for both purposes (as DQN does), Double DQN uses the online network (currently-training parameters $\boldsymbol{\theta}_t$) to select which action looks best, then uses the target network (frozen parameters $\boldsymbol{\theta}_{\text{target}}$) to evaluate that action:

<a id="double-dqn"></a>

[Algorithm 6](#double-dqn "Link to this Algorithm") (Double Deep Q-Network (Double DQN))

**Input**: MDP $(S, A, P, R, \gamma)$, neural network $q(s,a; \boldsymbol{\theta})$, learning rate $\alpha$, target update frequency $K$, replay buffer capacity $B$, mini-batch size $b$, exploration rate $\varepsilon$

**Output**: Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$ randomly
    
2.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_0$
    
3.  Initialize replay buffer $\mathcal{B}$ with capacity $B$
    
4.  $t \leftarrow 0$
    
5.  **while** training **do**
    
    1.  Observe current state $s$
        
    2.  **// Use online network to collect data**
        
    3.  Select action: $a \leftarrow \begin{cases} \arg\max_{a'} q(s,a';\boldsymbol{\theta}_t) & \text{with probability } 1-\varepsilon \\ \text{random action} & \text{with probability } \varepsilon \end{cases}$
        
    4.  Execute $a$, observe reward $r$ and next state $s'$
        
    5.  Store $(s,a,r,s')$ in $\mathcal{B}$, replacing oldest if full
        
    6.  Sample mini-batch of $b$ transitions $\{(s_i,a_i,r_i,s_i')\}_{i=1}^b$ from $\mathcal{B}$
        
    7.  For each sampled transition $(s_i,a_i,r_i,s_i')$:
        
        1.  $a^*_i \leftarrow \color{red}{\arg\max_{a' \in A} q(s_i',a'; \boldsymbol{\theta}_t)}$ (action selection with online network)
            
        2.  $y_i \leftarrow r_i + \gamma \color{green}{q(s_i',a^*_i; \boldsymbol{\theta}_{\text{target}})}$ (action evaluation with target network)
            
    8.  $\boldsymbol{\theta}_{t+1} \leftarrow \boldsymbol{\theta}_t - \alpha \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b (q(s_i,a_i;\boldsymbol{\theta}_t) - y_i)^2$
        
    9.  **if** $t \bmod K = 0$ **then**
        
        1.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_t$
            
    10.  $t \leftarrow t + 1$
         
6.  **return** $\boldsymbol{\theta}_t$
    

Double DQN leaves $\mathcal{B}_t$ and $\hat{P}_{\mathcal{B}_t}$ unchanged and modifies only the target function $g$ by decoupling action selection (online network) from evaluation (target network). Compare the two approaches:

-   **DQN (blue)**: Uses the target network $\boldsymbol{\theta}_{\text{target}}$ for BOTH selecting which action is best AND evaluating it: $\max_{a'} q(s',a'; \boldsymbol{\theta}_{\text{target}})$ implicitly finds $a^* = \arg\max_{a'} q(s',a'; \boldsymbol{\theta}_{\text{target}})$ and then evaluates $q(s',a^*; \boldsymbol{\theta}_{\text{target}})$
    
-   **Double DQN (red + green)**: Uses the online network $\boldsymbol{\theta}_t$ to select $a^* = \arg\max_{a'} q(s',a'; \boldsymbol{\theta}_t)$, then uses the target network $\boldsymbol{\theta}_{\text{target}}$ to evaluate $q(s',a^*; \boldsymbol{\theta}_{\text{target}})$
    

This decoupling prevents overestimation bias because the noise in action selection (from the online network) is independent of the noise in action evaluation (from the target network). Recall that the online network represents the currently-training parameters being updated at each gradient step, while the target network represents the frozen parameters used for computing targets. By using different parameters for selection versus evaluation, we break the correlation that leads to systematic overestimation in the standard max operator.

<a id="q-learning-the-limiting-case"></a>

### Q-Learning: The Limiting Case

DQN and Double DQN use moderate settings: $B \approx 10^6$, $K \approx 10^4$, mini-batch size $b \approx 32$. We can ask: what happens at the extreme where we minimize buffer capacity, eliminate replay, and update targets every step? This limiting case gives classical Q-learning Watkins (1989): buffer capacity $B=1$, target network frequency $K=1$, and mini-batch size $b=1$.

In the buffer perspective, Q-learning has $\mathcal{B}_t = \{(s_t, a_t, r_t, s'_t)\}$ with $|\mathcal{B}_t | = 1$. The empirical distribution $\hat{P}_{\mathcal{B}_t}$ collapses to a Dirac mass at the current transition. We use each transition exactly once then discard it. There is no separate target network: the parameters used for computing targets are immediately updated after each step ($K=1$, or equivalently $\tau=1$ in EMA). This makes Q-learning a **stochastic approximation** method with replay ratio 1.

**Stochastic approximation** is a general framework for solving equations of the form $\mathbb{E}[h(X; \boldsymbol{\theta})] = 0$ using noisy samples, without computing expectations explicitly. The classic example is root-finding: given function $f(\boldsymbol{\theta}; Z)$ whose expectation $\mathbb{E}[f(\boldsymbol{\theta}; Z)] = F(\boldsymbol{\theta})$ we want to solve $F(\boldsymbol{\theta}) = 0$, the Robbins-Monro procedure updates:

<a id="W4U6n46dFZ"></a>

$$
\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \alpha_t f(\boldsymbol{\theta}_t; Z_t)
$$

[(14)](#W4U6n46dFZ "Link to this Equation")

using noisy samples $Z_t$ without ever computing $F(\boldsymbol{\theta})$ or its Jacobian. This is analogous to Newton’s method in the deterministic case, but replaces exact gradients with stochastic estimates and avoids computing or inverting the Jacobian. Under diminishing step sizes ($\alpha_t \to 0$, $\sum_t \alpha_t = \infty$), the iterates converge to solutions of $F(\boldsymbol{\theta}) = 0$.

Q-learning fits this framework by solving the Bellman residual equation. Recall from the [projection methods chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md) that the Bellman equation $q^* = \mathsf{L} q^*$ can be written as a residual equation $\mathsf{N}(q) \equiv \mathsf{L} q - q = 0$. For a parameterized Q-function $q(s,a; \boldsymbol{\theta})$, the residual at observed transition $(s,a,r,s')$ is:

<a id="SHLrfqwXx7"></a>

$$
R(s,a,r,s'; \boldsymbol{\theta}) = r + \gamma \max_{a'} q(s',a'; \boldsymbol{\theta}) - q(s,a; \boldsymbol{\theta})
$$

[(15)](#SHLrfqwXx7 "Link to this Equation")

This is the TD error. Q-learning is a stochastic approximation method for solving $\mathbb{E}_{\tau \sim P}[R(\tau; \boldsymbol{\theta})] = 0$ where $P$ is the distribution of transitions under the behavior policy. Each observed transition provides a noisy sample of the residual, and the algorithm updates parameters using the gradient of the squared residual without computing expectations explicitly.

The algorithm works with any function approximator that supports incremental updates. The general form applies a gradient descent step to minimize the squared TD error. The only difference between linear and nonlinear cases is how the gradient $\nabla_{\boldsymbol{\theta}} q(s,a; \boldsymbol{\theta})$ is computed.

<a id="q-learning"></a>

[Algorithm 7](#q-learning "Link to this Algorithm") (Q-Learning)

**Input**: MDP $(S, A, P, R, \gamma)$, function approximator $q(s,a; \boldsymbol{\theta})$, learning rate $\alpha$, exploration rate $\varepsilon$

**Output**: Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$
    
2.  $t \leftarrow 0$
    
3.  **while** training **do**
    
    1.  Observe current state $s$
        
    2.  Select action: $a \leftarrow \begin{cases} \arg\max_{a' \in A} q(s,a';\boldsymbol{\theta}_t) & \text{with probability } 1-\varepsilon \\ \text{random action} & \text{with probability } \varepsilon \end{cases}$
        
    3.  Execute $a$, observe reward $r$ and next state $s'$
        
    4.  Compute TD target: $y \leftarrow r + \gamma \max_{a' \in A} q(s',a'; \boldsymbol{\theta}_t)$
        
    5.  Update: $\boldsymbol{\theta}_{t+1} \leftarrow \boldsymbol{\theta}_t - \alpha \nabla_{\boldsymbol{\theta}} (q(s,a;\boldsymbol{\theta}_t) - y)^2$
        
    6.  $t \leftarrow t + 1$
        
4.  **return** $\boldsymbol{\theta}_t$
    

The gradient in line 5 depends on the choice of function approximator:

-   **Tabular**: Uses one-hot features $\boldsymbol{\phi}(s,a) = \boldsymbol{e}_{(s,a)}$, giving table-lookup updates $Q(s,a) \leftarrow Q(s,a) + \alpha(r + \gamma \max_{a'} Q(s',a') - Q(s,a))$. Converges under standard stochastic approximation conditions (detailed below).
    
-   **Linear**: $q(s,a; \boldsymbol{\theta}) = \boldsymbol{\theta}^\top \boldsymbol{\phi}(s,a)$ where $\boldsymbol{\phi}: \mathcal{S} \times \mathcal{A} \to \mathbb{R}^d$ is a feature map. The gradient is $\nabla_{\boldsymbol{\theta}} q(s,a; \boldsymbol{\theta}) = \boldsymbol{\phi}(s,a)$, giving the update $\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t + \alpha (y - \boldsymbol{\theta}_t^\top \boldsymbol{\phi}(s,a)) \boldsymbol{\phi}(s,a)$. Convergence is not guaranteed in general; the max operator combined with function approximation can cause instability.
    
-   **Nonlinear**: $q(s,a; \boldsymbol{\theta})$ is a neural network with weights $\boldsymbol{\theta}$. The gradient $\nabla_{\boldsymbol{\theta}} q(s,a; \boldsymbol{\theta})$ is computed via backpropagation. Convergence guarantees do not exist.
    

<a id="convergence-analysis-via-the-ode-method"></a>

### Convergence Analysis via the ODE Method

Tabular Q-learning converges under diminishing step sizes ($\alpha_t \to 0$, $\sum_t \alpha_t = \infty$) and sufficient exploration Watkins & Dayan (1992)Jaakkola _et al._ (1994)Tsitsiklis (1994). The standard proof technique is the **ordinary differential equation (ODE) method** Kushner & Yin (2003)Borkar & Meyn (2000), which analyzes stochastic approximation algorithms by studying an associated deterministic dynamical system.

The ODE method connects stochastic approximation to deterministic dynamics through a two-step argument. First, we show that as step sizes shrink, the discrete stochastic recursion $\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t + \alpha_t h(\boldsymbol{\theta}_t, Z_t)$ tracks the continuous deterministic ODE $\frac{d\boldsymbol{\theta}}{dt} = \bar{h}(\boldsymbol{\theta})$ where $\bar{h}(\boldsymbol{\theta}) = \mathbb{E}[h(\boldsymbol{\theta}, Z)]$ is the expected update direction. Second, we prove convergence of the ODE using Lyapunov functions or other dynamical systems tools. If the ODE converges to an equilibrium, the stochastic algorithm converges to the same point.

For tabular Q-learning, the update at state-action pair $(s,a)$ is:

<a id="RPWWhxxl5Y"></a>

$$
Q_{t+1}(s,a) = Q_t(s,a) + \alpha_t \big[ r + \gamma \max_{a'} Q_t(s',a') - Q_t(s,a) \big]
$$

[(16)](#RPWWhxxl5Y "Link to this Equation")

where $(s,a,r,s')$ is sampled from the transition distribution $P$ induced by the behavior policy. The expected update direction is:

<a id="pmXqfuxox0"></a>

$$
\bar{h}(Q)(s,a) = \mathbb{E}_{(s,a,r,s') \sim P} \big[ r + \gamma \max_{a'} Q(s',a') - Q(s,a) \mid (s,a) \text{ visited} \big]
$$

[(17)](#pmXqfuxox0 "Link to this Equation")

Under sufficient exploration (all state-action pairs visited infinitely often), this expectation is well-defined. Let $\xi(s,a)$ denote the stationary distribution over state-action pairs under the behavior policy. The ODE becomes:

<a id="V91mX19uKa"></a>

$$
\frac{dQ(s,a)}{dt} = \sum_{s'} p(s'|s,a) \big[r(s,a,s') + \gamma \max_{a'} Q(s',a') \big] - Q(s,a)
$$

[(18)](#V91mX19uKa "Link to this Equation")

This is a deterministic dynamical system. The fixed points satisfy $Q(s,a) = \mathbb{E}_{s'}[r(s,a,s') + \gamma \max_{a'} Q(s',a')]$, which is the Bellman optimality equation. Convergence is established by showing this ODE has a global Lyapunov function: the distance $\|Q - Q^*\|$ to the optimal Q-function decreases along trajectories. The Bellman operator is a contraction, which ensures the ODE trajectories converge to $Q^*$.

The interaction between the stationary distribution $\xi$ and the empirical distribution $\hat{P}_{\mathcal{B}_t}$ is subtle. In pure stochastic approximation (Q-learning), we have $\mathcal{B}_t = \{(s_t, a_t, r_t, s'_t)\}$ with a single transition. Over time, as we explore, the sequence of visited state-action pairs $(s_t, a_t)$ follows the behavior policy, and under ergodicity, the empirical frequency with which we update each $(s,a)$ converges to the stationary distribution $\xi(s,a)$. The ODE method formalizes this: the expected update $\bar{h}(Q)$ averages over $P$, which implicitly weights by how often we visit each $(s,a)$ under the stationary distribution.

For linear Q-learning with function approximation, the ODE analysis becomes more complex. The [projection methods chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md) shows that non-monotone projections (like linear least squares) can fail to preserve contraction properties. The max operator in Q-learning creates additional complications that prevent general convergence guarantees, even though the algorithm may work in practice for well-chosen features.

<a id="regression-losses-and-noise-models"></a>

## Regression Losses and Noise Models

How should the fitting loss change when Bellman targets have asymmetric or distributional noise rather than Gaussian residuals?

Fix a particular time $t$ and buffer contents $\mathcal{B}_t$. Sampling from $\mathcal{B}_t$ and pushing transitions through the target function $g(\cdot; \boldsymbol{\theta}_t)$ gives a regression distribution $\hat{P}_t^{\text{fit}}$ over pairs $((s,a), y)$. The `fit` operation in the inner loop is then a standard statistical estimation problem: given empirical samples from $\hat{P}_t^{\text{fit}}$, choose parameters $\boldsymbol{\theta}$ to minimize a loss:

<a id="Cj9aGTIYtv"></a>

$$
\mathcal{L}(\boldsymbol{\theta}; \mathcal{B}_t) \approx \mathbb{E}_{((s,a),y)\sim \hat{P}_t^{\text{fit}}} \big[\ell(q(s,a;\boldsymbol{\theta}), y)\big]
$$

[(19)](#Cj9aGTIYtv "Link to this Equation")

The choice of loss $\ell$ implicitly specifies a noise model for the targets $y$ under $\hat{P}_t^{\text{fit}}$. Squared error corresponds to Gaussian noise, absolute error to Laplace noise, Gumbel regression to extreme-value noise, and classification losses to non-parametric noise models over value bins. Because Bellman targets are noisy, biased, and bootstrapped, this choice has a direct impact on how the algorithm interprets the empirical distribution $\hat{P}_t^{\text{fit}}$.

This section examines alternative loss functions for the regression step. The standard approach uses squared error, but the noise in Bellman targets has special structure due to the max operator and bootstrapping. Two strategies have shown empirical success: Gumbel regression, which uses the proper likelihood for extreme-value noise, and classification-based methods, which avoid parametric noise assumptions by working with distributions over value bins.

<a id="gumbel-regression"></a>

### Gumbel Regression

Extreme value theory tells us that the maximum of Gaussian errors has Gumbel-distributed tails. If we take this distribution seriously, maximum likelihood estimation should use a Gumbel likelihood rather than a Gaussian one. Garg, Tang, Kahn, and Levine [Garg _et al._ (2023)](https://openreview.net/forum?id=SJ0Lde3tRL) developed this idea in Extreme Q-Learning (XQL). Instead of modeling the Bellman error as additive Gaussian noise:

<a id="cFOtfgayh6"></a>

$$
y_i = q^*(s_i, a_i) + \varepsilon_i, \quad \varepsilon_i \sim \mathcal{N}(0, \sigma^2)
$$

[(20)](#cFOtfgayh6 "Link to this Equation")

they model it as Gumbel noise:

<a id="NnMR2t2tbA"></a>

$$
y_i = q^*(s_i, a_i) + \varepsilon_i, \quad \varepsilon_i \sim -\text{Gumbel}(0, \beta)
$$

[(21)](#NnMR2t2tbA "Link to this Equation")

The negative Gumbel distribution arises because we are modeling errors in targets that overestimate the true value. The corresponding maximum likelihood loss is Gumbel regression:

<a id="GYfsJsURMC"></a>

$$
\mathcal{L}_{\text{Gumbel}}(\boldsymbol{\theta}) = \sum_i \left[\frac{q(s_i, a_i; \boldsymbol{\theta}) - y_i}{\beta} + \exp\left(\frac{q(s_i, a_i; \boldsymbol{\theta}) - y_i}{\beta}\right)\right]
$$

[(22)](#GYfsJsURMC "Link to this Equation")

The temperature parameter $\beta$ controls the heaviness of the tail. The score function (gradient with respect to $q$) is:

<a id="d5Xs4gPqPk"></a>

$$
\frac{\partial \mathcal{L}_{\text{Gumbel}}}{\partial q} = \frac{1}{\beta}\left[1 + \exp\left(\frac{q - y}{\beta}\right)\right]
$$

[(23)](#d5Xs4gPqPk "Link to this Equation")

When $q < y$ (underestimation), the exponential term is small and the gradient is mild. When $q > y$ (overestimation), the gradient grows exponentially with the error. This asymmetry deliberately penalizes overestimation more heavily than underestimation. When targets are systematically biased upward due to the max operator, this loss geometry pushes the estimates toward conservative Q-values.

The Gumbel loss can be understood as the natural likelihood for problems involving max operators, just as the Gaussian is the natural likelihood for problems involving averages. The central limit theorem tells us that sums converge to Gaussians; extreme value theory tells us that maxima converge to Gumbel (for light-tailed base distributions). Squared error is optimal for Gaussian noise; Gumbel regression is optimal for Gumbel noise.

<a id="floWuflfnk"></a>

Source

```python
#  label: fig-gumbel-loss
#  caption: Gumbel regression reshapes the loss landscape (left) and gradient geometry (right), penalizing overestimation exponentially while keeping underestimation gentle.

%config InlineBackend.figure_format = 'retina'
import numpy as np
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

# Set up the figure with two subplots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

# Define error range (q - y)
error = np.linspace(-3, 3, 500)

# Different beta values to show control over asymmetry
betas = [0.5, 1.0, 2.0]
colors = ['#1f77b4', '#ff7f0e', '#2ca02c']
labels = [r'$\beta = 0.5$ (aggressive)', r'$\beta = 1.0$ (moderate)', r'$\beta = 2.0$ (mild)']

# Plot 1: Gumbel loss function
for beta, color, label in zip(betas, colors, labels):
    loss = error / beta + np.exp(error / beta)
    ax1.plot(error, loss, color=color, linewidth=2, label=label)

# Add reference: squared error for comparison
squared_error = error**2
ax1.plot(error, squared_error, 'k--', linewidth=1.5, alpha=0.5, label='Squared error')

ax1.axvline(x=0, color='gray', linestyle=':', alpha=0.5)
ax1.axhline(y=0, color='gray', linestyle=':', alpha=0.5)
ax1.set_xlabel(r'Error: $q - y$', fontsize=11)
ax1.set_ylabel('Loss', fontsize=11)
ax1.set_title('Gumbel Loss Function', fontsize=12, fontweight='bold')
ax1.legend(fontsize=9)
ax1.grid(True, alpha=0.3)
ax1.set_ylim([0, 10])

# Annotate regions
ax1.text(-2, 7, 'Underestimation\n' + r'$(q < y)$', 
         fontsize=9, ha='center', color='darkred', alpha=0.7)
ax1.text(2, 7, 'Overestimation\n' + r'$(q > y)$', 
         fontsize=9, ha='center', color='darkblue', alpha=0.7)

# Plot 2: Gradient (score function) - showing asymmetry
for beta, color, label in zip(betas, colors, labels):
    gradient = (1/beta) * (1 + np.exp(error / beta))
    ax2.plot(error, gradient, color=color, linewidth=2, label=label)

# Add reference: gradient of squared error
squared_error_grad = 2 * error
ax2.plot(error, squared_error_grad, 'k--', linewidth=1.5, alpha=0.5, label='Squared error')

ax2.axvline(x=0, color='gray', linestyle=':', alpha=0.5)
ax2.axhline(y=0, color='gray', linestyle=':', alpha=0.5)
ax2.set_xlabel(r'Error: $q - y$', fontsize=11)
ax2.set_ylabel('Gradient magnitude', fontsize=11)
ax2.set_title('Gumbel Loss Gradient (Score Function)', fontsize=12, fontweight='bold')
ax2.legend(fontsize=9)
ax2.grid(True, alpha=0.3)
ax2.set_ylim([-5, 10])

# Annotate asymmetry
ax2.text(-2, -3, 'Mild gradient\n(tolerates underestimation)', 
         fontsize=9, ha='center', color='darkred', alpha=0.7)
ax2.text(2, 7, 'Steep gradient\n(penalizes overestimation)', 
         fontsize=9, ha='center', color='darkblue', alpha=0.7)

plt.tight_layout()
```

![<Figure size 1200x400 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/edd5ec1e7b-363294b6bc04a9b28ce467c7e99f16ba.png)

The left panel shows the Gumbel loss as a function of the error $q - y$. Notice the asymmetry: the loss grows exponentially for positive errors (overestimation) but increases only linearly for negative errors (underestimation). The parameter $\beta$ controls the degree of this asymmetry—smaller $\beta$ values create more aggressive penalization of overestimation.

The right panel shows the gradient (score function), which determines how strongly the optimizer pushes back against errors. For overestimation ($q > y$), the gradient grows exponentially, creating strong corrective pressure. For underestimation ($q < y$), the gradient remains relatively flat (approaching $1/\beta$). This is in stark contrast to squared error (dashed line), which treats over- and underestimation symmetrically. By tuning $\beta$, we can calibrate how aggressively the loss combats the overestimation bias induced by the max operator in the Bellman target.

Remark 5 (XQL vs Soft Q-Learning: Target Function vs Loss)

XQL (Gumbel loss) and Soft Q-learning both involve Gumbel distributions, but they operate at different levels of the FQI template. Recall our unified framework: buffer $\mathcal{B}_t$, target function $g$, loss $\ell$, optimization budget $K$.

**Soft Q-learning** changes the target function by using the smooth Bellman operator from [regularized MDPs](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md):

<a id="hQUF2CFQ1O"></a>

$$
g^{\text{soft}}(s,a,r,s'; \boldsymbol{\theta}) = r + \gamma \frac{1}{\beta}\log\sum_{a'} \exp(\beta q(s',a'; \boldsymbol{\theta}))
$$

[(24)](#hQUF2CFQ1O "Link to this Equation")

This replaces the hard max with logsumexp for entropy regularization. The loss remains standard: $\ell(q,y) = (q-y)^2$. The Gumbel distribution appears through the Gumbel-max trick (logsumexp = soft max), but this is about making the optimal policy stochastic, not about the noise structure in TD errors.

**XQL** keeps the hard max target function:

<a id="Pq47O0b0MS"></a>

$$
g^{\text{hard}}(s,a,r,s'; \boldsymbol{\theta}) = r + \gamma \max_{a'} q(s',a'; \boldsymbol{\theta})
$$

[(25)](#Pq47O0b0MS "Link to this Equation")

and instead changes the loss to Gumbel regression: $\ell_{\text{Gumbel}}(q,y) = \frac{q-y}{\beta} + \exp(\frac{q-y}{\beta})$. The Gumbel distribution here models the noise in the TD errors themselves, not the policy.

The asymmetric penalization in XQL (exponential penalty for overestimation) comes from the score function of the Gumbel likelihood, which is designed to handle extreme-value noise. Soft Q-learning uses symmetric L2 loss, so it does not preferentially penalize overestimation. The logsumexp smoothing in Soft Q reduces maximization bias by averaging over actions, but this is a property of the target function, not the loss geometry.

Both can be combined: Soft Q-learning with Gumbel loss would change both the target function (logsumexp) and the loss (asymmetric penalization).

The practical advantage of XQL is that the loss function itself handles the asymmetric error structure through its score function. We do not need to estimate variances or compute weighted averages. XQL has shown improvements in both value-based and actor-critic methods, particularly in offline reinforcement learning where the max-operator bias compounds across iterations without corrective exploration.

<a id="classification-based-q-learning"></a>

### Classification-Based Q-Learning

From the buffer viewpoint, nothing changes upstream: we still sample transitions from $\hat{P}_{\mathcal{B}_t}$ and apply the same target function $g(\cdot; \boldsymbol{\theta}_t)$. Classification-based Q-learning changes only the loss $\ell$ and target representation. Instead of regressing on a scalar $y\in\mathbb{R}$ with L2, we represent values as categorical distributions over bins and use cross-entropy loss.

Choose a finite grid $z_1 < z_2 < \cdots < z_K$ spanning plausible return values. The network outputs logits $\ell_{\boldsymbol{\theta}}(s,a) \in \mathbb{R}^K$ converted to probabilities:

<a id="eCl01lfTji"></a>

$$
p_{\boldsymbol{\theta}}(k \mid s,a) = \frac{\exp(\ell_{\boldsymbol{\theta}}(s,a)_k)}{\sum_{j=1}^K \exp(\ell_{\boldsymbol{\theta}}(s,a)_j)}, \quad q(s,a; \boldsymbol{\theta}) = \sum_{k=1}^K z_k \, p_{\boldsymbol{\theta}}(k \mid s,a)
$$

[(26)](#eCl01lfTji "Link to this Equation")

Each scalar TD target $y_i$ is converted to a target distribution via the two-hot encoding. If $y_i$ falls between bins $z_j$ and $z_{j+1}$:

<a id="yN23UzfnDj"></a>

$$
q_j(y_i) = \frac{z_{j+1} - y_i}{z_{j+1} - z_j}, \quad q_{j+1}(y_i) = \frac{y_i - z_j}{z_{j+1} - z_j}, \quad q_k(y_i) = 0 \text{ for } k \notin \{j, j+1\}
$$

[(27)](#yN23UzfnDj "Link to this Equation")

This is barycentric interpolation: $\sum_k z_k q_k(y_i) = y_i$ recovers the scalar exactly, placing the two-hot encoding within the same framework as linear interpolation in the [dynamic programming chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) ([Algorithm 2](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md#backward-recursion-interp)).

<a id="R485ymZrly"></a>

Source

```python
#  label: fig-two-hot
#  caption: Two-hot encoding as barycentric interpolation: the left panel shows a single target spread over two bins, while the right panel compares encodings for multiple targets.

%config InlineBackend.figure_format = 'retina'
import numpy as np
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

def two_hot_encode(y, z_bins):
    """Compute two-hot encoding weights for target value y on grid z_bins."""
    K = len(z_bins)
    q = np.zeros(K)
    
    # Clip to grid boundaries
    if y <= z_bins[0]:
        q[0] = 1.0
        return q, 0
    if y >= z_bins[-1]:
        q[-1] = 1.0
        return q, K - 1
    
    # Find bins j, j+1 such that z_j <= y < z_{j+1}
    j = np.searchsorted(z_bins, y, side='right') - 1
    
    # Barycentric coordinates (linear interpolation)
    q[j+1] = (y - z_bins[j]) / (z_bins[j+1] - z_bins[j])
    q[j] = (z_bins[j+1] - y) / (z_bins[j+1] - z_bins[j])
    
    return q, j

# Set up the figure with two panels
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

# Define a grid of K=11 bins spanning [-5, 5]
K = 11
z_bins = np.linspace(-5, 5, K)

# Panel 1: Two-hot encoding for a specific target
y_target = 0.7
q, j = two_hot_encode(y_target, z_bins)

# Plot bins as vertical lines
for z in z_bins:
    ax1.axvline(z, color='lightgray', linestyle='--', linewidth=0.8, alpha=0.5)

# Plot the distribution
colors_bar = ['#E63946' if qi > 0 else '#A8DADC' for qi in q]
ax1.bar(z_bins, q, width=(z_bins[1] - z_bins[0]) * 0.8, 
        color=colors_bar, alpha=0.7, edgecolor='black', linewidth=1.5)

# Highlight the target value
ax1.axvline(y_target, color='#2E86AB', linewidth=3, label=f'Target $y = {y_target}$', zorder=10)
ax1.plot(y_target, 0, 'o', color='#2E86AB', markersize=12, zorder=11)

# Annotate the two active bins with barycentric coordinates
ax1.annotate(f'$q_{{{j}}} = {q[j]:.3f}$\n$= \\frac{{z_{{{j+1}}} - y}}{{z_{{{j+1}}} - z_{{{j}}}}}$',
            xy=(z_bins[j], q[j]), xytext=(z_bins[j] - 1.8, q[j] + 0.25),
            fontsize=10, color='#E63946', weight='bold',
            arrowprops=dict(arrowstyle='->', color='#E63946', lw=2))
ax1.annotate(f'$q_{{{j+1}}} = {q[j+1]:.3f}$\n$= \\frac{{y - z_{{{j}}}}}{{z_{{{j+1}}} - z_{{{j}}}}}$',
            xy=(z_bins[j+1], q[j+1]), xytext=(z_bins[j+1] + 0.5, q[j+1] + 0.25),
            fontsize=10, color='#E63946', weight='bold',
            arrowprops=dict(arrowstyle='->', color='#E63946', lw=2))

# Verify barycentric property
reconstruction = np.sum(z_bins * q)
textstr = f'Barycentric property:\n$\\sum_k z_k q_k(y) = {reconstruction:.4f} = y$'
ax1.text(0.02, 0.97, textstr, transform=ax1.transAxes, fontsize=10,
        verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

ax1.set_xlabel('Bin value $z_k$', fontsize=11)
ax1.set_ylabel('Probability $q_k(y)$', fontsize=11)
ax1.set_title('Two-Hot Encoding = Linear Interpolation', fontsize=12, fontweight='bold')
ax1.set_ylim([0, 1.2])
ax1.legend(loc='upper right', fontsize=10)
ax1.grid(axis='y', alpha=0.3)

# Panel 2: Multiple targets to show the pattern
targets = [0.7, -2.3, 3.8]
colors = ['#2E86AB', '#A23B72', '#F18F01']

for idx, (y_target, color) in enumerate(zip(targets, colors)):
    q, _ = two_hot_encode(y_target, z_bins)
    offset = idx * 0.2
    ax2.bar(z_bins + offset, q, width=0.18, color=color, alpha=0.7, 
           label=f'$y = {y_target}$', edgecolor='black', linewidth=0.8)

for z in z_bins:
    ax2.axvline(z, color='lightgray', linestyle='--', linewidth=0.5, alpha=0.4)

ax2.set_xlabel('Bin value $z_k$', fontsize=11)
ax2.set_ylabel('Probability $q_k(y)$', fontsize=11)
ax2.set_title('Multiple Targets: Each Encoded as Two-Hot', fontsize=12, fontweight='bold')
ax2.legend(loc='upper right', fontsize=10)
ax2.grid(axis='y', alpha=0.3)

plt.tight_layout()
```

![<Figure size 1200x400 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/55cb542c3d-f75d340a8ba11784a34487584446ccb9.png)

The left panel shows two-hot encoding for $y=0.7$ on a grid of 11 bins. The target value is distributed over exactly two adjacent bins $z_j$ and $z_{j+1}$ with weights that are barycentric coordinates: the weight assigned to each bin is inversely proportional to the distance from the target to that bin. The inset verifies that $\sum_k z_k q_k(y)$ exactly recovers the original target—this is the same linear interpolation formula used throughout the book. The right panel shows that different targets produce different two-hot patterns, each concentrating mass on the two bins surrounding the target value.

The loss minimizes cross-entropy:

<a id="cuOWdydpXl"></a>

$$
\mathcal{L}_{\text{CE}}(\boldsymbol{\theta}) = -\mathbb{E}_{((s,a),y) \sim \hat{P}_t^{\text{fit}}}\left[ \sum_{k=1}^K q_k(y) \log p_{\boldsymbol{\theta}}(k \mid s, a) \right]
$$

[(28)](#cuOWdydpXl "Link to this Equation")

which projects the target distribution onto the predicted distribution in KL geometry on the simplex $\Delta^{K-1}$ rather than L2 on $\mathbb{R}$. The gradient is $\nabla_{\ell_\theta} \mathcal{L}_{\text{CE}} = p_\theta - q$, bounded in magnitude regardless of target size.

This provides three sources of implicit robustness. First, gradient influence is bounded: each sample contributes $O(1)$ gradient magnitude per bin, unlike L2 where error magnitude $E$ contributes gradient proportional to $E$. Second, the finite grid $[z_1, z_K]$ clips extreme targets to boundary bins, preventing outliers from dominating the regression scale. Third, the two-hot encoding spreads mass across neighboring bins, providing label smoothing that averages noisy targets at the same $(s,a)$.

The two-hot weights $q_j(y_i), q_{j+1}(y_i)$ are barycentric coordinates, identical to linear interpolation in the [dynamic programming chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md) ([Algorithm 2](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/15-finite-horizon-dp.md#backward-recursion-interp)). This places the encoding within Gordon’s monotone approximator framework ([Definition 1](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md#gordon-averager)): targets are convex combinations preserving order and boundedness. The neural network predicting $p_{\boldsymbol{\theta}}(\cdot \mid s,a)$ is non-monotone, making classification-based Q-learning a hybrid: monotone target structure paired with flexible function approximation.

Empirically, cross-entropy loss scales better with network capacity. Farebrother et al. [Farebrother _et al._ (2024)](https://arxiv.org/abs/2403.03950) found that L2-based DQN and CQL degrade when Q-networks scale to large ResNets, while classification loss (specifically HL-Gauss, which uses Gaussian smoothing instead of two-hot) maintains performance. The combination of KL geometry, quantization, and smoothing prevents overfitting to noisy targets that plagues L2 with high-capacity networks.

<a id="summary"></a>

## Summary

Fitted Q-iteration has a two-level structure: an outer loop applies the Bellman operator to construct targets, an inner loop fits a function approximator to those targets. All algorithms in this chapter instantiate this template with different choices of buffer $\mathcal{B}_t$, target function $g$, loss $\ell$, and optimization budget $K$.

The empirical distribution $\hat{P}_{\mathcal{B}_t}$ unifies offline and online methods through plug-in approximation: replace unknown transition law $P$ with $\hat{P}_{\mathcal{B}_t}$ and minimize empirical risk $\mathbb{E}_{((s,a),y)\sim \hat{P}_t^{\text{fit}}} [\ell(q, y)]$. Offline uses fixed $\mathcal{B}_t \equiv \mathcal{D}$ (sample average approximation), online uses circular buffer (Q-learning with $B=1$ is stochastic approximation, DQN with large $B$ is hybrid).

The inference-scheduling experiment held the MDP, regressor, data-set size, seeds, and evaluation episodes fixed while changing the behavior distribution. The broad buffer covered every feasible state-action pair and stayed closer to the exact policy; the narrow buffer omitted most pairs and performed worse under the reduced MDP’s objective. Coverage is therefore a property of the empirical distribution $\hat{P}_{\mathcal B}$ with direct consequences for the Bellman targets available to FQI.

Target networks and online networks arise from flattening the nested loops. Merging inner gradient steps with outer value iteration creates a single loop where two sets of parameters coexist: the **online network** $\boldsymbol{\theta}_t$ (actively updated at each gradient step, corresponds to $\boldsymbol{\theta}_n^{(k)}$) and the **target network** $\boldsymbol{\theta}_{\text{target}}$ (frozen for computing targets, updated every $K$ steps to mark outer-iteration boundaries, corresponds to $\boldsymbol{\theta}_n$). In online algorithms like DQN, the online network additionally serves as the behavior policy for data collection.

Fitted Q-iteration can now learn action values from fixed or evolving buffers, but every target still requires $\max_a q(s,a)$. What happens when that action search is itself a nonlinear program? [Amortized action optimization](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md) learns an actor to replace the repeated search while retaining the fitted-Q critic.

<a id="self-checks"></a>

## Self-checks

<a id="ex-fqi-check-1"></a>

[Exercise 1](#ex-fqi-check-1 "Link to this Exercise") (Two loops)

What happens in the outer loop and the inner loop of fitted Q-iteration?

Solution to [Exercise 1](#ex-fqi-check-1)

The outer loop freezes the current Q-function and constructs Bellman targets. The inner loop fits a new function approximator to those targets.

<a id="ex-fqi-check-2"></a>

[Exercise 2](#ex-fqi-check-2 "Link to this Exercise") (Offline support)

Why is a highly accurate regression fit still dangerous for actions poorly represented in an offline dataset?

Solution to [Exercise 2](#ex-fqi-check-2)

The fit is unconstrained off the data support. Maximization can select extrapolated action values that are numerically large but unsupported by transitions in the dataset.

<a id="ex-fqi-check-3"></a>

[Exercise 3](#ex-fqi-check-3 "Link to this Exercise") (Frozen targets)

What instability does a target network reduce?

Solution to [Exercise 3](#ex-fqi-check-3)

It slows the movement of regression targets. Without it, each parameter update simultaneously changes the predictions and the targets being fitted, creating a rapidly moving objective.

<a id="ex-fqi-check-4"></a>

[Exercise 4](#ex-fqi-check-4 "Link to this Exercise") (Matched coverage comparison)

The two inference-scheduling buffers contain the same number of transitions. Why can the buffer with fewer distinct state-action pairs still attain lower training error while producing a worse policy?

Solution to [Exercise 4](#ex-fqi-check-4)

Repeated transitions make the empirical regression problem easier on the visited region, but they supply no Bellman targets for omitted actions and states. Greedy action selection can therefore depend on unsupported extrapolation even when the in-buffer fit is accurate.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-ernst2005tree"></a>
2.  Ernst, D., Geurts, P., & Wehenkel, L. (2005). Tree-Based Batch Mode Reinforcement Learning. _Journal of Machine Learning Research_, _6_, 503–556.
<a id="cite-riedmiller2005neural"></a>
4.  Riedmiller, M. (2005). Neural Fitted Q Iteration – First Experiences with a Data Efficient Neural Reinforcement Learning Method. _Proceedings of the 16th European Conference on Machine Learning (ECML)_, 317–328.
<a id="cite-watkins1989learning"></a>
6.  Watkins, C. J. C. H. (1989). _Learning from Delayed Rewards_ \[Phdthesis\]. University of Cambridge.
<a id="cite-mnih2013atari"></a>
8.  Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., & others. (2013). Playing Atari with Deep Reinforcement Learning. _NIPS Deep Learning Workshop_.
<a id="cite-van2016deep"></a>
10.  Van Hasselt, H., Guez, A., & Silver, D. (2016). Deep Reinforcement Learning with Double Q-learning. _Proceedings of the AAAI Conference on Artificial Intelligence_, _30_(1).
<a id="cite-haarnoja2017reinforcement"></a>
12.  Haarnoja, T., Tang, H., Abbeel, P., & Levine, S. (2017). Reinforcement Learning with Deep Energy-Based Policies. _Proceedings of the 34th International Conference on Machine Learning_, _70_, 1352–1361.
<a id="cite-lillicrap2015continuous"></a>
14.  Lillicrap, T. P., Hunt, J. J., Pritzel, A., Heess, N., Erez, T., Tassa, Y., Silver, D., & Wierstra, D. (2015). Continuous Control with Deep Reinforcement Learning. _arXiv Preprint arXiv:1509.02971_.
<a id="cite-fujimoto2018addressing"></a>
16.  Fujimoto, S., Hoof, H., & Meger, D. (2018). Addressing Function Approximation Error in Actor-Critic Methods. _International Conference on Machine Learning (ICML)_, 1587–1596.
<a id="cite-haarnoja2018soft"></a>
18.  Haarnoja, T., Zhou, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor. _Proceedings of the 35th International Conference on Machine Learning (ICML)_, 1861–1870.
<a id="cite-watkins1992qlearning"></a>
20.  Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. _Machine Learning_, _8_(3–4), 279–292.
<a id="cite-jaakkola1994convergence"></a>
22.  Jaakkola, T., Jordan, M. I., & Singh, S. P. (1994). Convergence of Stochastic Iterative Dynamic Programming Algorithms. _Neural Computation_, _6_(6), 1185–1201.
<a id="cite-tsitsiklis1994asynchronous"></a>
24.  Tsitsiklis, J. N. (1994). Asynchronous Stochastic Approximation and Q-Learning. _Machine Learning_, _16_(3), 185–202.
<a id="cite-kushner2003stochastic"></a>
26.  Kushner, H. J., & Yin, G. G. (2003). _Stochastic Approximation and Recursive Algorithms and Applications_ (2nd ed., Vol. 35). Springer.
<a id="cite-borkar2000ode"></a>
28.  Borkar, V. S., & Meyn, S. P. (2000). ODE Methods for Temporal Difference Learning. _SIAM Journal on Control and Optimization_, _38_(2), 447–465.
<a id="cite-garg2023extreme"></a>
30.  Garg, D., Tang, J., Kahn, G., Levine, S., & Finn, C. (2023). Extreme Q-Learning: MaxEnt RL without Entropy. _International Conference on Learning Representations (ICLR)_. [https://openreview.net/forum?id=SJ0Lde3tRL](https://openreview.net/forum?id=SJ0Lde3tRL)

[

Approximate Value Methods

Monte Carlo Bellman Estimation


](22-monte-carlo-bellman-estimation.md)[

Parameterized Policy Optimization

Amortized Action Optimization


](24-amortized-action-optimization.md)


---

# CHAPITRE 24 — Amortized Action Optimization

Section du livre : Parameterized Policy Optimization

Page originale : https://pierrelucbacon.com/rlbook/amortized-action-optimization

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md

> **Cours de Pierre-Luc Bacon — 24.** [Page publiée](https://pierrelucbacon.com/rlbook/amortized-action-optimization) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/24-amortized-action-optimization.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Amortized Action Optimization

<a id="skip-to-article"></a>

The previous chapter showed how fitted Q-iteration handles large state spaces through function approximation. FQI maintains a unified structure across batch and online settings: a replay buffer $\mathcal{B}_t$ inducing empirical distribution $\hat{P}_{\mathcal{B}_t}$, a target map $T_q$ derived from the Bellman operator, a loss function $\ell$, and an optimization budget. Algorithms differ in how they instantiate these components (buffer evolution, hard vs soft Bellman, update frequency), but all follow the same template.

However, this framework breaks down when the action space becomes large or continuous. Computing Bellman targets requires evaluating $\max_{a' \in \mathcal{A}} q(s',a';\boldsymbol{\theta})$ for each next state $s'$. When actions are continuous ($\mathcal{A} \subset \mathbb{R}^m$), this maximization requires solving a nonlinear program at every target computation. For a replay buffer with millions of transitions, this becomes computationally prohibitive.

Can the repeated maximization be replaced by a learned state-to-action map? **Amortization** invests computation during training so that action selection requires only a forward pass at execution time.

The strategies we examine are:

1.  **Explicit optimization** (Section 2): Solve the maximization numerically for a subset of states, accepting the computational cost for exact solutions.
    
2.  **Policy network amortization**: Learn a deterministic policy network $\pi_{\boldsymbol{w}}$ that approximates $\arg\max_a
    q(s,a;\boldsymbol{\theta})$, enabling fast action selection via a single forward pass. NFQCA, DDPG, and TD3 instantiate this route.
    

Each approach represents a different point in the computation-accuracy trade-off, and all fit within the FQI template by modifying how targets are computed.

<a id="explicit-optimization"></a>

## Explicit Optimization

What is the computational cost of solving the continuous-action maximization directly for every fitted-Q target?

Recall that in fitted Q methods, the main idea is to compute the Bellman operator only at a subset of all states, relying on function approximation to generalize to the remaining states. At each step of the successive approximation loop, we build a dataset of input state-action pairs mapped to their corresponding optimality operator evaluations:

<a id="YYND1bJjPQ"></a>

$$
\mathcal{D}_n = \{((s, a), (\mathsf{L} q)(s, a; \boldsymbol{\theta}_n)) \mid (s,a) \in \mathcal{B}\}
$$

[(1)](#YYND1bJjPQ "Link to this Equation")

This dataset is then fed to our function approximator (neural network, random forest, linear model) to obtain the next set of parameters:

<a id="b8W5gLTfK1"></a>

$$
\boldsymbol{\theta}_{n+1} \leftarrow \texttt{fit}(\mathcal{D}_n)
$$

[(2)](#b8W5gLTfK1 "Link to this Equation")

While this strategy allows us to handle very large or even infinite (continuous) state spaces, it still requires maximizing over actions ($\max_{a \in \mathcal{A}}$) during the dataset creation when computing the operator $\mathsf{L}$ for each basepoint. This maximization becomes computationally expensive for large action spaces. We can address this by adding another level of optimization: for each sample added to our regression dataset, we employ numerical optimization methods to find actions that maximize the Bellman operator for the given state.

<a id="fitted-q-iteration-explicit"></a>

[Algorithm 1](#fitted-q-iteration-explicit "Link to this Algorithm") (Fitted Q-Iteration with Explicit Optimization)

**Input:** MDP $(S, \mathcal{A}, P, R, \gamma)$, base points $\mathcal{B}$, function approximator $q(s,a; \boldsymbol{\theta})$, maximum iterations $N$, tolerance $\varepsilon > 0$

**Output:** Parameters $\boldsymbol{\theta}$ for Q-function approximation

1.  Initialize $\boldsymbol{\theta}_0$
    
2.  $n \leftarrow 0$
    
3.  **repeat**
    
    1.  $\mathcal{D} \leftarrow \emptyset$ $\quad$ // Regression dataset
        
    2.  **for** each $(s,a,r,s') \in \mathcal{B}$ **do** $\quad$ // Monte Carlo with one sample
        
        1.  $y_{s,a} \leftarrow r + \gamma \texttt{maximize}(q(s', \cdot; \boldsymbol{\theta}_n))$
            
        2.  $\mathcal{D} \leftarrow \mathcal{D} \cup \{((s,a), y_{s,a})\}$
            
    3.  $\boldsymbol{\theta}_{n+1} \leftarrow \texttt{fit}(\mathcal{D})$
        
    4.  $\delta \leftarrow \frac{1}{|\mathcal{D}||\mathcal{A}|}\sum_{(s,a) \in \mathcal{D} \times \mathcal{A}} (q(s,a; \boldsymbol{\theta}_{n+1}) - q(s,a; \boldsymbol{\theta}_n))^2$
        
    5.  $n \leftarrow n + 1$
        
4.  **until** $\delta < \varepsilon$ or $n \geq N$
    
5.  **return** $\boldsymbol{\theta}_n$
    

The above pseudocode introduces a generic $\texttt{maximize}$ routine which represents any numerical optimization method that searches for an action maximizing the given function. This approach is versatile and can be adapted to different types of action spaces. For continuous action spaces, we can employ standard nonlinear optimization methods like gradient descent or L-BFGS (e.g., using scipy.optimize.minimize). For large discrete action spaces, we can use integer programming solvers - linear integer programming if the Q-function approximator is linear in actions, or mixed-integer nonlinear programming (MINLP) solvers for nonlinear Q-functions. The choice of solver depends on the structure of our Q-function approximator and the constraints on our action space.

While explicit optimization provides exact solutions, it becomes computationally expensive when we need to compute targets for millions of transitions in a replay buffer. Can we avoid solving an optimization problem at every decision? The answer is amortization.

<a id="amortized-optimization-approach"></a>

## Amortized Optimization Approach

Can expensive action searches performed during training supervise a map that returns actions cheaply at deployment time?

This process is computationally intensive. We can “amortize” some of this computation by replacing the explicit optimization for each sample with a direct mapping that gives us an approximate maximizer directly. For Q-functions, recall that the operator is given by:

<a id="SGBHmFhCfM"></a>

$$
(\mathsf{L} q)(s,a) = r(s,a) + \gamma \int p(ds'|s,a)\max_{a' \in \mathcal{A}(s')} q(s', a')
$$

[(3)](#SGBHmFhCfM "Link to this Equation")

If $q^*$ is the optimal state-action value function, then $v^*(s) = \max_a q^*(s,a)$, and we can derive the optimal policy directly by computing the decision rule:

<a id="IwuiNzM9oj"></a>

$$
\pi^\star(s) = \arg\max_{a \in \mathcal{A}(s)} q^\star(s,a)
$$

[(4)](#IwuiNzM9oj "Link to this Equation")

Since $q^*$ is a fixed point of $\mathsf{L}$, we can write:

<a id="nNG6CcwIQT"></a>

$$
\begin{align*}
q^\star(s,a) &= (\mathsf{L} q^*)(s,a) \\
&= r(s,a) + \gamma \int p(ds'|s,a) \max_{a' \in \mathcal{A}(s')} q^\star(s', a') \\
&= r(s,a) + \gamma \int p(ds'|s,a) q^\star(s', \pi^\star(s'))
\end{align*}
$$

[(5)](#nNG6CcwIQT "Link to this Equation")

Note that $\pi^\star$ is implemented by our $\texttt{maximize}$ numerical solver in the procedure above. A practical strategy would be to collect these maximizer values at each step and use them to train a function approximator that directly predicts these solutions. Due to computational constraints, we might want to compute these exact maximizer values only for a subset of states, based on some computational budget, and use the fitted decision rule to generalize to the remaining states. This leads to the following amortized version:

<a id="fitted-q-iteration-amortized"></a>

[Algorithm 2](#fitted-q-iteration-amortized "Link to this Algorithm") (Fitted Q-Iteration with Amortized Optimization)

**Input:** MDP $(S, \mathcal{A}, P, R, \gamma)$, base points $\mathcal{B}$, subset for exact optimization $\mathcal{B}_{\text{opt}} \subset \mathcal{B}$, Q-function approximator $q(s,a; \boldsymbol{\theta})$, policy approximator $\pi_{\boldsymbol{w}}$, maximum iterations $N$, tolerance $\varepsilon > 0$

**Output:** Parameters $\boldsymbol{\theta}$ for Q-function, $\boldsymbol{w}$ for policy

1.  Initialize $\boldsymbol{\theta}_0$, $\boldsymbol{w}_0$
    
2.  $n \leftarrow 0$
    
3.  **repeat**
    
    1.  $\mathcal{D}_q \leftarrow \emptyset$ $\quad$ // Q-function regression dataset
        
    2.  $\mathcal{D}_\pi \leftarrow \emptyset$ $\quad$ // Policy regression dataset
        
    3.  **for** each $(s,a,r,s') \in \mathcal{B}$ **do**
        
        1.  **// Determine next state’s action via exact optimization or approximation**
            
        2.  **if** $s' \in \mathcal{B}_{\text{opt}}$ **then**
            
            1.  $a^*_{s'} \leftarrow \texttt{maximize}(q(s', \cdot; \boldsymbol{\theta}_n))$
                
            2.  $\mathcal{D}_\pi \leftarrow \mathcal{D}_\pi \cup \{(s', a^*_{s'})\}$
                
        3.  **else**
            
            1.  $a^*_{s'} \leftarrow \pi_{\boldsymbol{w}_n}(s')$
                
        4.  **// Compute Q-function target using chosen action**
            
        5.  $y_{s,a} \leftarrow r + \gamma q(s', a^*_{s'}; \boldsymbol{\theta}_n)$
            
        6.  $\mathcal{D}_q \leftarrow \mathcal{D}_q \cup \{((s,a), y_{s,a})\}$
            
    4.  **// Update both function approximators**
        
    5.  $\boldsymbol{\theta}_{n+1} \leftarrow \texttt{fit}(\mathcal{D}_q)$
        
    6.  $\boldsymbol{w}_{n+1} \leftarrow \texttt{fit}(\mathcal{D}_\pi)$
        
    7.  **// Compute convergence criteria**
        
    8.  $\delta_q \leftarrow \frac{1}{|\mathcal{D}_q|}\sum_{(s,a) \in \mathcal{D}_q} (q(s,a; \boldsymbol{\theta}_{n+1}) - q(s,a; \boldsymbol{\theta}_n))^2$
        
    9.  $\delta_\pi \leftarrow \frac{1}{|\mathcal{D}_\pi|}\sum_{(s,a^*) \in \mathcal{D}_\pi} \|a^* - \pi_{\boldsymbol{w}_{n+1}}(s)\|^2$
        
    10.  $n \leftarrow n + 1$
         
4.  **until** $\max(\delta_q, \delta_\pi) < \varepsilon$ or $n \geq N$
    
5.  **return** $\boldsymbol{\theta}_n$, $\boldsymbol{w}_n$
    

Note that the policy $\pi_{\boldsymbol{w}}$ is being trained on a dataset $\mathcal{D}_\pi$ containing optimal actions computed with respect to an evolving Q-function. Specifically, at iteration $n$, we collect pairs $(s', a^*_{s'})$ where $a^*_{s'} = \arg\max_a q(s', a; \boldsymbol{\theta}_n)$. However, after updating to $\boldsymbol{\theta}_{n+1}$, these actions may no longer be optimal with respect to the new Q-function.

A natural approach to handle this staleness would be to maintain only the most recent optimization data. We could modify our procedure to keep a sliding window of $K$ iterations, where at iteration $n$, we only use data from iterations $\max(0, n-K)$ to $n$. This would be implemented by augmenting each entry in $\mathcal{D}_\pi$ with a timestamp:

<a id="qCsmgE9MHC"></a>

$$
\mathcal{D}_\pi^{(n)} = \{(s', a^*_{s'}, t) \mid t \in \{n-K,\ldots,n\}\}
$$

[(6)](#qCsmgE9MHC "Link to this Equation")

where $t$ indicates the iteration at which the optimal action was computed. When fitting the policy network, we would then only use data points that are at most $K$ iterations old:

<a id="w7MAXI9Dvm"></a>

$$
\boldsymbol{w}_{n+1} \leftarrow \texttt{fit}(\{(s', a^*_{s'}) \mid (s', a^*_{s'}, t) \in \mathcal{D}_\pi^{(n)}, n-K \leq t \leq n\})
$$

[(7)](#w7MAXI9Dvm "Link to this Equation")

This introduces a trade-off between using more data (larger $K$) versus using more recent, accurate data (smaller $K$). The choice of $K$ would depend on how quickly the Q-function evolves and the computational budget available for computing exact optimal actions.

The main limitation of this approach, beyond the out-of-distribution drift, is that it requires computing exact optimal actions via the solver for states in $\mathcal{B}_{\text{opt}}$. Can we reduce or eliminate this computational expense? As the policy improves at selecting actions, we can bootstrap from these increasingly better choices. Continuously amortizing these improving actions over time creates a virtuous cycle of self-improvement toward the optimal policy. However, this bootstrapping process requires careful management: moving too quickly can destabilize training.

<a id="deterministic-parametrized-policies"></a>

## Deterministic Parametrized Policies

Which function class can represent a direct state-to-action map for continuous control?

In this section, we consider deterministic parametrized policies of the form $\pi_{\boldsymbol{w}}(s)$ which directly output an action given a state. This approach differs from stochastic policies that output probability distributions over actions, making it particularly suitable for continuous control problems where the optimal policy is often deterministic. Fitted Q-value methods can be naturally extended to simultaneously learn both the Q-function and such a deterministic policy.

<a id="the-amortization-problem-for-continuous-actions"></a>

## The Amortization Problem for Continuous Actions

Which objective makes the parameterized actor approximate the maximizing action of the current critic across a state distribution?

When actions are continuous, $a \in \mathbb{R}^d$, extracting a greedy policy from a Q-function becomes computationally expensive. Consider a robot arm control task where the action is a $d$\-dimensional torque vector. To act greedily given Q-function $q(s,a; \boldsymbol{\theta})$, we must solve:

<a id="DUNluNyHZu"></a>

$$
\pi(s) = \arg\max_{a \in \mathcal{A}} q(s, a; \boldsymbol{\theta}),
$$

[(8)](#DUNluNyHZu "Link to this Equation")

where $\mathcal{A} \subset \mathbb{R}^d$ is a continuous set (often a box or polytope). This requires running an optimization algorithm at every time step. For neural network Q-functions, this means solving a nonlinear program whose objective involves forward passes through the network.

After training converges, the agent must select actions in real-time during deployment. Running interior-point methods or gradient-based optimizers at every decision creates unacceptable latency, especially in high-frequency control where decisions occur at 100Hz or faster.

The solution is to **amortize** the optimization cost by learning a separate policy network $\pi_{\boldsymbol{w}}(s)$ that directly outputs actions. During training, we optimize $\boldsymbol{w}$ so that $\pi_{\boldsymbol{w}}(s) \approx \arg\max_a q(s,a; \boldsymbol{\theta})$ for states we encounter. At deployment, action selection reduces to a single forward pass through the policy network: $a = \pi_{\boldsymbol{w}}(s)$. The computational cost of optimization is paid during training (where time is less constrained) rather than at inference.

This introduces a second approximation beyond the Q-function. We now have two function approximators: a **critic** $q(s,a; \boldsymbol{\theta})$ that estimates values, and an **actor** $\pi_{\boldsymbol{w}}(s)$ that selects actions. The critic is trained using Bellman targets as in standard fitted Q-iteration. The actor is trained to maximize the critic:

<a id="dfwZrpW92C"></a>

$$
\boldsymbol{w} \leftarrow \boldsymbol{w} + \alpha \mathbb{E}_s \left[\nabla_{\boldsymbol{w}} q(s, \pi_{\boldsymbol{w}}(s); \boldsymbol{\theta})\right],
$$

[(9)](#dfwZrpW92C "Link to this Equation")

where the expectation is over states in the dataset or replay buffer. This gradient ascent pushes the actor toward actions that the critic considers valuable. By the chain rule, this equals $(\nabla_a q(s,a; \boldsymbol{\theta})|_{a=\pi_{\boldsymbol{w}}(s)}) \cdot (\nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}}(s))$, which can be efficiently computed via backpropagation through the composition of the two networks.

<a id="neural-fitted-q-iteration-for-continuous-actions-nfqca"></a>

## Neural Fitted Q-Iteration for Continuous Actions (NFQCA)

How does a fitted-Q batch algorithm change when an actor supplies each continuous maximizing action in the Bellman target?

NFQCA [Hafner & Riedmiller, 2011](https://doi.org/10.1007/s10994-011-5235-x) extends the NFQI template from the [previous chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md) to handle continuous action spaces by replacing the $\max_{a'} q(s',a'; \boldsymbol{\theta})$ operator in the Bellman target with a parameterized policy $\pi_{\boldsymbol{w}}(s')$. This transforms fitted Q-iteration into an actor-critic method: the critic $q(s,a; \boldsymbol{\theta})$ evaluates state-action pairs via the standard regression step, while the actor $\pi_{\boldsymbol{w}}(s)$ provides actions by directly maximizing the learned Q-function.

The algorithm retains the two-level structure of NFQI: an outer loop performs approximate value iteration by computing Bellman targets, and an inner loop fits the Q-function to those targets. NFQCA adds a third component (policy improvement) that updates $\boldsymbol{w}$ to maximize the Q-function over states sampled from the dataset.

<a id="from-discrete-to-continuous-actions"></a>

### From Discrete to Continuous Actions

Recall from the [FQI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md) that NFQI computes Bellman targets using the hard max:

<a id="eh3xOlPmBB"></a>

$$
y_{s,a} = r + \gamma \max_{a' \in \mathcal{A}} q(s',a'; \boldsymbol{\theta}_n)
$$

[(10)](#eh3xOlPmBB "Link to this Equation")

When $\mathcal{A}$ is finite and small, this max is computed by enumeration. When $\mathcal{A}$ is continuous or high-dimensional, enumeration is intractable. NFQCA replaces the max with a parameterized policy that approximately solves the maximization:

<a id="w54PuTfGq3"></a>

$$
y_{s,a} = r + \gamma q(s', \pi_{\boldsymbol{w}_n}(s'); \boldsymbol{\theta}_n)
$$

[(11)](#w54PuTfGq3 "Link to this Equation")

The policy $\pi_{\boldsymbol{w}}(s)$ acts as an **amortized optimizer**: instead of solving $\arg\max_{a'} q(s',a')$ from scratch at each state $s'$ during target computation, we train a neural network to output near-optimal actions directly. The term “amortized” refers to spreading the cost of optimization across training: we pay once to learn $\pi_{\boldsymbol{w}}$, then reuse it for all future target computations.

To train the policy, we maximize the expected Q-value under the distribution of states in the dataset. If we had access to the optimal Q-function $q^*$, we would solve:

<a id="NhpcC0uf4P"></a>

$$
\max_{\boldsymbol{w}} \mathbb{E}_{s \sim \hat{P}_{\mathcal{D}}}[q^*(s, \pi_{\boldsymbol{w}}(s))]
$$

[(12)](#NhpcC0uf4P "Link to this Equation")

where $\hat{P}_{\mathcal{D}}$ is the empirical distribution over states induced by the offline dataset $\mathcal{D}$. In practice, we use the current Q-function approximation $q(s,a; \boldsymbol{\theta}_{n+1})$ after it has been fitted to the latest targets. The expectation is approximated by the sample average over states appearing in $\mathcal{D}$:

<a id="Uv9WffD59z"></a>

$$
\max_{\boldsymbol{w}} \frac{1}{|\mathcal{D}|} \sum_{(s,a,r,s') \in \mathcal{D}} q(s, \pi_{\boldsymbol{w}}(s); \boldsymbol{\theta}_{n+1})
$$

[(13)](#Uv9WffD59z "Link to this Equation")

This policy improvement step runs after the Q-function has been updated, using the newly-fitted critic to guide the actor toward higher-value actions. Both the Q-function fitting and policy improvement use gradient-based optimization on the respective objectives.

<a id="nfqca"></a>

[Algorithm 3](#nfqca "Link to this Algorithm") (Neural Fitted Q-Iteration with Continuous Actions (NFQCA))

**Input:** Dataset $\mathcal{D} = \{(s_i, a_i, r_i, s'_i)\}_{i=1}^N$, Q-function $q(s,a; \boldsymbol{\theta})$, policy $\pi_{\boldsymbol{w}}(s)$, discount factor $\gamma$, learning rates $\alpha_q, \alpha_\pi$, inner optimization steps $K_q, K_\pi$

**Output:** Q-function parameters $\boldsymbol{\theta}$, policy parameters $\boldsymbol{w}$

1.  Initialize $\boldsymbol{\theta}_0$, $\boldsymbol{w}_0$
    
2.  $n \leftarrow 0$
    
3.  **repeat** $\quad$ // **Outer loop: Policy Evaluation and Improvement**
    
4.  $\quad$ **// Construct regression dataset with policy-based Bellman targets**
    
5.  $\quad$ $\mathcal{D}_n^{\text{fit}} \leftarrow \emptyset$
    
6.  $\quad$ **for** each $(s,a,r,s') \in \mathcal{D}$ **do**
    
7.  $\quad\quad$ $a' \leftarrow \pi_{\boldsymbol{w}_n}(s')$ $\quad$ // Actor selects action (replaces max)
    
8.  $\quad\quad$ $y_{s,a} \leftarrow r + \gamma q(s', a'; \boldsymbol{\theta}_n)$ $\quad$ // Critic evaluates
    
9.  $\quad\quad$ $\mathcal{D}_n^{\text{fit}} \leftarrow \mathcal{D}_n^{\text{fit}} \cup \{((s,a), y_{s,a})\}$
    
10.  $\quad$ **// Policy evaluation: fit Q-function to targets**
     
11.  $\quad$ $\boldsymbol{\theta}_{n+1} \leftarrow \texttt{fit}_q(\mathcal{D}_n^{\text{fit}}, \boldsymbol{\theta}_n, K_q, \alpha_q)$
     
12.  $\quad$ **// Policy improvement: maximize Q-function over dataset states**
     
13.  $\quad$ $\boldsymbol{w}_{n+1} \leftarrow \texttt{fit}_\pi(\mathcal{D}, \boldsymbol{w}_n, \boldsymbol{\theta}_{n+1}, K_\pi, \alpha_\pi)$
     
14.  $\quad$ $n \leftarrow n + 1$
     
15.  **until** convergence or $n \geq n_{\max}$
     
16.  **return** $\boldsymbol{\theta}_n$, $\boldsymbol{w}_n$
     

**where:**

-   $\texttt{fit}_q(\mathcal{D}_n^{\text{fit}}, \boldsymbol{\theta}_n, K_q, \alpha_q)$ runs $K_q$ gradient steps minimizing $\frac{1}{|\mathcal{D}_n^{\text{fit}}|} \sum_{((s,a), y) \in \mathcal{D}_n^{\text{fit}}} (q(s,a; \boldsymbol{\theta}) - y)^2$, warm starting from $\boldsymbol{\theta}_n$
    
-   $\texttt{fit}_\pi(\mathcal{D}, \boldsymbol{w}_n, \boldsymbol{\theta}_{n+1}, K_\pi, \alpha_\pi)$ runs $K_\pi$ gradient steps maximizing $\frac{1}{|\mathcal{D}|} \sum_{(s,a,r,s') \in \mathcal{D}} q(s, \pi_{\boldsymbol{w}}(s); \boldsymbol{\theta}_{n+1})$, warm starting from $\boldsymbol{w}_n$
    

The algorithm structure mirrors NFQI ([Algorithm 1](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md#fitted-q-iteration-batch) in the [FQI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md)) with two extensions. First, target computation (line 7-8) replaces the discrete max with a policy network call $\pi_{\boldsymbol{w}_n}(s')$, making the Bellman operator tractable for continuous actions. Second, after fitting the Q-function (line 11), we add a policy improvement step (line 13) that updates $\boldsymbol{w}$ to maximize the Q-function evaluated at policy-generated actions over states in the dataset.

Both `fit` operations use gradient descent with warm starting, consistent with the NFQI template. The Q-function minimizes squared Bellman error using targets computed with the current policy. The policy maximizes the Q-function via gradient ascent on the composition $q(s, \pi_{\boldsymbol{w}}(s); \boldsymbol{\theta}_{n+1})$, which is differentiable end-to-end when both networks are differentiable. The gradient with respect to $\boldsymbol{w}$ is:

<a id="EGeJV1ATKF"></a>

$$
\nabla_{\boldsymbol{w}} q(s, \pi_{\boldsymbol{w}}(s); \boldsymbol{\theta}) = \nabla_a q(s, a; \boldsymbol{\theta})\Big|_{a=\pi_{\boldsymbol{w}}(s)} \cdot \nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}}(s)
$$

[(14)](#EGeJV1ATKF "Link to this Equation")

computed via the chain rule (backpropagation through the actor into the critic). Modern automatic differentiation libraries handle this composition automatically.

<a id="deep-deterministic-policy-gradient-ddpg"></a>

## Deep Deterministic Policy Gradient (DDPG)

How can the batch actor-critic construction collect new transitions and update both networks online?

We now extend NFQCA to the online setting with evolving replay buffers, mirroring how DQN extended NFQI in the [FQI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md). Just as DQN allowed $\mathcal{B}_t$ and $\hat{P}_{\mathcal{B}_t}$ to evolve during learning instead of using a fixed offline dataset, DDPG Lillicrap _et al._, 2015 collects new transitions during training and stores them in a circular replay buffer.

Like DQN, DDPG uses the flattened FQI structure with target networks. But where DQN maintains a single target network $\boldsymbol{\theta}_{\text{target}}$ for the Q-function, DDPG maintains **two** target networks: one for the critic $\boldsymbol{\theta}_{\text{target}}$ and one for the actor $\boldsymbol{w}_{\text{target}}$. Both are updated periodically (every $K$ steps) to mark outer-iteration boundaries, following the same nested-to-flattened transformation shown for DQN.

The online network now plays a triple role in DDPG: (1) the parameters being actively trained ($\boldsymbol{\theta}_t$ for critic, $\boldsymbol{w}_t$ for actor), (2) the policy used to collect new data, and (3) the gradient source for policy improvement. The target networks serve only one purpose: computing stable Bellman targets.

<a id="exploration-via-action-noise"></a>

### Exploration via Action Noise

Since the policy $\pi_{\boldsymbol{w}}(s)$ is deterministic, exploration requires adding noise to actions during data collection:

<a id="NlWdZ6mjme"></a>

$$
a = \pi_{\boldsymbol{w}_t}(s) + \eta_t
$$

[(15)](#NlWdZ6mjme "Link to this Equation")

where $\eta_t$ is exploration noise. The original DDPG paper used an Ornstein-Uhlenbeck (OU) process, which generates temporally correlated noise through the discretized stochastic differential equation:

<a id="YZkQXjwhct"></a>

$$
\eta_{t+1} = \eta_t + \theta(\mu - \eta_t)\Delta t + \sigma\sqrt{\Delta t}\epsilon_t, \quad \epsilon_t \sim \mathcal{N}(0,1)
$$

[(16)](#YZkQXjwhct "Link to this Equation")

where $\mu$ is the long-term mean (typically 0), $\theta$ controls the strength of mean reversion, $\sigma$ scales the random fluctuations, and $\Delta t$ is the time step. The term $\theta(\mu - \eta_t)\Delta t$ acts like damped motion through a viscous fluid: when $\eta_t$ deviates from $\mu$, this force pulls it back smoothly without oscillation. The random term $\sigma\sqrt{\Delta t}\epsilon_t$ adds perturbations, creating noise that wanders but is gently pulled back toward $\mu$. This temporal correlation produces smoother exploration trajectories than independent Gaussian noise.

However, later work (including TD3, discussed below) found that simple uncorrelated Gaussian noise $\eta_t \sim \mathcal{N}(0, \sigma^2)$ works equally well and is easier to tune. The exploration mechanism is orthogonal to the core algorithmic structure.

<a id="ddpg"></a>

[Algorithm 4](#ddpg "Link to this Algorithm") (Deep Deterministic Policy Gradient (DDPG))

**Input:** MDP $(S, \mathcal{A}, P, R, \gamma)$, Q-network $q(s,a; \boldsymbol{\theta})$, policy network $\pi_{\boldsymbol{w}}(s)$, learning rates $\alpha_q, \alpha_\pi$, target update frequency $K$, replay buffer capacity $B$, mini-batch size $b$, exploration noise $\eta$

**Output:** Q-function parameters $\boldsymbol{\theta}$, policy parameters $\boldsymbol{w}$

1.  Initialize $\boldsymbol{\theta}_0$, $\boldsymbol{w}_0$ randomly
    
2.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_0$, $\boldsymbol{w}_{\text{target}} \leftarrow \boldsymbol{w}_0$
    
3.  Initialize replay buffer $\mathcal{B}$ with capacity $B$
    
4.  Initialize exploration noise process $\eta$ (e.g., OU process or Gaussian)
    
5.  $t \leftarrow 0$
    
6.  **while** training **do**
    
    1.  Observe current state $s$
        
    2.  **// Use online network to collect data with exploration noise**
        
    3.  Select action: $a \leftarrow \pi_{\boldsymbol{w}_t}(s) + \eta_t$
        
    4.  Execute $a$, observe reward $r$ and next state $s'$
        
    5.  Store $(s,a,r,s')$ in $\mathcal{B}$, replacing oldest if full
        
    6.  Sample mini-batch of $b$ transitions $\{(s_i,a_i,r_i,s_i')\}_{i=1}^b$ from $\mathcal{B}$
        
    7.  **for** each sampled transition $(s_i,a_i,r_i,s_i')$ **do**
        
        1.  $y_i \leftarrow r_i + \gamma q(s'_i, \pi_{\boldsymbol{w}_{\text{target}}}(s'_i); \boldsymbol{\theta}_{\text{target}})$ $\quad$ // Actor target selects, critic target evaluates
            
    8.  $\boldsymbol{\theta}_{t+1} \leftarrow \boldsymbol{\theta}_t - \alpha_q \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b (q(s_i,a_i;\boldsymbol{\theta}_t) - y_i)^2$
        
    9.  $\boldsymbol{w}_{t+1} \leftarrow \boldsymbol{w}_t + \alpha_\pi \frac{1}{b}\sum_{i=1}^b \nabla_a q(s_i,a;\boldsymbol{\theta}_{t+1})\Big|_{a=\pi_{\boldsymbol{w}_t}(s_i)} \cdot \nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}_t}(s_i)$
        
    10.  **if** $t \bmod K = 0$ **then**
         
         1.  $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_t$
             
         2.  $\boldsymbol{w}_{\text{target}} \leftarrow \boldsymbol{w}_t$
             
    11.  $t \leftarrow t + 1$
         
7.  **return** $\boldsymbol{\theta}_t$, $\boldsymbol{w}_t$
    

The algorithm structure parallels DQN ([Algorithm 5](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md#dqn) in the [FQI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md)) with the continuous-action extensions from NFQCA. Lines 1-5 initialize both networks and their targets, following the same pattern as DQN but with an additional actor network. Line 3 uses the online actor with exploration noise for data collection, replacing DQN’s $\varepsilon$\-greedy selection. Line 7 computes targets using both target networks: the actor target $\pi_{\boldsymbol{w}_{\text{target}}}(s'_i)$ selects the next action, the critic target $q(\cdot; \boldsymbol{\theta}_{\text{target}})$ evaluates it. This replaces the $\max_{a'}$ operator in DQN. Lines 8-9 update both networks: critic via TD error minimization, actor via policy gradient through the updated critic. Line 10 performs periodic hard updates every $K$ steps, marking outer-iteration boundaries.

The policy gradient in line 9 uses the chain rule to backpropagate through the actor-critic composition:

<a id="JHDaX3ELf6"></a>

$$
\nabla_{\boldsymbol{w}} q(s, \pi_{\boldsymbol{w}}(s); \boldsymbol{\theta}) = \nabla_a q(s,a; \boldsymbol{\theta})\Big|_{a=\pi_{\boldsymbol{w}}(s)} \cdot \nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}}(s)
$$

[(17)](#JHDaX3ELf6 "Link to this Equation")

This is identical to the NFQCA gradient, but now computed on mini-batches sampled from an evolving replay buffer rather than a fixed offline dataset. The critic gradient $\nabla_a q(s,a; \boldsymbol{\theta})$ at the policy-generated action provides the direction of steepest ascent in Q-value space, weighted by how sensitive the policy output is to its parameters via $\nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}}(s)$.

<a id="twin-delayed-deep-deterministic-policy-gradient-td3"></a>

## Twin Delayed Deep Deterministic Policy Gradient (TD3)

Which critic and target modifications prevent a deterministic actor from exploiting narrow errors in one learned Q-function?

DDPG inherits the overestimation bias from DQN’s use of the max operator in Bellman targets. TD3 Fujimoto _et al._, 2018 addresses this through three modifications to the DDPG template, following similar principles to Double DQN but adapted for continuous actions and taking a more conservative approach.

<a id="twin-q-networks-and-the-minimum-operator"></a>

### Twin Q-Networks and the Minimum Operator

Recall from the [Monte Carlo chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md) that overestimation arises when we use the same noisy estimate both to select which action looks best and to evaluate that action. Double Q-learning breaks this coupling by maintaining two independent estimators with noise terms $\varepsilon^{(1)}_a$ and $\varepsilon^{(2)}_a$:

<a id="xnRHGm4aqA"></a>

$$
a^\star = \arg\max_{a} \left\{r(s,a) + \gamma \hat{\mu}^{(1)}_N(s,a)\right\}, \quad Y = r(s,a^\star) + \gamma \hat{\mu}^{(2)}_N(s,a^\star).
$$

[(18)](#xnRHGm4aqA "Link to this Equation")

When $\varepsilon^{(1)}$ and $\varepsilon^{(2)}$ are independent, the tower property of conditional expectation gives $\mathbb{E}[\varepsilon^{(2)}_{a^\star} \mid a^\star] = \mathbb{E}[\varepsilon^{(2)}_{a^\star}] = 0$ because $a^\star$ (determined by $\varepsilon^{(1)}$) is independent of $\varepsilon^{(2)}$. This eliminates **evaluation bias**: we no longer use the same positive noise that selected an action to also inflate its value. By conditioning on the selected action and then taking expectations over the independent evaluation noise, the bias in the evaluation term vanishes.

Double DQN ([Algorithm 6](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md#double-dqn)) implements this principle in the discrete action setting by using the online network $\boldsymbol{\theta}_t$ for selection ($a^*_i \leftarrow \arg\max_{a'} q(s_i',a'; \boldsymbol{\theta}_t)$) and the target network $\boldsymbol{\theta}_{\text{target}}$ for evaluation ($y_i \leftarrow r_i + \gamma q(s_i',a^*_i; \boldsymbol{\theta}_{\text{target}})$). Since these networks experience different training noise, their errors are approximately independent, achieving the independence condition needed to eliminate evaluation bias. However, **selection bias** remains: the argmax still picks actions that received positive noise in the selection network, so $\mathbb{E}_{\varepsilon^{(1)}}[\mu(s,a^\star)] \ge \max_a \mu(s,a)$.

TD3 takes a more conservative approach. Instead of decoupling selection from evaluation, TD3 maintains **twin Q-networks** $q^A(s,a; \boldsymbol{\theta}^A)$ and $q^B(s,a; \boldsymbol{\theta}^B)$ trained on the same data with different random initializations. When computing targets, TD3 uses the target policy $\pi_{\boldsymbol{w}_{\text{target}}}(s')$ to select actions (no maximization over a discrete set), then takes the minimum of the two Q-networks’ evaluations:

<a id="clgRJsjWPk"></a>

$$
y_i = r_i + \gamma \min\left(q^A(s'_i, \tilde{a}_i; \boldsymbol{\theta}^A_{\text{target}}), q^B(s'_i, \tilde{a}_i; \boldsymbol{\theta}^B_{\text{target}})\right)
$$

[(19)](#clgRJsjWPk "Link to this Equation")

where $\tilde{a}_i = \pi_{\boldsymbol{w}_{\text{target}}}(s'_i)$. This minimum operation provides a pessimistic estimate: if the two Q-networks have independent errors $q^A(s',a) = q^*(s',a) + \varepsilon^A$ and $q^B(s',a) = q^*(s',a) + \varepsilon^B$, then $\mathbb{E}[\min(q^A, q^B)] \le q^*(s',a)$, producing systematic underestimation rather than overestimation.

The connection to the conditional independence framework is subtle but important. While Double DQN uses independence to eliminate bias in expectation (one network selects, another evaluates), TD3 uses independence to construct a deliberate lower bound. Both approaches rely on maintaining two Q-functions with partially decorrelated errors, achieved through different initializations and stochastic gradients during training, but they aggregate these functions differently. Double DQN’s decoupling targets unbiased estimation by breaking the correlation between selection and evaluation noise. TD3’s minimum operation targets robust estimation by taking the most pessimistic view when the two networks disagree.

This trade-off between bias and robustness is deliberate. In actor-critic methods, the policy gradient pushes toward actions with high Q-values. Overestimation is particularly harmful because it can lead the policy to exploit erroneous high-value regions. Underestimation is generally safer: the policy may ignore some good actions, but it will not be misled into pursuing actions that only appear valuable due to approximation error. The minimum operation implements a “trust the pessimist” principle that complements the policy optimization objective.

TD3 also introduces two additional modifications beyond the clipped double Q-learning. First, target policy smoothing adds clipped noise to the target policy’s actions when computing targets: $\tilde{a} = \pi_{\boldsymbol{w}_{\text{target}}}(s') + \text{clip}(\varepsilon, -c, c)$. This regularization prevents the policy from exploiting narrow peaks in the Q-function approximation error by averaging over nearby actions. Second, delayed policy updates change the actor update frequency: the actor updates every $d$ steps instead of every step. This reduces per-update error by letting the critics converge before the actor adapts to them.

TD3 also replaces DDPG’s hard target updates with **exponential moving average (EMA)** updates, following the smooth update scheme from [Algorithm 4](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md#nfqi-flattened-ema) in the [FQI chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md). Instead of copying $\boldsymbol{\theta}_{\text{target}} \leftarrow \boldsymbol{\theta}_t$ every $K$ steps, EMA smoothly tracks the online network: $\boldsymbol{\theta}_{\text{target}} \leftarrow \tau \boldsymbol{\theta}_t + (1-\tau)\boldsymbol{\theta}_{\text{target}}$ at every update. For small $\tau \in [0.001, 0.01]$, the target lags behind the online network by roughly $1/\tau$ steps, providing smoother learning dynamics.

<a id="td3"></a>

[Algorithm 5](#td3 "Link to this Algorithm") (Twin Delayed Deep Deterministic Policy Gradient (TD3))

**Input:** MDP $(S, \mathcal{A}, P, R, \gamma)$, twin Q-networks $q^A(s,a; \boldsymbol{\theta}^A)$, $q^B(s,a; \boldsymbol{\theta}^B)$, policy network $\pi_{\boldsymbol{w}}(s)$, learning rates $\alpha_q, \alpha_\pi$, replay buffer capacity $B$, mini-batch size $b$, policy delay $d$, EMA rate $\tau$, target noise $\sigma$, noise clip $c$, exploration noise $\sigma_{\text{explore}}$

**Output:** Twin Q-function parameters $\boldsymbol{\theta}^A, \boldsymbol{\theta}^B$, policy parameters $\boldsymbol{w}$

1.  Initialize $\boldsymbol{\theta}^A_0$, $\boldsymbol{\theta}^B_0$, $\boldsymbol{w}_0$ randomly
    
2.  $\boldsymbol{\theta}^A_{\text{target}} \leftarrow \boldsymbol{\theta}^A_0$, $\boldsymbol{\theta}^B_{\text{target}} \leftarrow \boldsymbol{\theta}^B_0$, $\boldsymbol{w}_{\text{target}} \leftarrow \boldsymbol{w}_0$
    
3.  Initialize replay buffer $\mathcal{B}$ with capacity $B$
    
4.  $t \leftarrow 0$
    
5.  **while** training **do**
    
    1.  Observe current state $s$
        
    2.  **// Data collection with exploration noise**
        
    3.  Select action: $a \leftarrow \pi_{\boldsymbol{w}_t}(s) + \varepsilon$, where $\varepsilon \sim \mathcal{N}(0, \sigma_{\text{explore}}^2)$
        
    4.  Execute $a$, observe reward $r$ and next state $s'$
        
    5.  Store $(s,a,r,s')$ in $\mathcal{B}$, replacing oldest if full
        
    6.  Sample mini-batch of $b$ transitions $\{(s_i,a_i,r_i,s_i')\}_{i=1}^b$ from $\mathcal{B}$
        
    7.  **// Compute targets with clipped double Q-learning**
        
    8.  **for** each sampled transition $(s_i,a_i,r_i,s_i')$ **do**
        
        1.  $\tilde{a}_i \leftarrow \pi_{\boldsymbol{w}_{\text{target}}}(s'_i) + \text{clip}(\varepsilon_i, -c, c)$, $\varepsilon_i \sim \mathcal{N}(0, \sigma^2)$ $\quad$ // Target policy smoothing
            
        2.  $y_i \leftarrow r_i + \gamma \color{blue}{\min\big(q^A(s'_i, \tilde{a}_i; \boldsymbol{\theta}^A_{\text{target}}), q^B(s'_i, \tilde{a}_i; \boldsymbol{\theta}^B_{\text{target}})\big)}$ $\quad$ // Minimum of twin targets
            
    9.  **// Update both Q-networks toward same targets**
        
    10.  $\boldsymbol{\theta}^A_{t+1} \leftarrow \boldsymbol{\theta}^A_t - \alpha_q \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b(q^A(s_i,a_i;\boldsymbol{\theta}^A_t) - y_i)^2$
         
    11.  $\boldsymbol{\theta}^B_{t+1} \leftarrow \boldsymbol{\theta}^B_t - \alpha_q \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b(q^B(s_i,a_i;\boldsymbol{\theta}^B_t) - y_i)^2$
         
    12.  **// Delayed policy update and target network updates**
         
    13.  **if** $t \bmod d = 0$ **then**
         
         1.  $\boldsymbol{w}_{t+1} \leftarrow \boldsymbol{w}_t + \alpha_\pi \frac{1}{b}\sum_{i=1}^b \nabla_a q^A(s_i,a;\boldsymbol{\theta}^A_{t+1})\Big|_{a=\pi_{\boldsymbol{w}_t}(s_i)} \cdot \nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}_t}(s_i)$
             
         2.  $\boldsymbol{\theta}^A_{\text{target}} \leftarrow \tau\boldsymbol{\theta}^A_{t+1} + (1-\tau)\boldsymbol{\theta}^A_{\text{target}}$ (EMA update)
             
         3.  $\boldsymbol{\theta}^B_{\text{target}} \leftarrow \tau\boldsymbol{\theta}^B_{t+1} + (1-\tau)\boldsymbol{\theta}^B_{\text{target}}$
             
         4.  $\boldsymbol{w}_{\text{target}} \leftarrow \tau\boldsymbol{w}_{t+1} + (1-\tau)\boldsymbol{w}_{\text{target}}$
             
    14.  $t \leftarrow t + 1$
         
6.  **return** $\boldsymbol{\theta}^A_t$, $\boldsymbol{\theta}^B_t$, $\boldsymbol{w}_t$
    

The algorithm structure parallels Double DQN but with continuous actions. Lines 8.1-8.2 implement clipped double Q-learning: smoothing adds noise to target actions (preventing exploitation of Q-function artifacts), and the min operation (highlighted in blue) provides pessimistic value estimates. Both critics update toward the same shared target (lines 10-11), but their different initializations and stochastic gradient noise keep their errors partially decorrelated, following the same principle underlying Double DQN’s independence assumption. Line 13 gates policy updates to every $d$ steps (typically $d=2$), and lines 13.2-13.4 use EMA updates following [Algorithm 4](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md#nfqi-flattened-ema).

TD3 simplifies exploration by replacing DDPG’s Ornstein-Uhlenbeck process with uncorrelated Gaussian noise $\varepsilon \sim \mathcal{N}(0, \sigma_{\text{explore}}^2)$ (line 5.3). This eliminates the need to tune multiple OU parameters while providing equally effective exploration.

<a id="summary-and-outlook"></a>

## Summary and Outlook

Continuous actions turn the maximization inside each fitted Q target into a nonlinear optimization problem. NFQCA learns an actor to amortize that search; DDPG carries the same actor-critic structure online; TD3 adds twin critics, target smoothing, and delayed actor updates to reduce exploitation of critic error.

The actor updates above differentiate through a learned critic. Which gradient estimators remain available when actions or trajectories themselves are random? [Gradient estimation for stochastic objectives](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/25-gradient-estimation.md) separates score-function and reparameterization estimators before they are used for policy learning.

<a id="self-checks"></a>

## Self-checks

<a id="ex-amortization-check-1"></a>

[Exercise 1](#ex-amortization-check-1 "Link to this Exercise") (What is amortized?)

In continuous-action control, what repeated computation is replaced by a learned actor?

Solution to [Exercise 1](#ex-amortization-check-1)

The actor replaces solving $\arg\max_a q(s,a)$ anew at every state with one learned forward mapping from state to action.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-Hafner2011"></a>
2.  Hafner, R., & Riedmiller, M. (2011). Reinforcement learning in feedback control: Challenges and benchmarks from technical process control. _Machine Learning_, _84_(1–2), 137–169. [10.1007/s10994-011-5235-x](https://doi.org/10.1007/s10994-011-5235-x)
<a id="cite-lillicrap2015continuous"></a>
4.  Lillicrap, T. P., Hunt, J. J., Pritzel, A., Heess, N., Erez, T., Tassa, Y., Silver, D., & Wierstra, D. (2015). Continuous Control with Deep Reinforcement Learning. _arXiv Preprint arXiv:1509.02971_.
<a id="cite-fujimoto2018addressing"></a>
6.  Fujimoto, S., Hoof, H., & Meger, D. (2018). Addressing Function Approximation Error in Actor-Critic Methods. _International Conference on Machine Learning (ICML)_, 1587–1596.

[

Approximate Value Methods

Fitted Q-Iteration and DQN


](23-fitted-q-iteration.md)[

Parameterized Policy Optimization

Gradient Estimation for Stochastic Objectives


](25-gradient-estimation.md)

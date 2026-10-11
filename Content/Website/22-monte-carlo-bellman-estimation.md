> **Cours de Pierre-Luc Bacon — 22.** [Page publiée](https://pierrelucbacon.com/rlbook/monte-carlo-bellman-estimation) · [Source numérotée](../22-monte-carlo-bellman-estimation.md)
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

Unlike deterministic quadrature, which introduces a fixed bias at each iteration, Monte Carlo introduces random error with zero mean but nonzero variance. However, combining Monte Carlo with the maximization in the Bellman operator creates a systematic problem: while the estimate of the expected return for any individual action is unbiased, taking the maximum over these noisy estimates introduces upward bias. This overestimation compounds through value iteration and degrades the resulting policies. We address this challenge in the [next chapter on fitted Q-iteration](23-fitted-q-iteration.md).

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

This inequality also underlies why deterministic policies are optimal in MDPs ([Theorem 2](16-stochastic-dp.md#stoch-policy-reduction)): $\max_a w(a) \ge \sum_a q(a) w(a)$ shows randomization cannot improve expected returns. The same mathematical principle appears in two contexts: (1) deterministic policies suffice, (2) maximization over noisy estimates creates upward bias.

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

An alternative to explicit bias correction is to replace the hard max operator with a soft maximum. The [regularized MDP chapter](19-regularized-dp.md) discusses smooth Bellman operators that use logsumexp or Gaussian uncertainty-weighted aggregation to avoid the discontinuity and overestimation inherent in taking a hard maximum. These approaches modify the Bellman operator itself rather than correcting its bias after the fact, preserving squared error loss while constructing smoother targets. Another approach, examined in the [next chapter](23-fitted-q-iteration.md), changes the loss function itself to match the noise structure in TD targets.

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

The conceptual framework above assumes we can draw multiple independent samples from $p(\cdot|s,a)$ for each state-action pair. In practice, this would require resetting a simulator to the same state and sampling multiple times, which is often infeasible. The practical implementation achieves the same effect differently: maintain two Q-functions that are trained on different data or updated at different times (e.g., one is a slowly-updating target network). Since the two Q-functions experience different noise realizations during training, their errors remain less correlated than if we used a single Q-function for both selection and evaluation. This is how Double DQN works, as developed in the [FQI chapter](23-fitted-q-iteration.md#double-deep-q-network-double-dqn).

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

The weighted estimator relates to the smooth Bellman operators discussed in the [regularized MDP chapter](19-regularized-dp.md). Both replace the discontinuous hard maximum with smooth aggregation, but weighted estimation adapts to state-action-specific uncertainty while logsumexp applies uniform smoothing via temperature. The choice among ME, DE, and WE depends on computational constraints and problem characteristics. When variance estimates are available and action spaces are small, WE offers a principled approach that balances the extremes of overestimation and underestimation. When maintaining variance is expensive or action spaces are large, double Q-learning provides a simpler alternative that eliminates evaluation bias without explicit probability weighting.

<a id="summary-and-forward-look"></a>

## Summary and Forward Look

This chapter developed the simulation-based approach to approximate dynamic programming by replacing analytical integration with Monte Carlo sampling. We showed how deterministic quadrature rules give way to randomized estimation when transition densities are expensive to evaluate or the state space is high-dimensional. We need only the ability to **sample** from transition distributions, not to compute their densities explicitly.

Three foundational components emerged:

1.  **Monte Carlo Bellman operator**: Replace exact expectations $\int v(s')p(ds'|s,a)$ with sample averages $\frac{1}{N}\sum v(s'_i)$, typically with $N=1$ in practice
    
2.  **Q-functions**: Cache state-action values to amortize the cost of action selection, eliminating the need for repeated sampling at decision time
    
3.  **Bias mitigation**: Address the systematic overestimation that arises from maximizing over noisy estimates through four approaches: learning empirical corrections (Keane-Wolpin), analytical adjustment from extreme value theory (Lee-Powell), decoupling selection from evaluation (double Q-learning), and probability-weighted aggregation (weighted estimators)
    

The algorithms presented here still assume that repeated samples can be drawn from each state-action pair and that optimization budgets are unconstrained. What changes when each stored transition contains one realized successor and a function approximator must be fitted from a finite buffer? [Fitted Q-iteration and DQN](23-fitted-q-iteration.md) make those data and optimization choices explicit.

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

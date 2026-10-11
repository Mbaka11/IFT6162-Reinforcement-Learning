# IFT-6.2.rl — Document 04 — Chapitres 25 à 31

Texte pédagogique de Pierre-Luc Bacon ; copie organisée pour l’auto-apprentissage. Ce document contient les pages complètes extraites du site, sans résumé de remplacement. Consulter les titres « CHAPITRE NN » pour retrouver leur numéro exact.

Sommaire général : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/ChatGPT/COURSE_INDEX.md



---

# CHAPITRE 25 — Gradient Estimation for Stochastic Objectives

Section du livre : Parameterized Policy Optimization

Page originale : https://pierrelucbacon.com/rlbook/gradient-estimation

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/25-gradient-estimation.md

> **Cours de Pierre-Luc Bacon — 25.** [Page publiée](https://pierrelucbacon.com/rlbook/gradient-estimation) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/25-gradient-estimation.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Gradient Estimation for Stochastic Objectives

<a id="skip-to-article"></a>

The previous chapter differentiated a deterministic actor through a learned critic. Stochastic policies and stochastic objectives add a sampled variable between the parameters and the outcome. How can the derivative of an expectation be estimated from those samples?

Two constructions answer the question. Score-function estimators differentiate the log density of the sample, while reparameterization differentiates a sampled outcome written as a function of parameter-free noise.

<a id="learning-goals"></a>

## Learning Goals

After reading this chapter, you should be able to:

-   derive score-function and reparameterization estimators for a stochastic objective;
    
-   identify the assumptions that make each estimator unbiased;
    
-   compare estimator bias and variance in a controlled numerical experiment.
    

<a id="prerequisites"></a>

## Prerequisites

The chapter assumes familiarity with expectations, probability densities, and multivariate differentiation. [Monte Carlo Bellman Estimation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/22-monte-carlo-bellman-estimation.md) reviews sample averages and their variance.

<a id="derivative-estimation-for-stochastic-optimization"></a>

## Derivative Estimation for Stochastic Optimization

When an objective averages over a parameter-dependent distribution, can its gradient be moved inside the expectation without differentiating the sampling operation directly?

Consider optimizing an objective that involves an expectation:

<a id="lNlfeHihfV"></a>

$$
J(\theta) = \mathbb{E}_{x \sim p(x;\theta)}[f(x,\theta)]
$$

[(1)](#lNlfeHihfV "Link to this Equation")

For concreteness, consider a simple example where $x \sim \mathcal{N}(\theta,1)$ and $f(x,\theta) = x^2\theta$. The derivative we seek is:

<a id="EFX785l7ts"></a>

$$
\frac{d}{d\theta}J(\theta) = \frac{d}{d\theta}\int x^2\theta p(x;\theta)dx
$$

[(2)](#EFX785l7ts "Link to this Equation")

While we can compute this exactly for the Gaussian example, this is often impossible for more general problems. We might then be tempted to approximate our objective using samples:

<a id="HfIzMqZibp"></a>

$$
J(\theta) \approx \frac{1}{N}\sum_{i=1}^N f(x_i,\theta), \quad x_i \sim p(x;\theta)
$$

[(3)](#HfIzMqZibp "Link to this Equation")

Then differentiate this approximation:

<a id="uibRtIDo9r"></a>

$$
\frac{d}{d\theta}J(\theta) \approx \frac{1}{N}\sum_{i=1}^N \frac{\partial}{\partial \theta}f(x_i,\theta)
$$

[(4)](#uibRtIDo9r "Link to this Equation")

However, this naive approach ignores that the samples themselves depend on $\theta$. The correct derivative requires the product rule:

<a id="Lq7IJemKqF"></a>

$$
\frac{d}{d\theta}J(\theta) = \int \frac{\partial}{\partial \theta}[f(x,\theta)p(x;\theta)]dx = \int \left[\frac{\partial f}{\partial \theta}p(x;\theta) + f(x,\theta)\frac{\partial p(x;\theta)}{\partial \theta}\right]dx
$$

[(5)](#Lq7IJemKqF "Link to this Equation")

While the first term could be numerically integrated using Monte Carlo, the second one cannot as it is not in the form of an expectation.

To transform our objective so that the Monte Carlo estimator for the objective could be differentiated directly while ensuring that the resulting derivative is unbiased, there are two main solutions: a change of measure, or a change of variables.

<a id="the-likelihood-ratio-method"></a>

### The Likelihood Ratio Method

One solution comes from rewriting our objective using a proposal distribution $q(x)$ that does not depend on $\theta$:

<a id="v2RgW8XunK"></a>

$$
J(\theta) = \int f(x,\theta)\frac{p(x;\theta)}{q(x)}q(x)dx = \mathbb{E}_{x \sim q(x)}\left[f(x,\theta)\frac{p(x;\theta)}{q(x)}\right]
$$

[(6)](#v2RgW8XunK "Link to this Equation")

Define the likelihood ratio $\rho(x, q, \theta) \equiv \frac{p(x;\theta)}{q(x)}$, where we treat $q$ as a separate argument. The objective becomes:

<a id="hwF0ikvUK2"></a>

$$
J(\theta) = \mathbb{E}_{x \sim q(x)}[f(x,\theta)\rho(x, q, \theta)]
$$

[(7)](#hwF0ikvUK2 "Link to this Equation")

When we differentiate $J$, we take the partial derivative with respect to $\theta$ while holding $q$ fixed (since $q$ does not depend on $\theta$):

<a id="TL1hTIq0gr"></a>

$$
\frac{d}{d\theta}J(\theta) = \mathbb{E}_{x \sim q(x)}\left[f(x,\theta)\frac{\partial \rho}{\partial \theta}(x, q, \theta) + \rho(x, q, \theta)\frac{\partial f}{\partial \theta}(x,\theta)\right]
$$

[(8)](#TL1hTIq0gr "Link to this Equation")

The partial derivative of $\rho$ with respect to $\theta$ (treating $q$ as fixed) is:

<a id="n5xNGyj1Yg"></a>

$$
\frac{\partial \rho}{\partial \theta}(x, q, \theta) = \frac{1}{q(x)}\frac{\partial p(x;\theta)}{\partial \theta} = \rho(x, q, \theta)\frac{\partial \log p(x;\theta)}{\partial \theta}
$$

[(9)](#n5xNGyj1Yg "Link to this Equation")

Now fix any reference parameter $\theta_0$ and choose the proposal distribution $q(x) = p(x;\theta_0)$. This is a _fixed_ distribution that does not change as $\theta$ varies. We simply evaluate the family $p(x;\cdot)$ at the specific point $\theta_0$. With this choice, evaluating the gradient at $\theta = \theta_0$ gives $\rho(x, q, \theta_0) = p(x;\theta_0)/p(x;\theta_0) = 1$. The gradient formula becomes:

<a id="pBg8I3bWcs"></a>

$$
\frac{d}{d\theta}J(\theta)\Big|_{\theta=\theta_0} = \mathbb{E}_{x \sim p(x;\theta_0)}\left[f(x,\theta_0)\frac{\partial \log p(x;\theta)}{\partial \theta}\Big|_{\theta_0} + \frac{\partial f(x,\theta)}{\partial \theta}\Big|_{\theta_0}\right]
$$

[(10)](#pBg8I3bWcs "Link to this Equation")

Since $\theta_0$ is arbitrary, we can drop the subscript and write the **score function estimator** as:

<a id="XpDzLZn13n"></a>

$$
\frac{d}{d\theta}J(\theta) = \mathbb{E}_{x \sim p(x;\theta)}\left[f(x,\theta)\frac{\partial \log p(x;\theta)}{\partial \theta} + \frac{\partial f(x,\theta)}{\partial \theta}\right]
$$

[(11)](#XpDzLZn13n "Link to this Equation")

<a id="the-reparameterization-trick"></a>

### The Reparameterization Trick

An alternative approach eliminates the $\theta$\-dependence in the sampling distribution by expressing $x$ through a deterministic transformation of the noise:

<a id="Z3ZjpAR2jg"></a>

$$
x = g(\epsilon,\theta), \quad \epsilon \sim q(\epsilon)
$$

[(12)](#Z3ZjpAR2jg "Link to this Equation")

Therefore if we want to sample from some target distribution $p(x;\theta)$, we can do so by first sampling from a simple base distribution $q(\epsilon)$ (like a standard normal) and then transforming those samples through a carefully chosen function $g$. If $g(\cdot,\theta)$ is invertible, the change of variables formula tells us how these distributions relate:

<a id="CnGnEPXqda"></a>

$$
p(x;\theta) = q(g^{-1}(x,\theta))\left|\det\frac{\partial g^{-1}(x,\theta)}{\partial x}\right| = q(\epsilon)\left|\det\frac{\partial g(\epsilon,\theta)}{\partial \epsilon}\right|^{-1}
$$

[(13)](#CnGnEPXqda "Link to this Equation")

For example, if we want to sample from any multivariate Gaussian distributions with covariance matrix $\Sigma$ and mean $\mu$, it suffices to be able to sample from a standard normal noise and compute the linear transformation:

<a id="pSRTqoaplV"></a>

$$
x = \mu + \Sigma^{1/2}\epsilon, \quad \epsilon \sim \mathcal{N}(0,I)
$$

[(14)](#pSRTqoaplV "Link to this Equation")

where $\Sigma^{1/2}$ is the matrix square root obtained via Cholesky decomposition. In the univariate case, this transformation is simply:

<a id="QJQhfHbXnA"></a>

$$
x = \mu + \sigma \epsilon, \quad \epsilon \sim \mathcal{N}(0,1)
$$

[(15)](#QJQhfHbXnA "Link to this Equation")

where $\sigma = \sqrt{\sigma^2}$ is the standard deviation (square root of the variance).

<a id="common-examples-of-reparameterization"></a>

#### Common Examples of Reparameterization

<a id="the-truncated-normal-distribution"></a>

##### The Truncated Normal Distribution

When we need samples constrained to an interval $[a,b]$, we can use the truncated normal distribution. To sample from it, we transform uniform noise through the inverse cumulative distribution function (CDF) of the standard normal:

<a id="KHBHRABp4f"></a>

$$
x = \Phi^{-1}(u\Phi(b) + (1-u)\Phi(a)), \quad u \sim \text{Uniform}(0,1)
$$

[(16)](#KHBHRABp4f "Link to this Equation")

Here:

-   $\Phi(z) = \frac{1}{2}\left[1 + \text{erf}\left(\frac{z}{\sqrt{2}}\right)\right]$ is the CDF of the standard normal distribution
    
-   $\Phi^{-1}$ is its inverse (the quantile function)
    
-   $\text{erf}(z) = \frac{2}{\sqrt{\pi}}\int_0^z e^{-t^2}dt$ is the error function
    

The resulting samples follow a normal distribution restricted to $[a,b]$, with the density properly normalized over this interval.

<a id="the-kumaraswamy-distribution"></a>

##### The Kumaraswamy Distribution

When we need samples in the unit interval \[0,1\], a natural choice might be the Beta distribution. However, its inverse CDF doesn’t have a closed form. Instead, we can use the Kumaraswamy distribution as a convenient approximation, which allows for a simple reparameterization:

<a id="tHnb0XFktX"></a>

$$
x = (1-(1-u^{\alpha})^{1/\beta}), \quad u \sim \text{Uniform}(0,1)
$$

[(17)](#tHnb0XFktX "Link to this Equation")

where:

-   $\alpha, \beta > 0$ are shape parameters that control the distribution
    
-   $\alpha$ determines the concentration around 0
    
-   $\beta$ determines the concentration around 1
    
-   The distribution is similar to Beta(α,β) but with analytically tractable CDF and inverse CDF
    

The Kumaraswamy distribution has density:

<a id="OvXko7Uuli"></a>

$$
f(x; \alpha, \beta) = \alpha\beta x^{\alpha-1}(1-x^{\alpha})^{\beta-1}, \quad x \in [0,1]
$$

[(18)](#OvXko7Uuli "Link to this Equation")

<a id="the-gumbel-softmax-distribution"></a>

##### The Gumbel-Softmax Distribution

When sampling from a categorical distribution with probabilities $\{\pi_i\}$, one approach uses $\text{Gumbel}(0,1)$ noise combined with the argmax of log-perturbed probabilities:

<a id="msS289umD9"></a>

$$
\text{argmax}_i(\log \pi_i + g_i), \quad g_i \sim \text{Gumbel}(0,1)
$$

[(19)](#msS289umD9 "Link to this Equation")

This approach, known in machine learning as the Gumbel-Max trick, relies on sampling Gumbel noise from uniform random variables through the transformation $g_i = -\log(-\log(u_i))$ where $u_i \sim \text{Uniform}(0,1)$. To see why this gives us samples from the categorical distribution, consider the probability of selecting category $i$:

<a id="ALDiGghrzN"></a>

$$
\begin{align*}
P(\text{argmax}_j(\log \pi_j + g_j) = i) &= P(\log \pi_i + g_i > \log \pi_j + g_j \text{ for all } j \neq i) \\
&= P(g_i - g_j > \log \pi_j - \log \pi_i \text{ for all } j \neq i)
\end{align*}
$$

[(20)](#ALDiGghrzN "Link to this Equation")

Since the difference of two Gumbel random variables follows a logistic distribution, $g_i - g_j \sim \text{Logistic}(0,1)$, and these differences are independent for different $j$ (due to the independence of the original Gumbel variables), we can write:

<a id="g9O4gpdn5h"></a>

$$
\begin{align*}
P(\text{argmax}_j(\log \pi_j + g_j) = i) &= \prod_{j \neq i} P(g_i - g_j > \log \pi_j - \log \pi_i) \\
&= \prod_{j \neq i} \frac{\pi_i}{\pi_i + \pi_j} = \pi_i
\end{align*}
$$

[(21)](#g9O4gpdn5h "Link to this Equation")

The last equality requires some additional algebra to show, but follows from the fact that these probabilities must sum to 1 over all $i$.

While we have shown that the Gumbel-Max trick gives us exact samples from a categorical distribution, the argmax operation isn’t differentiable. For stochastic optimization problems of the form:

<a id="GWVoseOyuF"></a>

$$
\mathbb{E}_{x \sim p(x;\theta)}[f(x)] = \mathbb{E}_{\epsilon \sim \text{Gumbel}(0,1)}[f(g(\epsilon,\theta))]
$$

[(22)](#GWVoseOyuF "Link to this Equation")

we need $g$ to be differentiable with respect to $\theta$. This leads us to consider a continuous relaxation where we replace the hard argmax with a temperature-controlled softmax:

<a id="ZyGqMzh1Sj"></a>

$$
z_i = \frac{\exp((\log \pi_i + g_i)/\tau)}{\sum_j \exp((\log \pi_j + g_j)/\tau)}
$$

[(23)](#ZyGqMzh1Sj "Link to this Equation")

As $\tau \to 0$, this approximation approaches the argmax:

<a id="rWwM6J5dG4"></a>

$$
\lim_{\tau \to 0} \frac{\exp(x_i/\tau)}{\sum_j \exp(x_j/\tau)} = \begin{cases} 1 & \text{if } x_i = \max_j x_j \\ 0 & \text{otherwise} \end{cases}
$$

[(24)](#rWwM6J5dG4 "Link to this Equation")

The resulting distribution over the probability simplex is called the Gumbel-Softmax (or Concrete) distribution. The temperature parameter $\tau$ controls the discreteness of our samples: smaller values give samples closer to one-hot vectors but with less stable gradients, while larger values give smoother gradients but more diffuse samples.

<a id="numerical-analysis-of-gradient-estimators"></a>

### Numerical Analysis of Gradient Estimators

Let us examine the behavior of our three gradient estimators for the stochastic optimization objective:

<a id="vsnKW0gYf2"></a>

$$
J(\theta) = \mathbb{E}_{x \sim \mathcal{N}(\theta,1)}[x^2\theta]
$$

[(25)](#vsnKW0gYf2 "Link to this Equation")

To get an analytical expression for the derivative, first note that we can factor out $\theta$ to obtain $J(\theta) = \theta\mathbb{E}[x^2]$ where $x \sim \mathcal{N}(\theta,1)$. By definition of the variance, we know that $\text{Var}(x) = \mathbb{E}[x^2] - (\mathbb{E}[x])^2$, which we can rearrange to $\mathbb{E}[x^2] = \text{Var}(x) + (\mathbb{E}[x])^2$. Since $x \sim \mathcal{N}(\theta,1)$, we have $\text{Var}(x) = 1$ and $\mathbb{E}[x] = \theta$, therefore $\mathbb{E}[x^2] = 1 + \theta^2$. This gives us:

<a id="AJaw8BH6zx"></a>

$$
J(\theta) = \theta(1 + \theta^2)
$$

[(26)](#AJaw8BH6zx "Link to this Equation")

Now differentiating with respect to $\theta$ using the product rule yields:

<a id="EWimPp2dwl"></a>

$$
\frac{d}{d\theta}J(\theta) = 1 + 3\theta^2
$$

[(27)](#EWimPp2dwl "Link to this Equation")

For concreteness, we fix $\theta = 1.0$ and analyze samples drawn using Monte Carlo estimation with batch size 1000 and 1000 independent trials. Evaluating at $\theta = 1$ gives us $\frac{d}{d\theta}J(\theta)\big|_{\theta=1} = 1 + 3(1)^2 = 4$, which serves as our ground truth against which we compare our estimators:

1.  First, we consider the naive estimator that incorrectly differentiates the Monte Carlo approximation:
    
    <a id="jCpKv1g5HW"></a>
    
    $$
    \hat{g}_{\text{naive}}(\theta) = \frac{1}{N}\sum_{i=1}^N x_i^2
    $$
    
    [(28)](#jCpKv1g5HW "Link to this Equation")
    
    For $x \sim \mathcal{N}(1,1)$, we have $\mathbb{E}[x^2] = \theta^2 + 1 = 2.0$ and $\mathbb{E}[\hat{g}_{\text{naive}}] = 2.0$. We should therefore expect a bias of about \-2 in our experiment.
    
2.  Then we compute the score function estimator:
    
    <a id="AyNud5YHd6"></a>
    
    $$
    \hat{g}_{\text{SF}}(\theta) = \frac{1}{N}\sum_{i=1}^N \left[x_i^2\theta(x_i - \theta) + x_i^2\right]
    $$
    
    [(29)](#AyNud5YHd6 "Link to this Equation")
    
    This estimator is unbiased with $\mathbb{E}[\hat{g}_{\text{SF}}] = 4$
    
3.  Finally, through the reparameterization $x = \theta + \epsilon$ where $\epsilon \sim \mathcal{N}(0,1)$, we obtain:
    
    <a id="uLD8SfNdlX"></a>
    
    $$
    \hat{g}_{\text{RT}}(\theta) = \frac{1}{N}\sum_{i=1}^N \left[2\theta(\theta + \epsilon_i) + (\theta + \epsilon_i)^2\right]
    $$
    
    [(30)](#uLD8SfNdlX "Link to this Equation")
    
    This estimator is also unbiased with $\mathbb{E}[\hat{g}_{\text{RT}}] = 4$.
    

<a id="sXDNdLQU4z"></a>

Source

```python
%config InlineBackend.figure_format = 'retina'
import jax
import jax.numpy as jnp
import altair as alt
import numpy as np
import pandas as pd

key = jax.random.PRNGKey(0)

# Define the objective function f(x,θ) = x²θ where x ~ N(θ, 1)
def objective(x, theta):
    return x**2 * theta

# Naive Monte Carlo gradient estimation
@jax.jit
def naive_gradient_batch(key, theta):
    samples = jax.random.normal(key, (1000,)) + theta
    # Use jax.grad on the objective with respect to theta
    grad_fn = jax.grad(lambda t: jnp.mean(objective(samples, t)))
    return grad_fn(theta)

# Score function estimator (REINFORCE)
@jax.jit
def score_function_batch(key, theta):
    samples = jax.random.normal(key, (1000,)) + theta
    # f(x,θ) * ∂logp(x|θ)/∂θ + ∂f(x,θ)/∂θ
    # score function for N(θ,1) is (x-θ)
    score = samples - theta
    return jnp.mean(objective(samples, theta) * score + samples**2)

# Reparameterization gradient
@jax.jit
def reparam_gradient_batch(key, theta):
    eps = jax.random.normal(key, (1000,))
    # Use reparameterization x = θ + ε, ε ~ N(0,1)
    grad_fn = jax.grad(lambda t: jnp.mean(objective(t + eps, t)))
    return grad_fn(theta)

# Run trials
n_trials = 1000
theta = 1.0
true_grad = 1 + 3 * theta**2

keys = jax.random.split(key, n_trials)
naive_estimates = jnp.array([naive_gradient_batch(k, theta) for k in keys])
score_estimates = jnp.array([score_function_batch(k, theta) for k in keys])
reparam_estimates = jnp.array([reparam_gradient_batch(k, theta) for k in keys])

# Print statistics
methods = {
    'Naive': naive_estimates,
    'Score Function': score_estimates, 
    'Reparameterization': reparam_estimates
}

for name, estimates in methods.items():
    bias = jnp.mean(estimates) - true_grad
    variance = jnp.var(estimates)
    print(f"\n{name}:")
    print(f"Mean: {jnp.mean(estimates):.6f}")
    print(f"Bias: {bias:.6f}")
    print(f"Variance: {variance:.6f}")
    print(f"MSE: {bias**2 + variance:.6f}")

gradient_data = pd.concat(
    [
        pd.DataFrame({
            "Estimator": name,
            "Gradient estimate": np.asarray(estimates),
        })
        for name, estimates in methods.items()
    ],
    ignore_index=True,
)
estimator_pick = alt.selection_point(fields=["Estimator"], bind="legend")

density = (
    alt.Chart(gradient_data)
    .transform_density(
        "Gradient estimate",
        as_=["Gradient estimate", "Density"],
        groupby=["Estimator"],
    )
    .mark_area(opacity=0.45, line=True)
    .encode(
        x=alt.X("Gradient estimate:Q", title="Gradient estimate"),
        y=alt.Y("Density:Q", stack=None),
        color=alt.Color("Estimator:N", legend=alt.Legend(orient="top")),
        opacity=alt.condition(estimator_pick, alt.value(0.55), alt.value(0.08)),
        tooltip=["Estimator:N"],
    )
    .add_params(estimator_pick)
)

truth = (
    alt.Chart(pd.DataFrame({"True gradient": [true_grad]}))
    .mark_rule(color="#b91c1c", strokeDash=[6, 4], size=2)
    .encode(x="True gradient:Q")
)

(density + truth).properties(
    height=340,
    title=f"Gradient estimator distributions (θ={theta}, true gradient={true_grad:.2f})",
)
```

```

Naive:
Mean: 2.000417
Bias: -1.999583
Variance: 0.005933
MSE: 4.004266

Score Function:
Mean: 3.996162
Bias: -0.003838
Variance: 0.057295
MSE: 0.057309

Reparameterization:
Mean: 3.999940
Bias: -0.000060
Variance: 0.017459
MSE: 0.017459
```

Loading...

The numerical experiments corroborate our theory. The naive estimator consistently underestimates the true gradient by 2.0, though it maintains a relatively small variance. This systematic bias would make it unsuitable for optimization despite its low variance. The score function estimator corrects this bias but introduces substantial variance. While unbiased, this estimator would require many samples to achieve reliable gradient estimates. Finally, the reparameterization trick achieves a much lower variance while remaining unbiased. While this experiment is for didactic purposes only, it reproduces what is commonly found in practice: that when applicable, the reparameterization estimator tends to perform better than the score function counterpart.

<a id="summary-and-outlook"></a>

## Summary and Outlook

The score-function identity differentiates a log density and applies even when the sampled variable is discrete, but its variance can be large. Reparameterization differentiates the sampled outcome with respect to its parameters and usually has lower variance, but it requires a differentiable sampling path. The numerical comparison separates those variance and bias properties directly.

Entropy-regularized continuous control requires both sampled actions and a learned value signal. Can these estimators train a stochastic actor while avoiding an intractable integral over actions? [Regularized and residual-based policy learning](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/26-regularized-policy-learning.md) develops SAC, path consistency, and related constructions.

<a id="self-checks"></a>

## Self-checks

<a id="ex-pg-check-3"></a>

[Exercise 1](#ex-pg-check-3 "Link to this Exercise") (Reparameterization boundary)

Give one setting where the score-function method applies but a pathwise reparameterization gradient is not directly available.

Solution to [Exercise 1](#ex-pg-check-3)

A policy with discrete actions is the standard example: its samples are not differentiable functions of continuous noise, while their log probabilities remain differentiable in the policy parameters.

[

Parameterized Policy Optimization

Amortized Action Optimization


](24-amortized-action-optimization.md)[

Parameterized Policy Optimization

Regularized and Residual-Based Policy Learning


](26-regularized-policy-learning.md)


---

# CHAPITRE 26 — Regularized and Residual-Based Policy Learning

Section du livre : Parameterized Policy Optimization

Page originale : https://pierrelucbacon.com/rlbook/regularized-policy-learning

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/26-regularized-policy-learning.md

> **Cours de Pierre-Luc Bacon — 26.** [Page publiée](https://pierrelucbacon.com/rlbook/regularized-policy-learning) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/26-regularized-policy-learning.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Regularized and Residual-Based Policy Learning

<a id="skip-to-article"></a>

DDPG and TD3 address continuous actions by learning a deterministic policy that amortizes the $\arg\max_a q(s,a)$ operation. But deterministic policies have a fundamental limitation: they require external exploration noise (Gaussian perturbations in TD3) and can converge to suboptimal deterministic behaviors without adequate coverage of the state-action space.

Gradient estimators make stochastic actors trainable, while regularized dynamic programming specifies the stochastic policy they should approach. Can these pieces avoid both the continuous-action integral in the soft Bellman equation and the repeated optimization of a hard maximum?

The [smoothing chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md) presents an alternative: entropy-regularized MDPs, where the agent maximizes expected return plus a bonus for policy randomness. This yields stochastic policies with exploration built into the objective itself. The smooth Bellman operator replaces the hard max with a soft-max:

<a id="p85VUBkLih"></a>

$$
v^*(s) = \frac{1}{\beta} \log \sum_{a \in \mathcal{A}} \exp\left(\beta \cdot q^*(s,a)\right)
$$

[(1)](#p85VUBkLih "Link to this Equation")

where $\beta = 1/\alpha$ is the inverse temperature and $\alpha$ is the entropy regularization weight. For finite action spaces, this log-sum-exp is easy to compute. But for continuous actions $\mathcal{A} \subset \mathbb{R}^m$, the sum becomes an integral:

<a id="YM3QaV6Wj1"></a>

$$
v^*(s) = \frac{1}{\beta} \log \int_{\mathcal{A}} \exp\left(\beta \cdot q^*(s,a)\right) da
$$

[(2)](#YM3QaV6Wj1 "Link to this Equation")

This integral is intractable. We face an infinite-dimensional sum over the continuous action space. The very smoothness that gives us stochastic policies creates a new computational barrier, distinct from but analogous to the $\arg\max$ problem in standard FQI.

<a id="from-intractable-integral-to-tractable-expectation"></a>

## From Intractable Integral to Tractable Expectation

How can the continuous-action log-partition integral be rewritten as an expectation under the policy being learned?

Soft actor-critic (SAC) Haarnoja _et al._, 2018Haarnoja _et al._, 2018 exploits an equivalence between the intractable integral and an expectation. The optimal policy under entropy regularization is the Boltzmann distribution $\pi^*(a|s) \propto \exp(\beta \cdot q^*(s,a))$. Under this policy, the soft value function becomes:

<a id="hivX0cYchi"></a>

$$
v^*(s) = \mathbb{E}_{a \sim \pi^*(\cdot|s)}\left[q^*(s,a) - \alpha \log \pi^*(a|s)\right]
$$

[(3)](#hivX0cYchi "Link to this Equation")

This converts the intractable integral into an expectation we can estimate by sampling. SAC learns a parametric policy $\pi_{\boldsymbol{\phi}}$ that approximates the Boltzmann distribution, enabling fast action selection via a single forward pass. For bootstrap targets, SAC samples $\tilde{a}' \sim \pi_{\boldsymbol{\phi}}(\cdot|s')$ and computes:

<a id="eLDcYLdxmn"></a>

$$
y = r + \gamma \left[\min_{j=1,2} q^j_{\boldsymbol{\theta}_{\text{target}}}(s', \tilde{a}') - \alpha \log \pi_{\boldsymbol{\phi}}(\tilde{a}'|s')\right]
$$

[(4)](#eLDcYLdxmn "Link to this Equation")

The minimum over twin Q-networks applies the clipped double-Q trick from TD3. Exploration comes from the policy’s stochasticity rather than external noise.

<a id="learning-the-policy-matching-the-boltzmann-distribution"></a>

## Learning the Policy: Matching the Boltzmann Distribution

Which divergence or equivalent stochastic objective moves the actor toward the Boltzmann distribution induced by the soft Q-function?

The Q-network update assumes a policy $\pi_{\boldsymbol{\phi}}$ that approximates the Boltzmann distribution $\pi^*(a|s) \propto \exp(\beta \cdot q^*(s,a))$. Training such a policy presents a problem: the Boltzmann distribution requires the partition function $Z(s) = \int_{\mathcal{A}} \exp(\beta \cdot q(s,a))da$, the very integral we are trying to avoid. SAC sidesteps this by minimizing the KL divergence from the policy to the (unnormalized) Boltzmann distribution:

<a id="JHKGLs0wua"></a>

$$
\min_{\boldsymbol{\phi}} \mathbb{E}_{s \sim \mathcal{D}}\left[D_{KL}\left(\pi_{\boldsymbol{\phi}}(\cdot|s) \| \frac{\exp(\beta \cdot q_{\boldsymbol{\theta}}(s,\cdot))}{Z_{\boldsymbol{\theta}}(s)}\right)\right]
$$

[(5)](#JHKGLs0wua "Link to this Equation")

Since $\log Z_{\boldsymbol{\theta}}(s)$ does not depend on $\boldsymbol{\phi}$, this reduces to:

<a id="UyKfcd1prf"></a>

$$
\min_{\boldsymbol{\phi}} \mathbb{E}_{s \sim \mathcal{D}}\mathbb{E}_{a \sim \pi_{\boldsymbol{\phi}}(\cdot|s)}\left[\alpha \log \pi_{\boldsymbol{\phi}}(a|s) - q_{\boldsymbol{\theta}}(s,a)\right]
$$

[(6)](#UyKfcd1prf "Link to this Equation")

This pushes probability toward high Q-value actions while the $\log \pi_{\boldsymbol{\phi}}$ term penalizes concentrating probability mass, maintaining entropy. The entropy bonus comes from the KL divergence structure rather than from an explicit regularization term.

To estimate gradients of this objective, we face a technical problem: the policy parameters $\boldsymbol{\phi}$ appear in the sampling distribution $\pi_{\boldsymbol{\phi}}$, making $\nabla_{\boldsymbol{\phi}} \mathbb{E}_{a \sim \pi_{\boldsymbol{\phi}}}[\cdot]$ difficult to compute. SAC uses a Gaussian policy $\pi_{\boldsymbol{\phi}}(a|s) = \mathcal{N}(\mu_{\boldsymbol{\phi}}(s), \sigma_{\boldsymbol{\phi}}(s)^2)$ with the reparameterization trick. Express samples as a deterministic function of parameters and independent noise:

<a id="GcWqJyhgIH"></a>

$$
a = f_{\boldsymbol{\phi}}(s, \epsilon) = \mu_{\boldsymbol{\phi}}(s) + \sigma_{\boldsymbol{\phi}}(s) \odot \epsilon, \quad \epsilon \sim \mathcal{N}(0, I)
$$

[(7)](#GcWqJyhgIH "Link to this Equation")

This moves $\boldsymbol{\phi}$ out of the sampling distribution and into the integrand:

<a id="eXeLYmoQS3"></a>

$$
\min_{\boldsymbol{\phi}} \mathbb{E}_{s \sim \mathcal{D}}\mathbb{E}_{\epsilon \sim \mathcal{N}(0,I)}\left[\alpha \log \pi_{\boldsymbol{\phi}}(f_{\boldsymbol{\phi}}(s,\epsilon)|s) - q_{\boldsymbol{\theta}}(s,f_{\boldsymbol{\phi}}(s,\epsilon))\right]
$$

[(8)](#eXeLYmoQS3 "Link to this Equation")

We can now differentiate through $f_{\boldsymbol{\phi}}$ and the Q-network, as DDPG differentiates through a deterministic policy. SAC extends this by sampling noise $\epsilon$ at each gradient step rather than outputting a single deterministic action.

<a id="sac"></a>

[Algorithm 1](#sac "Link to this Algorithm") (Soft Actor-Critic (SAC))

**Input:** MDP $(S, \mathcal{A}, P, R, \gamma)$, twin Q-networks $q^1(s,a; \boldsymbol{\theta}^1), q^2(s,a; \boldsymbol{\theta}^2)$, policy $\pi_{\boldsymbol{\phi}}$, learning rates $\alpha_q, \alpha_\pi$, replay buffer capacity $B$, mini-batch size $b$, EMA rate $\tau$, entropy weight $\alpha$

**Output:** Q-function parameters $\boldsymbol{\theta}^1, \boldsymbol{\theta}^2$, policy parameters $\boldsymbol{\phi}$

1.  Initialize $\boldsymbol{\theta}^1_0, \boldsymbol{\theta}^2_0, \boldsymbol{\phi}_0$ randomly
    
2.  $\boldsymbol{\theta}^1_{\text{target}} \leftarrow \boldsymbol{\theta}^1_0$, $\boldsymbol{\theta}^2_{\text{target}} \leftarrow \boldsymbol{\theta}^2_0$
    
3.  Initialize replay buffer $\mathcal{B}$ with capacity $B$
    
4.  $t \leftarrow 0$
    
5.  **while** training **do**
    
    1.  Observe state $s$
        
    2.  Sample action: $a \sim \pi_{\boldsymbol{\phi}_t}(\cdot|s)$ $\quad$ // Stochastic policy provides exploration
        
    3.  Execute $a$, observe reward $r$ and next state $s'$
        
    4.  Store $(s,a,r,s')$ in $\mathcal{B}$, replacing oldest if full
        
    5.  Sample mini-batch $\{(s_i,a_i,r_i,s_i')\}_{i=1}^b$ from $\mathcal{B}$
        
    6.  **// Update Q-networks: bootstrap using single-sample soft value estimate**
        
    7.  **for** each $s'_i$ **do** sample $\tilde{a}'_i \sim \pi_{\boldsymbol{\phi}_t}(\cdot|s'_i)$
        
    8.  $y_i \leftarrow r_i + \gamma \left[\min(q^1(s'_i, \tilde{a}'_i; \boldsymbol{\theta}^1_{\text{target}}), q^2(s'_i, \tilde{a}'_i; \boldsymbol{\theta}^2_{\text{target}})) - \alpha \log \pi_{\boldsymbol{\phi}_t}(\tilde{a}'_i|s'_i)\right]$
        
    9.  $\boldsymbol{\theta}^1_{t+1} \leftarrow \boldsymbol{\theta}^1_t - \alpha_q \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b(q^1(s_i,a_i;\boldsymbol{\theta}^1_t) - y_i)^2$
        
    10.  $\boldsymbol{\theta}^2_{t+1} \leftarrow \boldsymbol{\theta}^2_t - \alpha_q \nabla_{\boldsymbol{\theta}} \frac{1}{b}\sum_{i=1}^b(q^2(s_i,a_i;\boldsymbol{\theta}^2_t) - y_i)^2$
         
    11.  **// Update policy: minimize KL to Boltzmann distribution**
         
    12.  **for** each $s_i$ **do** sample $\epsilon_i \sim \mathcal{N}(0,I)$ and compute $\hat{a}_i = f_{\boldsymbol{\phi}_t}(s_i, \epsilon_i)$ $\quad$ // Reparameterization
         
    13.  $\boldsymbol{\phi}_{t+1} \leftarrow \boldsymbol{\phi}_t - \alpha_\pi \nabla_{\boldsymbol{\phi}} \frac{1}{b}\sum_{i=1}^b \left[\alpha \log \pi_{\boldsymbol{\phi}_t}(\hat{a}_i|s_i) - \min_{j=1,2} q^j(s_i, \hat{a}_i; \boldsymbol{\theta}^j_{t+1})\right]$
         
    14.  **// EMA update for Q-network targets**
         
    15.  $\boldsymbol{\theta}^1_{\text{target}} \leftarrow \tau \boldsymbol{\theta}^1_{t+1} + (1-\tau)\boldsymbol{\theta}^1_{\text{target}}$
         
    16.  $\boldsymbol{\theta}^2_{\text{target}} \leftarrow \tau \boldsymbol{\theta}^2_{t+1} + (1-\tau)\boldsymbol{\theta}^2_{\text{target}}$
         
    17.  $t \leftarrow t + 1$
         
6.  **return** $\boldsymbol{\theta}^1_t, \boldsymbol{\theta}^2_t, \boldsymbol{\phi}_t$
    

The algorithm interleaves three updates. The Q-networks (lines 7-10) follow fitted Q-iteration with the soft Bellman target: sample a next action $\tilde{a}'_i$ from the current policy, compute the entropy-adjusted target $y_i = r_i + \gamma[\min_j q^j_{\text{target}}(s'_i, \tilde{a}'_i) - \alpha \log \pi_{\boldsymbol{\phi}}(\tilde{a}'_i|s'_i)]$, and minimize squared error. The minimum over twin Q-networks mitigates overestimation as in TD3. The policy (lines 12-13) updates to match the Boltzmann distribution induced by the current Q-function, using the reparameterization trick for gradient estimation. Target networks update via EMA (lines 15-16) to stabilize training.

The stochastic policy serves the same amortization purpose as in DDPG and TD3: it replaces the intractable $\arg\max$ operation with a fast network forward pass. SAC’s entropy regularization produces exploration through the policy’s inherent stochasticity rather than external noise. This makes SAC more robust to hyperparameters and eliminates the need to tune exploration schedules.

<a id="path-consistency-learning-pcl"></a>

## Path Consistency Learning (PCL)

Can a soft-optimal policy be trained by enforcing multi-step consistency directly rather than constructing one-step Bellman targets?

DDPG, TD3, and SAC all follow the same solution template from fitted Q-iteration: compute Bellman targets using the current Q-function, fit the Q-function to those targets, repeat. This is **successive approximation**, the function iteration approach $v_{k+1} = \mathsf{P} \mathsf{L} v_k$ from the [projection methods chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md).

Path Consistency Learning (PCL) Nachum _et al._, 2017 solves the Bellman equation differently. Instead of iterating the operator, it directly minimizes a **residual**. This is the least-squares approach from projection methods: solve $\mathsf{N}(v) = 0$ by minimizing $\|\mathsf{N}(v)\|^2$. The method exploits special structure (smooth Bellman operators under deterministic dynamics) that conventional methods cannot leverage.

<a id="the-path-consistency-property"></a>

### The Path Consistency Property

Consider the entropy-regularized Q-function Bellman equation from the [smoothing chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/19-regularized-dp.md). Under general stochastic dynamics, it involves an expectation over next states:

<a id="fdWWNdUzbb"></a>

$$
q^*(s,a) = r(s,a) + \gamma \mathbb{E}_{s'}[v^*(s')]
$$

[(9)](#fdWWNdUzbb "Link to this Equation")

Suppose the dynamics are deterministic: $s' = f(s,a)$. The next state is uniquely determined, so the expectation disappears:

<a id="MPt9xeltt5"></a>

$$
q^*(s,a) = r(s,a) + \gamma v^*(f(s,a))
$$

[(10)](#MPt9xeltt5 "Link to this Equation")

The value function relates to Q-functions through the soft-max:

<a id="wRRi2lP2Hk"></a>

$$
v^*(s) = \alpha \log \int_{\mathcal{A}} \exp(q^*(s,a)/\alpha) da
$$

[(11)](#wRRi2lP2Hk "Link to this Equation")

Contrast two cases: general policies versus the optimal Boltzmann policy.

**For general policies**, the value equals an expectation:

<a id="eq-v-general-policy"></a>

$$
v^\pi(s) = \mathbb{E}_{a \sim \pi(\cdot|s)}[q^\pi(s,a) - \alpha \log \pi(a|s)]
$$

[(12)](#eq-v-general-policy "Link to this Equation")

This is an average. For a single observed action $a$, we have:

<a id="BT0F5oVTxh"></a>

$$
q^\pi(s,a) - \alpha\log\pi(a|s) = v^\pi(s) + \varepsilon(s,a)
$$

[(13)](#BT0F5oVTxh "Link to this Equation")

where $\varepsilon(s,a)$ is sampling error with $\mathbb{E}_{a \sim \pi}[\varepsilon(s,a)] = 0$. Individual actions give noisy estimates that fluctuate around the mean.

**For the optimal policy under entropy regularization**, the Boltzmann structure produces an exact pointwise identity. The optimal policy is:

<a id="USlhWcgzQN"></a>

$$
\pi^*(a|s) = \frac{\exp(q^*(s,a)/\alpha)}{\exp(v^*(s)/\alpha)}
$$

[(14)](#USlhWcgzQN "Link to this Equation")

Taking logarithms and rearranging:

<a id="eq-v-q-exact-boltzmann"></a>

$$
v^*(s) = q^*(s,a) - \alpha \log \pi^*(a|s) \quad \text{for all } a
$$

[(15)](#eq-v-q-exact-boltzmann "Link to this Equation")

This holds exactly for every action $a$, not just in expectation. There is no sampling error. The advantage $q^*(s,a) - v^*(s)$ is encoded in the log-probability: suboptimal actions have low $q^*(s,a)$ but also large $-\alpha\log\pi^*(a|s)$ (low probability means large negative log-probability), and these terms balance exactly to give $v^*(s)$.

Now take a trajectory segment $(s_0, a_0, s_1, a_1, \ldots, s_d)$ where each transition follows the deterministic dynamics $s_{t+1} = f(s_t, a_t)$. Start with $q^*(s_0, a_0) = r_0 + \gamma v^*(s_1)$ and use equation [(15)](#eq-v-q-exact-boltzmann) to substitute $v^*(s_1) = q^*(s_1,a_1) - \alpha\log\pi^*(a_1|s_1)$ exactly:

<a id="MLkMMXcnRa"></a>

$$
q^*(s_0, a_0) = r_0 + \gamma[q^*(s_1,a_1) - \alpha\log\pi^*(a_1|s_1)]
$$

[(16)](#MLkMMXcnRa "Link to this Equation")

Substitute $q^*(s_1,a_1) = r_1 + \gamma v^*(s_2)$:

<a id="XXdEJlkSPT"></a>

$$
q^*(s_0, a_0) = r_0 + \gamma r_1 - \gamma\alpha\log\pi^*(a_1|s_1) + \gamma^2 v^*(s_2)
$$

[(17)](#XXdEJlkSPT "Link to this Equation")

Continue this telescoping for $d$ steps. Each substitution is exact:

<a id="eEa5M1mWNS"></a>

$$
q^*(s_0, a_0) = \sum_{t=0}^{d-1} \gamma^t r_t - \alpha \sum_{t=1}^{d-1} \gamma^t \log\pi^*(a_t|s_t) + \gamma^d v^*(s_d)
$$

[(18)](#eEa5M1mWNS "Link to this Equation")

Apply equation [(15)](#eq-v-q-exact-boltzmann) once more to get $v^*(s_0) = q^*(s_0,a_0) - \alpha\log\pi^*(a_0|s_0)$:

<a id="eq-path-consistency-exact"></a>

$$
v^*(s_0) = \sum_{t=0}^{d-1} \gamma^t [r_t - \alpha\log\pi^*(a_t|s_t)] + \gamma^d v^*(s_d)
$$

[(19)](#eq-path-consistency-exact "Link to this Equation")

Rearranging gives the **path consistency residual**:

<a id="eq-path-residual"></a>

$$
R(s_0:s_d; \pi^*, v^*) = v^*(s_0) - \gamma^d v^*(s_d) - \sum_{t=0}^{d-1} \gamma^t[r_t - \alpha\log\pi^*(a_t|s_t)] = 0
$$

[(20)](#eq-path-residual "Link to this Equation")

The telescoping produces an exact identity: $R = 0$ for every action sequence, not just in expectation. The behavior policy never appears because the constraint holds as a deterministic identity for any observed $(s_0, a_0, \ldots, s_d)$. This enables off-policy learning without importance sampling.

Remark 1 (Contrasting General Policies and Optimal Boltzmann Policies)

The distinction between equations [(12)](#eq-v-general-policy) and [(15)](#eq-v-q-exact-boltzmann) is subtle but crucial.

**For general policies** (equation [(12)](#eq-v-general-policy)), the value is an average over actions sampled from the policy. Individual actions give noisy estimates: if we draw $a \sim \pi(\cdot|s)$, then $q^\pi(s,a) - \alpha\log\pi(a|s) = v^\pi(s) + \varepsilon$ where $\varepsilon$ is a zero-mean random variable. We need to average many samples to estimate $v^\pi(s)$ accurately. Multi-step telescoping would accumulate these sampling errors $\varepsilon_0, \varepsilon_1, \ldots, \varepsilon_{d-1}$, producing noisy residuals even at the true solution. Off-policy learning would require importance weights to correct for using actions from a different behavior policy.

**For the optimal entropy-regularized policy** (equation [(15)](#eq-v-q-exact-boltzmann)), the Boltzmann structure collapses the expectation to a pointwise identity. The relationship $v^*(s) = q^*(s,a) - \alpha\log\pi^*(a|s)$ holds exactly for every action $a$, optimal or not. A suboptimal action has low $q^*(s,a)$ (low expected return) and low $\pi^*(a|s)$ (low probability), making $-\alpha\log\pi^*(a|s)$ large. These terms balance precisely to give $v^*(s)$. No sampling error exists. The telescoping is exact, producing a residual that equals zero for every action sequence, not just in expectation. Off-policy learning works because the constraint holds as a deterministic identity for any observed path.

This property is unique to soft-max operators. For hard-max, $v^*(s) = \max_a q^*(s,a)$ holds only when $a$ is optimal. Suboptimal actions satisfy $v^*(s) > q^*(s,a)$, an inequality that cannot be used to construct a residual.

<a id="structural-requirements-deterministic-dynamics-and-entropy-regularization"></a>

### Structural Requirements: Deterministic Dynamics and Entropy Regularization

PCL’s two structural requirements (deterministic dynamics and entropy regularization) are not arbitrary design choices. Each addresses a fundamental theoretical issue.

<a id="deterministic-dynamics-avoiding-the-double-sampling-problem"></a>

#### Deterministic Dynamics: Avoiding the Double Sampling Problem

Under stochastic dynamics, the Q-function Bellman equation has an expectation over next states:

<a id="MMzy0APvgt"></a>

$$
q^*(s,a) = r(s,a) + \gamma \mathbb{E}_{s' \sim p(\cdot|s,a)}[v^*(s')]
$$

[(21)](#MMzy0APvgt "Link to this Equation")

The exact relationship [(15)](#eq-v-q-exact-boltzmann) still holds, so we can write the path consistency constraint. But now consider what PCL minimizes: the **squared** residual $\mathbb{E}[R^2]$ where

<a id="wTlpavGGFa"></a>

$$
R = v_{\boldsymbol{\phi}}(s_0) - \gamma^d v_{\boldsymbol{\phi}}(s_d) - \sum_{t=0}^{d-1} \gamma^t[r_t - \alpha\log\pi_{\boldsymbol{\theta}}(a_t|s_t)]
$$

[(22)](#wTlpavGGFa "Link to this Equation")

At the true optimum $(v^*, \pi^*)$, the constraint is $\mathbb{E}[R] = 0$, which implies $(\mathbb{E}[R])^2 = 0$. But PCL minimizes $\mathbb{E}[R^2]$, and by Jensen’s inequality:

<a id="RVNJEOvkGm"></a>

$$
\mathbb{E}[R^2] \geq (\mathbb{E}[R])^2
$$

[(23)](#RVNJEOvkGm "Link to this Equation")

with equality only when $R$ has zero variance. Under stochastic dynamics, even at optimality, individual trajectory residuals are random variables with mean zero but positive variance (due to transition noise). Minimizing $\mathbb{E}[R^2]$ to zero would require driving $\text{Var}(R) \to 0$, which is impossible and pushes the solution away from the true optimum.

This is Baird’s **double sampling problem** Baird, 1995. To get an unbiased gradient of $(\mathbb{E}[R])^2$, we need:

<a id="KJB7c6mYbl"></a>

$$
\nabla (\mathbb{E}[R])^2 = 2\mathbb{E}[R] \cdot \nabla \mathbb{E}[R] = 2\mathbb{E}[R] \cdot \mathbb{E}[\nabla R]
$$

[(24)](#KJB7c6mYbl "Link to this Equation")

This requires two independent samples of the next state from the same $(s,a)$ pair: one for estimating $\mathbb{E}[R]$ and one for $\mathbb{E}[\nabla R]$. With a simulator, this is possible. With real trajectories, it is not.

Under deterministic dynamics, $R$ is deterministic (no transition noise), so $\mathbb{E}[R^2] = (\mathbb{E}[R])^2$ and Jensen’s inequality holds with equality. Minimizing the squared residual is equivalent to solving $\mathbb{E}[R] = 0$.

<a id="entropy-regularization-enabling-all-action-consistency"></a>

#### Entropy Regularization: Enabling All-Action Consistency

Attempt the same path consistency derivation with the hard-max Bellman operator. Under deterministic dynamics, the Q-function satisfies:

<a id="jhnrL4Ug3X"></a>

$$
q^*(s,a) = r(s,a) + \gamma v^*(f(s,a))
$$

[(25)](#jhnrL4Ug3X "Link to this Equation")

where $v^*(s) = \max_{a'} q^*(s,a')$ and the optimal policy is $\pi^*(s) = \arg\max_a q^*(s,a)$ (deterministic).

Now try to relate $v^*(s)$ to an arbitrary observed action $a$. For the optimal action $a^* \in \arg\max_{a'} q^*(s,a')$, we have:

<a id="bpDPerhQUg"></a>

$$
v^*(s) = q^*(s,a^*)
$$

[(26)](#bpDPerhQUg "Link to this Equation")

But for a suboptimal action $a \ne a^*$:

<a id="KnI342HHsk"></a>

$$
v^*(s) = \max_{a'} q^*(s,a') > q^*(s,a)
$$

[(27)](#KnI342HHsk "Link to this Equation")

This is an inequality, not an equation. There is no formula expressing $v^*(s)$ in terms of $q^*(s,a)$ for suboptimal actions.

Attempt the multi-step telescoping. Start with $q^*(s_0, a_0) = r_0 + \gamma v^*(s_1)$. To continue, we need to express $v^*(s_1)$ using the observed action $a_1$. But we only have:

<a id="WdnZEfomUK"></a>

$$
v^*(s_1) \geq q^*(s_1, a_1)
$$

[(28)](#WdnZEfomUK "Link to this Equation")

with equality only if $a_1$ happens to be optimal at $s_1$. We cannot substitute this into the Q-function equation to get an exact telescoping. The derivation breaks at the first step.

Compare this to the soft-max case. The Boltzmann structure gives equation [(15)](#eq-v-q-exact-boltzmann): $v^*(s) = q^*(s,a) - \alpha\log\pi^*(a|s)$ for all actions $a$. The log-probability term compensates exactly for suboptimality: low-probability actions have large $-\alpha\log\pi^*(a|s)$, which adds to the low $q^*(s,a)$ to recover $v^*(s)$. This enables exact substitution at every step:

<a id="c7IjBBpez1"></a>

$$
v^*(s_1) = q^*(s_1, a_1) - \alpha\log\pi^*(a_1|s_1) \quad \text{(exact for any } a_1\text{)}
$$

[(29)](#c7IjBBpez1 "Link to this Equation")

The telescoping proceeds without inequalities or restrictions on which actions were chosen. Multi-step hard-max Q-learning lacks theoretical justification for off-policy data because when we observe a trajectory with suboptimal actions, we cannot write an exact path consistency constraint.

Both requirements are structural:

| **Requirement** | **Addresses** |
| --- | --- |
| Deterministic dynamics | Double sampling bias: ensures $\mathbb{E}[R^2] = (\mathbb{E}[R])^2$ |
| Entropy regularization | All-action consistency (equation [(15)](#eq-v-q-exact-boltzmann)) |

Without deterministic dynamics, residual minimization is biased. Without entropy regularization, the constraint holds only for optimal actions.

<a id="the-learning-objective"></a>

### The Learning Objective

Equation [(20)](#eq-path-residual) provides a constraint that the optimal $(v^*, \pi^*)$ must satisfy: the residual equals zero for every observed path. For parametric approximations $(v_{\boldsymbol{\phi}}, \pi_{\boldsymbol{\theta}})$ that are not yet optimal, the residual is nonzero:

<a id="a7Lna2WxBF"></a>

$$
R(s_0:s_d; \boldsymbol{\theta}, \boldsymbol{\phi}) = v_{\boldsymbol{\phi}}(s_0) - \gamma^d v_{\boldsymbol{\phi}}(s_d) - \sum_{t=0}^{d-1} \gamma^t[r_t - \alpha \log \pi_{\boldsymbol{\theta}}(a_t|s_t)]
$$

[(30)](#a7Lna2WxBF "Link to this Equation")

PCL minimizes the squared residual over observed path segments:

<a id="laGisDJJvY"></a>

$$
\min_{\boldsymbol{\theta}, \boldsymbol{\phi}} \sum_{\text{segments}} \frac{1}{2} R(s_i:s_{i+d}; \boldsymbol{\theta}, \boldsymbol{\phi})^2
$$

[(31)](#laGisDJJvY "Link to this Equation")

This is the least-squares residual approach from the [projection methods chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/21-approximate-bellman-equations.md). SAC computes targets $y_i$ and fits to them (successive approximation). PCL directly minimizes the residual without computing targets or performing a separate fitting step.

Gradient descent gives:

<a id="YD8PKuZOXy"></a>

$$
\begin{align}
\boldsymbol{\theta}_{k+1} &= \boldsymbol{\theta}_k + \eta_\pi \sum_i R_i \cdot \alpha \sum_{t=0}^{d-1} \gamma^t \nabla_{\boldsymbol{\theta}} \log \pi_{\boldsymbol{\theta}_k}(a_{i+t}|s_{i+t}) \\
\boldsymbol{\phi}_{k+1} &= \boldsymbol{\phi}_k - \eta_v \sum_i R_i \left[\nabla_{\boldsymbol{\phi}} v_{\boldsymbol{\phi}_k}(s_i) - \gamma^d \nabla_{\boldsymbol{\phi}} v_{\boldsymbol{\phi}_k}(s_{i+d})\right]
\end{align}
$$

[(32)](#YD8PKuZOXy "Link to this Equation")

where $R_i = R(s_i:s_{i+d}; \boldsymbol{\theta}_k, \boldsymbol{\phi}_k)$. Large residuals drive larger updates.

<a id="pcl"></a>

[Algorithm 2](#pcl "Link to this Algorithm") (Path Consistency Learning (PCL))

**Input:** MDP with deterministic dynamics $s_{t+1} = f(s_t, a_t)$, policy $\pi_{\boldsymbol{\theta}}$, value function $v_{\boldsymbol{\phi}}$, entropy weight $\alpha$, path length $d$, learning rates $\eta_\pi, \eta_v$, replay buffer capacity $B$

**Output:** Policy parameters $\boldsymbol{\theta}$, value parameters $\boldsymbol{\phi}$

1.  Initialize $\boldsymbol{\theta}_0$, $\boldsymbol{\phi}_0$
    
2.  Initialize replay buffer $\mathcal{R}$ with capacity $B$
    
3.  $k \leftarrow 0$
    
4.  **while** training **do**
    
    1.  Sample trajectory $\tau = (s_0, a_0, r_0, \ldots, s_T)$ from $\pi_{\boldsymbol{\theta}_k}$ and store in $\mathcal{R}$
        
    2.  Sample trajectory $\tau'$ from $\mathcal{R}$
        
    3.  **for** each $d$\-step segment in $\tau'$ **do**
        
        1.  Compute residual: $R_i \leftarrow v_{\boldsymbol{\phi}_k}(s_i) - \gamma^d v_{\boldsymbol{\phi}_k}(s_{i+d}) - \sum_{t=0}^{d-1} \gamma^t[r_{i+t} - \alpha \log \pi_{\boldsymbol{\theta}_k}(a_{i+t}|s_{i+t})]$
            
        2.  Update policy: $\boldsymbol{\theta}_{k+1} \leftarrow \boldsymbol{\theta}_k + \eta_\pi \alpha R_i \sum_{t=0}^{d-1} \gamma^t \nabla_{\boldsymbol{\theta}} \log \pi_{\boldsymbol{\theta}_k}(a_{i+t}|s_{i+t})$
            
        3.  Update value: $\boldsymbol{\phi}_{k+1} \leftarrow \boldsymbol{\phi}_k - \eta_v R_i\left[\nabla_{\boldsymbol{\phi}} v_{\boldsymbol{\phi}_k}(s_i) - \gamma^d \nabla_{\boldsymbol{\phi}} v_{\boldsymbol{\phi}_k}(s_{i+d})\right]$
            
    4.  Remove oldest trajectories if $|\mathcal{R}| > B$
        
    5.  $k \leftarrow k + 1$
        
5.  **return** $\boldsymbol{\theta}_k$, $\boldsymbol{\phi}_k$
    

The algorithm collects trajectories from the current policy and stores them in a replay buffer. At each iteration, it samples a trajectory (possibly old) and performs gradient descent on the path residual for all $d$\-step segments. The replay buffer enables off-policy learning: trajectories from old policies, expert demonstrations, or exploratory behavior all provide valid training signals.

<a id="unified-parameterization-single-q-network"></a>

### Unified Parameterization: Single Q-Network

[Algorithm 2](#pcl) uses separate networks for policy and value. But we can use a single Q-network $q_{\boldsymbol{\theta}}(s,a)$ and derive both:

<a id="JBAeeF0sMs"></a>

$$
v_{\boldsymbol{\theta}}(s) = \alpha \log \sum_{a} \exp(q_{\boldsymbol{\theta}}(s,a)/\alpha), \qquad \pi_{\boldsymbol{\theta}}(a|s) = \frac{\exp(q_{\boldsymbol{\theta}}(s,a)/\alpha)}{\sum_{a'} \exp(q_{\boldsymbol{\theta}}(s,a')/\alpha)}
$$

[(33)](#JBAeeF0sMs "Link to this Equation")

The path residual becomes:

<a id="NwFCK0JdZL"></a>

$$
R(s_i:s_{i+d}; \boldsymbol{\theta}) = v_{\boldsymbol{\theta}}(s_i) - \gamma^d v_{\boldsymbol{\theta}}(s_{i+d}) - \sum_{t=0}^{d-1} \gamma^t[r_{i+t} - \alpha \log \pi_{\boldsymbol{\theta}}(a_{i+t}|s_{i+t})]
$$

[(34)](#NwFCK0JdZL "Link to this Equation")

and the gradient combines both value and policy contributions through the same parameters. This unified architecture eliminates the actor-critic separation: one Q-network serves both roles.

<a id="connection-to-existing-methods"></a>

### Connection to Existing Methods

**Single-step case ($d=1$)**: The path residual becomes $R(s:s'; \boldsymbol{\theta}, \boldsymbol{\phi}) = v_{\boldsymbol{\phi}}(s) - \gamma v_{\boldsymbol{\phi}}(s') - r + \alpha\log\pi_{\boldsymbol{\theta}}(a|s)$. For unified parameterization where $v_{\boldsymbol{\theta}}(s) = q_{\boldsymbol{\theta}}(s,a) - \alpha\log\pi_{\boldsymbol{\theta}}(a|s)$ exactly, this becomes $R = q_{\boldsymbol{\theta}}(s,a) - r - \gamma v_{\boldsymbol{\theta}}(s')$, the soft Bellman residual. Minimizing $\sum_i R_i^2$ is equivalent to soft Q-learning, though SAC solves this via successive approximation (compute targets, fit) rather than direct residual minimization.

**No entropy ($\alpha \to 0$)**: The residual becomes $R = v(s_i) - \gamma^d v(s_{i+d}) - \sum_t \gamma^t r_t$, the negative $d$\-step advantage. But unlike A2C/A3C where $v$ tracks the current policy’s value, PCL’s value converges to $v^*$ because the residual couples policy and value through the optimality condition.

**Multi-step with hard-max**: No analog exists. The hard-max Bellman operator $\max_a q(s,a)$ does not have an exact pointwise relationship like equation [(15)](#eq-v-q-exact-boltzmann). Multi-step telescoping would accumulate errors from the max operator, making the constraint valid only in expectation under the optimal policy. The soft-max structure enables exact off-policy path consistency.

<a id="pcl-vs-sac-residual-minimization-vs-successive-approximation"></a>

### PCL vs SAC: Residual Minimization vs Successive Approximation

Both methods solve entropy-regularized MDPs but use fundamentally different solution strategies:

| **Aspect** | **SAC** | **PCL** |
| --- | --- | --- |
| **Solution method** | Successive approximation: compute targets $y_i$, fit $q$ to targets | Residual minimization: minimize $\sum_i R_i^2$ directly |
| **Update structure** | Target computation + regression step | Single gradient step on squared residual |
| **Target networks** | Required (mark outer-iteration boundaries) | None (residual constraint, not target fitting) |
| **Temporal horizon** | Single-step TD: $y = r + \gamma V(s')$ | Multi-step paths: accumulate over $d$ steps |
| **Off-policy handling** | Replay buffer with single-sample bias | No importance sampling (works for any trajectory) |
| **Dynamics requirement** | General stochastic transitions | **Deterministic** transitions $s' = f(s,a)$ |
| **Architecture** | Twin Q-networks + policy network | Single Q-network (unified parameterization) |

PCL requires deterministic dynamics. It gains multi-step telescoping and off-policy learning without importance weights, but only for deterministic systems (robotic manipulation, many control tasks). SAC works for general stochastic MDPs.

<a id="pcl-as-amortization"></a>

### PCL as Amortization

PCL amortizes at a different level than DDPG/TD3/SAC. Those methods amortize the action maximization: learn a policy network that outputs $\arg\max_a q(s,a)$ directly. PCL amortizes the solution of the Bellman equation itself. Instead of repeatedly applying the Bellman operator (which requires $\int_{\mathcal{A}} \exp(q/\alpha) da$ at every iteration), PCL samples path segments and minimizes their residual. The computational cost of verifying optimality across all states and path lengths is distributed across training through sampled gradient updates.

<a id="model-predictive-path-integral-control"></a>

## Model Predictive Path Integral Control

How does online trajectory optimization compare with amortizing action selection into a learned policy?

The [MPPI development](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-mppi) constructs a distribution over finite control sequences by exponentially tilting a reference distribution toward low-cost trajectories. A shifted Gaussian proposal makes these trajectories easier to sample. Importance weights then correct for the change of proposal, and their weighted perturbations update the nominal sequence. The controller applies its first action and shifts the remaining sequence to initialize the next optimization.

This calculation shares an exponential form with the policies derived from entropy regularization, but the distributions and optimization problems require separate definitions. SAC regularizes a state-conditional action policy. The information-theoretic MPPI construction regularizes a distribution over trajectories relative to a specified reference law [Williams _et al._, 2017](https://doi.org/10.48550/arXiv.1707.02342). In the separate [continuous-time path-integral derivation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md#sec-path-integral-control), the reference law is generated by an uncontrolled diffusion, and the quadratic control cost must match its noise covariance. Neither derivation identifies an arbitrary MPPI implementation with SAC or PCL’s soft Bellman solution.

The Gaussian mean update fits the tilted trajectory distribution by minimizing KL divergence from that distribution to the Gaussian family. It need not minimize the original expected-cost objective over Gaussian policies. Its sampled implementation also has discretization and finite-sampling error. The [aircraft example](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/11-model-predictive-path-integral-control.md#sec-aircraft-mppi) also estimates each candidate’s expected cost across possible wind futures. For the matched stochastic-control model, the [Brownian passage examples](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/17-path-integral-stochastic-control.md#sec-brownian-passages) compare sampled feedback with analytic and numerical reference solutions.

<a id="online-optimization-and-amortization"></a>

### Online Optimization and Amortization

An actor network distributes computation across training examples and returns an action through a forward pass. MPPI spends model evaluations at the current state, with a warm start from the previous plan. A new cost function can be used in its next optimization, although finite computation and a poor proposal can still prevent a useful update.

The computational comparison separates where effort is spent from the errors that remain:

| Aspect | Learned actor | MPPI |
| --- | --- | --- |
| Action selection | Policy-network evaluation | Repeated batches of model rollouts |
| Reuse across decisions | Trained parameters | Shifted nominal control sequence |
| Model use at deployment | Often unnecessary | A rollout model is required |
| Approximation sources | Policy and value approximation, estimation, optimization | Model error, discretization, restricted proposal, finite sampling |
| Changed objective | Usually requires further training | Enters subsequent rollout costs |

For a deterministic rollout model, one MPPI iteration with $K$ sequences and $H$ time steps uses $KH$ transition evaluations. Estimating each sequence’s expected cost across $L$ disturbance scenarios increases that count to $KHL$. These evaluations can be batched across sequences and scenarios, while each trajectory still advances through time. The practical choice depends on model cost, available parallel computation, and the accuracy required at each decision.

<a id="an-alternative-euler-equation-methods"></a>

## An Alternative: Euler Equation Methods

Can first-order optimality eliminate the value function and yield a functional equation directly in the policy?

The methods developed in this chapter all parameterize policies, but they remain rooted in the Bellman equation. NFQCA, DDPG, TD3, and SAC learn Q-functions through successive approximation, then derive policies by maximizing these Q-functions. PCL minimizes a path residual derived from the soft Bellman equation. The policy serves as an amortized optimizer for a value-based objective.

There is a different approach, developed in computational economics Judd, 1992[Rust, 1996](https://doi.org/10.1016/s1574-0021\(96\)01016-7)Judd, 1998, that also parameterizes policies but solves an entirely different functional equation. Consider a control problem with continuous states and actions, deterministic dynamics $s' = f(s,a)$, and differentiable reward $r(s,a)$. The optimal action $\pi^*(s)$ satisfies the first-order condition:

<a id="OrTnTqsFP4"></a>

$$
\frac{\partial r(s,a)}{\partial a}\Big|_{a=\pi^*(s)}
+
\gamma\, \frac{\partial v^*(s')}{\partial s'}\Big|_{s'=f(s,\pi^*(s))}\,
\frac{\partial f(s,a)}{\partial a}\Big|_{a=\pi^*(s)}
=
0.
$$

[(35)](#OrTnTqsFP4 "Link to this Equation")

This Euler equation expresses optimality through derivatives rather than through the max operator. For problems with special structure (the Euler class, where dynamics are affine in the controlled state), envelope theorems eliminate $v^*$ entirely, yielding a closed functional equation $\mathcal{E}(\pi)(s) = 0$ in the policy alone.

With a parameterized policy $\pi_{\boldsymbol{\theta}}(s)$, we can discretize via collocation or Galerkin projection:

<a id="GLHD7t4PCx"></a>

$$
G(\boldsymbol{\theta}) := \begin{bmatrix}
\mathcal{E}(\pi_{\boldsymbol{\theta}})(s_1) \\
\vdots \\
\mathcal{E}(\pi_{\boldsymbol{\theta}})(s_N)
\end{bmatrix} = 0.
$$

[(36)](#GLHD7t4PCx "Link to this Equation")

This is root-finding, not fixed-point iteration. Newton-type methods replace the successive approximation of fitted Q-iteration. The Euler operator is not a contraction, so convergence guarantees are problem-dependent.

What does this mean for reinforcement learning? The Euler approach shares the amortization idea: learn a policy network that directly outputs actions. But the training objective comes from first-order optimality conditions rather than from Bellman residuals or Q-function maximization. This raises questions worth considering. Could Euler-style objectives provide useful training signals for actor-critic methods? When dynamics are known or learned, could first-order conditions offer advantages over value-based objectives? The connection between these traditions remains underexplored.

<a id="summary"></a>

## Summary

SAC converts the soft value integral into an expectation under a learned stochastic policy. PCL instead minimizes a multi-step consistency residual, and MPPI updates a finite-horizon trajectory distribution at each decision. The Euler approach supplies a further alternative: solve a first-order policy equation rather than a Bellman fixed point.

MPPI avoids a persistent actor approximation by performing online sampling and optimization. Its exponential weights resemble those of entropy-regularized policies, but its reference distribution, horizon, and sampling assumptions define a different optimization problem. Finite computation and model error remain in either approach.

All of these objectives retain an optimality equation derived from a value or path-consistency relation. Can expected return be differentiated directly without first treating a Bellman equation as the training objective? [Policy gradients and actor-critic methods](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/27-policy-gradients.md) use the trajectory score and bring value functions back as variance-reducing critics.

<a id="self-checks"></a>

## Self-checks

<a id="ex-amortization-check-2"></a>

[Exercise 1](#ex-amortization-check-2 "Link to this Exercise") (Compute trade-off)

Contrast MPPI and an actor network in terms of online computation and approximation error.

Solution to [Exercise 1](#ex-amortization-check-2)

MPPI spends many model rollouts at every decision and avoids a persistent actor approximation, but retains model, discretization, proposal, and finite-sampling errors. An actor is cheap online but can introduce error because its parameters only approximate the desired decision rule. A warm-started MPPI sequence and a trained actor reuse computation in different ways.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-haarnoja2018soft"></a>
2.  Haarnoja, T., Zhou, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor. _Proceedings of the 35th International Conference on Machine Learning (ICML)_, 1861–1870.
<a id="cite-haarnoja2018sacapplications"></a>
4.  Haarnoja, T., Zhou, A., Hartikainen, K., Tucker, G., Ha, S., Tan, J., Kumar, V., Zhu, H., Gupta, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic algorithms and applications. _arXiv Preprint arXiv:1812.05905_.
<a id="cite-Nachum2017"></a>
6.  Nachum, O., Norouzi, M., Xu, K., & Schuurmans, D. (2017). Bridging the Gap Between Value and Policy Based Reinforcement Learning. _Advances in Neural Information Processing Systems_, _30_, 2775–2785.
<a id="cite-Baird1995"></a>
8.  Baird, L. (1995). Residual algorithms: Reinforcement learning with function approximation. _Proceedings of the Twelfth International Conference on Machine Learning_, 30–37.
<a id="cite-Williams2017InformationTheoretic"></a>
10.  Williams, G., Drews, P., Goldfain, B., Rehg, J. M., & Theodorou, E. A. (2017). _Information Theoretic Model Predictive Control: Theory and Applications to Autonomous Driving_. [10.48550/arXiv.1707.02342](https://doi.org/10.48550/arXiv.1707.02342)
<a id="cite-Judd1992"></a>
12.  Judd, K. L. (1992). Projection methods for solving aggregate growth models. _Journal of Economic Theory_, _58_(2), 410–452.
<a id="cite-Rust1996"></a>
14.  Rust, J. (1996). Chapter 14 Numerical dynamic programming in economics. In _Handbook of Computational Economics_ (pp. 619–729). Elsevier. [10.1016/s1574-0021(96)01016-7](https://doi.org/10.1016/s1574-0021\(96\)01016-7)
<a id="cite-ndp"></a>
16.  Judd, K. L. (1998). _Numerical Methods in Economics_. MIT Press.

[

Parameterized Policy Optimization

Gradient Estimation for Stochastic Objectives


](25-gradient-estimation.md)[

Parameterized Policy Optimization

Policy Gradients and Actor-Critic


](27-policy-gradients.md)


---

# CHAPITRE 27 — Policy Gradients and Actor-Critic

Section du livre : Parameterized Policy Optimization

Page originale : https://pierrelucbacon.com/rlbook/policy-gradients

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/27-policy-gradients.md

> **Cours de Pierre-Luc Bacon — 27.** [Page publiée](https://pierrelucbacon.com/rlbook/policy-gradients) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/27-policy-gradients.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Policy Gradients and Actor-Critic

<a id="skip-to-article"></a>

The previous chapters optimized policies through Q-functions, soft Bellman relations, or path-consistency equations. Can expected return itself supply the policy objective without differentiating the environment dynamics? The score function estimator applies directly to trajectories because the policy terms are the only factors in their probability law that depend on the policy parameters.

The estimator requires only the ability to evaluate and differentiate $\log
\pi_{\boldsymbol{w}}(a|s)$, so it also works with discrete actions where reparameterization is unavailable.

Let $G(\tau) \equiv \sum_{t=0}^T r(s_t, a_t)$ be the sum of undiscounted rewards in a trajectory $\tau$. The stochastic optimization problem we face is to maximize:

<a id="YjeNM7a2so"></a>

$$
J(\boldsymbol{w}) = \mathbb{E}_{\tau \sim p(\tau;\boldsymbol{w})}[G(\tau)]
$$

[(1)](#YjeNM7a2so "Link to this Equation")

where $\tau = (s_0,a_0,s_1,a_1,...)$ is a trajectory and $G(\tau)$ is the total return. Applying the score function estimator, we get:

<a id="O9Flowqom8"></a>

$$
\begin{align*}
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) &= \nabla_{\boldsymbol{w}}\mathbb{E}_{\tau}[G(\tau)] \\
&= \mathbb{E}_{\tau}\left[G(\tau)\nabla_{\boldsymbol{w}}\log p(\tau;\boldsymbol{w})\right] \\
&= \mathbb{E}_{\tau}\left[G(\tau)\nabla_{\boldsymbol{w}}\sum_{t=0}^T\log \pi_{\boldsymbol{w}}(a_t|s_t)\right] \\
&= \mathbb{E}_{\tau}\left[G(\tau)\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\right]
\end{align*}
$$

[(2)](#O9Flowqom8 "Link to this Equation")

We have eliminated the need to know the transition probabilities in this estimator since the probability of a trajectory factorizes as:

<a id="MEGVHOuFR5"></a>

$$
p(\tau;\boldsymbol{w}) = p(s_0)\prod_{t=0}^T \pi_{\boldsymbol{w}}(a_t|s_t)p(s_{t+1}|s_t,a_t)
$$

[(3)](#MEGVHOuFR5 "Link to this Equation")

Therefore, only the policy depends on $\boldsymbol{w}$. When taking the logarithm of this product, we get a sum where all the $\boldsymbol{w}$\-independent terms vanish. The final estimator samples trajectories under the distribution $p(\tau; \boldsymbol{w})$ and computes:

<a id="PnH2TKMns6"></a>

$$
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) \approx \frac{1}{N}\sum_{i=1}^N\left[G(\tau^{(i)})\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t^{(i)}|s_t^{(i)})\right]
$$

[(4)](#PnH2TKMns6 "Link to this Equation")

This is a direct application of the score function estimator. However, we rarely use this form in practice and instead make several improvements to further reduce the variance.

<a id="leveraging-conditional-independence"></a>

### Leveraging Conditional Independence

Given the Markov property of the MDP, rewards $r_k$ for $k < t$ are conditionally independent of action $a_t$ given the history $h_t = (s_0,a_0,...,s_{t-1},a_{t-1},s_t)$. This allows us to only need to consider future rewards when computing policy gradients.

<a id="Xrz1fUHdB5"></a>

$$
\begin{align*}
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) &= \mathbb{E}_{\tau}\left[\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\sum_{k=0}^T r_k\right] \\
&= \mathbb{E}_{\tau}\left[\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\left(\sum_{k=0}^{t-1} r_k + \sum_{k=t}^T r_k\right)\right] \\
&= \mathbb{E}_{\tau}\left[\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\sum_{k=t}^T r_k\right]
\end{align*}
$$

[(5)](#Xrz1fUHdB5 "Link to this Equation")

The conditional independence assumption means that the term $\mathbb{E}_{\tau}\left[\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\sum_{k=0}^{t-1} r_k \right]$ vanishes. To see this, factor the trajectory distribution as:

<a id="RE2GNeRPvm"></a>

$$
p(\tau) = p(s_0,...,s_t,a_0,...,a_{t-1}) \pi_{\boldsymbol{w}}(a_t|s_t) p(s_{t+1},...,s_T,a_{t+1},...,a_T|s_t,a_t)
$$

[(6)](#RE2GNeRPvm "Link to this Equation")

We can now re-write a single term of this summation as:

<a id="Xmp7WyGAaF"></a>

$$
\mathbb{E}_{\tau}\left[\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\sum_{k=0}^{t-1} r_k\right] = \mathbb{E}_{s_{0:t},a_{0:t-1}}\left[\sum_{k=0}^{t-1} r_k \, \mathbb{E}_{a_t}\left[\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\right]\right]
$$

[(7)](#Xmp7WyGAaF "Link to this Equation")

The inner expectation is zero because

<a id="eq-score-function-zero-mean"></a>

$$
\begin{align*}
\mathbb{E}_{a_t}\left[\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\right] &= \int \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\pi_{\boldsymbol{w}}(a_t|s_t)da_t \\
&= \int \frac{\nabla_{\boldsymbol{w}}\pi_{\boldsymbol{w}}(a_t|s_t)}{\pi_{\boldsymbol{w}}(a_t|s_t)}\pi_{\boldsymbol{w}}(a_t|s_t)da_t \\
&= \int \nabla_{\boldsymbol{w}}\pi_{\boldsymbol{w}}(a_t|s_t)da_t \\
&= \nabla_{\boldsymbol{w}}\int \pi_{\boldsymbol{w}}(a_t|s_t)da_t \\
&= \nabla_{\boldsymbol{w}}1 = 0
\end{align*}
$$

[(8)](#eq-score-function-zero-mean "Link to this Equation")

The Monte Carlo estimator becomes:

<a id="TUmS4w7DSR"></a>

$$
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) \approx \frac{1}{N}\sum_{i=1}^N\left[\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t^{(i)}|s_t^{(i)})\sum_{k=t}^T r_k^{(i)}\right]
$$

[(9)](#TUmS4w7DSR "Link to this Equation")

This gives us the REINFORCE algorithm:

<a id="reinforce"></a>

[Algorithm 1](#reinforce "Link to this Algorithm") (REINFORCE)

**Input:** Policy parameterization $\pi_{\boldsymbol{w}}(a|s)$  
**Output:** Updated policy parameters $\boldsymbol{w}$  
**Hyperparameters:** Learning rate $\alpha$, number of episodes $N$, episode length $T$

1.  Initialize parameters $\boldsymbol{w}$
    
2.  For episode = 1, ..., $N$ do:
    
    1.  Collect trajectory $\tau = (s_0, a_0, r_0, ..., s_T, a_T, r_T)$ using policy $\pi_{\boldsymbol{w}}(a|s)$
        
    2.  Compute returns: $G_t = \sum_{k=t}^T r_k$ for $t = 0, ..., T$
        
    3.  Compute gradient estimate: $\hat{g} = \sum_{t=0}^T \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t) G_t$
        
    4.  Update policy: $\boldsymbol{w} \leftarrow \boldsymbol{w} + \alpha \hat{g}$
        
3.  Return $\boldsymbol{w}$
    

The benefit of this estimator compared to the naive one (which would weight each score function by the full trajectory return $G(\tau)$) is that it generally has less variance. This variance reduction arises from the conditional independence structure we exploited: past rewards do not depend on future actions. More formally, this estimator is an instance of a variance reduction technique known as the Extended Conditional Monte Carlo Method.

<a id="the-surrogate-loss-perspective"></a>

#### The Surrogate Loss Perspective

The algorithm above computes a gradient estimate $\hat{g}$ explicitly. In practice, implementations using automatic differentiation frameworks take a different approach: they define a **surrogate loss** whose gradient matches the REINFORCE estimator. For a single trajectory, consider:

<a id="G0kcveJWKk"></a>

$$
L_{\text{surrogate}}(\boldsymbol{w}) = -\sum_{t=0}^T \log \pi_{\boldsymbol{w}}(a_t|s_t) \, G_t
$$

[(10)](#G0kcveJWKk "Link to this Equation")

where the returns $G_t$ and actions $a_t$ are treated as fixed constants (detached from the computation graph). Taking the gradient with respect to $\boldsymbol{w}$:

<a id="t3tLW3HUv4"></a>

$$
\nabla_{\boldsymbol{w}} L_{\text{surrogate}} = -\sum_{t=0}^T \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t) \, G_t
$$

[(11)](#t3tLW3HUv4 "Link to this Equation")

Minimizing this surrogate loss via gradient descent yields the same update as maximizing expected return via REINFORCE. The negative sign converts our maximization problem into a minimization suitable for standard optimizers.

This surrogate loss is **not** the expected return $J(\boldsymbol{w})$ we are trying to maximize. It is a computational device that produces the correct gradient at the current parameter values. Several properties distinguish it from a true loss function:

1.  **It changes each iteration.** The returns $G_t$ come from trajectories sampled under the current policy. After updating $\boldsymbol{w}$, we must collect new trajectories and construct a new surrogate loss.
    
2.  **Its value is not meaningful.** Unlike supervised learning where the loss measures prediction error, the numerical value of $L_{\text{surrogate}}$ has no direct interpretation. Only its gradient matters.
    
3.  **It is valid only locally.** The surrogate loss provides the correct gradient only at the parameters used to collect the data. Moving far from those parameters invalidates the gradient estimate.
    

This perspective explains why policy gradient code often looks different from the pseudocode above. Instead of computing $\hat{g}$ explicitly, implementations define the surrogate loss and call `loss.backward()`:

```python
# Surrogate loss implementation (single trajectory)
log_probs = [policy.log_prob(a_t, s_t) for s_t, a_t in trajectory]
returns = compute_returns(rewards)
surrogate_loss = -sum(lp * G for lp, G in zip(log_probs, returns))
surrogate_loss.backward()  # computes REINFORCE gradient
optimizer.step()
```

<a id="variance-reduction-via-control-variates"></a>

### Variance Reduction via Control Variates

Recall that the REINFORCE gradient estimator, after leveraging conditional independence, takes the form:

<a id="OTIqtIAFRf"></a>

$$
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) \approx \frac{1}{N}\sum_{i=1}^N\left[\sum_{t=0}^T\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t^{(i)}|s_t^{(i)})\sum_{k=t}^T r_k^{(i)}\right]
$$

[(12)](#OTIqtIAFRf "Link to this Equation")

This is a sum over trajectories and timesteps. The gradient contribution at timestep $t$ of trajectory $i$ is:

<a id="rooRoD72TV"></a>

$$
\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t^{(i)}|s_t^{(i)})\sum_{k=t}^T r_k^{(i)}
$$

[(13)](#rooRoD72TV "Link to this Equation")

While unbiased, this estimator suffers from high variance because the return $\sum_{k=t}^T r_k$ can vary significantly across trajectories even for the same state-action pair. The control variate method provides a principled way to reduce this variance.

<a id="general-control-variate-theory"></a>

#### General Control Variate Theory

For a general estimator $Z$ of some quantity $\mu = \mathbb{E}[Z]$, and a control variate $C$ with known expectation $\mathbb{E}[C]=0$, we can construct:

<a id="Ol5vMCHcrW"></a>

$$
Z_{\text{cv}} = Z - \alpha C
$$

[(14)](#Ol5vMCHcrW "Link to this Equation")

This remains unbiased since $\mathbb{E}[Z_{\text{cv}}] = \mathbb{E}[Z] - \alpha\mathbb{E}[C] = \mathbb{E}[Z]$. The variance is:

<a id="uWbsrmmYVr"></a>

$$
\text{Var}(Z_{\text{cv}}) = \text{Var}(Z) + \alpha^2\text{Var}(C) - 2\alpha\text{Cov}(Z,C)
$$

[(15)](#uWbsrmmYVr "Link to this Equation")

The $-2\alpha\text{Cov}(Z,C)$ term is what enables variance reduction. If $Z$ and $C$ are positively correlated, we can choose $\alpha > 0$ to make this term negative and large in magnitude, reducing the overall variance. However, the $\alpha^2\text{Var}(C)$ term grows quadratically with $\alpha$, so if we make $\alpha$ too large, this quadratic term will eventually dominate and the variance will increase rather than decrease. The variance as a function of $\alpha$ is a parabola opening upward, with a unique minimum. Setting $\frac{d}{d\alpha}\text{Var}(Z_{\text{cv}}) = 0$ gives:

<a id="mblesJf3ZT"></a>

$$
\alpha^* = \frac{\text{Cov}(Z,C)}{\text{Var}(C)}
$$

[(16)](#mblesJf3ZT "Link to this Equation")

This is the coefficient from ordinary least squares regression: we predict the estimator $Z$ using the control variate $C$ as the predictor. Since $\mathbb{E}[C] = 0$, the linear model is $Z \approx \mathbb{E}[Z] + \alpha^* C$, where $\alpha^*$ is the OLS slope coefficient. The control variate estimator $Z_{\text{cv}} = Z - \alpha^* C$ computes the residual: the part of $Z$ that cannot be explained by $C$.

Substituting $\alpha^*$ into the variance formula yields:

<a id="loWK10B33l"></a>

$$
\text{Var}(Z_{\text{cv}}) = \text{Var}(Z) - \frac{[\text{Cov}(Z,C)]^2}{\text{Var}(C)} = (1 - R^2) \text{Var}(Z)
$$

[(17)](#loWK10B33l "Link to this Equation")

where $R^2 = \frac{[\text{Cov}(Z,C)]^2}{\text{Var}(Z)\text{Var}(C)}$ is the coefficient of determination from regressing $Z$ on $C$. The variance reduction is $R^2 \text{Var}(Z)$: the better $C$ predicts $Z$, the more variance we eliminate.

<a id="application-to-reinforce"></a>

#### Application to REINFORCE

In the reinforcement learning setting, our REINFORCE gradient estimator is a sum over timesteps: $\sum_{t=0}^T Z_t$ where each $Z_t$ represents the gradient contribution at timestep $t$. We apply control variates separately to each term. Since $\text{Var}(\sum_t Z_t) = \sum_t \text{Var}(Z_t) + \sum_{t \neq s} \text{Cov}(Z_t, Z_s)$, reducing the variance of each $Z_t$ reduces the total variance, though we do not explicitly address the cross-timestep covariance terms.

For a given trajectory at state $s_t$, the gradient contribution at time $t$ is:

<a id="kgopBZd8kJ"></a>

$$
Z_t = \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\sum_{k=t}^T r_k
$$

[(18)](#kgopBZd8kJ "Link to this Equation")

This is the product of the score function $\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)$ and the return-to-go $\sum_{k=t}^T r_k$. We can subtract any state-dependent function $b(s_t)$ from the return without introducing bias, as long as $b(s_t)$ does not depend on $a_t$. This is because:

<a id="xvVhQxVovb"></a>

$$
\mathbb{E}_{a_t \sim \pi_{\boldsymbol{w}}(\cdot|s_t)}\left[\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)b(s_t)\right] = b(s_t)\mathbb{E}_{a_t}\left[\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\right] = 0
$$

[(19)](#xvVhQxVovb "Link to this Equation")

where the last equality follows from the score function identity [(8)](#eq-score-function-zero-mean).

We can now define our control variate as:

<a id="K1od1UAiMk"></a>

$$
C_t = \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t) \cdot b(s_t)
$$

[(20)](#K1od1UAiMk "Link to this Equation")

where $b(s_t)$ is a **baseline function** that depends only on the state. This satisfies $\mathbb{E}[C_t|s_t] = 0$. Our control variate estimator becomes:

<a id="jOXuVsxnqO"></a>

$$
Z_{t,\text{cv}} = Z_t - C_t = \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\left(\sum_{k=t}^T r_k - b(s_t)\right)
$$

[(21)](#jOXuVsxnqO "Link to this Equation")

The optimal baseline $b^*(s_t)$ minimizes the variance. To find it, consider the scalar parameter case for simplicity. Write $g(a_t) \equiv \nabla_w \log \pi_w(a_t|s_t)$ and $G_t = \sum_{k=t}^T r_k$. We want to minimize:

<a id="nUPU5hTR8J"></a>

$$
b^*(s_t) = \arg\min_{b} \text{Var}_{a_t \sim \pi_{\boldsymbol{w}}(\cdot|s_t)}\left[g(a_t)(G_t - b)\right]
$$

[(22)](#nUPU5hTR8J "Link to this Equation")

Since the mean does not depend on $b$, minimizing the variance is equivalent to minimizing the second moment $\mathbb{E}[g(a_t)^2(G_t - b)^2|s_t]$. Expanding and taking the derivative with respect to $b$ gives:

<a id="NXWNG8uckY"></a>

$$
b^*(s_t) = \frac{\mathbb{E}_{a_t|s_t}\left[g(a_t)^2 G_t\right]}{\mathbb{E}_{a_t|s_t}\left[g(a_t)^2\right]}
$$

[(23)](#NXWNG8uckY "Link to this Equation")

For vector-valued parameters $\boldsymbol{w}$, we minimize a scalar proxy such as the trace of the covariance matrix, which yields the same formula with $\|\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\|^2$ in place of $g(a_t)^2$:

<a id="NxTFDmx8tD"></a>

$$
b^*(s_t) = \frac{\mathbb{E}_{a_t|s_t}\left[\|\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\|^2 G_t\right]}{\mathbb{E}_{a_t|s_t}\left[\|\nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\|^2\right]}
$$

[(24)](#NxTFDmx8tD "Link to this Equation")

This is the exact optimal baseline: a weighted average of returns where the weights are the squared norms of the score function. In practice, we treat the squared norm as roughly constant across actions at a given state, which leads to the simpler and widely used choice:

<a id="obQWc2cfRz"></a>

$$
b(s_t) \approx \mathbb{E}[G_t|s_t] = v^{\pi_{\boldsymbol{w}}}(s_t)
$$

[(25)](#obQWc2cfRz "Link to this Equation")

With this approximation, the variance-reduced gradient contribution at timestep $t$ becomes:

<a id="JoHDpjG08H"></a>

$$
Z_{\text{cv},t} = \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\left(\sum_{k=t}^T r_k - v^{\pi_{\boldsymbol{w}}}(s_t)\right)
$$

[(26)](#JoHDpjG08H "Link to this Equation")

The term in parentheses is exactly the **advantage function**: $A^{\pi_{\boldsymbol{w}}}(s_t, a_t) = q^{\pi_{\boldsymbol{w}}}(s_t, a_t) - v^{\pi_{\boldsymbol{w}}}(s_t)$, where the Q-function is approximated by the Monte Carlo return $\sum_{k=t}^T r_k$. The full gradient estimate for a trajectory is then the sum over all timesteps:

<a id="fwxj6UTHcv"></a>

$$
\hat{g} = \sum_{t=0}^T Z_{\text{cv},t} = \sum_{t=0}^T \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)\left(G_t - v^{\pi_{\boldsymbol{w}}}(s_t)\right)
$$

[(27)](#fwxj6UTHcv "Link to this Equation")

In practice, we do not have access to the true value function and must learn it. Unlike the methods in the [amortization chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md), where we learned value functions to approximate the _optimal_ Q-function, here our goal is **policy evaluation**: estimating the value of the _current_ policy $\pi_{\boldsymbol{w}}$. The same function approximation techniques apply, but we target $v^{\pi_{\boldsymbol{w}}}$ rather than $v^*$. The simplest approach is to regress from states to Monte Carlo returns, learning what [Williams (1992)](https://doi.org/10.1007/BF00992696) called a “baseline”:

<a id="policy-grad-baseline"></a>

[Algorithm 2](#policy-grad-baseline "Link to this Algorithm") (Policy Gradient with Simple Baseline)

**Input:** Policy parameterization $\pi_{\boldsymbol{w}}(a|s)$, baseline function $b(s;\boldsymbol{\theta})$  
**Output:** Updated policy parameters $\boldsymbol{w}$  
**Hyperparameters:** Learning rates $\alpha_w$, $\alpha_\theta$, number of episodes $N$, episode length $T$

1.  Initialize parameters $\boldsymbol{w}$, $\boldsymbol{\theta}$
    
2.  For episode = 1, ..., $N$ do:
    
    1.  Collect trajectory $\tau = (s_0, a_0, r_0, ..., s_T, a_T, r_T)$ using policy $\pi_{\boldsymbol{w}}(a|s)$
        
    2.  Compute returns: $G_t = \sum_{k=t}^T r_k$ for $t = 0, ..., T$
        
    3.  Update baseline: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \alpha_\theta \nabla_{\boldsymbol{\theta}}\sum_{t=0}^T (G_t - b(s_t;\boldsymbol{\theta}))^2$
        
    4.  Compute gradient estimate: $\hat{g} = \sum_{t=0}^T \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t)(G_t - b(s_t;\boldsymbol{\theta}))$
        
    5.  Update policy: $\boldsymbol{w} \leftarrow \boldsymbol{w} + \alpha_w \hat{g}$
        
3.  Return $\boldsymbol{w}$
    

When implementing this algorithm nowadays, we always use mini-batching to make full use of our GPUs. Therefore, a more representative variant for this algorithm would be:

<a id="policy-grad-cv-batch"></a>

[Algorithm 3](#policy-grad-cv-batch "Link to this Algorithm") (Policy Gradient with Optimal Control Variate and Mini-batches)

**Input:** Policy parameterization $\pi_{\boldsymbol{w}}(a|s)$, value function $v(s;\boldsymbol{\theta})$  
**Output:** Updated policy parameters $\boldsymbol{w}$  
**Hyperparameters:** Learning rates $\alpha_w$, $\alpha_\theta$, number of iterations $N$, episode length $T$, batch size $B$, mini-batch size $M$

1.  Initialize parameters $\boldsymbol{w}$, $\boldsymbol{\theta}$
    
2.  For iteration = 1, ..., N:
    
    1.  Initialize empty buffer $\mathcal{D}$
        
    2.  For b = 1, ..., B:
        
        1.  Collect trajectory $\tau_b = (s_0, a_0, r_0, ..., s_T, a_T, r_T)$ using policy $\pi_{\boldsymbol{w}}(a|s)$
            
        2.  Compute returns: $G_t = \sum_{k=t}^T r_k$ for all t
            
        3.  Store tuple $(s_t, a_t, G_t)_{t=0}^T$ in $\mathcal{D}$
            
    3.  For value\_epoch = 1, ..., K:
        
        1.  Sample mini-batch $\mathcal{B}_v$ of size $M$ from $\mathcal{D}$
            
        2.  Compute value loss: $L_v = \frac{1}{M}\sum_{(s,a,G) \in \mathcal{B}_v} (v(s;\boldsymbol{\theta}) - G)^2$
            
        3.  Update value function: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \alpha_\theta \nabla_{\boldsymbol{\theta}}L_v$
            
    4.  Compute advantages: $A(s,a) = G - v(s;\boldsymbol{\theta})$ for all $(s,a,G) \in \mathcal{D}$
        
    5.  Normalize advantages: $A \leftarrow \frac{A - \mu_A}{\sigma_A}$
        
    6.  For policy\_epoch = 1, ..., J:
        
        1.  Sample mini-batch $\mathcal{B}_\pi$ of size $M$ from $\mathcal{D}$
            
        2.  Compute policy loss: $L_\pi = -\frac{1}{M}\sum_{(s,a,A) \in \mathcal{B}_\pi} \log \pi_{\boldsymbol{w}}(a|s)A$
            
        3.  Update policy: $\boldsymbol{w} \leftarrow \boldsymbol{w} - \alpha_w \nabla_{\boldsymbol{w}}L_\pi$
            
3.  Return $\boldsymbol{w}$
    

The value function is trained by regressing states directly to their sampled Monte Carlo returns $G$. Advantage normalization (step 2.5) is not part of the optimal baseline derivation but improves optimization in practice and is standard in modern implementations.

<a id="generalized-advantage-estimation"></a>

### Generalized Advantage Estimation

The baseline construction gave us a gradient estimator of the form:

<a id="JBjCgYSZyl"></a>

$$
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) \approx \frac{1}{N}\sum_{i=1}^N \sum_{t=0}^T \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t^{(i)}|s_t^{(i)}) \left(G_t^{(i)} - v(s_t^{(i)})\right)
$$

[(28)](#JBjCgYSZyl "Link to this Equation")

where $G_t = \sum_{k=t}^T r_k$ is the Monte Carlo return from time $t$. For each visited state-action pair $(s_t, a_t)$, the term in parentheses

<a id="tKSaBspxlP"></a>

$$
\widehat{A}_t^{\text{MC}} = G_t - v(s_t)
$$

[(29)](#tKSaBspxlP "Link to this Equation")

is a Monte Carlo estimate of the advantage $A^{\pi}(s_t, a_t) = q^{\pi}(s_t, a_t) - v^{\pi}(s_t)$. If the baseline equals the true value function, $v = v^{\pi}$, then $\mathbb{E}[\widehat{A}_t^{\text{MC}} | s_t, a_t] = A^{\pi}(s_t, a_t)$, so this estimator is unbiased.

However, as an estimator it has two limitations. First, it has high variance because $G_t$ depends on all future rewards. Second, it uses the value function only as a baseline, not as a predictor of long-term returns. We essentially discard the information in $v(s_{t+1}), v(s_{t+2}), \ldots$

GAE addresses these issues by constructing a family of estimators that interpolate between pure Monte Carlo and pure bootstrapping. A parameter $\lambda$ controls the bias-variance tradeoff.

<a id="decomposing-the-monte-carlo-advantage"></a>

#### Decomposing the Monte Carlo Advantage

Fix a value function $v(s)$ (not necessarily equal to $v^{\pi}$) and define the one-step **residual**:

<a id="g4vJi06b07"></a>

$$
\delta_t = r_t + \gamma v(s_{t+1}) - v(s_t)
$$

[(30)](#g4vJi06b07 "Link to this Equation")

Start from the Monte Carlo advantage and add and subtract $\gamma v(s_{t+1})$:

<a id="PJu9f8F9iB"></a>

$$
\begin{align*}
G_t - v(s_t) &= r_t + \gamma G_{t+1} - v(s_t) \\
&= r_t + \gamma v(s_{t+1}) - v(s_t) + \gamma(G_{t+1} - v(s_{t+1})) \\
&= \delta_t + \gamma(G_{t+1} - v(s_{t+1}))
\end{align*}
$$

[(31)](#PJu9f8F9iB "Link to this Equation")

Applying this decomposition recursively yields:

<a id="k4VmK4KnGF"></a>

$$
G_t - v(s_t) = \sum_{l=0}^{T-t} \gamma^l \delta_{t+l}
$$

[(32)](#k4VmK4KnGF "Link to this Equation")

The Monte Carlo advantage is exactly the discounted sum of future residuals. This is an algebraic identity, not an approximation.

The sequence $\{\delta_{t+l}\}_{l \geq 0}$ provides incremental corrections to the value function as we move forward in time. The term $\delta_t$ depends only on $(s_t, a_t, s_{t+1})$; $\delta_{t+1}$ depends on $(s_{t+1}, a_{t+1}, s_{t+2})$, and so on. As $l$ increases, the corrections become more noisy (they depend on more random outcomes) and more sensitive to errors in the value function at later states. Although the full sum is unbiased when $v = v^{\pi}$, it can have high variance and can be badly affected by approximation error in $v$.

<a id="gae-as-a-shrinkage-estimator"></a>

#### GAE as a Shrinkage Estimator

The decomposition above suggests a family of estimators that downweight residuals farther in the future. Let $\lambda \in [0,1]$ and define:

<a id="eq-gae-definition"></a>

$$
A_t^{\lambda} = \sum_{l=0}^{T-t} (\gamma\lambda)^l \delta_{t+l}
$$

[(33)](#eq-gae-definition "Link to this Equation")

This is the **generalized advantage estimator** $A_t^{\text{GAE}(\gamma,\lambda)}$.

Two special cases illustrate the extremes. When $\lambda = 1$, we recover the Monte Carlo advantage:

<a id="eodAuWhFH6"></a>

$$
A_t^{\lambda=1} = \sum_{l=0}^{T-t} \gamma^l \delta_{t+l} = G_t - v(s_t)
$$

[(34)](#eodAuWhFH6 "Link to this Equation")

When $\lambda = 0$, we keep only the immediate residual:

<a id="uJuJEVMHMX"></a>

$$
A_t^{\lambda=0} = \delta_t = r_t + \gamma v(s_{t+1}) - v(s_t)
$$

[(35)](#uJuJEVMHMX "Link to this Equation")

Intermediate values $0 < \lambda < 1$ interpolate between these extremes. The influence of $\delta_{t+l}$ decays geometrically as $(\gamma\lambda)^l$. The parameter $\lambda$ acts as a shrinkage parameter: small $\lambda$ shrinks the estimator toward the one-step residual; large $\lambda$ allows the estimator to behave more like the Monte Carlo advantage.

If $v = v^{\pi}$ is the true value function, then $\mathbb{E}[\delta_t | s_t, a_t] = A^{\pi}(s_t, a_t)$ and $\mathbb{E}[\delta_{t+l} | s_t, a_t] = 0$ for $l \geq 1$. In this case:

<a id="JjtVNMBUzN"></a>

$$
\mathbb{E}[A_t^{\lambda} | s_t, a_t] = \sum_{l=0}^{T-t} (\gamma\lambda)^l \mathbb{E}[\delta_{t+l} | s_t, a_t] = A^{\pi}(s_t, a_t)
$$

[(36)](#JjtVNMBUzN "Link to this Equation")

for all $\lambda \in [0,1]$. When the value function is exact, GAE is unbiased regardless of $\lambda$; changing $\lambda$ only affects variance.

In practice, we approximate $v^{\pi}$ with a function approximator, and the residuals $\delta_{t+l}$ inherit approximation error. Distant residuals involve multiple applications of the approximate value function and are more contaminated by modeling error. Downweighting them (choosing $\lambda < 1$) introduces bias but can reduce variance and limit the impact of those errors.

<a id="mixture-of-multi-step-estimators"></a>

#### Mixture of Multi-Step Estimators

Another perspective on GAE comes from multi-step returns. Define the $k$\-step return from time $t$:

<a id="IjXphtQd7U"></a>

$$
G_t^{(k)} = \sum_{l=0}^{k-1} \gamma^l r_{t+l} + \gamma^k v(s_{t+k})
$$

[(37)](#IjXphtQd7U "Link to this Equation")

and the corresponding $k$\-step advantage estimator $A_t^{(k)} = G_t^{(k)} - v(s_t)$. Each $A_t^{(k)}$ uses $k$ rewards before bootstrapping; larger $k$ means more variance but less bootstrapping error.

The GAE estimator can be written as a geometric mixture:

<a id="ikRw4TfLfC"></a>

$$
A_t^{\lambda} = (1-\lambda) \sum_{k=1}^{T-t} \lambda^{k-1} A_t^{(k)}
$$

[(38)](#ikRw4TfLfC "Link to this Equation")

GAE is a weighted average of the $k$\-step advantage estimators, with shorter horizons weighted more heavily when $\lambda$ is small.

<a id="using-gae-in-the-policy-gradient"></a>

#### Using GAE in the Policy Gradient

Once we choose $\lambda$, we plug $A_t^{\lambda}$ in place of $G_t - v(s_t)$ in the policy gradient estimator:

<a id="cLQybUQyKB"></a>

$$
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) \approx \frac{1}{N}\sum_{i=1}^N \sum_{t=0}^T \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t^{(i)}|s_t^{(i)}) A_t^{\lambda,(i)}
$$

[(39)](#cLQybUQyKB "Link to this Equation")

We still use a control variate to reduce variance (the baseline $v$), but now we construct the advantage target by smoothing the sequence of residuals $\{\delta_t\}$ with a geometrically decaying kernel.

For the value function, it is convenient to define the **$\lambda$\-return**:

<a id="NGy4ryC4pG"></a>

$$
G_t^{\lambda} = A_t^{\lambda} + v(s_t)
$$

[(40)](#NGy4ryC4pG "Link to this Equation")

When $\lambda = 1$, $G_t^{\lambda}$ reduces to the Monte Carlo return; when $\lambda = 0$, it becomes the one-step bootstrapped target $r_t + \gamma v(s_{t+1})$.

<a id="policy-grad-gae-batch"></a>

[Algorithm 4](#policy-grad-gae-batch "Link to this Algorithm") (Policy Gradient with GAE and Mini-batches)

**Input:** Policy parameterization $\pi_{\boldsymbol{w}}(a|s)$, value function $v(s;\boldsymbol{\theta})$  
**Output:** Updated policy parameters $\boldsymbol{w}$  
**Hyperparameters:** Learning rates $\alpha_w$, $\alpha_\theta$, number of iterations $N$, episode length $T$, batch size $B$, mini-batch size $M$, discount $\gamma$, GAE parameter $\lambda$

1.  Initialize parameters $\boldsymbol{w}$, $\boldsymbol{\theta}$
    
2.  For iteration = 1, ..., $N$:
    
    1.  Initialize empty buffer $\mathcal{D}$
        
    2.  For $b = 1, ..., B$:
        
        1.  Collect trajectory $\tau_b = (s_0, a_0, r_0, ..., s_T, a_T, r_T)$ using policy $\pi_{\boldsymbol{w}}(a|s)$
            
        2.  Compute value predictions $v_t = v(s_t;\boldsymbol{\theta})$ for $t = 0, \ldots, T$ and set $v_{T+1} = 0$
            
        3.  Compute residuals: $\delta_t = r_t + \gamma v_{t+1} - v_t$ for $t = 0, \ldots, T$
            
        4.  Compute GAE advantages backwards:
            
            1.  Set $A_T = \delta_T$
                
            2.  For $t = T-1, ..., 0$: $A_t = \delta_t + (\gamma\lambda) A_{t+1}$
                
        5.  Compute $\lambda$\-returns: $G_t^{\lambda} = A_t + v_t$ for $t = 0, \ldots, T$
            
        6.  Store tuples $(s_t, a_t, A_t, G_t^{\lambda})_{t=0}^T$ in $\mathcal{D}$
            
    3.  For value\_epoch = 1, ..., $K$:
        
        1.  Sample mini-batch $\mathcal{B}_v$ of size $M$ from $\mathcal{D}$
            
        2.  Compute value loss: $L_v = \frac{1}{M}\sum_{(s,\cdot,\cdot,G^{\lambda}) \in \mathcal{B}_v} (v(s;\boldsymbol{\theta}) - G^{\lambda})^2$
            
        3.  Update value function: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \alpha_\theta \nabla_{\boldsymbol{\theta}}L_v$
            
    4.  Normalize advantages: $A \leftarrow \frac{A - \mu_A}{\sigma_A}$
        
    5.  For policy\_epoch = 1, ..., $J$:
        
        1.  Sample mini-batch $\mathcal{B}_\pi$ of size $M$ from $\mathcal{D}$
            
        2.  Compute policy loss: $L_\pi = -\frac{1}{M}\sum_{(s,a,A,\cdot) \in \mathcal{B}_\pi} \log \pi_{\boldsymbol{w}}(a|s) A$
            
        3.  Update policy: $\boldsymbol{w} \leftarrow \boldsymbol{w} - \alpha_w \nabla_{\boldsymbol{w}}L_\pi$
            
3.  Return $\boldsymbol{w}$
    

When $\lambda = 1$, this reduces (up to advantage normalization) to the Monte Carlo baseline algorithm earlier in the chapter. When $\lambda = 0$, advantages become the one-step residuals $\delta_t$, and the $\lambda$\-returns reduce to standard one-step bootstrapped targets.

<a id="actor-critic-as-the-lambda-0-limit"></a>

#### Actor-Critic as the $\lambda = 0$ Limit

The case $\lambda = 0$ is particularly simple. The advantage becomes:

<a id="ZvtIjBI8NA"></a>

$$
A_t^{\lambda=0} = \delta_t = r_t + \gamma v(s_{t+1}) - v(s_t)
$$

[(41)](#ZvtIjBI8NA "Link to this Equation")

and the policy update reduces to:

<a id="FqlA8J1id6"></a>

$$
\boldsymbol{w} \leftarrow \boldsymbol{w} + \alpha_w \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t) \delta_t
$$

[(42)](#FqlA8J1id6 "Link to this Equation")

while the value update becomes a standard one-step regression toward $r_t + \gamma v(s_{t+1})$. This gives the online actor-critic algorithm:

<a id="actor-critic-td0"></a>

[Algorithm 5](#actor-critic-td0 "Link to this Algorithm") (Actor-Critic with One-Step Residuals)

**Input:** Policy parameterization $\pi_{\boldsymbol{w}}(a|s)$, value function $v(s;\boldsymbol{\theta})$  
**Output:** Updated policy parameters $\boldsymbol{w}$  
**Hyperparameters:** Learning rates $\alpha_w$, $\alpha_\theta$, number of episodes $N$, episode length $T$, discount $\gamma$

1.  Initialize parameters $\boldsymbol{w}$, $\boldsymbol{\theta}$
    
2.  For episode = 1, ..., $N$ do:
    
    1.  Initialize state $s_0$
        
    2.  For $t = 0, ..., T$ do:
        
        1.  Sample action: $a_t \sim \pi_{\boldsymbol{w}}(\cdot|s_t)$
            
        2.  Execute $a_t$, observe $r_t$, $s_{t+1}$
            
        3.  Compute residual: $\delta_t = r_t + \gamma v(s_{t+1};\boldsymbol{\theta}) - v(s_t;\boldsymbol{\theta})$
            
        4.  Update value function: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha_\theta \delta_t \nabla_{\boldsymbol{\theta}}v(s_t;\boldsymbol{\theta})$
            
        5.  Update policy: $\boldsymbol{w} \leftarrow \boldsymbol{w} + \alpha_w \nabla_{\boldsymbol{w}}\log \pi_{\boldsymbol{w}}(a_t|s_t) \delta_t$
            
3.  Return $\boldsymbol{w}$
    

This algorithm was derived by Sutton in his 1984 thesis as an “adaptive heuristic” for temporal credit assignment. In the language of this chapter, it is the $\lambda = 0$ member of the GAE family: it uses the most local residual $\delta_t$ as both the target for the value function and the advantage estimate for the policy gradient.

<a id="likelihood-ratio-methods-in-reinforcement-learning"></a>

## Likelihood Ratio Methods in Reinforcement Learning

How do importance ratios and constrained or clipped surrogates reuse trajectories collected under an earlier policy?

The score function estimator from the previous section is a special case of the likelihood ratio method where the proposal distribution equals the target distribution. We now consider the general case where they differ.

Recall the likelihood ratio gradient estimator from the beginning of this chapter. For objective $J(\theta) = \mathbb{E}_{x \sim p(x;\theta)}[f(x)]$ and any proposal distribution $q(x)$:

<a id="FLsmdLw6Ug"></a>

$$
\nabla_\theta J(\theta) = \mathbb{E}_{x \sim q(x)}\left[f(x) \rho(x; q, \theta) \nabla_\theta \log p(x;\theta)\right]
$$

[(43)](#FLsmdLw6Ug "Link to this Equation")

where $\rho(x; q, \theta) = \frac{p(x;\theta)}{q(x)}$ is the likelihood ratio. The partial derivative $\frac{\partial \rho}{\partial \theta} = \rho \nabla_\theta \log p$ holds because $x$ is treated as fixed, having been sampled from $q$, which does not depend on $\theta$.

In reinforcement learning, let $x = \tau$ be a trajectory, $f(\tau) = G(\tau)$ the return, $p(\tau;\boldsymbol{w})$ the trajectory distribution under policy $\pi_{\boldsymbol{w}}$, and $q(\tau)$ the trajectory distribution under some other policy $\pi_q$. The gradient becomes:

<a id="ohdTmWFtHf"></a>

$$
\nabla_{\boldsymbol{w}} J(\boldsymbol{w}) = \mathbb{E}_{\tau \sim \pi_q}\left[G(\tau) \rho(\tau) \sum_{t=0}^T \nabla_{\boldsymbol{w}} \log \pi_{\boldsymbol{w}}(a_t|s_t)\right]
$$

[(44)](#ohdTmWFtHf "Link to this Equation")

where the trajectory likelihood ratio simplifies because transition probabilities cancel:

<a id="IDNtYxZl9k"></a>

$$
\rho(\tau) = \frac{p(\tau;\boldsymbol{w})}{q(\tau)} = \prod_{t=0}^T \frac{\pi_{\boldsymbol{w}}(a_t|s_t)}{\pi_q(a_t|s_t)} = \prod_{t=0}^T \rho_t
$$

[(45)](#IDNtYxZl9k "Link to this Equation")

This product of $T+1$ ratios can become extremely large or small as $T$ grows, leading to high variance. The temporal structure provides some relief: since $\mathbb{E}_{a \sim \pi_q}[\rho] = 1$, future ratios $\rho_{k}$ for $k > t$ that do not affect the reward $r_t$ can be marginalized out. However, past ratios $\rho_{0:t-1}$ are still needed to correctly weight the probability of reaching state $s_t$.

In practice, algorithms like PPO and TRPO make an additional approximation: they use only the per-step ratio $\rho_t$ rather than the cumulative product $\rho_{0:t}$. This ignores the mismatch between the state distributions induced by the two policies. Combined with a baseline $b(s_t)$, the approximate estimator is:

<a id="eq-lr-estimator"></a>

$$
\nabla_{\boldsymbol{w}} J(\boldsymbol{w}) \approx \mathbb{E}_{\tau \sim \pi_q}\left[\sum_{t=0}^T \rho_t \nabla_{\boldsymbol{w}} \log \pi_{\boldsymbol{w}}(a_t|s_t) (G_t - b(s_t))\right]
$$

[(46)](#eq-lr-estimator "Link to this Equation")

This approximation corresponds to maximizing the **importance-weighted surrogate objective**:

<a id="eq-importance-weighted-surrogate"></a>

$$
L^{\text{IS}}(\boldsymbol{w}) = \mathbb{E}_{\tau \sim \pi_q}\left[\sum_{t=0}^T \rho_t A_t\right]
$$

[(47)](#eq-importance-weighted-surrogate "Link to this Equation")

where $A_t = G_t - b(s_t)$. Taking the gradient with respect to $\boldsymbol{w}$, only $\rho_t$ depends on $\boldsymbol{w}$ (since trajectories are sampled from $\pi_q$):

<a id="CWcwlSE508"></a>

$$
\nabla_{\boldsymbol{w}} L^{\text{IS}}(\boldsymbol{w}) = \mathbb{E}_{\tau \sim \pi_q}\left[\sum_{t=0}^T A_t \nabla_{\boldsymbol{w}} \rho_t\right]
$$

[(48)](#CWcwlSE508 "Link to this Equation")

The gradient of the ratio is:

<a id="xGQEwPfIz5"></a>

$$
\nabla_{\boldsymbol{w}} \rho_t = \nabla_{\boldsymbol{w}} \frac{\pi_{\boldsymbol{w}}(a_t|s_t)}{\pi_q(a_t|s_t)} = \frac{\nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}}(a_t|s_t)}{\pi_q(a_t|s_t)} = \rho_t \nabla_{\boldsymbol{w}} \log \pi_{\boldsymbol{w}}(a_t|s_t)
$$

[(49)](#xGQEwPfIz5 "Link to this Equation")

Substituting back:

<a id="NaHGUOQfhJ"></a>

$$
\nabla_{\boldsymbol{w}} L^{\text{IS}}(\boldsymbol{w}) = \mathbb{E}_{\tau \sim \pi_q}\left[\sum_{t=0}^T \rho_t \nabla_{\boldsymbol{w}} \log \pi_{\boldsymbol{w}}(a_t|s_t) A_t\right]
$$

[(50)](#NaHGUOQfhJ "Link to this Equation")

This matches equation [(46)](#eq-lr-estimator). When $\pi_q = \pi_{\boldsymbol{w}}$, the ratios $\rho_t = 1$ and we recover the score function estimator. The approximation error grows as the policies diverge, which motivates the trust region and clipping mechanisms discussed below.

<a id="variance-and-the-dominance-condition"></a>

### Variance and the Dominance Condition

The ratio $\rho_t = \pi_{\boldsymbol{w}}(a_t|s_t)/\pi_q(a_t|s_t)$ is well-behaved only when the two policies are similar. If $\pi_{\boldsymbol{w}}$ assigns high probability to an action where $\pi_q$ assigns low probability, the ratio explodes. For example, if $\pi_q(a|s) = 0.01$ and $\pi_{\boldsymbol{w}}(a|s) = 0.5$, then $\rho = 50$, amplifying any noise in the advantage estimate.

Importance sampling also requires the **dominance condition**: the support of $\pi_{\boldsymbol{w}}$ must be contained in the support of $\pi_q$. If $\pi_{\boldsymbol{w}}(a|s) > 0$ but $\pi_q(a|s) = 0$, the ratio is undefined. Stochastic policies typically have full support, but the ratio can still become arbitrarily large as $\pi_q(a|s) \to 0$.

A common use case is to set $\pi_q = \pi_{\boldsymbol{w}_{\text{old}}}$, a previous version of the policy. This allows reusing data across multiple gradient steps: collect trajectories once, then update $\boldsymbol{w}$ several times. But each update moves $\boldsymbol{w}$ further from $\boldsymbol{w}_{\text{old}}$, making the ratios more extreme. Eventually, the gradient signal is dominated by a few samples with large weights.

<a id="proximal-policy-optimization"></a>

### Proximal Policy Optimization

The variance issues suggest a natural solution: keep the ratio $\rho_t$ close to 1 by ensuring the new policy stays close to the behavior policy. This keeps the importance-weighted surrogate $L^{\text{IS}}(\boldsymbol{w})$ from [(47)](#eq-importance-weighted-surrogate) well-behaved.

Trust Region Policy Optimization (TRPO) formalizes this by adding a constraint on the KL divergence between the old and new policies:

<a id="yLpaFGZ0UB"></a>

$$
\max_{\boldsymbol{w}} L^{\text{IS}}(\boldsymbol{w}) \quad \text{subject to} \quad \mathbb{E}_s\left[D_{\text{KL}}(\pi_{\boldsymbol{w}_{\text{old}}}(\cdot|s) \| \pi_{\boldsymbol{w}}(\cdot|s))\right] \leq \delta
$$

[(51)](#yLpaFGZ0UB "Link to this Equation")

The KL constraint ensures that the two distributions remain similar, which bounds how extreme the importance weights can become. This is a constrained optimization problem, and one could in principle apply standard methods such as projected gradient descent or augmented Lagrangian approaches (as discussed in the [trajectory optimization chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md)). TRPO takes a different approach: it uses a second-order Taylor approximation of the KL constraint around the current parameters and solves the resulting trust region subproblem using conjugate gradient methods. This involves computing the Fisher information matrix (the Hessian of the KL divergence), which adds computational overhead.

Proximal Policy Optimization (PPO) achieves similar behavior through a simpler mechanism: rather than constraining the distributions to be similar, it directly clips the ratio $\rho_t$ to prevent it from moving too far from 1. This is a construction-level guarantee rather than an optimization-level constraint.

<a id="from-trajectory-expectations-to-state-action-averages"></a>

#### From Trajectory Expectations to State-Action Averages

Before defining the PPO objective, we need to clarify the relationship between the trajectory-level surrogate [(47)](#eq-importance-weighted-surrogate) and the state-action level objective that PPO actually optimizes. The importance-weighted surrogate is defined as an expectation over trajectories:

<a id="zyms4VlfXu"></a>

$$
L^{\text{IS}}(\boldsymbol{w}) = \mathbb{E}_{\tau \sim \pi_q}\left[\sum_{t=0}^T \rho_t A_t\right]
$$

[(52)](#zyms4VlfXu "Link to this Equation")

We can rewrite this as an expectation over state-action pairs by introducing a sampling distribution. For a finite horizon $T$, define the **averaged time-marginal distribution**:

<a id="eq-time-marginal"></a>

$$
\xi_{\pi_q}(s, a) = \frac{1}{T+1} \sum_{t=0}^{T} d_t^{\pi_q}(s) \pi_q(a|s)
$$

[(53)](#eq-time-marginal "Link to this Equation")

where $d_t^{\pi_q}(s)$ is the probability of being in state $s$ at time $t$ when following policy $\pi_q$ from the initial distribution. This is the uniform mixture over the time-indexed state-action distributions: we pick a timestep $t$ uniformly at random from $\{0, 1, \ldots, T\}$, then sample $(s, a)$ from the joint distribution at that timestep.

With this definition, the trajectory expectation becomes:

<a id="E16uqZzyrl"></a>

$$
\mathbb{E}_{\tau \sim \pi_q}\left[\sum_{t=0}^T \rho_t A_t\right] = (T+1) \cdot \mathbb{E}_{(s,a) \sim \xi_{\pi_q}}\left[\rho(s, a) A(s, a)\right]
$$

[(54)](#E16uqZzyrl "Link to this Equation")

The factor $(T+1)$ is just a constant that does not affect the optimization. This reformulation shows that the importance-weighted surrogate is equivalent to an expectation over state-action pairs drawn from the averaged time-marginal distribution. This is not a stationary distribution or a discounted visitation distribution, but the empirical mixture induced by the finite-horizon rollout procedure.

<a id="the-clipped-surrogate-objective"></a>

#### The Clipped Surrogate Objective

PPO replaces the linear importance-weighted term $\rho A$ with a clipped version. For a state-action pair $(s, a)$ with advantage $A$ and importance ratio $\rho(\boldsymbol{w}) = \pi_{\boldsymbol{w}}(a|s) / \pi_{\boldsymbol{w}_{\text{old}}}(a|s)$, define the **per-sample clipped objective**:

<a id="eq-ppo-per-sample"></a>

$$
\ell^{\text{CLIP}}(\boldsymbol{w}; s, a, A) = \min\left(\rho(\boldsymbol{w}) A, \, \text{clip}(\rho(\boldsymbol{w}), 1-\epsilon, 1+\epsilon) A\right)
$$

[(55)](#eq-ppo-per-sample "Link to this Equation")

where $\epsilon$ is a hyperparameter (typically 0.1 or 0.2) and $\text{clip}(x, a, b) = \max(a, \min(x, b))$ restricts $x$ to the interval $[a, b]$.

The **population-level PPO objective** is then:

<a id="eq-ppo-clip-population"></a>

$$
L^{\text{CLIP}}(\boldsymbol{w}) = \mathbb{E}_{(s,a,A) \sim \xi_{\pi_{\boldsymbol{w}_{\text{old}}}}}\left[\ell^{\text{CLIP}}(\boldsymbol{w}; s, a, A)\right]
$$

[(56)](#eq-ppo-clip-population "Link to this Equation")

where the expectation is taken over the averaged time-marginal distribution [(53)](#eq-time-marginal) induced by $\pi_{\boldsymbol{w}_{\text{old}}}$.

In practice, we never compute this expectation exactly. Instead, we collect a batch of transitions $\mathcal{D} = \{(s_t^{(i)}, a_t^{(i)}, A_t^{(i)})\}$ by running $\pi_{\boldsymbol{w}_{\text{old}}}$ and approximate the expectation with an empirical average:

<a id="eq-ppo-clip"></a>

$$
\hat{L}^{\text{CLIP}}(\boldsymbol{w}; \mathcal{D}) = \frac{1}{|\mathcal{D}|} \sum_{(s,a,A) \in \mathcal{D}} \ell^{\text{CLIP}}(\boldsymbol{w}; s, a, A)
$$

[(57)](#eq-ppo-clip "Link to this Equation")

This is the same plug-in approximation used in [fitted Q-iteration](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/23-fitted-q-iteration.md): replace the unknown population distribution with the empirical distribution $\hat{P}_{\mathcal{D}}$ induced by the collected batch, then compute the sample average. The empirical surrogate $\hat{L}^{\text{CLIP}}$ is simply an expectation under $\hat{P}_{\mathcal{D}}$. No assumptions about stationarity or discounted visitation are needed. We just average over the transitions we collected.

<a id="intuition-for-the-clipping-mechanism"></a>

#### Intuition for the Clipping Mechanism

The $\min$ operator in [(55)](#eq-ppo-per-sample) selects the more pessimistic estimate. Consider the two cases:

-   **Positive advantage** ($A > 0$): The action is better than average, so we want to increase $\pi_{\boldsymbol{w}}(a|s)$. The unclipped term $\rho A$ increases with $\rho$. The clipped term stops increasing once $\rho > 1 + \epsilon$. Taking the minimum means we get the benefit of increasing $\rho$ only up to $1 + \epsilon$.
    
-   **Negative advantage** ($A < 0$): The action is worse than average, so we want to decrease $\pi_{\boldsymbol{w}}(a|s)$. The unclipped term $\rho A$ becomes less negative (improves) as $\rho$ decreases. The clipped term stops improving once $\rho < 1 - \epsilon$. Taking the minimum means we get the benefit of decreasing $\rho$ only down to $1 - \epsilon$.
    

In both cases, the clipping removes the incentive to move the probability ratio beyond the interval $[1-\epsilon, 1+\epsilon]$. This keeps the new policy close to the old policy without explicitly computing or constraining the KL divergence.

<a id="ppo"></a>

[Algorithm 6](#ppo "Link to this Algorithm") (Proximal Policy Optimization (PPO-Clip))

**Input:** Policy $\pi_{\boldsymbol{w}}(a|s)$, value function $v(s;\boldsymbol{\theta})$  
**Output:** Updated parameters $\boldsymbol{w}$  
**Hyperparameters:** Clip parameter $\epsilon$, learning rates $\alpha_w$, $\alpha_\theta$, number of iterations $N$, batch size $B$, mini-batch size $M$, epochs per iteration $K$, GAE parameters $\gamma$, $\lambda$

1.  Initialize parameters $\boldsymbol{w}$, $\boldsymbol{\theta}$
    
2.  For iteration = 1, ..., $N$:
    
    1.  Collect batch $\mathcal{D}$ of $B$ trajectories using policy $\pi_{\boldsymbol{w}}$
        
    2.  Compute GAE advantages $A_t$ and $\lambda$\-returns $G_t^{\lambda}$ for all timesteps
        
    3.  Store old log-probabilities: $\log \pi_{\text{old}}(a_t|s_t) = \log \pi_{\boldsymbol{w}}(a_t|s_t)$ for all $(s_t, a_t)$
        
    4.  Normalize advantages: $A \leftarrow \frac{A - \mu_A}{\sigma_A}$
        
    5.  For epoch = 1, ..., $K$:
        
        1.  Shuffle $\mathcal{D}$ and partition into mini-batches of size $M$
            
        2.  For each mini-batch $\mathcal{B}$:
            
            1.  Compute ratios: $\rho = \exp(\log \pi_{\boldsymbol{w}}(a|s) - \log \pi_{\text{old}}(a|s))$ for all $(s, a) \in \mathcal{B}$
                
            2.  Compute per-sample objectives: $\ell^{\text{CLIP}} = \min(\rho A, \text{clip}(\rho, 1-\epsilon, 1+\epsilon) A)$
                
            3.  Compute empirical surrogate: $\hat{L}^{\text{CLIP}} = \frac{1}{|\mathcal{B}|}\sum_{(s,a,A) \in \mathcal{B}} \ell^{\text{CLIP}}$
                
            4.  Compute value loss: $L_v = \frac{1}{|\mathcal{B}|}\sum_{(s,G^{\lambda}) \in \mathcal{B}} (v(s;\boldsymbol{\theta}) - G^{\lambda})^2$
                
            5.  Update policy: $\boldsymbol{w} \leftarrow \boldsymbol{w} + \alpha_w \nabla_{\boldsymbol{w}} \hat{L}^{\text{CLIP}}$
                
            6.  Update value function: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \alpha_\theta \nabla_{\boldsymbol{\theta}} L_v$
                
3.  Return $\boldsymbol{w}$
    

The algorithm collects a batch of trajectories, then performs $K$ epochs of mini-batch updates on the same data. The empirical surrogate $\hat{L}^{\text{CLIP}}$ approximates the population objective [(56)](#eq-ppo-clip-population) using samples from the averaged time-marginal distribution. The ratio $\rho$ is computed in log-space for numerical stability. Clipping removes the local incentive to move a sampled probability ratio beyond the chosen interval. It does not guarantee that the sampled updates will find a successful policy, and it says nothing about physical constraints absent from the reward or environment.

<a id="experiment-ppo-on-the-swingrl-plant"></a>

### Experiment: PPO on the SwingRL Plant

The SwingRL model from the [modeling chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/03-modeling-controlled-systems.md#internal-actuation-in-swingrl) provides a matched comparison between supplied structure and sampled policy optimization. Both controllers act on the same articulated standing rider, use the same two bounded commands, receive the same observations, and count one full unwrapped rotation as success. The structured controller receives a phase-locked pumping rule whose phases were selected by a model sweep. PPO receives trajectories and the environment reward.

The experiment asks whether the clipped policy-gradient update discovers a full rotation under one fixed, reproducible protocol. The protocol was chosen before inspecting the five final runs.

| quantity | value |
| --- | --- |
| policy and value networks | separate $2 \times 64$ tanh networks |
| requested interactions | 1,000,000 per seed |
| rollout batch | 8 environments $\times$ 256 steps |
| PPO epochs and minibatch | 4 epochs, 256 samples |
| optimizer | Adam, learning rate $3\times10^{-4}$ with linear decay |
| discount and GAE | $\gamma=0.995$, $\lambda=0.95$ |
| clipping and entropy coefficients | 0.2 and 0.001 |
| seeds | 0, 1, 2, 3, 4 |
| evaluation | 100 fixed initial states every 50,000 requested interactions |

Each complete rollout batch contains 2,048 transitions, so the last update is recorded at 1,001,472 interactions. A checkpoint is the first complete update at or beyond its nominal 50,000-interaction target. Evaluation angles are uniform between $-5^\circ$ and $5^\circ$, angular velocities are uniform between \-0.1 and 0.1 rad/s, and the deterministic policy uses the tanh of the Gaussian mean. The environment and the structured baseline use the same 100 states.

<a id="tVmjxnkAhE"></a>

<a id="fig-swing-ppo-replay"></a>

<a id="fig-swing-ppo-replay-code"></a>

```python
import sys
from pathlib import Path
from IPython.display import HTML, display

sys.path.insert(0, "code")
from swing_ppo import replay_player_html

display(HTML(replay_player_html(Path("_static/swing_ppo"))))
```

[Figure 1:](#fig-swing-ppo-replay "Link to this figure")Recorded training replay for seed 0. Checkpoints occur every 50,000 requested interactions, with complete rollout batches producing the recorded counts shown by the slider. Each checkpoint uses the saved deterministic policy from the same $3^\circ$ initial angle. The curve shows raw completed-episode returns and an eight-point trailing mean. The 21 saved policies are compressed into 63 seconds; the overlay reports the original elapsed training time.

<a id="fig-swing-ppo-replay-outputs"></a>

Loading...

The replay is an illustration from one prespecified run, not the evidential comparison. Future observations remain hidden until the movie reaches their checkpoint. The five-seed result below carries the comparison across runs.

[Download the recorded seed-0 replay](https://pierrelucbacon.com/rlbook/build/training_replay-b6170709c336aa5071bb284f383a062f.mp4)

<a id="fig-swing-ppo-learning"></a>

<a id="LKYQWy7vY0"></a>
![Two plots compare five PPO seeds with a structured SwingRL controller. PPO remains at zero success while its mean return improves slightly. The structured controller succeeds from every evaluation state and has a much larger return.](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/940e8d105f-swing_ppo_learning-3e38e82dceefe29d4c587137e25c8c6d.png)

[Figure 2:](#fig-swing-ppo-learning "Link to this figure")Five prespecified PPO seeds evaluated on the same 100 fixed initial states. Thin blue traces show individual seeds; the solid trace and band show the mean and a two-sided 95% $t$ interval with seed as the statistical unit. PPO improves its return early but never completes a rotation. The structured controller succeeds from every state and obtains mean return 191.8; this value is annotated off scale in the return panel so that the smaller PPO change remains visible.

The final policies settle on low-motion behavior. Across the five showcase rollouts, the largest angle lies between $5.45^\circ$ and $5.62^\circ$. Return improves because the policy changes the rider while keeping effort and time penalties modest, but the behavior never approaches the $360^\circ$ success condition.

| controller | training transitions | held-out success | mean return | worst suspension tension |
| --- | --- | --- | --- | --- |
| structured phase controller | 0 | 100% | 191.79 | \-637 N |
| PPO, mean over five final policies | 1,001,472 per seed | 0% | \-5.11 | +387 N |

The comparison does not establish a general ranking between control and RL. The structured controller receives the oscillation phase and a controller family adapted to the mechanism, while PPO must infer useful coordination from sampled returns. Conversely, the structured controller’s nominal success requires negative suspension tension during 7.37 percent of its active steps. A rigid rod can supply that outward force; a playground chain cannot. PPO avoids the violation by barely moving, which is feasible but does not solve the task.

The two failures answer different audit questions. Optimization has not found a successful sampled policy under this protocol. The successful structured policy exposes an inadequate rigid-link model. More interactions or a revised learning objective might address the first failure. A unilateral chain model or an explicit tension constraint is required for the second.

Model audit

Suppose the success bonus were increased until PPO learned to rotate the rigid link. Which reported metric would still prevent the result from establishing a successful playground-swing controller? Identify the missing physical mode and describe an evaluation that would expose it.

The [complete Python implementation](https://pierrelucbacon.com/rlbook/build/swing_ppo-10b1c3c46a5fb28287c99959cf385ce6.py) includes policy sampling, tanh-corrected log probabilities, GAE, PPO updates, batched SwingRL evaluation, checkpoint serialization, and replay rendering. The [experiment record](https://pierrelucbacon.com/rlbook/build/README-bc4a8617084e84f20aba60357d23aa67.md) specifies the artifact layout and reproduction command. Policy training is deliberately absent from the MyST build; the page reads the recorded checkpoints, tables, figures, and movie.

<a id="the-policy-gradient-theorem"></a>

## The Policy Gradient Theorem

How can the trajectory-level score estimator be rewritten as an expectation over discounted state visitation and action values?

The algorithms developed so far (REINFORCE, actor-critic, GAE, and PPO) all estimate policy gradients from sampled trajectories. We now establish the theoretical foundation for these estimators by deriving the policy gradient theorem in the discounted infinite-horizon setting.

Sutton _et al._ (1999) provided the original derivation. Here we present an alternative approach using the Implicit Function Theorem, which frames policy optimization as a bilevel problem:

<a id="h4kNkUl4Iy"></a>

$$
\max_{\mathbf{w}} \alpha^\top \mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}}
$$

[(58)](#h4kNkUl4Iy "Link to this Equation")

subject to:

<a id="c80GCYsx8h"></a>

$$
(\mathbf{I} - \gamma \mathbf{P}_{\pi_{\boldsymbol{w}}}) \mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}} = \mathbf{r}_{\pi_{\boldsymbol{w}}}
$$

[(59)](#c80GCYsx8h "Link to this Equation")

The Implicit Function Theorem states that if there is a solution to the problem $F(\mathbf{v}, \mathbf{w}) = 0$, then we can “reparameterize” our problem as $F(\mathbf{v}(\mathbf{w}), \mathbf{w})$ where $\mathbf{v}(\mathbf{w})$ is an implicit function of $\mathbf{w}$. If the Jacobian $\frac{\partial F}{\partial \mathbf{v}}$ is invertible, then:

<a id="aQ7sgmBVnq"></a>

$$
\frac{d\mathbf{v}(\mathbf{w})}{d\mathbf{w}} = -\left(\frac{\partial F(\mathbf{v}(\mathbf{w}), \mathbf{w})}{\partial \mathbf{v}}\right)^{-1}\frac{\partial F(\mathbf{v}(\mathbf{w}), \mathbf{w})}{\partial \mathbf{w}}
$$

[(60)](#aQ7sgmBVnq "Link to this Equation")

Here we made it clear in our notation that the derivative must be evaluated at root $(\mathbf{v}(\mathbf{w}), \mathbf{w})$ of $F$. For the remaining of this derivation, we will drop this dependence to make notation more compact.

Applying this to our case with $F(\mathbf{v}, \mathbf{w}) = (\mathbf{I} - \gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})\mathbf{v} - \mathbf{r}_{\pi_{\boldsymbol{w}}}$:

<a id="lu3qDQQ7VR"></a>

$$
\frac{\partial \mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}} = (\mathbf{I} - \gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^{-1}\left(\frac{\partial \mathbf{r}_{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}} + \gamma \frac{\partial \mathbf{P}_{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}}\mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}}\right)
$$

[(61)](#lu3qDQQ7VR "Link to this Equation")

Then:

<a id="kJHmspbfkq"></a>

$$
\begin{align*}
\nabla_{\mathbf{w}}J(\mathbf{w}) &= \alpha^\top \frac{\partial \mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}} \\
&= \mathbf{x}_\alpha^\top\left(\frac{\partial \mathbf{r}_{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}} + \gamma \frac{\partial \mathbf{P}_{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}}\mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}}\right)
\end{align*}
$$

[(62)](#kJHmspbfkq "Link to this Equation")

where we have defined the discounted state visitation distribution:

<a id="qiD6XjEcux"></a>

$$
\mathbf{x}_\alpha^\top \equiv \alpha^\top(\mathbf{I} - \gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^{-1}.
$$

[(63)](#qiD6XjEcux "Link to this Equation")

Recall the vector notation for MDPs from the [infinite-horizon MDP chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/18-infinite-horizon-mdps.md):

<a id="tgJ5ocZGPs"></a>

$$
\begin{align*}
\mathbf{r}_\pi(s) &\equiv \sum_{a \in \mathcal{A}_s} \pi(a \mid s) \, r(s, a), \\
[\mathbf{P}_\pi]_{s,s'} &\equiv \sum_{a \in \mathcal{A}_s} \pi(a \mid s) \, p(s' \mid s, a).
\end{align*}
$$

[(64)](#tgJ5ocZGPs "Link to this Equation")

Taking derivatives with respect to $\mathbf{w}$ gives:

<a id="SEyMvW4IOE"></a>

$$
\begin{align*}
\left[\frac{\partial \mathbf{r}_{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}}\right]_s &= \sum_{a \in \mathcal{A}_s} \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s) \, r(s,a), \\
\left[\frac{\partial \mathbf{P}_{\pi_{\boldsymbol{w}}}}{\partial \mathbf{w}}\mathbf{v}_\gamma^{\pi_{\boldsymbol{w}}}\right]_s &= \sum_{a \in \mathcal{A}_s} \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s)\sum_{s'} p(s' \mid s,a) \, v_\gamma^{\pi_{\boldsymbol{w}}}(s').
\end{align*}
$$

[(65)](#SEyMvW4IOE "Link to this Equation")

Substituting back:

<a id="cKkFCRWqMn"></a>

$$
\begin{align*}
\nabla_{\mathbf{w}}J(\mathbf{w}) &= \sum_s x_\alpha(s)\left(\sum_a \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s) \, r(s,a) + \gamma\sum_a \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s)\sum_{s'} p(s' \mid s,a) \, v_\gamma^{\pi_{\boldsymbol{w}}}(s')\right) \\
&= \sum_s x_\alpha(s)\sum_a \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s)\left(r(s,a) + \gamma \sum_{s'} p(s' \mid s,a) \, v_\gamma^{\pi_{\boldsymbol{w}}}(s')\right)
\end{align*}
$$

[(66)](#cKkFCRWqMn "Link to this Equation")

This is the policy gradient theorem, where $x_\alpha(s)$ is the discounted state visitation distribution and the term in parentheses is the state-action value function $q^{\pi_{\boldsymbol{w}}}(s,a)$.

<a id="normalized-discounted-state-visitation-distribution"></a>

### Normalized Discounted State Visitation Distribution

The discounted state visitation $x_\alpha(s)$ is not normalized. Therefore the expression we obtained above is not an expectation. However, we can transform it into one by normalizing by $1 - \gamma$. Note that for any initial distribution $\alpha$:

<a id="VKll87F2qN"></a>

$$
\sum_s x_\alpha(s) = \alpha^\top(\mathbf{I} - \gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^{-1}\mathbf{1} = \frac{\alpha^\top\mathbf{1}}{1-\gamma} = \frac{1}{1-\gamma}
$$

[(67)](#VKll87F2qN "Link to this Equation")

Therefore, defining the normalized state distribution $\xi_\alpha(s) = (1-\gamma)x_\alpha(s)$, we can write:

<a id="ihV2SFJ5i6"></a>

$$
\begin{align*}
\nabla_{\mathbf{w}}J(\mathbf{w}) &= \frac{1}{1-\gamma}\sum_s \xi_\alpha(s)\sum_a \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s)\left(r(s,a) + \gamma \sum_{s'} p(s' \mid s,a) \, v_\gamma^{\pi_{\boldsymbol{w}}}(s')\right) \\
&= \frac{1}{1-\gamma}\mathbb{E}_{s\sim\xi_\alpha}\left[\sum_a \nabla_{\mathbf{w}}\pi_{\boldsymbol{w}}(a \mid s) \, q^{\pi_{\boldsymbol{w}}}(s,a)\right]
\end{align*}
$$

[(68)](#ihV2SFJ5i6 "Link to this Equation")

Now we have expressed the policy gradient theorem in terms of expectations under the normalized discounted state visitation distribution. But what does sampling from $\xi_\alpha$ mean? Recall that $\mathbf{x}_\alpha^\top = \alpha^\top(\mathbf{I} - \gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^{-1}$. Using the Neumann series expansion (valid when $\|\gamma \mathbf{P}_{\pi_{\boldsymbol{w}}}\| < 1$, which holds for $\gamma < 1$ since $\mathbf{P}_{\pi_{\boldsymbol{w}}}$ is a stochastic matrix) we have:

<a id="ngUlobhxYG"></a>

$$
\boldsymbol{\xi}_\alpha^\top = (1-\gamma)\alpha^\top\sum_{k=0}^{\infty} (\gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^k
$$

[(69)](#ngUlobhxYG "Link to this Equation")

We can then factor out the first term from this summation to obtain:

<a id="FUxv4RrDbW"></a>

$$
\begin{align*}
\boldsymbol{\xi}_\alpha^\top &= (1-\gamma)\alpha^\top\sum_{k=0}^{\infty} (\gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^k \\
&= (1-\gamma)\alpha^\top + (1-\gamma)\alpha^\top\sum_{k=1}^{\infty} (\gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^k \\
&= (1-\gamma)\alpha^\top + (1-\gamma)\alpha^\top\gamma\mathbf{P}_{\pi_{\boldsymbol{w}}}\sum_{k=0}^{\infty} (\gamma \mathbf{P}_{\pi_{\boldsymbol{w}}})^k \\
&= (1-\gamma)\alpha^\top + \gamma\boldsymbol{\xi}_\alpha^\top \mathbf{P}_{\pi_{\boldsymbol{w}}}
\end{align*}
$$

[(70)](#FUxv4RrDbW "Link to this Equation")

The balance equation:

<a id="UcCdaxNwga"></a>

$$
\boldsymbol{\xi}_\alpha^\top = (1-\gamma)\alpha^\top + \gamma\boldsymbol{\xi}_\alpha^\top \mathbf{P}_{\pi_{\boldsymbol{w}}}
$$

[(71)](#UcCdaxNwga "Link to this Equation")

shows that $\boldsymbol{\xi}_\alpha$ is a mixture distribution: with probability $1-\gamma$ you draw a state from the initial distribution $\alpha$ (reset), and with probability $\gamma$ you follow the policy dynamics $\mathbf{P}_{\pi_{\boldsymbol{w}}}$ from the current state (continue). This interpretation directly connects to the geometric process: at each step you either terminate and resample from $\alpha$ (with probability $1-\gamma$) or continue following the policy (with probability $\gamma$).

<a id="PohAcPo5Hv"></a>

```python
import numpy as np

def sample_from_discounted_visitation(
    alpha, 
    policy, 
    transition_model, 
    gamma, 
    n_samples=1000
):
    """Sample states from the discounted visitation distribution.
    
    Args:
        alpha: Initial state distribution (vector of probabilities)
        policy: Function (state -> action probabilities)
        transition_model: Function (state, action -> next state probabilities)
        gamma: Discount factor
        n_samples: Number of states to sample
    
    Returns:
        Array of sampled states
    """
    samples = []
    n_states = len(alpha)
    rng = np.random.default_rng(2026)
    
    # Initialize state from alpha
    current_state = rng.choice(n_states, p=alpha)
    
    for _ in range(n_samples):
        samples.append(current_state)
        
        # With probability (1-gamma): reset
        if rng.random() > gamma:
            current_state = rng.choice(n_states, p=alpha)
        # With probability gamma: continue
        else:
            # Sample action from policy
            action_probs = policy(current_state)
            action = rng.choice(len(action_probs), p=action_probs)
            
            # Sample next state from transition model
            next_state_probs = transition_model(current_state, action)
            current_state = rng.choice(n_states, p=next_state_probs)
    
    return np.array(samples)

# Example usage for a simple 2-state MDP
alpha = np.array([0.7, 0.3])  # Initial distribution
policy = lambda s: np.array([0.8, 0.2])  # Dummy policy
transition_model = lambda s, a: np.array([0.9, 0.1])  # Dummy transitions
gamma = 0.9

samples = sample_from_discounted_visitation(alpha, policy, transition_model, gamma)

# Check empirical distribution
print("Empirical state distribution:")
print(np.bincount(samples) / len(samples))
```

```
Empirical state distribution:
[0.867 0.133]
```

While the math shows that sampling from the discounted visitation distribution $\boldsymbol{\xi}_\alpha$ would give us unbiased policy gradient estimates, Thomas (2014) demonstrated that this implementation can be detrimental to performance in practice. The issue arises because terminating trajectories early (with probability $1-\gamma$) reduces the effective amount of data we collect from each trajectory. This early termination weakens the learning signal, as many trajectories don’t reach meaningful terminal states or rewards.

Therefore, in practice, we typically sample complete trajectories from the undiscounted process (running the policy until natural termination or a fixed horizon) while still using $\gamma$ in the advantage estimation. This approach preserves the full learning signal from each trajectory and has been empirically shown to lead to better performance.

This is one of several cases in RL where the theoretically optimal procedure differs from the best practical implementation.

<a id="the-actor-critic-architecture"></a>

### The Actor-Critic Architecture

The policy gradient theorem shows that the gradient depends on the action-value function $q^{\pi_{\boldsymbol{w}}}(s,a)$. In practice, we do not have access to the true $q$\-function and must estimate it. This leads to the **actor-critic** architecture: the **actor** maintains the policy $\pi_{\boldsymbol{w}}$, while the **critic** maintains an estimate of the value function.

This architecture traces back to Sutton’s 1984 thesis, where he proposed the Adaptive Heuristic Critic. The actor uses the critic’s value estimates to compute advantage estimates for the policy gradient, while the critic learns from the same trajectories generated by the actor. The algorithms we developed earlier (REINFORCE with baseline, GAE, and the one-step actor-critic) are all instances of this architecture.

We are simultaneously learning two functions that depend on each other, which creates a stability challenge. The actor’s gradient uses the critic’s estimates, but the critic is trained on data generated by the actor’s policy. If both change too quickly, the learning process can become unstable.

Konda (2002) analyzed this coupled learning problem and established convergence guarantees under a **two-timescale** condition: the critic must update faster than the actor. Intuitively, the critic needs to “track” the current policy’s value function before the actor uses those estimates to update. If the actor moves too fast, it uses stale or inaccurate value estimates, leading to poor gradient estimates.

In practice, this is implemented by using different learning rates: a larger learning rate $\alpha_\theta$ for the critic and a smaller learning rate $\alpha_w$ for the actor, with $\alpha_\theta > \alpha_w$. Alternatively, one can perform multiple critic updates per actor update. The soft actor-critic algorithm discussed earlier in the [amortization chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/24-amortized-action-optimization.md) follows this same principle, inheriting the actor-critic structure while incorporating entropy regularization and learning Q-functions directly.

The actor-critic architecture also connects to the bilevel optimization perspective of the policy gradient theorem: the outer problem optimizes the policy, while the inner problem solves for the value function given that policy. The two-timescale condition ensures that the inner problem is approximately solved before taking a step on the outer problem.

<a id="reparameterization-methods-in-reinforcement-learning"></a>

## Reparameterization Methods in Reinforcement Learning

When actions and dynamics admit differentiable sampling paths, how does pathwise differentiation change the variance and model requirements of policy optimization?

When dynamics are known or can be learned, reparameterization provides an alternative to score function methods. By expressing actions and state transitions as deterministic functions of noise, we can backpropagate through trajectories to compute policy gradients with lower variance than score function estimators.

<a id="stochastic-value-gradients"></a>

### Stochastic Value Gradients

The reparameterization trick requires that we can express our random variable as a deterministic function of noise. In reinforcement learning, this applies naturally when we have a learned model of the dynamics. Consider a stochastic policy $\pi_{\boldsymbol{w}}(a|s)$ that we can reparameterize as $a = \pi_{\boldsymbol{w}}(s,\epsilon)$ where $\epsilon \sim p(\epsilon)$, and a dynamics model $s' = f(s,a,\xi)$ where $\xi \sim p(\xi)$ represents environment stochasticity. Both transformations are deterministic given the noise variables.

With these reparameterizations, we can write an $n$\-step return as a differentiable function of the noise:

<a id="VeEHV7u2FX"></a>

$$
R_n(s_0,\{\epsilon_i\},\{\xi_i\}) = \sum_{i=0}^{n-1} \gamma^i r(s_i,a_i)
$$

[(72)](#VeEHV7u2FX "Link to this Equation")

where $a_i = \pi_{\boldsymbol{w}}(s_i,\epsilon_i)$ and $s_{i+1} = f(s_i,a_i,\xi_i)$ for $i=0,...,n-1$. The objective becomes:

<a id="pzkBFoIC98"></a>

$$
J(\boldsymbol{w}) = \mathbb{E}_{\{\epsilon_i\},\{\xi_i\}}[R_n(s_0,\{\epsilon_i\},\{\xi_i\})]
$$

[(73)](#pzkBFoIC98 "Link to this Equation")

We can now apply the reparameterization gradient estimator:

<a id="GIEm4mPvz6"></a>

$$
\nabla_{\boldsymbol{w}}J(\boldsymbol{w}) = \mathbb{E}_{\{\epsilon_i\},\{\xi_i\}}\left[\nabla_{\boldsymbol{w}}R_n(s_0,\{\epsilon_i\},\{\xi_i\})\right]
$$

[(74)](#GIEm4mPvz6 "Link to this Equation")

This gradient can be computed by automatic differentiation through the sequence of policy and model evaluations. The computation requires backpropagating through $n$ steps of model rollouts, which becomes expensive for large $n$ but avoids the high variance of score function estimators.

The Stochastic Value Gradients (SVG) framework Heess _et al._, 2015 uses this approach while introducing a hybrid objective that combines model rollouts with value function bootstrapping:

<a id="ow8rMfXnzu"></a>

$$
J^{\text{SVG}(n)}(\boldsymbol{w}) = \mathbb{E}_{\{\epsilon_i\},\{\xi_i\}}\left[\sum_{i=0}^{n-1} \gamma^i r(s_i,a_i) + \gamma^n q(s_n,a_n;\theta)\right]
$$

[(75)](#ow8rMfXnzu "Link to this Equation")

The terminal value function $q(s_n,a_n;\theta)$ approximates the value beyond horizon $n$, allowing shorter rollouts while still capturing long-term value. This creates a spectrum of algorithms parameterized by $n$.

<a id="svg-0-model-free-reparameterization"></a>

#### SVG(0): Model-Free Reparameterization

When $n=0$, the objective collapses to:

<a id="ws6rpCz5xs"></a>

$$
J^{\text{SVG}(0)}(\boldsymbol{w}) = \mathbb{E}_{s \sim \rho}\mathbb{E}_{\epsilon \sim p(\epsilon)}\left[q(s,\pi_{\boldsymbol{w}}(s,\epsilon);\theta)\right]
$$

[(76)](#ws6rpCz5xs "Link to this Equation")

No model is required. We simply differentiate the critic with respect to actions sampled from the reparameterized policy. This is the approach used in DDPG Lillicrap _et al._, 2015 (with a deterministic policy where $\epsilon$ is absent) and SAC Haarnoja _et al._, 2018 (where $\epsilon$ produces the stochastic component). The gradient is:

<a id="Cxm8EyOnyB"></a>

$$
\nabla_{\boldsymbol{w}} J^{\text{SVG}(0)} = \mathbb{E}_{s,\epsilon}\left[\nabla_a q(s,a;\theta)\big|_{a=\pi_{\boldsymbol{w}}(s,\epsilon)} \nabla_{\boldsymbol{w}} \pi_{\boldsymbol{w}}(s,\epsilon)\right]
$$

[(77)](#Cxm8EyOnyB "Link to this Equation")

This requires only that the critic $q$ be differentiable with respect to actions, not a learned dynamics model. All bias comes from errors in the value function approximation.

<a id="svg-1-to-svg-n-model-based-rollouts"></a>

#### SVG(1) to SVG($n$): Model-Based Rollouts

For $n \geq 1$, we unroll a learned dynamics model for $n$ steps before bootstrapping with the critic. Consider SVG(1):

<a id="WZ7wkRR2XX"></a>

$$
J^{\text{SVG}(1)}(\boldsymbol{w}) = \mathbb{E}_{s,\epsilon,\xi}\left[r(s,\pi_{\boldsymbol{w}}(s,\epsilon)) + \gamma q(f(s,\pi_{\boldsymbol{w}}(s,\epsilon),\xi), \pi_{\boldsymbol{w}}(s',\epsilon');\theta)\right]
$$

[(78)](#WZ7wkRR2XX "Link to this Equation")

where $s' = f(s,\pi_{\boldsymbol{w}}(s,\epsilon),\xi)$ is the next state predicted by the model. The gradient now flows through both the reward and the model transition. Increasing $n$ propagates reward information more directly through the model rollout, reducing reliance on the critic. However, model errors compound over the horizon. If the model is inaccurate, longer rollouts can degrade performance.

<a id="svg-infty-pure-model-based-optimization"></a>

#### SVG($\infty$): Pure Model-Based Optimization

As $n \to \infty$, we eliminate the critic entirely:

<a id="ZbJIxnwtEz"></a>

$$
J^{\text{SVG}(\infty)}(\boldsymbol{w}) = \mathbb{E}_{\{\epsilon_i\},\{\xi_i\}}\left[\sum_{i=0}^{T-1} \gamma^i r(s_i,\pi_{\boldsymbol{w}}(s_i,\epsilon_i))\right]
$$

[(79)](#ZbJIxnwtEz "Link to this Equation")

This is pure model-based policy optimization, differentiating through the entire trajectory. Approaches like PILCO Deisenroth & Rasmussen, 2011 and Dreamer Hafner _et al._, 2019 operate in this regime. With an accurate model, this provides the most direct gradient signal. The tradeoff is computational: backpropagating through hundreds of time steps is expensive, and gradient magnitudes can explode or vanish over long horizons.

The choice of $n$ reflects a fundamental bias-variance tradeoff. Small $n$ relies on the critic for long-term value estimation, inheriting its approximation errors. Large $n$ relies on the model, accumulating its prediction errors. In practice, intermediate values like $n=5$ or $n=10$ often work well when combined with a reasonably accurate learned model.

<a id="noise-inference-for-off-policy-learning"></a>

#### Noise Inference for Off-Policy Learning

A subtle issue arises when combining reparameterization with experience replay. SVG naturally supports off-policy learning: states $s$ can be sampled from a replay buffer rather than the current policy. However, reparameterization requires the noise variables $\epsilon$ that generated each action.

For on-policy data, we can simply store $\epsilon$ alongside each transition $(s, a, r, s')$. For off-policy data collected under a different policy, the noise is unknown. To apply reparameterization gradients to such data, we must _infer_ the noise that would have produced the observed action under the current policy.

For invertible policies, this is straightforward. If $a = \pi_{\boldsymbol{w}}(s, \epsilon)$ with $\epsilon \sim \mathcal{N}(0, I)$, and the policy takes the form $a = \mu_{\boldsymbol{w}}(s) + \sigma_{\boldsymbol{w}}(s) \odot \epsilon$ (as in a Gaussian policy), we can recover the noise exactly:

<a id="a0tnfDkqlz"></a>

$$
\epsilon = \frac{a - \mu_{\boldsymbol{w}}(s)}{\sigma_{\boldsymbol{w}}(s)}
$$

[(80)](#a0tnfDkqlz "Link to this Equation")

This recovered $\epsilon$ can then be used for gradient computation. However, this introduces a subtle dependence: the inferred $\epsilon$ depends on the current policy parameters $\boldsymbol{w}$, not just the data. As the policy changes during training, the same action $a$ corresponds to different noise values.

For dynamics noise $\xi$, the situation is more complex. If we have a probabilistic model $s' = f(s, a, \xi)$ and observe the actual next state $s'$, we could in principle infer $\xi$. In practice, environment stochasticity is often treated as irreducible: we cannot replay the exact same noise realization. SVG handles this by either: (1) using deterministic models and ignoring environment stochasticity, (2) re-simulating from the model rather than using observed next states, or (3) using importance weighting to correct for the distribution mismatch.

The noise inference perspective connects reparameterization gradients to the broader question of credit assignment in RL. By explicitly tracking which noise realizations led to which outcomes, we can more precisely attribute value to policy parameters rather than to lucky or unlucky samples.

When dynamics are deterministic or can be accurately reparameterized, SVG-style methods offer an efficient alternative to the score function methods developed in the previous section. However, many reinforcement learning problems involve unknown dynamics or dynamics that resist accurate modeling. In those settings, score function methods remain the primary tool since they require only the ability to sample trajectories under the policy.

<a id="summary"></a>

## Summary

The trajectory score supplies a model-free policy gradient because the transition terms do not depend on the policy parameters. Conditional returns, state-dependent baselines, generalized advantage estimates, and learned critics reduce its variance. Importance ratios then compare data from an older policy with the current one, while PPO clips those ratios to limit the update.

The SwingRL experiment separated a correct PPO implementation from a successful control result. Five million total training interactions improved the shaped return but produced no full rotations. The structured controller solved the nominal rigid-link problem without policy training, then failed a different test because the resulting trajectory required a chain to push. Algorithm diagnostics, task success, and model validity therefore remain separate parts of the evaluation.

The policy-gradient theorem expresses the same derivative through discounted state visitation and action values. Approximating those values produces the actor-critic architecture, with a faster critic update supplying the signal used by the actor.

When dynamics models are available, reparameterization through stochastic value gradients supplies a lower-variance alternative. SVG(0) recovers actor-critic methods such as DDPG and SAC, while SVG($\infty$) differentiates through a complete simulated trajectory. The resulting choice is now explicit: score methods trade variance for minimal model assumptions; pathwise methods trade stronger differentiability assumptions for lower-variance credit assignment.

<a id="self-checks"></a>

## Self-checks

<a id="ex-pg-check-1"></a>

[Exercise 1](#ex-pg-check-1 "Link to this Exercise") (Score-function requirement)

Does the likelihood-ratio policy-gradient estimator require differentiating the environment dynamics? Why?

Solution to [Exercise 1](#ex-pg-check-1)

No. It differentiates the log probability of sampled actions under the policy and weights that score by sampled returns or advantages; the environment need only generate trajectories.

<a id="ex-pg-check-2"></a>

[Exercise 2](#ex-pg-check-2 "Link to this Exercise") (Baseline bias)

Why can a state-dependent baseline reduce variance without biasing the score-function policy gradient?

Solution to [Exercise 2](#ex-pg-check-2)

Conditioned on a state, the expected policy score is zero: $\sum_a\pi(a|s)\nabla\log\pi(a|s)=0$. Multiplying a state-only baseline by that score therefore has zero expectation.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-williams1992reinforce"></a>
2.  Williams, R. J. (1992). Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning. _Machine Learning_, _8_(3), 229–256. [10.1007/BF00992696](https://doi.org/10.1007/BF00992696)
<a id="cite-sutton1999policy"></a>
4.  Sutton, R. S., McAllester, D., Singh, S., & Mansour, Y. (1999). Policy Gradient Methods for Reinforcement Learning with Function Approximation. _Advances in Neural Information Processing Systems_, _12_, 1057–1063.
<a id="cite-konda2002thesis"></a>
6.  Konda, V. R. (2002). _Actor-Critic Algorithms_ \[Phdthesis\]. Massachusetts Institute of Technology.
<a id="cite-Heess2015"></a>
8.  Heess, N., Wayne, G., Silver, D., Lillicrap, T., Erez, T., & Tassa, Y. (2015). Learning Continuous Control Policies by Stochastic Value Gradients. _Advances in Neural Information Processing Systems_, _28_, 2944–2952.
<a id="cite-lillicrap2015continuous"></a>
10.  Lillicrap, T. P., Hunt, J. J., Pritzel, A., Heess, N., Erez, T., Tassa, Y., Silver, D., & Wierstra, D. (2015). Continuous Control with Deep Reinforcement Learning. _arXiv Preprint arXiv:1509.02971_.
<a id="cite-haarnoja2018soft"></a>
12.  Haarnoja, T., Zhou, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor. _Proceedings of the 35th International Conference on Machine Learning (ICML)_, 1861–1870.
<a id="cite-deisenroth2011pilco"></a>
14.  Deisenroth, M. P., & Rasmussen, C. E. (2011). PILCO: A Model-Based and Data-Efficient Approach to Policy Search. _Proceedings of the 28th International Conference on Machine Learning (ICML)_, 465–472.
<a id="cite-hafner2019dreamer"></a>
16.  Hafner, D., Lillicrap, T., Ba, J., & Norouzi, M. (2019). Dream to Control: Learning Behaviors by Latent Imagination. _arXiv Preprint arXiv:1912.01603_.

[

Parameterized Policy Optimization

Regularized and Residual-Based Policy Learning


](26-regularized-policy-learning.md)[

Demos

Direct Collocation for a Pendulum Swing-Up


](28-collocation-from-nodes.md)


---

# CHAPITRE 28 — Direct Collocation for a Pendulum Swing-Up

Section du livre : Demos

Page originale : https://pierrelucbacon.com/rlbook/collocation-from-nodes

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/28-collocation-from-nodes.md

> **Cours de Pierre-Luc Bacon — 28.** [Page publiée](https://pierrelucbacon.com/rlbook/collocation-from-nodes) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/28-collocation-from-nodes.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Direct Collocation for a Pendulum Swing-Up

<a id="skip-to-article"></a>

<a id="direct-collocation-for-a-pendulum-swing-up-0"></a>

<a id="l7VwGql1gE"></a>
[![Open in Colab](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Assets/Website/1e3da18062-7e2db436150c38a00650f96925aa5581.svg)](https://colab.research.google.com/github/pierrelux/rlbook/blob/main/lab/notebooks/08_collocation_from_nodes.ipynb)

This demo applies the direct-collocation recipe of the chapter [Continuous-Time Transcription and Collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) to a small nonlinear control problem. The chapter develops the recipe for general dynamics and general choices of nodes. Here every step is carried out once with concrete numbers and then written as a few lines of Python, so that each symbol of the recipe can be matched with a quantity in the code. The text explains why each step is needed as well as what it computes.

The demo runs in about half a minute with NumPy, SciPy, and Matplotlib and needs no other files. Run the cells in order.

<a id="the-problem-0"></a>

<a id="the-problem"></a>

## The Problem

A pendulum hangs at rest below its pivot, where a motor applies a torque $u(t)$. At time $T=8$ the pendulum must stand upright and at rest, and the motor should use as little torque as possible. Let $\theta$ be the angle measured from the hanging position and $\omega$ the angular velocity. Time is measured in units of $\sqrt{\ell/g}$ and torque in units of $mg\ell$, where $m$ is the mass, $\ell$ the length, and $g$ the gravitational acceleration. In these units the state $\mathbf x=(\theta,\omega)$ evolves according to

<a id="vgdjQr8dwR"></a>

$$
\dot\theta=\omega,\qquad \dot\omega=-\sin\theta+u.
$$

[(1)](#vgdjQr8dwR "Link to this Equation")

The term $-\sin\theta$ is gravity, which pulls the pendulum back toward the hanging position. Its largest magnitude is 1, reached when the pendulum is horizontal. The motor is weak: its torque is limited to $|u(t)|\le u_{\max}=0.5$, half of that largest gravity torque. It cannot lift the pendulum directly, and it must swing it back and forth to build up energy, which takes time. Writing the dynamics as $\dot{\mathbf x}=\mathbf f(\mathbf x,u)$, the optimal control problem is

<a id="gAXWS2BZST"></a>

$$
\min_{\mathbf x(\cdot),u(\cdot)} \int_0^T u(t)^2 dt
\quad\text{subject to}\quad
\dot{\mathbf x}=\mathbf f(\mathbf x,u),\quad
|u(t)|\le u_{\max},\quad
\mathbf x(0)=(0,0),\quad
\mathbf x(T)=(\pi,0).
$$

[(2)](#gAXWS2BZST "Link to this Equation")

Because of $\sin\theta$, the dynamics are nonlinear, and neither the optimal torque nor the resulting motion has a closed-form expression.

<a id="from-functions-to-numbers-0"></a>

<a id="from-functions-to-numbers"></a>

## From Functions to Numbers

SciPy’s `minimize`, like every nonlinear programming solver, works with a finite vector $\mathbf z$ of unknowns. It needs a function $F(\mathbf z)$ that returns the objective and a function $H(\mathbf z)$ that returns constraint residuals, which must be zero at a solution. The problem above provides neither. Its unknowns are the functions $\theta(t)$, $\omega(t)$, and $u(t)$, its constraint is a condition on a derivative at every instant, and its objective is an integral. Transcription replaces these objects by finitely many numbers and algebraic equations.

Direct collocation makes three replacements:

1.  The horizon is divided into $N$ intervals, and on each interval the state is described by a polynomial. A polynomial of low degree is determined by a few numbers, and its derivative and integral can be computed exactly from those numbers.
    
2.  The differential equation is required only at a few chosen times per interval, the **collocation nodes**, where the slope of the polynomial must equal the slope given by $\mathbf f$.
    
3.  The cost integral is replaced by a weighted sum of cost rates at the same nodes.
    

After these replacements, every condition is an equation between numbers, which the optimizer can evaluate for any candidate $\mathbf z$.

Many short intervals are used instead of one polynomial over $[0,T]$. This keeps the degree of each polynomial low, lets the accuracy improve by adding intervals, and makes each equation involve only the numbers of one interval.

The sections below follow the steps of the chapter’s [integration-form algorithm](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md#alg-collocation-from-nodes). Step 1 computes fixed numbers that describe the polynomials. Steps 2 to 4 define $\mathbf z$, $F$, and $H$. Step 5 solves the problem and checks the answer against an accurate simulation. A final section builds the same problem from derivatives instead of integrals.

The first cell defines the model. The rest of the demo uses the dynamics only through calls `f(x, u)` and the cost only through calls `c(x, u)`, so another model would change only this cell.

<a id="from-functions-to-numbers-1"></a>

<a id="from-functions-to-numbers-1-code"></a>

```python
import numpy as np
import matplotlib.pyplot as plt
from fractions import Fraction
from numpy.polynomial import Polynomial
from scipy.integrate import solve_ivp
from scipy.optimize import minimize

plt.rcParams.update({"axes.spines.top": False, "axes.spines.right": False})


def f(x, u):
    # Pendulum dynamics: x = (angle, angular velocity), u = torque.
    theta, omega = x
    return np.array([omega, -np.sin(theta) + u])


def c(x, u):
    # Running cost rate.
    return u**2


T = 8.0                            # horizon
u_max = 0.5                        # torque limit
x_start = np.array([0.0, 0.0])     # hanging, at rest
x_goal = np.array([np.pi, 0.0])    # upright, at rest
```

<a id="from-functions-to-numbers-1-outputs"></a>

<a id="step-1-compute-the-rule-once-0"></a>

<a id="step-1-compute-the-rule-once"></a>

## Step 1: Compute the Rule Once

Divide $[0,T]$ into $N$ intervals of width $h=T/N$, so that interval $k$ runs from $t_k=kh$ to $t_{k+1}=t_k+h$. Inside interval $k$, measure time by the **local time** $\tau=(t-t_k)/h$, which runs from 0 at the left end to 1 at the right end. Every interval then looks the same in local time, so the numbers computed in this step on $[0,1]$ serve every interval, whatever its position and width.

Three symbols for local time appear below, and they play different roles. The letter $\tau$ stands for any point of the interval. The **collocation nodes** $\tau_1$ and $\tau_2$ are two fixed values of $\tau$, chosen once and used in every interval. This demo uses $\tau_1=\tfrac{1}{3}$ and $\tau_2=1$, called the two-stage Radau nodes. The letter $\sigma$ is the variable of integration in the integrals below, which run from 0 to some value of $\tau$. The sketch below shows what the method builds. The state trajectory consists of one polynomial piece per interval. Consecutive pieces meet at the mesh states, although their slopes may differ there. Inside each interval, the stage states sit at the nodes, where the slope of the piece must equal the slope given by $\mathbf f$. The torque is constant on each interval. The right panel shows interval $k$ in local time, with the quantities that Step 2 turns into unknowns. The trajectory in the sketch is made up for illustration; the pendulum’s trajectory appears in Step 5.

<a id="step-1-compute-the-rule-once-1"></a>

Source

<a id="step-1-compute-the-rule-once-1-code"></a>

```python
# @title Sketch a collocation trajectory and one interval in local time
def wiggle(t):                            # a made-up smooth trajectory, for the sketch only
    return 0.6 * np.sin(1.1 * t) + 0.35 * np.sin(2.4 * t + 0.8) + 0.15 * t

k, nodes = 4, np.array([1/3, 1.0])       # highlighted interval, collocation nodes
support = np.array([0, *nodes])
pieces = [Polynomial.fit(m + support, wiggle(m + support), 2) for m in range(6)]  # one per interval
torque = [0.9, 1.2, 0.5, -0.4, -0.9, 0.3]
step = np.array([-0.15, 0.15])

fig = plt.figure(figsize=(10, 4.6), constrained_layout=True)
layout = fig.add_gridspec(2, 2, width_ratios=[1.75, 1], height_ratios=[2.3, 1])
state, control = fig.add_subplot(layout[0, 0]), fig.add_subplot(layout[1, 0])
zoom = fig.add_subplot(layout[:, 1])

# The whole horizon: one quadratic piece per interval, joined at the mesh states.
for m, piece in enumerate(pieces):
    t = np.linspace(m, m + 1, 60)
    state.plot(t, piece(t), color="#0072B2" if m == k else "0.45", linewidth=2.2 if m == k else 1.6)
    for node in m + nodes:
        state.plot(node + step, piece(node) + piece.deriv()(node) * step, color="#D55E00", linewidth=2)
    state.plot(m + nodes[0], piece(m + nodes[0]), "o", color="#D55E00", markersize=5, zorder=3)
state.plot(range(7), [pieces[min(m, 5)](m) for m in range(7)], "s", color="#0072B2", markersize=6,
           zorder=3)
state.axvspan(k, k + 1, color="#0072B2", alpha=0.1, linewidth=0)
state.text(k + 0.5, 0.97, r"interval $k$", transform=state.get_xaxis_transform(), ha="center",
           va="top", color="#0072B2")
state.set(xlim=(-0.15, 6.15), xticks=range(7), xticklabels=[], yticks=[], ylabel=r"state $\mathbf{x}$")
state.plot([], [], "s", color="#0072B2", label="mesh states")
state.plot([], [], "o", color="#D55E00", label="stage states")
state.plot([], [], color="#D55E00", linewidth=2, label=r"slope $\mathbf{f}$ at each stage")
state.legend(loc="lower left", bbox_to_anchor=(0, 1), ncol=3, frameon=False, fontsize=9,
             borderaxespad=0.2)

# The torque: one constant value per interval.
control.stairs(torque, range(7), baseline=None, color="0.25", linewidth=1.6)
control.axvspan(k, k + 1, color="#0072B2", alpha=0.1, linewidth=0)
control.axhline(0, color="0.75", linewidth=0.8)
control.set(xlim=(-0.15, 6.15), xticks=range(7), yticks=[], ylabel=r"torque $u$",
            xticklabels=[r"$t_0$", r"$t_1$", r"$t_2$", r"$t_3$", r"$t_k$", r"$t_{k+1}$", r"$t_N$"],
            xlabel=r"physical time $t$, in intervals of width $h$")

# Interval k in local time: the same piece, with the unknowns attached to it.
local = Polynomial(pieces[k](k + Polynomial([0, 1])).coef)
tau_grid = np.linspace(0, 1, 100)
zoom.plot(tau_grid, local(tau_grid), color="#0072B2", linewidth=2.2)
for node in nodes:
    zoom.plot(node + step, local(node) + local.deriv()(node) * step, color="#D55E00", linewidth=2.5)
zoom.plot([0, 1], local([0, 1]), "s", color="#0072B2", markersize=8, zorder=3)
zoom.plot(nodes, local(nodes), "o", color="#D55E00", markersize=7, zorder=3)
zoom.annotate(r"$\mathbf{x}_k$", (0, local(0)), xytext=(9, 0), textcoords="offset points",
              va="center")
zoom.annotate(r"$\mathbf{x}_{k,1}$, slope $h\,\mathbf{f}_{k,1}$", (1/3, local(1/3)),
              xytext=(0, -16), textcoords="offset points", ha="center", va="top")
zoom.annotate(r"$\mathbf{x}_{k,2}=\mathbf{x}_{k+1}$" "\n" r"slope $h\,\mathbf{f}_{k,2}$",
              (1, local(1)), xytext=(-8, 10), textcoords="offset points", ha="right", va="bottom")
zoom.text(0.5, 0.03, r"torque $u_k$ on the whole interval", transform=zoom.transAxes, ha="center",
          color="0.35")
low, high = zoom.get_ylim()
zoom.set(xlim=(-0.1, 1.1), ylim=(low - 0.45 * (high - low), high + 0.45 * (high - low)), yticks=[],
         xticks=[0, 1/3, 1], title=r"interval $k$ in local time $\tau$",
         xticklabels=["0\n" r"$t_k$", r"$\tau_1=\frac{1}{3}$" "\n" r"$t_k+\frac{h}{3}$",
                      r"$\tau_2=1$" "\n" r"$t_{k+1}$"])
plt.show()
```

<a id="step-1-compute-the-rule-once-1-outputs"></a>

![<Figure size 1000x460 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6286d4142d-41fbe6046609cd456f9f838a5cf8f3b1.png)

<a id="step-1-compute-the-rule-once-2"></a>

The differential equation gives the slope of the state through a known function, $\dot{\mathbf x}=\mathbf f(\mathbf x,u)$. By the fundamental theorem of calculus, the state at local time $\tau$ in interval $k$ equals the state at the left end plus the integral of the slope:

<a id="ycpTR8ChiY"></a>

$$
\mathbf x(t_k+h\tau)
=\mathbf x_k+\int_{t_k}^{t_k+h\tau}\mathbf f(\mathbf x(t),u_k)dt
=\mathbf x_k+h\int_0^{\tau}\mathbf f(\mathbf x(t_k+h\sigma),u_k)d\sigma .
$$

[(3)](#ycpTR8ChiY "Link to this Equation")

The second form substitutes $t=t_k+h\sigma$, so that $dt=h d\sigma$. This is where the factor $h$ comes from: it converts a stretch of local time into physical time.

The function $\mathbf f$ is known, but the integrand also depends on the trajectory $\mathbf x(t)$, which is what we are trying to find, so this integral cannot be evaluated as it stands. Collocation evaluates the integrand only at the nodes and replaces it by the polynomial that takes those values. Write $\mathbf f_{k,j}=\mathbf f(\mathbf x_{k,j},u_k)$ for its value at node $j$, where $\mathbf x_{k,j}$ is the state at that node. Each value is computed from the known function $\mathbf f$. What is not known in advance is the state $\mathbf x_{k,j}$ at which to evaluate it, and Step 2 makes those states unknowns of the optimization. For now, treat $\mathbf f_{k,1}$ and $\mathbf f_{k,2}$ as given numbers.

The number of nodes is a choice of the method. Exactly one polynomial of degree at most $s-1$ passes through $s$ values at $s$ distinct nodes, so more nodes give a more flexible interpolant and usually a more accurate rule. This demo uses $s=2$ nodes, the smallest number whose interpolant can vary inside the interval, so the interpolating polynomial is the line

<a id="FDlMoBayCu"></a>

$$
\mathbf f_{k,1}\ell_1(\sigma)+\mathbf f_{k,2}\ell_2(\sigma).
$$

[(4)](#FDlMoBayCu "Link to this Equation")

Each **Lagrange basis function** $\ell_j$ equals one at its own node $\tau_j$ and zero at the other nodes. In general it is the product

<a id="upmWuy9cgI"></a>

$$
\ell_j(\sigma)=\prod_{m\neq j}\frac{\sigma-\tau_m}{\tau_j-\tau_m}.
$$

[(5)](#upmWuy9cgI "Link to this Equation")

Each factor is zero at one of the other nodes and equals one at $\tau_j$. The denominators are numbers, so $\ell_j$ is a product of $s-1$ linear factors in $\sigma$, which is a polynomial of degree $s-1$. With two nodes each product has a single factor: $\ell_1(\sigma)=(\sigma-\tau_2)/(\tau_1-\tau_2)$ and $\ell_2(\sigma)=(\sigma-\tau_1)/(\tau_2-\tau_1)$. The experiments at the end try other numbers of nodes. Unlike the true integrand, a polynomial can be integrated exactly, which is the purpose of the replacement. Substituting the interpolant into the integral gives

<a id="trxfIEVk0l"></a>

$$
\mathbf x(t_k+h\tau)
\approx\mathbf x_k+h\int_0^{\tau}\sum_{j=1}^{2}\mathbf f_{k,j}\ell_j(\sigma)d\sigma
=\mathbf x_k+h\sum_{j=1}^{2}\mathbf f_{k,j}\int_0^{\tau}\ell_j(\sigma)d\sigma .
$$

[(6)](#trxfIEVk0l "Link to this Equation")

The last equality uses the linearity of the integral. The integral of a sum is the sum of the integrals, and each $\mathbf f_{k,j}$ is a constant that does not depend on $\sigma$, so it moves outside its integral. After this exchange, the slopes only multiply integrals of the basis functions, and those integrals depend on the nodes alone. Evaluating them with $\tau$ equal to each node and to the right end gives the **rule** of the method:

<a id="ABaEExYG6m"></a>

$$
A_{ij}=\int_0^{\tau_i}\ell_j(\sigma)d\sigma,
\qquad
b_j=\int_0^1\ell_j(\sigma)d\sigma.
$$

[(7)](#ABaEExYG6m "Link to this Equation")

The entry $A_{ij}$ is the share of slope $j$ in the state change from the left end to node $i$, per unit of interval width. The weight $b_j$ is the share of slope $j$ in the change over the whole interval.

These integrals can be computed exactly, because each $\ell_j$ is a polynomial. The product formula above is one way to write it. Multiplying out its linear factors writes the same polynomial as a sum of powers, $\ell_j(\sigma)=a_0+a_1\sigma+\cdots+a_d\sigma^d$, and for the nodes of this demo this is done by hand below. In that form, the linearity used above applies again: the integral of a sum is the sum of the integrals of its terms, and each coefficient $a_m$ moves outside its integral. Each remaining integral is a power of $\sigma$, which the power rule integrates:

<a id="LlSAaCJbaM"></a>

$$
\int_0^{\tau}\ell_j(\sigma)d\sigma
=\sum_{m=0}^{d}a_m\int_0^{\tau}\sigma^m d\sigma
=\sum_{m=0}^{d}a_m\frac{\tau^{m+1}}{m+1}.
$$

[(8)](#LlSAaCJbaM "Link to this Equation")

The antiderivative $L_j(\tau)=\int_0^{\tau}\ell_j(\sigma)d\sigma$ is therefore again a polynomial, of one degree higher. The entries $A_{ij}=L_j(\tau_i)$ and $b_j=L_j(1)$ are evaluations of $L_j$, and no numerical approximation of an integral is involved. In code, NumPy’s `Polynomial` stores a polynomial as its coefficients $(a_0,a_1,\ldots,a_d)$ in increasing powers, and its `.integ()` method applies the power rule to them, which gives the coefficients $(0,a_0,\tfrac{a_1}{2},\ldots,\tfrac{a_d}{d+1})$. The leading 0 is the integration constant, chosen so that $L_j(0)=0$.

By hand, for $\tau_1=\tfrac{1}{3}$ and $\tau_2=1$, multiplying out the single factor of each product gives the basis functions in powers of $\tau$:

<a id="tWoCs9OdE4"></a>

$$
\ell_1(\tau)=\frac{\tau-1}{\tfrac{1}{3}-1}=\frac{3}{2}-\frac{3}{2}\tau,
\qquad
\ell_2(\tau)=\frac{\tau-\tfrac{1}{3}}{1-\tfrac{1}{3}}=-\frac{1}{2}+\frac{3}{2}\tau.
$$

[(9)](#tWoCs9OdE4 "Link to this Equation")

The power rule turns a constant $a$ into $a\tau$ and a term $a\tau$ into $\tfrac{a}{2}\tau^2$, so the antiderivatives are

<a id="bttY8rwost"></a>

$$
L_1(\tau)=\frac{3}{2}\tau-\frac{3}{4}\tau^2,
\qquad
L_2(\tau)=-\frac{1}{2}\tau+\frac{3}{4}\tau^2.
$$

[(10)](#bttY8rwost "Link to this Equation")

Differentiating them returns $\ell_1$ and $\ell_2$, which checks the calculation, and both vanish at $\tau=0$. Each entry of the rule is now one evaluation:

<a id="FVjXJikmKw"></a>

$$
\begin{aligned}
A_{11}&=L_1(\tfrac{1}{3})=\tfrac{1}{2}-\tfrac{1}{12}=\tfrac{5}{12},&
A_{12}&=L_2(\tfrac{1}{3})=-\tfrac{1}{6}+\tfrac{1}{12}=-\tfrac{1}{12},\cr
A_{21}&=L_1(1)=\tfrac{3}{2}-\tfrac{3}{4}=\tfrac{3}{4},&
A_{22}&=L_2(1)=-\tfrac{1}{2}+\tfrac{3}{4}=\tfrac{1}{4}.
\end{aligned}
$$

[(11)](#FVjXJikmKw "Link to this Equation")

The weights $b_j=L_j(1)$ repeat the second row, because $\tau_2=1$ is the right end of the interval:

<a id="Tvzlmfj81n"></a>

$$
A=\begin{bmatrix}
\tfrac{5}{12}&-\tfrac{1}{12}\cr
\tfrac{3}{4}&\tfrac{1}{4}
\end{bmatrix},
\qquad
b=\begin{bmatrix}\tfrac{3}{4}\cr \tfrac{1}{4}\end{bmatrix}.
$$

[(12)](#Tvzlmfj81n "Link to this Equation")

The code performs the same operations for any distinct nodes: it multiplies the linear factors of each $\ell_j$, integrates with `.integ()`, and evaluates. It also prints the coefficient lists, which match the expressions above.

<a id="step-1-compute-the-rule-once-3"></a>

<a id="step-1-compute-the-rule-once-3-code"></a>

```python
tau = np.array([1/3, 1.0])         # collocation nodes


def lagrange_basis(nodes):
    # ell_j(sigma) = product over m != j of (sigma - tau_m) / (tau_j - tau_m)
    sigma = Polynomial([0.0, 1.0])                  # the polynomial 0 + 1*sigma
    basis = []
    for j, tau_j in enumerate(nodes):
        ell = Polynomial([1.0])                     # start from the constant 1
        for m, tau_m in enumerate(nodes):
            if m != j:
                ell = ell * (sigma - tau_m) / (tau_j - tau_m)
        basis.append(ell)
    return basis


# A[i, j] is the integral of ell_j from 0 to tau_i, and b[j] its integral from 0 to 1.
L = [ell.integ() for ell in lagrange_basis(tau)]     # antiderivatives with L_j(0) = 0
A = np.array([[L_j(tau_i) for L_j in L] for tau_i in tau])
b = np.array([L_j(1.0) for L_j in L])


def frac(value):
    # Round a number to a nearby fraction, to compare with the hand calculation.
    return str(Fraction(value).limit_denominator(1000))


def show(name, array):
    print(name, "=", str(np.vectorize(frac)(array).tolist()).replace("'", ""))


for j, (ell, L_j) in enumerate(zip(lagrange_basis(tau), L), start=1):
    show(f"coefficients of ell_{j}", ell.coef)
    show(f"coefficients of L_{j}", L_j.coef)
show("A", A)
show("b", b)
show("row sums of A", A.sum(axis=1))
show("sum of b", b.sum())
```

<a id="step-1-compute-the-rule-once-3-outputs"></a>

```
coefficients of ell_1 = [3/2, -3/2]
coefficients of L_1 = [0, 3/2, -3/4]
coefficients of ell_2 = [-1/2, 3/2]
coefficients of L_2 = [0, -1/2, 3/4]
A = [[5/12, -1/12], [3/4, 1/4]]
b = [3/4, 1/4]
row sums of A = [1/3, 1]
sum of b = 1
```

<a id="step-1-compute-the-rule-once-4"></a>

In `lagrange_basis`, `Polynomial([0.0, 1.0])` is the polynomial whose coefficients are 0 and 1 in increasing powers, that is, $0+1\sigma$, or $\sigma$ itself. Arithmetic on `Polynomial` objects returns new polynomials, so `sigma - tau_m` is the polynomial $\sigma-\tau_m$, stored as the coefficients `[-tau_m, 1.0]`. The loop starts from the constant polynomial 1 and multiplies in one factor $(\sigma-\tau_m)/(\tau_j-\tau_m)$ for every other node, which is the product formula for $\ell_j$ written as code. The printed coefficient lists read in increasing powers of $\tau$. For example, `[3/2, -3/2]` is $\ell_1(\tau)=\tfrac{3}{2}-\tfrac{3}{2}\tau$, and `.integ()` turns it into `[0, 3/2, -3/4]`, which is $L_1(\tau)=\tfrac{3}{2}\tau-\tfrac{3}{4}\tau^2$. Calling `L_j(tau_i)` evaluates that polynomial at $\tau_i$, which gives the integral from 0 to $\tau_i$. The printed arrays agree with the hand calculation.

> **Question.** The printed row sums of $A$ equal the nodes, and the weights $b$ sum to one. Why must this hold for any choice of nodes? Hint: consider a motion whose slope is the same at every node.

Answer

If every slope equals the same value $\mathbf f$, the interpolated slope is that constant, and the state changes by $h\tau_i\mathbf f$ between the left end and node $i$, and by $h\mathbf f$ over the whole interval. The rule gives these changes as $h\sum_jA_{ij}\mathbf f$ and $h\sum_jb_j\mathbf f$, so each row of $A$ must sum to $\tau_i$ and the weights $b$ must sum to one. A rule that failed this check would not reproduce motion at constant velocity.

The figure below draws each basis function and shows the entries of the rule as signed areas under it.

<a id="step-1-compute-the-rule-once-5"></a>

Source

<a id="step-1-compute-the-rule-once-5-code"></a>

```python
# @title Plot each basis function and the areas that form A and b
fig, axes = plt.subplots(1, len(tau), figsize=(4.5 * len(tau), 2.8), squeeze=False,
                         sharey=True, constrained_layout=True)
grid = np.linspace(0, 1, 200)
for j, (ax, ell) in enumerate(zip(axes[0], lagrange_basis(tau))):
    to_node, to_end = np.linspace(0, tau[0], 50), np.linspace(tau[0], 1, 100)
    ax.axhline(0, color="0.6", linewidth=0.8)
    ax.fill_between(to_node, ell(to_node), color="#0072B2", alpha=0.45)
    ax.fill_between(to_end, ell(to_end), color="#0072B2", alpha=0.15)
    ax.plot(grid, ell(grid), color="#0072B2")
    ax.plot(tau, ell(tau), "o", color="#D55E00")
    ax.set(xlabel=r"local time $\tau$", title=rf"$\ell_{{{j + 1}}}(\tau)$")
    label = (rf"dark area: $A_{{1{j + 1}}}$ = {frac(A[0, j])}" "\n"
             rf"all shaded: $b_{{{j + 1}}}$ = {frac(b[j])}")
    left = ell(0) < ell(1)          # write the label on the side where the curve is low
    ax.text(0.03 if left else 0.97, 0.95, label, transform=ax.transAxes,
            ha="left" if left else "right", va="top")
plt.show()
```

<a id="step-1-compute-the-rule-once-5-outputs"></a>

![<Figure size 900x280 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/e170e75b0b-3776ea807959857403b937cac7bcd83d.png)

<a id="step-1-compute-the-rule-once-6"></a>

The orange dots mark the nodes, where each basis function equals one or zero. The entry $A_{12}=-\tfrac{1}{12}$ is negative because $\ell_2$ is negative between 0 and $\tfrac{1}{3}$, and a negative weight is not an error. The interpolated slope is a line through $\mathbf f_{k,1}$ at $\tau=\tfrac{1}{3}$ and $\mathbf f_{k,2}$ at $\tau=1$. Increasing $\mathbf f_{k,2}$ while $\mathbf f_{k,1}$ stays fixed tilts this line upward to the right of $\tau=\tfrac{1}{3}$ and downward to its left, so the state gains less before the first node.

Any distinct nodes produce a valid rule, but the choice affects accuracy. The Radau nodes make the weights $b$ integrate every polynomial of degree up to two exactly. For example, $\tfrac{3}{4}(\tfrac{1}{3})^2+\tfrac{1}{4}(1)^2=\tfrac{1}{3}$, which equals $\int_0^1\tau^2d\tau$. Two nodes at the ends of the interval, which give the trapezoidal rule, integrate only polynomials of degree up to one exactly. The experiments at the end compare several node choices on the pendulum.

The arrays $A$ and $b$ are computed once, before any optimization, and stay fixed while the optimizer searches.

<a id="step-2-allocate-the-variables-0"></a>

<a id="step-2-allocate-the-variables"></a>

## Step 2: Allocate the Variables

The rule needs the slopes at the nodes, $\mathbf f_{k,j}=\mathbf f(\mathbf x_{k,j},u_k)$, and those depend on the states at the nodes, which are unknown before the problem is solved. Direct collocation does not compute these states by simulation. It makes them unknowns of the optimization and adds equations, in Step 3, that make them consistent. On interval $k$ the unknowns are a mesh state, the stage states, and a torque. The diagram after the next code cell shows them with their names in the code and their places in the vector $\mathbf z$.

The **mesh state** $\mathbf x_k$ is the state at the left end $t_k$. The preceding interval ends at the same time and uses the same variable, and this sharing keeps the trajectory continuous. The **stage states** $\mathbf x_{k,1}$ and $\mathbf x_{k,2}$ are the states at the two nodes. The torque $u_k$ is held constant over the interval, a choice called a **zero-order hold** and the simplest control representation. In the chapter’s notation, the control matrix $B$ is then a column of ones. A linear or quadratic torque would add numbers per interval without changing the construction of the state.

All states and torques are unknowns at the same time, and no simulation runs inside the optimizer. This is why direct collocation is called a simultaneous method. In single shooting, by contrast, the optimizer chooses only the torques, and a time integrator computes the states.

Python counts from zero, so the stage state $\mathbf x_{k,j}$ is stored in `x_stage[k, j-1]`. The solver needs all unknowns in one flat vector $\mathbf z$, and the function `unpack` cuts that vector into the three arrays.

<a id="step-2-allocate-the-variables-1"></a>

<a id="step-2-allocate-the-variables-1-code"></a>

```python
N = 40                              # intervals
h = T / N                           # interval width
s = len(tau)                        # stages per interval
n = len(x_start)                    # state dimension
n_z = (N + 1) * n + N * s * n + N   # number of unknowns


def unpack(z):
    x_mesh = z[:(N + 1) * n].reshape(N + 1, n)      # x_mesh[k] is the mesh state x_k
    x_stage = z[(N + 1) * n:-N].reshape(N, s, n)    # x_stage[k, j] is a stage state
    u = z[-N:]                                      # u[k] is the torque on interval k
    return x_mesh, x_stage, u


print("number of unknowns:", n_z)
```

<a id="step-2-allocate-the-variables-1-outputs"></a>

```
number of unknowns: 282
```

<a id="step-2-allocate-the-variables-2"></a>

Source

<a id="step-2-allocate-the-variables-2-code"></a>

```python
# @title Draw the unknowns of one interval and their places in z
fig, (interval, vector) = plt.subplots(2, 1, figsize=(9, 4.0), height_ratios=[1.7, 1],
                                       constrained_layout=True)
mono = dict(family="monospace", fontsize=10)

# One interval in local time, with the unknowns that belong to it.
interval.plot([-0.3, 1.3], [0, 0], color="0.65", linewidth=1, linestyle=":")
interval.plot([0, 1], [0, 0], color="0.3", linewidth=1.5)
interval.plot([0, 1], [0, 0], "s", color="#0072B2", markersize=10, zorder=3)
interval.plot(tau, np.zeros(s), "o", color="#D55E00", markersize=8, zorder=4)
interval.text(0, 0.3, "x_mesh[k]", ha="center", color="#0072B2", **mono)
interval.text(1, 0.3, "x_mesh[k+1]", ha="center", color="#0072B2", **mono)
for j, node in enumerate(tau):
    interval.text(node, -0.55, f"x_stage[k, {j}]", ha="center", va="top", color="#D55E00", **mono)
for point in sorted({0.0, *tau, 1.0}):
    interval.text(point, -0.18, rf"$\tau={frac(point)}$", ha="center", va="top", color="0.4",
                  fontsize=9)
interval.plot([0, 1], [1.0, 1.0], color="0.25", linewidth=3, solid_capstyle="butt")
interval.text(0.5, 1.12, "u[k]: one torque for the whole interval", ha="center", va="bottom",
              **mono)
interval.text(-0.3, 0.1, "interval k-1", color="0.5", fontsize=9)
interval.text(1.3, 0.1, "interval k+1", color="0.5", fontsize=9, ha="right")
interval.set(xlim=(-0.32, 1.32), ylim=(-1.0, 1.6), xticks=[], yticks=[],
             title="the unknowns of interval k, by their names in the code")
interval.axis("off")

# The vector z: the three arrays laid end to end, as unpack reads them.
sizes = [(N + 1) * n, N * s * n, N]
labels = [f"x_mesh: (N+1)n = {sizes[0]}", f"x_stage: Nsn = {sizes[1]}", f"u: N = {sizes[2]}"]
slices = ["z[:(N+1)*n]", "z[(N+1)*n:-N]", "z[-N:]"]
start = 0
for size, label, piece, color in zip(sizes, labels, slices, ["#0072B2", "#D55E00", "0.3"]):
    vector.barh(0, size, left=start, height=0.9, color=color, alpha=0.18, edgecolor=color)
    vector.text(start + size / 2, 0, label, ha="center", va="center", **mono)
    vector.text(start + size / 2, -0.75, piece, ha="center", va="top", color="0.35",
                family="monospace", fontsize=9)
    start += size
vector.set(xlim=(0, n_z), ylim=(-1.4, 0.6), yticks=[], xticks=np.cumsum([0, *sizes]),
           title=f"the vector z of all {n_z} unknowns")
vector.spines[["left"]].set_visible(False)
plt.show()
```

<a id="step-2-allocate-the-variables-2-outputs"></a>

![<Figure size 900x400 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/8dd1ca2b39-19c964abde0e0222e8fd718c219bc4e4.png)

<a id="step-2-allocate-the-variables-3"></a>

> **For the exam.** Count the unknowns of a collocation transcription from the number of intervals $N$, the number of nodes $s$, the state dimension $n$, and the control representation. Here the count is $(N+1)n+Nsn+N$, which is $41\cdot2+40\cdot2\cdot2+40=282$: the mesh states, the stage states, and one torque per interval. Step 3 counts the equations in the same way.

<a id="step-3-assemble-each-interval-0"></a>

<a id="step-3-assemble-each-interval"></a>

## Step 3: Assemble Each Interval

The slopes $\mathbf f_{k,j}=\mathbf f(\mathbf x_{k,j},u_k)$ are now computed from the unknowns, so they change whenever the optimizer changes $\mathbf z$. The rule $A$, $b$ does not change. On each interval, the unknowns must satisfy the chapter’s **stage equations** and **endpoint equation**:

<a id="boep35miDm"></a>

$$
\mathbf x_{k,i}=\mathbf x_k+h\sum_{j=1}^{s}A_{ij}\mathbf f_{k,j},
\qquad
\mathbf x_{k+1}=\mathbf x_k+h\sum_{j=1}^{s}b_j\mathbf f_{k,j}.
$$

[(13)](#boep35miDm "Link to this Equation")

> **Question.** Stop here before reading on. Where do these two equations come from? Derive them from the results of Step 1.

Answer

Step 1 showed that integrating the interpolated slopes from the left end gives the state inside the interval:

<a id="MHIJmCmO2Z"></a>

$$
\mathbf x(t_k+h\tau)\approx\mathbf x_k
+h\sum_{j=1}^{s}\mathbf f_{k,j}\int_0^{\tau}\ell_j(\sigma)d\sigma .
$$

[(14)](#MHIJmCmO2Z "Link to this Equation")

Setting $\tau=\tau_i$ turns each integral into $A_{ij}$, and the right side becomes the value of the polynomial at node $i$. Requiring that value to equal the stored stage state $\mathbf x_{k,i}$ gives the stage equation. Setting $\tau=1$ turns each integral into $b_j$, and the right side becomes the value at the right end. Requiring that value to equal the next mesh state $\mathbf x_{k+1}$ gives the endpoint equation.

The stage equation for node $i$ requires the stored stage state $\mathbf x_{k,i}$ to lie on the polynomial built from the slopes. It is needed because the slopes were evaluated at the stored stage states. If those states could differ from the polynomial’s values, the slopes would describe some other trajectory. When the stage equation holds, the polynomial has the value $\mathbf x_{k,i}$ at node $i$, and its slope there is $\mathbf f_{k,i}$ by construction of the interpolant. The polynomial therefore satisfies the differential equation at node $i$. This is where the name comes from: to collocate is to place together, from the Latin _com-_ (together) and _locare_ (to place). A collocation method places the approximation and the differential equation together at the chosen nodes, where they must agree exactly. Between the nodes, nothing forces them to agree.

The endpoint equation requires the next mesh state to equal the value of the polynomial at the right end of the interval. The difference between its two sides is called the **defect**. Because $\mathbf x_{k+1}$ is also the starting state of interval $k+1$, a zero defect joins consecutive pieces into one continuous trajectory.

With the numbers from Step 1, the three equations read

<a id="HfoUgEprQr"></a>

$$
\begin{aligned}
\mathbf x_{k,1}&=\mathbf x_k
+h\left(\tfrac{5}{12}\mathbf f_{k,1}-\tfrac{1}{12}\mathbf f_{k,2}\right),\cr
\mathbf x_{k,2}&=\mathbf x_k
+h\left(\tfrac{3}{4}\mathbf f_{k,1}+\tfrac{1}{4}\mathbf f_{k,2}\right),\cr
\mathbf x_{k+1}&=\mathbf x_k
+h\left(\tfrac{3}{4}\mathbf f_{k,1}+\tfrac{1}{4}\mathbf f_{k,2}\right).
\end{aligned}
$$

[(15)](#HfoUgEprQr "Link to this Equation")

The first two use the rows of $A$ and the third uses $b$. The second and third equations have the same right side because $\tau_2=1$. The second row of $A$ integrates each basis function from 0 to $\tau_2=1$, which is the same integral that defines $b$, so $A_{2j}=b_j$: both rows are $(\tfrac{3}{4},\tfrac{1}{4})$. Two quantities equal to the same expression are equal to each other, so the equations imply $\mathbf x_{k,2}=\mathbf x_{k+1}$. This matches the picture: node 2 sits at the right end of the interval, so the state there is the next mesh state. The code keeps both variables and both equations anyway, so that it stays valid for nodes that do not include the right end.

The objective is built the same way. The cost accumulated since time 0 behaves like an extra state whose slope is the cost rate $c(\mathbf x,u)$, and the same rule integrates it. Its stage equations would use the rows of $A$ and give the cost accumulated up to each node. The objective needs only the total over each interval, which is the value at the right end, so only the weights $b$ appear. Interval $k$ adds $h(\tfrac{3}{4}c_{k,1}+\tfrac{1}{4}c_{k,2})$ to the objective, where $c_{k,j}=c(\mathbf x_{k,j},u_k)$. Here $c=u_k^2$ is constant on the interval and the weights sum to one, so this sum equals $hu_k^2$, the exact integral of the squared torque over the interval. The boundary conditions $\mathbf x_0=(0,0)$ and $\mathbf x_N=(\pi,0)$ and the torque limits $-u_{\max}\le u_k\le u_{\max}$ complete the finite problem. Because the torque is constant on each interval, bounding each $u_k$ bounds the torque at every instant, not only at the nodes.

<a id="step-3-assemble-each-interval-1"></a>

<a id="step-3-assemble-each-interval-1-code"></a>

```python
def objective(z):                                                       # F(z)
    x_mesh, x_stage, u = unpack(z)
    return sum(h * b[j] * c(x_stage[k, j], u[k]) for k in range(N) for j in range(s))


def equalities(z):                                                      # H(z) = 0
    x_mesh, x_stage, u = unpack(z)
    residuals = [x_mesh[0] - x_start, x_mesh[N] - x_goal]               # boundary conditions
    for k in range(N):
        slopes = np.array([f(x_stage[k, j], u[k]) for j in range(s)])   # f at every stage
        residuals.append(x_stage[k] - x_mesh[k] - h * A @ slopes)       # stage equations
        residuals.append(x_mesh[k + 1] - x_mesh[k] - h * b @ slopes)    # endpoint equation
    return np.concatenate([r.ravel() for r in residuals])


print("number of equations:", equalities(np.zeros(n_z)).size)
```

<a id="step-3-assemble-each-interval-1-outputs"></a>

```
number of equations: 244
```

<a id="step-3-assemble-each-interval-2"></a>

In `equalities`, the array `slopes` has one row per stage and one column per state component. The product `A @ slopes` computes all the sums $\sum_jA_{ij}\mathbf f_{k,j}$ at once, one row per node $i$, and `b @ slopes` computes the endpoint sum. Each residual is written as left side minus right side, so a solution makes it zero. The last line flattens the residuals into the single vector $H(\mathbf z)$ that the solver expects.

The count of equations explains what the optimizer is free to choose. The 240 stage and endpoint equations match the 240 states other than $\mathbf x_0$, so for a given initial state and given torques they determine the whole trajectory, as a simulation would. The torque is a zero-order hold with one value on each of the 40 intervals, so the optimizer chooses 40 torques. The four boundary equations fix $\mathbf x_0$ and impose two terminal conditions, which remove two of those choices and leave $40-2=38$ degrees of freedom. The torque limits are inequalities, not equations: they do not change this count, but they rule out part of that family. Among the torque sequences that bring the pendulum to the goal within the limits, the objective selects the one with the least effort.

The table collects the correspondence between the chapter’s symbols and the code.

| Chapter | Code | Meaning |
| --- | --- | --- |
| $\tau_j$ | `tau[j-1]` | collocation node $j$, in local time |
| $\ell_j$, $L_j$ | `lagrange_basis(tau)[j-1]`, `L[j-1]` | basis function and its antiderivative |
| $A_{ij}$, $b_j$ | `A[i-1, j-1]`, `b[j-1]` | the rule: weights of the slopes |
| $h$ | `h` | interval width |
| $\mathbf x_k$ | `x_mesh[k]` | state at the mesh time $t_k$ |
| $\mathbf x_{k,j}$ | `x_stage[k, j-1]` | state at node $j$ of interval $k$ |
| $u_k$ | `u[k]` | torque on interval $k$ |
| $\mathbf f_{k,j}$ | `slopes[j-1]` | ODE slope at node $j$ of interval $k$ |
| $\mathbf z$ | `z` | all unknowns in one vector |
| $F(\mathbf z)$, $H(\mathbf z)$ | `objective(z)`, `equalities(z)` | objective and equality residuals |

<a id="step-4-connect-the-controls-0"></a>

<a id="step-4-connect-the-controls"></a>

## Step 4: Connect the Controls

The state must be continuous, because it is obtained by integrating its rate of change, but the control need not be. A motor command can jump from one value to the next, as it does here between intervals, so no equation links $u_k$ to $u_{k+1}$. State continuity needs no extra equation either, because consecutive intervals share the mesh state $\mathbf x_{k+1}$. A smooth torque could be obtained by making it linear on each interval and sharing its endpoint values between intervals.

<a id="step-5-solve-and-check-0"></a>

<a id="step-5-solve-and-check"></a>

## Step 5: Solve and Check

The solver needs a starting point. The initial guess moves the states along a straight line from the start to the goal and sets the torque to zero. This is not a motion of the pendulum: without torque the pendulum would stay hanging. The largest residual at the guess, printed below, measures how far the guess is from satisfying the equations. A simultaneous method can start from such an infeasible guess, which only has to describe roughly where the motion should go. Such a guess is often easier to provide than a good torque sequence.

SciPy’s SLSQP method then improves $\mathbf z$ step by step. At each iteration it approximates $F$ by a quadratic function and $H$ by a linear one, solves that approximation for a step, and repeats. Intermediate iterates need not satisfy $H(\mathbf z)=\mathbf 0$; at convergence the residuals are zero up to the solver’s tolerance. SLSQP estimates the derivatives of `objective` and `equalities` by finite differences, which is adequate for 282 unknowns. Larger problems supply exact derivatives, for example by automatic differentiation, and use solvers that exploit the sparsity of the equations.

The torque limits reach the solver as bounds. SLSQP accepts one (lower, upper) pair per entry of $\mathbf z$, with `None` for no bound: the states are free, and each of the last $N$ entries, the torques, must lie in $[-u_{\max},u_{\max}]$. The option `ftol=1e-10` asks for a tighter tolerance than SLSQP’s default, so that the two formulations compared at the end of the demo agree closely.

<a id="step-5-solve-and-check-1"></a>

<a id="step-5-solve-and-check-1-code"></a>

```python
t = np.linspace(0, T, N + 1)                   # mesh times
t_stage = t[:-1, None] + h * tau               # stage times, shape (N, s)
z0 = np.concatenate([
    np.outer(t, x_goal / T).ravel(),           # mesh states on a straight line
    np.outer(t_stage, x_goal / T).ravel(),     # stage states on the same line
    np.zeros(N),                               # zero torque
])
bounds = [(None, None)] * (len(z0) - N) + [(-u_max, u_max)] * N   # limits on the torques
print(f"largest residual at the initial guess = {abs(equalities(z0)).max():.2f}")

solution = minimize(objective, z0, method="SLSQP", bounds=bounds, options={"ftol": 1e-10},
                    constraints={"type": "eq", "fun": equalities})
x_mesh, x_stage, u = unpack(solution.x)
print(solution.message)
print(f"cost = {solution.fun:.4f}")
print(f"largest torque used = {abs(u).max():.2f}")
print(f"largest residual = {abs(equalities(solution.x)).max():.1e}")
```

<a id="step-5-solve-and-check-1-outputs"></a>

```
largest residual at the initial guess = 0.20
```

```
Optimization terminated successfully
cost = 1.4429
largest torque used = 0.50
largest residual = 1.5e-12
```

<a id="step-5-solve-and-check-2"></a>

> **For the exam.** A small residual does not mean that the trajectory is accurate. Explain why, and say how to check accuracy.

The residual measures one thing: how far the stored numbers are from satisfying the collocation equations. The solver drives it down to its tolerance. Those equations are not the differential equation. They require the ODE only at the nodes, and they replace the integrand by its polynomial interpolant, so even an exact solution of the equations differs from the true motion under the same torques. This **discretization error** depends on the interval width and the nodes, not on the solver, so tightening the solver’s tolerance does not reduce it. To measure it, the next cell applies the optimized torques to the pendulum with an accurate ODE solver and compares the result with the stored states. This replay is one of the checks described in the chapter’s section on [checking the continuous trajectory](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md#sec-collocation-validation).

<a id="step-5-solve-and-check-3"></a>

<a id="step-5-solve-and-check-3-code"></a>

```python
def replay(u):
    # Integrate the ODE accurately under the piecewise-constant torques.
    states = [x_start]
    for k in range(N):
        step = solve_ivp(lambda _, x: f(x, u[k]), [0, h], states[-1], rtol=1e-10, atol=1e-10)
        states.append(step.y[:, -1])
    return np.array(states)


x_replay = replay(u)
print(f"largest difference from the replay = {abs(x_mesh - x_replay).max():.1e}")
```

<a id="step-5-solve-and-check-3-outputs"></a>

```
largest difference from the replay = 4.4e-03
```

<a id="step-5-solve-and-check-4"></a>

Source

<a id="step-5-solve-and-check-4-code"></a>

```python
# @title Plot the stored states, the replay, and the torque
fig, axes = plt.subplots(1, 3, figsize=(10, 2.8), constrained_layout=True, dpi=150)
for i, name in enumerate(["angle", "angular velocity"]):
    axes[i].plot(t, x_replay[:, i], color="0.6", label="ODE replay")
    axes[i].plot(t_stage.ravel(), x_stage[:, :, i].ravel(), ".", color="#D55E00",
                 label="stage states")
    axes[i].plot(t, x_mesh[:, i], "o", color="#0072B2", markersize=4, label="mesh states")
    axes[i].set(xlabel="time", title=name)
axes[0].legend(frameon=False)
axes[2].stairs(u, t, baseline=None, color="black")
for limit in (-u_max, u_max):                       # the torque limits
    axes[2].axhline(limit, color="#D55E00", linewidth=0.8, linestyle="--")
axes[2].set(xlabel="time", title="torque")
plt.show()
```

<a id="step-5-solve-and-check-4-outputs"></a>

![<Figure size 1500x420 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/ba480c84bc-446e7f56b3574a25f01e43008dd326aa.png)

<a id="step-5-solve-and-check-5"></a>

The difference from the replay, about $4\times10^{-3}$, is the discretization error of 40 intervals with the Radau rule. The second experiment at the end shows how quickly it decreases as the number of intervals grows.

In the figure, the grey curves are the replayed pendulum, the dots are the stored states, and the dashed lines mark the torque limits. The dots lie on the curves, and the pendulum arrives upright and at rest. The torque shows how a weak motor swings a pendulum up. For the first two seconds it pushes backward at the limit \-0.5, and the pendulum swings back to about $-54^\circ$, which it reaches at $t\approx2.8$. The torque reverses just before the pendulum turns around, and from $t=3$ to $t\approx5.6$ it pushes forward at the limit +0.5 while the pendulum swings through the bottom and climbs. Near the top the motor eases off and then brakes, so that the pendulum arrives at rest instead of swinging past the upright position.

The animation below shows the same replay as a motion: the optimized torques drive the pendulum from hanging at rest to upright at rest. It is computed by the accurate ODE solver, not read from the stored values, so it shows what the torques actually do to the pendulum. Press play, or drag the slider to step through time.

<a id="step-5-solve-and-check-6"></a>

Source

<a id="step-5-solve-and-check-6-code"></a>

```python
# @title Animate the pendulum under the optimized torques
from matplotlib import animation
from IPython.display import HTML

# Replay the optimized torques again, keeping two frames per interval.
times, states = [0.0], [x_start]
for k in range(N):
    step = solve_ivp(lambda _, x: f(x, u[k]), [0, h], states[-1], t_eval=np.linspace(0, h, 3)[1:],
                     rtol=1e-10, atol=1e-10)
    times.extend(t[k] + step.t)
    states.extend(step.y.T)
theta = np.array(states)[:, 0]

fig, (scene, torque_axis) = plt.subplots(1, 2, figsize=(7.5, 3.4), width_ratios=[1, 1.3],
                                         constrained_layout=True, dpi=72)
scene.set(xlim=(-1.3, 1.3), ylim=(-1.3, 1.3), aspect="equal")
scene.axis("off")
scene.plot(np.sin(theta), -np.cos(theta), color="0.85", linewidth=1)        # path of the bob
scene.plot([0], [1], "x", color="#D55E00", markersize=9)                     # upright goal
rod, = scene.plot([], [], color="0.25", linewidth=3)
bob, = scene.plot([], [], "o", color="#0072B2", markersize=14)
clock = scene.text(-1.25, 1.25, "", va="top", family="monospace", fontsize=9)
torque_axis.stairs(u, t, baseline=None, color="black")
for limit in (-u_max, u_max):                       # the torque limits
    torque_axis.axhline(limit, color="0.6", linewidth=0.8, linestyle="--")
torque_axis.set(xlabel="time", title="torque")
now = torque_axis.axvline(0, color="#D55E00")

def draw(i):
    x, y = np.sin(theta[i]), -np.cos(theta[i])
    rod.set_data([0, x], [0, y])
    bob.set_data([x], [y])
    clock.set_text(f"t = {times[i]:.2f}")
    now.set_xdata([times[i]])
    return rod, bob, clock, now

movie = animation.FuncAnimation(fig, draw, frames=len(times), interval=1000 * h / 2)  # real time
plt.close(fig)
HTML(movie.to_jshtml(default_mode="once"))
```

<a id="step-5-solve-and-check-6-outputs"></a>

Loading...

<a id="step-5-solve-and-check-7"></a>

> **Question.** Why does the pendulum swing backward first, instead of going straight up? Compare the torque limit with the largest torque that gravity can exert, and think about the pendulum’s energy.

Answer

Gravity exerts the torque $-\sin\theta$, whose largest magnitude is 1, reached when the pendulum is horizontal. The motor’s limit is 0.5, so it cannot even hold the pendulum horizontal, let alone push it straight up.

The energy explains the back swing. The pendulum’s energy $E=\tfrac{1}{2}\omega^2+1-\cos\theta$ is 0 when it hangs at rest and 2 when it stands upright at rest. Its rate of change is $\dot E=u\omega$, so the work of the motor is $\int u\omega dt=\int u d\theta$, at most 0.5 times the total angle the pendulum travels. Going straight from 0 to $\pi$ travels the angle $\pi$ and gains at most $0.5\pi\approx1.57$, less than the 2 needed. Swinging back to \-0.95 first makes the pendulum travel about $0.95+0.95+\pi\approx5.04$, which allows up to $0.5\times5.04\approx2.5$. The back swing pumps energy into the pendulum.

A pendulum with a motor at its pivot has one degree of freedom and one actuator, so it is fully actuated. With a torque limit below the largest gravity torque, it behaves like the underactuated systems of robotics, which must pump energy in this way. The third experiment at the end raises the limit above 1 to show the difference.

<a id="the-same-construction-with-derivatives-0"></a>

<a id="the-same-construction-with-derivatives"></a>

## The Same Construction with Derivatives

In the integration form above, the slopes are matched by design: the interpolated slope takes the value $\mathbf f_{k,j}$ at each node. What must be enforced is the consistency of the states. Integrating the interpolated slope from the mesh state $\mathbf x_k$ to node $i$ reconstructs a state value there, and the stage equation requires that reconstructed value to equal the stage state $\mathbf x_{k,i}$ that the optimizer holds as a decision variable. The chapter’s [differentiation form](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md#alg-collocation-differentiation-from-nodes) reverses the roles. It builds the polynomial through the stored state values, so the states are matched by design, and it enforces the slopes: the derivative of that polynomial must equal the ODE slope at each node. At a solution, both forms express the same two facts: the polynomial passes through the stored states, and its slope equals $\mathbf f$ at each node. They differ in which fact holds by construction and which becomes a constraint.

With $s$ nodes, the interpolated slope has degree $s-1$, so the state polynomial, its integral, has degree $s$, and $s+1$ values determine it. In this demo $s=2$: the slope is a line, the state is a quadratic, and three values determine it. Store its values at $\tau=0$ and at the two collocation nodes. These are $\mathbf x_k$, $\mathbf x_{k,1}$, and $\mathbf x_{k,2}$, the same unknowns as before, so $\mathbf z$, `unpack`, and `objective` do not change.

Let $\ell_0,\ell_1,\ell_2$ now denote the Lagrange basis for the three points $(0,\tfrac{1}{3},1)$, and write $\mathbf x_{k,0}=\mathbf x_k$ for the stored value at $\tau=0$. The quadratic through the three stored values is their Lagrange interpolant:

<a id="Y5U2OqNG9F"></a>

$$
\mathbf p_k(\tau)=\sum_{r=0}^{s}\mathbf x_{k,r}\ell_r(\tau).
$$

[(16)](#Y5U2OqNG9F "Link to this Equation")

The stored values are constants, so differentiating this sum differentiates only the basis functions, by the same linearity as in Step 1. At node $i$,

<a id="uGSTBxn6ye"></a>

$$
\mathbf p_k'(\tau_i)=\sum_{r=0}^{s}\ell_r'(\tau_i)\mathbf x_{k,r}
=\sum_{r=0}^{s}D_{ir}\mathbf x_{k,r},
\qquad
D_{ir}=\ell_r'(\tau_i).
$$

[(17)](#uGSTBxn6ye "Link to this Equation")

The numbers $D_{ir}$ depend only on the points, like $A$ and $b$, and they turn the three stored values into the exact slope of the quadratic at node $i$. That slope is measured per unit of local time. Since $t=t_k+h\tau$, the chain rule gives the physical-time slope $\tfrac{1}{h}\mathbf p_k'(\tau)$. Requiring it to equal the ODE slope at node $i$, and multiplying by $h$, gives the slope equations

<a id="VkEznZSckt"></a>

$$
\sum_{r=0}^{s}D_{ir}\mathbf x_{k,r}=h\mathbf f_{k,i}.
$$

[(18)](#VkEznZSckt "Link to this Equation")

By hand, the basis functions are

<a id="xDKhilMJB9"></a>

$$
\ell_0(\tau)=3\tau^2-4\tau+1,\qquad
\ell_1(\tau)=-\tfrac{9}{2}\tau^2+\tfrac{9}{2}\tau,\qquad
\ell_2(\tau)=\tfrac{3}{2}\tau^2-\tfrac{1}{2}\tau,
$$

[(19)](#xDKhilMJB9 "Link to this Equation")

with derivatives $6\tau-4$, $-9\tau+\tfrac{9}{2}$, and $3\tau-\tfrac{1}{2}$. Evaluating these derivatives at $\tfrac{1}{3}$ and at 1 gives one row of $D$ per collocation node, and hence the two slope equations:

<a id="BaivUoP2PJ"></a>

$$
D=\begin{bmatrix}
-2&\tfrac{3}{2}&\tfrac{1}{2}\cr
2&-\tfrac{9}{2}&\tfrac{5}{2}
\end{bmatrix},
\qquad
\begin{aligned}
-2\mathbf x_k+\tfrac{3}{2}\mathbf x_{k,1}+\tfrac{1}{2}\mathbf x_{k,2}
&=h\mathbf f_{k,1},\cr
2\mathbf x_k-\tfrac{9}{2}\mathbf x_{k,1}+\tfrac{5}{2}\mathbf x_{k,2}
&=h\mathbf f_{k,2}.
\end{aligned}
$$

[(20)](#BaivUoP2PJ "Link to this Equation")

Each row of $D$ sums to zero, because a constant state has zero slope. The endpoint equation evaluates the quadratic at $\tau=1$ with the weights $e_r=\ell_r(1)$. Here $e=(0,0,1)$ because $\tau=1$ is one of the stored points, so the equation reduces to $\mathbf x_{k+1}=\mathbf x_{k,2}$. Compared with the integration form, only the rule and two lines of the constraint function change.

<a id="the-same-construction-with-derivatives-1"></a>

<a id="the-same-construction-with-derivatives-1-code"></a>

```python
assert tau.min() > 0, "this section needs collocation nodes other than 0"

# D[i, r] is the slope of ell_r at tau_i, and e[r] is the value of ell_r at 1.
state_basis = lagrange_basis(np.append(0.0, tau))    # basis for the points 0, tau_1, ..., tau_s
D = np.array([[ell.deriv()(tau_i) for ell in state_basis] for tau_i in tau])
e = np.array([ell(1.0) for ell in state_basis])
show("D", D)
show("e", e)


def equalities_from_derivatives(z):                                     # H(z) = 0
    x_mesh, x_stage, u = unpack(z)
    residuals = [x_mesh[0] - x_start, x_mesh[N] - x_goal]               # boundary conditions
    for k in range(N):
        slopes = np.array([f(x_stage[k, j], u[k]) for j in range(s)])   # f at every stage
        values = np.vstack([x_mesh[k], x_stage[k]])                     # state at 0 and the nodes
        residuals.append(D @ values - h * slopes)                       # slope equations
        residuals.append(x_mesh[k + 1] - e @ values)                    # endpoint equation
    return np.concatenate([r.ravel() for r in residuals])


other = minimize(objective, z0, method="SLSQP", bounds=bounds, options={"ftol": 1e-10},
                 constraints={"type": "eq", "fun": equalities_from_derivatives})
print(f"cost = {other.fun:.4f}")
print(f"largest difference between the two solutions = {abs(other.x - solution.x).max():.1e}")
```

<a id="the-same-construction-with-derivatives-1-outputs"></a>

```
D = [[-2, 3/2, 1/2], [2, -9/2, 5/2]]
e = [0, 0, 1]
```

```
cost = 1.4429
largest difference between the two solutions = 1.3e-06
```

<a id="the-same-construction-with-derivatives-2"></a>

Both programs have the same unknowns and the same objective, and their constraints vanish at the same points, so the solver returns the same trajectory up to its tolerance. Away from a solution the two residual vectors differ, which can change the solver’s iterations but not the set of solutions.

<a id="experiments-0"></a>

<a id="experiments"></a>

## Experiments

Each experiment changes a few lines. Run all cells again after a change.

The first experiment replaces the nodes in Step 1. The same code then produces the other schemes of the chapter, because only the numbers in $A$ and $b$ change. The table lists the largest difference from the replay obtained with $N=40$.

| `tau` | Scheme | Difference from the replay |
| --- | --- | --- |
| `np.array([0.0])` | explicit Euler | 3 |
| `np.array([1.0])` | implicit Euler | does not converge |
| `np.array([0.5])` | implicit midpoint | $5\times10^{-2}$ |
| `np.array([0.0, 1.0])` | trapezoidal | $2\times10^{-2}$ |
| `np.array([1/3, 1.0])` | Radau, two stages | $4\times10^{-3}$ |
| `0.5 + np.array([-1, 1]) * np.sqrt(3) / 6` | Gauss, two stages | $3\times10^{-5}$ |
| `np.array([0.0, 0.5, 1.0])` | Hermite-Simpson | $9\times10^{-6}$ |

Every row that converges satisfies its own collocation equations to the solver’s tolerance. The rows differ in how well those equations represent the differential equation. Explicit Euler is the extreme case: the solver satisfies its equations, and its cost is the lowest of all rows, yet its torques drive the real pendulum nowhere near the top. Implicit Euler stops at SLSQP’s iteration limit with a residual near 0.04. A likely reason is that implicit Euler damps oscillations numerically, removing energy at every step, so that its discrete pendulum cannot reach the top with the weak motor. A node at 0 runs through Step 5 and stops at the first line of the last section, which stores the state at 0 and at the collocation nodes and needs these to be distinct. For the Gauss nodes, `show` prints rounded fractions because the exact entries are irrational.

The second experiment refines the mesh. With the Radau nodes, set `N` to 10, 20, 40, and 80; the last takes about half a minute to solve. The difference from the replay falls by a factor of about eight each time `N` doubles.

The third experiment makes the motor strong. Set `T = 4.0`, `N = 20`, and `u_max = 1.5`, which is above the largest gravity torque. The solution then uses torques up to about 1.35 and never reaches the limit, so the bound is inactive. The motor overpowers gravity at every angle, and the animation in Step 5 shows the pendulum lifted straight up, without a back swing. The collocation construction is the same; only the optimal motion changes.

<a id="summary-0"></a>

<a id="summary"></a>

## Summary

The demo turned a continuous-time problem into 282 numbers, 244 equations, and limits on 40 of the numbers. The rule $A$, $b$ depends only on the nodes and is computed once by exact polynomial calculus. The stage equations make the polynomial on each interval satisfy the ODE at the nodes, the endpoint equations join the pieces, and the same weights integrate the cost. The solver’s residual shows that the finite equations hold, and the replay measures how well they represent the pendulum. Changing the nodes, the number of intervals, or the model changes a line or a cell, and the construction stays the same. The chapter [Continuous-Time Transcription and Collocation](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) develops each step in general, including controls that vary within an interval and constraints checked between nodes.

[

Parameterized Policy Optimization

Policy Gradients and Actor-Critic


](27-policy-gradients.md)[

Appendix

Example COCPs


](29-appendix-examples.md)


---

# CHAPITRE 29 — Example COCPs

Section du livre : Appendix

Page originale : https://pierrelucbacon.com/rlbook/appendix-examples

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/29-appendix-examples.md

> **Cours de Pierre-Luc Bacon — 29.** [Page publiée](https://pierrelucbacon.com/rlbook/appendix-examples) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/29-appendix-examples.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Example COCPs

<a id="skip-to-article"></a>

<a id="heat-exchanger"></a>

## Heat Exchanger

<a id="HG4e8y3O9O"></a>
![Heat Exchanger](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/64f816799e-heat_exchanger-36d42c7ce90c38ee24e241c608f46188.svg)

We are considering a system where fluid flows through a tube, and the goal is to control the temperature of the fluid by adjusting the temperature of the tube’s wall over time. The wall temperature, denoted as $T_w(t)$, can be changed as a function of time, but it remains the same along the length of the tube. On the other hand, the temperature of the fluid inside the tube, $T(z, t)$, depends both on its position along the tube $z$ and on time $t$. It evolves according to the following partial differential equation:

<a id="W2ovR5lXLw"></a>

$$
\frac{\partial T}{\partial t} = -v \frac{\partial T}{\partial z} + \frac{h}{\rho C_p} (T_w(t) - T)
$$

[(1)](#W2ovR5lXLw "Link to this Equation")

where we have:

-   $v$: the average speed of the fluid moving through the tube,
    
-   $h$: how easily heat transfers from the wall to the fluid,
    
-   $\rho$ and $C_p$: the fluid’s density and heat capacity.
    

This equation describes how the fluid’s temperature changes as it moves along the tube and interacts with the tube’s wall temperature. The fluid enters the tube with an initial temperature $T_0$ at the inlet (where $z = 0$). Our objective is to adjust the wall temperature $T_w(t)$ so that by a specific final time $t_f$, the fluid’s temperature reaches a desired distribution $T_s(z)$ along the length of the tube. The relationship for $T_s(z)$ under steady-state conditions (ie. when changes over time are no longer considered), is given by:

<a id="uoYgc1ikSM"></a>

$$
\frac{d T_s}{d z} = \frac{h}{v \rho C_p}[\theta - T_s]
$$

[(2)](#uoYgc1ikSM "Link to this Equation")

where $\theta$ is a constant temperature we want to maintain at the wall. The objective is to control the wall temperature $T_w(t)$ so that by the end of the time interval $t_f$, the fluid temperature $T(z, t_f)$ is as close as possible to the desired distribution $T_s(z)$. This can be formalized by minimizing the following quantity:

<a id="aGcBy3ACRz"></a>

$$
I = \int_0^L \left[T(z, t_f) - T_s(z)\right]^2 dz
$$

[(3)](#aGcBy3ACRz "Link to this Equation")

where $L$ is the length of the tube. Additionally, we require that the wall temperature cannot exceed a maximum allowable value $T_{\max}$:

<a id="a0PCjxod2E"></a>

$$
T_w(t) \leq T_{\max}
$$

[(4)](#a0PCjxod2E "Link to this Equation")

<a id="nuclear-reactor"></a>

## Nuclear Reactor

<a id="rctpEP8ZRz"></a>
![Nuclear Reactor Diagram](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/8010c3a4da-nuclear_reactor-f81fb8dc98e83139dba2b3333a3a71ef.svg)

In a nuclear reactor, neutrons interact with fissile nuclei, causing nuclear fission. This process produces more neutrons and smaller fissile nuclei called precursors. The precursors subsequently absorb more neutrons, generating “delayed” neutrons. The kinetic energy of these products is converted into thermal energy through collisions with neighboring atoms. The reactor’s power output is determined by the concentration of neutrons available for nuclear fission.

The reaction kinetics can be modeled using a system of ordinary differential equations:

<a id="XeBtZAqzSL"></a>

$$
\begin{align*}
\dot{x}(t) &= \frac{r(t)x(t) - \alpha x^2(t) - \beta x(t)}{\tau} + \mu y(t), & x(0) &= x_0 \\
\dot{y}(t) &= \frac{\beta x(t)}{\tau} - \mu y(t), & y(0) &= y_0
\end{align*}
$$

[(5)](#XeBtZAqzSL "Link to this Equation")

where:

-   $x(t)$: concentration of neutrons at time $t$
    
-   $y(t)$: concentration of precursors at time $t$
    
-   $t$: time
    
-   $r(t) = r[u(t)]$: degree of change in neutron multiplication at time $t$ as a function of control rod displacement $u(t)$
    
-   $\alpha$: reactivity coefficient
    
-   $\beta$: fraction of delayed neutrons
    
-   $\mu$: decay constant for precursors
    
-   $\tau$: average time taken by a neutron to produce a neutron or precursor
    

The power output can be adjusted based on demand by inserting or retracting a neutron-absorbing control rod. Inserting the control rod absorbs neutrons, reducing the heat flux and power output, while retracting the rod has the opposite effect.

The objective is to change the neutron concentration $x(t)$ from an initial value $x_0$ to a stable value $x_\mathrm{f}$ at time $t_\mathrm{f}$ while minimizing the displacement of the control rod. This can be formulated as an optimal control problem, where the goal is to find the control function $u(t)$ that minimizes the objective functional:

<a id="K5De6LB3b6"></a>

$$
I = \int_0^{t_\mathrm{f}} u^2(t) \, \mathrm{d}t
$$

subject to the final conditions:

<a id="iBWcZPI5lC"></a>

$$
\begin{align*}
x(t_\mathrm{f}) &= x_\mathrm{f} \\
\dot{x}(t_\mathrm{f}) &= 0
\end{align*}
$$

[(6)](#iBWcZPI5lC "Link to this Equation")

and the constraint $|u(t)| \leq u_\mathrm{max}$

<a id="chemotherapy"></a>

## Chemotherapy

Chemotherapy uses drugs to kill cancer cells. However, these drugs can also have toxic effects on healthy cells in the body. To optimize the effectiveness of chemotherapy while minimizing its side effects, we can formulate an optimal control problem.

The drug concentration $y_1(t)$ and the number of immune cells $y_2(t)$, healthy cells $y_3(t)$, and cancer cells $y_4(t)$ in an organ at any time $t$ during chemotherapy can be modeled using a system of ordinary differential equations:

<a id="jbwHdyITI1"></a>

$$
\begin{align*}
\dot{y}_1(t) &= u(t) - \gamma_6 y_1(t) \\
\dot{y}_2(t) &= \dot{y}_{2,\text{in}} + r_2 \frac{y_2(t) y_4(t)}{\beta_2 + y_4(t)} - \gamma_3 y_2(t) y_4(t) - \gamma_4 y_2(t) - \alpha_2 y_2(t) \left(1 - e^{-y_1(t) \lambda_2}\right) \\
\dot{y}_3(t) &= r_3 y_3(t) \left(1 - \beta_3 y_3(t)\right) - \gamma_5 y_3(t) y_4(t) - \alpha_3 y_3(t) \left(1 - e^{-y_1(t) \lambda_3}\right) \\
\dot{y}_4(t) &= r_1 y_4(t) \left(1 - \beta_1 y_4(t)\right) - \gamma_1 y_3(t) y_4(t) - \gamma_2 y_2(t) y_4(t) - \alpha_1 y_4(t) \left(1 - e^{-y_1(t) \lambda_1}\right)
\end{align*}
$$

[(7)](#jbwHdyITI1 "Link to this Equation")

where:

-   $y_1(t)$: drug concentration in the organ at time $t$
    
-   $y_2(t)$: number of immune cells in the organ at time $t$
    
-   $y_3(t)$: number of healthy cells in the organ at time $t$
    
-   $y_4(t)$: number of cancer cells in the organ at time $t$
    
-   $\dot{y}_{2,\text{in}}$: constant rate of immune cells entering the organ to fight cancer cells
    
-   $u(t)$: rate of drug injection into the organ at time $t$
    
-   $r_i, \beta_i$: constants in the growth terms
    
-   $\alpha_i, \lambda_i$: constants in the decay terms due to the action of the drug
    
-   $\gamma_i$: constants in the remaining decay terms
    

The objective is to minimize the number of cancer cells $y_4(t)$ in a specified time $t_\mathrm{f}$ while using the minimum amount of drug to reduce its toxic effects. This can be formulated as an optimal control problem, where the goal is to find the control function $u(t)$ that minimizes the objective functional:

<a id="Fxxq1uEEYc"></a>

$$
I = y_4(t_\mathrm{f}) + \int_0^{t_\mathrm{f}} u(t) \, \mathrm{d}t
$$

subject to the system dynamics, initial conditions, and the constraint $u(t) \geq 0$.

Additional constraints may include:

-   Maintaining a minimum number of healthy cells during treatment:
    
    <a id="MGYI9mbECh"></a>
    
    $$
    y_3(t) \geq y_{3,\min}
    $$
    
-   Imposing an upper limit on the drug dosage:
    
    <a id="RE7brtcCNB"></a>
    
    $$
    u(t) \leq u_{\max}
    $$
    

<a id="government-corruption"></a>

## Government Corruption

In this model from Feichtinger and Wirl (1994), we aim to understand the incentives for politicians to engage in corrupt activities or to combat corruption. The model considers a politician’s popularity as a dynamic process that is influenced by the public’s memory of recent and past corruption. The objective is to find conditions under which self-interested politicians would choose to be honest or dishonest.

The model introduces the following notation:

-   $C(t)$: accumulated awareness (knowledge) of past corruption at time $t$
    
-   $u(t)$: extent of corruption (politician’s control variable) at time $t$
    
-   $\delta$: rate of forgetting past corruption
    
-   $P(t)$: politician’s popularity at time $t$
    
-   $g(P)$: growth function of popularity; $g''(P) < 0$
    
-   $f(C)$: function measuring the loss of popularity caused by $C$; $f'(C) > 0$, $f''(C) \geq 0$
    
-   $U_1(P)$: benefits associated with being popular; $U_1'(P) > 0$, $U_1''(P) \leq 0$
    
-   $U_2(u)$: benefits resulting from bribery and fraud; $U_2'(u) > 0$, $U_2''(u) < 0$
    
-   $r$: discount rate
    

The dynamics of the public’s memory of recent and past corruption $C(t)$ are modeled as:

<a id="tGPRZsLpXi"></a>

$$
\begin{align*}
\dot{C}(t) &= u(t) - \delta C(t), \quad C(0) = C_0
\end{align*}
$$

[(8)](#tGPRZsLpXi "Link to this Equation")

The evolution of the politician’s popularity $P(t)$ is governed by:

<a id="tlSYMCqyHg"></a>

$$
\begin{align*}
\dot{P}(t) &= g(P(t)) - f(C(t)), \quad P(0) = P_0
\end{align*}
$$

[(9)](#tlSYMCqyHg "Link to this Equation")

The politician’s objective is to maximize the following objective:

<a id="DFzwPEb0B9"></a>

$$
\int_0^{\infty} e^{-rt} [U_1(P(t)) + U_2(u(t))] \, \mathrm{d}t
$$

subject to the dynamics of corruption awareness and popularity.

The optimal control problem can be formulated as follows:

<a id="ZIAH33QDOh"></a>

$$
\begin{align*}
\max_{u(\cdot)} \quad & \int_0^{\infty} e^{-rt} [U_1(P(t)) + U_2(u(t))] \, \mathrm{d}t \\
\text{s.t.} \quad & \dot{C}(t) = u(t) - \delta C(t), \quad C(0) = C_0 \\
& \dot{P}(t) = g(P(t)) - f(C(t)), \quad P(0) = P_0
\end{align*}
$$

[(10)](#ZIAH33QDOh "Link to this Equation")

The state variables are the accumulated awareness of past corruption $C(t)$ and the politician’s popularity $P(t)$. The control variable is the extent of corruption $u(t)$. The objective functional represents the discounted stream of benefits coming from being honest (popularity) and from being dishonest (corruption).

[

Demos

Direct Collocation for a Pendulum Swing-Up


](28-collocation-from-nodes.md)[

Appendix

Solving Initial Value Problems


](30-appendix-ivps.md)


---

# CHAPITRE 30 — Solving Initial Value Problems

Section du livre : Appendix

Page originale : https://pierrelucbacon.com/rlbook/appendix-ivps

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/30-appendix-ivps.md

> **Cours de Pierre-Luc Bacon — 30.** [Page publiée](https://pierrelucbacon.com/rlbook/appendix-ivps) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/30-appendix-ivps.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Solving Initial Value Problems

<a id="skip-to-article"></a>

An ordinary differential equation specifies a trajectory through its rate of change. An **initial value problem** (IVP) supplies the state from which that trajectory starts:

<a id="cD4XJ3iA1v"></a>

$$
\dot{\mathbf{x}}(t)=\mathbf{f}(t,\mathbf{x}(t)),
\qquad
\mathbf{x}(t_0)=\mathbf{x}_0.
$$

[(1)](#cD4XJ3iA1v "Link to this Equation")

Except for special vector fields, the state at a later time is not available in closed form. A numerical integrator advances an approximation from one mesh point to the next. Given $t_n$, an approximate state $\mathbf{x}_n$, and a step $h_n=t_{n+1}-t_n$, one step defines a map

<a id="Byj6u9Lvhp"></a>

$$
\mathbf{x}_{n+1}
=\Phi_{h_n}(t_n,\mathbf{x}_n)
\approx \mathbf{x}(t_{n+1}).
$$

[(2)](#Byj6u9Lvhp "Link to this Equation")

This one-step map is the part of an ODE solver used by shooting methods. The sections below derive five fixed-step maps: forward Euler, backward Euler, the implicit trapezoidal rule, Heun’s predictor-corrector method, and classical fourth-order Runge--Kutta.

<a id="the-integral-identity-behind-a-step"></a>

## The integral identity behind a step

Integrating the ODE over one interval gives the exact relation

<a id="BtRR9Lz8NT"></a>

$$
\mathbf{x}(t_{n+1})
=\mathbf{x}(t_n)
+\int_{t_n}^{t_{n+1}}
\mathbf{f}(s,\mathbf{x}(s))\,ds.
$$

[(3)](#BtRR9Lz8NT "Link to this Equation")

Every method in this appendix replaces the unknown integral by finitely many evaluations of $\mathbf{f}$. Their locations, weights, and stage equations jointly determine the method’s accuracy, computational cost, and stability.

Two error scales are useful. The **local truncation error** measures the error made by one step that starts from the exact state. The **global error** measures the accumulated error after advancing across a fixed time interval. A method of order $p$ has global error $O(h^p)$ as a uniform step $h$ tends to zero, provided the solution and vector field are sufficiently smooth.

<a id="forward-explicit-euler"></a>

## Forward (explicit) Euler

Forward Euler, also called **explicit Euler**, replaces the vector field throughout the interval by its value at the left endpoint:

<a id="scGjbSyJzW"></a>

$$
\mathbf{x}_{n+1}
=\mathbf{x}_n+h_n\mathbf{f}(t_n,\mathbf{x}_n).
$$

[(4)](#scGjbSyJzW "Link to this Equation")

The update is explicit because every quantity on the right is known. It uses one vector-field evaluation per step and has first-order global accuracy. The same formula follows from the first-order Taylor expansion of $\mathbf{x}(t_n+h_n)$.

For the ballistic system

<a id="ukIMzKiLWh"></a>

$$
\dot y=v,
\qquad
\dot v=-g,
$$

[(5)](#ukIMzKiLWh "Link to this Equation")

forward Euler gives

<a id="Q21Ai2aXRL"></a>

$$
y_{n+1}=y_n+h_nv_n,
\qquad
v_{n+1}=v_n-h_ng.
$$

[(6)](#Q21Ai2aXRL "Link to this Equation")

The velocity update is exact because its derivative is constant. The position update is not exact because the velocity changes during the interval.

<a id="backward-implicit-euler"></a>

## Backward (implicit) Euler

Backward Euler, also called **implicit Euler**, evaluates the vector field at the unknown right endpoint:

<a id="VmhVTn9VZ3"></a>

$$
\mathbf{x}_{n+1}
=\mathbf{x}_n+h_n\mathbf{f}(t_{n+1},\mathbf{x}_{n+1}).
$$

[(7)](#VmhVTn9VZ3 "Link to this Equation")

This equation is implicit. One step requires solving the nonlinear residual

<a id="S7zVdRaHsL"></a>

$$
\mathbf{r}(\mathbf{z})
:=\mathbf{z}-\mathbf{x}_n
-h_n\mathbf{f}(t_{n+1},\mathbf{z})
=\mathbf{0}
$$

[(8)](#S7zVdRaHsL "Link to this Equation")

for $\mathbf{z}=\mathbf{x}_{n+1}$. A fixed-point iteration or a root finder such as Newton’s method can perform the internal solve. A failed or loosely converged internal solve changes the effective one-step map, so its residual tolerance is part of the integration accuracy.

Backward Euler has first-order global accuracy. Its main advantage is stability: strongly decaying modes remain stable for step sizes that would make forward Euler diverge.

<a id="implicit-trapezoidal-rule"></a>

## Implicit trapezoidal rule

The trapezoidal rule approximates the integral of the vector field by the average of its values at the two endpoints:

<a id="jUjmVpILLP"></a>

$$
\mathbf{x}_{n+1}
=\mathbf{x}_n
+\frac{h_n}{2}
\left[
\mathbf{f}(t_n,\mathbf{x}_n)
+\mathbf{f}(t_{n+1},\mathbf{x}_{n+1})
\right].
$$

[(9)](#jUjmVpILLP "Link to this Equation")

The right-endpoint state is unknown, so this rule is also implicit. Its nonlinear residual is

<a id="S299vqo7us"></a>

$$
\mathbf{r}(\mathbf{z})
:=\mathbf{z}-\mathbf{x}_n
-\frac{h_n}{2}
\left[
\mathbf{f}(t_n,\mathbf{x}_n)
+\mathbf{f}(t_{n+1},\mathbf{z})
\right].
$$

[(10)](#S299vqo7us "Link to this Equation")

Solving $\mathbf{r}(\mathbf{z})=\mathbf{0}$ to sufficient accuracy produces a second-order method. The implicit trapezoidal rule is time-symmetric and stable throughout the left half of the complex plane. Unlike backward Euler, however, it does not strongly damp extremely fast modes; a large step can make such modes alternate in sign while decaying very slowly.

<a id="predictor-corrector-iteration-and-heuns-method"></a>

## Predictor-corrector iteration and Heun’s method

An Euler prediction supplies a convenient initial guess for the implicit trapezoidal equation:

<a id="tDsc9zfpfy"></a>

$$
\mathbf{x}_{n+1}^{(0)}
=\mathbf{x}_n+h_n\mathbf{f}(t_n,\mathbf{x}_n).
$$

[(11)](#tDsc9zfpfy "Link to this Equation")

Substituting that prediction into the right-endpoint evaluation gives

<a id="ivD0fL2J4U"></a>

$$
\mathbf{x}_{n+1}^{(1)}
=\mathbf{x}_n
+\frac{h_n}{2}
\left[
\mathbf{f}(t_n,\mathbf{x}_n)
+\mathbf{f}(t_{n+1},\mathbf{x}_{n+1}^{(0)})
\right].
$$

[(12)](#ivD0fL2J4U "Link to this Equation")

Stopping after this correction gives **Heun’s method**, also called the explicit trapezoidal method. It is an explicit, second-order Runge--Kutta method: the endpoint slope is evaluated at the Euler-predicted state, not at the unknown final state.

Repeating the correction,

<a id="dotH0FFtSU"></a>

$$
\mathbf{x}_{n+1}^{(m+1)}
=\mathbf{x}_n
+\frac{h_n}{2}
\left[
\mathbf{f}(t_n,\mathbf{x}_n)
+\mathbf{f}(t_{n+1},\mathbf{x}_{n+1}^{(m)})
\right],
$$

[(13)](#dotH0FFtSU "Link to this Equation")

is a fixed-point, or Picard, iteration for the implicit trapezoidal equation. If the iteration converges, its limit is the implicit trapezoidal step. It is not a Newton iteration. Newton’s method instead uses the residual Jacobian and updates

<a id="GVODvudIub"></a>

$$
\mathbf{z}^{(m+1)}
=\mathbf{z}^{(m)}
-\left[
\mathbf{I}-\frac{h_n}{2}
\nabla_{\mathbf{x}}\mathbf{f}(t_{n+1},\mathbf{z}^{(m)})
\right]^{-1}
\mathbf{r}(\mathbf{z}^{(m)}).
$$

[(14)](#GVODvudIub "Link to this Equation")

The distinction matters when the step is large or the dynamics are stiff. Picard iteration requires its fixed-point map to be contractive, whereas a well-globalized Newton solve can converge in cases where Picard iteration does not.

<a id="classical-fourth-order-runge-kutta"></a>

## Classical fourth-order Runge--Kutta

Classical RK4 evaluates four slopes. Starting from $(t_n,\mathbf{x}_n)$, define

<a id="D5BD4QINqu"></a>

$$
\begin{aligned}
\mathbf{k}_1 &= \mathbf{f}(t_n,\mathbf{x}_n),\\
\mathbf{k}_2 &= \mathbf{f}\!\left(t_n+\frac{h_n}{2},
  \mathbf{x}_n+\frac{h_n}{2}\mathbf{k}_1\right),\\
\mathbf{k}_3 &= \mathbf{f}\!\left(t_n+\frac{h_n}{2},
  \mathbf{x}_n+\frac{h_n}{2}\mathbf{k}_2\right),\\
\mathbf{k}_4 &= \mathbf{f}\!\left(t_n+h_n,
  \mathbf{x}_n+h_n\mathbf{k}_3\right).
\end{aligned}
$$

[(15)](#D5BD4QINqu "Link to this Equation")

The step is

<a id="kHUaOoGPUC"></a>

$$
\mathbf{x}_{n+1}
=\mathbf{x}_n
+\frac{h_n}{6}
\left(\mathbf{k}_1+2\mathbf{k}_2+2\mathbf{k}_3+\mathbf{k}_4\right).
$$

[(16)](#kHUaOoGPUC "Link to this Equation")

RK4 is explicit and has fourth-order global accuracy for smooth problems. The two midpoint evaluations occur at the same time but at different predicted states. They are stages of the Runge--Kutta calculation, not values of one cubic interpolant at four distinct collocation nodes. Classical RK4 is therefore not a collocation method. Some _implicit_ Runge--Kutta methods are obtained from Gauss, Radau, or Lobatto collocation, but that correspondence does not include classical RK4.

<a id="a-compact-fixed-step-implementation"></a>

## A compact fixed-step implementation

The implementations below expose the one-step maps directly. The implicit methods use a generic nonlinear root solver initialized by a forward Euler prediction.

<a id="hBqiLT3jmc"></a>

```python
import numpy as np
from scipy.optimize import root


def forward_euler_step(fun, t, x, h):
    x = np.asarray(x, dtype=float)
    return x + h * fun(t, x)


def backward_euler_step(fun, t, x, h):
    x = np.asarray(x, dtype=float)
    guess = forward_euler_step(fun, t, x, h)
    residual = lambda z: z - x - h * fun(t + h, z)
    solution = root(residual, guess)
    residual_norm = np.linalg.norm(residual(solution.x), ord=np.inf)
    tolerance = 1e-10 * (1 + np.linalg.norm(x, ord=np.inf))
    if residual_norm > tolerance:
        raise RuntimeError(
            f"backward Euler residual {residual_norm:.3e}: {solution.message}"
        )
    return solution.x


def implicit_trapezoid_step(fun, t, x, h):
    x = np.asarray(x, dtype=float)
    slope_left = fun(t, x)
    guess = x + h * slope_left
    residual = lambda z: z - x - 0.5 * h * (slope_left + fun(t + h, z))
    solution = root(residual, guess)
    residual_norm = np.linalg.norm(residual(solution.x), ord=np.inf)
    tolerance = 1e-10 * (1 + np.linalg.norm(x, ord=np.inf))
    if residual_norm > tolerance:
        raise RuntimeError(
            f"trapezoidal residual {residual_norm:.3e}: {solution.message}"
        )
    return solution.x


def heun_step(fun, t, x, h):
    x = np.asarray(x, dtype=float)
    slope_left = fun(t, x)
    prediction = x + h * slope_left
    return x + 0.5 * h * (slope_left + fun(t + h, prediction))


def rk4_step(fun, t, x, h):
    x = np.asarray(x, dtype=float)
    k1 = fun(t, x)
    k2 = fun(t + 0.5 * h, x + 0.5 * h * k1)
    k3 = fun(t + 0.5 * h, x + 0.5 * h * k2)
    k4 = fun(t + h, x + h * k3)
    return x + (h / 6.0) * (k1 + 2 * k2 + 2 * k3 + k4)


def integrate_fixed_step(step, fun, x0, t0, tf, h):
    n_steps = int(np.ceil((tf - t0) / h))
    times = np.linspace(t0, tf, n_steps + 1)
    states = np.empty((n_steps + 1, np.size(x0)), dtype=float)
    states[0] = np.asarray(x0, dtype=float)
    for n in range(n_steps):
        step_size = times[n + 1] - times[n]
        states[n + 1] = step(fun, times[n], states[n], step_size)
    return times, states


decay = lambda t, x: -2.0 * x
exact_terminal = np.exp(-6.0)
methods = {
    "forward Euler": forward_euler_step,
    "backward Euler": backward_euler_step,
    "implicit trapezoid": implicit_trapezoid_step,
    "Heun": heun_step,
    "classical RK4": rk4_step,
}

for name, step in methods.items():
    _, states = integrate_fixed_step(step, decay, [1.0], 0.0, 3.0, 0.25)
    error = abs(states[-1, 0] - exact_terminal)
    print(f"{name:20s} terminal error: {error:.3e}")
```

```
forward Euler        terminal error: 2.235e-03
backward Euler       terminal error: 5.229e-03
implicit trapezoid   terminal error: 3.020e-04
Heun                 terminal error: 1.074e-03
classical RK4        terminal error: 1.180e-05
```

<a id="stability-and-stiffness"></a>

## Stability and stiffness

Accuracy describes how the error shrinks as $h$ tends to zero. Stability asks whether repeated numerical steps preserve the qualitative decay of the ODE at the chosen step size. A high-order method can still be unstable when its step is too large.

The scalar test equation

<a id="Nxw0HSu8Ck"></a>

$$
\dot x=\lambda x,
\qquad \operatorname{Re}(\lambda)<0,
$$

[(17)](#Nxw0HSu8Ck "Link to this Equation")

has a decaying exact solution. Applying a one-step method gives $x_{n+1}=R(z)x_n$ with $z=h\lambda$. The numerical solution does not grow where $|R(z)|\leq 1$ and decays strictly where $|R(z)|<1$. The five methods have the following stability functions:

| method | global order | explicit? | stability function $R(z)$ |
| --- | --- | --- | --- |
| forward Euler | 1 | yes | $1+z$ |
| backward Euler | 1 | no | $1/(1-z)$ |
| implicit trapezoidal | 2 | no | $(1+z/2)/(1-z/2)$ |
| Heun | 2 | yes | $1+z+z^2/2$ |
| classical RK4 | 4 | yes | $1+z+z^2/2+z^3/6+z^4/24$ |

For real $\lambda<0$, forward Euler requires $0<h<2/|\lambda|$. Backward Euler and the implicit trapezoidal rule are **A-stable**: their stability regions contain the entire left half-plane. Backward Euler is also **L-stable**, since $R(z)\to 0$ as $z\to-\infty$. The trapezoidal rule instead has $R(z)\to-1$, so it can preserve a weak step-to-step oscillation in modes that the exact solution damps almost immediately. Heun and RK4 can give higher accuracy per step than forward Euler on smooth nonstiff problems, but both remain explicit methods with bounded stability regions.

An IVP is **stiff** when rapidly decaying modes force an explicit method to take steps much shorter than the time scale on which the desired solution changes. Implicit methods cost more per step because they solve nonlinear equations, but their stability can make much larger steps possible. Stability does not remove the need for accuracy checks: a stable coarse solution can still be inaccurate.

<a id="the-one-step-map-in-shooting-methods"></a>

## The one-step map in shooting methods

A controlled system adds a prescribed input over each integration interval:

<a id="YKtg8nDfc1"></a>

$$
\dot{\mathbf{x}}(t)
=\mathbf{f}(t,\mathbf{x}(t),\mathbf{u}(t)).
$$

[(18)](#YKtg8nDfc1 "Link to this Equation")

For example, under a zero-order hold every stage used to advance across $[t_n,t_{n+1}]$ receives the same value $\mathbf{u}_n$. Applying any integrator above then defines

<a id="D6XpDwTKIL"></a>

$$
\mathbf{x}_{n+1}
=\Phi_{h_n}(t_n,\mathbf{x}_n,\mathbf{u}_n).
$$

[(19)](#D6XpDwTKIL "Link to this Equation")

In **single shooting**, the optimizer selects the control parameters and every state follows by repeatedly applying $\Phi$. The states are intermediate values of the computation rather than independent optimization variables.

In **multiple shooting**, the initial state of each segment is an optimization variable. Integration produces a predicted terminal state $\widehat{\mathbf{s}}_{k+1}$ for segment $k$, and the nonlinear program imposes the continuity defect

<a id="gtJjqTvzkm"></a>

$$
\mathbf{s}_{k+1}-\widehat{\mathbf{s}}_{k+1}=\mathbf{0}.
$$

[(20)](#gtJjqTvzkm "Link to this Equation")

The integrator is therefore part of the model seen by the optimizer. Its step size, control interpolation, nonlinear-solve tolerance, and differentiability all affect the resulting objective and constraints. After optimization, a tighter integration tolerance or a refined step should replay the fixed control trajectory. A large discrepancy between the optimization rollout and this validation rollout indicates that the integration mesh was inadequate.

<a id="from-shooting-to-collocation"></a>

## From shooting to collocation

Shooting advances a state sequentially through a one-step or segment map. [Trajectory Optimization in Continuous Time](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/10-continuous-time-collocation.md) develops the simultaneous alternative: state values across an interval become optimization variables, a polynomial interpolates those values, and the ODE is imposed at selected nodes. That chapter treats polynomial representations, differentiation matrices, quadrature, and direct collocation. Keeping those ideas there avoids a second, competing derivation in this IVP appendix.

<a id="summary"></a>

## Summary

Forward Euler, Heun, and classical RK4 are explicit one-step methods of orders one, two, and four. Backward Euler and the implicit trapezoidal rule require an internal nonlinear solve; they have orders one and two and are stable throughout the left half-plane. One Euler prediction followed by one trapezoidal correction is Heun’s explicit method. Repeated corrections form Picard iteration for the implicit trapezoidal equation, while Newton’s method uses the residual Jacobian.

For shooting, any of these methods becomes a finite transition map $\Phi_h$. Single shooting chains the map from one initial state; multiple shooting chains shorter integrations and constrains their endpoints to agree. Direct collocation replaces that sequential construction by simultaneous nodal variables and algebraic ODE constraints.

[

Appendix

Example COCPs


](29-appendix-examples.md)[

Appendix

Nonlinear Programming


](31-appendix-nlp.md)


---

# CHAPITRE 31 — Nonlinear Programming

Section du livre : Appendix

Page originale : https://pierrelucbacon.com/rlbook/appendix-nlp

Copie organisée : https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/31-appendix-nlp.md

> **Cours de Pierre-Luc Bacon — 31.** [Page publiée](https://pierrelucbacon.com/rlbook/appendix-nlp) · [Source numérotée](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/31-appendix-nlp.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Nonlinear Programming

<a id="skip-to-article"></a>

Unless specific assumptions are made on the dynamics and cost structure, a DOCP is, in its most general form, a nonlinear mathematical program (commonly referred to as an NLP, not to be confused with Natural Language Processing). An NLP can be formulated as follows:

<a id="yAUEcMdnXD"></a>

$$
\begin{aligned}
\text{minimize } & f(\mathbf{x}) \\
\text{subject to } & \mathbf{g}(\mathbf{x}) \leq \mathbf{0} \\
& \mathbf{h}(\mathbf{x}) = \mathbf{0}
\end{aligned}
$$

[(1)](#yAUEcMdnXD "Link to this Equation")

Here $\mathbf x$ denotes a generic decision vector. When applying this appendix to a trajectory problem, it is the stacked vector $\mathbf z$, not just one physical state. The objective $f$ and constraint maps $\mathbf g,\mathbf h$ then correspond to $F,G,H$ in the control chapters.

Where:

-   $f: \mathbb{R}^n \to \mathbb{R}$ is the objective function
    
-   $\mathbf{g}: \mathbb{R}^n \to \mathbb{R}^m$ represents inequality constraints
    
-   $\mathbf{h}: \mathbb{R}^n \to \mathbb{R}^\ell$ represents equality constraints
    

Unlike unconstrained optimization commonly used in deep learning, the optimality of a solution in constrained optimization must consider both the objective value and constraint feasibility. To illustrate this, consider the following problem, which includes both equality and inequality constraints:

<a id="d2K3KXRQqJ"></a>

$$
\begin{align*}
\text{Minimize} \quad & f(x_1, x_2) = (x_1 - 1)^2 + (x_2 - 2.5)^2 \\
\text{subject to} \quad & g(x_1, x_2) = (x_1 - 1)^2 + (x_2 - 1)^2 - 1.5 \leq 0, \\
& h(x_1, x_2) = x_2 - \left(0.5 \sin(2 \pi x_1) + 1.5\right) = 0.
\end{align*}
$$

[(2)](#d2K3KXRQqJ "Link to this Equation")

In this example, the objective function $f(x_1, x_2)$ is quadratic, the inequality constraint $g(x_1, x_2)$ defines a circular feasible region centered at $(1, 1)$ with a radius of $\sqrt{1.5}$ and the equality constraint $h(x_1, x_2)$ requires $x_2$ to lie on a sine wave function. The following code demonstrates the difference between the unconstrained, and constrained solutions to this problem.

<a id="DKGfAPLOfl"></a>

Source

```python
#  label: appendix_nlp-cell-01
#  caption: Rendered output from the preceding code cell.

%config InlineBackend.figure_format = 'retina'
import numpy as np
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults
from scipy.optimize import minimize

# Define the objective function
def objective(x):
    return (x[0] - 1)**2 + (x[1] - 2.5)**2

# SciPy SLSQP expects a nonnegative inequality function: return -g(x).
def constraint(x):
    return -(x[0] - 1)**2 - (x[1] - 1)**2 + 1.5

# Define the gradient of the objective function
def objective_gradient(x):
    return np.array([2*(x[0] - 1), 2*(x[1] - 2.5)])

# Define the gradient of the inequality constraint function
def constraint_gradient(x):
    return np.array([-2*(x[0] - 1), -2*(x[1] - 1)])

# Define the sine wave equality constraint function
def sine_wave_equality_constraint(x):
    return x[1] - (0.5 * np.sin(2 * np.pi * x[0]) + 1.5)

# Define the gradient of the sine wave equality constraint function
def sine_wave_equality_constraint_gradient(x):
    return np.array([-np.pi * np.cos(2 * np.pi * x[0]), 1])

# Define the constraints including the sine wave equality constraint
sine_wave_constraints = [{'type': 'ineq', 'fun': constraint, 'jac': constraint_gradient},  # Inequality constraint
                         {'type': 'eq', 'fun': sine_wave_equality_constraint, 'jac': sine_wave_equality_constraint_gradient}]  # Sine wave equality constraint

# Define only the inequality constraint
inequality_constraints = [{'type': 'ineq', 'fun': constraint, 'jac': constraint_gradient}]

# Initial guess
x0 = [1.25, 1.5]

# Solve the optimization problem with the sine wave equality constraint
res_sine_wave_constraint = minimize(objective, x0, method='SLSQP', jac=objective_gradient, 
                                    constraints=sine_wave_constraints, options={'disp': False})

x_opt_sine_wave_constraint = res_sine_wave_constraint.x

# Solve the optimization problem with only the inequality constraint
res_inequality_only = minimize(objective, x0, method='SLSQP', jac=objective_gradient, 
                               constraints=inequality_constraints, options={'disp': False})

x_opt_inequality_only = res_inequality_only.x

# Solve the unconstrained optimization problem for reference
res_unconstrained = minimize(objective, x0, method='SLSQP', jac=objective_gradient, options={'disp': False})
x_opt_unconstrained = res_unconstrained.x

# Generate data for visualization
x = np.linspace(-1, 4, 400)
y = np.linspace(-1, 4, 400)
X, Y = np.meshgrid(x, y)
Z = (X - 1)**2 + (Y - 2.5)**2  # Objective function values
constraint_values = (X - 1)**2 + (Y - 1)**2

# Data for sine wave constraint
x_sine = np.linspace(-1, 4, 400)
y_sine = 0.5 * np.sin(2 * np.pi * x_sine) + 1.5

# Visualization with Improved Color Scheme
plt.figure(figsize=(8, 6))
plt.contourf(X, Y, Z, levels=100, cmap='viridis', alpha=0.6)  # Heatmap for the objective function

# Plot all the optimal points
plt.plot(x_opt_inequality_only[0], x_opt_inequality_only[1], 'ro', label='Optimal Solution (Inequality Only)', markersize=8, markeredgecolor='black')
plt.plot(x_opt_sine_wave_constraint[0], x_opt_sine_wave_constraint[1], 'mo', label='Optimal Solution (Sine Wave Equality & Inequality)', markersize=8, markeredgecolor='black')
plt.plot(x_opt_unconstrained[0], x_opt_unconstrained[1], 'co', label='Unconstrained Minimum', markersize=8, markeredgecolor='black')

# Adjust constraint boundary colors
plt.contour(X, Y, constraint_values, levels=[1.5], colors='navy', linewidths=2, linestyles='dashed')
plt.contourf(X, Y, constraint_values, levels=[0, 1.5], colors='skyblue', alpha=0.3)

# Plot the sine wave equality constraint with a high contrast color
plt.plot(x_sine, y_sine, 'lime', linestyle='--', linewidth=2, label='Sine Wave Equality Constraint')

plt.xlim([-1, 4])
plt.ylim([-1, 4])
plt.xlabel('x1')
plt.ylabel('x2')
plt.title('Example NLP')
plt.legend(loc='upper left', fontsize='small', edgecolor='black', fancybox=True)
plt.grid(True)
# Set the aspect ratio to be equal so the circle appears correctly
plt.gca().set_aspect('equal', adjustable='box')
```

![<Figure size 800x600 with 1 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6dc2161c99-5c7c590f19c58f102a9293fc016c10c3.png)

<a id="the-lagrangian-duality-and-optimality-conditions"></a>

## The Lagrangian, Duality, and Optimality Conditions

A constrained optimizer must reduce the objective while respecting the constraints. The Lagrangian combines these two requirements in one function:

<a id="R73SGTMnQ1"></a>

$$
\mathcal L(\mathbf x,\boldsymbol\lambda,\boldsymbol\mu)
=f(\mathbf x)+\sum_{i=1}^m\mu_i g_i(\mathbf x)
+\sum_{j=1}^\ell\lambda_j h_j(\mathbf x),
\qquad \boldsymbol\mu\ge\mathbf0,
\quad \boldsymbol\lambda\in\mathbb R^\ell.
$$

[(3)](#R73SGTMnQ1 "Link to this Equation")

The **Lagrange multipliers** assign weights to the constraint residuals. Inequality multipliers $\mu_i$ are nonnegative because a positive residual $g_i(\mathbf x)>0$ is a violation that should increase the quantity being minimized. Equality multipliers $\lambda_j$ can have either sign because $h_j(\mathbf x)$ can violate its constraint in either direction. These signs follow the convention $\mathbf g(\mathbf x)\le\mathbf0$ used here.

<a id="the-primal-problem-as-a-min-max-problem"></a>

### The primal problem as a min–max problem

Suppose one player chooses $\mathbf x$ to minimize the Lagrangian and a second player chooses the multipliers to maximize it. If the multiplier player can respond after seeing $\mathbf x$, every infeasible choice can be ruled out. For a violated inequality $g_i(\mathbf x)>0$, sending $\mu_i$ to infinity makes the Lagrangian arbitrarily large. For a violated equality, choosing $\lambda_j$ with the same sign as $h_j(\mathbf x)$ and increasing its magnitude has the same effect.

For a feasible $\mathbf x$, all equality terms vanish and every inequality term is nonpositive. The multiplier player can attain $f(\mathbf x)$ by setting $\boldsymbol\mu=\mathbf0$, and cannot obtain a larger value. Thus

<a id="f31vTri9Eb"></a>

$$
\sup_{\boldsymbol\mu\ge\mathbf0,\,\boldsymbol\lambda\in\mathbb R^\ell}
\mathcal L(\mathbf x,\boldsymbol\lambda,\boldsymbol\mu)
=
\begin{cases}
f(\mathbf x),&\mathbf x\text{ is feasible},\\
+\infty,&\mathbf x\text{ is infeasible}.
\end{cases}
$$

[(4)](#f31vTri9Eb "Link to this Equation")

Minimizing this function gives exactly the original constrained problem:

<a id="meZF0sz8vg"></a>

$$
p^\star
:=\inf_{\mathbf x:\,\mathbf g(\mathbf x)\le\mathbf0,\,\mathbf h(\mathbf x)=\mathbf0}
f(\mathbf x)
=\inf_{\mathbf x}\sup_{\boldsymbol\mu\ge\mathbf0,\,\boldsymbol\lambda\in\mathbb R^\ell}
\mathcal L(\mathbf x,\boldsymbol\lambda,\boldsymbol\mu).
$$

[(5)](#meZF0sz8vg "Link to this Equation")

This representation requires no convexity or differentiability. The notation $\inf$ and $\sup$ allows values that are approached without being attained; in particular, no finite multiplier attains $+\infty$ at an infeasible point. The representation also uses unbounded multiplier sets. Capping the multipliers would instead give a finite penalty for constraint violations.

<a id="the-dual-problem-and-lower-bounds"></a>

### The dual problem and lower bounds

Reversing the order changes what the multiplier player can enforce. It must now choose one set of weights before the minimizing player chooses $\mathbf x$. For fixed multipliers, define the **dual function**

<a id="ZMihFQlA2g"></a>

$$
q(\boldsymbol\lambda,\boldsymbol\mu)
=\inf_{\mathbf x}\mathcal L(\mathbf x,\boldsymbol\lambda,\boldsymbol\mu).
$$

[(6)](#ZMihFQlA2g "Link to this Equation")

The inner infimum ranges over all $\mathbf x$, including infeasible choices. For any feasible $\bar{\mathbf x}$ and any $\boldsymbol\mu\ge\mathbf0$,

<a id="gMp2xjMlln"></a>

$$
q(\boldsymbol\lambda,\boldsymbol\mu)
\le\mathcal L(\bar{\mathbf x},\boldsymbol\lambda,\boldsymbol\mu)
\le f(\bar{\mathbf x}).
$$

[(7)](#gMp2xjMlln "Link to this Equation")

Consequently, each multiplier choice supplies a lower bound on the constrained optimal value. The **dual problem** searches for the largest such bound:

<a id="nfVtV9ivRB"></a>

$$
d^\star
:=\sup_{\boldsymbol\mu\ge\mathbf0,\,\boldsymbol\lambda\in\mathbb R^\ell}
q(\boldsymbol\lambda,\boldsymbol\mu)
\le p^\star.
$$

[(8)](#nfVtV9ivRB "Link to this Equation")

This inequality is **weak duality**. It holds for nonconvex problems as well. When $d^\star=p^\star$, **strong duality** holds: choosing the multipliers first yields the same value as letting them respond to $\mathbf x$. Equality of these values does not by itself say that either optimum is attained.

<a id="saddle-points-and-fixed-multipliers"></a>

### Saddle points and fixed multipliers

A **Lagrangian saddle point** is one feasible point $\mathbf x^\star$ and one multiplier pair $(\boldsymbol\mu^\star,\boldsymbol\lambda^\star)$, with $\boldsymbol\mu^\star\ge\mathbf0$, satisfying

<a id="QNm8nGlYie"></a>

$$
\mathcal L(\mathbf x^\star,\boldsymbol\lambda,\boldsymbol\mu)
\le
\mathcal L(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)
\le
\mathcal L(\mathbf x,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)
$$

[(9)](#QNm8nGlYie "Link to this Equation")

for every $\mathbf x$, $\boldsymbol\mu\ge\mathbf0$, and $\boldsymbol\lambda\in\mathbb R^\ell$. The left inequality says that the multiplier player cannot increase the value with $\mathbf x^\star$ held fixed. The right inequality says that the minimizing player cannot decrease it with these multipliers held fixed. This is an equilibrium of the two-player game.

The right inequality is stronger than solving the primal min–max problem. It requires $\mathbf x^\star$ to minimize the Lagrangian over all $\mathbf x$ against one fixed multiplier pair, even when the competing $\mathbf x$ is infeasible. A saddle point therefore certifies global primal and dual optimality with equal values. Conversely, if the primal and dual optima are both attained and their finite values agree, their optimizers form a saddle point. Convexity is one route to these properties, but is not part of the saddle-point definition.

<a id="karush-kuhn-tucker-conditions"></a>

### Karush-Kuhn-Tucker conditions

For a smooth problem, a global minimum of the Lagrangian in $\mathbf x$ must have zero gradient. The multiplier side of the saddle inequalities also requires feasibility and complementary slackness. These requirements give the **Karush-Kuhn-Tucker (KKT) conditions**:

<a id="kkt-conditions"></a>

[Definition 1](#kkt-conditions "Link to this Definition") (KKT conditions)

A point $(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)$ satisfies the KKT conditions when

<a id="uFMQXEffa3"></a>

$$
\begin{aligned}
\nabla_{\mathbf x}\mathcal L(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)
&=\mathbf0 &&\text{(stationarity)},\\
\mathbf g(\mathbf x^\star)\le\mathbf0,\qquad
\mathbf h(\mathbf x^\star)&=\mathbf0 &&\text{(primal feasibility)},\\
\boldsymbol\mu^\star&\ge\mathbf0 &&\text{(dual feasibility)},\\
\mu_i^\star g_i(\mathbf x^\star)&=0\quad\text{for every }i
&&\text{(complementary slackness)}.
\end{aligned}
$$

[(10)](#uFMQXEffa3 "Link to this Equation")

Complementary slackness describes the multiplier player’s response to a feasible point. If $g_i(\mathbf x^\star)<0$, a positive multiplier would reduce the Lagrangian, so maximizing requires $\mu_i^\star=0$. If $g_i(\mathbf x^\star)=0$, any nonnegative multiplier gives the same contribution at that point. A tight constraint can therefore carry a positive weight, although tightness does not require its weight to be positive.

KKT conditions also arise at local constrained minima even when no saddle point exists. If the objective and constraints are continuously differentiable and a **constraint qualification** holds at a local minimizer, then multipliers satisfying KKT exist. One sufficient qualification is **LICQ**, the linear independence of the equality-constraint gradients and the gradients of inequalities active at that point. It ensures that the linearized constraints have enough regularity for the multiplier theorem to apply.

Here, **first-order** means that the conditions use function values and first derivatives at the candidate point. Stationarity requires

<a id="v9jXPXcewW"></a>

$$
\nabla f(\mathbf x^\star)
+\sum_i\mu_i^\star\nabla g_i(\mathbf x^\star)
+\sum_j\lambda_j^\star\nabla h_j(\mathbf x^\star)=\mathbf0.
$$

[(11)](#v9jXPXcewW "Link to this Equation")

This balances the objective gradient against a weighted sum of constraint gradients. It does not compare Lagrangian values at other points or determine its curvature. Thus KKT alone need not imply that $\mathbf x^\star$ minimizes the Lagrangian, even locally. Describing KKT as equations and inequalities at one point should not be confused with the global comparisons in the saddle inequalities.

For example, consider

<a id="Ot6pSVWNgL"></a>

$$
\min_{x\in\mathbb R}-x^2\qquad\text{subject to }x=0,
\qquad \mathcal L(x,\lambda)=-x^2+\lambda x.
$$

[(12)](#Ot6pSVWNgL "Link to this Equation")

The unique feasible point is $x^\star=0$, so $p^\star=0$. The exact primal representation still works: at $x=0$ the inner supremum is zero, and at any $x\ne0$ it is $+\infty$. The equality gradient is 1, so LICQ holds, and stationarity gives $-2x^\star+\lambda^\star=0$. Thus $(0,0)$ satisfies KKT. Yet $\mathcal L(x,0)=-x^2$ has a strict maximum at zero. For every fixed $\lambda$, it is also unbounded below as $|x|$ grows. Hence $q(\lambda)=-\infty$ for every $\lambda$, $d^\star=-\infty$, and no saddle point exists. Even a global constrained optimizer satisfying KKT need not minimize the Lagrangian.

<a id="convexity-and-sufficient-conditions"></a>

### Convexity and sufficient conditions

Suppose $f$ and each $g_i$ are differentiable convex functions on $\mathbb R^n$, and the equality functions $h_j$ are affine. For any $\boldsymbol\mu\ge\mathbf0$, the Lagrangian is then convex in $\mathbf x$. Stationarity becomes sufficient for a global minimum because the convexity inequality gives

<a id="DN89DxxZLj"></a>

$$
\begin{aligned}
\mathcal L(\mathbf x,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)
&\ge \mathcal L(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)\\
&\quad+\nabla_{\mathbf x}\mathcal L(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)^\top
(\mathbf x-\mathbf x^\star)\\
&=\mathcal L(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star).
\end{aligned}
$$

[(13)](#DN89DxxZLj "Link to this Equation")

This supplies the right saddle inequality. Primal feasibility and nonnegative multipliers give $\mathcal L(\mathbf x^\star,\boldsymbol\lambda,\boldsymbol\mu)\le f(\mathbf x^\star)$, while complementary slackness gives $\mathcal L(\mathbf x^\star,\boldsymbol\lambda^\star,\boldsymbol\mu^\star)=f(\mathbf x^\star)$. Together they supply the left saddle inequality. Thus any KKT point of this convex problem is a global saddle point; no additional constraint qualification is needed for this sufficiency direction.

A constraint qualification is needed to guarantee the existence of KKT multipliers at an optimizer. For the convex problem just specified, **Slater’s condition** requires a point satisfying all equalities and every inequality strictly. If Slater’s condition holds and the primal optimal value is finite, strong duality holds and the dual optimum is attained. If the primal optimum is attained as well, an optimizer and suitable multipliers satisfy KKT and form a saddle point. These convex duality results are developed in [Chapter 5 of Boyd and Vandenberghe’s _Convex Optimization_](https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf).

For nonconvex trajectory problems, KKT supplies necessary conditions under regularity, and numerical methods seek points satisfying those conditions. Global saddle inequalities require a separate argument. The exact primal min–max representation remains valid in either case.

<a id="multipliers-in-the-constrained-example"></a>

### Multipliers in the constrained example

Let’s now solve our example problem above, this time using [Ipopt](https://coin-or.github.io/Ipopt/) via the [Pyomo](http://www.pyomo.org/) interface so that we can access the Lagrange multipliers found by the solver.

<a id="ArF3iXqymq"></a>

```python
#  label: appendix_nlp-cell-02
#  caption: Rendered output from the preceding code cell.

from pyomo.environ import *
from pyomo.opt import SolverFactory
import math

# Define the Pyomo model
model = ConcreteModel()

# Define the variables
model.x1 = Var(initialize=1.25)
model.x2 = Var(initialize=1.5)

# Define the objective function
def objective_rule(model):
    return (model.x1 - 1)**2 + (model.x2 - 2.5)**2
model.obj = Objective(rule=objective_rule, sense=minimize)

# Define the inequality constraint (circle)
def inequality_constraint_rule(model):
    return (model.x1 - 1)**2 + (model.x2 - 1)**2 <= 1.5
model.ineq_constraint = Constraint(rule=inequality_constraint_rule)

# Define the equality constraint (sine wave) using Pyomo's math functions
def equality_constraint_rule(model):
    return model.x2 == 0.5 * sin(2 * math.pi * model.x1) + 1.5
model.eq_constraint = Constraint(rule=equality_constraint_rule)

# Create a suffix component to capture dual values
model.dual = Suffix(direction=Suffix.IMPORT)

# Create a solver
solver=SolverFactory('ipopt')

# Solve the problem
results = solver.solve(model, tee=False)

# Check if the solver found an optimal solution
if (results.solver.status == SolverStatus.ok and 
    results.solver.termination_condition == TerminationCondition.optimal):
    
    # Print the results
    print(f"x1: {value(model.x1)}")
    print(f"x2: {value(model.x2)}")
    
    # Print the objective value
    print(f"Objective value: {value(model.obj)}")

    # Print the Lagrange multipliers (dual values)
    print("\nLagrange multipliers:")
    ineq_lambda = None
    eq_lambda = None
    for c in model.component_objects(Constraint, active=True):
        for index in c:
            dual_val = model.dual[c[index]]
            print(f"{c.name}[{index}]: {dual_val}")
            if c.name == "ineq_constraint":
                ineq_lambda = dual_val
            elif c.name == "eq_constraint":
                eq_lambda = dual_val
else:
    print("Solver did not find an optimal solution.")
    print(f"Solver Status: {results.solver.status}")
    print(f"Termination Condition: {results.solver.termination_condition}")
```

```
x1: 1.2271417639244486
x2: 1.994852000302119
Objective value: 0.3067678825174803

Lagrange multipliers:
ineq_constraint[None]: -5.466075458072094e-09
eq_constraint[None]: -1.0102959885190541
```

The computed point lies strictly inside the circle, so complementary slackness requires its inequality multiplier to be zero, up to numerical tolerance. The converse inference would be invalid: a zero multiplier does not by itself show that a constraint is inactive. Every equality must hold at a feasible point regardless of its multiplier’s value. Under suitable sensitivity assumptions, the multipliers also describe how the optimal value changes when the constraint right-hand sides are perturbed; the sign depends on the convention used to write those perturbations.

For a vector constraint map, write $J_h(\mathbf x)$ for its Jacobian, whose $j$th row is $\nabla h_j(\mathbf x)^\top$; define $J_g$ similarly. Gradients of scalar functions are column vectors.

<a id="lagrange-multiplier-theorem"></a>

#### Lagrange Multiplier Theorem

For equality constraints alone, the KKT necessary conditions reduce to the Lagrange multiplier theorem. They identify stationary candidates; further conditions are needed to establish that a candidate is a local minimum.

Theorem 1 (Lagrange Multiplier Theorem)

Consider the constrained optimization problem:

<a id="XUf6fJsrjx"></a>

$$
\begin{aligned}
\min_{\mathbf{x}} \quad & f(\mathbf{x}) \\
\text{subject to} \quad & h_i(\mathbf{x}) = 0, \quad i = 1, \ldots, \ell
\end{aligned}
$$

[(14)](#XUf6fJsrjx "Link to this Equation")

where $\mathbf{x} \in \mathbb{R}^n$, $f: \mathbb{R}^n \to \mathbb{R}$, and $h_i: \mathbb{R}^n \to \mathbb{R}$ for $i = 1, \ldots, \ell$.

Assume that:

1.  $f$ and $h_i$ are continuously differentiable functions.
    
2.  The gradients $\nabla h_i(\mathbf{x}^*)$ are linearly independent at a local minimizer $\mathbf{x}^*$.
    

Then, there exist unique Lagrange multipliers $\lambda_i^* \in \mathbb{R}$, $i = 1, \ldots, \ell$, such that the following first-order optimality conditions hold:

1.  Stationarity: $\nabla f(\mathbf{x}^*) + \sum_{i=1}^\ell \lambda_i^* \nabla h_i(\mathbf{x}^*) = \mathbf{0}$
    
2.  Primal feasibility: $h_i(\mathbf{x}^*) = 0$, for $i = 1, \ldots, \ell$
    

Note that both the stationarity and primal feasibility statements are simply saying that the derivative of the Lagrangian in either the primal or dual variables must be zero at an optimal constrained solution. In other words:

<a id="TXPip9IPz7"></a>

$$
\nabla_{\mathbf{x}, \boldsymbol{\lambda}} \mathcal L(\mathbf{x}^*, \boldsymbol{\lambda}^*) = \mathbf{0}
$$

[(15)](#TXPip9IPz7 "Link to this Equation")

Let $\mathbf F(\mathbf x,\boldsymbol\lambda)$ denote this combined gradient. Under the theorem’s assumptions, a local minimizer and its multipliers give a zero of $\mathbf F$. Newton’s method can seek such zeros, but reaching one alone does not certify a minimum or a Lagrangian saddle point.

<a id="newtons-method"></a>

#### Newton’s Method

For a vector residual $\mathbf F$, write $J_F$ for its Jacobian, with component gradients as rows. This vector residual is distinct from the scalar objective $F$ used in trajectory optimization.

Newton’s method is a numerical procedure for solving root-finding problems. These are nonlinear systems of equations of the form:

Find $\mathbf{z}^* \in \mathbb{R}^n$ such that $\mathbf{F}(\mathbf{z}^*) = \mathbf{0}$

where $\mathbf{F}: \mathbb{R}^n \to \mathbb{R}^n$ is a continuously differentiable function. Newton’s method then consists in applying the following sequence of iterates:

<a id="JFI27kZjAJ"></a>

$$
\mathbf{z}^{k+1} = \mathbf{z}^k - [J_F(\mathbf{z}^k)]^{-1} \mathbf{F}(\mathbf{z}^k)
$$

[(16)](#JFI27kZjAJ "Link to this Equation")

where $\mathbf{z}^k$ is the k-th iterate, and $J_F(\mathbf{z}^k)$ is the Jacobian matrix of $\mathbf{F}$ evaluated at $\mathbf{z}^k$.

Newton’s method exhibits local quadratic convergence: if the initial guess $\mathbf{z}^0$ is sufficiently close to the true solution $\mathbf{z}^*$, and $J_F(\mathbf{z}^*)$ is nonsingular, the method converges quadratically to $\mathbf{z}^*$ Ortega & Rheinboldt (1970). However, the method is sensitive to the initial guess; if it’s too far from the desired solution, Newton’s method might fail to converge or converge to a different root. To mitigate this problem, a set of techniques known as numerical continuation methods Allgower & Georg (1990) have been developed. These methods effectively enlarge the basin of attraction of Newton’s method by solving a sequence of related problems, progressing from an easy one to the target problem. This approach is reminiscent of several concepts in machine learning and statistical inference: curriculum learning in machine learning, where models are trained on increasingly complex data; tempering in Markov Chain Monte Carlo (MCMC) samplers, which gradually adjusts the target distribution to improve mixing; and modern diffusion models, which use a similar concept of gradually transforming noise into structured data.

<a id="efficient-implementation-of-newtons-method"></a>

##### Efficient Implementation of Newton’s Method

Note that each step of Newton’s method involves computing the inverse of a Jacobian matrix. However, a cardinal rule in numerical linear algebra is to avoid computing matrix inverses explicitly: rarely, if ever, should there be a `np.linalg.inv` in your code. Instead, the numerically stable and computationally efficient approach is to solve a linear system of equations at each step. Given the Newton’s method iterate:

<a id="olmn4aN2mo"></a>

$$
\mathbf{z}^{k+1} = \mathbf{z}^k - [J_F(\mathbf{z}^k)]^{-1} \mathbf{F}(\mathbf{z}^k)
$$

[(17)](#olmn4aN2mo "Link to this Equation")

We can reformulate this as a two-step procedure:

1.  Solve the linear system: $\underbrace{[J_F(\mathbf{z}^k)]}_{\mathbf{A}} \Delta \mathbf{z}^k = -\mathbf{F}(\mathbf{z}^k)$
    
2.  Update: $\mathbf{z}^{k+1} = \mathbf{z}^k + \Delta \mathbf{z}^k$
    

The structure of the linear system in step 1 often allows for specialized solution methods. In the context of automatic differentiation, matrix-free linear solvers are particularly useful. These solvers can find a solution without explicitly forming the matrix A, requiring only the ability to evaluate matrix-vector or vector-matrix products. Typical examples of such methods include classical matrix-splitting methods (e.g., Richardson iteration) or conjugate gradient methods through [`sparse.linalg.cg`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.linalg.cg.html) for example. Another useful method is the Generalized Minimal Residual method (GMRES) implemented in SciPy via [`sparse.linalg.gmres`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.linalg.gmres.html), which is useful when facing non-symmetric and indefinite systems.

By inspecting the structure of matrix $\mathbf{A}$ in the specific application where the function $\mathbf{F}$ is the derivative of the Lagrangian, we will also uncover an important structure known as the KKT matrix. This structure will then allow us to derive a Quadratic Programming (QP) sub-problem as part of a larger iterative procedure for solving equality and inequality constrained problems via Sequential Quadratic Programming (SQP).

<a id="solving-equality-constrained-programs-with-newtons-method"></a>

#### Solving Equality Constrained Programs with Newton’s Method

To seek stationary candidates for equality-constrained optimization, Newton’s method searches for a zero of the function $\mathbf{F}(\mathbf{z}) = \nabla_{\mathbf{x}, \boldsymbol{\lambda}} \mathcal L(\mathbf{x}, \boldsymbol{\lambda})$. Here, $\mathbf{F}$ represents the derivative of the Lagrangian function, and $\mathbf{z} = (\mathbf{x}, \boldsymbol{\lambda})$ combines both the primal variables $\mathbf{x}$ and the dual variables (Lagrange multipliers) $\boldsymbol{\lambda}$. Explicitly, we have:

<a id="CVxFLqPfhW"></a>

$$
\mathbf{F}(\mathbf{z}) = \begin{bmatrix} \nabla_{\mathbf{x}} \mathcal L(\mathbf{x}, \boldsymbol{\lambda}) \\ \mathbf{h}(\mathbf{x}) \end{bmatrix} = \begin{bmatrix} \nabla f(\mathbf{x}) + \sum_{i=1}^\ell \lambda_i \nabla h_i(\mathbf{x}) \\ \mathbf{h}(\mathbf{x}) \end{bmatrix}.
$$

[(18)](#CVxFLqPfhW "Link to this Equation")

Newton’s method involves linearizing $\mathbf{F}(\mathbf{z})$ around the current iterate $\mathbf{z}^k = (\mathbf{x}^k, \boldsymbol{\lambda}^k)$ and then solving the resulting linear system. At each iteration $k$, Newton’s method updates the current estimate by solving the linear system:

<a id="LGh0WHanVx"></a>

$$
\mathbf{z}^{k+1} = \mathbf{z}^k - [J_F(\mathbf{z}^k)]^{-1} \mathbf{F}(\mathbf{z}^k).
$$

[(19)](#LGh0WHanVx "Link to this Equation")

However, instead of explicitly inverting the Jacobian matrix $J_F(\mathbf{z}^k)$, we solve the linear system:

<a id="tcNLPWcWNK"></a>

$$
\underbrace{J_F(\mathbf{z}^k)}_{\mathbf{A}} \Delta \mathbf{z}^k = -\mathbf{F}(\mathbf{z}^k),
$$

[(20)](#tcNLPWcWNK "Link to this Equation")

where $\Delta \mathbf{z}^k = (\Delta \mathbf{x}^k, \Delta \boldsymbol{\lambda}^k)$ represents the Newton step for the primal and dual variables. Substituting the expression for $\mathbf{F}(\mathbf{z})$ and its Jacobian, the system becomes:

<a id="Pn84bF7FPZ"></a>

$$
\begin{bmatrix}
\nabla^2_{\mathbf{x}\mathbf{x}} \mathcal L(\mathbf{x}^k, \boldsymbol{\lambda}^k) & J_h(\mathbf{x}^k)^T \\
J_h(\mathbf{x}^k) & \mathbf{0}
\end{bmatrix}
\begin{bmatrix}
\Delta \mathbf{x}^k \\
\Delta \boldsymbol{\lambda}^k
\end{bmatrix}
=
-
\begin{bmatrix}
\nabla f(\mathbf{x}^k) + J_h(\mathbf{x}^k)^T \boldsymbol{\lambda}^k \\
\mathbf{h}(\mathbf{x}^k)
\end{bmatrix}.
$$

[(21)](#Pn84bF7FPZ "Link to this Equation")

The matrix on the left-hand side is known as the KKT matrix, as it stems from the Karush-Kuhn-Tucker conditions for this optimization problem The solution of this system provides the updates $\Delta \mathbf{x}^k$ and $\Delta \boldsymbol{\lambda}^k$, which are then used to update the primal and dual variables:

<a id="HUhOMXDeei"></a>

$$
\mathbf{x}^{k+1} = \mathbf{x}^k + \Delta \mathbf{x}^k, \quad \boldsymbol{\lambda}^{k+1} = \boldsymbol{\lambda}^k + \Delta \boldsymbol{\lambda}^k.
$$

[(22)](#HUhOMXDeei "Link to this Equation")

<a id="demonstration"></a>

##### Demonstration

The following code demonstates how we can implement this idea in Jax. In this demonstration, we are minimizing a quadratic objective function subject to a single equality constraint, a problem formally stated as follows:

<a id="cxXz28WFUY"></a>

$$
\begin{aligned}
\min_{x \in \mathbb{R}^2} \quad & f(x) = (x_1 - 2)^2 + (x_2 - 1)^2 \\
\text{subject to} \quad & h(x) = x_1^2 + x_2^2 - 1 = 0
\end{aligned}
$$

[(23)](#cxXz28WFUY "Link to this Equation")

Geometrically speaking, the constraint $h(x)$ describes a unit circle centered at the origin. To solve this problem using the method of Lagrange multipliers, we form the Lagrangian:

<a id="XjzpMN12Rz"></a>

$$
\mathcal L(x, \lambda) = f(x) + \lambda h(x) = (x_1 - 2)^2 + (x_2 - 1)^2 + \lambda(x_1^2 + x_2^2 - 1)
$$

[(24)](#XjzpMN12Rz "Link to this Equation")

For this particular problem, it happens so that we can also find an analytical without even having to use Newton’s method. From the first-order optimality conditions, we obtain the following linear system of equations:

<a id="XwKKukXjby"></a>

$$
\begin{align*}
   2(x_1 - 2) + 2\lambda x_1 &= 0 \\
   2(x_2 - 1) + 2\lambda x_2 &= 0 \\
   x_1^2 + x_2^2 - 1 &= 0\\
\end{align*}
$$

[(25)](#XwKKukXjby "Link to this Equation")

From the first two equations, we then get:

<a id="mntsSnUSiR"></a>

$$
x_1 = \frac{2}{1 + \lambda}, \quad x_2 = \frac{1}{1 + \lambda}
$$

[(26)](#mntsSnUSiR "Link to this Equation")

which we can substitute these into the 3rd constraint equation to obtain:

<a id="Y9lxaDeF7P"></a>

$$
(\frac{2}{1 + \lambda})^2 + (\frac{1}{1 + \lambda})^2 = 1 \Leftrightarrow \lambda = \sqrt{5} - 1
$$

[(27)](#Y9lxaDeF7P "Link to this Equation")

This value of the Lagrange multiplier can then be backsubstituted into the above equations to obtain $x_1 = \frac{2}{\sqrt{5}}$ and $x_2 =  \frac{1}{\sqrt{5}}$. We can verify numerically (and visually on the following graph) that the point $(2/\sqrt{5}, 1/\sqrt{5})$ is indeed the point on the unit circle closest to $(2, 1)$.

<a id="l9656u0TaG"></a>

Source

```python
#  label: appendix_nlp-cell-03
#  caption: Rendered output from the preceding code cell.

%config InlineBackend.figure_format = 'retina'
import jax
import jax.numpy as jnp
from jax import grad, jit, jacfwd
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

# Define the objective function and constraint
def f(x):
    return (x[0] - 2)**2 + (x[1] - 1)**2

def h(x):
    return x[0]**2 + x[1]**2 - 1

# Lagrangian
def L(x, lambda_):
    return f(x) + lambda_ * h(x)

# Gradient and Hessian of Lagrangian
grad_L_x = jit(grad(L, argnums=0))
grad_L_lambda = jit(grad(L, argnums=1))
hess_L_xx = jit(jacfwd(grad_L_x, argnums=0))
hess_L_xlambda = jit(jacfwd(grad_L_x, argnums=1))

# Newton's method
@jit
def newton_step(x, lambda_):
    grad_x = grad_L_x(x, lambda_)
    grad_lambda = grad_L_lambda(x, lambda_)
    hess_xx = hess_L_xx(x, lambda_)
    hess_xlambda = hess_L_xlambda(x, lambda_).reshape(-1)
    
    # Construct the full KKT matrix
    kkt_matrix = jnp.block([
        [hess_xx, hess_xlambda.reshape(-1, 1)],
        [hess_xlambda, jnp.array([[0.0]])]
    ])
    
    # Construct the right-hand side
    rhs = jnp.concatenate([-grad_x, -jnp.array([grad_lambda])])
    
    # Solve the KKT system
    delta = jnp.linalg.solve(kkt_matrix, rhs)
    
    return x + delta[:2], lambda_ + delta[2]

def solve_constrained_optimization(x0, lambda0, max_iter=100, tol=1e-6):
    x, lambda_ = x0, lambda0
    
    for i in range(max_iter):
        x_new, lambda_new = newton_step(x, lambda_)
        if jnp.linalg.norm(jnp.concatenate([x_new - x, jnp.array([lambda_new - lambda_])])) < tol:
            break
        x, lambda_ = x_new, lambda_new
    
    return x, lambda_, i+1

# Analytical solution
def analytical_solution():
    x1 = 2 / jnp.sqrt(5)
    x2 = 1 / jnp.sqrt(5)
    lambda_opt = jnp.sqrt(5) - 1
    return jnp.array([x1, x2]), lambda_opt

# Solve the problem numerically
x0 = jnp.array([0.5, 0.5])
lambda0 = 0.0
x_opt_num, lambda_opt_num, iterations = solve_constrained_optimization(x0, lambda0)

# Compute analytical solution
x_opt_ana, lambda_opt_ana = analytical_solution()

# Verify the result
print("\nNumerical Solution:")
print(f"Constraint violation: {h(x_opt_num):.6f}")
print(f"Objective function value: {f(x_opt_num):.6f}")

print("\nAnalytical Solution:")
print(f"Constraint violation: {h(x_opt_ana):.6f}")
print(f"Objective function value: {f(x_opt_ana):.6f}")

print("\nComparison:")
x_diff = jnp.linalg.norm(x_opt_num - x_opt_ana)
lambda_diff = jnp.abs(lambda_opt_num - lambda_opt_ana)
print(f"Difference in x: {x_diff}")
print(f"Difference in lambda: {lambda_diff}")

# Precision test
rtol = 1e-5  # relative tolerance
atol = 1e-8  # absolute tolerance

x_close = jnp.allclose(x_opt_num, x_opt_ana, rtol=rtol, atol=atol)
lambda_close = jnp.isclose(lambda_opt_num, lambda_opt_ana, rtol=rtol, atol=atol)

print("\nPrecision Test:")
print(f"x values are close: {x_close}")
print(f"lambda values are close: {lambda_close}")

if x_close and lambda_close:
    print("The numerical solution matches the analytical solution within the specified tolerance.")
else:
    print("The numerical solution differs from the analytical solution more than the specified tolerance.")

# Visualize the result
plt.figure(figsize=(12, 10))

# Create a mesh for the contour plot
x1_range = jnp.linspace(-1.5, 2.5, 100)
x2_range = jnp.linspace(-1.5, 2.5, 100)
X1, X2 = jnp.meshgrid(x1_range, x2_range)
Z = jnp.array([[f(jnp.array([x1, x2])) for x1 in x1_range] for x2 in x2_range])

# Plot filled contours
contour = plt.contourf(X1, X2, Z, levels=50, cmap='viridis', alpha=0.7, extent=[-1.5, 2.5, -1.5, 2.5])
plt.colorbar(contour, label='Objective Function Value')

# Plot the constraint
theta = jnp.linspace(0, 2*jnp.pi, 100)
x1 = jnp.cos(theta)
x2 = jnp.sin(theta)
plt.plot(x1, x2, color='red', linewidth=2, label='Constraint')

# Plot the optimal points (numerical and analytical) and initial point
plt.scatter(x_opt_num[0], x_opt_num[1], color='red', s=100, edgecolor='white', linewidth=2, label='Numerical Optimal Point')
plt.scatter(x_opt_ana[0], x_opt_ana[1], color='blue', s=100, edgecolor='white', linewidth=2, label='Analytical Optimal Point')
plt.scatter(x0[0], x0[1], color='green', s=100, edgecolor='white', linewidth=2, label='Initial Point')

# Add labels and title
plt.xlabel('x1', fontsize=12)
plt.ylabel('x2', fontsize=12)
plt.title('Constrained Optimization: Numerical vs Analytical Solution', fontsize=14)
plt.legend(fontsize=10)
plt.grid(True, linestyle='--', alpha=0.7)

# Set the axis limits explicitly
plt.xlim(-1.5, 2.5)
plt.ylim(-1.5, 2.5)

plt.tight_layout()
```

```

Numerical Solution:
Constraint violation: 0.000000
Objective function value: 1.527864

Analytical Solution:
Constraint violation: -0.000000
Objective function value: 1.527864

Comparison:
Difference in x: 5.960464477539063e-08
Difference in lambda: 0.0
```

```

Precision Test:
x values are close: True
lambda values are close: True
The numerical solution matches the analytical solution within the specified tolerance.
```

![<Figure size 1200x1000 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/14d6dbb7b6-66daaa35e85c437a729d68d79ef70225.png)

<a id="the-sqp-approach-taylor-expansion-and-quadratic-approximation"></a>

### The SQP Approach: Taylor Expansion and Quadratic Approximation

Sequential Quadratic Programming (SQP) tackles the problem of solving constrained programs by iteratively solving a sequence of simpler subproblems. Specifically, these subproblems are quadratic programs (QPs) that approximate the original problem around the current iterate by using a quadratic model of the objective function and a linear model of the constraints. Suppose we have the following optimization problem with equality constraints:

<a id="gQNhZHQ35R"></a>

$$
\begin{aligned}
\min_{\mathbf{x}} \quad & f(\mathbf{x}) \\
\text{subject to} \quad & \mathbf{h}(\mathbf{x}) = \mathbf{0}.
\end{aligned}
$$

[(28)](#gQNhZHQ35R "Link to this Equation")

At iteration $k$, we seek a displacement $\Delta\mathbf x=\mathbf x-\mathbf x^k$. A second-order Taylor expansion of the objective gives

<a id="hqgGk4gsPV"></a>

$$
\begin{align*}
f(\mathbf{x}) \approx f(\mathbf{x}^k) + \nabla f(\mathbf{x}^k)^T (\mathbf{x} - \mathbf{x}^k) + \frac{1}{2} (\mathbf{x} - \mathbf{x}^k)^T \nabla^2 f(\mathbf{x}^k) (\mathbf{x} - \mathbf{x}^k).
\end{align*}
$$

[(29)](#hqgGk4gsPV "Link to this Equation")

The Hessian determines how the model’s gradient changes as the displacement grows. For a constrained problem, the Newton equations also involve curvature from the constraints. SQP incorporates that curvature through the Hessian of the Lagrangian,

<a id="KHWOU2DSvA"></a>

$$
B_k=\nabla^2_{\mathbf x\mathbf x}
\mathcal L(\mathbf x^k,\boldsymbol\lambda^k)
=\nabla^2 f(\mathbf x^k)+
\sum_i\lambda_i^k\nabla^2 h_i(\mathbf x^k),
$$

[(30)](#KHWOU2DSvA "Link to this Equation")

and defines the step objective

<a id="dM7fJ35M1w"></a>

$$
m_k(\Delta\mathbf x)=
\nabla f(\mathbf x^k)^\top\Delta\mathbf x
+\frac12\Delta\mathbf x^\top B_k\Delta\mathbf x.
$$

[(31)](#dM7fJ35M1w "Link to this Equation")

This is a model for choosing a constrained step, rather than the Taylor expansion of $f$ alone. We omit the constant $f(\mathbf x^k)$ because it does not affect the minimizing displacement.

Each equality is replaced by its current residual plus its predicted first-order change:

<a id="NmJAss67dB"></a>

$$
\mathbf{h}(\mathbf{x}) \approx \mathbf{h}(\mathbf{x}^k) + J_h(\mathbf{x}^k) (\mathbf{x} - \mathbf{x}^k).
$$

[(32)](#NmJAss67dB "Link to this Equation")

Setting this affine expression to zero asks the step to cancel the current constraint residual. At a feasible point, the condition becomes $J_h(\mathbf x^k)\Delta\mathbf x=\mathbf0$, so the step lies in the tangent space. The resulting QP is

<a id="BH2OjFXyLQ"></a>

$$
\begin{aligned}
\underset{\Delta\mathbf x}{\operatorname{minimize}}\quad&
\nabla f(\mathbf{x}^k)^T \Delta \mathbf{x} + \frac{1}{2} \Delta \mathbf{x}^T B_k \Delta \mathbf{x} \\
\text{subject to} \quad & J_h(\mathbf{x}^k) \Delta \mathbf{x} + \mathbf{h}(\mathbf{x}^k) = \mathbf{0},
\end{aligned}
$$

[(33)](#BH2OjFXyLQ "Link to this Equation")

Solving the QP gives both a displacement $\Delta\mathbf x^k$ and a multiplier vector $\boldsymbol\lambda_{\mathrm{QP}}$. A full SQP step updates the primal and dual estimates by

<a id="NyoxOXQJ46"></a>

$$
\begin{align*}
\mathbf{x}^{k+1} = \mathbf{x}^k + \Delta \mathbf{x}^k,
\qquad
\boldsymbol\lambda^{k+1}=\boldsymbol\lambda_{\mathrm{QP}}.
\end{align*}
$$

[(34)](#NyoxOXQJ46 "Link to this Equation")

The linearized equalities can hold even when $\mathbf h(\mathbf x^k+\Delta\mathbf x^k)\ne\mathbf0$. For example, a nonzero tangent step from a point on a circle leaves the circle. Practical algorithms therefore use a line search or trust region to assess progress on the original problem, and may modify the Hessian or relax inconsistent linearized constraints. The following pseudocode describes the local full-step iteration, assuming its QPs have solutions.

<a id="alg-sqp"></a>

[Algorithm 1](#alg-sqp "Link to this Algorithm") (Sequential Quadratic Programming (SQP))

**Input:** Initial estimate $\mathbf{x}^0$, initial Lagrange multipliers $\boldsymbol{\lambda}^0$, tolerance $\epsilon > 0$.

**Output:** Solution $\mathbf{x}^*$, Lagrange multipliers $\boldsymbol{\lambda}^*$.

**Procedure:**

1.  **Compute the QP Solution:** Solve the QP subproblem to obtain $\Delta \mathbf{x}^k$. The QP solver also provides the updated Lagrange multipliers $\boldsymbol{\lambda}^{k+1}$ associated with the constraints.
    
2.  **Update the Estimates:** Update the primal variables:
    
    <a id="pfFA6bUPSH"></a>
    
    $$
    \mathbf{x}^{k+1} = \mathbf{x}^k + \Delta \mathbf{x}^k.
    $$
    
    [(35)](#pfFA6bUPSH "Link to this Equation")
    
    Set the dual variables to the updated values $\boldsymbol{\lambda}^{k+1}$ from the QP solution.
    
3.  **Repeat Until Convergence:** Continue iterating until $\|\Delta \mathbf{x}^k\| < \epsilon$ and the KKT conditions are satisfied.
    

<a id="connection-to-newtons-method-in-the-equality-constrained-case"></a>

#### Connection to Newton’s Method in the Equality-Constrained Case

Because the QP objective is quadratic and its constraints are affine, its stationarity and feasibility conditions form a linear system:

<a id="O3mhShQg9f"></a>

$$
\begin{bmatrix}
B_k & J_h(\mathbf x^k)^\top\\
J_h(\mathbf x^k) & \mathbf0
\end{bmatrix}
\begin{bmatrix}
\Delta\mathbf x^k\\
\boldsymbol\lambda_{\mathrm{QP}}
\end{bmatrix}
=-
\begin{bmatrix}
\nabla f(\mathbf x^k)\\
\mathbf h(\mathbf x^k)
\end{bmatrix}.
$$

[(36)](#O3mhShQg9f "Link to this Equation")

The QP multiplier is a new estimate, while Newton’s method solves for a change in that estimate. Set $\Delta\boldsymbol\lambda^k=
\boldsymbol\lambda_{\mathrm{QP}}-\boldsymbol\lambda^k$. Substitution gives

<a id="ArrkKA7Jb2"></a>

$$
\begin{align*}
\begin{bmatrix}
B_k & J_h(\mathbf{x}^k)^T \\
J_h(\mathbf{x}^k) & \mathbf{0}
\end{bmatrix}
\begin{bmatrix}
\Delta \mathbf{x}^k \\
\Delta \boldsymbol{\lambda}^k
\end{bmatrix}
=
-
\begin{bmatrix}
\nabla f(\mathbf{x}^k) + J_h(\mathbf{x}^k)^T \boldsymbol{\lambda}^k \\
\mathbf{h}(\mathbf{x}^k)
\end{bmatrix}
\end{align*}
$$

[(37)](#ArrkKA7Jb2 "Link to this Equation")

With the exact Lagrangian Hessian $B_k$, this is Newton’s method applied to the original KKT equations. When $J_h$ has full row rank and $B_k$ is positive definite on nonzero directions in the null space of $J_h$, the linear system determines the unique QP minimizer and its multiplier. Without suitable curvature, a solution of the stationarity equations need not minimize the QP. Replacing $B_k$ by a positive-definite approximation gives a modified Newton method with convex QP subproblems.

The quadratic and affine structure means that all derivative matrices stay fixed within a QP solve. Equality-constrained QPs under the conditions above require only a linear solve; QPs with inequalities require additional work to enforce feasibility and complementarity. Sparse factorizations and reuse across related systems make that work efficient, as discussed in the [SQP section of the optimal-control chapter](https://github.com/Mbaka11/IFT6162-Reinforcement-Learning/blob/main/Content/Website/06-discrete-time-optimal-control.md#sec-sqp-newton).

<a id="sqp-for-inequality-constrained-optimization"></a>

### SQP for Inequality-Constrained Optimization

So far, we’ve applied the ideas behind Sequential Quadratic Programming (SQP) to problems with only equality constraints. Now, let’s extend this framework to handle optimization problems that also include inequality constraints. Consider a general nonlinear optimization problem that includes both equality and inequality constraints:

<a id="vJvndOhEcw"></a>

$$
\begin{align*}
\min_{\mathbf{x}} \quad & f(\mathbf{x}) \\
\text{subject to} \quad & \mathbf{g}(\mathbf{x}) \leq \mathbf{0}, \\
& \mathbf{h}(\mathbf{x}) = \mathbf{0}.
\end{align*}
$$

[(38)](#vJvndOhEcw "Link to this Equation")

As we did earlier, we approximate this problem by constructing a quadratic approximation to the objective and a linearization of the constraints. QP subproblem at each iteration is then formulated as:

<a id="GIQM6Qb5H0"></a>

$$
\begin{align*}
\text{Minimize} \quad & \nabla f(\mathbf{x}^k)^T \Delta \mathbf{x} + \frac{1}{2} \Delta \mathbf{x}^T \nabla^2_{\mathbf{x}\mathbf{x}} \mathcal L(\mathbf{x}^k, \boldsymbol{\lambda}^k, \boldsymbol{\mu}^k) \Delta \mathbf{x} \\
\text{subject to} \quad & J_g(\mathbf{x}^k) \Delta \mathbf{x} + \mathbf{g}(\mathbf{x}^k) \leq \mathbf{0}, \\
& J_h(\mathbf{x}^k) \Delta \mathbf{x} + \mathbf{h}(\mathbf{x}^k) = \mathbf{0},
\end{align*}
$$

[(39)](#GIQM6Qb5H0 "Link to this Equation")

where $\Delta \mathbf{x} = \mathbf{x} - \mathbf{x}^k$ represents the step direction for the primal variables. As in the equality case, the following pseudocode describes the local full-step iteration and assumes solvable QP subproblems; step selection and subproblem modifications are needed in a general implementation.

<a id="alg-sqp-ineq"></a>

[Algorithm 2](#alg-sqp-ineq "Link to this Algorithm") (Sequential Quadratic Programming (SQP) with Inequality Constraints)

**Input:** Initial estimate $\mathbf{x}^0$, initial multipliers $\boldsymbol{\lambda}^0, \boldsymbol{\mu}^0$, tolerance $\epsilon > 0$.

**Output:** Solution $\mathbf{x}^*$, Lagrange multipliers $\boldsymbol{\lambda}^*, \boldsymbol{\mu}^*$.

**Procedure:**

1.  **Initialization:** Set $k = 0$.
    
2.  **Repeat:**
    
    a. **Construct the QP Subproblem:** Formulate the QP subproblem using the current iterate $\mathbf{x}^k$, $\boldsymbol{\lambda}^k$, and $\boldsymbol{\mu}^k$:
    
    <a id="rW48egOnnl"></a>
    
    $$
    \begin{aligned}
       \text{Minimize} \quad & \nabla f(\mathbf{x}^k)^T \Delta \mathbf{x} + \frac{1}{2} \Delta \mathbf{x}^T \nabla^2_{\mathbf{x}\mathbf{x}} \mathcal L(\mathbf{x}^k, \boldsymbol{\lambda}^k, \boldsymbol{\mu}^k) \Delta \mathbf{x} \\
       \text{subject to} \quad & J_g(\mathbf{x}^k) \Delta \mathbf{x} + \mathbf{g}(\mathbf{x}^k) \leq \mathbf{0}, \\
       & J_h(\mathbf{x}^k) \Delta \mathbf{x} + \mathbf{h}(\mathbf{x}^k) = \mathbf{0}.
       \end{aligned}
    $$
    
    [(40)](#rW48egOnnl "Link to this Equation")
    
    b. **Solve the QP Subproblem:** Solve for $\Delta \mathbf{x}^k$ and obtain the updated Lagrange multipliers $\boldsymbol{\lambda}^{k+1}$ and $\boldsymbol{\mu}^{k+1}$.
    
    c. **Update the Estimates:** Update the primal variables and multipliers:
    
    <a id="JM4Dh9JQwL"></a>
    
    $$
    \mathbf{x}^{k+1} = \mathbf{x}^k + \Delta \mathbf{x}^k.
    $$
    
    [(41)](#JM4Dh9JQwL "Link to this Equation")
    
    d. **Check for Convergence:** If $\|\Delta \mathbf{x}^k\| < \epsilon$ and the KKT conditions are satisfied, stop. Otherwise, set $k = k + 1$ and repeat.
    
3.  **Return:** $\mathbf{x}^* = \mathbf{x}^{k+1}, \boldsymbol{\lambda}^* = \boldsymbol{\lambda}^{k+1}, \boldsymbol{\mu}^* = \boldsymbol{\mu}^{k+1}$.
    

<a id="demonstration-with-jax-and-cvxpy"></a>

#### Demonstration with JAX and CVXPy

Consider the following equality and inequality-constrained problem:

<a id="u9GSlFfB5X"></a>

$$
\begin{align*}
\min_{x \in \mathbb{R}^2} \quad & f(x) = (x_1 - 2)^2 + (x_2 - 1)^2 \\
\text{subject to} \quad & g(x) = x_1^2 - x_2 \leq 0  \\
& h(x) = x_1^2 + x_2^2 - 1 = 0
\end{align*}
$$

[(42)](#u9GSlFfB5X "Link to this Equation")

This example builds on our previous one but adds a parabola-shaped inequality constraint. We require our solution to lie not only on the circle defining our equality constraint but also on or above the parabola. To solve the QP subproblem, we will be using the [CVXPY](https://www.cvxpy.org/) package. While the Lagrangian and derivatives could be computed easily by hand, we use [JAX](https://jax.readthedocs.io/) for generality:

<a id="BA9xrLDmbG"></a>

Source

```python
#  label: appendix_nlp-cell-04
#  caption: Rendered output from the preceding code cell.

%config InlineBackend.figure_format = 'retina'
import jax
import jax.numpy as jnp
from jax import grad, jit, jacfwd, hessian
import numpy as np
import cvxpy as cp
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

# Define the objective function and constraints
@jit
def f(x):
    return (x[0] - 2)**2 + (x[1] - 1)**2

@jit
def h(x):
    return jnp.array([x[0]**2 + x[1]**2 - 1])

@jit
def g(x):
    return jnp.array([x[0]**2 - x[1]])  # Corrected inequality constraint: x[1] >= x[0]^2

# Compute gradients and Jacobians using JAX
grad_f = jit(grad(f))
hess_f = jit(hessian(f))
jac_h = jit(jacfwd(h))
jac_g = jit(jacfwd(g))

@jit
def lagrangian(x, lambda_, mu):
    return f(x) + jnp.dot(lambda_, h(x)) + jnp.dot(mu, g(x))

hess_L = jit(hessian(lagrangian, argnums=0))

def solve_qp_subproblem(x, lambda_, mu):
    n = len(x)
    delta_x = cp.Variable(n)
    
    # Convert JAX arrays to numpy for cvxpy
    grad_f_np = np.array(grad_f(x))
    hess_L_np = np.array(hess_L(x, lambda_, mu))
    jac_h_np = np.array(jac_h(x))
    jac_g_np = np.array(jac_g(x))
    h_np = np.array(h(x))
    g_np = np.array(g(x))
    
    obj = cp.Minimize(grad_f_np.T @ delta_x + 0.5 * cp.quad_form(delta_x, hess_L_np))
    
    constraints = [
        jac_h_np @ delta_x + h_np == 0,
        jac_g_np @ delta_x + g_np <= 0
    ]
    
    prob = cp.Problem(obj, constraints)
    prob.solve()
    
    return delta_x.value, prob.constraints[0].dual_value, prob.constraints[1].dual_value

def sqp(x0, max_iter=100, tol=1e-6):
    x = x0
    lambda_ = jnp.zeros(1)
    mu = jnp.zeros(1)
    
    for i in range(max_iter):
        delta_x, new_lambda, new_mu = solve_qp_subproblem(x, lambda_, mu)
        
        if jnp.linalg.norm(delta_x) < tol:
            break
        
        x = x + delta_x
        lambda_ = new_lambda
        mu = new_mu
        
    return x, lambda_, mu, i+1

# Initial point
x0 = jnp.array([0.5, 0.5])

# Solve using SQP
x_opt, lambda_opt, mu_opt, iterations = sqp(x0)

print(f"Optimal x: {x_opt}")
print(f"Optimal lambda: {lambda_opt}")
print(f"Optimal mu: {mu_opt}")
print(f"Iterations: {iterations}")

# Visualize the result
plt.figure(figsize=(12, 10))

# Create a mesh for the contour plot
x1_range = jnp.linspace(-1.5, 2.5, 100)
x2_range = jnp.linspace(-1.5, 2.5, 100)
X1, X2 = jnp.meshgrid(x1_range, x2_range)
Z = jnp.array([[f(jnp.array([x1, x2])) for x1 in x1_range] for x2 in x2_range])

# Plot filled contours
contour = plt.contourf(X1, X2, Z, levels=50, cmap='viridis', alpha=0.7)
plt.colorbar(contour, label='Objective Function Value')

# Plot the equality constraint
theta = jnp.linspace(0, 2*jnp.pi, 100)
x1_eq = jnp.cos(theta)
x2_eq = jnp.sin(theta)
plt.plot(x1_eq, x2_eq, color='red', linewidth=2, label='Equality Constraint')

# Plot the inequality constraint and shade the feasible region
x1_ineq = jnp.linspace(-1.5, 2.5, 100)
x2_ineq = x1_ineq**2
plt.plot(x1_ineq, x2_ineq, color='orange', linewidth=2, label='Inequality Constraint')

# Shade the feasible region for the inequality constraint
x2_lower = jnp.minimum(x2_ineq, 2.5)
plt.fill_between(x1_ineq, x2_lower, 2.5, color='gray', alpha=0.2, hatch='\\/...', label='Inequality-feasible region')

# Plot the optimal and initial points
plt.scatter(x_opt[0], x_opt[1], color='red', s=100, edgecolor='white', linewidth=2, label='Optimal Point')
plt.scatter(x0[0], x0[1], color='green', s=100, edgecolor='white', linewidth=2, label='Initial Point')

# Add labels and title
plt.xlabel('x1', fontsize=12)
plt.ylabel('x2', fontsize=12)
plt.title('SQP for Inequality Constraints with CVXPY and JAX', fontsize=14)
plt.legend(fontsize=10, loc='upper center')
plt.grid(True, linestyle='--', alpha=0.7)

# Set the axis limits explicitly
plt.xlim(-1.5, 2.5)
plt.ylim(-1.5, 2.5)

plt.tight_layout()

# Verify the result
print(f"\nEquality constraint violation: {h(x_opt)[0]:.6f}")
print(f"Inequality constraint violation: {g(x_opt)[0]:.6f}")
print(f"Objective function value: {f(x_opt):.6f}")
```

```
Optimal x: [0.78615135 0.618034  ]
Optimal lambda: [1.03215619]
Optimal mu: [0.51188314]
Iterations: 5
```

```

Equality constraint violation: -0.000000
Inequality constraint violation: -0.000000
Objective function value: 1.619326
```

![<Figure size 1200x1000 with 2 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/d7be79cc49-c4d898fce3db0caa989257f74a89ab46.png)

<a id="the-arrow-hurwicz-uzawa-algorithm"></a>

### The Arrow-Hurwicz-Uzawa algorithm

The primal min–max representation motivates updates that descend in the primal variables and ascend in the multipliers. The Arrow-Hurwicz-Uzawa method Arrow _et al._ (1958) uses these first derivatives instead of the quadratic subproblems used by SQP. With the notation of the preceding duality discussion, $\mathcal L(\mathbf x,\boldsymbol\lambda,\boldsymbol\mu)
=f(\mathbf x)+\boldsymbol\mu^\top\mathbf g(\mathbf x)
+\boldsymbol\lambda^\top\mathbf h(\mathbf x)$, where equality multipliers are unrestricted and inequality multipliers are nonnegative.

These updates do not compute the inner supremum of the primal formulation. Each iteration takes a finite step in both players’ variables. The resulting method is called gradient descent-ascent. Its convergence requires a separate analysis, even when the problem has a saddle point. For equality constraints, the alternating updates take the following form:

<a id="ahuz-eq"></a>

[Algorithm 3](#ahuz-eq "Link to this Algorithm") (Arrow-Hurwicz-Uzawa for equality constraints only)

**Input:** Initial guess $\mathbf{x}^0$, $\boldsymbol{\lambda}^0$, step sizes $\alpha$, $\beta$ **Output:** Final primal and multiplier iterates $\mathbf{x}^k$, $\boldsymbol{\lambda}^k$

1: **for** $k = 0, 1, 2, \ldots$ until convergence **do**

2: $\mathbf{x}^{k+1} = \mathbf{x}^k - \alpha \nabla_{\mathbf{x}} \mathcal L(\mathbf{x}^k, \boldsymbol{\lambda}^k)$ **(Primal update)**

3: $\boldsymbol{\lambda}^{k+1} = \boldsymbol{\lambda}^k + \beta \nabla_{\boldsymbol{\lambda}} \mathcal L(\mathbf{x}^{k+1}, \boldsymbol{\lambda}^k)$ **(Dual update)**

4: **end for**

5: **return** $\mathbf{x}^k$, $\boldsymbol{\lambda}^k$

Now to account for the fact that the Lagrange multiplier needs to be non-negative for inequality constraints, we can use our previous idea from projected gradient descent for bound constraints and consider a projection, or clipping step to ensure that this condition is satisfied throughout. In this case, the algorithm looks like the following:

<a id="ahuz-full"></a>

[Algorithm 4](#ahuz-full "Link to this Algorithm") (Arrow-Hurwicz-Uzawa for equality and inequality constraints)

**Input:** Initial guess $\mathbf{x}^0$, $\boldsymbol{\lambda}^0$, $\boldsymbol{\mu}^0 \geq 0$, step sizes $\alpha$, $\beta$, $\gamma$ **Output:** Final iterates $\mathbf{x}^k$, $\boldsymbol{\lambda}^k$, $\boldsymbol{\mu}^k$

1: **for** $k = 0, 1, 2, \ldots$ until convergence **do**

2: $\mathbf{x}^{k+1} = \mathbf{x}^k - \alpha \nabla_{\mathbf{x}} \mathcal L(\mathbf{x}^k, \boldsymbol{\lambda}^k, \boldsymbol{\mu}^k)$ **(Primal update)**

3: $\boldsymbol{\lambda}^{k+1} = \boldsymbol{\lambda}^k + \beta \, \nabla_{\boldsymbol{\lambda}} \mathcal L(\mathbf{x}^{k+1}, \boldsymbol{\lambda}^k, \boldsymbol{\mu}^k)$ **(Dual update for equality constraints)**

4: $\boldsymbol{\mu}^{k+1} = [\boldsymbol{\mu}^k + \gamma \nabla_{\boldsymbol{\mu}} \mathcal L(\mathbf{x}^{k+1}, \boldsymbol{\lambda}^k, \boldsymbol{\mu}^k)]_+$ **(Dual update with clipping for inequality constraints)**

5: **end for**

6: **return** $\mathbf{x}^k$, $\boldsymbol{\lambda}^k$, $\boldsymbol{\mu}^k$

Here, $[\cdot]_+$ denotes the projection onto the non-negative orthant, ensuring that $\boldsymbol{\mu}$ remains non-negative.

A saddle point need not attract these iterates. For the bilinear Lagrangian $\mathcal L(x,\lambda)=\lambda x$, the equality-only updates give $x^{k+1}=x^k-\alpha\lambda^k$ and $\lambda^{k+1}=\lambda^k+\beta x^{k+1}$. Their update matrix has determinant one, so it cannot contract in all directions. Convexity and saddle-point existence alone therefore do not guarantee convergence of this iteration. Additional assumptions or modifications, such as augmented terms or extragradient steps, are needed for an applicable convergence guarantee.

<a id="D5oy90Fhx9"></a>

Source

```python
#  label: appendix_nlp-cell-05
#  caption: Rendered output from the preceding code cell.

%config InlineBackend.figure_format = 'retina'
import jax
import jax.numpy as jnp
from jax import grad, jit, value_and_grad
import optax
import matplotlib.pyplot as plt

# Apply book style
try:
    import scienceplots
    plt.style.use(['science', 'notebook'])
except (ImportError, OSError):
    pass  # Use matplotlib defaults

# Define the objective function and constraints
@jit
def f(x):
    return (x[0] - 2)**2 + (x[1] - 1)**2

@jit
def h(x):
    return jnp.array([x[0]**2 + x[1]**2 - 1])

@jit
def g(x):
    return jnp.array([x[0]**2 - x[1]])  # Inequality constraint: x[1] >= x[0]^2

# Define the Lagrangian
@jit
def lagrangian(x, lambda_, mu):
    return f(x) + jnp.dot(lambda_, h(x)) + jnp.dot(mu, g(x))

# Compute gradients of the Lagrangian
grad_L_x = jit(grad(lagrangian, argnums=0))
grad_L_lambda = jit(grad(lagrangian, argnums=1))
grad_L_mu = jit(grad(lagrangian, argnums=2))

# Define the Arrow-Hurwicz-Uzawa update step
@jit
def update(carry, t):
    x, lambda_, mu, opt_state_x, opt_state_lambda, opt_state_mu = carry
    
    # Compute gradients
    grad_x = grad_L_x(x, lambda_, mu)
    grad_lambda = grad_L_lambda(x, lambda_, mu)
    grad_mu = grad_L_mu(x, lambda_, mu)
    
    # Update primal variables (minimization)
    updates_x, opt_state_x = optimizer_x.update(grad_x, opt_state_x)
    x = optax.apply_updates(x, updates_x)
    
    # Update dual variables (maximization)
    updates_lambda, opt_state_lambda = optimizer_lambda.update(grad_lambda, opt_state_lambda)
    lambda_ = optax.apply_updates(lambda_, -updates_lambda)  # Positive update for maximization
    
    updates_mu, opt_state_mu = optimizer_mu.update(grad_mu, opt_state_mu)
    mu = optax.apply_updates(mu, -updates_mu)  # Positive update for maximization
    
    # Project mu onto the non-negative orthant
    mu = jnp.maximum(mu, 0)
    
    return (x, lambda_, mu, opt_state_x, opt_state_lambda, opt_state_mu), x

def arrow_hurwicz_uzawa(x0, lambda0, mu0, max_iter=1000):
    # Initialize optimizers
    global optimizer_x, optimizer_lambda, optimizer_mu
    optimizer_x = optax.adam(learning_rate=0.01)
    optimizer_lambda = optax.adam(learning_rate=0.01)
    optimizer_mu = optax.adam(learning_rate=0.01)
    
    opt_state_x = optimizer_x.init(x0)
    opt_state_lambda = optimizer_lambda.init(lambda0)
    opt_state_mu = optimizer_mu.init(mu0)
    
    init_carry = (x0, lambda0, mu0, opt_state_x, opt_state_lambda, opt_state_mu)
    
    # Use jax.lax.scan for the optimization loop
    (x, lambda_, mu, _, _, _), trajectory = jax.lax.scan(update, init_carry, jnp.arange(max_iter))
    
    return x, lambda_, mu, trajectory

# Initial point
x0 = jnp.array([0.5, 0.5])
lambda0 = jnp.zeros(1)
mu0 = jnp.zeros(1)

# Solve using Arrow-Hurwicz-Uzawa
x_opt, lambda_opt, mu_opt, trajectory = arrow_hurwicz_uzawa(x0, lambda0, mu0, max_iter=1000)

print(f"Final x: {x_opt}")
print(f"Final lambda: {lambda_opt}")
print(f"Final mu: {mu_opt}")

# Visualize the result
plt.figure(figsize=(12, 10))

# Create a mesh for the contour plot
x1_range = jnp.linspace(-1.5, 2.5, 100)
x2_range = jnp.linspace(-1.5, 2.5, 100)
X1, X2 = jnp.meshgrid(x1_range, x2_range)
Z = jnp.array([[f(jnp.array([x1, x2])) for x1 in x1_range] for x2 in x2_range])

# Plot filled contours
contour = plt.contourf(X1, X2, Z, levels=50, cmap='viridis', alpha=0.7)
plt.colorbar(contour, label='Objective Function Value')

# Plot the equality constraint
theta = jnp.linspace(0, 2*jnp.pi, 100)
x1_eq = jnp.cos(theta)
x2_eq = jnp.sin(theta)
plt.plot(x1_eq, x2_eq, color='red', linewidth=2, label='Equality Constraint')

# Plot the inequality constraint and shade the feasible region
x1_ineq = jnp.linspace(-1.5, 2.5, 100)
x2_ineq = x1_ineq**2
plt.plot(x1_ineq, x2_ineq, color='orange', linewidth=2, label='Inequality Constraint')

# Shade the feasible region for the inequality constraint
x2_lower = jnp.minimum(x2_ineq, 2.5)
plt.fill_between(x1_ineq, x2_lower, 2.5, color='gray', alpha=0.2, hatch='\\/...', label='Inequality-feasible region')

# Plot the optimal and initial points
plt.scatter(x_opt[0], x_opt[1], color='red', s=100, edgecolor='white', linewidth=2, label='Final Point')
plt.scatter(x0[0], x0[1], color='green', s=100, edgecolor='white', linewidth=2, label='Initial Point')

# Plot the optimization trajectory using scatter plot
scatter = plt.scatter(trajectory[:, 0], trajectory[:, 1], c=jnp.arange(len(trajectory)), 
                      cmap='cool', s=10, alpha=0.5)
plt.colorbar(scatter, label='Iteration')

# Add labels and title
plt.xlabel('x1', fontsize=12)
plt.ylabel('x2', fontsize=12)
plt.title('Arrow-Hurwicz-Uzawa Algorithm with JAX and Adam (Corrected Min/Max)', fontsize=14)
plt.legend(fontsize=10, loc='upper center', bbox_to_anchor=(0.5, -0.05), ncol=3)
plt.grid(True, linestyle='--', alpha=0.7)

# Set the axis limits explicitly
plt.xlim(-1.5, 2.5)
plt.ylim(-1.5, 2.5)

plt.tight_layout()


# Verify the result
print(f"\nEquality constraint violation: {h(x_opt)[0]:.6f}")
print(f"Inequality constraint violation: {g(x_opt)[0]:.6f}")
print(f"Objective function value: {f(x_opt):.6f}")
```

```
Final x: [0.7861007  0.61806566]
Final lambda: [1.0322341]
Final mu: [0.51208335]
```

```

Equality constraint violation: -0.000041
Inequality constraint violation: -0.000111
Objective function value: 1.619426
```

![<Figure size 1200x1000 with 3 Axes>](https://raw.githubusercontent.com/Mbaka11/IFT6162-Reinforcement-Learning/main/Content/Assets/Website/6139882e48-bdf83cadcc7fee7d7388bc2e0d5adcd9.png)

<a id="projected-gradient-descent"></a>

### Projected Gradient Descent

The Arrow-Hurwicz-Uzawa algorithm provided a way to handle constraints through dual variables and a primal-dual update scheme. Another commonly used approach for constrained optimization is **Projected Gradient Descent (PGD)**. The idea is simple: take a gradient descent step as if the problem were unconstrained, then project the result back onto the feasible set. Formally:

<a id="avHyxLWZhB"></a>

$$
\mathbf{x}_{k+1} = \mathcal{P}_C\big(\mathbf{x}_k - \alpha \nabla f(\mathbf{x}_k)\big),
$$

[(43)](#avHyxLWZhB "Link to this Equation")

where $\mathcal{P}_C$ is the projection onto the feasible set $C$, $\alpha$ is the step size, and $f(\mathbf{x})$ is the objective function.

PGD is particularly effective when the projection is computationally cheap. A common example is **box constraints** (or bound constraints), where the feasible set is a hyperrectangle:

<a id="GVbrnGVJaC"></a>

$$
C = \{ \mathbf{x} \mid \mathbf{x}_{\mathrm{lb}} \leq \mathbf{x} \leq \mathbf{x}_{\mathrm{ub}} \}.
$$

[(44)](#GVbrnGVJaC "Link to this Equation")

In this case, the projection reduces to an element-wise clipping operation:

<a id="kMTEolTqH8"></a>

$$
[\mathcal{P}_C(\mathbf{x})]_i = \max\big(\min([\mathbf{x}]_i, [\mathbf{x}_{\mathrm{ub}}]_i), [\mathbf{x}_{\mathrm{lb}}]_i\big).
$$

[(45)](#kMTEolTqH8 "Link to this Equation")

For bound-constrained problems, PGD is almost as easy to implement as standard gradient descent because the projection step is just a clipping operation. For more general constraints, however, the projection may require solving a separate optimization problem, which can be as hard as the original task. Here is the algorithm for a problem of the form:

<a id="qh0BhjCcp2"></a>

$$
\begin{aligned}
\min_{\mathbf{x}} \quad & f(\mathbf{x}) \\
\text{subject to} \quad & \mathbf{x}_{\mathrm{lb}} \leq \mathbf{x} \leq \mathbf{x}_{\mathrm{ub}}.
\end{aligned}
$$

[(46)](#qh0BhjCcp2 "Link to this Equation")

<a id="proj-grad-descent-bound-constraints"></a>

[Algorithm 5](#proj-grad-descent-bound-constraints "Link to this Algorithm") (Projected Gradient Descent for Bound Constraints)

**Input:** Initial point $\mathbf{x}_0$, step size $\alpha$, bounds $\mathbf{x}_{\mathrm{lb}}, \mathbf{x}_{\mathrm{ub}}$, maximum iterations $\max_\text{iter}$, tolerance $\varepsilon$

1.  Initialize $k = 0$
    
2.  While $k < \max_\text{iter}$ and not converged:
    
    1.  Compute gradient: $\mathbf{g}_k = \nabla f(\mathbf{x}_k)$
        
    2.  Update: $\mathbf{x}_{k+1} = \text{clip}(\mathbf{x}_k - \alpha \mathbf{g}_k,\; \mathbf{x}_{\mathrm{lb}}, \mathbf{x}_{\mathrm{ub}})$
        
    3.  Check convergence: if $\|\mathbf{x}_{k+1} - \mathbf{x}_k\| < \varepsilon$, stop
        
    4.  $k = k + 1$
        
3.  Return $\mathbf{x}_k$
    

The clipping function is defined as:

<a id="fe9cQ3vD4c"></a>

$$
\text{clip}(x, x_{\mathrm{lb}}, x_{\mathrm{ub}}) = \max\big(\min(x, x_{\mathrm{ub}}), x_{\mathrm{lb}}\big).
$$

[(47)](#fe9cQ3vD4c "Link to this Equation")

Under mild conditions such as Lipschitz continuity of the gradient, PGD converges to a stationary point of the constrained problem. Its simplicity and low cost make it a common choice whenever the projection can be computed efficiently.

<a id="references"></a>

References[¶](#references "Link to References")

<a id="cite-ortega_rheinboldt_1970"></a>
2.  Ortega, J. M., & Rheinboldt, W. C. (1970). _Iterative Solution of Nonlinear Equations in Several Variables_. Academic Press.
<a id="cite-allgower_georg_1990"></a>
4.  Allgower, E. L., & Georg, K. (1990). _Numerical Continuation Methods: An Introduction_ (Vol. 13). Springer-Verlag.
<a id="cite-arrow1958studies"></a>
6.  Arrow, K. J., Hurwicz, L., & Uzawa, H. (1958). _Studies in linear and non-linear programming_. Stanford University Press.

[

Appendix

Solving Initial Value Problems


](30-appendix-ivps.md)

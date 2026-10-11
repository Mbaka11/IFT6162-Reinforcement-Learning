> **Cours de Pierre-Luc Bacon — 19.** [Page publiée](https://pierrelucbacon.com/rlbook/regularized-dp) · [Source numérotée](../19-regularized-dp.md)
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

This differs from logsumexp in that it adapts to state-action-specific uncertainty (actions with tighter confidence intervals receive more weight), whereas logsumexp applies uniform smoothing via temperature $\beta$. The Gaussian-weighted approach requires maintaining variance estimates and computing integrals, making it more expensive than logsumexp. However, it provides a principled way to reduce overestimation bias in Q-learning while avoiding the pessimism of double Q-learning. We return to this estimator in the [simulation-based methods chapter](22-monte-carlo-bellman-estimation.md) when discussing overestimation bias mitigation strategies.

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

Smoothness changes the operator but does not remove the need to represent its unknown value function. How can an infinite-dimensional functional equation be reduced to finitely many coefficients and test conditions? [Weighted-residual methods](20-weighted-residual-methods.md) provide the general approximation machinery.

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

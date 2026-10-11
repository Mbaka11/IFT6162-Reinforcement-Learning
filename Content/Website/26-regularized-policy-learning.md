> **Cours de Pierre-Luc Bacon — 26.** [Page publiée](https://pierrelucbacon.com/rlbook/regularized-policy-learning) · [Source numérotée](../26-regularized-policy-learning.md)
> Extraction HTML → Markdown, effectuée le 2026-10-11. Les formules LaTeX, figures statiques, solutions et liens sont conservés ; les animations nécessitent le site original.

<a id="skip-to-frontmatter"></a>

# Regularized and Residual-Based Policy Learning

<a id="skip-to-article"></a>

DDPG and TD3 address continuous actions by learning a deterministic policy that amortizes the $\arg\max_a q(s,a)$ operation. But deterministic policies have a fundamental limitation: they require external exploration noise (Gaussian perturbations in TD3) and can converge to suboptimal deterministic behaviors without adequate coverage of the state-action space.

Gradient estimators make stochastic actors trainable, while regularized dynamic programming specifies the stochastic policy they should approach. Can these pieces avoid both the continuous-action integral in the soft Bellman equation and the repeated optimization of a hard maximum?

The [smoothing chapter](19-regularized-dp.md) presents an alternative: entropy-regularized MDPs, where the agent maximizes expected return plus a bonus for policy randomness. This yields stochastic policies with exploration built into the objective itself. The smooth Bellman operator replaces the hard max with a soft-max:

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

DDPG, TD3, and SAC all follow the same solution template from fitted Q-iteration: compute Bellman targets using the current Q-function, fit the Q-function to those targets, repeat. This is **successive approximation**, the function iteration approach $v_{k+1} = \mathsf{P} \mathsf{L} v_k$ from the [projection methods chapter](21-approximate-bellman-equations.md).

Path Consistency Learning (PCL) Nachum _et al._, 2017 solves the Bellman equation differently. Instead of iterating the operator, it directly minimizes a **residual**. This is the least-squares approach from projection methods: solve $\mathsf{N}(v) = 0$ by minimizing $\|\mathsf{N}(v)\|^2$. The method exploits special structure (smooth Bellman operators under deterministic dynamics) that conventional methods cannot leverage.

<a id="the-path-consistency-property"></a>

### The Path Consistency Property

Consider the entropy-regularized Q-function Bellman equation from the [smoothing chapter](19-regularized-dp.md). Under general stochastic dynamics, it involves an expectation over next states:

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

This is the least-squares residual approach from the [projection methods chapter](21-approximate-bellman-equations.md). SAC computes targets $y_i$ and fits to them (successive approximation). PCL directly minimizes the residual without computing targets or performing a separate fitting step.

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

The [MPPI development](11-model-predictive-path-integral-control.md#sec-mppi) constructs a distribution over finite control sequences by exponentially tilting a reference distribution toward low-cost trajectories. A shifted Gaussian proposal makes these trajectories easier to sample. Importance weights then correct for the change of proposal, and their weighted perturbations update the nominal sequence. The controller applies its first action and shifts the remaining sequence to initialize the next optimization.

This calculation shares an exponential form with the policies derived from entropy regularization, but the distributions and optimization problems require separate definitions. SAC regularizes a state-conditional action policy. The information-theoretic MPPI construction regularizes a distribution over trajectories relative to a specified reference law [Williams _et al._, 2017](https://doi.org/10.48550/arXiv.1707.02342). In the separate [continuous-time path-integral derivation](17-path-integral-stochastic-control.md#sec-path-integral-control), the reference law is generated by an uncontrolled diffusion, and the quadratic control cost must match its noise covariance. Neither derivation identifies an arbitrary MPPI implementation with SAC or PCL’s soft Bellman solution.

The Gaussian mean update fits the tilted trajectory distribution by minimizing KL divergence from that distribution to the Gaussian family. It need not minimize the original expected-cost objective over Gaussian policies. Its sampled implementation also has discretization and finite-sampling error. The [aircraft example](11-model-predictive-path-integral-control.md#sec-aircraft-mppi) also estimates each candidate’s expected cost across possible wind futures. For the matched stochastic-control model, the [Brownian passage examples](17-path-integral-stochastic-control.md#sec-brownian-passages) compare sampled feedback with analytic and numerical reference solutions.

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

All of these objectives retain an optimality equation derived from a value or path-consistency relation. Can expected return be differentiated directly without first treating a Bellman equation as the training objective? [Policy gradients and actor-critic methods](27-policy-gradients.md) use the trajectory score and bring value functions back as variance-reducing critics.

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

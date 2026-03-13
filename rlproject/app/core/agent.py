# -*- coding: utf-8 -*-
"""
app/core/agent.py
-----------------
DRLAgent — based on rl.py lines 278-318.

KEY FIX in act():
  The raw DDPG actor output is in R^n (not constrained to sum to 1).
  During training, weights are normalized via env._normalize_action (softmax)
  inside env.step() — but that normalization was NEVER applied at inference time.
  This caused weights like [0.003, 0.0007, 0.00001, ...] instead of [0.60, 0.20, ...].

  Now act() applies the same softmax normalization before returning,
  so weights always sum to exactly 1.0 (= 100%).
"""

import numpy as np
from stable_baselines3 import DDPG, PPO
from stable_baselines3.common.noise import NormalActionNoise


def _softmax_normalize(action: np.ndarray) -> np.ndarray:
    """
    Numerically-stable softmax that converts any R^n vector to a
    probability distribution summing to 1.0.
    This is identical to TradingEnv._normalize_action.
    """
    a = np.array(action, dtype=np.float64)
    exp_a = np.exp(a - np.max(a))
    return (exp_a / np.sum(exp_a)).astype(np.float32)


class DRLAgent:
    """A DRL agent for portfolio management using DDPG or PPO."""

    def __init__(self, env, algorithm='DDPG', noise_decay=0.99, noise_sigma=0.1):
        self.env = env
        self.algorithm = algorithm
        self.noise_decay = noise_decay
        self.noise_sigma = noise_sigma

        # define the action noise for DDPG
        self.n_actions = env.action_space.shape[-1]
        self.action_noise = NormalActionNoise(
            mean=np.zeros(self.n_actions),
            sigma=self.noise_sigma * np.ones(self.n_actions)
        )

        # initialize the model based on the selected algorithm
        policy_kwargs = dict(net_arch=dict(pi=[128, 128], qf=[400, 300]))
        if algorithm == 'DDPG':
            self.model = DDPG(
                "MlpPolicy",
                env,
                action_noise=self.action_noise,
                verbose=1,
                learning_rate=0.001,
                policy_kwargs=policy_kwargs,
            )
        elif algorithm == 'PPO':
            self.model = PPO("MlpPolicy", env, verbose=1)
        else:
            raise ValueError("Unsupported algorithm. Choose 'DDPG' or 'PPO'.")

    def train(self, total_timesteps=10000):
        """Train the agent."""
        self.model.learn(total_timesteps=total_timesteps)
        # reducing the noise after training
        self.noise_sigma *= self.noise_decay
        self.action_noise = NormalActionNoise(
            mean=np.zeros(self.n_actions),
            sigma=self.noise_sigma * np.ones(self.n_actions)
        )

    def act(self, observation) -> np.ndarray:
        """
        FIX: Applies softmax normalization to the raw DDPG output.

        Raw DDPG actor output ∈ R^n — NOT normalized.
        We apply the same softmax used in env._normalize_action so the
        returned weights always sum to 1.0 (= 100% of the portfolio).
        """
        raw_action, _ = self.model.predict(observation, deterministic=True)
        return _softmax_normalize(raw_action)

    def act_averaged(self, env, n_steps: int = 50) -> np.ndarray:
        """
        More reliable prediction: run the env for n_steps and average
        the softmax-normalized allocations over those steps.

        A single reset() observation is from day 0 — the agent hasn't
        "seen" any market evolution yet. Averaging over multiple steps
        gives a more stable, representative allocation.
        """
        obs = env.reset()
        all_actions = []
        for _ in range(n_steps):
            raw, _ = self.model.predict(obs, deterministic=True)
            all_actions.append(_softmax_normalize(raw))
            # step with the normalized action (same as training)
            obs, _, done, _ = env.step(raw)
            if done:
                obs = env.reset()

        # Average weights and re-normalize to sum to 1.0
        mean_action = np.mean(all_actions, axis=0)
        return _softmax_normalize(mean_action)

    def save(self, path):
        """Save the model."""
        self.model.save(path)

    def load(self, path):
        """Load the model."""
        self.model = self.model.load(path)

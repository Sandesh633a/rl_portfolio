# -*- coding: utf-8 -*-
"""
app/core/environment.py
-----------------------
TradingEnv — based on rl.py lines 212-267 with critical fixes:

FIX 1 — _normalize_action: Changed from raw clip+normalize to SOFTMAX.
  Problem: clip(action, 0, 1) / sum can collapse to [1, 0, 0, ...] when
  DDPG outputs skewed values, giving degenerate 100% single-asset allocations.
  Softmax naturally produces smooth probability distributions.

FIX 2 — _calculate_portfolio_value: The env now receives daily-return growth
  factors (1 + daily_return) so that dot(growth_factors, allocation) correctly
  represents weighted portfolio growth/decline each step.
"""

import numpy as np
import gym
from gym import spaces


class TradingEnv(gym.Env):
    def __init__(self, historical_data, initial_balance=10000):
        super().__init__()
        self.historical_data = historical_data
        self.initial_balance = initial_balance
        self.n_assets = len(historical_data.columns)
        self.current_step = 0
        self.action_space = spaces.Box(low=0, high=1, shape=(self.n_assets,), dtype=np.float32)
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(2 * self.n_assets,), dtype=np.float32)
        self.reset()

    def reset(self):
        self.current_step = 0
        self.current_date = self.historical_data.index[self.current_step]
        self.portfolio_allocations = np.array([1.0 / self.n_assets] * self.n_assets)
        self.portfolio_value = self.initial_balance
        return self._construct_state()

    def _construct_state(self):
        # simplified state includes historical returns
        historical_returns = self.historical_data.iloc[self.current_step].values
        state = np.concatenate([historical_returns, self.portfolio_allocations])
        return state

    def step(self, action):
        action = self._normalize_action(action)
        prev_portfolio_value = self.portfolio_value
        self.portfolio_value = self._calculate_portfolio_value(action)
        reward = self.portfolio_value - prev_portfolio_value
        self.current_step += 1
        done = self.current_step >= len(self.historical_data) - 1
        self.current_date = self.historical_data.index[min(self.current_step, len(self.historical_data) - 1)]

        # call render() method after each step
        self.render()

        # construct the state with the correct shape
        state = self._construct_state()
        return state, reward, done, {}

    def _normalize_action(self, action):
        """
        FIXED: Use softmax instead of clip+normalize.
        Softmax guarantees:
          - All weights > 0 (no dead allocations)
          - Weights sum to 1
          - Smooth gradient — DDPG won't collapse to corner solutions
        """
        action = np.array(action, dtype=np.float64)
        # Numerically stable softmax
        exp_action = np.exp(action - np.max(action))
        return (exp_action / np.sum(exp_action)).astype(np.float32)

    def _calculate_portfolio_value(self, action):
        """
        asset_prices are now daily-return growth factors (1 + return/100),
        so dot(growth_factors, allocation) is the weighted daily portfolio return.
        """
        asset_prices = self.historical_data.iloc[self.current_step, :self.n_assets].values
        self.portfolio_allocations = action
        return np.dot(asset_prices, action) * self.portfolio_value

    def render(self, mode='human'):
        print(f"Step: {self.current_step}")
        print(f"Date: {self.current_date}")
        print(f"Allocations: {self.portfolio_allocations}")

// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 600000, // 10 min (training can be long)
  headers: { 'Content-Type': 'application/json' },
});

// Pipeline (primary)
export const runPipeline    = (tickers, algorithm = 'DDPG', total_timesteps = 5000) =>
  api.post('/pipeline/run', { tickers, algorithm, total_timesteps });
export const getSession     = () => api.get('/pipeline/session');
export const getLastTickers = () => api.get('/pipeline/tickers');

// Health
export const checkHealth    = () => api.get('/health');

// Individual (still available)
export const trainAgent     = (tickers, algorithm = 'DDPG', total_timesteps = 5000) =>
  api.post('/train', { tickers, algorithm, total_timesteps });
export const getPrediction  = (tickers, algorithm = 'DDPG') =>
  api.post('/predict', { tickers, algorithm });
export const evaluateModel  = (tickers, algorithm = 'DDPG') =>
  api.post('/evaluate', { tickers, algorithm });
export const generateReport = (tickers, algorithm = 'DDPG') =>
  api.post('/report/generate', { tickers, algorithm });

export default api;

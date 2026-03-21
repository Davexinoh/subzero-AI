import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const api = axios.create({ baseURL: BASE });

export const getWalletSummary = (walletAddress) => {
  const params = walletAddress ? { wallet: walletAddress } : {};
  return api.get('/wallet/summary', { params }).then(r => r.data);
};
export const emergencyFreeze = () => api.post('/wallet/emergency-freeze').then(r => r.data);
export const detectSubscriptions = () => api.get('/subscriptions/detect').then(r => r.data);
export const cancelSubscription = id => api.post('/subscriptions/cancel', { id }).then(r => r.data);
export const pauseSubscription = (id, months) => api.post('/subscriptions/pause', { id, months }).then(r => r.data);
export const sendMessage = (message, history) =>
  api.post('/agent/chat', {
    message,
    history: history.map(m => ({ role: m.role, content: m.content })),
  }).then(r => r.data);

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (userData) => api.post('/auth/register', userData),
  refresh: () => api.post('/auth/refresh')
};

export const paymentsAPI = {
  getWallet: () => api.get('/payments/wallet'),
  addMoney: (amount, paymentMethod) => api.post('/payments/wallet/add-money', { amount, paymentMethod }),
  transfer: (recipientPhone, amount) => api.post('/payments/transfer', { recipientPhone, amount }),
  getTransactions: (params) => api.get('/payments/transactions', { params }),
  submitKYC: (kyc) => api.post('/payments/kyc/submit', kyc)
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data)
};

export default api;

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// -----------------------
// Caching for getProfile
// -----------------------
let cachedProfile = null;

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),

  getProfile: async () => {
    if (cachedProfile) return Promise.resolve({ data: cachedProfile });
    const res = await api.get('/auth/me');
    cachedProfile = res.data; // store in cache
    return res;
  },

  clearProfileCache: () => {
    cachedProfile = null; // clear cache on logout
  },
};

// -----------------------
// Customers API
// -----------------------
export const customersAPI = {
  getCustomers: (params = {}) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// -----------------------
// Leads API
// -----------------------
export const leadsAPI = {
  getLeads: (customerId, params = {}) => api.get(`/customers/${customerId}/leads`, { params }),
  getLead: (customerId, leadId) => api.get(`/customers/${customerId}/leads/${leadId}`),
  createLead: (customerId, data) => api.post(`/customers/${customerId}/leads`, data),
  updateLead: (customerId, leadId, data) => api.put(`/customers/${customerId}/leads/${leadId}`, data),
  deleteLead: (customerId, leadId) => api.delete(`/customers/${customerId}/leads/${leadId}`),
};

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autowash_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    
    // Target 401 Unauthorized (Expired/Revoked Token) or 403 Forbidden
    if (status === 401 || status === 403) {
      // 1. Immediately purge all invalid authentication tokens from client storage
      localStorage.removeItem('autowash_token');
      localStorage.removeItem('autowash_user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_roles');
      localStorage.removeItem('accessToken');
      sessionStorage.clear();

      // 2. Clear global React Context auth states if applicable by dispatching a custom logout event
      window.dispatchEvent(new Event('auth_logout'));

      // 3. Forcefully redirect the client layout container back onto the public login index grid
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

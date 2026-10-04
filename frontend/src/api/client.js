import axios from 'axios';

export const TOKEN_KEY = 'marigold_token';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// When the session is no longer valid, tell the app so it can log the user out.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response && err.response.status;
    const url = (err.config && err.config.url) || '';
    if (status === 401 && localStorage.getItem(TOKEN_KEY) && !url.includes('/auth/login') && !url.includes('/auth/admin/login')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

export const unwrap = (promise) => promise.then((res) => res.data.data);

export default client;

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (formData) => API.put('/user/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ── AI Features ───────────────────────────────────────────────────────────────
export const getCropRecommendation = (data) => API.post('/crop-recommend', data);
export const detectDisease = (formData) =>
  API.post('/disease-detect', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const predictYield = (data) => API.post('/yield-predict', data);
export const getPriceForecast = (crop, state) => API.get(`/price-forecast?crop=${crop}${state ? `&state=${encodeURIComponent(state)}` : ''}`);
export const getPriceForecastAll = (state) => API.get(`/price-forecast/all${state ? `?state=${encodeURIComponent(state)}` : ''}`);
export const getPriceStates = () => API.get('/price-forecast/states');
export const getPriceMandis = (state) => API.get(`/price-forecast/mandis?state=${encodeURIComponent(state)}`);
export const getWeather = (location) => API.get(`/weather?location=${encodeURIComponent(location)}`);
export const getPests = (crop) => API.get(`/pests?crop=${crop}`);
export const getNearbyMarkets = (lat, lng, commodity) => API.get(`/markets?lat=${lat}&lng=${lng}&commodity=${commodity}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats');

export default API;

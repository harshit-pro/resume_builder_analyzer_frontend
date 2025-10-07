import axios from 'axios';

// Centralized Axios instance for consistent API calls
const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL2,
  timeout: 30000,
});

export default http;

import axios from 'axios';

// Axios instance for the analyzer service (may be a different base URL)
const analyzer = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 90000,
});

export default analyzer;

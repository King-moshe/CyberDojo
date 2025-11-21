import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

const http = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default http;

import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8181/api';
const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY || 'super-secret-key-12345';

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  let bodyString = '';

  if (config.data) {
    // Axios usually transforms data to JSON automatically, but config.data at this stage 
    // might still be an object. We need to stringify it identically to how the backend receives it.
    bodyString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    // Ensure we are sending the JSON string so backend and frontend match perfectly.
    config.data = bodyString;
    config.headers['Content-Type'] = 'application/json';
  }

  const dataToSign = timestamp + bodyString;
  const signature = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY).toString(CryptoJS.enc.Hex);

  config.headers['X-Timestamp'] = timestamp;
  config.headers['X-Signature'] = signature;

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;

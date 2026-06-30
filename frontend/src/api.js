import axios from './axiosConfig';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8181/api';

export function getFrameworks(){
  return axios.get(`${API_BASE}/frameworks`).then(r=>r.data)
}

export function getSummary(){
  return axios.get(`${API_BASE}/summary`).then(r=>r.data)
}

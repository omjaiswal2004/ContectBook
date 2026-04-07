import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

// Contacts
export const getContacts = async (query = '') => {
  const response = await api.get(`/contacts?q=${query}`);
  return response.data;
};

export const createContact = async (contact) => {
  const response = await api.post('/contacts', contact);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

export const updateContact = async (id, updatedData) => {
  const response = await api.put(`/contacts/${id}`, updatedData);
  return response.data;
};

export const mergeContacts = async (primaryId, secondaryId, newName, newEmail) => {
  const response = await api.post(`/contacts/merge`, { primaryId, secondaryId, newName, newEmail });
  return response.data;
};

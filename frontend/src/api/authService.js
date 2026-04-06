import { getAuthHeaders } from './authStorage';

const API = import.meta.env.VITE_BACKEND_URL;

export const loginUser = async (email, password) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name, email, password }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const logoutUser = async () => {
  const res = await fetch(`${API}/api/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Logout failed');
  return data;
};

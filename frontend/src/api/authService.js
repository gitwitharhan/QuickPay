import BASE_URL from './baseUrl';
import { getAuthHeaders } from './authStorage';

export const loginUser = async (email, password) => {
  const url = `${BASE_URL}/api/auth/login`;
  console.log('Attempting login at:', url);
  const res = await fetch(url, {
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
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
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
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Logout failed');
  return data;
};

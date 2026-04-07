import { getAuthHeaders } from './authStorage';

const API = import.meta.env.VITE_BACKEND_URL;

export const createAccountRequest = async () => {
  const res = await fetch(`${API}/api/account-request/create`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request submission failed');
  return data;
};

export const getMyRequests = async () => {
  const res = await fetch(`${API}/api/account-request/my`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch your requests');
  return data;
};

export const getAllAccountRequests = async () => {
  const res = await fetch(`${API}/api/account-request/all`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch all requests');
  return data;
};

export const reviewAccountRequest = async (requestId, action, reviewNote, initialAmount) => {
  const res = await fetch(`${API}/api/account-request/review/${requestId}`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ action, reviewNote, initialAmount }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Review submission failed');
  return data;
};

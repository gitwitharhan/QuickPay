import { getAuthHeaders } from './authStorage';

const API = import.meta.env.VITE_BACKEND_URL;

export const createTransaction = async (payload) => {
  const res = await fetch(`${API}/api/transaction/create`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Transaction failed');
  return data;
};

export const createInitialTransaction = async (payload) => {
  const res = await fetch(`${API}/api/transaction/initial`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Initial transaction failed');
  return data;
};

export const getAllTransactions = async () => {
  const res = await fetch(`${API}/api/transaction/all`, {
    method: 'GET',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
  return data;
};

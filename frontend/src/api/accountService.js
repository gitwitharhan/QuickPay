import { getAuthHeaders } from './authStorage';

const API = import.meta.env.VITE_BACKEND_URL;

export const fetchUserAccounts = async () => {
  const res = await fetch(`${API}/api/account/allAccounts`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch accounts');
  return data.accounts;
};

export const fetchAccountDetails = async (accountId) => {
  const res = await fetch(`${API}/api/account/${accountId}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch account details');
  return data;
};

export const createAccount = async () => {
  const res = await fetch(`${API}/api/account/createAccount`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create account');
  return data.account;
};

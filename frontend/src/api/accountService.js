export const fetchUserAccounts = async () => {
  const res = await fetch('/api/account/allAccounts', {
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch accounts');
  return data.accounts; // returns array of accounts
};

export const fetchAccountDetails = async (accountId) => {
  const res = await fetch(`/api/account/${accountId}`, {
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch account details');
  return data; // { account, balance }
};

export const createAccount = async () => {
  const res = await fetch('/api/account/createAccount', {
    method: 'POST',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create account');
  return data.account;
};

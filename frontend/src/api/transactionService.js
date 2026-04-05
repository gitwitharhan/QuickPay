export const createTransaction = async (payload) => {
  // payload: { fromAccount, toAccount, amount, idempotencyKey }
  const res = await fetch('/api/transaction/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Transaction failed');
  }
  return data;
};

export const createInitialTransaction = async (payload) => {
  // payload: { toAccount, amount, idempotencyKey }
  const res = await fetch('/api/transaction/initial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Initial transaction failed');
  }
  return data;
};

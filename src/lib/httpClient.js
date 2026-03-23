// HTTP Client for API communication
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7198/api/v1';

export const httpClient = {
  get: async (url) => {
    const res = await fetch(`${baseURL}${url}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
  post: async (url, data) => {
    const res = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  put: async (url, data) => {
    const res = await fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  delete: async (url) => {
    const res = await fetch(`${baseURL}${url}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};

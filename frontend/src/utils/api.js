const API_BASE = 'http://localhost:5000';

// Get auth headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

// Authenticated fetch wrapper
const apiFetch = async (url, options = {}) => {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (res.status === 401) { 
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/login'; 
    throw new Error('Unauthorized');
  }
  return res;
};

export { API_BASE, getAuthHeaders, apiFetch };
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveImage = (pic) => {
  if (!pic) return 'https://via.placeholder.com/300';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const imgPath = pic.startsWith('/') ? pic : `/${pic}`;
  
  if (imgPath.startsWith('/images/')) return `${baseUrl}${imgPath}`;
  return `${baseUrl}/images${imgPath}`;
};

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

export { API_BASE, getAuthHeaders, apiFetch, resolveImage };
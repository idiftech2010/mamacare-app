// Shared API base URL for the MamaCare frontend.
// The deployment should set VITE_API_URL to the production backend URL.
// Local development falls back to the local backend at http://localhost:5000/api.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

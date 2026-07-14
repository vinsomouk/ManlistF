const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  DEFAULT_API_BASE_URL;

export const API_URL = `${API_BASE_URL}/api`;
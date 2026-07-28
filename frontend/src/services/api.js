import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const normalizedApiUrl = configuredApiUrl.replace(/\/$/, "");
const baseURL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menyisipkan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;

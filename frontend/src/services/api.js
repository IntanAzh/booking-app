import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Sesuaikan dengan port backend
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

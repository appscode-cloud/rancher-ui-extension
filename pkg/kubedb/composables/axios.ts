// axios.js or axios.ts if you're using TypeScript
import axios from "axios";

// Create an Axios instance
const $axios = axios.create({
  baseURL: "", // adapt to your env
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add a token from localStorage or any auth storage
$axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or use cookies, Vuex, Pinia, etc.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
$axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Optionally redirect to login
        console.warn("Unauthorized. Redirecting to login...");
      }

      // Handle other statuses
      console.error(
        "API error:",
        error.response.data?.message || error.message
      );
    } else {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default $axios;

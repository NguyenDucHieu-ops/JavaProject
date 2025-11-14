import axios from "axios";

const httpAxios = axios.create({
  baseURL: "http://localhost:8000/api", // ⚙️ Laravel API backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để log lỗi server
httpAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default httpAxios;

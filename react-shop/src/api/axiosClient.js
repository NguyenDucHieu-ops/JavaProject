import axios from "axios";

const axiosClient = axios.create({
// Trong file axiosClient.js
baseURL: "https://javaproject.onrender.com/api",  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Tự động gắn JWT token cho mọi request
axiosClient.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  // ✅ Ưu tiên admin token khi ở trang admin
  const isAdminPage = window.location.pathname.startsWith("/admin");
  const token = isAdminPage ? adminToken : userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Xử lý lỗi phản hồi (Unauthorized, v.v.)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      console.warn("⚠️ Token hết hạn hoặc không hợp lệ. Đang xóa thông tin người dùng...");

      const keysToRemove = [
        "adminToken", "adminRole", "adminUsername", "adminEmail", "adminName",
        "userToken", "userRole", "userUsername", "userEmail", "userName", "userAvatar"
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Tuỳ bạn muốn redirect về login:
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

// src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Gắn JWT token vào header cho tất cả request
apiClient.interceptors.request.use((config) => {
  // Lấy cả 2 token từ localStorage
  const userToken = localStorage.getItem("userToken");
  
  // ✅ ĐÃ SỬA: Dùng đúng key "adminToken" mà bạn vừa xác nhận
  const adminToken = localStorage.getItem("adminToken"); 

  // 1. Kiểm tra xem có đang ở trang admin không
  const isAdminPage = window.location.pathname.startsWith("/admin");

  // 2. Ưu tiên token dựa trên trang web
  const token = isAdminPage ? adminToken : userToken;
  
  // 3. Gắn token vào header nếu nó tồn tại
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// (Phần xử lý lỗi 401/403)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    
    // Nếu bị lỗi 401 (chưa auth) hoặc 403 (cấm)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Token hết hạn, không hợp lệ, hoặc không có quyền. Đang xóa thông tin...");
      
      // Xóa hết key
      localStorage.removeItem("userToken");
      localStorage.removeItem("adminToken"); // Xóa đúng key
      // ...xóa các key khác (userName, userRole...)
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
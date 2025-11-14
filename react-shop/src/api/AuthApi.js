import axiosClient from "./axiosClient";

const authApi = {
  // Đăng nhập admin
  login: async (data) => {
    try {
      // ❌ ĐÃ XÓA 6 DÒNG `localStorage.removeItem` CỦA USER Ở ĐÂY

      const response = await axiosClient.post("/auth/login", {
        ...data,
        isAdmin: true,
      });
      if (response.role === "ROLE_ADMIN") {
        localStorage.setItem("adminToken", response.token);
        localStorage.setItem("adminRole", response.role);
        localStorage.setItem("adminUsername", response.username || "");
        localStorage.setItem("adminEmail", response.email || "");
        localStorage.setItem("adminName", response.name || response.username || "");
        return response;
      }
      throw new Error("Tài khoản này không phải admin. Vui lòng dùng trang đăng nhập người dùng!");
    } catch (error) {
      throw error;
    }
  },

  // Đăng nhập user (Giữ nguyên)
  loginUser: async (data) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        ...data,
        isAdmin: false,
      });
      if (response.role === "ROLE_USER") {
        localStorage.setItem("userToken", response.token);
        localStorage.setItem("userRole", response.role);
        return response;
      }
      throw new Error("Tài khoản này không phải user. Vui lòng dùng trang đăng nhập admin!");
    } catch (error) {
      throw error;
    }
  },

  // Logout (CẬP NHẬT: Xóa sạch cả token User)
  logout: async () => {
    try {
      // (Không cần gọi API logout, chỉ cần xóa localStorage là đủ)
      // await axiosClient.post("/auth/logout"); 
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminUsername");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminName");
      
      localStorage.removeItem("userToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userUsername");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userAvatar");
    } catch (error) {
      // Vẫn xóa localStorage ngay cả khi API lỗi
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRole");
      console.error("Logout error:", error);
    }
  },

  // Register Admin (Giữ nguyên)
  registerAdmin: async (data) => {
    try {
      console.log("Admin register request:", data);
      const response = await axiosClient.post("/auth/register-admin", data);
      console.log("Admin register response:", response);
      return response;
    } catch (error) {
      console.error("Admin register error:", error);
      throw error;
    }
  },

  // Register User (Giữ nguyên)
  register: async (data) => {
    try {
      const response = await axiosClient.post("/auth/register", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authApi;
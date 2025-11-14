import axiosClient from "./axiosClient";

const authUserApi = {
  login: async (data) => {
    try {
      // ❌ ĐÃ XÓA 5 DÒNG `localStorage.removeItem` CỦA ADMIN Ở ĐÂY
      
      const response = await axiosClient.post("/auth/login", {
        ...data,
        isAdmin: false,
      });
      if (response.role === "ROLE_USER") {
        localStorage.setItem("userToken", response.token);
        localStorage.setItem("userRole", response.role);
        localStorage.setItem("userUsername", response.username || "");
        localStorage.setItem("userEmail", response.email || "");
        localStorage.setItem("userName", response.name || response.username || "");
        localStorage.setItem("userAvatar", response.avatar || ""); // ✅ Thêm avatar
        return response;
      }
      throw new Error("Vui lòng sử dụng trang đăng nhập người dùng");
    } catch (error) {
      throw error;
    }
  },
  register: async (data) => {
    try {
      const response = await axiosClient.post("/auth/register", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authUserApi; 
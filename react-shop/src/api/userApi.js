import axiosClient from "./axiosClient";

const userApi = {
  // --- Các hàm admin cũ ---
  getAll: () => axiosClient.get("/users"),
  get: (id) => axiosClient.get(`/users/${id}`),
  create: (data) => axiosClient.post("/users", data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),

  // --- ✅ MỚI: Các hàm cho User Profile ---
  getProfile: () => {
    return axiosClient.get("/users/profile"); // Sẽ tự đính kèm token
  },

  updateProfile: (profileData) => {
    return axiosClient.put("/users/profile", profileData);
  },

  updateAvatar: (formData) => {
    return axiosClient.post("/users/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default userApi;
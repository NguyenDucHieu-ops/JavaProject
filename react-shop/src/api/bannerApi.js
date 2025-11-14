import axiosClient from "./axiosClient";

const bannerApi = {
  // Lấy tất cả banner
  getAll: () => axiosClient.get("/banners"),

  // Lấy banner theo ID
  getOne: (id) => axiosClient.get(`/banners/${id}`),

  // Thêm banner mới (có thể kèm ảnh)
  create: (formData) =>
    axiosClient.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Cập nhật banner (có thể kèm ảnh mới)
  update: (id, formData) =>
    axiosClient.put(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Xóa banner
  delete: (id) => axiosClient.delete(`/banners/${id}`),
};

export default bannerApi;

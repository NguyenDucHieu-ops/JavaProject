import axiosClient from "./axiosClient";

const categoryApi = {
  getAll: () => {
    return axiosClient.get("/categories").then((data) => {
      console.log("✅ CategoryApi.getAll:", data);
      return data;
    });
  },

  getById: (id) => {
    return axiosClient.get(`/categories/${id}`).then((data) => {
      console.log("✅ CategoryApi.getById:", data);
      return data;
    });
  },

  // Tạo danh mục có ảnh
  create: (formData) => {
    return axiosClient.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Cập nhật danh mục có ảnh
  update: (id, formData) => {
    return axiosClient.put(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id) => axiosClient.delete(`/categories/${id}`),
};

export default categoryApi;

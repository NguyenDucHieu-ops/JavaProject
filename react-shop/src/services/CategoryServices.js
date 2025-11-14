// src/services/CategoryService.js
import axiosClient from "./axiosClient";

const CategoryService = {
  // Lấy tất cả category
  getAll: async () => {
    try {
      return await axiosClient.get("/categories");
    } catch (error) {
      throw error;
    }
  },

  // Lấy theo ID
  getById: async (id) => {
    try {
      return await axiosClient.get(`/categories/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Thêm mới
  create: async (data) => {
    try {
      return await axiosClient.post("/categories", data);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật
  update: async (id, data) => {
    try {
      return await axiosClient.put(`/categories/${id}`, data);
    } catch (error) {
      throw error;
    }
  },

  // Xóa
  delete: async (id) => {
    try {
      return await axiosClient.delete(`/categories/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // 🔍 Thêm 3 truy vấn nâng cao (ví dụ)
  searchByName: async (name) => {
    try {
      return await axiosClient.get(`/categories/search?name=${name}`);
    } catch (error) {
      throw error;
    }
  },

  getByProductCount: async (minCount) => {
    try {
      return await axiosClient.get(`/categories/by-product-count?min=${minCount}`);
    } catch (error) {
      throw error;
    }
  },

  getRecentCategories: async () => {
    try {
      return await axiosClient.get(`/categories/recent`);
    } catch (error) {
      throw error;
    }
  },
};

export default CategoryService;

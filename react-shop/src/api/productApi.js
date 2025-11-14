import axiosClient from "./axiosClient"; // ✅ Dùng axiosClient chuẩn

const productApi = {
  // 🟢 Lấy tất cả sản phẩm
  getAll: (query = "") => axiosClient.get(`/products${query}`),

  // 🟢 Lấy sản phẩm theo ID
  getById: (id) => axiosClient.get(`/products/${id}`),

  // 🟢 Tạo sản phẩm mới
  create: (data) => axiosClient.post("/products", data),

  // 🟢 Cập nhật sản phẩm
  update: (id, data) => axiosClient.put(`/products/${id}`, data),

  // 🟢 Xóa sản phẩm
  delete: (id) => axiosClient.delete(`/products/${id}`),

  // 🟢 Tìm sản phẩm theo tên
  searchByName: (keyword) =>
    axiosClient.get(`/products/search?keyword=${encodeURIComponent(keyword)}`),

  // 🟢 Lọc sản phẩm theo khoảng giá
  filterByPriceRange: (min, max) =>
    axiosClient.get(`/products/price?min=${min}&max=${max}`),

  // 🟢 Lấy sản phẩm theo danh mục
  getByCategory: (categoryId) =>
    axiosClient.get(`/products/category/${categoryId}`),

  // 🟢 Import sản phẩm từ file Excel
  importExcel: (formData) =>
    axiosClient.post("/products/import-excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // 🟢 Xuất danh sách sản phẩm ra file Excel
  exportExcel: () =>
    axiosClient.get("/products/export-excel", {
      responseType: "blob", // Để tải file Excel
    }),

  // 🟢 Lấy thống kê sản phẩm
  getStats: () => axiosClient.get("/products/stats"),

  // 🟢 Lấy sản phẩm mới nhất (cho dashboard)
  getLatestProducts: (limit = 5) =>
    axiosClient.get(`/products/latest?limit=${limit}`),
};

export default productApi;

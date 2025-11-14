import axiosClient from "./axiosClient";

const productSizeApi = {
  // Lấy danh sách size theo product_id
  getByProductId: (productId) =>
    axiosClient.get(`/product-sizes?product_id=${productId}`),

  // Thêm size mới
  create: (data) => axiosClient.post("/product-sizes", data),

  // Cập nhật size
  update: (id, data) => axiosClient.put(`/product-sizes/${id}`, data),

  // Xóa size
  delete: (id) => axiosClient.delete(`/product-sizes/${id}`),
};

export default productSizeApi;

import axiosClient from "./axiosClient"; // ✅ Dùng axiosClient chuẩn

const orderApi = {
  // 🟢 Lấy tất cả đơn hàng (Admin)
  getAllOrders: async () => {
    try {
      const res = await axiosClient.get("/orders");
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách đơn hàng:", error);
      throw error;
    }
  },

  // 🟢 Lấy đơn hàng theo ID
  getOrderById: async (id) => {
    try {
      const res = await axiosClient.get(`/orders/${id}`);
      return res;
    } catch (error) {
      console.error(`❌ Lỗi khi lấy đơn hàng ID=${id}:`, error);
      throw error;
    }
  },

  // 🟢 Tạo đơn hàng mới
  createOrder: async (data) => {
    try {
      console.log("📦 Dữ liệu gửi đi:", data);
      const res = await axiosClient.post("/orders", data);
      console.log("✅ Phản hồi từ server:", res);
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi tạo đơn hàng:", error);
      throw error;
    }
  },

  // 🟢 Cập nhật đơn hàng
  updateOrder: async (id, data) => {
    try {
      const res = await axiosClient.put(`/orders/${id}`, data);
      return res;
    } catch (error) {
      console.error(`❌ Lỗi khi cập nhật đơn hàng ID=${id}:`, error);
      throw error;
    }
  },

  // 🟢 Xóa đơn hàng
  deleteOrder: async (id) => {
    try {
      const res = await axiosClient.delete(`/orders/${id}`);
      return res;
    } catch (error) {
      console.error(`❌ Lỗi khi xóa đơn hàng ID=${id}:`, error);
      throw error;
    }
  },

  // 🟢 Lấy đơn hàng của user hiện tại
  getMyOrders: async () => {
    try {
      const res = await axiosClient.get(`/orders/my`);
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch sử đơn hàng:", error);
      throw error;
    }
  },

  // 🟢 Lấy đơn hàng mới nhất (cho dashboard)
  getLatestOrders: async (limit = 5) => {
    try {
      const res = await axiosClient.get(`/orders/latest?limit=${limit}`);
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi lấy đơn hàng mới nhất:", error);
      throw error;
    }
  },
};

export default orderApi;

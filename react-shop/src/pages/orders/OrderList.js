import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderApi from "../../api/orderApi";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      try {
        await orderApi.deleteOrder(id);
        setOrders(orders.filter((o) => o.id !== id));
        alert("✅ Đã xóa đơn hàng thành công!");
      } catch (err) {
        console.error("Xóa đơn hàng thất bại:", err);
      }
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📦 Danh sách đơn hàng</h2>

      <table className="w-full border-collapse bg-white shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Mã đơn</th>
            <th className="p-3 border">Khách hàng</th>
            <th className="p-3 border">SĐT</th>
            <th className="p-3 border text-right">Tổng tiền</th>
            <th className="p-3 border text-center">Trạng thái</th>
            <th className="p-3 border text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-gray-500 p-4">
                Chưa có đơn hàng nào.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-3 border text-center">{o.id}</td>
                <td className="p-3 border">{o.fullName}</td>
                <td className="p-3 border">{o.phone}</td>
                <td className="p-3 border text-right">{o.totalAmount?.toLocaleString()}₫</td>
                <td className="p-3 border text-center">{o.status}</td>
                <td className="p-3 border text-center space-x-2">
                  <Link
                    to={`/admin/orders/${o.id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Xem
                  </Link>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;

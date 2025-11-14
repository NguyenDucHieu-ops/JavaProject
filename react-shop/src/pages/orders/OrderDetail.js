import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import orderApi from "../../api/orderApi";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        setOrder(res);
        setStatus(res.status);
      } catch (error) {
        console.error("❌ Lỗi khi tải chi tiết đơn hàng:", error);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await orderApi.updateOrder(id, { status });
      alert("✅ Cập nhật trạng thái thành công!");
      navigate("/admin/orders");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật đơn hàng:", error);
    }
  };

  if (!order) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        📄 Chi tiết đơn hàng #{order.id}
      </h2>

      <div className="mb-3 space-y-1">
        <p>
          <b>👤 Khách hàng:</b> {order.fullName}
        </p>
        <p>
          <b>📞 SĐT:</b> {order.phone}
        </p>
        <p>
          <b>📍 Địa chỉ:</b> {order.address}
        </p>
        <p>
          <b>🕒 Ngày đặt hàng:</b>{" "}
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "Không có thông tin"}
        </p>
        <p>
          <b>💰 Tổng tiền:</b>{" "}
          {order.totalAmount?.toLocaleString("vi-VN")}₫
        </p>
      </div>

      <div className="mt-4">
        <label>Trạng thái:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="ml-2 border rounded p-1"
        >
          <option value="PENDING">Chờ xử lý</option>
          <option value="SHIPPING">Đang giao</option>
          <option value="COMPLETED">Hoàn tất</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <button
          onClick={handleUpdate}
          className="ml-3 bg-green-600 text-white px-3 py-1 rounded"
        >
          Lưu
        </button>
      </div>

      <h3 className="text-lg font-bold mt-6 mb-2">🛍️ Sản phẩm trong đơn</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {order.items?.map((item, i) => (
          <div key={i} className="border rounded p-3 flex gap-3">
            <img
              src={
                item.imageUrl
                  ? `http://localhost:8080${item.imageUrl}`
                  : "/no-image.png"
              }
              alt={item.productName}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="font-semibold">{item.productName}</p>
              <p>Số lượng: {item.quantity}</p>
              <p>Giá: {item.price?.toLocaleString("vi-VN")}₫</p>
              <p className="font-medium text-green-600">
                Tổng: {item.subTotal?.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetail;

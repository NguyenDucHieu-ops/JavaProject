import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import orderApi from "../../api/orderApi";
import productApi from "../../api/productApi";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUserFriends,
  FaTshirt,
} from "react-icons/fa";

// ✅ Helper: lấy ảnh đúng đường dẫn
const getImageUrl = (path) => {
  if (!path)
    return "https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image";
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

// ✅ Helper: định dạng trạng thái đơn hàng
const formatStatus = (status) => {
  if (status === "PENDING")
    return <span className="text-yellow-600 font-semibold">Chờ xử lý</span>;
  if (status === "SHIPPING" || status === "SHIPPED")
    return <span className="text-blue-600 font-semibold">Đang giao</span>;
  if (status === "COMPLETED" || status === "DELIVERED")
    return <span className="text-green-600 font-semibold">Hoàn tất</span>;
  if (status === "CANCELLED")
    return <span className="text-red-600 font-semibold">Đã hủy</span>;
  return <span className="text-gray-600 font-semibold">{status}</span>;
};

const AdminDashboard = () => {
  const [latestOrders, setLatestOrders] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Gọi API khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          orderApi.getLatestOrders(5), // lấy 5 đơn hàng gần nhất
          productApi.getLatestProducts(5), // lấy 5 sản phẩm gần nhất
        ]);
        setLatestOrders(ordersRes || []);
        setLatestProducts(productsRes || []);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-gray-600">Đang tải dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">📊 Bảng điều khiển</h1>

      {/* ✅ Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaShoppingCart />}
          title="Tổng Đơn Hàng"
          value={latestOrders.length.toLocaleString("vi-VN")}
          color="blue"
        />
        <StatCard
          icon={<FaTshirt />}
          title="Sản Phẩm"
          value={latestProducts.length.toLocaleString("vi-VN")}
          color="green"
        />
        <StatCard
          icon={<FaUserFriends />}
          title="Khách Hàng"
          value="450"
          color="yellow"
        />
        <StatCard
          icon={<FaBoxOpen />}
          title="Chờ Xử Lý"
          value={
            latestOrders.filter((o) => o.status === "PENDING").length
          }
          color="red"
        />
      </div>

      {/* ✅ Hai cột chính */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- ĐƠN HÀNG MỚI NHẤT --- */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            🧾 Đơn hàng mới nhất
          </h2>
          <div className="space-y-3">
            {latestOrders.length > 0 ? (
              latestOrders.map((order) => (
                <div key={order.id} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Mã ĐH: #{order.id}
                    </Link>
                    {formatStatus(order.status)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>{order.fullName}</span> |{" "}
                    <span>
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-red-600">
                    {Number(order.totalAmount).toLocaleString("vi-VN")}₫
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có đơn hàng nào.</p>
            )}
          </div>
          <Link
            to="/admin/orders"
            className="block text-center mt-4 text-blue-600 font-medium hover:underline"
          >
            ➜ Xem tất cả đơn hàng
          </Link>
        </div>

        {/* --- SẢN PHẨM MỚI NHẤT --- */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            🛍️ Sản phẩm mới thêm
          </h2>
          <div className="space-y-3">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 border-b pb-3"
                >
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="font-semibold text-gray-800 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {product.categoryName || product.category?.name}
                    </p>
                    <p className="text-red-600 font-bold">
                      {Number(product.price).toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có sản phẩm nào.</p>
            )}
          </div>
          <Link
            to="/admin/products"
            className="block text-center mt-4 text-blue-600 font-medium hover:underline"
          >
            ➜ Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
};

// ✅ Component thẻ thống kê nhỏ
const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
      <div className={`p-3 rounded-full ${colors[color] || colors.blue}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;

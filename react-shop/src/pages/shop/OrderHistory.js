import React, { useEffect, useState } from "react";
import orderApi from "../../api/orderApi";
import { format } from "date-fns";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        setOrders(res);
      } catch {
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        Lịch sử đơn hàng
      </h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500">
          Bạn chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              {/* Ảnh sản phẩm đầu tiên */}
              <img
                src={
                  order.items?.[0]?.imageUrl
                    ? `http://localhost:8080${order.items[0].imageUrl}`
                    : "/no-image.png"
                }
                alt="Ảnh sản phẩm"
                className="w-16 h-16 object-cover rounded mr-4 border"
              />

              <div className="flex-1">
                <div className="font-semibold text-lg">Đơn #{order.id}</div>
                <div className="text-sm text-gray-500">
                  Ngày đặt:{" "}
                  {order.createdAt
                    ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")
                    : ""}
                </div>
                <div className="text-sm text-gray-500">
                  Tổng tiền:{" "}
                  <span className="font-bold text-indigo-700">
                    {order.totalAmount?.toLocaleString()}₫
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Trạng thái: <span className="font-bold">{order.status}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(order)}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>

            <h3 className="text-xl font-bold mb-4 text-indigo-700">
              Chi tiết đơn hàng #{selectedOrder.id}
            </h3>

            <div className="mb-2 text-sm text-gray-500">
              Ngày đặt:{" "}
              {selectedOrder.createdAt
                ? format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm")
                : ""}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              Trạng thái:{" "}
              <span className="font-bold">{selectedOrder.status}</span>
            </div>
            <div className="mb-2 text-sm text-gray-500">
              Tổng tiền:{" "}
              <span className="font-bold text-indigo-700">
                {selectedOrder.totalAmount?.toLocaleString()}₫
              </span>
            </div>

            <div className="mt-4">
              <div className="font-semibold mb-2">Sản phẩm:</div>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center border-b pb-2">
                    <img
                      src={
                        item.imageUrl
                          ? `http://localhost:8080${item.imageUrl}`
                          : "/no-image.png"
                      }
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded mr-3 border"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-gray-500">
                        x{item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-indigo-700">
                      {item.price?.toLocaleString()}₫
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

// src/pages/shop/PaymentSuccess.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <CheckCircle2 className="text-green-600" size={90} />
      <h1 className="text-3xl font-bold mt-4">Đặt hàng thành công!</h1>
      <p className="text-gray-500 mt-2 max-w-md">
        Đơn hàng của bạn đã được tiếp nhận — chúng tôi sẽ giao sớm nhất có thể.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          to="/orders"
          className="px-5 py-3 border rounded-lg hover:bg-gray-100"
        >
          Xem đơn hàng
        </Link>
        <Link
          to="/home"
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

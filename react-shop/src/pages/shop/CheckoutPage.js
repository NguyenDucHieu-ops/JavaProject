import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import orderApi from "../../api/orderApi";
import Modal from "react-modal";
import { QRCodeSVG } from "qrcode.react";

Modal.setAppElement("#root");

// Phí ship sẽ được tính lại dựa trên các item đã chọn
const BANK_INFO = {
  BANK_ID: "970415",
  ACCOUNT_NO: "123456789",
  ACCOUNT_NAME: "DECA SHOP",
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin từ giỏ hàng

  // LẤY CÁC SẢN PHẨM ĐÃ CHỌN TỪ TRANG GIỎ HÀNG
  const itemsToCheckout = location.state?.itemsToCheckout || [];

  // State
  const [cart, setCart] = useState(itemsToCheckout);
  const [cartTotal, setCartTotal] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrString, setQrString] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderIdForQR, setOrderIdForQR] = useState(null);
  const [shippingFee, setShippingFee] = useState(40000);
  const [errors, setErrors] = useState({});

  // Nếu không có sản phẩm thì quay lại giỏ hàng
  useEffect(() => {
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào. Đang quay về giỏ hàng...");
      navigate("/cart");
      return;
    }
    const total = itemsToCheckout.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    setCartTotal(total);
  }, [itemsToCheckout, navigate]);

  // Xóa giỏ hàng
  const clearCart = () => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Phí ship động
  useEffect(() => {
    if (cartTotal > 500000) {
      setShippingFee(0);
      return;
    }
    const address = form.address.toLowerCase();
    if (address.includes("hồ chí minh") || address.includes("hcm")) {
      setShippingFee(20000);
    } else if (address.includes("hà nội") || address.includes("đà nẵng")) {
      setShippingFee(30000);
    } else {
      setShippingFee(40000);
    }
  }, [form.address, cartTotal]);

  const grandTotal = cartTotal + shippingFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  // Giả lập thanh toán QR sau 5s
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        console.log("GIẢ LẬP: Thanh toán QR thành công sau 5 giây!");
        handleCloseModal();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // Tạo chuỗi VietQR
  const generateVietQRString = (orderId) => {
    const amount = grandTotal.toString();
    const description = `DH${orderId}`;
    const buildVietQRData = (bankId, accountNo, amount, description) => {
      const field = (id, value) => {
        if (!value) return "";
        const len = value.length.toString().padStart(2, "0");
        return `${id}${len}${value}`;
      };
      const data = [
        "000201",
        "010212",
        "3858",
        field("00", "A000000727"),
        field("01", "QRIBFTTA"),
        field("02", bankId),
        field("03", accountNo),
        "5303704",
        field("54", amount),
        "5802VN",
        field("59", BANK_INFO.ACCOUNT_NAME),
        field("62", `08${field("01", description)}`),
      ];
      const dataString = data.join("");
      const checksum = "6304" + "XXXX";
      return dataString + checksum;
    };
    const finalQRString = buildVietQRData(
      BANK_INFO.BANK_ID,
      BANK_INFO.ACCOUNT_NO,
      amount,
      description
    );
    setQrString(finalQRString);
  };

  // Validate frontend
  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!form.fullName) newErrors.fullName = "Họ tên không được để trống";
    if (!form.phone) newErrors.phone = "Số điện thoại không được để trống";
    else if (!phoneRegex.test(form.phone))
      newErrors.phone = "Số điện thoại không hợp lệ (10 số)";
    if (!form.address) newErrors.address = "Địa chỉ không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại thông tin giao hàng!");
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    if (!cart || cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      setIsSubmitting(false);
      return;
    }
    const orderData = {
      ...form,
      shippingFee: shippingFee,
      items: cart.map((item) => ({
        productId: Number(item.productId || item.id),
        quantity: Number(item.quantity),
      })),
    };
    try {
      console.log("🚀 Gửi đơn hàng:", orderData);
      await orderApi.createOrder(orderData);
      const demoOrderId = Math.floor(10000 + Math.random() * 90000);
      if (orderData.paymentMethod === "COD") {
        console.log("Phương thức: COD. Đặt hàng thành công.");
        clearCart();
        navigate("/payment/success");
      } else if (orderData.paymentMethod === "QR") {
        console.log("Phương thức: QR. Đặt hàng thành công, đang tạo mã...");
        setOrderIdForQR(demoOrderId);
        generateVietQRString(demoOrderId);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn hàng:", err);
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data);
        const firstError = Object.values(err.response.data)[0];
        alert("Thông tin không hợp lệ: " + firstError);
      } else if (err.response && err.response.data) {
        alert(`Lỗi: ${err.response.data}`);
      } else {
        alert("Không thể tạo đơn hàng. Vui lòng thử lại sau!");
      }
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    clearCart();
    navigate("/payment/success");
  };

  const handleBlur = (e) => {
    validateForm();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6">
        Thanh toán đơn hàng
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FORM GIAO HÀNG */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 bg-white p-6 rounded-lg shadow space-y-4"
        >
          <h2 className="text-lg font-semibold mb-2">1. Thông tin giao hàng</h2>

          <div>
            <input
              name="fullName"
              placeholder="Họ và tên"
              className={`input w-full border rounded p-2 font-sans ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <input
              name="phone"
              placeholder="Số điện thoại"
              className={`input w-full border rounded p-2 font-sans ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <input
              name="address"
              placeholder="Địa chỉ nhận hàng (Gõ 'HCM' hoặc 'Hà Nội' để thử phí ship)"
              className={`input w-full border rounded p-2 font-sans ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <textarea
            name="note"
            placeholder="Ghi chú (tuỳ chọn)"
            className="input w-full border rounded p-2 font-sans"
            value={form.note}
            onChange={handleChange}
          />

          <h2 className="text-lg font-semibold mb-2 pt-4">
            2. Phương thức thanh toán
          </h2>
          <div className="space-y-2">
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                form.paymentMethod === "COD"
                  ? "bg-blue-50 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === "COD"}
                onChange={handleChange}
                className="mr-3"
              />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                form.paymentMethod === "QR"
                  ? "bg-blue-50 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="QR"
                checked={form.paymentMethod === "QR"}
                onChange={handleChange}
                className="mr-3"
              />
              Thanh toán bằng mã VietQR (Tự động sau 5s)
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg disabled:bg-gray-400 mt-4"
          >
            {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
          </button>
        </form>

        {/* 🛒 ĐƠN HÀNG CỦA BẠN */}
        <div className="bg-white p-6 rounded-2xl shadow-lg font-sans border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-3">
            🛒 Đơn hàng của bạn
          </h2>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.key || item.productId || item.id}
                  className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 transition rounded-xl p-3 shadow-sm"
                >
                  <img
                    src={item.imageUrl || item.image || "/no-image.png"}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg border object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm md:text-base line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Số lượng: x{item.quantity}
                    </p>
                    {item.quantityInStock === 0 && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Hết hàng
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-red-600 text-sm md:text-base whitespace-nowrap">
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                Không có sản phẩm nào được chọn.
              </p>
            )}
          </div>

          {/* Tổng tiền */}
          <div className="mt-6 space-y-3 text-sm md:text-base text-gray-700">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <strong>{cartTotal.toLocaleString("vi-VN")}đ</strong>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <strong>
                {shippingFee === 0
                  ? "Miễn phí"
                  : `${shippingFee.toLocaleString("vi-VN")}đ`}
              </strong>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between items-center text-lg font-extrabold text-red-600">
              <span>Tổng thanh toán:</span>
              <span>{grandTotal.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={() => navigate("/cart")}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              ← Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Modal QR */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {}}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 100 },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            border: "none",
            borderRadius: "10px",
            padding: "2rem",
            maxWidth: "400px",
            width: "90%",
          },
        }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quét mã để thanh toán</h2>
          <p className="text-gray-600 mb-2">
            Sử dụng App ngân hàng của bạn để quét mã VietQR bên dưới.
          </p>
          <p className="text-gray-600 mb-2 font-semibold">
            Đơn hàng sẽ tự động xác nhận sau 5 giây...
          </p>
          <div className="p-4 border rounded-lg inline-block my-4">
            {qrString ? (
              <QRCodeSVG value={qrString} size={256} />
            ) : (
              <p>Đang tạo mã...</p>
            )}
          </div>
          <p className="font-semibold">
            Tên tài khoản:{" "}
            <span className="text-blue-600">{BANK_INFO.ACCOUNT_NAME}</span>
          </p>
          <p className="font-semibold">
            Số tiền:{" "}
            <span className="text-red-600 font-bold text-lg">
              {grandTotal.toLocaleString("vi-VN")}đ
            </span>
          </p>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setIsSubmitting(false);
            }}
            className="w-full text-gray-500 text-sm py-2 mt-4"
          >
            Hủy bỏ
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;

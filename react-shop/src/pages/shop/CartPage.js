import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Không dùng useCart nữa để đồng bộ với CheckoutPage
// import { useCart } from "./CartContext"; 

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(true); // State cho "Chọn tất cả"
  const navigate = useNavigate();

  // Load giỏ hàng từ localStorage và thêm trạng thái 'selected'
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Mặc định, tất cả sản phẩm đều được chọn
    const itemsWithSelection = storedCart.map((item) => ({
      ...item,
      // Đảm bảo có key duy nhất (rất quan trọng cho React)
      key: item.key || `${item.id}-${item.size || ''}`, 
      productId: item.productId || item.id,
      selected: true, 
    }));
    
    setCartItems(itemsWithSelection);
  }, []);

  // Hàm chung để cập nhật state, localStorage và header
  const updateCart = (newCart) => {
    // Chỉ lưu những thông tin cơ bản vào localStorage
    const cartToStore = newCart.map(({ selected, ...item }) => item); // Bỏ 'selected'
    
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(cartToStore));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Xóa 1 sản phẩm
  const handleRemove = (key) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      const newCart = cartItems.filter((item) => item.key !== key);
      updateCart(newCart);
    }
  };

  // Thay đổi số lượng
  const handleQuantityChange = (key, delta) => {
    const newCart = cartItems.map((item) => {
      if (item.key === key) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(newCart);
  };

  // Xử lý khi chọn 1 sản phẩm
  const handleToggleSelect = (key) => {
    const newCart = cartItems.map((item) =>
      item.key === key ? { ...item, selected: !item.selected } : item
    );
    setCartItems(newCart); // Chỉ cập nhật state, không cần lưu vào localStorage
  };

  // Xử lý khi bấm "Chọn tất cả"
  const handleToggleSelectAll = () => {
    const newSelectAllState = !isAllSelected;
    const newCart = cartItems.map((item) => ({
      ...item,
      selected: newSelectAllState,
    }));
    setCartItems(newCart);
    setIsAllSelected(newSelectAllState);
  };

  // Tự động cập nhật "Chọn tất cả" nếu user tự tay chọn/bỏ chọn
  useEffect(() => {
    if (cartItems.length > 0 && cartItems.every((item) => item.selected)) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [cartItems]);

  // Tính tổng tiền chỉ dựa trên các sản phẩm đã chọn
  const totalPrice = cartItems
    .filter((item) => item.selected) // Chỉ lọc các item được chọn
    .reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  // Xử lý khi bấm nút Thanh toán
  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter((item) => item.selected);
    
    if (itemsToCheckout.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào để thanh toán.");
      return;
    }

    // Truyền các sản phẩm đã chọn sang trang Checkout
    navigate("/checkout", { state: { itemsToCheckout: itemsToCheckout } });
  };


  if (cartItems.length === 0)
    return (
      <div className="text-center text-gray-500 py-10">
        Giỏ hàng trống 🛒
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🛒 Giỏ hàng của bạn</h1>
      
      {/* Thanh "Chọn tất cả" */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            checked={isAllSelected}
            onChange={handleToggleSelectAll}
          />
          <span className="font-semibold text-gray-700">
            Chọn tất cả ({cartItems.length} sản phẩm)
          </span>
        </label>
        {/* (Nút xóa tất cả nếu muốn) */}
      </div>

      {/* Danh sách sản phẩm */}
      {cartItems.map((item) => (
        <div
          key={item.key} // Dùng key duy nhất
          className="flex flex-col md:flex-row items-center justify-between border rounded-lg p-4 shadow-sm bg-white"
        >
          {/* Checkbox + Hình ảnh + tên */}
          <div className="flex items-center space-x-4 w-full md:w-2/3">
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={item.selected}
              onChange={() => handleToggleSelect(item.key)}
            />
            <img
              src={item.image || "https://placehold.co/100x100"}
              alt={item.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="font-semibold text-lg">{item.name}</p>
              {item.size && (
                <p className="text-sm text-gray-500">
                  👟 Size: <span className="font-medium">{item.size}</span>
                </p>
              )}
              <p className="text-gray-500">
                {(Number(item.price) || 0).toLocaleString("vi-VN")} VND
              </p>
            </div>
          </div>

          {/* Số lượng + tổng tiền + xóa */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center border rounded">
              <button
                onClick={() => handleQuantityChange(item.key, -1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <span className="px-4">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.key, 1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <p className="font-bold text-red-600 w-28 text-right">
              {(item.price * item.quantity).toLocaleString("vi-VN")} VND
            </p>
            <button
              onClick={() => handleRemove(item.key)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
        </div>
      ))}

      {/* Tổng tiền + nút thanh toán */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-4">
        <div className="font-bold text-2xl">
          Tổng thanh toán (Các mục đã chọn): 
          <span className="text-red-600 ml-2">
            {totalPrice.toLocaleString("vi-VN")} VND
          </span>
        </div>
        <button
          onClick={handleCheckout} 
          className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:bg-gray-400"
          disabled={totalPrice === 0} // Vô hiệu hóa nếu không chọn gì
        >
          Thanh toán ngay 💳
        </button>
      </div>
    </div>
  );
};

export default CartPage;
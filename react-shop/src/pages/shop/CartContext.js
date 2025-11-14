import React, { createContext, useContext, useReducer, useEffect } from "react";

// 🛒 Tạo Context
const CartContext = createContext();

// 🧩 Các loại hành động
const ACTIONS = {
  ADD_TO_CART: "add-to-cart",
  REMOVE_FROM_CART: "remove-from-cart",
  UPDATE_QUANTITY: "update-quantity",
  CLEAR_CART: "clear-cart",
  LOAD_CART: "load-cart",
};

// ⚙️ Hàm reducer xử lý logic giỏ hàng
function cartReducer(cart, action) {
  let newCart = [];

  switch (action.type) {
    // ➕ Thêm sản phẩm
    case ACTIONS.ADD_TO_CART: {
      const { product, quantity } = action.payload;

      const existingIndex = cart.findIndex(
        (item) => item.productId === product.id
      );

      if (existingIndex > -1) {
        newCart = cart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [
          ...cart,
          {
            ...product,
            productId: product.id, // ✅ Dùng productId đồng bộ với backend
            uniqueKey: `${product.id}-${Date.now()}-${Math.random()}`, // 🔑 key duy nhất cho React
            quantity,
          },
        ];
      }
      break;
    }

    // ❌ Xóa sản phẩm
    case ACTIONS.REMOVE_FROM_CART: {
      newCart = cart.filter(
        (item) => item.productId !== action.payload.productId
      );
      break;
    }

    // 🔁 Cập nhật số lượng
    case ACTIONS.UPDATE_QUANTITY: {
      const { productId, newQuantity } = action.payload;
      newCart =
        newQuantity <= 0
          ? cart.filter((item) => item.productId !== productId)
          : cart.map((item) =>
              item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
            );
      break;
    }

    // 🧹 Xóa toàn bộ giỏ
    case ACTIONS.CLEAR_CART: {
      newCart = [];
      break;
    }

    // 🔄 Load giỏ từ localStorage
    case ACTIONS.LOAD_CART: {
      return action.payload.cart;
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }

  // 💾 Lưu vào localStorage
  localStorage.setItem("cart", JSON.stringify(newCart));
  return newCart;
}

// 🧠 Tạo Provider
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // 🪄 Load giỏ hàng khi mở trang
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);

      // ✅ Bổ sung productId & uniqueKey nếu thiếu (fix dữ liệu cũ)
      const fixedCart = parsed.map((item) => ({
        ...item,
        productId: item.productId || item.id,
        uniqueKey:
          item.uniqueKey || `${item.id}-${Date.now()}-${Math.random()}`,
      }));

      dispatch({
        type: ACTIONS.LOAD_CART,
        payload: { cart: fixedCart },
      });
    }
  }, []);

  // 🧩 Các hàm thao tác giỏ hàng
  const addToCart = (product, quantity = 1) =>
    dispatch({ type: ACTIONS.ADD_TO_CART, payload: { product, quantity } });

  const removeFromCart = (productId) =>
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: { productId } });

  const updateQuantity = (productId, newQuantity) =>
    dispatch({
      type: ACTIONS.UPDATE_QUANTITY,
      payload: { productId, newQuantity },
    });

  const clearCart = () => dispatch({ type: ACTIONS.CLEAR_CART });

  // 💰 Tính tổng tiền
  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  // 🚚 Phí vận chuyển
  const shippingFee = 25000;

  // 💵 Tổng thanh toán
  const grandTotal = cartTotal + shippingFee;

  // 🧮 Đếm tổng số sản phẩm
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // 🎁 Giá trị chia sẻ cho toàn app
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    shippingFee,
    grandTotal,
    cartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 🪝 Hook tùy chỉnh
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};

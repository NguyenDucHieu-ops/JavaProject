import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ✅ Layouts
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// ✅ ADMIN Pages
import ProductList from "./pages/products/ProductList";
import AdminDashboard from "./pages/admin/AdminDashboard"; // 👈 THÊM DÒNG NÀY
import ProductForm from "./pages/products/ProductForm";
import CategoryList from "./pages/categories/CategoryList";
import CategoryForm from "./pages/categories/CategoryForm";
import UserList from "./pages/users/UserList";
import UserEdit from "./pages/users/UserEdit";
import BannerList from "./pages/banners/BannerList";
import BannerForm from "./pages/banners/BannerForm";
import ProductStats from "./pages/products/ProductStats";
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
import ContactList from "./pages/contact/ContactList";
import ContactDetail from "./pages/contact/ContactDetail";
import ReviewListAdmin from "./pages/reviews/ReviewListAdmin";
import ReviewDetailAdmin from "./pages/reviews/ReviewDetailAdmin";

import ProductDetail from "./pages/products/ProductDetail"; // 👈 THÊM DÒNG NÀY

// ✅ AUTH Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserLogin from "./pages/auth_user/UserLogin";
import UserRegister from "./pages/auth_user/UserRegister";
import ForgotPassword from "./pages/auth_user/ForgotPassword";

// ✅ SHOP Pages
import HomePage from "./pages/shop/HomePage";
import ProductListPage from "./pages/shop/ProductListPage";
import ProductDetailPage from "./pages/shop/ProductDetailPage";
import CartPage from "./pages/shop/CartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import PaymentSuccess from "./pages/shop/PaymentSuccess";
import OrderHistory from "./pages/shop/OrderHistory";
import AccountInfo from "./pages/shop/AccountInfo";
import ContactForm from "./pages/shop/ContactForm";
import SiteReviewForm from "./pages/shop/SiteReviewForm";
import SiteReviewList from "./pages/shop/SiteReviewList";
import MySupportTickets from "./pages/shop/MySupportTickets";

// ✅ Middleware
import AdminRoute from "./middleware/AdminRoute";

// ✅ AuthGuard
const AuthGuard = ({ children, allowedRoles = [] }) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");
  const adminRole = localStorage.getItem("adminRole");
  const userRole = localStorage.getItem("userRole");
  const role = (adminRole || userRole || "").toUpperCase();
  const token = role === "ROLE_ADMIN" ? adminToken : userToken;

  // Nếu route có yêu cầu quyền mà người dùng chưa có token
  if (allowedRoles.length > 0) {
    if (!token) {
      if (allowedRoles.includes("ROLE_ADMIN")) return <Navigate to="/login" replace />;
      return <Navigate to="/user/login" replace />;
    }

    // Nếu vai trò không phù hợp
    if (!allowedRoles.includes(role)) {
      if (role === "ROLE_USER") return <Navigate to="/home" replace />;
      if (role === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// ✅ Route mặc định
const getDefaultRoute = () => {
  const token = localStorage.getItem("accessToken");
  const userRole = (localStorage.getItem("userRole") || "").toUpperCase();

  if (!token) return "/home";
  if (userRole === "ROLE_ADMIN") return "/admin";
  return "/home";
};

// ✅ App Component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 ADMIN AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword isAdmin={true} />} />

        {/* 🔐 USER AUTH */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/forgot-password" element={<ForgotPassword isAdmin={false} />} />

        {/* 🌐 DEFAULT */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* 🧭 ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route index element={<div className="p-6 text-center">👋 Chào Admin</div>} />

          {/* Banners */}
          <Route path="banners" element={<BannerList />} />
          <Route path="banners/add" element={<BannerForm />} />
          <Route path="banners/edit/:id" element={<BannerForm />} />

          {/* Products */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id" element={<ProductDetail />} /> {/* 👈 THÊM DÒNG NÀY */}

          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="stats" element={<ProductStats />} />

          {/* Categories */}
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />

          {/* Users */}
          <Route path="users" element={<UserList />} />
          <Route path="users/:id/edit" element={<UserEdit />} />

          {/* Orders */}
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />

          {/* Contacts */}
          <Route path="contacts" element={<ContactList />} />
          <Route path="contacts/:id" element={<ContactDetail />} />

          {/* Reviews */}
          <Route path="reviews" element={<ReviewListAdmin />} />
          <Route path="reviews/:id" element={<ReviewDetailAdmin />} />
        </Route>

        {/* 🛍️ USER ROUTES */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />

          {/* Category viewer (chỉ hiển thị, không chỉnh sửa) */}
          <Route path="categories" element={<CategoryList isUserView />} />

          {/* Giỏ hàng và thanh toán */}
          <Route
            path="cart"
            element={
              <AuthGuard allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                <CartPage />
              </AuthGuard>
            }
          />
          <Route
            path="checkout"
            element={
              <AuthGuard allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                <CheckoutPage />
              </AuthGuard>
            }
          />
          <Route path="payment/success" element={<PaymentSuccess />} />

          {/* Đơn hàng */}
          <Route
            path="orders"
            element={
              <AuthGuard allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                <OrderHistory />
              </AuthGuard>
            }
          />

          {/* Tài khoản */}
          <Route
            path="tai-khoan"
            element={
              <AuthGuard allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                <AccountInfo />
              </AuthGuard>
            }
          />

          {/* Đánh giá website */}
          <Route
            path="danh-gia-web"
            element={
              <AuthGuard allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                <SiteReviewForm />
              </AuthGuard>
            }
          />
          <Route path="xem-danh-gia" element={<SiteReviewList />} />

          {/* Liên hệ / Hỗ trợ */}
          <Route path="lien-he" element={<ContactForm />} />
          <Route
            path="ho-tro"
            element={
              <AuthGuard allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                <MySupportTickets />
              </AuthGuard>
            }
          />
        </Route>

        {/* 🚫 404 */}
        <Route
          path="*"
          element={
            <div className="text-center mt-20 text-xl font-bold text-red-500">
              🚫 404 - Không tìm thấy trang
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// src/layouts/UserLayout.js
// 📋 THAY THẾ TOÀN BỘ FILE

import React, { useState, useEffect, Fragment, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import productApi from "../api/productApi";
import userApi from "../api/userApi"; // ✅ Import userApi

// ✅ Hàm helper để lấy URL ảnh
const getImageUrl = (path) => {
  if (!path) return null; 
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

const UserLayout = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef();

  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem("userName") || "",
    username: localStorage.getItem("userUsername") || "",
    email: localStorage.getItem("userEmail") || "",
    avatar: localStorage.getItem("userAvatar") || null,
  });

  const isLoggedIn = Boolean(localStorage.getItem("userToken"));

  // ✅ CẬP NHẬT: Lấy thông tin user từ API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const response = await userApi.getProfile();
          
          // ✅ SỬA LỖI: Bỏ .data vì axiosClient đã trả về data
          const data = response; 
          
          const profileData = {
            name: data.name || data.username,
            username: data.username,
            email: data.email,
            avatar: data.avatar,
          };
          setUserInfo(profileData);
          
          // Cập nhật lại localStorage
          localStorage.setItem("userName", profileData.name);
          localStorage.setItem("userUsername", profileData.username);
          localStorage.setItem("userEmail", profileData.email);
          localStorage.setItem("userAvatar", profileData.avatar || "");

        } catch (error) {
          console.error("Lỗi khi lấy profile:", error);
          if (error.response && error.response.status === 401) {
            handleLogout(); // Gọi hàm logout đã sửa
          }
        }
      }
    };
    fetchUserProfile();
  // ✅ SỬA LỖI: Thêm dependency array để gọi lại khi logout/login
  }, [isLoggedIn]); 

  // Cập nhật giỏ hàng (Code cũ của bạn)
  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalQty = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalQty);
  };
  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  // Đóng dropdown (Code cũ của bạn)
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ĐĂNG XUẤT (ĐÃ SỬA LỖI)
const handleLogout = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userUsername");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userAvatar");

  window.location.href = "/home"; // Hoặc navigate("/home") nếu muốn
};
  

  // ✅ Tìm kiếm (Code cũ của bạn)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/products");
    }
    setShowSuggestions(false);
  };

  // ✅ Gợi ý sản phẩm khi nhập (Code cũ của bạn)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim() === "") {
        setSuggestions([]);
        return;
      }
      try {
        const data = await productApi.search(searchTerm); // API này của bạn tự trả về data
        setSuggestions(data.slice(0, 5));
      } catch {
        setSuggestions([]);
      }
    };
    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ HEADER */}
      <header className="sticky top-0 z-50 bg-[#0032A0] text-white shadow-md">
        <nav className="flex justify-between items-center px-6 md:px-12 py-3 max-w-7xl mx-auto">
          {/* Logo (Code cũ của bạn) */}
          <Link to="/home" className="text-2xl font-bold tracking-wide">
            DECASHOP
          </Link>

          {/* Menu desktop (Code cũ của bạn) */}
          <div className="hidden md:flex space-x-8 font-medium">
            <Link to="/home" className="hover:text-yellow-400">Trang chủ</Link>
            <Link to="/products" className="hover:text-yellow-400">Sản phẩm</Link>
            <Link to="/categories" className="hover:text-yellow-400">Danh mục</Link>
            <Link to="/about" className="hover:text-yellow-400">Giới thiệu</Link>
          </div>

          {/* Thanh tìm kiếm (Code cũ của bạn) */}
          <form
            onSubmit={handleSearch}
            className="relative w-40 sm:w-64 md:w-72 text-black"
          >
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-3 py-1.5 rounded-lg focus:outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute bg-white border rounded-lg shadow-md mt-1 w-full z-50">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      navigate(`/product/${item.id}`);
                      setShowSuggestions(false);
                      setSearchTerm("");
                    }}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-700"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Giỏ hàng + Auth + User Info */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative text-2xl">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <Fragment>
                {/* Avatar/tên user */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfile((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-yellow-300 text-[#0032A0] hover:bg-yellow-400 transition"
                  >
                    <span className="font-semibold">
                      {userInfo.name || userInfo.username}
                    </span>
                    
                    {/* ✅ CẬP NHẬT: Hiển thị Avatar thật */}
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold overflow-hidden">
                      {userInfo.avatar ? (
                        <img 
                          src={getImageUrl(userInfo.avatar)} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (userInfo.name || userInfo.username).charAt(0).toUpperCase()
                      )}
                    </span>

                  </button>

                  {/* Dropdown (Code cũ của bạn) */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-lg border z-50 py-2">
                      <div className="px-4 py-2 border-b">
                        <div className="font-bold text-lg mb-1">
                          {userInfo.name || userInfo.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userInfo.email}
                        </div>
                      </div>
                      <nav className="py-2">
                        <Link to="/tai-khoan" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Thông tin tài khoản
                        </Link>
                        <Link to="/orders" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Lịch sử đơn hàng
                        </Link>
                        <Link to="/ho-tro" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Hỗ trợ của tôi
                        </Link>
                        <Link to="/lien-he" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Gửi yêu cầu mới
                        </Link>
                        <Link to="/danh-gia-web" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Gửi đánh giá Web
                        </Link>
                        <Link to="/xem-danh-gia" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Xem đánh giá
                        </Link>
                      </nav>
                      <div className="px-4 py-2 border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full bg-yellow-400 text-[#0032A0] py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Fragment>
            ) : (
              <>
                <Link to="/user/login" className="bg-yellow-400 text-[#0032A0] px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-300 transition">
                  Đăng nhập
                </Link>
                <Link to="/user/register" className="border border-yellow-400 text-yellow-400 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-100 hover:text-[#0032A0] transition">
                  Đăng ký
                </Link>
              </>
            )}

            {/* Menu mobile (Code cũ của bạn) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-2xl focus:outline-none"
            >
              ☰
            </button>
          </div>
        </nav>

        {/* MENU MOBILE (Code cũ của bạn) */}
        {menuOpen && (
          <div className="md:hidden bg-white text-[#0032A0] border-t shadow-lg">
             <Link to="/home" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/products" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
              Sản phẩm
            </Link>
            <Link to="/categories" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
              Danh mục
            </Link>
            <Link to="/cart" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
              Giỏ hàng
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/tai-khoan" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Tài khoản
                </Link>
                <Link to="/orders" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Lịch sử đơn hàng
                </Link>
                <Link to="/ho-tro" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Hỗ trợ của tôi
                </Link>
                <Link to="/lien-he" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Gửi yêu cầu mới
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-red-50 text-red-600 font-medium"
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <Link to="/user/login" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/user/register" className="block px-6 py-3 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* ✅ NỘI DUNG */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-8 w-full">
        <Outlet />
      </main>

      {/* ✅ FOOTER (Code cũ của bạn) */}
      <footer className="bg-[#0032A0] text-white py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Về DecaShop</h3>
            <p className="text-sm text-gray-200">
              Mua sắm thể thao dễ dàng, giá tốt, chất lượng chuẩn quốc tế.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Liên hệ</h3>
            <ul className="text-sm text-gray-200 space-y-1">
              <li>📞 0123 456 789</li>
              <li>📧 support@decashop.com</li>
              <li>🏠 TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Theo dõi chúng tôi</h3>
            <div className="flex space-x-4 text-2xl">
              <a href="#" className="hover:text-yellow-400">🌐</a>
              <a href="#" className="hover:text-yellow-400">📸</a>
              <a href="#" className="hover:text-yellow-400">📘</a>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-300 text-sm mt-6">
          © {new Date().getFullYear()} DecaShop. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default UserLayout;
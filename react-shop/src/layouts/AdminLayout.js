import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // ✅ CẬP NHẬT: Lấy state ban đầu từ localStorage
  const [adminInfo, setAdminInfo] = useState({
    name: localStorage.getItem("adminName") || "",
    username: localStorage.getItem("adminUsername") || "",
    email: localStorage.getItem("adminEmail") || "",
  });

  // ✅ Kiểm tra quyền truy cập admin
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminRole = localStorage.getItem("adminRole");
    const adminUsername = localStorage.getItem("adminUsername");
    const adminEmail = localStorage.getItem("adminEmail");
    const adminName = localStorage.getItem("adminName");

    if (!adminToken || adminRole !== "ROLE_ADMIN") {
      navigate("/login");
    } else {
      // ✅ CẬP NHẬT: Chỉ set state nếu nó đang rỗng (tránh lặp vô hạn)
      if (!adminInfo.username) {
        setAdminInfo({
          name: adminName || adminUsername || "",
          username: adminUsername || "",
          email: adminEmail || "",
        });
      }
    }
  // ✅ CẬP NHẬT: Thêm dependency để nó chạy lại khi state thay đổi
  }, [navigate, adminInfo.username]); 

  // ✅ HÀM ĐĂNG XUẤT (ĐÃ SỬA LỖI)
const handleLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRole");
  localStorage.removeItem("adminUsername");
  localStorage.removeItem("adminEmail");
  localStorage.removeItem("adminName");

  navigate("/login"); // Hoặc window.location.href = "/login";
};


  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-extrabold tracking-wider">🛒 React Shop Admin</h2>
        </div>

        {/* Thông tin tài khoản admin */}
        <div className="p-4 border-b border-gray-700 text-sm">
          <div className="mb-2 font-semibold">Tài khoản:</div>
          <div>👤 {adminInfo.username}</div>
          <div>📧 {adminInfo.email}</div>
        </div>

        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-red-300 group-hover:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7m-7-7v14"
                  ></path>
                </svg>
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/admin/products"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-indigo-300 group-hover:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-4-4v0a4 4 0 00-4 4v4m-4 7h16a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                Quản lý Sản phẩm
              </Link>
            </li>

            <li>
              <Link
                to="/admin/categories"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-yellow-300 group-hover:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                Quản lý Danh mục
              </Link>
            </li>

            <li>
              <Link
                to="/admin/banners"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-pink-300 group-hover:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5h18M3 19h18M5 5v14m14-14v14M9 9h6v6H9z"
                  ></path>
                </svg>
                Quản lý Banner
              </Link>
            </li>

            <li>
              <Link
                to="/admin/users"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-300 group-hover:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A9 9 0 1119.88 6.195a9 9 0 01-14.758 11.609z"
                  ></path>
                </svg>
                Quản lý Người dùng
              </Link>
            </li>

            <li>
              <Link
                to="/admin/orders"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-blue-300 group-hover:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h18M9 3v18M15 3v18M3 9h18M3 15h18"
                  ></path>
                </svg>
                Quản lý Đơn hàng
              </Link>
            </li>
            
            <li>
              <Link
                to="/admin/contacts"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-3 text-cyan-300 group-hover:text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-1.414 0l-1.414-1.414A1 1 0 009.586 13H4"
                  ></path>
                </svg>
                Quản lý Hỗ trợ
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reviews"
                className="group flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                <svg 
                  className="w-5 h-5 mr-3 text-yellow-300 group-hover:text-yellow-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                Quản lý Đánh giá
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header với thông tin admin ở góc phải */}
        <header className="mb-8 p-4 bg-white shadow rounded-lg flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-700">Trang Quản Trị</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-semibold text-indigo-700">{adminInfo.name}</div>
              <div className="text-xs text-gray-500">{adminInfo.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
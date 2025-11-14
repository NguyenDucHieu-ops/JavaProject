import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/AuthApi";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  // ✅ MỚI: State lỗi
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminRole = localStorage.getItem("adminRole");
    if (adminToken && adminRole === "ROLE_ADMIN") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi khi gõ
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  }

  // ✅ MỚI: Hàm validate
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Tên đăng nhập không được trống";
    if (!formData.password) newErrors.password = "Mật khẩu không được trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ MỚI: Kiểm tra validate
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Xóa lỗi cũ

    try {
      const res = await authApi.login(formData);
      const data = res;
      const token = data?.token || data?.accessToken || data?.jwt;

      if (!token) throw new Error("Token không hợp lệ hoặc không tồn tại!");

      const role = data?.role || "ROLE_USER";

      if (data?.role?.toUpperCase() === "ROLE_ADMIN") {
        // ✅ Lưu ý: File API cũ của bạn không lưu token admin
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminRole", role);
        toast.success("🎉 Đăng nhập admin thành công!");
        navigate("/admin");
        return;
      }

      toast.error("Tài khoản này không phải admin. Vui lòng dùng trang đăng nhập người dùng!");
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error.response?.data || error.message);
      
      // ✅ MỚI: Xử lý lỗi 400 (validate) hoặc 401 (sai pass)
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Sai tên đăng nhập hoặc mật khẩu." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-200">
      <Toaster /> {/* ✅ Thêm Toaster để toast hoạt động */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Đăng nhập hệ thống
        </h2>

        {/* ✅ MỚI: Hiển thị lỗi chung */}
        {errors.general && (
          <p className="text-center mb-4 font-medium text-red-600">
            {errors.general}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Tên đăng nhập</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={validateForm} // ✅ Thêm onBlur
              className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={validateForm} // ✅ Thêm onBlur
              className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:underline font-semibold bg-transparent border-none p-0"
              onClick={() => navigate("/admin/forgot-password")}
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
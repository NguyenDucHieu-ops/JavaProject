import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authUserApi from "../../api/authUserApi";
import toast, { Toaster } from "react-hot-toast";

const UserLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  // ✅ MỚI: State lỗi
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const res = await authUserApi.login(formData);

      if (res.role === "ROLE_ADMIN") {
        toast.error("Vui lòng sử dụng trang đăng nhập admin!");
        setLoading(false); // ✅ Nhớ dừng loading
        return;
      }

      localStorage.setItem("userToken", res.token);
      localStorage.setItem("userRole", res.role);

      toast.success("🎉 Đăng nhập thành công!");
      navigate("/home");
    } catch (err) {
      // ✅ MỚI: Xử lý lỗi 400 (validate) hoặc 401 (sai pass)
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data);
      } else {
        toast.error("❌ Sai tên đăng nhập hoặc mật khẩu!");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-200">
      <Toaster />
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-[400px]">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              name="username"
              type="text"
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              onBlur={validateForm} // ✅ Thêm onBlur
              required
              className={`border rounded-lg p-3 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              onBlur={validateForm} // ✅ Thêm onBlur
              required
              className={`border rounded-lg p-3 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="text-right">
            <Link to="/user/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
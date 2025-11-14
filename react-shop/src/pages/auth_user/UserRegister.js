import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authUserApi from "../../api/authUserApi";
import toast, { Toaster } from "react-hot-toast";

const UserRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "", // ✅ Thêm trường xác nhận
  });
  
  // ✅ MỚI: State để chứa lỗi
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi khi người dùng bắt đầu gõ
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // ✅ MỚI: Hàm validate phía frontend
  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!formData.username) newErrors.username = "Tên đăng nhập không được trống";
    else if (formData.username.length < 3) newErrors.username = "Tên đăng nhập phải ít nhất 3 ký tự";

    if (!formData.name) newErrors.name = "Họ tên không được trống";
    
    if (!formData.email) newErrors.email = "Email không được trống";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không đúng định dạng";

    if (!formData.phoneNumber) newErrors.phoneNumber = "Số điện thoại không được trống";
    else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)";

    if (!formData.address) newErrors.address = "Địa chỉ không được trống";

    if (!formData.password) newErrors.password = "Mật khẩu không được trống";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải ít nhất 6 ký tự";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ MỚI: Kiểm tra validate trước khi gửi
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setLoading(true);
    setErrors({}); // Xóa lỗi cũ
    
    try {
      // ✅ Bỏ confirmPassword khỏi dữ liệu gửi đi
      const { confirmPassword, ...dataToSend } = formData;
      await authUserApi.register(dataToSend);
      toast.success("🎉 Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      setTimeout(() => navigate("/user/login"), 1200);
    } catch (err) {
      console.error(err);
      
      // ✅ MỚI: Nhận lỗi 400 từ backend
      if (err.response && err.response.status === 400) {
        // err.response.data là { "username": "Tên đăng nhập đã tồn tại" }
        setErrors(err.response.data);
        toast.error("Thông tin không hợp lệ hoặc đã tồn tại!");
      } else {
        toast.error("❌ Đăng ký thất bại! Lỗi máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ MỚI: Hàm xử lý onBlur
  const handleBlur = (e) => {
    validateForm(); // Kiểm tra khi người dùng rời khỏi ô
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 to-emerald-200">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-[420px] border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-700">
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              name="username"
              type="text"
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur} // ✅ Thêm onBlur
              required
              className={`border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {/* ✅ Thêm hiển thị lỗi */}
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <input
              name="name"
              type="text"
              placeholder="Họ và tên"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              name="phoneNumber"
              type="text"
              placeholder="Số điện thoại"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <input
              name="address"
              type="text"
              placeholder="Địa chỉ nhận hàng"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          
          {/* ✅ MỚI: Thêm ô Confirm Password */}
          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            } text-white font-semibold py-3 rounded-lg transition duration-200`}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700">
          Đã có tài khoản?{" "}
          <button
            onClick={() => navigate("/user/login")}
            className="text-green-600 hover:underline font-semibold"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
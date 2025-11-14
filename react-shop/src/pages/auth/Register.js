import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/AuthApi";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (formData.password !== formData.confirmPassword)
      return "❌ Mật khẩu xác nhận không khớp.";
    if (formData.password.length < 6)
      return "❌ Mật khẩu phải có ít nhất 6 ký tự.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await authApi.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        name: formData.name || formData.username,
        role: "USER",
      });
      setMessage({
        type: "success",
        text: "✅ Đăng ký thành công! Vui lòng đăng nhập.",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "❌ Đăng ký thất bại. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          Đăng ký tài khoản
        </h2>

        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Tên đăng nhập</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Họ tên</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Xác nhận mật khẩu</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-green-600 font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

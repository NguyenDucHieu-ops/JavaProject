import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

const ForgotPassword = ({ isAdmin }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();        // <<<<<< GIỮ LẠI NÀY
    setLoading(true);

    try {
      await axiosClient.post("/users/forgot-password/send-otp", {
        usernameOrEmail,
      });

      setOtpSent(true);
      toast.success("OTP đã được gửi!");
    } catch (err) {
      toast.error("Không tìm thấy tài khoản!");
    }

    setLoading(false);
  };

  // ✅ Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/users/forgot-password/reset", {
        usernameOrEmail,
        otp,
        newPassword,
      });

      toast.success("Đặt lại mật khẩu thành công!");
      // Chuyển về trang đăng nhập sau khi đổi mật khẩu
      if (isAdmin) {
        navigate("/login");
      } else {
        navigate("/user/login");
      }
    } catch (error) {
      toast.error("OTP không đúng hoặc lỗi!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        {isAdmin ? "Quên mật khẩu Admin" : "Quên mật khẩu"}
      </h2>

      {!otpSent ? (
        <form onSubmit={handleSendOtp}>
          <input
            type="text"
            placeholder="Nhập email hoặc tên đăng nhập"
            className="w-full p-3 border rounded-lg mb-4"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Đang gửi..." : "Gửi OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            className="w-full p-3 border rounded-lg mb-3"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="w-full p-3 border rounded-lg mb-3"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border rounded-lg mb-4"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

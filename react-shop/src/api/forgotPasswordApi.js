// src/api/forgotPasswordApi.js
import axiosClient from "./axiosClient";

const API_URL = "/auth/user";

const forgotPasswordApi = {
  // Gửi OTP qua email hoặc username
  sendOtp: (usernameOrEmail) =>
    axiosClient.post(`${API_URL}/forgot-password`, { usernameOrEmail }),

  // Reset mật khẩu với OTP
  resetPassword: (data) =>
    axiosClient.post(`${API_URL}/reset-password`, data),
};

export default forgotPasswordApi;

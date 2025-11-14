import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [message, setMessage] = useState(null);

  // ✅ Lấy thông tin user khi component load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userApi.get(id);
        setUser(data);
      } catch (err) {
        console.error("Lỗi tải thông tin người dùng:", err);
        setMessage({
          type: "error",
          text: "❌ Không thể tải thông tin người dùng.",
        });
      }
    };
    fetchUser();
  }, [id]);

  // ✅ Cập nhật state khi nhập form
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ Submit form để cập nhật user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await userApi.update(id, {
        username: user.username,
        email: user.email,
        role: user.role,
      });

      console.log("Kết quả cập nhật:", res);
      setMessage({ type: "success", text: "✅ Cập nhật thành công!" });

      // Điều hướng sau khi thành công
      setTimeout(() => navigate("/admin/users"), 1000);
    } catch (err) {
      console.error("Lỗi khi cập nhật người dùng:", err);
      setMessage({ type: "error", text: "❌ Cập nhật thất bại." });
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl max-w-lg mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chỉnh sửa người dùng
      </h2>

      {/* ✅ Hiển thị thông báo */}
      {message && (
        <div
          className={`p-3 rounded-md mb-3 ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ✅ Form chỉnh sửa */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            name="username"
            value={user.username || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={user.email || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Quyền</label>
          <select
            name="role"
            value={user.role || "ROLE_USER"}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="ROLE_USER">ROLE_USER</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};

export default UserEdit;

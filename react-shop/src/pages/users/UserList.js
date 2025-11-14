import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import userApi from "../../api/userApi"; // ✅ API người dùng

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // ✅ Tải danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await userApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setMessage({ type: "error", text: "❌ Không thể tải danh sách người dùng." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Xử lý xóa người dùng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      await userApi.delete(id);
      setMessage({ type: "success", text: "✅ Xóa người dùng thành công!" });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      const status = err.response?.status;
      if (status === 404)
        setMessage({ type: "error", text: "❌ Người dùng không tồn tại (404)" });
      else if (status >= 500)
        setMessage({ type: "error", text: "❌ Lỗi máy chủ (500)" });
      else setMessage({ type: "error", text: "❌ Xóa thất bại." });
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-3">
        Quản lý Người dùng
      </h2>

      {/* Thông báo */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border border-red-400"
              : "bg-green-100 text-green-700 border border-green-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-500">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Không có người dùng nào.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase border-b border-gray-300">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase border-b border-gray-300">
                  Tên đăng nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase border-b border-gray-300">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase border-b border-gray-300">
                  Quyền
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase border-b border-gray-300 w-32">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id ?? user._id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-3 text-gray-700 text-sm">
                    {user.id ?? user._id}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {user.username || "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {user.email || "-"}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-700">
                    {user.role || "user"}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link to={`/admin/users/${user.id ?? user._id}/edit`}>
                        <button className="bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 transition">
                          Sửa
                        </button>
                      </Link>
                      <button
                        className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
                        onClick={() => handleDelete(user.id ?? user._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;

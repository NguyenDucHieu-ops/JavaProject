import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import bannerApi from "../../api/bannerApi";

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await bannerApi.getAll();
      setBanners(res);
    } catch (err) {
      console.error("❌ Lỗi tải banner:", err);
      setMessage({ type: "error", text: "❌ Không thể tải danh sách banner" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      await bannerApi.delete(id);
      setMessage({ type: "success", text: "✅ Xóa banner thành công!" });
      fetchBanners();
    } catch (err) {
      console.error("❌ Lỗi xóa banner:", err);
      setMessage({ type: "error", text: "❌ Xóa banner thất bại" });
    }
  };

const getImageUrl = (b) => {
  if (!b.image) return "/placeholder.png";
  if (b.image.startsWith("http")) return b.image;
  return `http://localhost:8080${b.image}`;
};


  return (
    <div className="p-6 bg-white shadow-lg rounded-xl space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-3">
        Quản lý Banner
      </h2>

      <div>
        <Link to="/admin/banners/add">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
            ➕ Thêm banner
          </button>
        </Link>
      </div>

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
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                  Ảnh
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                  Tiêu đề
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b text-center">
                  Hiển thị
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Không có banner nào
                  </td>
                </tr>
              ) : (
                banners.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <img
                        src={getImageUrl(b)}
                        alt={b.title}
                        className="w-32 h-20 object-cover rounded-md border"
                      />
                    </td>
                    <td className="px-4 py-2 font-semibold text-gray-800">
                      {b.title}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {b.status ? "✅" : "❌"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Link to={`/admin/banners/edit/${b.id}`}>
                          <button className="bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 transition">
                            Sửa
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

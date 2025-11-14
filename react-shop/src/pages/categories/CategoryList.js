import React, { useEffect, useState } from "react";
import categoryApi from "../../api/categoryApi";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:8080"; // ✅ Thêm dòng này

// =============================
// 1️⃣ Card cho User xem
// =============================
const CategoryCard = ({ category }) => (
  <Link
    to={`/products?category=${category.id}`}
    className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 group"
  >
    {category.imageUrl && (
      <img
        src={
          category.imageUrl?.startsWith("http")
            ? category.imageUrl
            : BASE_URL + category.imageUrl
        }
        alt={category.name}
        className="w-full h-40 object-cover rounded-lg mb-3"
      />
    )}
    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 text-center">
      {category.name}
    </h3>
  </Link>
);

// =============================
// 2️⃣ Table cho Admin
// =============================
const AdminCategoryTable = ({ items, handleDelete, error, successMessage }) => (
  <div className="p-6 bg-white shadow-lg rounded-xl">
    <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-3">
      Quản lý Danh mục
    </h2>

    <Link to="/admin/categories/new">
      <button className="mb-6 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200">
        Thêm danh mục
      </button>
    </Link>

    {error && (
      <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded-lg">
        {error}
      </div>
    )}
    {successMessage && (
      <div className="p-3 mb-4 bg-green-100 text-green-700 border border-green-400 rounded-lg">
        {successMessage}
      </div>
    )}

    {items.length === 0 ? (
      <div className="text-center py-4 text-gray-500 border border-dashed rounded-lg">
        Không có dữ liệu
      </div>
    ) : (
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                Tên Danh mục
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  {c.imageUrl ? (
                    <img
                      src={
                        c.imageUrl?.startsWith("http")
                          ? c.imageUrl
                          : BASE_URL + c.imageUrl
                      }
                      alt={c.name}
                      className="h-14 w-14 object-cover rounded-lg border"
                    />
                  ) : (
                    <span className="text-gray-400 italic">Không có ảnh</span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {c.name}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <Link
                      to={`/admin/categories/${c.id}/edit`}
                      className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition duration-150"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition duration-150"
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

// =============================
// 3️⃣ Component chính
// =============================
const CategoryList = ({ isUserView = false }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await categoryApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryApi.delete(id);
        setSuccessMessage("Xóa danh mục thành công!");
        load();
        setTimeout(() => setSuccessMessage(""), 2000);
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  if (isUserView) {
    if (loading) return <div className="text-center py-10">Đang tải danh mục...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh mục Sản phẩm</h1>
        {items.length === 0 ? (
          <p className="text-center text-gray-500">Không có danh mục nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminCategoryTable
      items={items}
      handleDelete={handleDelete}
      error={error}
      successMessage={successMessage}
    />
  );
};

export default CategoryList;

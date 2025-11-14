import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import categoryApi from "../../api/categoryApi";

const CategoryForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location.pathname.includes("/edit");

  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // 🆕 Mô tả
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);

  // 🧩 Khi chỉnh sửa -> load dữ liệu cũ
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await categoryApi.getById(id);
        setName(data.name || "");
        setDescription(data.description || ""); // 🆕 hiển thị mô tả cũ
        setPreview(data.imageUrl || null);
      } catch (err) {
        setMessage({ type: "error", text: "Không load được dữ liệu" });
      }
    })();
  }, [id, isEdit]);

  // 🖼️ Xem trước ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 💾 Gửi form lên server
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage({ type: "error", text: "Tên không được rỗng" });
      return;
    }

    const formData = new FormData();

    // ✅ Gửi phần JSON đúng kiểu backend cần: @RequestPart("category")
    const categoryData = {
      name: name,
      description: description,
    };

    formData.append(
      "category",
      new Blob([JSON.stringify(categoryData)], { type: "application/json" })
    );

    // ✅ Gửi file nếu có
    if (image) formData.append("file", image);

    try {
      if (isEdit) await categoryApi.update(id, formData);
      else await categoryApi.create(formData);

      setMessage({ type: "success", text: "Lưu danh mục thành công!" });
      setTimeout(() => navigate("/admin/categories"), 1500);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Lưu thất bại" });
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-3">
        {isEdit ? "Sửa danh mục" : "Thêm danh mục"}
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border border-red-400"
              : "bg-green-100 text-green-700 border border-green-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🏷️ Tên danh mục */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tên danh mục:
          </label>
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên danh mục"
          />
        </div>

        {/* 📝 Mô tả */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mô tả danh mục:
          </label>
          <textarea
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả cho danh mục"
            rows={3}
          />
        </div>

        {/* 🖼️ Ảnh */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ảnh danh mục:
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 h-32 w-full object-cover rounded-lg border"
            />
          )}
        </div>

        {/* 🔘 Nút */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;

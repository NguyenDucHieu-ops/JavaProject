import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bannerApi from "../../api/bannerApi";

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", status: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      loadBanner(id);
    }
  }, [id]);

  const loadBanner = async (id) => {
    try {
      const data = await bannerApi.getOne(id);
      setForm({
        title: data.title,
        description: data.description,
        status: data.status,
        imageUrl: data.imageUrl,
      });
      if (data.imageUrl) {
        setPreview(`http://localhost:8080${data.imageUrl}`);
      }
    } catch (err) {
      console.error("❌ Lỗi tải banner:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const bannerData = {
        title: form.title,
        description: form.description,
        status: form.status,
      };
      formData.append("banner", new Blob([JSON.stringify(bannerData)], { type: "application/json" }));
      if (file) formData.append("file", file);

      if (isEdit) {
        await bannerApi.update(id, formData);
        alert("✅ Cập nhật banner thành công!");
      } else {
        await bannerApi.create(formData);
        alert("✅ Thêm banner thành công!");
      }
      navigate("/admin/banners");
    } catch (err) {
      console.error("❌ Lỗi lưu banner:", err);
      alert("❌ Lưu banner thất bại!");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isEdit ? "✏️ Sửa banner" : "➕ Thêm banner"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Nhập tiêu đề banner..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Nhập mô tả ngắn..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Ảnh banner
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {preview && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-1">Xem trước ảnh:</p>
            <img
              src={preview}
              alt="preview"
              className="rounded-lg shadow border w-full max-h-60 object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="status"
            type="checkbox"
            name="status"
            checked={form.status}
            onChange={handleChange}
          />
          <label htmlFor="status" className="text-gray-700">
            Hiển thị banner
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
          >
            {isEdit ? "💾 Cập nhật" : "➕ Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productApi from "../../api/productApi";
import categoryApi from "../../api/categoryApi";
import imageService from "../../api/imageService"; // 👈 MỚI: Thêm import
import ProductSizeList from "./ProductSizeList";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";

  // 👈 CẬP NHẬT: Bổ sung state cho các trường
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    imageUrl: "", // Để admin dán link
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false); // 👈 MỚI: Thêm loading state
  const [file, setFile] = useState(null); // file ảnh
  const [preview, setPreview] = useState(null); // xem trước ảnh

  // ✅ Hàm xử lý đường dẫn ảnh
  const getImageUrl = (img) => {
    // ... (code cũ giữ nguyên) ...
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `http://localhost:8080/${cleanPath}`;
  };

  // Load danh mục
  useEffect(() => {
    (async () => {
      try {
        const cats = await categoryApi.getAll();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error("Không lấy được danh mục", err);
      }
    })();
  }, []);

  // Load sản phẩm nếu edit
  useEffect(() => {
    if (!isEdit) return;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const p = await productApi.getById(id);
        // 👈 CẬP NHẬT: set đầy đủ form
        setForm({
          name: p.name ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          quantity: p.quantity ?? "",
          imageUrl: p.imageUrl ?? "",
          categoryId: p.categoryId ?? p.category?.id ?? "",
        });
        setPreview(getImageUrl(p.imageUrl));
      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
        setMessage({
          type: "error",
          text: "Không load được dữ liệu sản phẩm",
        });
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, isEdit]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null); // xem trước ảnh mới chọn
  };

  const validate = () => {
    if (!form.name.trim()) return "Tên sản phẩm không được để trống";
    if (Number(form.price) <= 0 || form.price === "")
      return "Giá phải lớn hơn 0";
    if (Number(form.quantity) < 0 || form.quantity === "")
      return "Số lượng không hợp lệ";
    if (!form.categoryId) return "Vui lòng chọn danh mục";
    return null;
  };

  // ✅ CẬP NHẬT LỚN: handleSubmit (Logic Cloudinary)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setMessage({ type: "error", text: v });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Tạo 1 bản copy của form
      let dataToSubmit = { ...form };

      // 2. Nếu có file, upload lên Cloudinary trước
      if (file) {
        setMessage({ type: "info", text: "Đang upload ảnh lên Cloudinary..." });
        const uploadedUrl = await imageService.uploadImageToCloudinary(file);
        if (uploadedUrl) {
          dataToSubmit.imageUrl = uploadedUrl; // Ghi đè imageUrl bằng link Cloudinary
        }
      }

      // 3. Gửi JSON (dataToSubmit) lên server Spring Boot
      // 🗑️ Bỏ logic FormData
      if (!isEdit) {
        setMessage({ type: "info", text: "Đang tạo sản phẩm..." });
        await productApi.create(dataToSubmit); // 👈 Dùng .create (JSON)
        setMessage({ type: "success", text: "✅ Đã tạo sản phẩm" });
      } else {
        setMessage({ type: "info", text: "Đang cập nhật sản phẩm..." });
        await productApi.update(id, dataToSubmit); // 👈 Dùng .update (JSON)
        setMessage({ type: "success", text: "✅ Đã cập nhật sản phẩm" });
      }

      setTimeout(() => navigate("/admin/products"), 1000);
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      const status = err.response?.status;
      if (status === 400)
        setMessage({ type: "error", text: "❌ Dữ liệu không hợp lệ (400)" });
      else if (status >= 500)
        setMessage({ type: "error", text: "❌ Lỗi server (500)" });
      else
        setMessage({ type: "error", text: `❌ Lỗi: ${err.message || "Không thể lưu sản phẩm"}` });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit && !form.name) {
     return <div className="text-center p-6">Đang tải dữ liệu sản phẩm...</div>
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-3">
        {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      </h2>
      {message && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border border-red-400"
              : message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-blue-100 text-blue-700 border border-blue-400" // Info
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Tên */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Tên</label>
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm"
          />
        </div>

        {/* 🌟 MỚI: Input Mô tả */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Nhập mô tả sản phẩm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Input Giá */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Giá</label>
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Nhập giá sản phẩm"
            />
          </div>

          {/* 🌟 MỚI: Input Số lượng */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Số lượng</label>
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Nhập số lượng"
            />
          </div>
        </div>

        {/* Input Danh mục */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            className="p-3 border border-gray-300 bg-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id ?? c._id} value={c.id ?? c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🌟 MỚI: Input Image URL (để dán link) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Đường dẫn ảnh (URL)
          </label>
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Hoặc dán URL hình ảnh vào đây"
          />
        </div>

        {/* Input Upload File (ưu tiên cái này) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Hoặc Upload ảnh mới (sẽ ghi đè URL ở trên)
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Nút Submit */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading} // 👈 Vô hiệu hóa khi đang tải
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
          >
            {loading ? "Đang xử lý..." : "💾 Lưu"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
          >
            Hủy
          </button>
        </div>
      </form>

      {/* ✅ Nếu là chế độ sửa thì hiển thị danh sách size */}
      {isEdit && (
        <div className="mt-8 border-t pt-4">
          <ProductSizeList productId={id} />
        </div>
      )}
    </div>
  );
};

export default ProductForm;
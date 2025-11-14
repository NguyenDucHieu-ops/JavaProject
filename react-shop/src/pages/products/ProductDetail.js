import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import productApi from "../../api/productApi";
import productSizeApi from "../../api/productSizeApi";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await productApi.getById(id);
        setProduct(data);
        const list = await productSizeApi.getByProductId(id);
        setSizes(list || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm:", err);
        setMessage({
          type: "error",
          text: "Không thể tải thông tin sản phẩm!",
        });
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await productApi.delete(id);
      alert("✅ Xóa sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("❌ Xóa thất bại, vui lòng thử lại!");
    }
  };

  const getImageUrl = (p) => {
    if (!p) return "/placeholder.png";
    const img = p.imageUrl || p.image;
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `http://localhost:8080/${cleanPath}`;
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
    );

  if (!product)
    return (
      <div className="p-6 text-center text-red-500">
        Không tìm thấy sản phẩm.
      </div>
    );

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-3">
        Chi tiết sản phẩm #{product.id}
      </h2>

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

      {/* --- Thông tin sản phẩm --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ảnh */}
        <div className="flex justify-center">
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-80 h-80 object-cover rounded-lg border"
          />
        </div>

        {/* Thông tin chi tiết */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>

          <p>
            <span className="font-medium text-gray-700">Danh mục:</span>{" "}
            {product.categoryName || product.category?.name || "-"}
          </p>

          <p>
            <span className="font-medium text-gray-700">Giá gốc:</span>{" "}
            <span className="text-gray-800">
              {Number(product.price).toLocaleString("vi-VN")} đ
            </span>
          </p>

          <p>
            <span className="font-medium text-gray-700">Giá khuyến mãi:</span>{" "}
            <span className="text-red-600 font-semibold">
              {product.salePrice && product.salePrice > 0
                ? `${Number(product.salePrice).toLocaleString("vi-VN")} đ`
                : "-"}
            </span>
          </p>

          <p>
            <span className="font-medium text-gray-700">Trạng thái:</span>{" "}
            {product.active ? (
              <span className="text-green-600 font-medium">Đang bán</span>
            ) : (
              <span className="text-red-500 font-medium">Ngừng bán</span>
            )}
          </p>

          <p>
            <span className="font-medium text-gray-700">Kích thước có sẵn:</span>{" "}
            {sizes.length > 0
              ? sizes.map((s) => s.size).join(", ")
              : "Chưa có size"}
          </p>

          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            <span className="font-medium text-gray-700">Mô tả:</span>{" "}
            {product.description || "Không có mô tả."}
          </p>
        </div>
      </div>

      {/* --- Nút thao tác --- */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Link to="/admin/products">
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
            ← Quay lại danh sách
          </button>
        </Link>

        <Link to={`/admin/products/${product.id}/edit`}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            ✏️ Chỉnh sửa
          </button>
        </Link>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          🗑️ Xóa sản phẩm
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

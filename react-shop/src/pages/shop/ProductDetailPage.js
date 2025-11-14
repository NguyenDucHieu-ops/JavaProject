// src/pages/shop/ProductDetailPage.js
// 📋 THAY THẾ TOÀN BỘ FILE (Thêm "Mua ngay" & PriceDisplay)

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // ✅ Thêm useNavigate
import productApi from "../../api/productApi";
import PriceDisplay from "../../components/PriceDisplay"; // ✅ MỚI: Import

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ MỚI: Dùng để điều hướng
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id);
        if (data) {
          // ✅ SỬA: Đảm bảo data là object, không phải mảng
          const productData = Array.isArray(data) ? data[0] : data;
          setProduct(productData);
        }
        else setError("❌ Không tìm thấy thông tin sản phẩm.");
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);
        setError(
          err.response?.status === 404
            ? "❌ Sản phẩm không tồn tại (404)."
            : "❌ Lỗi khi tải chi tiết sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProduct();
    else setError("❌ ID sản phẩm không hợp lệ.");
  }, [id]);

  const getImageUrl = (p) => {
    if (!p) return "https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image";
    const img = p.imageUrl || p.image;
    if (!img) return "https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image";
    if (img.startsWith("http")) return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return cleanPath.startsWith("http")
      ? cleanPath
      : `http://localhost:8080/${cleanPath}`;
  };

  // ✅ MỚI: Hàm chuẩn bị sản phẩm để thêm vào giỏ
  const prepareCartItem = () => {
    if (!product) return null;

    if (product.sizes?.length > 0 && !selectedSize) {
      alert("⚠️ Vui lòng chọn size trước!");
      return null;
    }

    const imageUrl = getImageUrl(product);
    const key = product.id + (selectedSize ? "-" + selectedSize : "");
    const finalPrice = (product.salePrice && product.salePrice > 0) ? Number(product.salePrice) : Number(product.price);

    return {
      key,
      id: product.id,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      size: selectedSize || null,
      quantity,
      image: imageUrl,
    };
  }

  // ✅ CẬP NHẬT: Hàm thêm vào giỏ
  const handleAddToCart = () => {
    const itemToAdd = prepareCartItem();
    if (!itemToAdd) return; // Dừng nếu chưa chọn size
    
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = storedCart.findIndex(
      (item) => item.key === itemToAdd.key
    );

    if (existingIndex >= 0) {
      storedCart[existingIndex].quantity += itemToAdd.quantity;
    } else {
      storedCart.push(itemToAdd);
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`✅ Đã thêm ${itemToAdd.quantity} "${itemToAdd.name}"${itemToAdd.size ? " - Size " + itemToAdd.size : ""} vào giỏ hàng!`);
  };

  // ✅ MỚI: Hàm Mua ngay
  const handleBuyNow = () => {
    const itemToAdd = prepareCartItem();
    if (!itemToAdd) return; // Dừng nếu chưa chọn size
    
    // Xóa giỏ hàng cũ và chỉ thêm 1 sản phẩm này
    const newCart = [itemToAdd];
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Điều hướng thẳng tới trang thanh toán
    navigate("/checkout");
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Đang tải thông tin sản phẩm... ⏳
      </div>
    );
  if (error)
    return (
      <div className="p-5 rounded-lg text-center font-medium bg-red-100 text-red-700 border border-red-400">
        {error}
        <Link
          to="/products"
          className="block mt-4 text-indigo-600 hover:underline"
        >
          ‹ Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  if (!product) return null;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <Link
        to="/products"
        className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
      >
        ‹ Quay lại danh sách sản phẩm
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ảnh sản phẩm */}
        <div>
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg border shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x600/e2e8f0/94a3b8?text=Image+Error";
            }}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">
            Danh mục:{" "}
            <span className="font-medium text-indigo-700">
              {product.categoryName ||
                product.category?.name ||
                "Chưa phân loại"}
            </span>
          </p>
          
          {/* ✅ CẬP NHẬT: Hiển thị giá */}
          <PriceDisplay price={product.price} salePrice={product.salePrice} />

          <p className="text-gray-700 leading-relaxed">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>

          {/* 🧩 Thêm chọn size (Không đổi) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-4 border-t mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Chọn size:</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedSize === s.size
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 pt-4 border-t mt-4">
            <label htmlFor="quantity" className="font-medium">
              Số lượng:
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-20 border border-gray-300 rounded-md px-3 py-1.5 text-center focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* ✅ MỚI: Thêm 2 nút "Thêm vào giỏ" và "Mua ngay" */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-green-100 text-green-700 border border-green-300 px-6 py-2 rounded-lg hover:bg-green-200 transition duration-150 font-semibold"
            >
              🛒 Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-150 font-semibold"
            >
              Mua ngay
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Số lượng còn lại: {product.quantity ?? "Không rõ"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
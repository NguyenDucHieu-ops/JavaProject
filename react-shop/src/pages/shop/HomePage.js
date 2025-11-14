// src/pages/shop/HomePage.js
// 📋 THAY THẾ TOÀN BỘ FILE (Thêm "Thêm vào giỏ" & Giữ nguyên code cũ)

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Thêm useNavigate
import Slider from "react-slick";
import productApi from "../../api/productApi";
import bannerApi from "../../api/bannerApi";
import categoryApi from "../../api/categoryApi";
import reviewApi from "../../api/reviewApi";
import PriceDisplay from "../../components/PriceDisplay";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ✅ Component hiển thị sao (★)
const StarRating = ({ rating }) => (
  <div className="flex justify-center mb-4 text-2xl">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))}
  </div>
);

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ MỚI: Dùng để điều hướng

  // ===== Helper (Đã sửa) =====
  const unwrapEntity = (item) => {
    if (!item) return item;
    if (item.content && typeof item.content === "object") return item.content;
    return item;
  };

  const normalizeResponse = (data) => {
    if (!data) return [];
    if (data && data.data && Array.isArray(data.data)) {
        return data.data.map(unwrapEntity);
    }
    if (Array.isArray(data)) return data.map(unwrapEntity); 
    if (data._embedded && typeof data._embedded === "object") {
      const embeddedValues = Object.values(data._embedded);
      const firstArray = embeddedValues.find((v) => Array.isArray(v));
      if (firstArray) return firstArray.map(unwrapEntity);
    }
    if (typeof data === "object" && (data.id || data.name || data.price))
      return [unwrapEntity(data)];
    return [];
  };

  const getImageUrl = (item) => {
    const img = item.imageUrl || item.image;
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `http://localhost:8080/${cleanPath}`;
  };

  // ✅ MỚI: Hàm thêm vào giỏ hàng (cho sản phẩm không có size)
  const handleQuickAddToCart = (e, product) => {
    e.preventDefault(); // Ngăn Link điều hướng
    e.stopPropagation(); // Ngăn sự kiện nổi bọt

    // Kiểm tra nếu có size thì điều hướng
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product.id}`);
      return;
    }
    
    // Logic thêm vào giỏ (giống trang chi tiết)
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const key = product.id.toString(); // Key là ID
    const existingIndex = storedCart.findIndex((item) => item.key === key);

    if (existingIndex >= 0) {
      storedCart[existingIndex].quantity += 1;
    } else {
      storedCart.push({
        key,
        id: product.id,
        productId: product.id, // Thêm productId cho thống nhất
        name: product.name,
        // ✅ Lấy giá sale nếu có, nếu không lấy giá gốc
        price: (product.salePrice && product.salePrice > 0) ? Number(product.salePrice) : Number(product.price),
        size: null,
        quantity: 1,
        image: getImageUrl(product),
      });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // ===== Fetch API (Cập nhật) =====
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [bannerResult, productResult, categoryResult, reviewResult] = 
          await Promise.allSettled([
            bannerApi.getAll(),
            productApi.getAll(), // Lấy tất cả sản phẩm
            categoryApi.getAll(),
            reviewApi.getAllSiteReviews(),
          ]);

        if (bannerResult.status === 'fulfilled') {
          setBanners(normalizeResponse(bannerResult.value));
        } else {
          console.error("Lỗi tải Banner:", bannerResult.reason);
          setError("Không thể tải banner.");
        }

        // Tách sản phẩm Nổi bật và Khuyến mãi
        if (productResult.status === 'fulfilled') {
          const allProducts = normalizeResponse(productResult.value);
          
          // Lấy sản phẩm nổi bật (4 sp đầu tiên)
          // Lấy sản phẩm nổi bật (4 sp đầu tiên, loại bỏ sản phẩm có giảm giá)
const nonSaleProducts = allProducts.filter(
  p => !(p.salePrice && parseFloat(p.salePrice) > 0 && parseFloat(p.salePrice) < parseFloat(p.price))
);
setFeaturedProducts(nonSaleProducts.slice(0, 4));

          
          // Lọc sản phẩm khuyến mãi
          const onSaleProducts = allProducts.filter(
            p => p.salePrice && parseFloat(p.salePrice) > 0 && parseFloat(p.salePrice) < parseFloat(p.price)
          );
          setSaleProducts(onSaleProducts);

        } else {
          console.error("Lỗi tải Sản phẩm:", productResult.reason);
          setError("Không thể tải sản phẩm.");
        }

        if (categoryResult.status === 'fulfilled') {
          setCategories(normalizeResponse(categoryResult.value).slice(0, 4));
        } else {
          console.error("Lỗi tải Danh mục:", categoryResult.reason);
        }

        if (reviewResult.status === 'fulfilled') {
          const fetchedReviews = normalizeResponse(reviewResult.value);
          setReviews(fetchedReviews.slice(0, 6));
        } else {
          console.error("Lỗi tải Đánh giá:", reviewResult.reason);
        }

      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu từ server 😢");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ===== Slider config (Banner - Không đổi) =====
  const bannerSliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
  };

  // ✅ MỚI: Slider config cho Sản phẩm Khuyến mãi
  const saleProductSliderSettings = {
    dots: false,
    infinite: saleProducts.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    pauseOnHover: true,
    responsive: [ 
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 1 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 1 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  };

  // ===== Slider config cho Reviews (Không đổi) =====
  const reviewSliderSettings = {
    dots: true,
    infinite: reviews.length > 3,
    speed: 500,
    slidesToShow: 3, 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
    responsive: [ 
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ],
  };

  // ===== UI =====
  return (
    <div className="space-y-20 animate-fadeIn">
      
      {/* ===== 1. BANNER (GIỮ NGUYÊN) ===== */}
      <section className="rounded-2xl overflow-hidden shadow-xl">
        {banners.length > 0 ? (
          <Slider {...bannerSliderSettings}>
            {banners.map((b, i) => (
              <div key={b.id || i} className="relative group">
                <img
                  src={getImageUrl(b)}
                  alt={b.title}
                  className="w-full h-[450px] md:h-[550px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center pl-10 md:pl-20 text-white">
                  <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg mb-4">
                    {b.title}
                  </h2>
                  {b.description && (
                    <p className="max-w-lg text-lg mb-6 opacity-90">
                      {b.description}
                    </p>
                  )}
                  <Link
                    to="/products"
                    className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-full text-lg font-semibold transition-all"
                  >
                    Mua ngay
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="bg-gray-100 text-center py-16 text-gray-500">
            {loading ? "Đang tải banner..." : "Không có banner để hiển thị"}
          </div>
        )}
      </section>

      {/* ===== 2. GIỚI THIỆU SHOP (GIỮ NGUYÊN) ===== */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-12 rounded-2xl shadow-md text-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">
          ✨ Chào mừng đến với DecaShop ✨
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Nơi bạn tìm thấy những sản phẩm thể thao chất lượng, giá tốt và trải nghiệm
          mua sắm tuyệt vời.
        </p>
        <Link to="/products">
          <button className="bg-indigo-600 text-white px-10 py-4 rounded-full hover:bg-indigo-700 transition-all font-semibold text-lg">
            Khám phá ngay
          </button>
        </Link>
      </section>

      {/* ===== 3. SẢN PHẨM KHUYẾN MÃI (MỚI) ===== */}
      {!loading && saleProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
            ⚡ Sản phẩm khuyến mãi
          </h2>
          <div className="max-w-6xl mx-auto px-6 slick-sale-products">
            <Slider {...saleProductSliderSettings}>
              {saleProducts.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden group flex flex-col h-full">
                    <Link to={`/product/${p.id}`} className="relative overflow-hidden">
                      <img
                        src={getImageUrl(p)}
                        alt={p.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                      </span>
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {p.categoryName || p.category?.name || "Chưa phân loại"}
                      </p>
                      <div className="mb-3 mt-auto">
                        <PriceDisplay price={p.price} salePrice={p.salePrice} />
                      </div>
                      
                      {/* ✅ MỚI: Thêm nút mua nhanh */}
                      <button 
                        onClick={(e) => handleQuickAddToCart(e, p)}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                      >
                        {/* Kiểm tra nếu có size thì đổi chữ */}
                        {(p.sizes && p.sizes.length > 0) ? 'Chọn tùy chọn' : 'Thêm vào giỏ'}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* ===== 4. DANH MỤC NỔI BẬT (GIỮ NGUYÊN) ===== */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
            🛍️ Danh mục nổi bật
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link
                to={`/products?categoryId=${cat.id}`}
                key={cat.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={getImageUrl(cat)}
                  alt={cat.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-5">
                  <span className="text-white text-xl font-semibold drop-shadow-lg">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== 5. SẢN PHẨM NỔI BẬT (GIỮ NGUYÊN + Cập nhật giá + Nút mua nhanh) ===== */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          🔥 Sản phẩm nổi bật
        </h2>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden group flex flex-col"
              >
                <Link to={`/product/${p.id}`} className="relative overflow-hidden">
                  <img
                    src={getImageUrl(p)}
                    alt={p.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {p.salePrice && p.price > p.salePrice && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                    </span>
                  )}
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {p.categoryName || p.category?.name || "Chưa phân loại"}
                  </p>
                  
                  <div className="mb-3 mt-auto">
                    <PriceDisplay price={p.price} salePrice={p.salePrice} />
                  </div>
                  
                  {/* ✅ MỚI: Thêm nút mua nhanh */}
                  <button 
                    onClick={(e) => handleQuickAddToCart(e, p)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    {(p.sizes && p.sizes.length > 0) ? 'Chọn tùy chọn' : 'Thêm vào giỏ'}
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== 6. FEEDBACK KHÁCH HÀNG (GIỮ NGUYÊN) ===== */}
      <section className="bg-indigo-50 py-16 rounded-2xl shadow-inner">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          ❤️ Khách hàng nói gì về chúng tôi
        </h2>
        
        {loading && <p className="text-center">Đang tải đánh giá...</p>}
        
        {!loading && reviews.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 slick-reviews"> 
            <Slider {...reviewSliderSettings}>
              {reviews.map((review) => (
                <div key={review.id} className="p-4"> 
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 text-center h-full flex flex-col transform hover:-translate-y-1 duration-300">
                    <StarRating rating={review.rating} />
                    <p className="text-gray-600 italic mb-4 text-lg flex-grow">
                      “{review.comment}”
                    </p>
                    <h4 className="font-semibold text-indigo-700 text-lg mt-auto">
                      {review.userName}
                    </h4>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}

        {!loading && reviews.length === 0 && (
           <div className="text-center text-gray-500">
             Chưa có đánh giá nào.
           </div>
        )}
      </section>

      {/* ===== 7. CTA (GIỮ NGUYÊN) ===== */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Sẵn sàng mua sắm cùng chúng tôi?
        </h2>
        <Link to="/products">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all">
            Bắt đầu ngay
          </button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
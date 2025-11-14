import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import productApi from "../../api/productApi";
import categoryApi from "../../api/categoryApi";
import PriceDisplay from "../../components/PriceDisplay";
import ReactPaginate from "react-paginate"; // ✅ MỚI: Import

const ProductListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";

  const [products, setProducts] = useState([]); // ✅ Sẽ giữ TẤT CẢ sản phẩm đã lọc
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // --- State cho phân trang ---
  const [currentPage, setCurrentPage] = useState(0); // ✅ MỚI: 0-indexed cho react-paginate
  const [productsPerPage, setProductsPerPage] = useState(8); // ✅ MỚI: 8 sản phẩm 1 trang

  // (Các hàm helper: unwrapEntity, normalizeResponse, getImageUrl... giữ nguyên)
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
  const getImageUrl = (p) => {
    const img = p.imageUrl || p.image;
    if (!img)
      return "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image";
    if (img.startsWith("http")) return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    if (cleanPath.startsWith("http")) return cleanPath;
    return `http://localhost:8080/${cleanPath}`;
  };
  const handleQuickAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product.id}`);
      return;
    }
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const key = product.id.toString();
    const existingIndex = storedCart.findIndex((item) => item.key === key);
    if (existingIndex >= 0) {
      storedCart[existingIndex].quantity += 1;
    } else {
      storedCart.push({
        key,
        id: product.id,
        productId: product.id,
        name: product.name,
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
  // ------------------------------------

  // ✅ Load sản phẩm (giữ nguyên logic)
  const loadProducts = async (categoryId = "", search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getAll();
      let list = normalizeResponse(data);
      if (categoryId) {
        list = list.filter(
          (p) =>
            p.categoryId === parseInt(categoryId) ||
            p.category?.id === parseInt(categoryId)
        );
      }
      if (search) {
        const lowerSearch = search.toLowerCase();
        list = list.filter((p) =>
          p.name?.toLowerCase().includes(lowerSearch)
        );
      }
      setProducts(list); // ✅ setProducts sẽ giữ tất cả (ví dụ 100 sản phẩm)
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      setError("❌ Lỗi khi tải danh sách sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load categories (giữ nguyên)
  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(normalizeResponse(data));
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  useEffect(() => {
    // ✅ MỚI: Reset về trang đầu tiên mỗi khi lọc
    setCurrentPage(0); 
    
    const categoryIdFromQuery = queryParams.get("categoryId");
    if (categoryIdFromQuery) {
      setSelectedCategory(categoryIdFromQuery);
      loadProducts(categoryIdFromQuery, searchQuery);
    } else {
      loadProducts(selectedCategory, searchQuery);
    }
    loadCategories();
  }, [location.search]); // Chạy lại khi URL thay đổi
  
  // (Các hàm handler: handleCategoryChange, handleSearch, handleKeyDown giữ nguyên)
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (searchTerm) params.set("search", searchTerm);
    navigate({ pathname: "/products", search: params.toString() });
  };
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);
    navigate({ pathname: "/products", search: params.toString() });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // --- Logic tính toán cho phân trang ---
  
  // ✅ MỚI: Tính toán index bắt đầu và kết thúc
  const offset = currentPage * productsPerPage; 
  
  // ✅ MỚI: Cắt mảng products lớn thành mảng con cho trang hiện tại
  const currentProducts = products.slice(offset, offset + productsPerPage);
  
  // ✅ MỚI: Tính tổng số trang
  const pageCount = Math.ceil(products.length / productsPerPage);

  // ✅ MỚI: Hàm xử lý khi click đổi trang
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    window.scrollTo(0, 0); // Tự động cuộn lên đầu trang
  };
  // ------------------------------------

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Danh sách Sản phẩm</h1>

      {/* Search & Filter (Không đổi) */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2 flex-1">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition shadow-sm"
          >
            🔍
          </button>
        </div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error message (Không đổi) */}
      {error && (
        <div className="p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-400">
          {error}
        </div>
      )}

      {/* Product grid (CẬP NHẬT) */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Đang tải sản phẩm... ⏳
        </div>
      ) : (
        <> {/* ✅ MỚI: Bọc bởi Fragment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* ✅ SỬA: Dùng currentProducts thay vì products */}
            {currentProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-10">
                Không tìm thấy sản phẩm nào.
              </p>
            ) : (
              // ✅ SỬA: map từ currentProducts
              currentProducts.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg shadow-md overflow-hidden bg-white hover:shadow-lg transition duration-200 flex flex-col group"
                >
                  <Link to={`/product/${p.id}`} className="block relative overflow-hidden">
                    <img
                      src={getImageUrl(p)}
                      alt={p.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x400/e2e8f0/94a3b8?text=Image+Error";
                      }}
                    />
                    {p.salePrice && p.price > p.salePrice && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3
                      className="text-lg font-semibold text-gray-800 mb-1 truncate"
                      title={p.name}
                    >
                      <Link
                        to={`/product/${p.id}`}
                        className="hover:text-indigo-600"
                      >
                        {p.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {p.categoryName || p.category?.name || "Chưa phân loại"}
                    </p>
                    
                    <div className="mb-3 mt-auto">
                      <PriceDisplay price={p.price} salePrice={p.salePrice} />
                    </div>
                    
                    <button 
                      onClick={(e) => handleQuickAddToCart(e, p)}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 font-medium text-sm"
                    >
                      {(p.sizes && p.sizes.length > 0) ? 'Chọn tùy chọn' : 'Thêm vào giỏ'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ✅ MỚI: Thêm thanh phân trang */}
          {pageCount > 1 && (
            <ReactPaginate
              previousLabel={"< Trước"}
              nextLabel={"Sau >"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              forcePage={currentPage} // Đồng bộ state với UI
              // ✅ Đây là bộ class Tailwind CSS cho thanh phân trang
              containerClassName={"flex items-center justify-center list-none mt-8"}
              pageLinkClassName={"block px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mx-1 text-gray-700"}
              previousLinkClassName={"block px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mx-1 text-gray-700 font-medium"}
              nextLinkClassName={"block px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mx-1 text-gray-700 font-medium"}
              breakLinkClassName={"block px-3 py-2 text-gray-500 mx-1"}
              activeLinkClassName={"bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"}
              disabledClassName={"opacity-50 cursor-not-allowed"}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPage;
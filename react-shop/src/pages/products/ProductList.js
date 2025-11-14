// 📁 src/pages/products/ProductList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import productApi from "../../api/productApi";
import productSizeApi from "../../api/productSizeApi";
import ReactPaginate from "react-paginate";

const ProductList = ({ isUserView = false }) => {
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // --- Phân trang ---
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(10);

  // --- Helpers ---
  const unwrapEntity = (item) => {
    if (!item) return item;
    if (item.content && typeof item.content === "object") return item.content;
    return item;
  };

  const normalizeResponse = (data) => {
    if (!data) return [];
    if (data.data && Array.isArray(data.data)) return data.data.map(unwrapEntity);
    if (Array.isArray(data)) return data.map(unwrapEntity);
    if (data._embedded) {
      const arr = Object.values(data._embedded).find((v) => Array.isArray(v));
      if (arr) return arr.map(unwrapEntity);
    }
    if (typeof data === "object" && (data.id || data.name)) return [unwrapEntity(data)];
    return [];
  };

  const getImageUrl = (p) => {
    const img = p.imageUrl || p.image;
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `http://localhost:8080/${cleanPath}`;
  };

  // --- Load dữ liệu ---
  const loadAll = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const params = [];
      if (search) params.push(`keyword=${encodeURIComponent(search)}`);
      if (minPrice) params.push(`min=${minPrice}`);
      if (maxPrice) params.push(`max=${maxPrice}`);
      const query = params.length ? `?${params.join("&")}` : "";

      const data = await productApi.getAll(query);
      const productList = normalizeResponse(data);
      setProducts(productList);

      const sizeMap = {};
      for (const p of productList) {
        try {
          const list = await productSizeApi.getByProductId(p.id);
          sizeMap[p.id] = list.map((s) => s.size).join(", ");
        } catch {
          sizeMap[p.id] = "-";
        }
      }
      setSizes(sizeMap);
    } catch (err) {
      console.error("❌ Lỗi khi tải sản phẩm:", err);
      setMessage({ type: "error", text: "❌ Lỗi khi tải danh sách sản phẩm" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // --- Xóa ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await productApi.delete(id);
      await loadAll();
      setMessage({ type: "success", text: "✅ Xóa sản phẩm thành công" });
    } catch (err) {
      const status = err.response?.status;
      if (status === 404)
        setMessage({ type: "error", text: "❌ Sản phẩm không tồn tại (404)" });
      else if (status >= 500)
        setMessage({ type: "error", text: "❌ Lỗi máy chủ (500)" });
      else setMessage({ type: "error", text: "❌ Xóa thất bại" });
    }
  };

  // --- Import / Export ---
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm(`Bạn có chắc muốn import file: ${file.name}?`)) {
      e.target.value = null;
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      await productApi.importExcel(formData);
      setMessage({ type: "success", text: "✅ Import file thành công!" });
      loadAll();
    } catch (err) {
      console.error("Lỗi import:", err);
      setMessage({ type: "error", text: "❌ Import thất bại." });
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleExport = async () => {
    if (!window.confirm("Bạn có muốn export tất cả sản phẩm ra Excel?")) return;
    setLoading(true);
    try {
      const blob = await productApi.exportExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "✅ Export file thành công!" });
    } catch (err) {
      console.error("Export lỗi:", err);
      setMessage({ type: "error", text: "❌ Export thất bại." });
    } finally {
      setLoading(false);
    }
  };

  // --- Phân trang ---
  const offset = currentPage * productsPerPage;
  const currentProducts = products.slice(offset, offset + productsPerPage);
  const pageCount = Math.ceil(products.length / productsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    window.scrollTo(0, 0);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadAll();
  };

  const handleReset = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(0);
    loadAll();
  };

  // --- Render ---
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-3">
        {isUserView ? "Danh sách Sản phẩm" : "Quản lý Sản phẩm"}
      </h2>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="border px-3 py-2 rounded-md w-64"
        />
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Giá tối thiểu"
          className="border px-3 py-2 rounded-md w-32"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Giá tối đa"
          className="border px-3 py-2 rounded-md w-32"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Tìm kiếm
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-300 px-3 py-2 rounded-md hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

      {/* Nút thêm / Import / Export */}
      {!isUserView && (
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/admin/products/new">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 font-medium">
              ➕ Thêm sản phẩm
            </button>
          </Link>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-200 font-medium disabled:bg-gray-400"
          >
            🔽 Export Excel
          </button>
          <label className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition duration-200 font-medium cursor-pointer">
            🔼 Import Excel
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleImport}
              disabled={loading}
            />
          </label>
        </div>
      )}

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

      {/* Bảng sản phẩm */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">Ảnh</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">Tên</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">Giá Gốc</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">Giá KM</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">Danh mục</th>
                  <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">Size</th>
                  {!isUserView && (
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b text-center">
                      Hành động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={!isUserView ? 7 : 6} className="text-center py-4 text-gray-500">
                      Không có sản phẩm
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <img
                          src={getImageUrl(p)}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      </td>
                      <td className="px-4 py-2 font-semibold text-gray-800">{p.name}</td>
                      <td className="px-4 py-2 text-gray-600 font-medium whitespace-nowrap">
                        {Number(p.price).toLocaleString("vi-VN")} VND
                      </td>
                      <td className="px-4 py-2 text-red-600 font-bold whitespace-nowrap">
                        {p.salePrice && parseFloat(p.salePrice) > 0
                          ? `${Number(p.salePrice).toLocaleString("vi-VN")} VND`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {p.categoryName || p.category?.name || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {sizes[p.id] || "-"}
                      </td>

                      {!isUserView && (
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            {/* 👁 Nút Xem chi tiết */}
                            <Link to={`/admin/products/${p.id}`}>
                              <button className="bg-gray-500 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 transition">
                                👁 Xem
                              </button>
                            </Link>

                            {/* ✏️ Nút Sửa */}
                            <Link to={`/admin/products/${p.id}/edit`}>
                              <button className="bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 transition">
                                Sửa
                              </button>
                            </Link>

                            {/* 🗑 Nút Xóa */}
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <ReactPaginate
              previousLabel={"< Trước"}
              nextLabel={"Sau >"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              forcePage={currentPage}
              containerClassName={"flex items-center justify-center list-none mt-6"}
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

export default ProductList;

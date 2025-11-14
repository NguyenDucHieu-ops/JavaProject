import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const ProductSizeList = ({ productId }) => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load size khi vào trang sửa sản phẩm
  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res = await axiosClient.get(`/product-sizes?product_id=${productId}`);
        setSizes(res);
      } catch (err) {
        console.error("Lỗi khi tải size:", err);
        setSizes([]);
      }
    })();
  }, [productId]);

  // ✅ Xử lý thêm size
  const handleAddSize = async () => {
    if (!newSize.trim() || !newStock) return alert("Nhập đủ size và số lượng");
    try {
      setLoading(true);
      const res = await axiosClient.post(`/product-sizes?product_id=${productId}`, {
        size: newSize.trim(),
        stock: parseInt(newStock),
      });
      setSizes([...sizes, res]);
      setNewSize("");
      setNewStock("");
    } catch (err) {
      console.error("Lỗi thêm size:", err);
      alert("Không thể thêm size");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xóa size
  const handleDeleteSize = async (id) => {
    if (!window.confirm("Xóa size này?")) return;
    try {
      await axiosClient.delete(`/product-sizes/${id}`);
      setSizes(sizes.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Lỗi xóa size:", err);
      alert("Không thể xóa size");
    }
  };

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold text-gray-700 mb-3">Danh sách size</h3>

      {sizes.length === 0 ? (
        <p className="text-gray-500 mb-3">Chưa có size nào cho sản phẩm này.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 mb-3">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Tồn kho</th>
              <th className="p-2 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={s.id} className="text-center">
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{s.size}</td>
                <td className="p-2 border">{s.stock}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDeleteSize(s.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Form thêm size mới */}
      <div className="flex gap-3 mt-4">
        <input
          type="text"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Nhập size (VD: S, M, 38)"
          className="flex-1 border p-2 rounded"
        />
        <input
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Tồn kho"
          className="w-24 border p-2 rounded"
        />
        <button
          onClick={handleAddSize}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Đang thêm..." : "➕ Thêm"}
        </button>
      </div>
    </div>
  );
};

export default ProductSizeList;

// src/pages/products/ProductStats.js
import React, { useEffect, useState } from "react";
import productApi from "../../api/productApi";

const ProductStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await productApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err);
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center p-6">Đang tải thống kê...</div>;
  }

  if (error) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  if (!stats) {
    return <div className="p-6">Không có dữ liệu thống kê.</div>;
  }

  const categoryEntries = stats.countByCategory ? Object.entries(stats.countByCategory) : [];

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl max-w-2xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-3">
        📊 Thống kê sản phẩm
      </h2>

      {/* Thống kê tổng quan */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800">Tổng quan</h3>
        <p className="text-2xl font-bold text-blue-600">
          {stats.totalProducts}{" "}
          <span className="text-lg font-normal text-gray-700">tổng số sản phẩm</span>
        </p>
      </div>

      {/* Thống kê theo danh mục */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Sản phẩm theo danh mục</h3>
        {categoryEntries.length > 0 ? (
          <ul className="divide-y divide-gray-200 mt-2">
            {categoryEntries.map(([categoryName, count]) => (
              <li
                key={categoryName}
                className="flex justify-between items-center py-3"
              >
                <span className="text-md font-medium text-gray-700">
                  {categoryName}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                  {count} sản phẩm
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">Chưa có dữ liệu danh mục.</p>
        )}
      </div>
    </div>
  );
};

export default ProductStats;
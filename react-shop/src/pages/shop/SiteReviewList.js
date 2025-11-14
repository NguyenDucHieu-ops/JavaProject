// src/pages/public/SiteReviewList.js
// 📋 TOÀN BỘ FILE

import React, { useState, useEffect } from "react";
import reviewApi from "../../api/reviewApi";

// ✅ Helper: Xử lý URL ảnh
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

const SiteReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Giả định bạn đã sửa SecurityConfig để permitAll
        const response = await reviewApi.getAllSiteReviews();
        console.log("📦 API reviews:", response);

        // ✅ Đảm bảo luôn là mảng
        if (Array.isArray(response)) {
          setReviews(response);
        } else if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else if (Array.isArray(response.content)) {
          setReviews(response.content);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải đánh giá:", err);
        setError("Không thể tải danh sách đánh giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <div className="text-center mt-10">Đang tải đánh giá...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Các đánh giá về DecaShop</h1>
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {review.userName || "Ẩn danh"}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {/* ⭐ Hiển thị sao */}
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${review.rating > i ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* 🖼️ Ảnh đính kèm (của User) */}
              {review.imageUrl && (
                <a
                  href={getImageUrl(review.imageUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={getImageUrl(review.imageUrl)}
                    alt="Ảnh đánh giá"
                    className="max-h-40 rounded-lg shadow-md cursor-pointer mb-3"
                  />
                </a>
              )}

              {/* 💬 Phản hồi từ admin */}
              {review.adminReply && (
                <div className="mt-3 ml-4 pl-4 border-l-4 border-blue-200">
                  <p className="font-semibold text-sm text-blue-800 mb-1">
                    Phản hồi từ DecaShop (
                    {review.repliedAt
                      ? new Date(review.repliedAt).toLocaleString("vi-VN")
                      : ''}
                    ):
                  </p>
                  <p className="text-gray-800 bg-blue-50 p-3 rounded-md whitespace-pre-wrap">
                    {review.adminReply}
                  </p>

                  {/* Hiển thị ảnh phản hồi của Admin */}
                  {review.adminReplyImageUrl && (
                    <a
                      href={getImageUrl(review.adminReplyImageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={getImageUrl(review.adminReplyImageUrl)}
                        alt="Ảnh phản hồi"
                        className="max-h-40 rounded-lg shadow-md cursor-pointer mt-2"
                      />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">Chưa có đánh giá nào.</p>
        )}
      </div>
    </div>
  );
};

export default SiteReviewList;

// src/pages/reviews/ReviewDetailAdmin.js
// 📋 THAY THẾ TOÀN BỘ FILE

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import reviewApi from "../../api/reviewApi";

// Helper lấy ảnh
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

// Component hiển thị sao
const StarRating = ({ rating }) => (
  <div className="flex text-2xl text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <span key={i}>{i < rating ? "★" : "☆"}</span>
    ))}
  </div>
);

const ReviewDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho trả lời
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  
  // ✅ MỚI: State cho file trả lời của Admin
  const [replyFile, setReplyFile] = useState(null);
  const [replyFilePreview, setReplyFilePreview] = useState(null);

  // 🧭 Load chi tiết đánh giá
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await reviewApi.getAllSiteReviews(); // Vẫn dùng getAll vì chưa có getById

        const reviewsArray = Array.isArray(res)
          ? res
          : Array.isArray(res.data)
          ? res.data
          : [];

        const foundReview = reviewsArray.find((r) => r.id.toString() === id);

        if (!foundReview) {
          setError("Không tìm thấy đánh giá.");
        } else {
          setReview(foundReview);
          setReplyMessage(foundReview.adminReply || "");
          // ✅ MỚI: Hiển thị ảnh trả lời cũ (nếu có)
          setReplyFilePreview(getImageUrl(foundReview.adminReplyImageUrl));
        }
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết đánh giá:", err);
        setError("Không thể tải chi tiết đánh giá.");
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  // ✅ MỚI: Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReplyFile(file);
      setReplyFilePreview(URL.createObjectURL(file));
    } else {
      setReplyFile(null);
      // Giữ lại ảnh cũ nếu user hủy chọn
      setReplyFilePreview(getImageUrl(review.adminReplyImageUrl));
    }
  };

  // 📩 Gửi trả lời (Cập nhật)
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (replyMessage.trim() === "") {
      alert("Vui lòng nhập nội dung trả lời.");
      return;
    }

    setIsReplying(true);
    try {
      // ✅ CẬP NHẬT: Gửi cả file
      await reviewApi.replyToReview(id, replyMessage, replyFile);
      
      alert("✅ Trả lời thành công!");
      navigate("/admin/reviews");
    } catch (err) {
      console.error("❌ Lỗi gửi trả lời:", err);
      setError("Gửi trả lời thất bại.");
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) return <div className="p-4">Đang tải chi tiết...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!review) return <div className="p-4">Không tìm thấy đánh giá.</div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">
        Chi tiết Đánh giá (ID: {review.id})
      </h1>

      {/* Thông tin đánh giá */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">
          Đánh giá của khách hàng
        </h2>
        <div className="space-y-4">
          <p><strong>Người gửi:</strong> {review.userName || "Ẩn danh"}</p>
          <p><strong>Ngày gửi:</strong> {new Date(review.createdAt).toLocaleString("vi-VN")}</p>
          <div className="flex items-center gap-2">
            <strong>Đánh giá:</strong> <StarRating rating={review.rating} />
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">
            <strong>Nội dung:</strong> {review.comment}
          </p>

          {review.imageUrl && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Ảnh đính kèm (của khách):
              </h3>
              <a
                href={getImageUrl(review.imageUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={getImageUrl(review.imageUrl)}
                  alt="Ảnh đánh giá"
                  className="max-w-xs rounded-lg shadow-md"
                />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Form trả lời của Admin */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">
          {review.adminReply ? "Nội dung đã trả lời" : "Soạn trả lời"}
        </h2>
        <form onSubmit={handleSubmitReply} className="space-y-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="8"
            placeholder="Nhập nội dung trả lời của bạn..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            disabled={isReplying}
          />
          
          {/* ✅ MỚI: Thêm ô upload ảnh cho Admin */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Đính kèm ảnh (nếu có)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {replyFilePreview && (
              <div className="mt-4">
                <img src={replyFilePreview} alt="Xem trước" className="max-h-40 rounded-lg shadow-md"/>
              </div>
            )}
          </div>

          <div className="text-right mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isReplying}
            >
              {isReplying
                ? "Đang gửi..."
                : review.adminReply
                ? "Cập nhật trả lời"
                : "Gửi trả lời"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewDetailAdmin;
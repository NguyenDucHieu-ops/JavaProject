import React, { useState, useEffect } from "react";
import reviewApi from "../../api/reviewApi";
import { Link } from "react-router-dom";

// Helper: xử lý URL ảnh
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

// Component hiển thị sao
const StarRating = ({ rating }) => (
  <div className="flex text-lg">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ))}
  </div>
);

const ReviewListAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewApi.getAllSiteReviews();
      console.log("📦 API reviews (admin):", response);

      // ✅ Luôn trả về mảng hợp lệ
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
      setError("Không thể tải danh sách đánh giá.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await reviewApi.deleteReview(id);
      alert("Xóa thành công!");
      fetchReviews();
    } catch (err) {
      alert("Lỗi! Không thể xóa đánh giá.");
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Đánh giá Website</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người gửi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Đánh giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nội dung
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày gửi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Không có đánh giá nào.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {review.userName || "Ẩn danh"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 min-w-[200px]">
                    {review.comment}
                  </td>
                  <td className="px-6 py-4">
                    {review.imageUrl ? (
                      <a
                        href={getImageUrl(review.imageUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={getImageUrl(review.imageUrl)}
                          alt="Review"
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Không có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/reviews/${review.id}`}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition"
                    >
                      {review.adminReply ? "Xem" : "Trả lời"}
                    </Link>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewListAdmin;

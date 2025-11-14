import React, { useState } from "react";
import reviewApi from "../../api/reviewApi";
import { useNavigate } from "react-router-dom";

const SiteReviewForm = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  
  // ✅ MỚI: State lỗi (dạng object)
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ MỚI: Hàm validate frontend
  const validateForm = () => {
    const newErrors = {};
    if (!comment) {
      newErrors.comment = "Bình luận không được để trống";
    } else if (comment.length < 5) {
      newErrors.comment = "Bình luận cần ít nhất 5 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ MỚI: Kiểm tra validate
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const dto = { rating, comment };
      await reviewApi.submitSiteReview({ dto: dto, file: imageFile });
      
      alert("Cảm ơn bạn đã đánh giá!");
      setRating(5);
      setComment("");
      setImageFile(null); 
      setImagePreview(null); 
      
      navigate("/xem-danh-gia"); 

    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      // ✅ MỚI: Xử lý lỗi
      if (error.response && error.response.status === 401) {
        setErrors({ general: "Bạn cần đăng nhập để gửi đánh giá." });
      } else if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Lỗi! Không thể gửi đánh giá." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá Website</h1>
      
      {errors.general && <div className="p-3 mb-4 bg-red-100 text-red-800 rounded">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bạn xếp hạng chúng tôi thế nào?</label>
          <div className="flex space-x-2 text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Bình luận của bạn</label>
          <textarea
            name="comment"
            id="comment"
            rows="5"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if(errors.comment) setErrors({...errors, comment: null});
            }}
            onBlur={validateForm} // ✅ Thêm onBlur
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.comment ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Hãy cho chúng tôi biết trải nghiệm của bạn (ít nhất 5 ký tự)..."
            required
          ></textarea>
          {/* ✅ Hiển thị lỗi */}
          {errors.comment && <p className="text-red-500 text-sm mt-1">{errors.comment}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Đính kèm ảnh (nếu có)</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*"
          />
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Xem trước" className="max-h-40 rounded-lg shadow-md"/>
              <button 
                type="button" 
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Xóa ảnh
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
};

export default SiteReviewForm;
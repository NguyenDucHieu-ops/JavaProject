// src/api/reviewApi.js
// 📋 THAY THẾ TOÀN BỘ FILE

import apiClient from "./apiClient";

const reviewApi = {
  // 🟢 Lấy tất cả đánh giá (cả user & admin dùng)
  getAllSiteReviews: () => {
    return apiClient.get("/reviews");
  },

  // 🟢 User gửi đánh giá (có thể kèm ảnh)
  submitSiteReview: (reviewData) => {
    const formData = new FormData();
    formData.append(
      "reviewDto",
      new Blob([JSON.stringify(reviewData.dto)], { type: "application/json" })
    );

    if (reviewData.file) {
      formData.append("file", reviewData.file);
    }

    return apiClient.post("/reviews", formData, {
      headers: { "Content-Type": undefined },
    });
  },

  // ✅ CẬP NHẬT: Admin trả lời (gửi FormData)
  replyToReview: (id, replyMessage, file) => {
    const formData = new FormData();
    
    // 1. Gửi tin nhắn (phải khớp tên @RequestPart("replyMessage") trong Controller)
    formData.append("replyMessage", replyMessage);
    
    // 2. Gửi file (nếu có) (phải khớp tên @RequestPart("file"))
    if (file) {
      formData.append("file", file);
    }
    
    // 3. Gửi request
    return apiClient.post(`/reviews/${id}/reply`, formData, {
      headers: {
        "Content-Type": undefined, // Để trình duyệt tự đặt Content-Type cho FormData
      },
    });
  },

  // 🟢 Admin xóa đánh giá
  deleteReview: (id) => {
    return apiClient.delete(`/reviews/${id}`);
  },
};

export default reviewApi;
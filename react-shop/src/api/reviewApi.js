import axiosClient from "./axiosClient";

const reviewApi = {
  // 🟢 Lấy tất cả đánh giá
  getAllSiteReviews: () => axiosClient.get("/reviews"),

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

    return axiosClient.post("/reviews", formData, {
      headers: { "Content-Type": undefined },
    });
  },

  // ✅ Admin trả lời review (FormData)
  replyToReview: (id, replyMessage, file) => {
    const formData = new FormData();
    formData.append("replyMessage", replyMessage);

    if (file) {
      formData.append("file", file);
    }

    return axiosClient.post(`/reviews/${id}/reply`, formData, {
      headers: { "Content-Type": undefined },
    });
  },

  // 🟢 Admin xóa review
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default reviewApi;

import axiosClient from "./axiosClient";

const contactApi = {
  // ✅ Gửi bằng FormData
  send: (contactData) => {
    const formData = new FormData();

    // 1. Gửi DTO (JSON)
    formData.append(
      "contactDto",
      new Blob([JSON.stringify(contactData.dto)], { type: "application/json" })
    );

    // 2. Gửi file (nếu có)
    if (contactData.file) {
      formData.append("file", contactData.file);
    }

    // 3. Gửi request
    return axiosClient.post("/contact", formData, {
      headers: { "Content-Type": undefined }, // trình duyệt tự đặt
    });
  },

  // === Các hàm cũ ===
  getAll: () => axiosClient.get("/contact"),
  getById: (id) => axiosClient.get(`/contact/${id}`),
  reply: (id, replyMessage) =>
    axiosClient.post(`/contact/${id}/reply`, { replyMessage }),
  getMyTickets: () => axiosClient.get("/contact/my-tickets"),
};

export default contactApi;

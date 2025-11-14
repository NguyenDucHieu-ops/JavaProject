import apiClient from "./apiClient";

const contactApi = {
  // ✅ CẬP NHẬT: Gửi bằng FormData
  send: (contactData) => {
    // contactData bao gồm { dto, file }
    const formData = new FormData();

    // 1. Gửi DTO (JSON)
    formData.append("contactDto", new Blob([JSON.stringify(contactData.dto)], {
      type: "application/json",
    }));
    
    // 2. Gửi file (nếu có)
    if (contactData.file) {
      formData.append("file", contactData.file);
    }

    // 3. Gửi request
    return apiClient.post("/contact", formData, {
      headers: {
        // Xóa Content-Type, trình duyệt sẽ tự đặt
        "Content-Type": undefined, 
      },
    });
  },

  // === CÁC HÀM CŨ (Không đổi) ===
  getAll: () => {
    return apiClient.get("/contact");
  },
  getById: (id) => {
    return apiClient.get(`/contact/${id}`);
  },
  reply: (id, replyMessage) => {
    return apiClient.post(`/contact/${id}/reply`, { replyMessage });
  },
  getMyTickets: () => {
    return apiClient.get("/contact/my-tickets");
  }
};

export default contactApi;
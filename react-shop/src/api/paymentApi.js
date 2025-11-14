import axiosClient from "./axiosClient";

const paymentApi = {
  createMockPayment: (data) => axiosClient.post("/pay/mock", data),
  notifyMock: (payload) => axiosClient.post("/pay/mock/notify", payload),
};

export default paymentApi;

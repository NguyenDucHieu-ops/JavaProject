import React, { useState, useEffect } from "react";
import contactApi from "../../api/contactApi";
import orderApi from "../../api/orderApi";

const ContactForm = () => {
  const initialName = localStorage.getItem("userName") || "";
  const initialEmail = localStorage.getItem("userEmail") || "";

  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    topic: "",
    orderId: "",
    message: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ MỚI: State lỗi (dạng object)
  const [errors, setErrors] = useState({}); 
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("userToken");
      if (token) {
        try {
          const response = await orderApi.getMyOrders(); 
          setRecentOrders(response || []); 
        } catch (err) {
          console.error("❌ Không thể tải danh sách đơn hàng:", err);
        }
      }
    };
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi khi gõ
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

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
    if (!formData.topic) newErrors.topic = "Bạn phải chọn chủ đề";
    if (formData.topic === 'order' && !formData.orderId) newErrors.orderId = "Bạn phải chọn đơn hàng liên quan";
    if (!formData.message) newErrors.message = "Nội dung không được để trống";
    else if (formData.message.length < 10) newErrors.message = "Nội dung phải có ít nhất 10 ký tự";
    
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
    setSuccess(null);

    try {
      await contactApi.send({ dto: formData, file: imageFile }); 
      setSuccess("Gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ sớm phản hồi.");
      setFormData({
        name: initialName,
        email: initialEmail,
        topic: "",
        orderId: "",
        message: "",
      });
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Lỗi gửi liên hệ:", error);
      // ✅ MỚI: Xử lý lỗi 400
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Gửi yêu cầu thất bại, vui lòng thử lại." });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ MỚI: Hàm onBlur
  const handleBlur = (e) => {
    validateForm();
  };

  const inputStyle = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
          Gửi yêu cầu hỗ trợ
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {success && <div className="p-3 bg-green-100 text-green-800 rounded">{success}</div>}
          {/* ✅ Hiển thị lỗi chung */}
          {errors.general && <div className="p-3 bg-red-100 text-red-800 rounded">{errors.general}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className={labelStyle}>Họ tên</label>
              <input
                type="text" name="name" id="name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputStyle} bg-gray-100`}
                readOnly 
              />
            </div>
            <div>
              <label htmlFor="email" className={labelStyle}>Email</label>
              <input
                type="email" name="email" id="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputStyle} bg-gray-100`}
                readOnly
              />
            </div>
          </div>

          <div>
            <label htmlFor="topic" className={labelStyle}>Chủ đề của bạn là gì?</label>
            <select
              name="topic" id="topic"
              value={formData.topic}
              onChange={handleChange}
              onBlur={handleBlur} // ✅ Thêm onBlur
              className={`${inputStyle} ${errors.topic ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">-- Vui lòng chọn chủ đề --</option>
              <option value="order">📦 Vấn đề về đơn hàng</option>
              <option value="payment">💳 Vấn đề thanh toán</option>
              <option value="account">👤 Vấn đề tài khoản</option>
              <option value="technical">🐞 Báo lỗi kỹ thuật</option>
              <option value="general">💬 Khác</option>
            </select>
            {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic}</p>}
          </div>

          {formData.topic === 'order' && (
            <div>
              <label htmlFor="orderId" className={labelStyle}>Đơn hàng liên quan</label>
              <select
                name="orderId" id="orderId"
                value={formData.orderId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputStyle} ${errors.orderId ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">-- Vui lòng chọn đơn hàng --</option>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Mã đơn #{order.id} - Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </option>
                  ))
                ) : (
                  <option disabled>Không tìm thấy đơn hàng nào.</option>
                )}
              </select>
              {errors.orderId && <p className="text-red-500 text-sm mt-1">{errors.orderId}</p>}
            </div>
          )}

          <div>
            <label htmlFor="message" className={labelStyle}>
              Mô tả chi tiết vấn đề
            </label>
            <textarea
              name="message" id="message" rows="6"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Vui lòng mô tả rõ vấn đề bạn đang gặp phải (ít nhất 10 ký tự)..."
              required
            ></textarea>
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          <div>
            <label className={labelStyle}>Đính kèm ảnh (nếu có)</label>
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Địa chỉ cửa hàng</h2>
        <p className="text-gray-600 mb-4">
          <strong>Địa chỉ:</strong> 20 Tăng Nhơn Phú, Phước Long B, Thành Phố Thủ Đức, TP. Hồ Chí Minh
        </p>
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.498338148978!2d106.7561868748496!3d10.8496871892976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752704183181b5%3A0x66f6c047c8f2b757!2zMjAgVMOgbmcgTmjGsMahbiBQaMO6LCBQaMaw4budbmcgTG9uZyBCLCBUaOG7pyBUaOG7pWMgQ8O0LCBIbyBDaMOtbmggTWluaCA3MTMsIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1731425729480!5m2!1svi!2s"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactForm;
import React, { useState, useEffect, useRef } from "react";
import userApi from "../../api/userApi"; 
import toast, { Toaster } from "react-hot-toast"; // Import Toaster

// Helper lấy ảnh
const getImageUrl = (path) => {
  if (!path) return "https://placehold.co/150x150/e2e8f0/94a3b8?text=Avatar";
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

const AccountInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phoneNumber: "", 
    address: "",
    avatar: "",
  });
  
  // State lỗi
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // State cho nút "Lưu"

  // State cho file upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null); 

  // Tải thông tin cá nhân khi vào trang
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await userApi.getProfile();
        setFormData(response); 
        setAvatarPreview(getImageUrl(response.avatar));
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        toast.error("Không thể tải thông tin tài khoản.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); 
      setAvatarPreview(URL.createObjectURL(file)); 
    }
  };

  // Hàm validate frontend
  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) newErrors.name = "Họ tên không được trống";
    if (!formData.email) newErrors.email = "Email không được trống";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email không đúng định dạng";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Số điện thoại không được trống";
    else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    if (!formData.address) newErrors.address = "Địa chỉ không được trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    validateForm();
  };

  // Cập nhật thông tin TEXT
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setIsUpdating(true);
    setErrors({});
    try {
      const { name, email, phoneNumber, address } = formData;
      const response = await userApi.updateProfile({ 
        name, 
        email, 
        phoneNumber, 
        address 
      });
      
      const newData = response;
      setFormData(newData);
      
      localStorage.setItem("userName", newData.name || newData.username);
      localStorage.setItem("userEmail", newData.email);
      
      toast.success("Cập nhật thông tin thành công!");
      
      // Không cần reload nếu UserLayout đã được sửa
      // window.location.reload(); 

    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
        toast.error("Thông tin không hợp lệ!");
      } else {
        toast.error("Lỗi! Không thể cập nhật thông tin.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Cập nhật AVATAR
  const handleAvatarUpdate = async () => {
    if (!avatarFile) {
      toast.error("Bạn chưa chọn file mới.");
      return;
    }
    
    const uploadData = new FormData();
    uploadData.append("file", avatarFile);
    
    // Thêm toast loading
    const uploadToast = toast.loading("Đang tải ảnh lên...");

    try {
      const response = await userApi.updateAvatar(uploadData);
      const newData = response;
      
      setFormData(newData); 
      setAvatarPreview(getImageUrl(newData.avatar));
      setAvatarFile(null);
      
      localStorage.setItem("userAvatar", newData.avatar || "");
      toast.success("Cập nhật avatar thành công!", { id: uploadToast });

      // Reload trang để UserLayout cập nhật avatar
      setTimeout(() => window.location.reload(), 1000); 

    } catch (error) {
      toast.error("Lỗi! Không thể upload avatar.", { id: uploadToast });
    }
  };
  
  const inputStyle = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-700";

  if (loading) return <div className="text-center p-10">Đang tải thông tin...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <Toaster /> {/* Thêm Toaster */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Thông tin tài khoản
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-md mb-4 cursor-pointer"
            onClick={() => fileInputRef.current.click()} 
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
            accept="image/*"
          />
          <button
            onClick={handleAvatarUpdate}
            disabled={!avatarFile || isUpdating} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            Lưu Avatar
          </button>
        </div>

        <form onSubmit={handleProfileUpdate} className="md:col-span-2 space-y-4">
          <div>
            <label className={labelStyle}>Tên đăng nhập (Không thể đổi)</label>
            <input
              type="text"
              value={formData.username || ''}
              className={`${inputStyle} bg-gray-100`}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="name" className={labelStyle}>Họ và tên</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className={labelStyle}>Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber" 
              id="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
          
          <div>
            <label htmlFor="address" className={labelStyle}>Địa chỉ</label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          
          <div className="text-right">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi thông tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountInfo;
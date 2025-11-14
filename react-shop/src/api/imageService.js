// src/api/imageService.js

const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  // 🛑 THAY THÔNG TIN CỦA BẠN VÀO ĐÂY
const cloudName = "dd9eema2d"; // ✅ Cloud name thật
const uploadPreset = "hieukia";   // ✅ Upload preset thật


  if (!cloudName || !uploadPreset || cloudName === "YOUR_CLOUD_NAME") {
    throw new Error(
      "Cloudinary config (cloudName, uploadPreset) is missing."
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Image upload failed: " + text);
    }
    const data = await res.json();
    return data.secure_url || data.url; // Trả về secure_url
  } catch (err) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", err);
    throw err;
  }
};

export default { uploadImageToCloudinary };
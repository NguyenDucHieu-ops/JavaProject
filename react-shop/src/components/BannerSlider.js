import React, { useEffect, useState } from "react";
import bannerApi from "../api/bannerApi";

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await bannerApi.getAll();
        setBanners(res);
      } catch (err) {
        console.error("Lỗi tải banner:", err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0)
    return (
      <div className="bg-gray-100 text-center py-20 text-gray-500">
        Đang tải banner...
      </div>
    );

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-xl shadow-md">
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title || "Banner"}
        className="w-full h-full object-cover transition-all duration-700"
      />
      <div className="absolute bottom-6 left-6 bg-black bg-opacity-40 text-white px-5 py-3 rounded-lg">
        <h2 className="text-2xl font-semibold">{currentBanner.title}</h2>
        <p className="text-sm">{currentBanner.description}</p>
      </div>
    </div>
  );
};

export default BannerSlider;

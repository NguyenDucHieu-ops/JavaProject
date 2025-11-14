import React from 'react';

const PriceDisplay = ({ price, salePrice }) => {
  const originalPrice = parseFloat(price);
  const discountedPrice = parseFloat(salePrice);

  // Nếu không có giá gốc hợp lệ
  if (isNaN(originalPrice) || originalPrice <= 0) {
    return <p className="text-gray-500 text-sm">Liên hệ</p>;
  }

  // Xác định có giảm giá không
  const onSale =
    !isNaN(discountedPrice) &&
    discountedPrice > 0 &&
    discountedPrice < originalPrice;

  if (!onSale) {
    return (
      <p className="text-red-600 font-bold text-xl">
        {originalPrice.toLocaleString("vi-VN")} VND
      </p>
    );
  }

  // Nếu có khuyến mãi
  const discountPercent = Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100
  );

  return (
    <div className="flex flex-col">
      <p className="text-red-600 font-bold text-xl">
        {discountedPrice.toLocaleString("vi-VN")} VND
      </p>
      <div className="flex items-center gap-2">
        <del className="text-gray-400 text-sm">
          {originalPrice.toLocaleString("vi-VN")} VND
        </del>
        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-md">
          -{discountPercent}%
        </span>
      </div>
    </div>
  );
};

export default PriceDisplay;

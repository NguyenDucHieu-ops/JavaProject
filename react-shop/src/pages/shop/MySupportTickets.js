// src/pages/shop/MySupportTickets.js
// 📋 TẠO FILE MỚI VÀ DÁN CODE NÀY VÀO

import React, { useState, useEffect } from 'react';
import contactApi from '../../api/contactApi';
import { Link } from 'react-router-dom';

// ✅ MỚI: Helper lấy ảnh
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

// Component con để hiển thị 1 ticket
const TicketItem = ({ ticket }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusClass = (status) => {
        return status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800';
    };

    return (
        <div className="border border-gray-200 rounded-lg">
            {/* Header của Ticket */}
            <button
                className="flex justify-between items-center w-full p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                        {ticket.status === 'PENDING' ? 'Đang chờ' : 'Đã trả lời'}
                    </span>
                    <span className="ml-3 font-medium text-gray-900">
                        Chủ đề: {ticket.topic}
                    </span>
                    {ticket.orderId && (
                        <span className="ml-2 text-sm text-gray-500">
                            (ĐH: #{ticket.orderId})
                        </span>
                    )}
                </div>
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-3">
                        {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                        ▼
                    </span>
                </div>
            </button>

            {/* Nội dung chi tiết */}
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    {/* Tin nhắn của User */}
                    <div className="mb-4">
                        <p className="font-semibold text-sm text-gray-800 mb-1">Yêu cầu của bạn:</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                            {ticket.message}
                        </p>
                        {/* ✅ MỚI: Hiển thị ảnh user đính kèm */}
                        {ticket.imageUrl && (
                            <a href={getImageUrl(ticket.imageUrl)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                                <img 
                                    src={getImageUrl(ticket.imageUrl)} 
                                    alt="Ảnh bạn đã gửi" 
                                    className="max-h-40 rounded-lg shadow-md"
                                />
                            </a>
                        )}
                    </div>

                    {/* Trả lời của Admin */}
                    {ticket.status === 'REPLIED' && ticket.adminReply ? (
                        <div>
                            <p className="font-semibold text-sm text-blue-800 mb-1">
                                Phản hồi từ DecaShop (lúc {new Date(ticket.repliedAt).toLocaleString('vi-VN')}):
                            </p>
                            <p className="text-gray-900 bg-blue-50 p-3 rounded-md border border-blue-200 whitespace-pre-wrap">
                                {ticket.adminReply}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-semibold text-sm text-yellow-800 mb-1">Chưa có phản hồi</p>
                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                Yêu cầu của bạn đang được xử lý. Vui lòng quay lại sau.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Component trang chính
const MySupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // ✅ SỬA LỖI: axiosClient đã trả về data
                const response = await contactApi.getMyTickets();
                setTickets(response);
            } catch (err) {
                setError('Không thể tải danh sách hỗ trợ.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    if (loading) return <div className="p-4 text-center">Đang tải...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Yêu cầu hỗ trợ của tôi
                </h1>
                <Link
                    to="/lien-he"
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                    Tạo yêu cầu mới
                </Link>
            </div>

            {tickets.length > 0 ? (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <TicketItem key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-10 rounded-lg shadow">
                    <p className="text-gray-600">Bạn chưa có yêu cầu hỗ trợ nào.</p>
                </div>
            )}
        </div>
    );
};

export default MySupportTickets;
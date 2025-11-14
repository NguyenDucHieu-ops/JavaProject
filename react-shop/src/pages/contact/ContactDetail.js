// src/pages/contact/ContactDetail.js
// 📋 THAY THẾ TOÀN BỘ FILE (Hiển thị ảnh + Sửa lỗi .data)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contactApi from '../../api/contactApi';

// ✅ MỚI: Helper lấy ảnh
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

const ContactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                // ✅ SỬA LỖI: axiosClient đã trả về data
                const response = await contactApi.getById(id);
                setContact(response); 
                setReplyMessage(response.adminReply || ''); 
            } catch (err) {
                setError('Không thể tải chi tiết liên hệ.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContact();
    }, [id]);

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (replyMessage.trim() === '') {
            alert('Vui lòng nhập nội dung trả lời.');
            return;
        }
        setIsReplying(true);
        try {
            await contactApi.reply(id, replyMessage);
            alert('Trả lời thành công!');
            navigate('/admin/contacts');
        } catch (err) {
            setError('Gửi trả lời thất bại.');
            console.error(err);
        } finally {
            setIsReplying(false);
        }
    };

    if (loading) return <div className="p-4">Đang tải chi tiết...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!contact) return <div className="p-4">Không tìm thấy liên hệ.</div>;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Chi tiết Hỗ trợ (ID: {contact.id})</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">Thông tin người gửi</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Người gửi:</strong> {contact.name}</p>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>User (nếu có):</strong> {contact.userName || 'Khách vãng lai'}</p>
                    <p><strong>Ngày gửi:</strong> {new Date(contact.createdAt).toLocaleString('vi-VN')}</p>
                    <p><strong>Chủ đề:</strong> <span className="font-medium text-blue-700">{contact.topic}</span></p>
                    <p><strong>Mã ĐH (nếu có):</strong> {contact.orderId || 'Không có'}</p>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">Nội dung yêu cầu của khách</h2>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{contact.message}</p>
                
                {/* ✅ MỚI: Hiển thị ảnh đính kèm */}
                {contact.imageUrl && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Ảnh đính kèm:</h3>
                        <a href={getImageUrl(contact.imageUrl)} target="_blank" rel="noopener noreferrer">
                            <img 
                                src={getImageUrl(contact.imageUrl)} 
                                alt="Ảnh đính kèm" 
                                className="max-w-xs rounded-lg shadow-md cursor-pointer"
                            />
                        </a>
                    </div>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                    {contact.status === 'REPLIED' ? 'Nội dung đã trả lời' : 'Soạn trả lời'}
                </h2>
                <form onSubmit={handleSubmitReply}>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="8"
                        placeholder="Nhập nội dung trả lời của bạn..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        disabled={contact.status === 'REPLIED' && !isReplying}
                    />
                    <div className="text-right mt-4">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                            disabled={isReplying}
                        >
                            {isReplying ? 'Đang gửi...' : (contact.status === 'REPLIED' ? 'Cập nhật trả lời' : 'Gửi trả lời')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactDetail;
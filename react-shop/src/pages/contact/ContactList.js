// src/pages/contact/ContactList.js
// 📋 TẠO FILE MỚI VÀ DÁN CODE NÀY VÀO

import React, { useState, useEffect } from 'react';
import contactApi from '../../api/contactApi';
import { Link } from 'react-router-dom';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                // ✅ SỬA LỖI: axiosClient đã trả về data
                const response = await contactApi.getAll();
                setContacts(response);
            } catch (err) {
                setError('Không thể tải danh sách liên hệ.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    const getStatusClass = (status) => {
        return status === 'PENDING' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800';
    };

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý Liên hệ / Hỗ trợ</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người gửi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contacts.map((contact) => (
                            <tr key={contact.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(contact.status)}`}>
                                        {contact.status === 'PENDING' ? 'Chờ trả lời' : 'Đã trả lời'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.topic}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.name} ({contact.email})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(contact.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/contacts/${contact.id}`} className="text-blue-600 hover:text-blue-900">
                                        Xem và Trả lời
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactList;
package com.example.demo.service;

import com.example.demo.dto.ContactDto;
import com.example.demo.entity.ContactEntity;
import org.springframework.web.multipart.MultipartFile; // ✅ MỚI
import java.util.List;

public interface ContactService {

    // ✅ CẬP NHẬT: Thêm MultipartFile
    ContactEntity saveContact(ContactDto contactDto, String username, MultipartFile file);

    // Các hàm cho Admin
    List<ContactDto> getAllContacts();

    ContactDto getContactById(Long id);

    ContactEntity replyToContact(Long id, String replyMessage);

    // Hàm cho user xem ticket của họ
    List<ContactDto> findMyContacts(String username);
}
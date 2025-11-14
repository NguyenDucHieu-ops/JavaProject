package com.example.demo.service.impl;

import com.example.demo.dto.ContactDto;
import com.example.demo.entity.ContactEntity;
import com.example.demo.entity.UserEntity;
import com.example.demo.repository.ContactRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ContactService;
import com.example.demo.service.StorageService; // ✅ MỚI
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // ✅ MỚI

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImpl implements ContactService {

    @Autowired
    private ContactRepository contactRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StorageService storageService; // ✅ MỚI

    @Override
    public ContactEntity saveContact(ContactDto contactDto, String username, MultipartFile file) { // ✅ CẬP NHẬT
        UserEntity user = null;
        if (username != null && !username.isEmpty()) {
            user = userRepository.findByUsername(username).orElse(null);
        }

        // ✅ MỚI: Xử lý lưu file
        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            imageUrl = storageService.store(file); // Lưu file và lấy đường dẫn
        }

        ContactEntity contact = new ContactEntity();
        contact.setName(contactDto.getName());
        contact.setEmail(contactDto.getEmail());
        contact.setMessage(contactDto.getMessage());
        contact.setTopic(contactDto.getTopic());
        contact.setOrderId(contactDto.getOrderId());
        contact.setCreatedAt(LocalDateTime.now());
        contact.setStatus("PENDING");
        contact.setUser(user);
        contact.setImageUrl(imageUrl); // ✅ MỚI: Gán đường dẫn ảnh

        return contactRepository.save(contact);
    }

    // --- CÁC HÀM CHO ADMIN ---
    @Override
    public List<ContactDto> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDto getContactById(Long id) {
        ContactEntity contact = contactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy liên hệ với ID: " + id));
        return convertToDto(contact);
    }

    @Override
    public ContactEntity replyToContact(Long id, String replyMessage) {
        ContactEntity contact = contactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy liên hệ với ID: " + id));

        contact.setAdminReply(replyMessage);
        contact.setStatus("REPLIED");
        contact.setRepliedAt(LocalDateTime.now());

        return contactRepository.save(contact);
    }

    // --- HÀM CHO USER ---
    @Override
    public List<ContactDto> findMyContacts(String username) {
        return contactRepository.findByUser_UsernameOrderByCreatedAtDesc(username).stream()
                .map(this::convertToDto) // Tái sử dụng hàm helper
                .collect(Collectors.toList());
    }

    /**
     * Hàm Helper (Cập nhật)
     */
    private ContactDto convertToDto(ContactEntity entity) {
        ContactDto dto = new ContactDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setMessage(entity.getMessage());
        dto.setTopic(entity.getTopic());
        dto.setOrderId(entity.getOrderId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setStatus(entity.getStatus());
        dto.setAdminReply(entity.getAdminReply());
        dto.setRepliedAt(entity.getRepliedAt());
        dto.setImageUrl(entity.getImageUrl()); // ✅ MỚI: Thêm ảnh
        if (entity.getUser() != null) {
            dto.setUserName(entity.getUser().getName());
        }
        return dto;
    }
}
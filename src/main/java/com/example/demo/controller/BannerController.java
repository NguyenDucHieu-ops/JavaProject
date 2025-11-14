package com.example.demo.controller;

import com.example.demo.entity.BannerEntity;
import com.example.demo.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @Value("${upload.path}")
    private String uploadPath;

    // ✅ Lấy tất cả banner
    @GetMapping
    public List<BannerEntity> getAll() {
        return bannerService.getAll();
    }

    // ✅ Lấy 1 banner theo id
    @GetMapping("/{id}")
    public BannerEntity getById(@PathVariable Long id) {
        return bannerService.getById(id);
    }

    // ✅ Tạo banner mới (có thể có file ảnh)
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<BannerEntity> create(
            @RequestPart("banner") BannerEntity banner,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

        System.out.println("🟢 [CREATE] Nhận banner: " + banner);
        System.out.println("🟢 [CREATE] File upload: " + (file != null ? file.getOriginalFilename() : "Không có file"));

        // Nếu có file upload
        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());

            // Tạo thư mục upload nếu chưa tồn tại
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            File dest = new File(uploadDir, fileName);
            file.transferTo(dest);

            // Lưu đường dẫn tương đối vào DB
            banner.setImage("/uploads/" + fileName);
        }

        BannerEntity saved = bannerService.create(banner);
        return ResponseEntity.ok(saved);
    }

    // ✅ Cập nhật banner (có thể có ảnh mới)
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<BannerEntity> update(
            @PathVariable Long id,
            @RequestPart("banner") BannerEntity banner,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

        System.out.println("🟡 [UPDATE] Nhận banner id=" + id);
        System.out.println("🟡 [UPDATE] File upload: " + (file != null ? file.getOriginalFilename() : "Không có file"));

        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());

            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            File dest = new File(uploadDir, fileName);
            file.transferTo(dest);

            banner.setImage("/uploads/" + fileName);
        }

        BannerEntity updated = bannerService.update(id, banner);
        return ResponseEntity.ok(updated);
    }

    // ✅ Xóa banner
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

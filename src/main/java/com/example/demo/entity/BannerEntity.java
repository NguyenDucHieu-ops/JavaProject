package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String image; // ✅ chỉ dùng 1 trường ảnh

    private String link;

    @Column(columnDefinition = "TINYINT(1)")
    private boolean status;

    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

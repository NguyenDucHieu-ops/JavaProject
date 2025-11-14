package com.example.demo.service.impl;

import com.example.demo.entity.BannerEntity;
import com.example.demo.repository.BannerRepository;
import com.example.demo.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerEntity> getAll() {
        return bannerRepository.findAll();
    }

    @Override
    public BannerEntity getById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner với id = " + id));
    }

    @Override
    public BannerEntity create(BannerEntity banner) {
        banner.setCreatedAt(LocalDateTime.now());
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    @Override
    public BannerEntity update(Long id, BannerEntity newBanner) {
        BannerEntity existing = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner với id = " + id));

        existing.setTitle(newBanner.getTitle());
        existing.setDescription(newBanner.getDescription());
        existing.setStatus(newBanner.isStatus());
        existing.setLink(newBanner.getLink());

        if (newBanner.getImage() != null && !newBanner.getImage().isEmpty()) {
            existing.setImage(newBanner.getImage());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new RuntimeException("Không tồn tại banner id = " + id);
        }
        bannerRepository.deleteById(id);
    }
}

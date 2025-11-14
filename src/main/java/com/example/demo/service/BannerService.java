package com.example.demo.service;

import com.example.demo.entity.BannerEntity;
import java.util.List;

public interface BannerService {
    List<BannerEntity> getAll();

    BannerEntity getById(Long id);

    BannerEntity create(BannerEntity banner);

    BannerEntity update(Long id, BannerEntity banner);

    void delete(Long id);
}

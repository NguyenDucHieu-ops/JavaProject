package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.BannerEntity;

public interface BannerRepository extends JpaRepository<BannerEntity, Long> {
}

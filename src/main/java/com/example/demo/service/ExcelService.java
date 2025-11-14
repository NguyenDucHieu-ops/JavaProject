package com.example.demo.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;

public interface ExcelService {
    void save(MultipartFile file);

    ByteArrayInputStream load();
}
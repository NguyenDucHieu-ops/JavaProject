package com.example.demo.config;

import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Optional<UserEntity> adminOptional = userRepository.findByUsername("admin");

        if (adminOptional.isEmpty()) {
            UserEntity admin = UserEntity.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .name("System Admin")
                    .email("admin@store.com")
                    .role("ADMIN")
                    .status("ACTIVE")
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Default admin created: admin / admin123");
        } else {
            UserEntity admin = adminOptional.get();
            if (!"ADMIN".equals(admin.getRole())) {
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("✅ Existing admin role corrected.");
            }
        }
    }
}

package com.example.demo.service.impl;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserProfileDto; // ✅ MỚI
import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import com.example.demo.service.EmailService;
import com.example.demo.service.StorageService; // ✅ MỚI
import com.example.demo.repository.OtpRepository;
import com.example.demo.entity.OtpEntity;
import com.example.demo.security.JwtTokenProvider;
import jakarta.persistence.EntityNotFoundException; // ✅ MỚI
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile; // ✅ MỚI

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;
        private final AuthenticationManager authManager;
        private final EmailService emailService;
        private final OtpRepository otpRepository;
        private final StorageService storageService; // ✅ MỚI

        private final Map<String, OtpInfo> otpStore = new HashMap<>();

        public UserServiceImpl(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtTokenProvider tokenProvider,
                        AuthenticationManager authManager,
                        EmailService emailService,
                        OtpRepository otpRepository,
                        StorageService storageService) { // ✅ MỚI
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.tokenProvider = tokenProvider;
                this.authManager = authManager;
                this.emailService = emailService;
                this.otpRepository = otpRepository;
                this.storageService = storageService; // ✅ MỚI
        }

        // ---------------------------
        // Auth: register / login (Code cũ của bạn)
        // ---------------------------
        @Override
        public Map<String, Object> register(RegisterRequest request) {
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("Username already exists");
                }
                String role = request.getRole();
                if (role == null || role.isBlank())
                        role = "ROLE_USER";
                UserEntity u = UserEntity.builder()
                                .username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName())
                                .email(request.getEmail())
                                .address(request.getAddress())
                                .phoneNumber(request.getPhoneNumber())
                                .role(role)
                                .status("ACTIVE")
                                .build();
                userRepository.save(u);
                var authentication = new UsernamePasswordAuthenticationToken(u.getUsername(), request.getPassword());
                authManager.authenticate(authentication);
                var userDetails = new org.springframework.security.core.userdetails.User(
                                u.getUsername(), u.getPassword(),
                                List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                u.getRole())));
                String token = tokenProvider.generateToken(
                                new UsernamePasswordAuthenticationToken(userDetails, null,
                                                userDetails.getAuthorities()));
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("role", u.getRole());
                response.put("username", u.getUsername());
                return response;
        }

        @Override
        public Map<String, Object> login(LoginRequest request) {
                try {
                        System.out.println("Login attempt - Username: " + request.getUsername() + ", IsAdmin: "
                                        + request.isAdmin());
                        UserEntity user = userRepository.findByUsername(request.getUsername())
                                        .orElseThrow(() -> new RuntimeException("User not found"));
                        if (request.isAdmin() && !"ROLE_ADMIN".equals(user.getRole())) {
                                throw new RuntimeException("Không có quyền admin");
                        }
                        Authentication authentication = authManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getUsername(),
                                                        request.getPassword()));
                        String token = tokenProvider.generateToken(authentication);
                        Map<String, Object> response = new HashMap<>();
                        response.put("token", token);
                        response.put("role", user.getRole());
                        response.put("username", user.getUsername());
                        response.put("email", user.getEmail()); // Thêm email vào response
                        response.put("name", user.getName()); // Thêm name vào response
                        System.out.println("Login successful - Role: " + user.getRole());
                        return response;
                } catch (BadCredentialsException ex) {
                        throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu");
                }
        }

        // ---------------------------
        // User CRUD (Code cũ của bạn)
        // ---------------------------
        @Override
        public List<UserEntity> getAllUsers() {
                return userRepository.findAll();
        }

        @Override
        public UserEntity getUserById(Long id) {
                return userRepository.findById(id).orElse(null);
        }

        @Override
        public UserEntity createUser(UserEntity user) {
                if (userRepository.existsByUsername(user.getUsername()))
                        throw new RuntimeException("Username already exists");
                if (user.getPassword() == null || user.getPassword().isBlank())
                        throw new RuntimeException("Password cannot be empty");
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                if (user.getStatus() == null || user.getStatus().isBlank())
                        user.setStatus("ACTIVE");
                if (user.getRole() == null || user.getRole().isBlank())
                        user.setRole("ROLE_USER");
                return userRepository.save(user);
        }

        @Override
        public UserEntity updateUser(Long id, UserEntity updatedUser) {
                return userRepository.findById(id).map(user -> {
                        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank())
                                user.setUsername(updatedUser.getUsername());
                        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank())
                                user.setEmail(updatedUser.getEmail());
                        if (updatedUser.getName() != null && !updatedUser.getName().isBlank())
                                user.setName(updatedUser.getName());
                        if (updatedUser.getAddress() != null)
                                user.setAddress(updatedUser.getAddress());
                        if (updatedUser.getPhoneNumber() != null)
                                user.setPhoneNumber(updatedUser.getPhoneNumber());
                        if (updatedUser.getDateOfBirth() != null)
                                user.setDateOfBirth(updatedUser.getDateOfBirth());
                        if (updatedUser.getRole() != null && !updatedUser.getRole().isBlank())
                                user.setRole(updatedUser.getRole());
                        if (updatedUser.getStatus() != null && !updatedUser.getStatus().isBlank())
                                user.setStatus(updatedUser.getStatus());
                        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank())
                                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                        user.setUpdatedAt(java.time.LocalDateTime.now());
                        return userRepository.save(user);
                }).orElse(null);
        }

        @Override
        public boolean deleteUser(Long id) {
                if (userRepository.existsById(id)) {
                        userRepository.deleteById(id);
                        return true;
                }
                return false;
        }

        // ---------------------------
        // OTP logic (Code cũ của bạn)
        // ---------------------------
        private static class OtpInfo {
                final String otp;
                final LocalDateTime expireAt;

                OtpInfo(String otp, LocalDateTime expireAt) {
                        this.otp = otp;
                        this.expireAt = expireAt;
                }
        }

        @Override
        public boolean sendOtpForForgotPassword(String usernameOrEmail) {
                Optional<UserEntity> userOpt = userRepository.findByUsername(usernameOrEmail);
                if (userOpt.isEmpty())
                        userOpt = userRepository.findByEmail(usernameOrEmail);
                if (userOpt.isEmpty())
                        return false;
                UserEntity user = userOpt.get();
                String key = user.getUsername();
                String email = user.getEmail();
                String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
                LocalDateTime expireAt = LocalDateTime.now().plusMinutes(5);
                otpStore.put(key, new OtpInfo(otp, expireAt));
                if (otpRepository != null && email != null) {
                        OtpEntity e = otpRepository.findByEmail(email)
                                        .orElseGet(() -> OtpEntity.builder().email(email).build());
                        e.setOtp(otp);
                        e.setExpirationTime(expireAt);
                        otpRepository.save(e);
                }
                if (email != null && emailService != null) {
                        String text = "Mã OTP của bạn để đặt lại mật khẩu: " + otp + "\nMã có hiệu lực trong 5 phút.";
                        try {
                                emailService.sendEmail(email, "OTP đặt lại mật khẩu", text);
                        } catch (Exception ex) {
                                System.out.println("Gửi email thất bại: " + ex.getMessage());
                        }
                } else {
                        System.out.println("OTP for user " + key + " = " + otp + " (expires at " + expireAt + ")");
                }
                return true;
        }

        @Override
        public boolean resetPasswordWithOtp(String usernameOrEmail, String otp, String newPassword) {
                Optional<UserEntity> userOpt = userRepository.findByUsername(usernameOrEmail);
                if (userOpt.isEmpty())
                        userOpt = userRepository.findByEmail(usernameOrEmail);
                if (userOpt.isEmpty())
                        return false;
                UserEntity user = userOpt.get();
                String key = user.getUsername();
                OtpInfo info = otpStore.get(key);
                if (info == null && otpRepository != null && user.getEmail() != null) {
                        Optional<OtpEntity> oe = otpRepository.findByEmail(user.getEmail());
                        if (oe.isPresent()) {
                                OtpEntity e = oe.get();
                                if (e.getOtp().equals(otp) && e.getExpirationTime().isAfter(LocalDateTime.now())) {
                                        user.setPassword(passwordEncoder.encode(newPassword));
                                        userRepository.save(user);
                                        otpRepository.delete(e);
                                        return true;
                                } else {
                                        return false;
                                }
                        } else {
                                return false;
                        }
                }
                if (info == null)
                        return false;
                if (!info.otp.equals(otp))
                        return false;
                if (info.expireAt.isBefore(LocalDateTime.now())) {
                        otpStore.remove(key);
                        return false;
                }
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                otpStore.remove(key);
                return true;
        }

        // ------------------------------------
        // ✅ MỚI: CÁC HÀM PROFILE
        // ------------------------------------

        @Override
        public UserProfileDto getProfileByUsername(String username) {
                UserEntity user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
                return mapToDto(user);
        }

        @Override
        public UserProfileDto updateProfile(String username, UserProfileDto profileDto) {
                UserEntity user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

                user.setName(profileDto.getName());
                user.setEmail(profileDto.getEmail());
                user.setPhoneNumber(profileDto.getPhoneNumber()); // Map DTO.phoneNumber -> Entity.phoneNumber
                user.setAddress(profileDto.getAddress());

                UserEntity updatedUser = userRepository.save(user);
                return mapToDto(updatedUser);
        }

        @Override
        public UserProfileDto updateAvatar(String username, MultipartFile file) {
                UserEntity user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

                String filePath = storageService.store(file);
                user.setAvatar(filePath);
                UserEntity updatedUser = userRepository.save(user);

                return mapToDto(updatedUser);
        }

        // --- Hàm Helper ---
        private UserProfileDto mapToDto(UserEntity user) {
                UserProfileDto dto = new UserProfileDto();
                dto.setUsername(user.getUsername());
                dto.setName(user.getName());
                dto.setEmail(user.getEmail());
                dto.setPhoneNumber(user.getPhoneNumber()); // Map từ Entity.phoneNumber
                dto.setAddress(user.getAddress());
                dto.setAvatar(user.getAvatar());
                return dto;
        }
}
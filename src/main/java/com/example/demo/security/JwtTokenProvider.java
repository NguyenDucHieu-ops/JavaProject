package com.example.demo.security; // Giữ nguyên package của bạn

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // ✅ ĐÂY LÀ CHUỖI CỐ ĐỊNH, DÀI VÀ AN TOÀN
    private static final String SECRET_KEY_STRING = "DayLaMotChuoiBiMatAnToanVaDuDaiDeMaHoaHS512CuaToi_BanHayThayTheNoNgayLapTucNeuMuon";

    // ✅ Tạo key CỐ ĐỊNH từ chuỗi
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());

    private final long jwtExpiration = 864000000; // 10 ngày

    public JwtTokenProvider() {
        System.out.println("\n\n✅✅✅ [BẰNG CHỨNG] JwtTokenProvider VỚI KEY CỐ ĐỊNH ĐANG CHẠY! ✅✅✅\n\n");
        logger.info("JwtTokenProvider initialized with FIXED secret key.");
    }
    // --------------------------------------------------

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        logger.info("Creating token for user: {} with roles: {}", username, roles);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles) // <-- Thêm "roles" vào token
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512) // Dùng key cố định
                .compact();
    }

    public Claims getClaimsFromJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key) // Dùng key cố định
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            logger.info("Claims extracted from token. Roles: {}", claims.get("roles"));
            return claims;
        } catch (Exception e) {
            logger.error("Could not extract claims from token: {}", e.getMessage());
            throw new RuntimeException("Invalid token");
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); // Dùng key cố định
            return true;
        } catch (Exception e) {
            logger.error("JWT validation error: {}", e.getMessage());
            return false;
        }
    }
}
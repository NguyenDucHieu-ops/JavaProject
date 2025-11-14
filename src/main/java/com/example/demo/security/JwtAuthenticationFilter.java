package com.example.demo.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String requestPath = request.getRequestURI();

        // Skip filter for login and register endpoints
        if (requestPath.equals("/api/auth/login") ||
                requestPath.equals("/api/auth/register-admin") ||
                requestPath.equals("/api/auth/register") ||
                requestPath.startsWith("/api/auth/user")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = getJwtFromRequest(request);
            logger.info("JWT from request: {}", jwt);
            if (StringUtils.hasText(jwt)) {
                if (tokenProvider.validateToken(jwt)) {
                    Claims claims = tokenProvider.getClaimsFromJWT(jwt);
                    String username = claims.getSubject();
                    String roles = (String) claims.get("roles");
                    logger.info("Decoded JWT - username: {}, roles: {}", username, roles);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles.split(","))
                                .map(String::trim)
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());

                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username,
                                null,
                                authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        logger.info("Authentication set for user {} with authorities {}", username, authorities);
                    }
                } else {
                    logger.warn("JWT token không hợp lệ hoặc hết hạn: {}", jwt);
                }
            } else {
                logger.warn("Không tìm thấy JWT trong header Authorization");
            }
        } catch (Exception ex) {
            logger.error("JWT filter error", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

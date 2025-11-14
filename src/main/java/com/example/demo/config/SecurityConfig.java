package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Bật @PreAuthorize
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final AuthenticationProvider authenticationProvider;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                        AuthenticationProvider authenticationProvider) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.authenticationProvider = authenticationProvider;
                System.out.println("\n✅ [SecurityConfig] Cấu hình bảo mật khởi tạo thành công!\n");
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // --- PUBLIC ENDPOINTS ---
                                                .requestMatchers(
                                                                "/api/auth/login",
                                                                "/api/auth/register-admin",
                                                                "/api/auth/register",
                                                                "/api/auth/user/**",
                                                                "/uploads/**",
                                                                "/favicon.ico",
                                                                "/error",
                                                                "/api/users/forgot-password/send-otp",
                                                                "/api/users/forgot-password/reset")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/products/**",
                                                                "/api/categories/**",
                                                                "/api/banners/**",
                                                                "/api/reviews" // xem đánh giá public
                                                ).permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()

                                                // --- USER AUTHENTICATED ---
                                                .requestMatchers(HttpMethod.GET, "/api/users/profile").authenticated()
                                                .requestMatchers(HttpMethod.PUT, "/api/users/profile").authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/users/profile/avatar")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/contact/my-tickets")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/reviews").authenticated()
                                                .requestMatchers("/api/orders/**").authenticated()

                                                // --- ADMIN ONLY ---
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/products/**",
                                                                "/api/categories/**",
                                                                "/api/banners/**",
                                                                "/api/reviews/*/reply") // SỬA lại dòng này, KHÔNG dùng /**/reply
                                                .hasAuthority("ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.PUT,
                                                                "/api/products/**",
                                                                "/api/categories/**",
                                                                "/api/banners/**")
                                                .hasAuthority("ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.DELETE,
                                                                "/api/products/**",
                                                                "/api/categories/**",
                                                                "/api/banners/**")
                                                .hasAuthority("ROLE_ADMIN")
                                                .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN")
                                                .requestMatchers("/api/auth/users").hasAuthority("ROLE_ADMIN")
                                                .requestMatchers("/api/contact/**").hasAuthority("ROLE_ADMIN")

                                                // --- ANY OTHER REQUEST ---
                                                .anyRequest().authenticated())
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:3000"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
                config.setExposedHeaders(List.of("Authorization"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}

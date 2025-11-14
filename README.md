# 🚀 Báo cáo Dự án: Trang web Thương mại điện tử DecaShop

Trang web bán hàng thể thao (E-commerce) được xây dựng bằng Spring Boot (Backend) và React (Frontend). Dự án bao gồm đầy đủ các chức năng của một trang thương mại điện tử hiện đại, từ quản lý sản phẩm, giỏ hàng, đến các tính năng nâng cao như thanh toán, thống kê và bảo mật.

---

## 1. 🌟 Các tính năng nổi bật (Chức năng nâng cao)

Dự án đã hoàn thành các chức năng cơ bản (Quản lý CRUD cho Sản phẩm, Danh mục, User) và các chức năng nâng cao sau (vượt yêu cầu của phiếu điểm):

1.  **Admin Dashboard & Thống kê "Thật"**:
    * Trang Dashboard (`/admin`) hiển thị các số liệu thống kê **"thật" 100%** (Tổng đơn hàng, Tổng sản phẩm, Tổng khách hàng, Đơn chờ xử lý) được lấy trực tiếp từ CSDL qua API `GET /api/dashboard/stats`.
    * Hiển thị danh sách "5 Đơn hàng mới nhất" và "5 Sản phẩm mới thêm" (từ API `/latest`).

2.  **Thanh toán Nâng cao (Mô phỏng VietQR & COD)**:
    * Cho phép người dùng chọn 2 phương thức: "Thanh toán khi nhận hàng" (COD) hoặc "Thanh toán bằng mã QR".
    * Tự động **tạo mã QR động** theo chuẩn VietQR, hiển thị đúng tên shop ("DECA SHOP") và **tổng số tiền chính xác** của đơn hàng.
    * Mô phỏng "thanh toán thành công" bằng cách **tự động chuyển trang sau 5 giây** (giả lập Webhook).

3.  **Quên mật khẩu (OTP qua Email)**:
    * Người dùng có thể yêu cầu "Quên mật khẩu".
    * Hệ thống Backend (sử dụng `JavaMailSender`) sẽ gửi một mã OTP 6 số về email của người dùng.
    * Người dùng nhập OTP để xác thực và tạo mật khẩu mới.

4.  **Giỏ hàng Nâng cao & Phí ship động**:
    * Trong giỏ hàng (`/cart`), người dùng có thể **chọn/bỏ chọn từng sản phẩm** hoặc "Chọn tất cả".
    * Trang thanh toán (`/checkout`) chỉ xử lý và tính tiền các sản phẩm đã được chọn.
    * Mô phỏng **tính phí vận chuyển "thật"** (free ship, theo vùng HCM, Hà Nội...) dựa trên từ khóa trong ô địa chỉ.

5.  **Upload Ảnh (Full-stack)**:
    * Hỗ trợ upload ảnh lên server (hoặc Cloudinary) cho 3 luồng riêng biệt:
        * User upload **Avatar** (Trang "Thông tin tài khoản").
        * User gửi **Đánh giá Web** (kèm ảnh).
        * User gửi **Phiếu Hỗ trợ** (kèm ảnh).

6.  **Validate 2 Lớp (Backend & Frontend)**:
    * **Backend:** Sử dụng `Bean Validation` (`@NotBlank`, `@Email`, `@Size`, `@Pattern`) cho tất cả DTO đầu vào (Đăng ký, Đăng nhập, Đặt hàng, Gửi đánh giá...). Bắt lỗi bằng `GlobalExceptionHandler`.
    * **Frontend:** Báo lỗi "tức thì" (sử dụng `onBlur` và `useState`) cho người dùng khi họ nhập sai định dạng (email, SĐT), để trống, hoặc mật khẩu không khớp.

7.  **Quản lý (Admin)**:
    * Import/Export danh sách sản phẩm bằng file **Excel**.
    * Quản lý (CRUD) Banner, Đơn hàng, Đánh giá, và Phản hồi hỗ trợ.

8.  **Bảo mật & Phân quyền (JWT)**:
    * Sử dụng **JWT Token** để xác thực mọi API.
    * Phân quyền rõ ràng: Admin (`ROLE_ADMIN`) có thể truy cập `/admin`, User (`ROLE_USER`) chỉ có thể truy cập trang cá nhân, giỏ hàng (`AuthGuard` và `@PreAuthorize`).

---

## 2. Công nghệ sử dụng

* **Backend:** Spring Boot, Spring Security (JWT), Spring Data JPA, Lombok, Validation, JavaMailSender.
* **Frontend:** React, React Router, TailwindCSS, Axios, React-Modal, React-Paginate, React-Toastify.
* **Database:** MySQL.

---

## 3. Cài đặt & chạy (Local)

### Backend (Spring Boot)

1.  **Yêu cầu:** Java 17+, Maven, MySQL.
2.  **Cài đặt:**
    * Clone repository về máy.
    * Mở dự án bằng IntelliJ.
    * **Quan trọng:** Mở file `src/main/resources/application.properties`.
    * Cập nhật thông tin database của bạn (tạo một DB rỗng tên `decashop_db` trước):
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/decashop_db
        spring.datasource.username=root
        spring.datasource.password=yourpassword
        spring.jpa.hibernate.ddl-auto=update
        
        # Cấu hình JWT (BẮT BUỘC)
        jwt.secret=daylachuoiBiMatCuaBanKhoang32KyTuTroLenKeCaSoVaKyTuDacBiet
        
        # Cấu hình Email (cho chức năng Quên mật khẩu)
        spring.mail.host=smtp.gmail.com
        spring.mail.port=587
        spring.mail.username=emailcuaban@gmail.com
        spring.mail.password=app_password_cua_ban # (Lấy App Password của Google)
        spring.mail.properties.mail.smtp.auth=true
        spring.mail.properties.mail.smtp.starttls.enable=true
        ```
    * (Tùy chọn) Import file `database.sql` (nếu có) vào CSDL. Nếu không, `ddl-auto=update` sẽ tự tạo bảng.
    * Chạy file `DemoApplication.java`.
    * API sẽ chạy ở: `http://localhost:8080`

### Frontend (React)

1.  **Yêu cầu:** Node.js >= 16, npm.
2.  **Cài đặt:**
    * Mở terminal, `cd` vào thư mục frontend của dự án.
    * Chạy `npm install` để cài đặt các thư viện.
    * Chạy `npm start` để khởi động.
    * Ứng dụng chạy ở: `http://localhost:3000`

---

## 4. API Docs

* Xem chi tiết các endpoint backend tại file: `src/main/java/com/example/demo/controller/*`
* Một số endpoint chính:
    * `/api/auth/login` / `/api/auth/register`
    * `/api/auth/forgot-password` / `/api/auth/validate-otp`
    * `/api/products`
    * `/api/orders`
    * `/api/orders/my-orders`
    * `/api/users/profile`
    * `/api/dashboard/stats`
    * `/api/products/latest` / `/api/orders/latest`
    * `/api/products/import-excel` / `/api/products/export-excel`

---

## 5. Hướng dẫn thử / Tài khoản Demo

*(Bạn cần tạo các tài khoản này bằng tay trong CSDL hoặc qua API đăng ký)*

* **Tài khoản Admin:**
    * Username: `admin`
    * Password: `admin123`
* **Tài khoản User (Khách hàng):**
    * Username: `user`
    * Password: `123456`

---

## 6. Triển khai & Quản lý mã nguồn (Git)

* **Triển khai:**
    * **Frontend (React):** Deploy tự động qua **Netlify/Vercel** khi push lên GitHub.
    * **Backend (Spring Boot):** Deploy tự động qua **Render/Heroku** khi push lên GitHub.
    * Cần cấu hình các biến môi trường (DB_URL, JWT_SECRET, SPRING_MAIL_PASSWORD...) trên dịch vụ deploy.
* **Sử dụng GitHub:**
    * Tạo branch mới cho mỗi tính năng: `git checkout -b feature/ten-chuc-nang`
    * Commit & Push: `git commit -m "feat: Thêm chức năng Dashboard"` và `git push origin feature/ten-chuc-nang`
    * Tạo Pull Request trên GitHub để review và merge vào `main`.

---

**Tác giả:** NguyenDucHieu_2123110416
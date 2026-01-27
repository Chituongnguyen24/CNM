# Hệ thống Quản lý Sản Phẩm với Authentication (JWT + Session)

## Mô hình MVC

### 📁 Cấu trúc thư mục

```
lab1/
├── app.js                      # Entry point, cấu hình Express
├── .env                        # Biến môi trường (JWT_SECRET, SESSION_SECRET)
├── package.json
│
├── controllers/                # Controllers - Xử lý logic nghiệp vụ
│   ├── auth.controller.js      # Xử lý đăng ký, đăng nhập, đăng xuất
│   └── product.controller.js   # Xử lý CRUD sản phẩm
│
├── models/                     # Models - Tương tác với Database
│   ├── user.model.js           # Model cho bảng users
│   └── product.model.js        # Model cho bảng products
│
├── views/                      # Views - Giao diện EJS
│   ├── login.ejs               # Trang đăng nhập
│   ├── register.ejs            # Trang đăng ký
│   ├── products.ejs            # Danh sách sản phẩm
│   └── edit.ejs                # Sửa sản phẩm
│
├── routes/                     # Routes - Định tuyến
│   ├── auth.routes.js          # Routes cho authentication
│   └── product.routes.js       # Routes cho CRUD sản phẩm
│
├── middleware/                 # Middleware
│   └── auth.middleware.js      # Xác thực JWT token
│
└── db/
    ├── db.js                   # Kết nối database
    └── create_users_table.sql  # Script tạo bảng users
```

## 🔐 Hệ thống Authentication

### JWT + Session
- **JWT (JSON Web Token)**: Tạo token khi đăng nhập thành công
- **Express Session**: Lưu token và thông tin user vào session
- **bcryptjs**: Hash mật khẩu trước khi lưu vào database

### Flow đăng nhập:
1. User nhập username/password
2. Server kiểm tra thông tin trong database
3. Nếu đúng: Tạo JWT token, lưu vào session
4. Redirect đến trang products
5. Middleware `authenticateToken` kiểm tra token trước mỗi request

## 🚀 Cài đặt và Chạy

### 1. Tạo bảng users trong database

```sql
-- Chạy script trong db/create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Cấu hình file .env

Đảm bảo file `.env` có các biến sau:

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
SESSION_SECRET=your_session_secret_key_change_this_too_67890
PORT=3000
```

### 3. Chạy ứng dụng

```bash
npm start
# hoặc
node app.js
```

Truy cập: http://localhost:3000

## 📝 API Routes

### Authentication Routes
- `GET /auth/register` - Hiển thị trang đăng ký
- `POST /auth/register` - Xử lý đăng ký
- `GET /auth/login` - Hiển thị trang đăng nhập
- `POST /auth/login` - Xử lý đăng nhập
- `GET /auth/logout` - Đăng xuất

### Product Routes (Yêu cầu đăng nhập)
- `GET /products` - Danh sách sản phẩm
- `POST /products/add` - Thêm sản phẩm
- `GET /products/edit/:id` - Form sửa sản phẩm
- `POST /products/update` - Cập nhật sản phẩm
- `POST /products/delete/:id` - Xóa sản phẩm

## 🔒 Middleware Authentication

Tất cả routes trong `/products` được bảo vệ bởi middleware `authenticateToken`:

```javascript
router.use(authenticateToken);
```

Nếu chưa đăng nhập → redirect về `/auth/login`

## 💡 Tính năng

✅ Đăng ký tài khoản mới (hash password)
✅ Đăng nhập với JWT token
✅ Session management
✅ Bảo vệ routes với middleware
✅ CRUD sản phẩm (yêu cầu đăng nhập)
✅ Hiển thị thông tin user trên navbar
✅ Đăng xuất và xóa session
✅ Responsive UI với Bootstrap 5

## 🛡️ Bảo mật

- Mật khẩu được hash bằng bcrypt (salt rounds: 10)
- JWT token có thời hạn 24h
- Session cookie: httpOnly, maxAge 24h
- Token được verify trước mỗi request đến protected routes
- Kiểm tra duplicate username/email khi đăng ký

## 📦 Dependencies

```json
{
  "express": "~4.16.1",
  "ejs": "~2.6.1",
  "mysql2": "^3.16.0",
  "jsonwebtoken": "latest",
  "bcryptjs": "latest",
  "express-session": "latest",
  "dotenv": "latest"
}
```

## 🎯 Mô hình MVC Chi tiết

### Model (models/)
- Chứa logic tương tác với database
- Các method: `findAll()`, `findById()`, `create()`, `update()`, `delete()`
- Trả về Promise để xử lý async/await

### View (views/)
- EJS templates hiển thị giao diện
- Nhận data từ Controller thông qua `res.render()`
- Bootstrap 5 + Font Awesome cho UI đẹp

### Controller (controllers/)
- Nhận request từ Routes
- Gọi Model để xử lý data
- Trả response hoặc render View
- Xử lý logic nghiệp vụ (validation, error handling)

### Routes (routes/)
- Định nghĩa endpoint
- Gọi Controller method tương ứng
- Áp dụng middleware nếu cần

### Middleware (middleware/)
- `authenticateToken`: Verify JWT từ session
- `isLoggedIn`: Redirect nếu đã login (cho trang login/register)

---

**Lưu ý:** Nhớ thay đổi `JWT_SECRET` và `SESSION_SECRET` trong file `.env` trước khi deploy production!

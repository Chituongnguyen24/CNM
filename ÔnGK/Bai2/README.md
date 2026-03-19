# ProductHub - Node.js + Express + EJS + DynamoDB Local

## 1) Yêu cầu môi trường

- Node.js 18+
- Docker Desktop

## 2) Cài đặt

```bash
npm install
copy .env.example .env
```

## 3) Chạy DynamoDB Local (Docker)

```bash
docker compose up -d
```

Khởi tạo bảng `Products`:

```bash
npm run init-db
```

## 4) Chạy ứng dụng

```bash
npm start
```

Mở trình duyệt: `http://localhost:3000`

## 5) Cấu trúc MVC

```text
config/
controllers/
middleware/
models/
routes/
views/
public/
uploads/
scripts/
```

## 6) Chức năng đã có

- Danh sách sản phẩm trang chủ (EJS table + ảnh)
- Thêm sản phẩm + upload ảnh
- Sửa sản phẩm + upload ảnh mới
- Xóa sản phẩm
- Xem chi tiết sản phẩm
- Tìm kiếm theo tên
- Validate dữ liệu nhập
- Thông báo thành công/thất bại
- Xóa ảnh cũ khi thay ảnh và khi xóa sản phẩm

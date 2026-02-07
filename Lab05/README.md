# Lab05 - CRUD Node.js MVC với DynamoDB trên Docker

## Mô tả dự án
Ứng dụng CRUD quản lý sản phẩm sử dụng:
- **Node.js** + **Express.js** 
- Mô hình **MVC** (Model - View - Controller)
- **Amazon DynamoDB Local** chạy trên Docker
- **EJS** Template Engine
- **Docker Compose** để quản lý các container

## Cấu trúc bảng Products

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| id | String (UUID) | Mã sản phẩm (Primary Key) |
| name | String | Tên sản phẩm |
| price | Number | Giá sản phẩm (VNĐ) |
| url_image | String | URL hình ảnh sản phẩm |

## Cài đặt và chạy

### Yêu cầu
- Docker và Docker Compose đã được cài đặt

### Các bước thực hiện

1. **Clone dự án và di chuyển vào thư mục dự án:**
```bash
cd Lab05
```

2. **Tạo thư mục data cho DynamoDB:**
```bash
mkdir -p docker/dynamodb
```

3. **Khởi động tất cả các services bằng Docker Compose:**
```bash
docker-compose up -d
```

4. **Khởi tạo bảng Products:**
```bash
docker-compose exec app npm run init-table
```

5. **Truy cập ứng dụng:**
- Ứng dụng chính: http://localhost:3000
- Quản lý sản phẩm: http://localhost:3000/products
- DynamoDB Admin GUI: http://localhost:8001

## Các lệnh Docker hữu ích

```bash
# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down

# Khởi động lại
docker-compose restart

# Xây dựng lại image
docker-compose build --no-cache
```

## Cấu trúc dự án (MVC)

```
Lab05/
├── app.js                 # Entry point
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker build file
├── .env                  # Environment variables (DynamoDB credentials)
├── initTable.js          # Script tạo bảng Products
├── config/
│   └── dynamodb.js       # Cấu hình kết nối DynamoDB
├── models/
│   └── Product.js        # Model - xử lý CRUD với DynamoDB
├── controllers/
│   └── productController.js  # Controller - xử lý logic
├── routes/
│   └── products.js       # Routes cho products
├── views/
│   └── products/         # Views EJS
│       ├── index.ejs     # Danh sách sản phẩm
│       ├── add.ejs       # Form thêm sản phẩm
│       ├── edit.ejs      # Form sửa sản phẩm
│       └── show.ejs      # Chi tiết sản phẩm
└── public/               # Static files
```

## Biến môi trường (.env)

```env
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_REGION=ap-southeast-1
DYNAMODB_ENDPOINT=http://dynamodb-local:8000
TABLE_NAME=Products
PORT=3000
```

## Tác giả
Lab05 - Công Nghệ Mới

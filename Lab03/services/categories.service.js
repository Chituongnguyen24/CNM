/**
 * Categories Service
 * Quản lý danh mục - Chỉ dùng DynamoDB (primary key: id)
 * KHÔNG dùng mock data
 */

const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } =
    require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");

const TABLE_NAME = "Categories";

// Get all categories
exports.getAllCategories = async () => {
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    } catch (error) {
        console.error("❌ AWS DynamoDB Error (Categories):", error.message);
        throw error;
    }
};

// Get category by ID
exports.getCategoryById = async (id) => {
    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const result = await dynamoClient.send(command);
        return result.Item;
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Create category
exports.createCategory = async (category) => {
    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: category
        });
        await dynamoClient.send(command);
        return category;
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Update category
exports.updateCategory = async (id, data) => {
    try {
        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set #name = :n, description = :d",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":n": data.name,
                ":d": data.description
            }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Delete category (chỉ xoá category, KHÔNG xoá sản phẩm thuộc category)
exports.deleteCategory = async (id) => {
    try {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

/*
 * 📝 GIẢI THÍCH: VÌ SAO DYNAMODB KHÔNG JOIN NHƯ SQL?
 * ================================================================
 * 
 * 1. KIẾN TRÚC KHÁC BIỆT:
 *    - SQL (MySQL, PostgreSQL): Cơ sở dữ liệu quan hệ, lưu trữ dữ liệu theo hàng và bảng
 *    - DynamoDB: Cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dạng key-value/document
 * 
 * 2. LÝ DO DYNAMODB KHÔNG HỖ TRỢ JOIN:
 *    - DynamoDB được thiết kế cho hiệu suất cao với dữ liệu phân tán
 *    - JOIN yêu cầu quét nhiều bảng cùng lúc → tốn tài nguyên và chậm
 *    - DynamoDB tối ưu cho việc truy vấn theo khóa (Partition Key, Sort Key)
 * 
 * 3. CÁCH XỬ LÝ TRONG DYNAMODB:
 *    a) DENORMALIZATION (Phi chuẩn hóa):
 *       - Lưu trữ dữ liệu liên quan trong cùng một item
 *       - Ví dụ: Lưu tên category trực tiếp vào product
 *    
 *    b) APPLICATION-LEVEL JOIN:
 *       - Truy vấn từng bảng riêng biệt
 *       - Kết hợp dữ liệu trong code ứng dụng (như file này)
 *    
 *    c) SINGLE TABLE DESIGN:
 *       - Lưu tất cả entities trong một bảng với cấu trúc PK/SK thông minh
 * 
 * 4. VÍ DỤ TRONG DỰ ÁN NÀY:
 *    - Products lưu categoryId (String) thay vì Foreign Key
 *    - Khi hiển thị sản phẩm, ta query cả Products và Categories
 *    - Kết hợp dữ liệu trong code JavaScript
 * 
 * 5. ƯU ĐIỂM CỦA CÁCH TIẾP CẬN NÀY:
 *    - Hiệu suất cao khi scale lớn (millions of requests/second)
 *    - Không có single point of failure
 *    - Chi phí thấp với pay-per-use model
 */

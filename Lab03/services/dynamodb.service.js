const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } =
    require("@aws-sdk/lib-dynamodb");

const { dynamoClient } = require("../config/aws");

const TABLE_NAME = process.env.DYNAMODB_TABLE;

// In-memory mock data for when AWS is not configured
// Cấu trúc mới với categoryId, isDeleted, createdAt
let mockProducts = [
    {
        id: "1",
        name: "Sản phẩm mẫu 1",
        price: 100000,
        quantity: 10,
        categoryId: "cat-001",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "2",
        name: "Sản phẩm mẫu 2",
        price: 200000,
        quantity: 5,
        categoryId: "cat-002",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "3",
        name: "Sản phẩm đã xóa",
        price: 150000,
        quantity: 3,
        categoryId: "cat-001",
        url_image: "",
        isDeleted: true, // Soft deleted
        createdAt: new Date().toISOString()
    }
];

let useAWS = true; // Always try AWS first

// GET ALL - Chỉ lấy sản phẩm chưa bị soft delete (isDeleted = false hoặc không có trường này)
exports.getAllProducts = async () => {
    if (!useAWS) {
        console.log("Using mock data...");
        // Filter: chỉ lấy sản phẩm chưa bị xóa
        return mockProducts.filter(p => !p.isDeleted);
    }
    try {
        const command = new ScanCommand({ 
            TableName: TABLE_NAME,
            // Filter để không hiển thị sản phẩm đã soft delete
            FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
            ExpressionAttributeValues: {
                ":false": false
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    } catch (error) {
        console.error("❌ AWS DynamoDB Error:", error.message);
        console.log("⚠️  Switching to mock data mode...");
        useAWS = false;
        return mockProducts.filter(p => !p.isDeleted);
    }
};

// GET ALL (bao gồm cả đã xóa) - Dùng cho admin
exports.getAllProductsIncludeDeleted = async () => {
    if (!useAWS) {
        console.log("Using mock data (include deleted)...");
        return mockProducts;
    }
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    } catch (error) {
        console.error("❌ AWS DynamoDB Error:", error.message);
        useAWS = false;
        return mockProducts;
    }
};

exports.getProductById = async (id) => {
    if (!useAWS) {
        return mockProducts.find(p => p.id === id);
    }
    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const result = await dynamoClient.send(command);
        return result.Item;
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        return mockProducts.find(p => p.id === id);
    }
};

exports.createProduct = async (product) => {
    // Thêm các trường mới: isDeleted, createdAt
    const newProduct = {
        ...product,
        isDeleted: false,
        createdAt: new Date().toISOString()
    };

    if (!useAWS) {
        mockProducts.push(newProduct);
        return;
    }
    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: newProduct
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        mockProducts.push(newProduct);
    }
};

exports.updateProduct = async (id, data) => {
    if (!useAWS) {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts[index] = { ...mockProducts[index], ...data, id };
        }
        return;
    }
    try {
        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression:
                "set #name=:n, price=:p, quantity=:q, url_image=:u, categoryId=:c",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":n": data.name,
                ":p": data.price,
                ":q": data.quantity,
                ":u": data.url_image,
                ":c": data.categoryId || ""
            }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts[index] = { ...mockProducts[index], ...data, id };
        }
    }
};

// SOFT DELETE - Đánh dấu isDeleted = true thay vì xóa thật
exports.deleteProduct = async (id) => {
    if (!useAWS) {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts[index].isDeleted = true;
        }
        return;
    }
    try {
        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set isDeleted = :deleted",
            ExpressionAttributeValues: {
                ":deleted": true
            }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts[index].isDeleted = true;
        }
    }
};

// HARD DELETE - Xóa thật sự (chỉ admin dùng khi cần)
exports.hardDeleteProduct = async (id) => {
    if (!useAWS) {
        mockProducts = mockProducts.filter(p => p.id !== id);
        return;
    }
    try {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        mockProducts = mockProducts.filter(p => p.id !== id);
    }
};

// RESTORE - Khôi phục sản phẩm đã soft delete
exports.restoreProduct = async (id) => {
    if (!useAWS) {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts[index].isDeleted = false;
        }
        return;
    }
    try {
        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set isDeleted = :deleted",
            ExpressionAttributeValues: {
                ":deleted": false
            }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            mockProducts[index].isDeleted = false;
        }
    }
};

// GET PRODUCTS BY CATEGORY
exports.getProductsByCategory = async (categoryId) => {
    if (!useAWS) {
        return mockProducts.filter(p => p.categoryId === categoryId && !p.isDeleted);
    }
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "categoryId = :catId AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
            ExpressionAttributeValues: {
                ":catId": categoryId,
                ":false": false
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        return mockProducts.filter(p => p.categoryId === categoryId && !p.isDeleted);
    }
};

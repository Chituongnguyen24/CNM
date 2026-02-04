/**
 * Products Repository
 * Quản lý sản phẩm trong DynamoDB - Không có mock data
 */

const BaseRepository = require("./base.repository");
const { ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");

class ProductsRepository extends BaseRepository {
    constructor() {
        super(process.env.DYNAMODB_TABLE || "Products", "id");
    }

    // Lấy tất cả sản phẩm (chưa bị soft delete)
    async findAllActive() {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
            ExpressionAttributeValues: {
                ":false": false
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Lấy tất cả sản phẩm (bao gồm đã xóa)
    async findAllIncludeDeleted() {
        return await this.findAll();
    }

    // Lấy sản phẩm đã xóa
    async findDeleted() {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "isDeleted = :true",
            ExpressionAttributeValues: {
                ":true": true
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Lọc sản phẩm theo category
    async findByCategory(categoryId) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "categoryId = :catId AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
            ExpressionAttributeValues: {
                ":catId": categoryId,
                ":false": false
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Tìm kiếm theo tên (contains)
    async searchByName(searchTerm) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "contains(#name, :search) AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":search": searchTerm,
                ":false": false
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Lọc theo khoảng giá
    async findByPriceRange(minPrice, maxPrice) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "price BETWEEN :min AND :max AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
            ExpressionAttributeValues: {
                ":min": minPrice,
                ":max": maxPrice,
                ":false": false
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Lọc nâng cao (category + giá + tìm kiếm)
    async advancedSearch({ categoryId, minPrice, maxPrice, searchTerm }) {
        let filterParts = ["(attribute_not_exists(isDeleted) OR isDeleted = :false)"];
        const expressionValues = { ":false": false };
        const expressionNames = {};

        if (categoryId) {
            filterParts.push("categoryId = :catId");
            expressionValues[":catId"] = categoryId;
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
            filterParts.push("price BETWEEN :minPrice AND :maxPrice");
            expressionValues[":minPrice"] = Number(minPrice);
            expressionValues[":maxPrice"] = Number(maxPrice);
        } else if (minPrice !== undefined) {
            filterParts.push("price >= :minPrice");
            expressionValues[":minPrice"] = Number(minPrice);
        } else if (maxPrice !== undefined) {
            filterParts.push("price <= :maxPrice");
            expressionValues[":maxPrice"] = Number(maxPrice);
        }

        if (searchTerm) {
            filterParts.push("contains(#name, :search)");
            expressionValues[":search"] = searchTerm;
            expressionNames["#name"] = "name";
        }

        const params = {
            TableName: this.tableName,
            FilterExpression: filterParts.join(" AND "),
            ExpressionAttributeValues: expressionValues
        };

        if (Object.keys(expressionNames).length > 0) {
            params.ExpressionAttributeNames = expressionNames;
        }

        const command = new ScanCommand(params);
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Soft delete
    async softDelete(id) {
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: "SET isDeleted = :true, deletedAt = :deletedAt",
            ExpressionAttributeValues: {
                ":true": true,
                ":deletedAt": new Date().toISOString()
            }
        });
        await dynamoClient.send(command);
    }

    // Khôi phục sản phẩm
    async restore(id) {
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: "SET isDeleted = :false REMOVE deletedAt",
            ExpressionAttributeValues: {
                ":false": false
            }
        });
        await dynamoClient.send(command);
    }

    // Cập nhật số lượng tồn kho
    async updateQuantity(id, quantity) {
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: "SET quantity = :qty",
            ExpressionAttributeValues: {
                ":qty": quantity
            }
        });
        await dynamoClient.send(command);
    }
}

module.exports = new ProductsRepository();

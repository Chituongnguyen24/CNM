/**
 * ProductLogs Repository
 * Ghi lại lịch sử thao tác với sản phẩm (Audit Log)
 */

const BaseRepository = require("./base.repository");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

class ProductLogsRepository extends BaseRepository {
    constructor() {
        super("ProductLogs", "id");
    }

    // Ghi log thao tác
    async logAction(productId, action, userId, details = {}) {
        const logEntry = {
            id: uuidv4(),
            productId,
            action, // CREATE, UPDATE, DELETE, RESTORE
            userId,
            details: JSON.stringify(details),
            time: new Date().toISOString()
        };
        await this.create(logEntry);
        return logEntry;
    }

    // Lấy logs theo productId
    async findByProductId(productId) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "productId = :productId",
            ExpressionAttributeValues: {
                ":productId": productId
            }
        });
        const result = await dynamoClient.send(command);
        // Sắp xếp theo thời gian mới nhất
        return (result.Items || []).sort((a, b) => 
            new Date(b.time) - new Date(a.time)
        );
    }

    // Lấy logs theo userId
    async findByUserId(userId) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        });
        const result = await dynamoClient.send(command);
        return (result.Items || []).sort((a, b) => 
            new Date(b.time) - new Date(a.time)
        );
    }

    // Lấy logs theo action
    async findByAction(action) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "#action = :action",
            ExpressionAttributeNames: {
                "#action": "action"
            },
            ExpressionAttributeValues: {
                ":action": action
            }
        });
        const result = await dynamoClient.send(command);
        return (result.Items || []).sort((a, b) => 
            new Date(b.time) - new Date(a.time)
        );
    }

    // Lấy tất cả logs (sắp xếp theo thời gian)
    async findAllSorted() {
        const logs = await this.findAll();
        return logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    }
}

module.exports = new ProductLogsRepository();

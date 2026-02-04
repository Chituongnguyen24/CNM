/**
 * Carts Repository
 * Quản lý giỏ hàng trong DynamoDB
 */

const BaseRepository = require("./base.repository");
const { ScanCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");

class CartsRepository extends BaseRepository {
    constructor() {
        super("Carts", "id");
    }

    // Lấy giỏ hàng của user
    async findByUserId(userId) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Tìm item trong giỏ theo userId và productId
    async findCartItem(userId, productId) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "userId = :userId AND productId = :productId",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":productId": productId
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }

    // Cập nhật số lượng
    async updateQuantity(cartItemId, quantity) {
        await this.update(cartItemId, { 
            quantity,
            updatedAt: new Date().toISOString()
        });
    }

    // Xóa tất cả items trong giỏ của user
    async clearCart(userId) {
        const items = await this.findByUserId(userId);
        for (const item of items) {
            await this.delete(item.id);
        }
    }
}

module.exports = new CartsRepository();

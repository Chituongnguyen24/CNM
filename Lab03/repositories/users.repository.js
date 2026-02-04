/**
 * Users Repository
 * Quản lý người dùng trong DynamoDB - Không có mock data
 */

const BaseRepository = require("./base.repository");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");

class UsersRepository extends BaseRepository {
    constructor() {
        super("Users", "id");
    }

    // Tìm user theo username
    async findByUsername(username) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }

    // Lấy tất cả users (không trả về password)
    async findAllWithoutPassword() {
        const users = await this.findAll();
        return users.map(u => ({ ...u, password: undefined }));
    }

    // Lấy user theo ID (không trả về password)
    async findByIdWithoutPassword(id) {
        const user = await this.findById(id);
        if (user) {
            return { ...user, password: undefined };
        }
        return null;
    }

    // Lấy users theo role
    async findByRole(role) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "#role = :role",
            ExpressionAttributeNames: {
                "#role": "role"
            },
            ExpressionAttributeValues: {
                ":role": role
            }
        });
        const result = await dynamoClient.send(command);
        return (result.Items || []).map(u => ({ ...u, password: undefined }));
    }
}

module.exports = new UsersRepository();

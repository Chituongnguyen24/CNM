/**
 * Base Repository - Lớp cơ sở cho tất cả repository
 * Cung cấp các phương thức CRUD cơ bản với DynamoDB
 */

const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } =
    require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");

class BaseRepository {
    constructor(tableName, primaryKey = "id") {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
    }

    // Scan tất cả items
    async findAll(filterExpression = null, expressionValues = null) {
        const params = { TableName: this.tableName };
        
        if (filterExpression) {
            params.FilterExpression = filterExpression;
            params.ExpressionAttributeValues = expressionValues;
        }

        const command = new ScanCommand(params);
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }

    // Lấy item theo primary key
    async findById(id) {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: { [this.primaryKey]: id }
        });
        const result = await dynamoClient.send(command);
        return result.Item || null;
    }

    // Tạo item mới
    async create(item) {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item
        });
        await dynamoClient.send(command);
        return item;
    }

    // Cập nhật item
    async update(id, data, expressionAttributeNames = {}) {
        const updateExpressions = [];
        const expressionAttributeValues = {};

        Object.keys(data).forEach((key, index) => {
            const valueKey = `:val${index}`;
            if (expressionAttributeNames[`#${key}`]) {
                updateExpressions.push(`#${key} = ${valueKey}`);
            } else {
                updateExpressions.push(`${key} = ${valueKey}`);
            }
            expressionAttributeValues[valueKey] = data[key];
        });

        const params = {
            TableName: this.tableName,
            Key: { [this.primaryKey]: id },
            UpdateExpression: `SET ${updateExpressions.join(", ")}`,
            ExpressionAttributeValues: expressionAttributeValues
        };

        if (Object.keys(expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = expressionAttributeNames;
        }

        const command = new UpdateCommand(params);
        await dynamoClient.send(command);
    }

    // Xóa item
    async delete(id) {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: { [this.primaryKey]: id }
        });
        await dynamoClient.send(command);
    }

    // Scan với filter
    async findByField(fieldName, value) {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: `${fieldName} = :value`,
            ExpressionAttributeValues: {
                ":value": value
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    }
}

module.exports = BaseRepository;

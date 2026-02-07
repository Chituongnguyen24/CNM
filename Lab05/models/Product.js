const { docClient } = require('../config/dynamodb');
const { 
    PutCommand, 
    GetCommand, 
    ScanCommand, 
    UpdateCommand, 
    DeleteCommand 
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.TABLE_NAME || 'Products';

class Product {
    // Lấy tất cả sản phẩm
    static async getAll() {
        const params = {
            TableName: TABLE_NAME
        };

        try {
            const data = await docClient.send(new ScanCommand(params));
            return data.Items || [];
        } catch (error) {
            console.error('Error getting all products:', error);
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    static async getById(id) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: id
            }
        };

        try {
            const data = await docClient.send(new GetCommand(params));
            return data.Item;
        } catch (error) {
            console.error('Error getting product by id:', error);
            throw error;
        }
    }

    // Tạo sản phẩm mới
    static async create(productData) {
        const product = {
            id: uuidv4(),
            name: productData.name,
            price: Number(productData.price),
            url_image: productData.url_image || ''
        };

        const params = {
            TableName: TABLE_NAME,
            Item: product
        };

        try {
            await docClient.send(new PutCommand(params));
            return product;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    // Cập nhật sản phẩm
    static async update(id, productData) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: id
            },
            UpdateExpression: 'SET #name = :name, price = :price, url_image = :url_image',
            ExpressionAttributeNames: {
                '#name': 'name'  // 'name' là reserved word trong DynamoDB
            },
            ExpressionAttributeValues: {
                ':name': productData.name,
                ':price': Number(productData.price),
                ':url_image': productData.url_image || ''
            },
            ReturnValues: 'ALL_NEW'
        };

        try {
            const data = await docClient.send(new UpdateCommand(params));
            return data.Attributes;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Xóa sản phẩm
    static async delete(id) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: id
            }
        };

        try {
            await docClient.send(new DeleteCommand(params));
            return { message: 'Product deleted successfully' };
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
}

module.exports = Product;

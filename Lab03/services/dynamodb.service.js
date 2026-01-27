const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } =
    require("@aws-sdk/lib-dynamodb");

const { dynamoClient } = require("../config/aws");

const TABLE_NAME = process.env.DYNAMODB_TABLE;

// In-memory mock data for when AWS is not configured
let mockProducts = [
    {
        id: "1",
        name: "Sản phẩm mẫu 1",
        price: 100000,
        quantity: 10,
        url_image: ""
    },
    {
        id: "2",
        name: "Sản phẩm mẫu 2",
        price: 200000,
        quantity: 5,
        url_image: ""
    }
];

let useAWS = true; // Always try AWS first

exports.getAllProducts = async () => {
    if (!useAWS) {
        console.log("Using mock data...");
        return mockProducts;
    }
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    } catch (error) {
        console.error("❌ AWS DynamoDB Error:", error.message);
        console.log("⚠️  Switching to mock data mode...");
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
    if (!useAWS) {
        mockProducts.push(product);
        return;
    }
    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: product
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        useAWS = false;
        mockProducts.push(product);
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
                "set #name=:n, price=:p, quantity=:q, url_image=:u",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":n": data.name,
                ":p": data.price,
                ":q": data.quantity,
                ":u": data.url_image
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

exports.deleteProduct = async (id) => {
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

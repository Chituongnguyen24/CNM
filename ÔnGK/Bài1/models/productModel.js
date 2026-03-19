const { client, docClient } = require("../config/dynamodb");
const { CreateTableCommand, DescribeTableCommand, ResourceNotFoundException } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, GetCommand, PutCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = "Products";

const initTable = async () => {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        console.log(`Table ${TABLE_NAME} already exists.`);
    } catch (err) {
        if (err.name === "ResourceNotFoundException") {
            console.log(`Creating table ${TABLE_NAME}...`);
            const params = {
                TableName: TABLE_NAME,
                KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
                AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
            };
            await client.send(new CreateTableCommand(params));
            console.log(`Table ${TABLE_NAME} created successfully.`);
        } else {
            console.error("Error checking/creating table:", err);
            throw err;
        }
    }
};

const getAllProducts = async () => {
    const params = { TableName: TABLE_NAME };
    try {
        const data = await docClient.send(new ScanCommand(params));
        return data.Items || [];
    } catch (err) {
        console.error("Error scanning products:", err);
        throw err;
    }
};

const getProductById = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id: id },
    };
    try {
        const data = await docClient.send(new GetCommand(params));
        return data.Item || null;
    } catch (err) {
        console.error(`Error getting product ${id}:`, err);
        throw err;
    }
};

const addProduct = async (product) => {
    const params = {
        TableName: TABLE_NAME,
        Item: product,
    };
    try {
        await docClient.send(new PutCommand(params));
        return product;
    } catch (err) {
        console.error("Error adding product:", err);
        throw err;
    }
};

const updateProduct = async (id, updates) => {
    let updateExpression = "set";
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};
    let count = 0;

    for (const [key, value] of Object.entries(updates)) {
        if (key === "id") continue; // skip key
        updateExpression += ` #attr${count} = :val${count},`;
        expressionAttributeValues[`:val${count}`] = value;
        expressionAttributeNames[`#attr${count}`] = key;
        count++;
    }

    if (count === 0) return null;

    updateExpression = updateExpression.slice(0, -1); // remove trailing comma

    const params = {
        TableName: TABLE_NAME,
        Key: { id: id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW",
    };

    try {
        const data = await docClient.send(new UpdateCommand(params));
        return data.Attributes;
    } catch (err) {
        console.error(`Error updating product ${id}:`, err);
        throw err;
    }
};

const deleteProduct = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id: id },
    };
    try {
        await docClient.send(new DeleteCommand(params));
        return true;
    } catch (err) {
        console.error(`Error deleting product ${id}:`, err);
        throw err;
    }
};

const searchProducts = async (name) => {
    const params = {
        TableName: TABLE_NAME,
        FilterExpression: "contains(#name, :query)",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":query": name },
    };
    try {
        const data = await docClient.send(new ScanCommand(params));
        return data.Items || [];
    } catch (err) {
        console.error("Error searching products:", err);
        throw err;
    }
};

module.exports = {
    initTable,
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
};

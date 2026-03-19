const {
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("./aws.clients");

const tableName = process.env.DYNAMODB_TABLE || "products";

const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const normalizeProduct = (item) => ({
    id: item.id,
    name: item.name,
    price: toNumber(item.price),
    quantity: toNumber(item.quantity),
    imageKey: item.imageKey || "",
    imageUrl: item.imageUrl || ""
});

const getAllProducts = async () => {
    const result = await dynamoClient.send(new ScanCommand({
        TableName: tableName
    }));

    return (result.Items || []).map(normalizeProduct);
};

const getProductById = async (id) => {
    const result = await dynamoClient.send(new GetCommand({
        TableName: tableName,
        Key: { id }
    }));

    return result.Item ? normalizeProduct(result.Item) : null;
};

const createProduct = async (product) => {
    await dynamoClient.send(new PutCommand({
        TableName: tableName,
        Item: product
    }));

    return product;
};

const updateProduct = async (id, payload) => {
    const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: "SET #name = :name, price = :price, quantity = :quantity, imageKey = :imageKey, imageUrl = :imageUrl",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":name": payload.name,
            ":price": payload.price,
            ":quantity": payload.quantity,
            ":imageKey": payload.imageKey || "",
            ":imageUrl": payload.imageUrl || ""
        },
        ReturnValues: "ALL_NEW"
    });

    const result = await dynamoClient.send(command);
    return result.Attributes ? normalizeProduct(result.Attributes) : null;
};

const deleteProduct = async (id) => {
    const result = await dynamoClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { id },
        ReturnValues: "ALL_OLD"
    }));

    return result.Attributes ? normalizeProduct(result.Attributes) : null;
};

module.exports = {
    tableName,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

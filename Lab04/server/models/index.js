const { dynamodb } = require("../config/aws");

const TABLE = "Store";

exports.getAll = async () => {
    const data = await dynamodb.scan({ TableName: TABLE }).promise();
    return data.Items;
};

exports.create = async (product) => {
    await dynamodb.put({
        TableName: TABLE,
        Item: product
    }).promise();
};

exports.delete = async (id) => {
    await dynamodb.delete({
        TableName: TABLE,
        Key: { id }
    }).promise();
};
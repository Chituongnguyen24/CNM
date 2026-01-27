const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION;

const config = {
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const _ddbClient = new DynamoDBClient(config);
const dynamoClient = DynamoDBDocumentClient.from(_ddbClient);
const s3Client = new S3Client(config);

module.exports = {
    dynamoClient,
    s3Client
};

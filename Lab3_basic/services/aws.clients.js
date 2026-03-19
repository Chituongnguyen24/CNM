const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const region = process.env.AWS_REGION || "ap-southeast-1";

const dynamoClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region })
);

const s3Client = new S3Client({ region });

module.exports = {
    region,
    dynamoClient,
    s3Client
};

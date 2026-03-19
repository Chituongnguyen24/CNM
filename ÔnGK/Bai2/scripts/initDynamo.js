require("dotenv").config();

const {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const tableName = process.env.DYNAMODB_TABLE || "Products";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy"
  }
});

async function ensureTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`Bảng ${tableName} đã tồn tại.`);
  } catch (error) {
    if (error.name !== "ResourceNotFoundException") {
      throw error;
    }

    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST"
      })
    );

    console.log(`Đã tạo bảng ${tableName} thành công.`);
  }
}

ensureTable().catch((error) => {
  console.error("Không thể khởi tạo bảng:", error.message);
  process.exit(1);
});

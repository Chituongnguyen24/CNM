/**
 * Script tạo các bảng DynamoDB cho Mini E-commerce
 * Chạy: node scripts/seed-tables.js
 */

require('dotenv').config();
const { CreateTableCommand, ListTablesCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const REGION = process.env.AWS_REGION;

const client = new DynamoDBClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Định nghĩa các bảng cần tạo
const tables = [
    {
        TableName: "Users",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    },
    {
        TableName: "Categories",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    },
    {
        TableName: process.env.DYNAMODB_TABLE || "Products",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    },
    {
        TableName: "ProductLogs",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    },
    {
        TableName: "Orders",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    },
    {
        TableName: "OrderItems",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    },
    {
        TableName: "Carts",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    }
];

async function checkTableExists(tableName) {
    try {
        await client.send(new DescribeTableCommand({ TableName: tableName }));
        return true;
    } catch (error) {
        if (error.name === "ResourceNotFoundException") {
            return false;
        }
        throw error;
    }
}

async function createTable(tableConfig) {
    const exists = await checkTableExists(tableConfig.TableName);
    
    if (exists) {
        console.log(`⏭️  Bảng "${tableConfig.TableName}" đã tồn tại, bỏ qua.`);
        return false;
    }

    try {
        await client.send(new CreateTableCommand(tableConfig));
        console.log(`✅ Đã tạo bảng "${tableConfig.TableName}"`);
        return true;
    } catch (error) {
        console.error(`❌ Lỗi tạo bảng "${tableConfig.TableName}":`, error.message);
        return false;
    }
}

async function main() {
    console.log("🚀 Bắt đầu tạo các bảng DynamoDB...\n");
    console.log("─".repeat(50));

    let created = 0;
    let skipped = 0;

    for (const table of tables) {
        const result = await createTable(table);
        if (result) created++;
        else skipped++;
    }

    console.log("─".repeat(50));
    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã tạo: ${created} bảng`);
    console.log(`   ⏭️  Bỏ qua: ${skipped} bảng`);

    console.log(`\n📋 Danh sách bảng:`);
    tables.forEach(t => {
        console.log(`   - ${t.TableName} (PK: ${t.KeySchema[0].AttributeName})`);
    });
}

main()
    .then(() => {
        console.log("\n✨ Hoàn tất!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Lỗi:", error.message);
        process.exit(1);
    });

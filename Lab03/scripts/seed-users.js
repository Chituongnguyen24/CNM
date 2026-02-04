/**
 * Script chèn 2 users mẫu (admin và staff) vào DynamoDB
 * Chạy: node scripts/seed-users.js
 */

require('dotenv').config();
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");
const crypto = require("crypto");

const TABLE_NAME = "Users";

// Hash password using SHA256
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// Dữ liệu 2 users cần chèn
const usersToSeed = [
    {
        id: "admin-001",
        username: "admin",
        password: hashPassword("admin123"),
        role: "admin",
        createdAt: new Date().toISOString()
    },
    {
        id: "staff-001",
        username: "staff",
        password: hashPassword("staff123"),
        role: "staff",
        createdAt: new Date().toISOString()
    }
];

// Kiểm tra user đã tồn tại chưa
async function checkUserExists(username) {
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items && result.Items.length > 0;
    } catch (error) {
        return false;
    }
}

// Chèn user vào DynamoDB
async function insertUser(user) {
    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: user
        });
        await dynamoClient.send(command);
        return true;
    } catch (error) {
        console.error(`❌ Lỗi khi chèn user ${user.username}:`, error.message);
        return false;
    }
}

// Hàm chính
async function seedUsers() {
    console.log("🚀 Bắt đầu chèn users vào DynamoDB...\n");
    console.log(`📋 Bảng: ${TABLE_NAME}`);
    console.log("─".repeat(50));

    let successCount = 0;
    let skipCount = 0;

    for (const user of usersToSeed) {
        const exists = await checkUserExists(user.username);
        
        if (exists) {
            console.log(`⏭️  User "${user.username}" đã tồn tại, bỏ qua.`);
            skipCount++;
            continue;
        }

        const success = await insertUser(user);
        if (success) {
            console.log(`✅ Đã chèn user "${user.username}" (role: ${user.role})`);
            successCount++;
        }
    }

    console.log("─".repeat(50));
    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Thành công: ${successCount}`);
    console.log(`   ⏭️  Bỏ qua: ${skipCount}`);
    console.log(`\n🔑 Thông tin đăng nhập:`);
    console.log(`   Admin: admin / admin123`);
    console.log(`   Staff: staff / staff123`);
}

// Chạy script
seedUsers()
    .then(() => {
        console.log("\n✨ Hoàn tất!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Lỗi:", error.message);
        process.exit(1);
    });

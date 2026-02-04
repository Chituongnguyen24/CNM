/**
 * Script seed dữ liệu mẫu cho Mini E-commerce
 * Chạy: node scripts/seed-data.js
 */

require('dotenv').config();
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// Dữ liệu Users
const users = [
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
    },
    {
        id: "customer-001",
        username: "customer",
        password: hashPassword("customer123"),
        role: "customer",
        createdAt: new Date().toISOString()
    }
];

// Dữ liệu Categories - Primary key là "id"
const categories = [
    {
        id: "cat-001",
        name: "Điện tử",
        description: "Điện thoại, máy tính, thiết bị điện tử"
    },
    {
        id: "cat-002",
        name: "Thời trang",
        description: "Quần áo, giày dép, phụ kiện"
    },
    {
        id: "cat-003",
        name: "Gia dụng",
        description: "Đồ dùng gia đình, nhà bếp"
    },
    {
        id: "cat-004",
        name: "Thực phẩm",
        description: "Đồ ăn, đồ uống, thực phẩm chế biến"
    }
];

// Dữ liệu Products mẫu
const products = [
    {
        id: uuidv4(),
        name: "iPhone 15 Pro Max",
        price: 29990000,
        quantity: 50,
        categoryId: "cat-001",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: "MacBook Air M3",
        price: 27990000,
        quantity: 30,
        categoryId: "cat-001",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: "Áo thun nam basic",
        price: 199000,
        quantity: 100,
        categoryId: "cat-002",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: "Giày sneaker trắng",
        price: 890000,
        quantity: 3,  // Sắp hết
        categoryId: "cat-002",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: "Nồi cơm điện thông minh",
        price: 1290000,
        quantity: 0,  // Hết hàng
        categoryId: "cat-003",
        url_image: "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    }
];

async function checkExists(tableName, keyName, keyValue) {
    try {
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: `${keyName} = :val`,
            ExpressionAttributeValues: { ":val": keyValue }
        });
        const result = await dynamoClient.send(command);
        return result.Items && result.Items.length > 0;
    } catch {
        return false;
    }
}

async function insertItem(tableName, item, keyName, keyValue) {
    const exists = await checkExists(tableName, keyName, keyValue);
    if (exists) {
        return { skipped: true };
    }

    try {
        await dynamoClient.send(new PutCommand({ TableName: tableName, Item: item }));
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
}

async function seedTable(tableName, items, keyName, displayField) {
    console.log(`\n📋 Seeding ${tableName}...`);
    let success = 0, skipped = 0;

    for (const item of items) {
        const result = await insertItem(tableName, item, keyName, item[keyName]);
        if (result.success) {
            console.log(`   ✅ ${item[displayField]}`);
            success++;
        } else if (result.skipped) {
            console.log(`   ⏭️  ${item[displayField]} (đã tồn tại)`);
            skipped++;
        } else {
            console.log(`   ❌ ${item[displayField]}: ${result.error}`);
        }
    }

    return { success, skipped };
}

async function main() {
    console.log("🚀 Bắt đầu seed dữ liệu mẫu...");
    console.log("═".repeat(50));

    const results = {
        users: await seedTable("Users", users, "id", "username"),
        categories: await seedTable("Categories", categories, "id", "name"),
        products: await seedTable(process.env.DYNAMODB_TABLE || "Products", products, "id", "name")
    };

    console.log("\n" + "═".repeat(50));
    console.log("📊 Tổng kết:");
    Object.entries(results).forEach(([table, { success, skipped }]) => {
        console.log(`   ${table}: ✅ ${success} mới, ⏭️ ${skipped} bỏ qua`);
    });

    console.log("\n🔑 Tài khoản đăng nhập:");
    console.log("   Admin: admin / admin123");
    console.log("   Staff: staff / staff123");
    console.log("   Customer: customer / customer123");
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

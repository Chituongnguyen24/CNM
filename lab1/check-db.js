// Script kiểm tra kết nối database và bảng users
require('dotenv').config();
const db = require('./db/db');

async function checkDatabase() {
    try {
        console.log('🔍 Kiểm tra kết nối database...');
        
        // Kiểm tra kết nối
        await db.query('SELECT 1');
        console.log('✅ Kết nối database thành công!\n');

        // Kiểm tra bảng users
        console.log('🔍 Kiểm tra bảng users...');
        const [tables] = await db.query("SHOW TABLES LIKE 'users'");
        
        if (tables.length === 0) {
            console.log('❌ Bảng users chưa tồn tại!');
            console.log('\n📝 Hãy chạy script SQL sau để tạo bảng:');
            console.log('   mysql -u root -p shopdb < db/create_users_table.sql');
            console.log('   hoặc copy nội dung file db/create_users_table.sql và chạy trong MySQL Workbench\n');
        } else {
            console.log('✅ Bảng users đã tồn tại!\n');
            
            // Kiểm tra cấu trúc bảng
            console.log('📋 Cấu trúc bảng users:');
            const [columns] = await db.query('DESCRIBE users');
            console.table(columns);
            
            // Đếm số users
            const [count] = await db.query('SELECT COUNT(*) as total FROM users');
            console.log(`\n👥 Số lượng users hiện tại: ${count[0].total}`);
        }

        // Kiểm tra bảng products
        console.log('\n🔍 Kiểm tra bảng products...');
        const [productTables] = await db.query("SHOW TABLES LIKE 'products'");
        
        if (productTables.length === 0) {
            console.log('❌ Bảng products chưa tồn tại!');
        } else {
            console.log('✅ Bảng products đã tồn tại!');
            const [productCount] = await db.query('SELECT COUNT(*) as total FROM products');
            console.log(`📦 Số lượng products: ${productCount[0].total}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('\n💡 Kiểm tra lại:');
        console.error('   1. MySQL server đã chạy chưa?');
        console.error('   2. Database "shopdb" đã được tạo chưa?');
        console.error('   3. Thông tin kết nối trong db/db.js đúng chưa?');
        process.exit(1);
    }
}

checkDatabase();

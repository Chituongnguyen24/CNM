// Script tự động tạo bảng users
require('dotenv').config();
const db = require('./db/db');

async function createUsersTable() {
    try {
        console.log('🔧 Đang tạo bảng users...\n');

        // Tạo bảng users
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tạo bảng users thành công!');

        // Tạo index
        try {
            await db.query('CREATE INDEX idx_username ON users(username)');
            console.log('✅ Tạo index cho username');
        } catch (e) {
            if (e.code !== 'ER_DUP_KEYNAME') console.log('⚠️  Index username đã tồn tại');
        }

        try {
            await db.query('CREATE INDEX idx_email ON users(email)');
            console.log('✅ Tạo index cho email');
        } catch (e) {
            if (e.code !== 'ER_DUP_KEYNAME') console.log('⚠️  Index email đã tồn tại');
        }

        // Kiểm tra cấu trúc
        console.log('\n📋 Cấu trúc bảng users:');
        const [columns] = await db.query('DESCRIBE users');
        console.table(columns);

        console.log('\n✨ Hoàn tất! Bây giờ bạn có thể đăng ký tài khoản mới.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

createUsersTable();

const db = require('../db/db');

class UserModel {
    // Lấy user theo username
    static async findByUsername(username) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Lấy user theo email
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Lấy user theo ID
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Tạo user mới
    static async create(userData) {
        const { username, email, password } = userData;
        try {
            const [result] = await db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, password]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Lấy tất cả users (không bao gồm password)
    static async findAll() {
        try {
            const [rows] = await db.query('SELECT id, username, email, created_at FROM users ORDER BY id DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserModel;

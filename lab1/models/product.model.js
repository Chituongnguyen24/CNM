const db = require('../db/db');

class ProductModel {
    // Lấy tất cả sản phẩm
    static async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Tạo sản phẩm mới
    static async create(productData) {
        const { name, price, quantity } = productData;
        try {
            const [result] = await db.query(
                'INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)',
                [name, price, quantity]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật sản phẩm
    static async update(id, productData) {
        const { name, price, quantity } = productData;
        try {
            const [result] = await db.query(
                'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?',
                [name, price, quantity, id]
            );
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Xóa sản phẩm
    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductModel;

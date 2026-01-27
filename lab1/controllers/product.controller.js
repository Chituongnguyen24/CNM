const ProductModel = require('../models/product.model');

class ProductController {
    // Hiển thị danh sách sản phẩm
    static async index(req, res) {
        try {
            const products = await ProductModel.findAll();
            res.render('products', { 
                products, 
                user: req.session.user 
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi kết nối Database!');
        }
    }

    // Thêm sản phẩm mới
    static async create(req, res) {
        const { name, price, quantity } = req.body;
        try {
            await ProductModel.create({ name, price, quantity });
            res.redirect('/products');
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi thêm dữ liệu');
        }
    }

    // Hiển thị form sửa sản phẩm
    static async showEdit(req, res) {
        const id = req.params.id;
        try {
            const product = await ProductModel.findById(id);
            if (!product) {
                return res.redirect('/products');
            }
            res.render('edit', { 
                product,
                user: req.session.user 
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi lấy thông tin sửa');
        }
    }

    // Cập nhật sản phẩm
    static async update(req, res) {
        const { id, name, price, quantity } = req.body;
        try {
            await ProductModel.update(id, { name, price, quantity });
            res.redirect('/products');
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi cập nhật dữ liệu');
        }
    }

    // Xóa sản phẩm
    static async delete(req, res) {
        const id = req.params.id;
        try {
            await ProductModel.delete(id);
            res.redirect('/products');
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi xóa dữ liệu');
        }
    }
}

module.exports = ProductController;

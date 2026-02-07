const Product = require('../models/Product');

const productController = {
    // Hiển thị danh sách sản phẩm
    index: async (req, res) => {
        try {
            const products = await Product.getAll();
            res.render('products/index', { 
                title: 'Danh sách sản phẩm',
                products: products 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error 
            });
        }
    },

    // Hiển thị form thêm sản phẩm
    showAddForm: (req, res) => {
        res.render('products/add', { 
            title: 'Thêm sản phẩm mới' 
        });
    },

    // Xử lý thêm sản phẩm
    create: async (req, res) => {
        try {
            const productData = {
                name: req.body.name,
                price: req.body.price,
                url_image: req.body.url_image
            };

            await Product.create(productData);
            res.redirect('/products');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi thêm sản phẩm',
                error: error 
            });
        }
    },

    // Hiển thị chi tiết sản phẩm
    show: async (req, res) => {
        try {
            const product = await Product.getById(req.params.id);
            if (!product) {
                return res.status(404).render('error', { 
                    message: 'Không tìm thấy sản phẩm',
                    error: { status: 404 } 
                });
            }
            res.render('products/show', { 
                title: 'Chi tiết sản phẩm',
                product: product 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi lấy chi tiết sản phẩm',
                error: error 
            });
        }
    },

    // Hiển thị form chỉnh sửa sản phẩm
    showEditForm: async (req, res) => {
        try {
            const product = await Product.getById(req.params.id);
            if (!product) {
                return res.status(404).render('error', { 
                    message: 'Không tìm thấy sản phẩm',
                    error: { status: 404 } 
                });
            }
            res.render('products/edit', { 
                title: 'Chỉnh sửa sản phẩm',
                product: product 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi lấy thông tin sản phẩm',
                error: error 
            });
        }
    },

    // Xử lý cập nhật sản phẩm
    update: async (req, res) => {
        try {
            const productData = {
                name: req.body.name,
                price: req.body.price,
                url_image: req.body.url_image
            };

            await Product.update(req.params.id, productData);
            res.redirect('/products');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi cập nhật sản phẩm',
                error: error 
            });
        }
    },

    // Xử lý xóa sản phẩm
    delete: async (req, res) => {
        try {
            await Product.delete(req.params.id);
            res.redirect('/products');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi xóa sản phẩm',
                error: error 
            });
        }
    }
};

module.exports = productController;

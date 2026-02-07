const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products - Danh sách sản phẩm
router.get('/', productController.index);

// GET /products/add - Form thêm sản phẩm
router.get('/add', productController.showAddForm);

// POST /products/add - Xử lý thêm sản phẩm
router.post('/add', productController.create);

// GET /products/:id - Chi tiết sản phẩm
router.get('/:id', productController.show);

// GET /products/:id/edit - Form chỉnh sửa sản phẩm
router.get('/:id/edit', productController.showEditForm);

// POST /products/:id/edit - Xử lý cập nhật sản phẩm
router.post('/:id/edit', productController.update);

// POST /products/:id/delete - Xử lý xóa sản phẩm
router.post('/:id/delete', productController.delete);

module.exports = router;

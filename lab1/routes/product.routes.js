const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Tất cả routes sản phẩm yêu cầu đăng nhập
router.use(authenticateToken);

// Routes CRUD
router.get('/', ProductController.index);
router.post('/add', ProductController.create);
router.get('/edit/:id', ProductController.showEdit);
router.post('/update', ProductController.update);
router.post('/delete/:id', ProductController.delete);

module.exports = router;
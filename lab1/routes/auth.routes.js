const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { isLoggedIn } = require('../middleware/auth.middleware');

// Routes đăng ký
router.get('/register', isLoggedIn, AuthController.showRegister);
router.post('/register', AuthController.register);

// Routes đăng nhập
router.get('/login', isLoggedIn, AuthController.showLogin);
router.post('/login', AuthController.login);

// Route đăng xuất
router.get('/logout', AuthController.logout);

module.exports = router;

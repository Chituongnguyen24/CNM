const jwt = require('jsonwebtoken');

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
    // Lấy token từ session
    const token = req.session.token;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token không hợp lệ:', error);
        req.session.destroy();
        return res.redirect('/auth/login');
    }
};

// Middleware kiểm tra đã đăng nhập (chuyển hướng nếu đã login)
const isLoggedIn = (req, res, next) => {
    if (req.session.token) {
        return res.redirect('/products');
    }
    next();
};

module.exports = {
    authenticateToken,
    isLoggedIn
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

class AuthController {
    // Hiển thị trang đăng ký
    static showRegister(req, res) {
        res.render('register', { error: null });
    }

    // Xử lý đăng ký
    static async register(req, res) {
        const { username, email, password, confirmPassword } = req.body;

        try {
            // Validate
            if (!username || !email || !password || !confirmPassword) {
                return res.render('register', { error: 'Vui lòng điền đầy đủ thông tin' });
            }

            // Validate username format
            if (username.length < 3) {
                return res.render('register', { error: 'Username phải có ít nhất 3 ký tự' });
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return res.render('register', { error: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới' });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.render('register', { error: 'Email không hợp lệ' });
            }

            // Validate password length
            if (password.length < 6) {
                return res.render('register', { error: 'Mật khẩu phải có ít nhất 6 ký tự' });
            }

            if (password !== confirmPassword) {
                return res.render('register', { error: 'Mật khẩu xác nhận không khớp' });
            }

            // Kiểm tra username đã tồn tại
            const existingUser = await UserModel.findByUsername(username);
            if (existingUser) {
                return res.render('register', { error: 'Username đã tồn tại. Vui lòng chọn username khác' });
            }

            // Kiểm tra email đã tồn tại
            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) {
                return res.render('register', { error: 'Email đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo user mới
            await UserModel.create({
                username,
                email,
                password: hashedPassword
            });

            res.redirect('/auth/login');
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.render('register', { error: 'Lỗi đăng ký. Vui lòng thử lại! Chi tiết: ' + error.message });
        }
    }

    // Hiển thị trang đăng nhập
    static showLogin(req, res) {
        res.render('login', { error: null });
    }

    // Xử lý đăng nhập
    static async login(req, res) {
        const { username, password } = req.body;

        try {
            // Validate
            if (!username || !password) {
                return res.render('login', { error: 'Vui lòng điền đầy đủ thông tin' });
            }

            // Tìm user - hỗ trợ đăng nhập bằng username hoặc email
            let user = await UserModel.findByUsername(username);
            if (!user) {
                user = await UserModel.findByEmail(username);
            }
            if (!user) {
                return res.render('login', { error: 'Username/Email hoặc mật khẩu không đúng' });
            }

            // Kiểm tra mật khẩu
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.render('login', { error: 'Username/Email hoặc mật khẩu không đúng' });
            }

            // Tạo JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Lưu token vào session
            req.session.token = token;
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            res.redirect('/products');
        } catch (error) {
            console.error(error);
            res.render('login', { error: 'Lỗi đăng nhập. Vui lòng thử lại!' });
        }
    }

    // Đăng xuất
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/auth/login');
        });
    }
}

module.exports = AuthController;

// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 giờ
    httpOnly: true,
    secure: false // Đặt true nếu dùng HTTPS
  }
}));

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Redirect root to login
app.get('/', (req, res) => {
  if (req.session.token) {
    res.redirect('/products');
  } else {
    res.redirect('/auth/login');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Có lỗi xảy ra!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`Đăng nhập tại: http://localhost:${PORT}/auth/login`);
});
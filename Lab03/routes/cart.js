/**
 * Cart Routes
 * Quản lý giỏ hàng
 */

const express = require("express");
const router = express.Router();
const cartsService = require("../services/carts.service");
const { isAuthenticated } = require("../middleware/auth");

// Middleware: Yêu cầu đăng nhập
router.use(isAuthenticated);

// GET - Xem giỏ hàng
router.get("/", async (req, res) => {
    try {
        const userId = req.session.user.id;
        const cart = await cartsService.getCartWithProducts(userId);
        res.render("cart/index", { cart });
    } catch (error) {
        console.error("Error getting cart:", error);
        res.render("cart/index", { cart: { items: [], totalItems: 0, totalAmount: 0 }, error: error.message });
    }
});

// POST - Thêm vào giỏ hàng
router.post("/add", async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId, quantity } = req.body;
        
        await cartsService.addToCart(userId, productId, Number(quantity) || 1);
        
        // Nếu là AJAX request
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            const cartCount = await cartsService.getCartCount(userId);
            return res.json({ success: true, cartCount });
        }
        
        res.redirect("/cart");
    } catch (error) {
        console.error("Error adding to cart:", error);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(400).json({ success: false, message: error.message });
        }
        
        res.redirect("/products?error=" + encodeURIComponent(error.message));
    }
});

// POST - Cập nhật số lượng
router.post("/update/:cartItemId", async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { cartItemId } = req.params;
        const { quantity } = req.body;
        
        await cartsService.updateCartItemQuantity(userId, cartItemId, Number(quantity));
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            const cart = await cartsService.getCartWithProducts(userId);
            return res.json({ success: true, cart });
        }
        
        res.redirect("/cart");
    } catch (error) {
        console.error("Error updating cart:", error);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(400).json({ success: false, message: error.message });
        }
        
        res.redirect("/cart?error=" + encodeURIComponent(error.message));
    }
});

// POST - Xóa item khỏi giỏ
router.post("/remove/:cartItemId", async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { cartItemId } = req.params;
        
        await cartsService.removeFromCart(userId, cartItemId);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            const cart = await cartsService.getCartWithProducts(userId);
            return res.json({ success: true, cart });
        }
        
        res.redirect("/cart");
    } catch (error) {
        console.error("Error removing from cart:", error);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(400).json({ success: false, message: error.message });
        }
        
        res.redirect("/cart?error=" + encodeURIComponent(error.message));
    }
});

// POST - Xóa toàn bộ giỏ hàng
router.post("/clear", async (req, res) => {
    try {
        const userId = req.session.user.id;
        await cartsService.clearCart(userId);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true });
        }
        
        res.redirect("/cart");
    } catch (error) {
        console.error("Error clearing cart:", error);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(400).json({ success: false, message: error.message });
        }
        
        res.redirect("/cart?error=" + encodeURIComponent(error.message));
    }
});

// API - Lấy số lượng giỏ hàng
router.get("/count", async (req, res) => {
    try {
        const userId = req.session.user.id;
        const count = await cartsService.getCartCount(userId);
        res.json({ count });
    } catch (error) {
        res.json({ count: 0 });
    }
});

module.exports = router;

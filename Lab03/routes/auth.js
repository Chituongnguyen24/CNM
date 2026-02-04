const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../services/users.service");

// GET - Trang đăng nhập
router.get("/login", (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect("/products");
    }
    res.render("auth/login", { error: null });
});

// POST - Xử lý đăng nhập
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    
    const result = await authenticateUser(username, password);
    
    if (result.success) {
        req.session.user = result.user;
        res.redirect("/products");
    } else {
        res.render("auth/login", { error: result.message });
    }
});

// GET - Đăng xuất
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/auth/login");
    });
});

module.exports = router;

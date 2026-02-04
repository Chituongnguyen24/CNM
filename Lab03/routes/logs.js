/**
 * Product Logs Routes
 * Xem lịch sử thao tác (Audit Log)
 */

const express = require("express");
const router = express.Router();
const productLogsService = require("../services/product-logs.service");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Middleware: Yêu cầu đăng nhập và là admin
router.use(isAuthenticated);
router.use(isAdmin);

// GET - Danh sách tất cả logs
router.get("/", async (req, res) => {
    try {
        const logs = await productLogsService.getAllLogs();
        const stats = await productLogsService.getLogStats();
        res.render("logs/list", { logs, stats });
    } catch (error) {
        console.error("Error getting logs:", error);
        res.render("logs/list", { logs: [], stats: {}, error: error.message });
    }
});

// GET - Logs theo product
router.get("/product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const logs = await productLogsService.getLogsByProductId(productId);
        res.render("logs/product-logs", { logs, productId });
    } catch (error) {
        console.error("Error getting product logs:", error);
        res.render("logs/product-logs", { logs: [], error: error.message });
    }
});

// GET - Logs theo user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const logs = await productLogsService.getLogsByUserId(userId);
        res.render("logs/user-logs", { logs, userId });
    } catch (error) {
        console.error("Error getting user logs:", error);
        res.render("logs/user-logs", { logs: [], error: error.message });
    }
});

// GET - Logs theo action
router.get("/action/:action", async (req, res) => {
    try {
        const { action } = req.params;
        const logs = await productLogsService.getLogsByAction(action.toUpperCase());
        res.render("logs/action-logs", { logs, action: action.toUpperCase() });
    } catch (error) {
        console.error("Error getting action logs:", error);
        res.render("logs/action-logs", { logs: [], error: error.message });
    }
});

// API - Thống kê logs
router.get("/api/stats", async (req, res) => {
    try {
        const stats = await productLogsService.getLogStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

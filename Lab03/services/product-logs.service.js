/**
 * ProductLogs Service
 * Xử lý lịch sử thao tác sản phẩm (Audit)
 */

const productLogsRepository = require("../repositories/product-logs.repository");
const usersRepository = require("../repositories/users.repository");
const productsRepository = require("../repositories/products.repository");

// Lấy tất cả logs
exports.getAllLogs = async () => {
    const logs = await productLogsRepository.findAllSorted();
    return await enrichLogsWithDetails(logs);
};

// Lấy logs theo productId
exports.getLogsByProductId = async (productId) => {
    const logs = await productLogsRepository.findByProductId(productId);
    return await enrichLogsWithDetails(logs);
};

// Lấy logs theo userId
exports.getLogsByUserId = async (userId) => {
    const logs = await productLogsRepository.findByUserId(userId);
    return await enrichLogsWithDetails(logs);
};

// Lấy logs theo action
exports.getLogsByAction = async (action) => {
    const logs = await productLogsRepository.findByAction(action);
    return await enrichLogsWithDetails(logs);
};

// Ghi log (được gọi từ products.service.js)
exports.logAction = async (productId, action, userId, details = {}) => {
    return await productLogsRepository.logAction(productId, action, userId, details);
};

// Thống kê logs
exports.getLogStats = async () => {
    const logs = await productLogsRepository.findAll();
    
    const stats = {
        total: logs.length,
        byAction: {
            CREATE: 0,
            UPDATE: 0,
            DELETE: 0,
            RESTORE: 0,
            HARD_DELETE: 0
        },
        recentLogs: []
    };

    logs.forEach(log => {
        if (stats.byAction[log.action] !== undefined) {
            stats.byAction[log.action]++;
        }
    });

    // 10 logs gần nhất
    stats.recentLogs = logs
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

    return stats;
};

// Helper: Bổ sung thông tin chi tiết cho logs
async function enrichLogsWithDetails(logs) {
    const enrichedLogs = [];

    for (const log of logs) {
        const enriched = { ...log };

        // Lấy thông tin user
        try {
            const user = await usersRepository.findByIdWithoutPassword(log.userId);
            enriched.user = user || { username: "Unknown" };
        } catch {
            enriched.user = { username: "Unknown" };
        }

        // Lấy thông tin product (nếu còn tồn tại)
        try {
            const product = await productsRepository.findById(log.productId);
            enriched.product = product || { name: "Đã xóa" };
        } catch {
            enriched.product = { name: "Đã xóa" };
        }

        // Parse details nếu là string
        if (typeof log.details === "string") {
            try {
                enriched.details = JSON.parse(log.details);
            } catch {
                enriched.details = {};
            }
        }

        // Format action cho hiển thị
        enriched.actionDisplay = getActionDisplay(log.action);

        enrichedLogs.push(enriched);
    }

    return enrichedLogs;
}

// Helper: Lấy hiển thị action
function getActionDisplay(action) {
    const displays = {
        CREATE: { text: "Tạo mới", class: "success", icon: "➕" },
        UPDATE: { text: "Cập nhật", class: "warning", icon: "✏️" },
        DELETE: { text: "Xóa", class: "danger", icon: "🗑️" },
        RESTORE: { text: "Khôi phục", class: "info", icon: "♻️" },
        HARD_DELETE: { text: "Xóa vĩnh viễn", class: "dark", icon: "💀" }
    };
    return displays[action] || { text: action, class: "secondary", icon: "📝" };
}

exports.getActionDisplay = getActionDisplay;

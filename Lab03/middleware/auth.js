/**
 * Middleware xác thực và phân quyền
 * ================================
 * 
 * Sử dụng session để quản lý trạng thái đăng nhập
 */

// Kiểm tra đã đăng nhập chưa
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect("/auth/login");
};

// Kiểm tra quyền Admin
exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === "admin") {
        return next();
    }
    res.status(403).render("error", { 
        message: "⛔ Truy cập bị từ chối",
        error: { 
            status: 403, 
            stack: "Bạn cần quyền Admin để thực hiện chức năng này.\nChỉ admin được quản lý sản phẩm, danh mục và người dùng." 
        }
    });
};

// Kiểm tra quyền Staff trở lên (staff hoặc admin)
exports.isStaffOrAdmin = (req, res, next) => {
    if (req.session && req.session.user && 
        (req.session.user.role === "admin" || req.session.user.role === "staff")) {
        return next();
    }
    res.status(403).render("error", { 
        message: "⛔ Truy cập bị từ chối",
        error: { 
            status: 403, 
            stack: "Bạn cần đăng nhập để thực hiện chức năng này." 
        }
    });
};

// Middleware để thêm user info vào tất cả views
exports.addUserToLocals = (req, res, next) => {
    res.locals.currentUser = req.session ? req.session.user : null;
    next();
};

const express = require("express");
const { v4: uuidv4 } = require("uuid");

const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../services/users.service");

const { isAdmin } = require("../middleware/auth");

const router = express.Router();

// Áp dụng middleware isAdmin cho tất cả routes
router.use(isAdmin);

// READ - Danh sách users
router.get("/", async (req, res) => {
    const users = await getAllUsers();
    res.render("users/list", { users });
});

// CREATE - Form thêm user
router.get("/add", (req, res) => {
    res.render("users/add");
});

// CREATE - Xử lý thêm user
router.post("/add", async (req, res) => {
    const { username, password, role } = req.body;

    await createUser({
        userId: uuidv4(),
        username,
        password, // Sẽ được hash trong service
        role
    });

    res.redirect("/users");
});

// UPDATE - Form sửa user
router.get("/edit/:id", async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) {
        return res.redirect("/users");
    }
    res.render("users/edit", { user });
});

// UPDATE - Xử lý sửa user
router.post("/edit/:id", async (req, res) => {
    const { username, password, role } = req.body;

    const updateData = { username, role };
    if (password && password.trim() !== "") {
        updateData.password = password;
    }

    await updateUser(req.params.id, updateData);
    res.redirect("/users");
});

// DELETE
router.post("/delete/:id", async (req, res) => {
    // Không cho phép xóa chính mình
    if (req.session.user.userId === req.params.id) {
        return res.redirect("/users?error=cannot-delete-self");
    }
    
    await deleteUser(req.params.id);
    res.redirect("/users");
});

module.exports = router;
        
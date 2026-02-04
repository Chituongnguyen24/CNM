const express = require("express");
const { v4: uuidv4 } = require("uuid");

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../services/categories.service");

const { isAdmin } = require("../middleware/auth");

const router = express.Router();

// Áp dụng middleware isAdmin cho tất cả routes
router.use(isAdmin);

// READ - Danh sách categories
router.get("/", async (req, res) => {
    const categories = await getAllCategories();
    res.render("categories/list", { categories });
});

// CREATE - Form thêm category
router.get("/add", (req, res) => {
    res.render("categories/add");
});

// CREATE - Xử lý thêm category
router.post("/add", async (req, res) => {
    const { name, description } = req.body;

    await createCategory({
        id: uuidv4(),
        name,
        description
    });

    res.redirect("/categories");
});

// UPDATE - Form sửa category
router.get("/edit/:id", async (req, res) => {
    const category = await getCategoryById(req.params.id);
    if (!category) {
        return res.redirect("/categories");
    }
    res.render("categories/edit", { category });
});

// UPDATE - Xử lý sửa category
router.post("/edit/:id", async (req, res) => {
    const { name, description } = req.body;

    await updateCategory(req.params.id, { name, description });
    res.redirect("/categories");
});

// DELETE - Xóa category (KHÔNG xóa sản phẩm thuộc category)
router.post("/delete/:id", async (req, res) => {
    /*
     * BUSINESS RULE: Khi xóa category, KHÔNG xóa sản phẩm thuộc category đó
     * - Sản phẩm sẽ có categoryId trở thành "không hợp lệ" (orphaned)
     * - Có thể hiển thị như "Chưa phân loại" ở frontend
     * - Hoặc cần logic để reassign sản phẩm sang category khác trước khi xóa
     */
    await deleteCategory(req.params.id);
    res.redirect("/categories");
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const {
    getAllProducts,
    getAllProductsIncludeDeleted,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
} = require("../services/dynamodb.service");

const productsRepository = require("../repositories/products.repository");
const { getAllCategories, getCategoryById } = require("../services/categories.service");
const { uploadImage, deleteImageByUrl, listImages } = require("../services/s3.service");
const { isAdmin, isAuthenticated } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware: Yêu cầu đăng nhập để xem sản phẩm
router.use(isAuthenticated);

// READ - Danh sách sản phẩm với tìm kiếm, lọc và phân trang
router.get("/", async (req, res) => {
    const { search, category, minPrice, maxPrice, page = 1 } = req.query;
    const limit = 6; // Số sản phẩm mỗi trang
    const currentPage = parseInt(page) || 1;

    // Lấy tất cả categories để hiển thị dropdown
    const categories = await getAllCategories();
    const categoryMap = {};
    categories.forEach(c => {
        categoryMap[c.id] = c;
    });

    // Kiểm tra xem có filter nào không
    const hasFilters = search || category || minPrice || maxPrice;

    let products;
    if (hasFilters) {
        // Sử dụng advanced search nếu có filter
        products = await productsRepository.advancedSearch({
            categoryId: category || null,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            searchTerm: search || null
        });
    } else {
        // Lấy tất cả sản phẩm active
        products = await getAllProducts();
    }

    // Sắp xếp theo ngày tạo mới nhất
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Phân trang
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    res.render("products/list", { 
        products: paginatedProducts, 
        categoryMap,
        categories,
        // Pagination info
        pagination: {
            currentPage,
            totalPages,
            totalProducts,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1
        },
        // Filter values để giữ lại trong form
        filters: {
            search: search || '',
            category: category || '',
            minPrice: minPrice || '',
            maxPrice: maxPrice || ''
        }
    });
});

// READ - Danh sách sản phẩm đã xóa (chỉ admin)
router.get("/deleted", isAdmin, async (req, res) => {
    const allProducts = await getAllProductsIncludeDeleted();
    const deletedProducts = allProducts.filter(p => p.isDeleted === true);
    const categories = await getAllCategories();
    
    const categoryMap = {};
    categories.forEach(c => {
        categoryMap[c.id] = c;
    });
    
    res.render("products/deleted", { products: deletedProducts, categoryMap });
});

// CREATE - Form thêm sản phẩm (chỉ admin)
router.get("/add", isAdmin, async (req, res) => {
    const images = await listImages();
    const categories = await getAllCategories();
    res.render("products/add", { images, categories });
});

router.post("/add", isAdmin, upload.single("image"), async (req, res) => {
    const { name, price, quantity, selectedImage, categoryId } = req.body;

    let imageUrl = "";
    if (req.file) {
        imageUrl = await uploadImage(req.file);
    } else if (selectedImage) {
        imageUrl = selectedImage;
    }

    await createProduct({
        id: uuidv4(),
        name,
        price: Number(price),
        quantity: Number(quantity),
        categoryId: categoryId || "",
        url_image: imageUrl
    });

    res.redirect("/products");
});

// UPDATE - Form sửa sản phẩm (chỉ admin)
router.get("/edit/:id", isAdmin, async (req, res) => {
    const product = await getProductById(req.params.id);
    const images = await listImages();
    const categories = await getAllCategories();
    res.render("products/edit", { product, images, categories });
});

router.post("/edit/:id", isAdmin, upload.single("image"), async (req, res) => {
    const { name, price, quantity, oldImage, selectedImage, categoryId } = req.body;

    let imageUrl = oldImage;
    if (req.file) {
        imageUrl = await uploadImage(req.file);
    } else if (selectedImage) {
        imageUrl = selectedImage;
    }

    await updateProduct(req.params.id, {
        name,
        price: Number(price),
        quantity: Number(quantity),
        categoryId: categoryId || "",
        url_image: imageUrl
    });

    res.redirect("/products");
});

// SOFT DELETE - Xóa mềm sản phẩm (chỉ admin)
router.post("/delete/:id", isAdmin, async (req, res) => {
    // Soft delete: chỉ đánh dấu isDeleted = true
    // KHÔNG xóa ảnh vì có thể khôi phục sau
    await deleteProduct(req.params.id);
    res.redirect("/products");
});

// RESTORE - Khôi phục sản phẩm đã xóa (chỉ admin)
router.post("/restore/:id", isAdmin, async (req, res) => {
    await restoreProduct(req.params.id);
    res.redirect("/products/deleted");
});

module.exports = router;

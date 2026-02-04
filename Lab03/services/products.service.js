/**
 * Products Service (Refactored)
 * Xử lý logic sản phẩm - Chỉ dùng DynamoDB, không mock data
 */

const productsRepository = require("../repositories/products.repository");
const productLogsRepository = require("../repositories/product-logs.repository");
const categoriesRepository = require("../repositories/categories.repository");
const { v4: uuidv4 } = require("uuid");

// Lấy tất cả sản phẩm (chưa xóa)
exports.getAllProducts = async () => {
    return await productsRepository.findAllActive();
};

// Lấy tất cả sản phẩm (bao gồm đã xóa)
exports.getAllProductsIncludeDeleted = async () => {
    return await productsRepository.findAllIncludeDeleted();
};

// Lấy sản phẩm đã xóa
exports.getDeletedProducts = async () => {
    return await productsRepository.findDeleted();
};

// Lấy sản phẩm theo ID
exports.getProductById = async (id) => {
    return await productsRepository.findById(id);
};

// Tạo sản phẩm mới
exports.createProduct = async (productData, userId) => {
    const product = {
        id: uuidv4(),
        name: productData.name,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        categoryId: productData.categoryId || "",
        url_image: productData.url_image || "",
        isDeleted: false,
        createdAt: new Date().toISOString()
    };

    await productsRepository.create(product);

    // Ghi log
    await productLogsRepository.logAction(product.id, "CREATE", userId, {
        name: product.name,
        price: product.price,
        quantity: product.quantity
    });

    return product;
};

// Cập nhật sản phẩm
exports.updateProduct = async (id, updateData, userId) => {
    const oldProduct = await productsRepository.findById(id);
    
    const dataToUpdate = {
        name: updateData.name,
        price: Number(updateData.price),
        quantity: Number(updateData.quantity),
        categoryId: updateData.categoryId || "",
        url_image: updateData.url_image || oldProduct?.url_image || "",
        updatedAt: new Date().toISOString()
    };

    await productsRepository.update(id, dataToUpdate);

    // Ghi log
    await productLogsRepository.logAction(id, "UPDATE", userId, {
        before: oldProduct,
        after: dataToUpdate
    });

    return { id, ...dataToUpdate };
};

// Soft delete sản phẩm
exports.deleteProduct = async (id, userId) => {
    const product = await productsRepository.findById(id);
    
    await productsRepository.softDelete(id);

    // Ghi log
    await productLogsRepository.logAction(id, "DELETE", userId, {
        name: product?.name
    });

    return true;
};

// Hard delete (xóa vĩnh viễn)
exports.hardDeleteProduct = async (id, userId) => {
    const product = await productsRepository.findById(id);
    
    await productsRepository.delete(id);

    // Ghi log
    await productLogsRepository.logAction(id, "HARD_DELETE", userId, {
        name: product?.name
    });

    return true;
};

// Khôi phục sản phẩm
exports.restoreProduct = async (id, userId) => {
    await productsRepository.restore(id);

    // Ghi log
    await productLogsRepository.logAction(id, "RESTORE", userId, {});

    return true;
};

// Tìm kiếm & lọc nâng cao
exports.searchProducts = async (filters) => {
    return await productsRepository.advancedSearch(filters);
};

// Lấy sản phẩm theo category
exports.getProductsByCategory = async (categoryId) => {
    return await productsRepository.findByCategory(categoryId);
};

// Phân trang sản phẩm (client-side pagination vì DynamoDB không hỗ trợ offset)
exports.getProductsPaginated = async (page = 1, limit = 10, filters = {}) => {
    let products;
    
    if (Object.keys(filters).length > 0) {
        products = await productsRepository.advancedSearch(filters);
    } else {
        products = await productsRepository.findAllActive();
    }

    const totalItems = products.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
        products: products.slice(startIndex, endIndex),
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};

// Lấy trạng thái tồn kho
exports.getInventoryStatus = (quantity) => {
    if (quantity === 0) {
        return { text: "Hết hàng", class: "danger", icon: "❌" };
    } else if (quantity < 5) {
        return { text: `Sắp hết (${quantity})`, class: "warning", icon: "⚠️" };
    } else {
        return { text: "Còn hàng", class: "success", icon: "✅" };
    }
};

// Lấy thống kê tồn kho
exports.getInventoryStats = async () => {
    const products = await productsRepository.findAllActive();
    
    const stats = {
        total: products.length,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
    };

    products.forEach(p => {
        stats.totalValue += p.price * p.quantity;
        
        if (p.quantity === 0) {
            stats.outOfStock++;
        } else if (p.quantity < 5) {
            stats.lowStock++;
        } else {
            stats.inStock++;
        }
    });

    return stats;
};

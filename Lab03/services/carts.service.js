/**
 * Cart Service
 * Xử lý logic giỏ hàng
 */

const cartsRepository = require("../repositories/carts.repository");
const productsRepository = require("../repositories/products.repository");
const { v4: uuidv4 } = require("uuid");

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (userId, productId, quantity = 1) => {
    // Kiểm tra sản phẩm tồn tại và còn hàng
    const product = await productsRepository.findById(productId);
    
    if (!product) {
        throw new Error("Sản phẩm không tồn tại");
    }
    
    if (product.isDeleted) {
        throw new Error("Sản phẩm đã ngừng kinh doanh");
    }
    
    if (product.quantity < quantity) {
        throw new Error(`Không đủ số lượng (còn ${product.quantity} sản phẩm)`);
    }

    // Kiểm tra đã có trong giỏ chưa
    const existingItem = await cartsRepository.findCartItem(userId, productId);
    
    if (existingItem) {
        // Cập nhật số lượng
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.quantity) {
            throw new Error(`Không thể thêm. Tổng số lượng vượt quá tồn kho (còn ${product.quantity})`);
        }
        
        await cartsRepository.updateQuantity(existingItem.id, newQuantity);
        return { ...existingItem, quantity: newQuantity };
    } else {
        // Thêm mới
        const cartItem = {
            id: uuidv4(),
            userId,
            productId,
            quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await cartsRepository.create(cartItem);
        return cartItem;
    }
};

// Lấy giỏ hàng với thông tin sản phẩm
exports.getCartWithProducts = async (userId) => {
    const cartItems = await cartsRepository.findByUserId(userId);
    
    const cartWithProducts = [];
    let totalAmount = 0;

    for (const item of cartItems) {
        const product = await productsRepository.findById(item.productId);
        
        if (product && !product.isDeleted) {
            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;
            
            cartWithProducts.push({
                ...item,
                product,
                subtotal,
                isAvailable: product.quantity >= item.quantity,
                stockStatus: getStockStatus(product.quantity)
            });
        }
    }

    return {
        items: cartWithProducts,
        totalItems: cartWithProducts.length,
        totalAmount
    };
};

// Cập nhật số lượng trong giỏ
exports.updateCartItemQuantity = async (userId, cartItemId, quantity) => {
    const cartItems = await cartsRepository.findByUserId(userId);
    const cartItem = cartItems.find(item => item.id === cartItemId);
    
    if (!cartItem) {
        throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    }

    if (quantity <= 0) {
        // Xóa khỏi giỏ
        await cartsRepository.delete(cartItemId);
        return null;
    }

    // Kiểm tra tồn kho
    const product = await productsRepository.findById(cartItem.productId);
    if (quantity > product.quantity) {
        throw new Error(`Không đủ số lượng (còn ${product.quantity} sản phẩm)`);
    }

    await cartsRepository.updateQuantity(cartItemId, quantity);
    return { ...cartItem, quantity };
};

// Xóa sản phẩm khỏi giỏ
exports.removeFromCart = async (userId, cartItemId) => {
    const cartItems = await cartsRepository.findByUserId(userId);
    const cartItem = cartItems.find(item => item.id === cartItemId);
    
    if (!cartItem) {
        throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    }

    await cartsRepository.delete(cartItemId);
    return true;
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (userId) => {
    await cartsRepository.clearCart(userId);
    return true;
};

// Đếm số lượng items trong giỏ
exports.getCartCount = async (userId) => {
    const cartItems = await cartsRepository.findByUserId(userId);
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
};

// Helper: Lấy trạng thái tồn kho
function getStockStatus(quantity) {
    if (quantity === 0) {
        return { text: "Hết hàng", class: "danger", icon: "❌" };
    } else if (quantity < 5) {
        return { text: `Sắp hết (còn ${quantity})`, class: "warning", icon: "⚠️" };
    } else {
        return { text: "Còn hàng", class: "success", icon: "✅" };
    }
}

exports.getStockStatus = getStockStatus;

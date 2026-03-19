const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../services/product.service");
const {
    uploadProductImage,
    deleteImageByKey
} = require("../services/s3.service");

const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.render("products/list", { products });
    } catch (error) {
        res.status(500).send(`Lỗi lấy dữ liệu sản phẩm: ${error.message}`);
    }
};


exports.getAddForm = (req, res) => {
    res.render("products/add");
};
exports.createProduct = async (req, res) => {
    const { name, price, quantity } = req.body;
    const parsedPrice = parseNumber(price);
    const parsedQuantity = parseNumber(quantity);

    if (!name || parsedPrice === null || parsedQuantity === null) {
        return res.status(400).send("Dữ liệu sản phẩm không hợp lệ");
    }

    try {
        const imageInfo = await uploadProductImage(req.file);

        const newProduct = {
            id: Date.now().toString(),
            name,
            price: parsedPrice,
            quantity: parsedQuantity,
            imageKey: imageInfo.imageKey,
            imageUrl: imageInfo.imageUrl
        };

        await createProduct(newProduct);
        res.redirect("/products");
    } catch (error) {
        res.status(500).send(`Lỗi tạo sản phẩm: ${error.message}`);
    }
};
exports.getEditForm = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }

        res.render("products/edit", { product });
    } catch (error) {
        res.status(500).send(`Lỗi đọc sản phẩm: ${error.message}`);
    }
};
exports.updateProduct = async (req, res) => {
    const { name, price, quantity } = req.body;
    const parsedPrice = parseNumber(price);
    const parsedQuantity = parseNumber(quantity);

    if (!name || parsedPrice === null || parsedQuantity === null) {
        return res.status(400).send("Dữ liệu sản phẩm không hợp lệ");
    }

    try {
        const existing = await getProductById(req.params.id);
        if (!existing) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }

        let imageKey = existing.imageKey || "";
        let imageUrl = existing.imageUrl || "";

        if (req.file) {
            const imageInfo = await uploadProductImage(req.file);
            imageKey = imageInfo.imageKey;
            imageUrl = imageInfo.imageUrl;

            if (existing.imageKey) {
                await deleteImageByKey(existing.imageKey);
            }
        }

        await updateProduct(req.params.id, {
            name,
            price: parsedPrice,
            quantity: parsedQuantity,
            imageKey,
            imageUrl
        });

        res.redirect("/products");
    } catch (error) {
        res.status(500).send(`Lỗi cập nhật sản phẩm: ${error.message}`);
    }

};
exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await deleteProduct(req.params.id);
        if (!deleted) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }

        if (deleted.imageKey) {
            await deleteImageByKey(deleted.imageKey);
        }

        res.redirect("/products");
    } catch (error) {
        res.status(500).send(`Lỗi xóa sản phẩm: ${error.message}`);
    }

};


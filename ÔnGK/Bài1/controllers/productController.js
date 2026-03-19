const productModel = require("../models/productModel");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const deleteOldImage = (url_image) => {
    if (url_image && url_image !== "/uploads/default.png") {
        const filePath = path.join(__dirname, "../public", url_image);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

const index = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        let products = [];
        if (searchQuery) {
            products = await productModel.searchProducts(searchQuery);
        } else {
            products = await productModel.getAllProducts();
        }
        res.render("index", { 
            products, 
            searchQuery,
            success_msg: req.flash("success_msg"),
            error_msg: req.flash("error_msg"),
        });
    } catch (err) {
        req.flash("error_msg", "Cannot fetch products.");
        res.render("index", { products: [], searchQuery: "" });
    }
};

const showAdd = (req, res) => {
    res.render("add", {
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
    });
};

const addProduct = async (req, res) => {
    const { name, price, unit_in_stock } = req.body;
    let url_image = "/uploads/default.png";

    if (req.file) {
        url_image = "/uploads/" + req.file.filename;
    }

    if (!name || !price || !unit_in_stock) {
        if (req.file) deleteOldImage(url_image);
        req.flash("error_msg", "Please fill all required fields.");
        return res.redirect("/products/add");
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(unit_in_stock, 10);
    if (isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
        if (req.file) deleteOldImage(url_image);
        req.flash("error_msg", "Price and Unit in Stock must be positive numbers.");
        return res.redirect("/products/add");
    }

    const newProduct = {
        id: uuidv4(),
        name,
        price: priceNum,
        unit_in_stock: stockNum,
        url_image,
    };

    try {
        await productModel.addProduct(newProduct);
        req.flash("success_msg", "Product added successfully!");
        res.redirect("/");
    } catch (err) {
        if (req.file) deleteOldImage(url_image);
        req.flash("error_msg", "Failed to add product.");
        res.redirect("/products/add");
    }
};

const showEdit = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id);
        if (!product) {
            req.flash("error_msg", "Product not found.");
            return res.redirect("/");
        }
        res.render("edit", { 
            product,
            success_msg: req.flash("success_msg"),
            error_msg: req.flash("error_msg"),
        });
    } catch (err) {
        req.flash("error_msg", "Something went wrong.");
        res.redirect("/");
    }
};

const updateProduct = async (req, res) => {
    const id = req.params.id;
    const { name, price, unit_in_stock } = req.body;
    
    try {
        const existingProduct = await productModel.getProductById(id);
        if (!existingProduct) {
            if (req.file) deleteOldImage("/uploads/" + req.file.filename);
            req.flash("error_msg", "Product not found.");
            return res.redirect("/");
        }

        let updateData = { name, price: parseFloat(price), unit_in_stock: parseInt(unit_in_stock, 10) };
        if (isNaN(updateData.price) || updateData.price < 0 || isNaN(updateData.unit_in_stock) || updateData.unit_in_stock < 0) {
            if (req.file) deleteOldImage("/uploads/" + req.file.filename);
            req.flash("error_msg", "Invalid number inputs.");
            return res.redirect(`/products/edit/${id}`);
        }

        if (req.file) {
            updateData.url_image = "/uploads/" + req.file.filename;
            deleteOldImage(existingProduct.url_image);
        }

        await productModel.updateProduct(id, updateData);
        req.flash("success_msg", "Product updated successfully!");
        res.redirect("/");
    } catch (err) {
        if (req.file) deleteOldImage("/uploads/" + req.file.filename);
        req.flash("error_msg", "Failed to update product.");
        res.redirect(`/products/edit/${id}`);
    }
};

const showDetails = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id);
        if (!product) {
            req.flash("error_msg", "Product not found.");
            return res.redirect("/");
        }
        res.render("details", { 
            product,
            success_msg: req.flash("success_msg"),
            error_msg: req.flash("error_msg"),
        });
    } catch (err) {
        req.flash("error_msg", "Failed to retrieve product.");
        res.redirect("/");
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id);
        if (product) {
            deleteOldImage(product.url_image);
            await productModel.deleteProduct(req.params.id);
            req.flash("success_msg", "Product deleted successfully!");
        } else {
            req.flash("error_msg", "Product not found.");
        }
        res.redirect("/");
    } catch (err) {
        req.flash("error_msg", "Failed to delete product.");
        res.redirect("/");
    }
};

module.exports = {
    index,
    showAdd,
    addProduct,
    showEdit,
    updateProduct,
    showDetails,
    deleteProduct,
};

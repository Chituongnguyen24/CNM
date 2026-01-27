const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../services/dynamodb.service");

const { uploadImage, deleteImageByUrl, listImages } = require("../services/s3.service");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// READ
router.get("/", async (req, res) => {
    const products = await getAllProducts();
    res.render("products/list", { products });
});

// CREATE
router.get("/add", async (req, res) => {
    const images = await listImages();
    res.render("products/add", { images });
});

router.post("/add", upload.single("image"), async (req, res) => {
    const { name, price, quantity, selectedImage } = req.body;

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
        url_image: imageUrl
    });

    res.redirect("/products");
});

// UPDATE
router.get("/edit/:id", async (req, res) => {
    const product = await getProductById(req.params.id);
    const images = await listImages();
    res.render("products/edit", { product, images });
});

router.post("/edit/:id", upload.single("image"), async (req, res) => {
    const { name, price, quantity, oldImage, selectedImage } = req.body;

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
        url_image: imageUrl
    });

    res.redirect("/products");
});

// DELETE
router.post("/delete/:id", async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (product && product.url_image) {
            await deleteImageByUrl(product.url_image);
        }
    } catch (err) {
        console.error('Error deleting image:', err && err.message ? err.message : err);
    }

    await deleteProduct(req.params.id);
    res.redirect("/products");
});

module.exports = router;

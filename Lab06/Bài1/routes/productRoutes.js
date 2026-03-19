const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/uploads/"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Not an image! Please upload an image."), false);
        }
    }
});

router.get("/", productController.index);
router.get("/products/add", productController.showAdd);
router.post("/products/add", upload.single("image"), productController.addProduct);
router.get("/products/edit/:id", productController.showEdit);
router.post("/products/edit/:id", upload.single("image"), productController.updateProduct);
router.get("/products/details/:id", productController.showDetails);
router.get("/products/delete/:id", productController.deleteProduct);

module.exports = router;

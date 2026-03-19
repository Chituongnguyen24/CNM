const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controllers/product.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", controller.getAllProducts);
router.get("/add", controller.getAddForm);
router.post("/add", upload.single("image"), controller.createProduct);
router.get("/edit/:id", controller.getEditForm);
router.post("/edit/:id", upload.single("image"), controller.updateProduct);
router.get("/delete/:id", controller.deleteProduct);

module.exports = router;

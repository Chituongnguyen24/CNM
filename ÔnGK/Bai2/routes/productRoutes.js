const express = require("express");
const upload = require("../middleware/upload");
const productController = require("../controllers/productController");

const router = express.Router();

router.get("/", productController.index);
router.get("/products/new", productController.createForm);
router.post("/products", upload.single("url_image"), productController.create);
router.get("/products/:id", productController.show);
router.get("/products/:id/edit", productController.editForm);
router.put("/products/:id", upload.single("url_image"), productController.update);
router.delete("/products/:id", productController.destroy);

module.exports = router;

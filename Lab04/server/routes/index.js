const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const controller = require("../controllers/index");

router.get("/", controller.index);
router.get("/create", controller.createForm);
router.post("/create", upload.single("image"), controller.create);
router.get("/delete/:id", controller.delete);

module.exports = router;
const { v4: uuid } = require("uuid");
const Product = require("../models/index");
const { s3 } = require("../config/aws");

exports.index = async (req, res) => {
    const products = await Product.getAll();
    res.render("index", { products });
};

exports.createForm = (req, res) => {
    res.render("create");
};

exports.create = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send("Please upload an image");
        }

        const upload = await s3.upload({
            Bucket: "lab04-store",
            Key: `${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        }).promise();

        const product = {
            id: uuid(),
            name: req.body.name,
            image: upload.Location
        };

        await Product.create(product);

        res.redirect("/");
    } catch (error) {
        console.error("Create error:", error);
        res.status(500).send("Error creating product: " + error.message);
    }
};

exports.delete = async (req, res) => {
    await Product.delete(req.params.id);
    res.redirect("/");
};
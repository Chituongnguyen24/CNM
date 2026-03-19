const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const productModel = require("./models/productModel");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DynamoDB and init table
productModel.initTable().catch(console.error);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure default image exists (create a dummy if not)
const defaultImgPath = path.join(uploadsDir, "default.png");
if (!fs.existsSync(defaultImgPath)) {
    // A base64 1x1 png for fallback
    const dummyImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "base64");
    fs.writeFileSync(defaultImgPath, dummyImage);
}

// App configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session for flash messages
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Use routes
app.use("/", productRoutes);

app.use((err, req, res, next) => {
    if (err) {
        req.flash("error_msg", err.message);
        return res.redirect("back");
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

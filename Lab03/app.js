require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");

const indexRouter = require("./routes/index");
const productRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const cartRouter = require("./routes/cart");
const logsRouter = require("./routes/logs");

const { addUserToLocals } = require("./middleware/auth");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || "lab03-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware để thêm user info vào tất cả views
app.use(addUserToLocals);

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/users", usersRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/logs", logsRouter);

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: app.get("env") === "development" ? err : {}
    });
});

module.exports = app;

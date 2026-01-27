require("dotenv").config();
const express = require("express");
const path = require("path");

const indexRouter = require("./routes/index");
const productRouter = require("./routes/products");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/products", productRouter);

module.exports = app;

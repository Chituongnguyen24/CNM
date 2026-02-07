const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const productRoutes = require("./routes/product.routes");
app.use("/products", productRoutes);

app.listen(3001, () => {
  console.log("Server chạy tại http://localhost:3001/products");
});

require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "producthub-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.locals.success = req.session.success || "";
  res.locals.error = req.session.error || "";
  delete req.session.success;
  delete req.session.error;
  next();
});

app.use("/", productRoutes);

app.use((req, res) => {
  res.status(404).render("partials/notFound", { title: "404 - Không tìm thấy" });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

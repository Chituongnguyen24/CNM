const { randomUUID } = require("crypto");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../models/productModel");
const { removeLocalFile } = require("../utils/file");

const pageTitle = "Quản lý sản phẩm";
const emptyForm = { name: "", price: "", unit_in_stock: "" };
const imgFromReq = (req) => (req.file ? `/uploads/${req.file.filename}` : "");
const flash = (req, key, msg) => {
  req.session[key] = msg;
};
const redirectError = (req, res, msg, to = "/") => {
  flash(req, "error", msg);
  return res.redirect(to);
};

function validateInput({ name, price, unit_in_stock }) {
  const errors = [];
  const cleanName = (name || "").trim();
  const numericPrice = Number(price);
  const numericStock = Number(unit_in_stock);

  if (!cleanName) errors.push("Tên sản phẩm không được để trống.");
  if (!Number.isFinite(numericPrice) || numericPrice < 0) errors.push("Giá phải là số không âm.");
  if (!Number.isInteger(numericStock) || numericStock < 0) {
    errors.push("Số lượng tồn phải là số nguyên không âm.");
  }

  return { errors, cleanName, numericPrice, numericStock };
}

async function index(req, res) {
  try {
    const q = (req.query.q || "").trim();
    const products = await getAllProducts(q);
    return res.render("products/index", { title: pageTitle, products, q });
  } catch (error) {
    return res.status(500).render("products/index", {
      title: pageTitle,
      products: [],
      q: "",
      error: `Lỗi tải danh sách: ${error.message}`
    });
  }
}

function createForm(req, res) {
  return res.render("products/create", {
    title: "Thêm sản phẩm",
    formData: emptyForm,
    errors: []
  });
}

async function create(req, res) {
  const { name, price, unit_in_stock } = req.body;
  const { errors, cleanName, numericPrice, numericStock } = validateInput({ name, price, unit_in_stock });
  const imageUrl = imgFromReq(req);

  if (!imageUrl) errors.push("Vui lòng chọn ảnh sản phẩm.");

  if (errors.length > 0) {
    if (imageUrl) removeLocalFile(imageUrl);

    return res.status(400).render("products/create", {
      title: "Thêm sản phẩm",
      errors,
      formData: { name, price, unit_in_stock }
    });
  }

  try {
    await createProduct({
      id: randomUUID(),
      name: cleanName,
      price: numericPrice,
      unit_in_stock: numericStock,
      url_image: imageUrl
    });

    flash(req, "success", "Thêm sản phẩm thành công");
    return res.redirect("/");
  } catch (error) {
    if (imageUrl) removeLocalFile(imageUrl);

    return res.status(500).render("products/create", {
      title: "Thêm sản phẩm",
      errors: [`Lỗi thêm sản phẩm: ${error.message}`],
      formData: { name, price, unit_in_stock }
    });
  }
}

async function show(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return redirectError(req, res, "Không tìm thấy sản phẩm");
    return res.render("products/show", { title: "Chi tiết sản phẩm", product });
  } catch (error) {
    return redirectError(req, res, `Lỗi tải chi tiết: ${error.message}`);
  }
}

async function editForm(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return redirectError(req, res, "Không tìm thấy sản phẩm");
    return res.render("products/edit", { title: "Sửa sản phẩm", product, errors: [] });
  } catch (error) {
    return redirectError(req, res, `Lỗi tải dữ liệu sửa: ${error.message}`);
  }
}

async function update(req, res) {
  const { id } = req.params;
  const uploadedImage = imgFromReq(req);

  try {
    const existing = await getProductById(id);

    if (!existing) {
      if (uploadedImage) removeLocalFile(uploadedImage);
      return redirectError(req, res, "Không tìm thấy sản phẩm");
    }

    const { name, price, unit_in_stock } = req.body;
    const { errors, cleanName, numericPrice, numericStock } = validateInput({ name, price, unit_in_stock });
    const nextImageUrl = uploadedImage || existing.url_image;

    if (!nextImageUrl) errors.push("Sản phẩm cần có ảnh.");

    if (errors.length > 0) {
      if (uploadedImage) removeLocalFile(uploadedImage);

      return res.status(400).render("products/edit", {
        title: "Sửa sản phẩm",
        errors,
        product: {
          ...existing,
          name,
          price,
          unit_in_stock
        }
      });
    }

    await updateProduct(id, {
      name: cleanName,
      price: numericPrice,
      unit_in_stock: numericStock,
      url_image: nextImageUrl
    });

    if (uploadedImage && existing.url_image !== nextImageUrl) {
      removeLocalFile(existing.url_image);
    }

    flash(req, "success", "Cập nhật sản phẩm thành công");
    return res.redirect("/");
  } catch (error) {
    if (uploadedImage) removeLocalFile(uploadedImage);
    return redirectError(req, res, `Lỗi cập nhật: ${error.message}`, `/products/${id}/edit`);
  }
}

async function destroy(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return redirectError(req, res, "Không tìm thấy sản phẩm");

    await deleteProduct(req.params.id);
    removeLocalFile(product.url_image);

    flash(req, "success", "Xóa sản phẩm thành công");
    return res.redirect("/");
  } catch (error) {
    return redirectError(req, res, `Lỗi xóa sản phẩm: ${error.message}`);
  }
}

module.exports = {
  index,
  createForm,
  create,
  show,
  editForm,
  update,
  destroy
};

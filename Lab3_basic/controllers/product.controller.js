const products= require("../data/products")
exports.getAllProducts=(req,res)=>{
    res.render("product/list",{products});
};
exports.getAddForm = (req, res) => {
    res.render("products/add");
};
exports.createProduct = (req, res) => {
    const { name, price, quantity } = req.body;

    const newProduct = {
        id: Date.now().toString(),
        name,
        price: Number(price),
        quantity: Number(quantity)
    };

    products.push(newProduct);
    res.redirect("/products");
};
exports.getEditForm = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    res.render("products/edit", { product });
};
exports.updateProduct = (req, res) => {
    const { name, price, quantity } = req.body;
    const product = products.find(p => p.id === req.params.id);

    product.name = name;
    product.price = Number(price);
    product.quantity = Number(quantity);

    res.redirect("/products");
};
exports.deleteProduct = (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    products.splice(index, 1);
    res.redirect("/products");
};


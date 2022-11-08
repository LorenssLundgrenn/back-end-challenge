module.exports = app => {
    const productController = require("../controllers/product.controller.js");
    var router = require("express").Router();

    router.post("/", productController.addProduct);
    router.get("/", productController.getProducts);
    router.put("/:id", productController.updateProduct);
    router.delete("/:id", productController.deleteProduct);

    app.use("/api/products", router); //link router to main express object
}
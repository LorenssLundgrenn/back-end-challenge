const db = require("../config/db.config.js");
const ProductModel = db.productModel;

const functions = require("./functions.js");

exports.addProduct = async (req, res) => {
    let user = await functions.authUser(req);
    if (user) {
        let sellerId = user._id;
        let dataBody = req.body.data;
        let newProduct = ProductModel({
            sellerId:        sellerId,
            cost:            dataBody.cost,
            productName:     dataBody.productName,
            amountAvailable: dataBody.amountAvailable
        });

        newProduct.save(newProduct)
        .then(data => {
            res.send({
                message: "successfully created product",
                data
            })
        })
        .catch(err => {
            res.status(500).send({
                message: `error creating product:\n${err.message}`
            });
        });
    } else {
        res.status(400).send({
            message: "could not authenticate"
        });
    }
}

exports.getProducts = (req, res) => {
    ProductModel.find({})
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        console.log(`error fetching products:\n${err.message}`);
    })
}

exports.updateProduct = async (req, res) => {
    let user = await functions.authUser(req);
    if (user) {
        let dataBody = req.body.data;
        if (dataBody.sellerId) { 
            res.status(500).send({ 
                message: "cannot change seller id" }); 
        } else {
            let reqId = req.params.id;
            ProductModel.findByIdAndUpdate(reqId, dataBody, {useFindAndModify: false})
            .then(data => {
                if (data) {
                    res.send({ 
                        message: `successfully updated product ${reqId}` 
                    });
                } else {
                    res.status(404).send({
                        message: `product ${reqId} could not be updated. Perhaps not found`
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: `error updating product ${reqId}:\n${err.message}`
                });
            });
        }
    } else {
        res.status(400).send({
            message: "could not authenticate"
        });
    }
}

exports.deleteProduct = async (req, res) => {
    let user = await functions.authUser(req);
    if (user) {
        let dataBody = req.body.data;
        let reqId = req.params.id;
            ProductModel.findByIdAndDelete(reqId)
            .then(data => {
                if (data) {
                    res.send({
                        message: "successfully deleted product"
                    });
                }
                else {
                    res.status(404).send({
                        message: `could not delete product ${reqId}. perhaps not found`
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: `error deleting product ${reqId}:\n${err.message}`
                });
            })
    } else {
        res.status(400).send({
            message: "could not authenticate"
        });
    }
}
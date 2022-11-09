const db = require("../config/db.config.js");
const functions = require("./functions.js");

const ProductModel = db.productModel;

exports.addProduct = async (req, res) => {
    let user = await functions.authUser(req, res);
    if (!user) { return; }

    let sellerId = user._id;
    let dataBody = req.body.data ? req.body.data : {};
    let cost = dataBody.cost;
    if (!(cost%5==0 || cost%2==0)) {
        res.status(400).send({
            message: "this price cannot be reasonably funded by supported coins"
        });
        return;
    }

    let newProduct = ProductModel({
        sellerId:        sellerId,
        cost:            cost,
        productName:     dataBody.productName,
        amountAvailable: dataBody.amountAvailable
    });
    await newProduct.save(newProduct)
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
}

exports.getProducts = async (req, res) => {
    await ProductModel.find({})
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: `error fetching products:\n${err.message}`
        });
    });
}

exports.updateProduct = async (req, res) => {
    let user = await functions.authUser(req, res);
    if (!user) { return; }

    let dataBody = req.body.data ? req.body.data : {}; 
    if (dataBody.sellerId) { 
        res.status(500).send({ 
            message: "cannot change seller id" 
        }); 
        return;
    }
    
    let reqId = req.params.id;
    await ProductModel.findOneAndUpdate({
        _id: reqId,
        sellerId: user._id
    }, dataBody, {useFindAndModify: false})
    .then(data => {
        if (data) {
            res.send({ 
                message: `successfully updated product ${reqId}` 
            });
        } else {
            res.status(404).send({
                message: `product ${reqId} could not be found for user ${user.id}`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: `error updating product ${reqId}:\n${err.message}`
        });
    });
}

exports.deleteProduct = async (req, res) => {
    let user = await functions.authUser(req, res);
    if (!user) { return; }

    let reqId = req.params.id;
    await ProductModel.findOneAndDelete({
        _id: reqId,
        sellerId: user._id
    })
    .then(data => {
        if (data) {
            res.send({
                message: "successfully deleted product"
            });
        }
        else {
            res.status(404).send({
                message: `product ${reqId} could not be found for user ${user.id}`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: `error deleting product ${reqId}:\n${err.message}`
        });
    })
}
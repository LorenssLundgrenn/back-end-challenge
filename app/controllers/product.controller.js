const db = require("../config/db.config.js");
const ProductModel = db.productModel;

const functions = require("./functions.js");

exports.addProduct = async (req, res) => {
    let user = await functions.authUser(req.body.auth, true, res);
    if (!user) { return; }

    let sellerId = user._id;
    let dataBody = req.body.data;
    if (!functions.dataBodyOk(dataBody, res)) { return; }

    let cost = dataBody.cost;
    if ( cost && ! (cost%5==0 || cost%2==0) ) {
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
    let user = await functions.authUser(req.body.auth, true, res);
    if (!user) { return; }

    let dataBodyToUpdate = req.body.data ? req.body.data : {}; 
    if (!functions.dataBodyOk(dataBodyToUpdate, res)) { return; }

    if (dataBodyToUpdate.sellerId) { 
        res.status(500).send({ 
            message: "cannot change seller id" 
        }); 
        return;
    }
    
    let productId = req.params.id;
    let userId = user._id;
    await ProductModel.findOneAndUpdate(
    {
        _id: productId,
        sellerId: user._id
    }, 
    dataBodyToUpdate, 
    {
        useFindAndModify: false
    }
    ).then(data => {
        if (data) {
            res.send({ 
                message: `successfully updated product ${productId}` 
            });
        } else {
            res.status(404).send({
                message: `product ${productId} could not be found for user ${userId}`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: `error updating product ${productId}:\n${err.message}`
        });
    });
}

exports.deleteProduct = async (req, res) => {
    let user = await functions.authUser(req.body.auth, true, res);
    if ( !user ) { return; }

    let productId = req.params.id;
    await ProductModel.findOneAndDelete(
    {
        _id: productId,
        sellerId: user._id
    }
    ).then(data => {
        if (data) {
            res.send({
                message: "successfully deleted product"
            });
        }
        else {
            res.status(404).send({
                message: `product ${productId} could not be found for user ${user.id}`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: `error deleting product ${productId}:\n${err.message}`
        });
    })
}
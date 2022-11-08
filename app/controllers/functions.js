const db = require("../config/db.config.js");
const userModel = require("../models/user.model.js");

const UserModel = db.userModel;

exports.findUserById = async (reqId) => {
    return await UserModel.findById(reqId);
}

exports.authUser = async (req) => {
    let authBody = req.body.auth;
    return await UserModel.findOne({ 
        username: authBody.username, 
        password: authBody.password, 
        seller: true
    });
}

const ProductModel = db.productModel;

exports.findProductById = async (reqId) => {
    return await ProductModel.findById(reqId);
}
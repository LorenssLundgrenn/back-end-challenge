const db = require("../config/db.config.js");
const bcrypt = require("bcrypt");

const UserModel = db.userModel;
const ProductModel = db.productModel;

exports.findUserById = async (reqId, res) => {
    let user = await UserModel.findById(reqId)
    .catch(err => {
        res.status(404).send({
            message: `user ${reqId} could not be found`
        });
        return;
    });
    return user;
}

exports.findProductById = async (reqId, res) => {
    let user = await ProductModel.findById(reqId)
    .catch(err => {
        res.status(404).send({
            message: `product ${reqId} could not be found`
        });
        return;
    });
    return user;
}

exports.authUser = async (req, res, seller=true) => {
    let authBody = req.body.auth;
    if (!authBody) {
        res.status(400).send({
            message: "please specify an auth body with a password and username field"
        });
        return;
    } 
    
    let user = await UserModel.findOne({ 
        username: authBody.username
    })
    .catch(err => {
        res.status(500).send({
            message: `error fetching user:\n${err}`
        });
        return;
    });

    if (!user) {
        res.status(400).send({
            message: "user not found"
        });
    }
    else {
        let authorize = await bcrypt.compare(authBody.password, user.password)
        .catch(err => {
            res.status(500).send({
                message: `bcrypt compare error:\n${err}`
            });
        });
        
        if (authorize) {
            if (user.seller == seller) {
                return user;
            } else {
                res.status(400).send({
                    message: "unauthorized action for role"
                });
            }
        } else {
            res.status(400).send({
                message: `could not authenticate`
            });
        }
    }

    return undefined;
}

exports.hash = async (clearText, res) => {
    let cipherText;
    await bcrypt.genSalt(10)
    .then(async salt => {
        await bcrypt.hash(clearText, salt)
        .then(hash => {
            cipherText = hash;
        })
        .catch(err => {
            res.status(500).send({
                message: `encryption error, make sure your request body` + 
                `has username and password fields:\n${err}`
            });
            return undefined;
        });
    })
    .catch(err => {
        res.status(500).send({
            message: `error occured when generating salt:\n${err}`
        });
        return undefined;
    });

    return cipherText;
}

exports.coinVal = (totalCost) => {
    let msg = "";
    let coinTypes = [100, 50, 20, 10, 5, 2];
    for (let i = 0; i < coinTypes.length; i++) {
        let type = coinTypes[i];
        let wholeFit = Math.floor(totalCost / type);
        if (wholeFit >= 1) {
            totalCost -= wholeFit * type;
            let suffix = (totalCost>1) ? ", " : ''
            msg += `${wholeFit} ${type} cent coins${suffix}`;
        }
    }
    if (msg=="") {msg="no change"}
    return msg
}
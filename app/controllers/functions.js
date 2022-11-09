const db = require("../config/db.config.js");

const UserModel = db.userModel;
const ProductModel = db.productModel;

function authBodyOk(authBody, res) {
    let ok = false;
    if (!authBody) {
        res.send({
            message: "please specify an \"auth\" object with username and password fields"
        });
    } else {
        if (!authBody.username) {
            res.send({
                message: "please specify a username field"
            });
        } else if (!authBody.password) {
            res.send({
                message: "please specify a password field"
            });
        }
        else { ok = true; }
    }

    return ok;
}

exports.dataBodyOk = (dataBody, res=null) => {
    if ( ! ( dataBody instanceof Object ) ) {
        if (res != null) {
            res.send({
                message: "please specify a \"data\" object"
            });
        }
        return false;
    } 

    return true;
}

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

exports.authUser = async(authBody, authorizeSeller, res) => {
    if (!authBodyOk) { return; }

    let user = undefined;
    await UserModel.findOne({ username: authBody.username })
    .catch(err => {
        res.status(500).send({
            message: `error finding user by username:\n${err}`
        });
        return;
    })
    .then(async data => {
        if (!data) {
            res.status(404).send({
                message: `could not find user by username: ${authBody.username}`
            });
            return;
        }

        if (data.seller != authorizeSeller) {
            res.status(400).send({ 
                message: "unauthorized action for role" 
            });
            return;
        }

        let authOk = false;
        await data.authenticate(authBody.password)
        .then(auth => { 
            if (!auth) {
                res.send({
                    message: "could not authenticate"
                });
            } else {
                authOk = true;
            }
        })
        .catch(err => {
            res.status(500).send({ 
                message: `error authenticating:\n${err}` 
            });
        })

        if (authOk) {
            user = data;
        }
    });

    return user;
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
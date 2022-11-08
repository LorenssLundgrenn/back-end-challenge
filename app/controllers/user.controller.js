const db = require("../config/db.config.js");
const UserModel = db.userModel;

const functions = require("./functions.js");

exports.signUp = (req, res) => {
    let newUser = UserModel({
        username: req.body.username,
        password: req.body.password,
        seller:   req.body.seller,
        deposit:  0
    });
    newUser.save(newUser)
    .then(data => {
        res.json({ 
            message: "successfully created user",
            data
        });
    })
    .catch(err => {
        res.status(500).send({ 
            message: `error creating user:\n${err.message}`
        });
    });
}

exports.deposit = (req, res) => {
    let reqId = req.params.id;
    let type = req.body.type; //coin type: 2, 5, 10, 20, 50, or 100 cents
    let quantity = req.body.quantity; //quantity of specified coin
    if (!type || ![2, 5, 10, 20, 50, 100].includes(type)) {
        res.status(400).send({ 
            message: "please specify a coin type: 2, 5, 10, 20, 50, or 100" 
        });
    } else if (!quantity || quantity < 0) {
        res.status(400).send({ 
            message: "please specify coin quantity" 
        });
    } else {
        (async () => {
            let data = await functions.findUserById(reqId, res);
            if (data){
                let newDeposit = { deposit: data.deposit + type * quantity };
                UserModel.findByIdAndUpdate(reqId, newDeposit, {useFindAndModify: false})
                .then(data => {
                    res.send({
                        message: `successfully deposited ${quantity} coins of ${type} cents to user ${reqId}`
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message: `error updating deposit for user ${reqId}\n${err}`
                    });
                });
            } else {
                res.status(500).send({
                    message: `no user by id ${reqId}`
                });
            }
        })();
    }
}

exports.resetDeposit = (req, res) => {
    let reqId = req.params.id;
    let resetDeposit = { deposit: 0 };
    UserModel.findByIdAndUpdate(reqId, resetDeposit, {useFindAndModify: false})
    .then(data => {
        if (data) {
            res.send({
                message: `successfully reset deposit of user ${reqId}`
            });
        } else {
            res.status(404).send({
                message: `could not reset deposit of user ${reqId}. perhaps not found`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: `error resetting deposit for user ${reqId}:\n${err.message}`
        });
    });
}

exports.buy = (req, res) => {
    
}
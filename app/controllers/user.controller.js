const db = require("../config/db.config.js");
const UserModel = db.userModel;

const functions = require("./functions.js");

exports.signUp = async (req, res) => {
    let dataBody = req.body;
    let newUser = UserModel({
        username: req.body.username,
        password: req.body.password,
        seller:   dataBody.seller,
        deposit:  0
    });
    if ( ! ( await newUser.hashPassword(res) ) ) { return; }

    await newUser.save(newUser)
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

exports.deposit = async (req, res) => {
    let user = await functions.authUser(req.body.auth, false, res);
    if (!user) { return; }

    let dataBody = req.body.data;
    if ( ! functions.dataBodyOk(dataBody, res) ) { return; }

    let type = dataBody.type;
    let quantity = dataBody.quantity;
    if ( type && ! ( [2, 5, 10, 20, 50, 100].includes(type) ) ) {
        res.status(400).send({ 
            message: "please specify a valid coin type: 2, 5, 10, 20, 50, or 100" 
        });
        return;
    } else if ( quantity && quantity < 0 ) {
        res.status(400).send({ 
            message: "quantity cannot be less than 0" 
        });
        return;
    }

    let userId = user._id;
    let newDeposit = { deposit: user.deposit + type * quantity };
    await UserModel.findByIdAndUpdate(userId, newDeposit, {useFindAndModify: false})
    .then(_ => {
        res.send({
            message: `successfully deposited ${quantity} coins of ${type} cents to user ${userId}`
        });
    })
    .catch(err => {
        res.status(500).send({
            message: `error updating deposit for user ${userId}\n${err}`
        });
    });
}

exports.resetDeposit = async (req, res) => {
    let user = await functions.authUser(req.body.auth, false, res);
    if (!user) { return; }

    let userId = user._id;
    let resetDeposit = { deposit: 0 };
    await UserModel.findByIdAndUpdate(userId, resetDeposit, {useFindAndModify: false})
    .then(_ => {
        res.send({
            message: `successfully reset deposit of user ${userId}`
        });
    })
    .catch(err => {
        res.status(500).send({
            message: `error resetting deposit for user ${userId}:\n${err.message}`
        });
    });
}

exports.buy = async (req, res) => {
    let user = await functions.authUser(req.body.auth, false, res);
    if (!user) { return; }

    let productId = req.params.id;
    let productToBuy = await functions.findProductById(productId, res);
    if (!productToBuy) { return; }

    let productCost = productToBuy.cost;
    if (productCost > user.deposit) {
        res.status(400).send({
            message: "insufficent funds"
        });
        return;
    }

    if (productToBuy.amountAvailable <= 0) {
        res.send({
            message: "out of stock"
        });
        return;
    }

    //should be a mongoose transaction, so all operations are
    //either fulfilled or aborted

    //transfer funds to seller
    let sellerId = productToBuy.sellerId;
    let seller = await functions.findUserById(sellerId, res);
    seller.deposit += productCost;
    await seller.save(seller);

    //update product supply
    productToBuy.amountAvailable -= 1;
    await productToBuy.save(productToBuy);

    //update buyer deposit
    let change = user.deposit - productCost;
    user.deposit = change;
    await user.save(user);

    res.send({
        message:`successfully bought ${productToBuy.productName} for ${productCost} cents` + 
        `\nchange: ${functions.coinVal(change)}`
    });
}
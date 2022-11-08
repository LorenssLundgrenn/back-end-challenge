module.exports = app => {
    const userController = require("../controllers/user.controller.js");
    var router = require("express").Router();

    router.post("/", userController.signUp);
    router.put("/deposit/:id", userController.deposit);
    router.put("/reset/:id", userController.resetDeposit);
    router.post("/buy/:id", userController.buy);

    app.use("/api/users", router); //link router to main express object
}   
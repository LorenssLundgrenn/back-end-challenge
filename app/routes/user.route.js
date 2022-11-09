module.exports = app => {
    const userController = require("../controllers/user.controller.js");
    var router = require("express").Router();

    router.post("/", userController.signUp);
    router.put("/deposit", userController.deposit);
    router.post("/reset", userController.resetDeposit);
    router.post("/buy/:id", userController.buy);

    app.use("/api/users", router); //link router to main express object
}   
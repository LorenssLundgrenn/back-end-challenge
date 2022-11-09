const mongoose = require("../config/db.config.js").mongoose;
const bcrypt = require("bcrypt")

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    seller:   { type: Boolean, required: true },
    deposit:  Number
},
{
    timestamps: true
});

userSchema.methods.authenticate = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.hashPassword = async function (res) {
    await bcrypt.genSalt(10)
    .then(async salt => {
        await bcrypt.hash(this.password, salt)
        .then(hash => {
            this.password = hash;
        })
        .catch(err => {
            res.status(400).send({
                message: `hashing error, validate your password field:\n${err}`
            });
            return;
        });
    })
    .catch(err => {
        res.status(500).send({
            message: `error occured when generating salt:\n${err}`
        });
        return;
    });

    return !res.headersSent; //sent headers indicates an error
}

module.exports = mongoose.model("user", userSchema);
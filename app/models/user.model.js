const mongoose = require("../config/db.config.js").mongoose;

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    seller:   { type: Boolean, required: true },
    deposit:  Number
},
{
    timestamps: true
});

module.exports = mongoose.model("user", userSchema);
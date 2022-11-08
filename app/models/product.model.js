const mongoose = require("../config/db.config.js").mongoose;

const productSchema = mongoose.Schema({
    sellerId:        { required: true, type: String },
    cost:            { required: true, type: Number },
    productName:     { required: true, type: String },
    amountAvailable: { required: true, type: Number }
},
{
    timestamps: true
});

module.exports = mongoose.model("product", productSchema);
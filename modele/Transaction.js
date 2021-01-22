const mongoose = require("mongoose");
const User = require("./User");

const TransactionSchema = mongoose.Schema({
    title: String,
    amount: Number,
    user: User.schema
});

module.exports={
    schema:TransactionSchema,
    model:mongoose.model("Transaction", TransactionSchema)
}
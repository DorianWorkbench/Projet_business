const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name:String,
    surname:String
});

module.exports = {
    schema:UserSchema,
    model:mongoose.model("User", UserSchema)
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { urlencoded } = require("express");

mongoose.connect('mongodb://admin:test@localhost:27017/projet-business?authSource=admin', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

app.use(require("./routes/groupeRoutes"));

app.use(require("./routes/userRoutes"));

app.listen(3000, ()=>{
    console.log("Server On");
})
const express = require("express");
const User = require("../modele/User");
var router = express.Router();


router.route("/userRoutes/addUser")
    .post((req,res)=>{
        
        const user = new User.model();
            user.name = req.body.user.name;
            user.surname = req.body.user.surname;
        user.save((err, user)=>{
            if(err)
                return res.json({success:false, err:err});
            return res.json({success:true, user:user});
        });
    })

module.exports = router;
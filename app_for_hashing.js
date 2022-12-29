// 2

//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");

// For md5(hashing) ->
// const md5 = require('md5');

// For bcrypt ->
const bcrypt = require('bcrypt');
const saltrounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// secret -> key
// const secret = "ThisisourlittleSecret.";

// <-- For mongoose encryption -->
// Encrypt the password field from userSchema structure.
// secret (changed to) process.env.SECRET so that we can connect to .env file and
// use variable named SECRET in that file.
// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

// This request is made after register.ejs presses submit button.
// Secret page (route) can be accessed only if user is registered and 
// logged in.
app.post("/register",function(req,res){

    // For md5

    // const newUser = new User({
    //     email: req.body.username,

    //     // Changed line -> 

    //     password: md5(req.body.password)
    // });

    // newUser.save(function(err){
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         res.render("secrets");
    //     }
    // });

    // for bcrypt -> 
    bcrypt.hash(req.body.password, saltrounds, function(err,hash){
        const newUser = new User({
            email: req.body.username,
    
            // Changed line -> 
    
            password: hash
        });
    
        newUser.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                res.render("secrets");
            }
        });
    });
});

// At this point when it need password from structure then it will first
// decrypt it and then use it. 
app.post("/login",function(req,res){
    const username = req.body.username;

    // Changed line -> 

    // const password = md5(req.body.password);
    
    const password = req.body.password;

    // email is in our database, while username comes from req from login.ejs
    // This function checks that if username is in our database and also
    // if the password entered is same to that in our database, if both the
    // conditions are correct -> then render the secrets.ejs.
    User.findOne({email: username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            // for md5
            // if(foundUser){
            //     if(foundUser.password === password){
            //         res.render("secrets");
            //     }
            // }

            // for bcrypt
            if(foundUser){
                bcrypt.compare(password,foundUser.password,function(err,result){
                    if(result === true){
                        res.render("secrets");
                    }
                });
            }
        }
    })

});






app.listen(3000,function(){
    console.log("Server started at port 3000");
});
// 1

//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB");


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// secret -> key
// const secret = "ThisisourlittleSecret.";

// Encrypt the password field from userSchema structure.
// secret (changed to) process.env.SECRET so that we can connect to .env file and
// use variable named SECRET in that file.
userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"] });

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
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
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

// At this point when it need password from structure then it will first
// decrypt it and then use it. 
app.post("/login",function(req,res){
    const username = req.body.username;
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
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    })

});






app.listen(3000,function(){
    console.log("Server started at port 3000");
});
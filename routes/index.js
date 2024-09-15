var express = require('express');
var router = express.Router();
const usermodel = require('../models/usermodel');
const PostCollection = require("../models/post.schema");

router.get("/", async (req, res) => {
  try {
    const posts = await PostCollection.find()

      res.render("index", {
        title: "Homepage | SocialMedia",
        user: req.user,
        // posts: posts,
      });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.get('/register', function (req, res, next) {
  res.render('register', { title: "register | SocialMedia10", user: req.user });

});

router.get('/contact', function (req, res, next) {
  res.render('contact', { title: "my contact | SocialMedia10", user: req.user });

});


router.get('/createpost', function (req, res, next) {
  res.render('createpost', { title: "post | SocialMedia10", user: req.user });

});

router.get('/login', function (req, res, next) {
  res.render('login', { title: "login | SocialMedia10", user: req.user });
});

router.get("/forget-email", (req, res) => {
  res.render("forgetemail", {
    title: "Forgot Password  | SocialMedia10",
    user: req.user,
  });
});

router.get("/verify-otp/:id", (req, res) => {
  res.render("forgetOTP", {
    title: "Verify OTP  | SocialMedia",
    user: req.user,
    id: req.params.id,
  });
});

module.exports = router;

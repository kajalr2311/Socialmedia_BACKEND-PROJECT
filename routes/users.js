var express = require('express');
const passport = require('passport');

var router = express.Router();
const usermodel = require('../models/usermodel')
const localstrategy = require("passport-local");
const { isLoggedIn } = require("../middleware/auth");
const { sendMail } = require("../utils/sendmail");
const imagekit = require("../utils/imagekit");
const PostCollection = require("../models/post.schema");
const postSchema = require('../models/post.schema');


passport.use(new localstrategy(usermodel.authenticate()));

/* GET users listing. */

router.post("/register", async function (req, res, next) {
  const newUser = new usermodel({
    username: req.body.username,
    email: req.body.email
  })
  usermodel.register(newUser, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/login")
    })
  }).catch((err) => {
    console.log(err.message);
  })
})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/users/profile",
  failureRedirect: "/login",
}),
  (req, res, next) => { }
);

router.get("/profile", isLoggedIn, async (req, res, next) => {
  try {
    const posts = await PostCollection.find()
    console.log(posts);
    res.render("profile", {
      title: "Profile | Socialmedia10",
      user: req.user,
      posts
    });
  } catch (error) {
    console.log(error);
    res.send(error.message)
  }
})

router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(function (err) {
    if (err) return console.log(err);
  })
  res.redirect("/login")
})

router.post("/send-mail", async (req, res, next) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (!user)
      return res.send(
        "No user found with this email. <a href='/forget-email'>Try Again</a>"
      );

    await sendMail(req, res, user);
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.post("/verify-otp/:id", async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.params.id);
    if (!user) return res.send("No user found.");

    if (this.toString(user.otp) !== this.toString(req.body.otp)) {
      user.otp = 0;
      await user.save();
      return res.send(
        "Invalid OTP. <a href='/forget-email'>Try Again</a>"
      );
    }
    user.otp = 0;
    await user.setPassword(req.body.password);
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.get("/settings", isLoggedIn, async (req, res, next) => {
  try {
    const posts = await PostCollection.find()
    console.log(posts);
    const userAndPosts = await req.user.populate("posts");
    res.render("Settings", {
      title: "Settings | Socialmedia10",
      user: userAndPosts,
      // posts
    });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.post("/avatar/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { fileId, url, thumbnailUrl } = await imagekit.upload({
      file: req.files.avatar.data,
      fileName: req.files.avatar.name,
    });

    if (req.user.avatar.fileId) {
      await imagekit.deleteFile(req.user.avatar.fileId);
    }
    req.user.avatar = { fileId, url, thumbnailUrl };
    await req.user.save();

    res.redirect("/users/settings");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});


router.get("/delete/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await usermodel.findByIdAndDelete(req.params.id);
    await imagekit.deleteFile(user.avatar.fileId);

    await user.posts.forEach(async (post) => {
      const deletedPost = await PostCollection.findByIdAndDelete(post);
      await imagekit.deleteFile(deletedPost.media.fileId);
    });

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.post("/update/:id", isLoggedIn, async (req, res, next) => {
  try {
    await usermodel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/users/settings");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});


router.get("/reset-password/:id", isLoggedIn, (req, res, next) => {
  res.render("reset", { title: "reset-password | SocialMedia10", user: req.user });
});

router.post("/reset-password/:id", isLoggedIn, async (req, res, next) => {
  try {
    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword
    );
    await req.user.save();
    res.redirect("/users/settings");
  } catch (error) {
    res.send(error, message);
    console.log("error");
  }
});

router.post("/createpost", isLoggedIn, async (req, res, next) => {
  // console.log(req.body);
  const newPost = new PostCollection({
    title: req.body.title,
    description: req.body.description,
    blogImg: req.body.blogImg,
    createdBy: req.user._id

  })
  await newPost.save()
  req.user.posts.push(newPost._id)
  await req.user.save()
  res.redirect("/users/profile")
})


module.exports = router;

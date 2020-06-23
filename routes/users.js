var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const LocalSttrategy = require("passport-local").Strategy;
const User = require("../models/user");
const multer = require("multer");
const { ensureIndexes } = require("../models/user");
const upload = multer({
  dest: "./uploads",
});

/* GET users listing. */
router.get("/", ensureAuthenticated, function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", function (req, res, next) {
  res.render("register", {
    title: "Register",
  });
});
router.post("/register", upload.single("profileimage"), function (
  req,
  res,
  next
) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var passwors2 = req.body.password2;

  if (req.file) {
    var profileimage = req.file.path;
    console.log(profileimage);
  } else {
    var profileimage = "noimage.jpg";
  }

  //  form Varlidate
  req.checkBody("name", "Name field is required").notEmpty();
  req.checkBody("email", "Email field is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("username", "Username field is required").notEmpty();
  req.checkBody("password", "Password field is required").notEmpty();
  req.checkBody("password2", "Password do not match").equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors,
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage,
    });
    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });
    req.flash("success", "you are now registered and can login");
    res.location("/");
    res.redirect("/");
  }
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    title: "Login",
  });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "invalid username or password",
  }),
  function (req, res) {
    req.flash("success", " you are now login");
    res.redirect("/");
  }
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalSttrategy(function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, { message: "Unknow User" });
      }
      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) return done(err);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "invalid password" });
        }
      });
    });
  })
);

router.get("/logout", function (req, res, next) {
  req.logout();
  req.flash("success", "You are now logout");
  res.redirect("/users/login");
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}
module.exports = router;

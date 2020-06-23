const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalSttrategy = require("passport-local").Strategy;
const multer = require("multer");
const flash = require("connect-flash");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const expressValidator = require("express-validator");
const db = mongoose.connection;
const upload = multer({
  dest: "./uploads",
});

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const { validationResult } = require("express-validator");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// file upload
// app.use(multer({
// dest: "upload/"
// }));

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// handle session
app.use(
  session({
    secret: "my mum is the best cook in the world",
    saveUninitialized: true,
    resave: true,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// validatetor
// app.use(expressValidator(middlewareOptions));

app.use(
  expressValidator({
    errorfarmatter: function (param, msg, value) {
      const namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam + -"[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

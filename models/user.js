const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
mongoose.connect("mongodb://127.0.0.1/nodeauth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;
var userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  profileimage: {
    type: String,
  },
});
var User = (module.exports = mongoose.model("User", userSchema));
module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};
module.exports.getUserByUsername = function (username, callback) {
  var query = { username: username };
  User.findOne(query, callback);
};
module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    callback(null, isMatch);
  });
};
module.exports.createUser = function (newUser, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      if (err) console.error(e);
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

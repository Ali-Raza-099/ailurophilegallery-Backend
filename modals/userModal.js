const mongoose = require("mongoose");
const joi = require("joi");
var bcrypt = require("bcryptjs");
const { min } = require("lodash");

const userDetails = new mongoose.Schema({
  firstname: String,
  lastname: String,
  address: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },
});

userDetails.methods.generateHashedPassword = async function () {
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

let userModal = mongoose.model("User", userDetails);

function validateUserDetails(data) {
  const schema = joi.object({
    firstname: joi.string().max(20).required(),
    lastname: joi.string().max(20).required(),
    address: joi.string().min(10).max(20).required(),
    email: joi.string().email().max(20).required(),
    password: joi.string().min(8).max(20).required(),
    role: joi.string(),
  });
  return schema.validate(data, { abortEarly: false });
}
function validateUserLogin(data) {
  const schema = joi.object({
    email: joi.string().email().max(20).required(),
    password: joi.string().max(20).required(),
  });
  return schema.validate(data, { abortEarly: false });
}

module.exports.User = userModal;
module.exports.validateUserDetails = validateUserDetails;
module.exports.validateUserLogin = validateUserLogin;

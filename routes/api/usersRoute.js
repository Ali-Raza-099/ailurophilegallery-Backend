var express = require("express");
var bcrypt = require("bcryptjs");
var router = express.Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
var { User } = require("../../modals/userModal");
const validateRegister = require("../../middlewares/validateRegister");
const validateLogin = require("../../middlewares/validateLogin");

router.post("/register", validateRegister, async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send("User with given Email already exist");
    user = new User();
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.address = req.body.address;
    user.email = req.body.email;
    user.password = req.body.password;
    if (req.body.role != null) {
      user.role = req.body.role;
    }
    await user.generateHashedPassword();
    await user.save();
    let token = jwt.sign(
      { _id: user._id, firstname: user.firstname, role: user.role },
      config.get("jwtKey")
    );
    let dataToReturn = {
      firstname: user.firstname,
      email: user.email,
      token: user.token,
    };

    return res.send(dataToReturn);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid Email");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtKey")
  );
  res.send(token);
});
module.exports = router;

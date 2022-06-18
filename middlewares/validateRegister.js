const { validateUserDetails } = require("../modals/userModal");

function validateRegister(req, res, next) {
  let { error } = validateUserDetails(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
}
module.exports = validateRegister;

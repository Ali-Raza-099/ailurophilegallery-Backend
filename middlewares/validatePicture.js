const { validatePictureDetails } = require("../modals/pictureModal");
var fs = require("fs");

function validatePicture(req, res, next) {
  let { error } = validatePictureDetails(req.body);
  if (error) {
    if (req.file != null) {
      let filePath = req.file.path;
      fs.unlinkSync(filePath); //delete image from server folder
    }
    return res.status(400).send(error.details[0].message);
  }
  next();
}

module.exports = validatePicture;

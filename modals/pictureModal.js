const mongoose = require("mongoose");
const joi = require("joi");

const pictureDetails = new mongoose.Schema({
  Title: String,
  Price: Number,
  image: String,
  imagePath: String,
});

let pictureModal = mongoose.model("Picture", pictureDetails);

function validatePictureDetails(data) {
  const schema = joi.object({
    Title: joi.string().min(3).max(40).required(),
    Price: joi.number().min(0).required(),
  });
  return schema.validate(data, { abortEarly: false });
}

module.exports.Picture = pictureModal;
module.exports.validatePictureDetails = validatePictureDetails;

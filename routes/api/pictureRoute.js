const express = require("express");
const multer = require("multer");
var fs = require("fs");
const stripe = require("stripe")(
  "sk_test_51L7MuHJF4hqINAnaSqsRRAlPFNlwo14zlIuu8yYTU2lseN4kJSK93Ehk4OFv47tSHPwl18XmeN9giQN6iTZCyMmv00ylx24w9x"
);
var maxSize = 2097152;

const router = express.Router();

const { Picture } = require("../../modals/pictureModal");
const validatePicture = require("../../middlewares/validatePicture");
const auth = require("../../middlewares/auth");
const { admin } = require("../../middlewares/admin");

//storage
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const error =
      file.mimetype === "image/jpeg" || file.mimetype === "image/png"
        ? null
        : new Error("Please, Select file with Jpeg or png format");
    cb(error, "././public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: Storage,
  limits: { fileSize: maxSize },
}).single("image");

router.get("/", async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 8);
    let skipRecords = perPage * (page - 1);
    let pictures = await Picture.find().skip(skipRecords).limit(perPage);
    let totalRecords = await Picture.countDocuments();
    return res.send({ totalRecords, pictures });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);
    if (!picture) {
      return res
        .status(404)
        .send("The Picture with the given ID was not found");
    }
    res.send(picture);
  } catch (err) {
    res.send("Error: " + err);
  }
});

router.post("/", auth, admin, upload, validatePicture, async (req, res) => {
  const picture = new Picture({
    Title: req.body.Title,
    Price: req.body.Price,
    image: req.file.filename,
    imagePath: req.file.path,
  });
  try {
    await picture.save();
    res.send(picture);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.put("/:id", auth, admin, upload, validatePicture, async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);

    picture.Title = req.body.Title;
    picture.Price = req.body.Price;
    if (req.file != null) {
      let filePath = picture.imagePath;
      fs.unlinkSync(filePath); //delete existing image from server folder
      picture.image = req.file.filename;
      picture.imagePath = req.file.path;
    }
    picture.save();
    res.send(picture);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);
    if (!picture) {
      return res
        .status(404)
        .send("The Picture with the given ID was not found");
    }
    let filePath = picture.imagePath;
    fs.unlinkSync(filePath); //delete image from server folder
    picture.remove();
    res.send(picture);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.post("/payment", auth, (req, res) => {
  const totalamount = req.body.totalamount;
  const token = req.body.token;
  stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create({
        amount: totalamount * 100,
        currency: "Pkr",
        customer: customer.id,
        receipt_email: token.email,
      });
    })
    .then(() => res.status(200).send("Transaction Successfull"))
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});
module.exports = router;
  
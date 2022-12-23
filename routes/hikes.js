// Express
const express = require("express");
const router = express.Router();

// Utilities
const catchAsync = require("../utilities/catchAsync");

// Models
const Hike = require("../models/hike");

// Controllers
const hikes = require("../controllers/hikes");

// Middleware
const { isLoggedIn } = require("../middleware"); // middleware to check if logged in
const { isAuthor } = require("../middleware"); // middleware to check if authorized
const { validateHike } = require("../middleware"); // middleware for JOI validation
const multer = require('multer'); // middleware for handling multipart/form-data to upload files(images for example)
const { storage } = require("../cloudinary"); // requiring the CloudinaryStorage - variable "storage"
const upload = multer({ storage }) // executing the multer middleware

//---------------------------------------------------------------------------------------

// ROUTES:

// --FORM PAGE FOR NEW HIKE-- IMPORTANT: order matters, this router.get has to be before the router.get for :id, otherwise it's treating "new" as an ID
router.get("/new", isLoggedIn, hikes.renderNewForm);

// --CREATE NEW HIKE-- 
router.post("/", isLoggedIn, upload.array("image"), validateHike, catchAsync(hikes.createHike));

// --RENDER SHOW PAGE FOR A HIKE
router.get("/:id", catchAsync(hikes.showHike));

// --RENDER PAGE TO EDIT A HIKE
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(hikes.renderEditForm));

// --EDIT/UPDATE A HIKE
router.put("/:id", isLoggedIn, isAuthor, upload.array("image"), validateHike, catchAsync(hikes.updateHike));

// --DELETE A HIKE
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(hikes.deleteHike));

module.exports = router;
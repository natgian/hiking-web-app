// Express
const express = require("express");
const router = express.Router({ mergeParams: true });

// Models
const User = require("../models/user");

// Utilities
const catchAsync = require("../utilities/catchAsync");
const passport = require("passport");

// Controllers
const users = require("../controllers/users");

// Middleware
const { checkReturnTo } = require("../middleware");
const { isLoggedIn } = require("../middleware"); // middleware to check if logged in
const multer = require('multer'); // middleware for handling multipart/form-data to upload files(images for example)
const { storage } = require("../cloudinary"); // requiring the CloudinaryStorage - variable "storage"
const upload = multer({ storage }) // executing the multer middleware


//---------------------------------------------------------------------------------------

// ROUTES:

// RENDER SIGN UP PAGE
router.get("/register", users.renderRegister);

// REGISTER/SIGN UP A NEW USER
router.post("/register", catchAsync(users.registerUser));

// RENDER LOGIN PAGE
router.get("/login", users.renderLogin);

// LOGIN
router.post("/login", checkReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", failureMessage: true, keepSessionInfo: true }), users.login);
// "local" here stand for "local Strategy" (siehe Passport docs)

// LOGOUT
router.get("/logout", users.logout);

// RENDER FORGOT PASSWORD PAGE
router.get("/forgot-password", users.renderForgotPassword);

// -- SEND RESET PASSWORD EMAIL TO USER
router.post("/forgot-password", catchAsync(users.sendResetPasswordEmail));

// -- RENDER SENT MAIL PAGE
router.get("/email-sent", users.renderSentMailConfirmation);

// RENDER RESET PASSWORD PAGE
router.get("/reset/:token", catchAsync(users.renderResetPassword));

// RESET PASSWORD
router.post("/reset/:token", catchAsync(users.resetPassword));

// RENDER USER PROFILE PAGE
router.get("/users/:id", catchAsync(users.profilePage));

// RENDER MYPROFILE PAGE
router.get("/myprofile", isLoggedIn, catchAsync(users.currentUserPage));


module.exports = router;


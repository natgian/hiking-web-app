// Models
const User = require("../models/user");
const Hike = require("../models/hike");
const Bookmark = require("../models/bookmark");
const { userEmailSchema } = require("../schemas");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Middleware
const { isLoggedIn } = require("../middleware");

// --RENDER SIGN UP PAGE
module.exports.renderRegister = (req, res) => {
  res.render("users/register", { title: "Sign Up | Switzerland Explored", page_name: "register" });
};

// REGISTER NEW USER
module.exports.registerUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password); // hashes the password of the new user
    req.login(registeredUser, err => { // logging in the user automatically after he has signed up
      if (err) return next(err);
      req.flash("success", "Welcome to Switzerland Explored!");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

// --RENDER LOGIN PAGE
module.exports.renderLogin = (req, res) => {
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  res.render("users/login", { title: "Login | Switzerland Explored", page_name: "login" });
};

// --LOGIN
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back " + req.body.username + "!");
  const redirectUrl = req.session.returnTo || '/';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// --LOGOUT
module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have successfully logged out.");
    res.redirect("/");
  });
};

// --RENDER FORGOT PASSWORD PAGE
module.exports.renderForgotPassword = (req, res) => {
  res.render("users/forgotPassword");
};

// -- RENDER SENT MAIL CONFIRMATION PAGE
module.exports.renderSentMailConfirmation = (req, res) => {
  res.render("users/sentMailConfirmation");
};

// -- SEND RESET PASSWORD MAIL TO USER
module.exports.sendResetPasswordEmail = async (req, res, next) => {
  const { error } = userEmailSchema.validate(req.body); // Validate the email input
  if (error) {
    req.flash("error", "Please enter a valid email address..");
    return res.redirect("/forgot-password");
    // return res.render("pages/error", { err: error.details[0].message });
  };

  const user = await User.findOne({ email: req.body.email }); // Find the user by email
  if (!user) {
    req.flash("error", "No user found with this email.");
    return res.redirect("/forgot-password");
  }

  const resetToken = crypto.randomBytes(32).toString("hex"); // Generate a reset token
  user.resetPasswordToken = resetToken; // Set the reset token in the user's document
  user.resetPasswordExpires = Date.now() + 3600000; // Set the expiration date in the user's document
  await user.save();

  const transporter = nodemailer.createTransport({
    host: "mail.infomaniak.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PW
    }
  });

  const mailOptions = {
    from: "info@natgian.com",
    to: user.email,
    subject: "SwitzerlandExplored - Reset password",
    text: `You are receiving this message because a password reset has been requested for your account on SwitzerlandExplored.\n\n` +
      `Please click on the following link or paste it into your browser to complete the process:\n\n` +
      `http://${req.headers.host}/reset/${resetToken}\n\n` +
      `If you have not requested this, please ignore this email and your password will remain unchanged.\n`
  };

  await transporter.sendMail(mailOptions);

  res.redirect("/email-sent");
};

// --RENDER RESET PASSWORD PAGE
module.exports.renderResetPassword = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    req.flash("error", "Link is invalid or expired.");
    return res.redirect("/forgot-password");
  };

  res.render("users/resetPassword", { token: req.params.token });
};

// -- RESET THE PASSWORD
module.exports.resetPassword = async (req, res, next) => {
  // check if token is maching the user and is still valid
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec();

  if (!user) {
    req.flash("error", "Link is invalid or expired.");
    return res.redirect("/forgot-password");
  };
  // Ensure the new password and the confirmation match
  if (req.body.password !== req.body.confirmpassword) {
    req.flash("error", "Passwords do not match. Please try again.");
    return res.redirect(`/reset/${req.params.token}`);
  };
  // Use the setPassword method from passport-local-mongoose to hash new password
  user.setPassword(req.body.password, async (err) => {
    if (err) {
      req.flash("error", "An error has occurred. Please try again.");
      return res.render("resetPassword", { token: req.params.token });
    }
    // Clear the resetPasswordToken and resetPasswordExpires
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the user
    await user.save();

    // Log in the user
    req.logIn(user, (err) => {
      if (err) {
        req.flash("error", "An error has occurred. Please try again.");
        return res.redirect(`/reset/${req.params.token}`);
      }

      // Redirect to the user's profile or any desired location
      req.flash("success", "Your password has been successfully reset.");
      return res.redirect("/");
    });
  });
};

// --RENDER AUTHOR PROFILE PAGE
module.exports.profilePage = async (req, res) => {
  const foundUser = await User.findById(req.params.id);
  const hikes = await Hike.find().where("author").equals(foundUser._id);

  if (!foundUser) {
    req.flash("error", "User not found.");
    return res.redirect("/");
  };

  // Ensure that each hike.images is an array with at least one element
  hikes.forEach((hike) => {
    hike.images = hike.images && hike.images.length > 0 ? hike.images : [{ url: '/images/no-image.svg', filename: 'no-image' }];
  });

  res.render("users/profile", { user: foundUser, hikes: hikes, title: "Profile | Switzerland Explored", page_name: "profile" });
};

// --RENDER LOGGED IN USER PROFILE PAGE
module.exports.currentUserPage = async (req, res) => {
  // Render user's profile page
  User.findById(req.user.id, async function (err, currentUser) {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    };

    const hikes = await Hike.find().where("author").equals(currentUser._id).exec();

    // Ensure that each hike.images is an array with at least one element
    hikes.forEach((hike) => {
      hike.images = hike.images && hike.images.length > 0 ? hike.images : [{ url: '/images/no-image.svg', filename: 'no-image' }];
    });

    const bookmarks = await Bookmark.find().where("user").equals(currentUser._id).exec();

    res.render("users/myprofile", { user: currentUser, hikes: hikes, bookmarks: bookmarks, title: "My Profile | Switzerland Explored", page_name: "myprofile" });
  });
};

// --RENDER CHANGE PASSWORD PAGE
module.exports.renderChangePassword = (req, res) => {
  res.render("users/changePassword");
};

// -- CHANGE PASSWORD
module.exports.changePassword = async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    req.flash("error", "User not found.");
    return res.redirect("/");
  };

  const foundUser = await User.findById(userId);

  if (!foundUser) {
    req.flash("error", "User not found.");
    return res.redirect("/");
  };

  foundUser.authenticate(req.body.currentPassword, async (err, valid) => {
    if (err || !valid) {
      req.flash("error", "The current password is not correct.");
      return res.redirect("/myprofile");
    };

    foundUser.setPassword(req.body.newPassword, async () => {
      await foundUser.save();
      req.flash("success", "Password has been successfully changed.");
       res.redirect("/myprofile");
    });  
  });
};



// Models
const User = require("../models/user");
const Hike = require("../models/hike");
const Bookmark = require("../models/bookmark");

// Middleware
const {isLoggedIn } = require("../middleware");

// --RENDER SIGN UP PAGE
module.exports.renderRegister = (req, res) => {
  res.render("users/register", {title: "Sign Up | Switzerland Explored", page_name: "register"});
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
  res.render("users/login", {title: "Login | Switzerland Explored", page_name: "login"});
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

// --RENDER AUTHOR PROFILE PAGE
module.exports.profilePage = (req, res) => {
  User.findById(req.params.id, function (err, foundUser) {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Hike.find().where("author").equals(foundUser._id).exec(function (err, hikes) {
      if (err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/profile", { user: foundUser, hikes: hikes, title: "Profile | Switzerland Explored", page_name: "profile" });
    })
  });
};

// --RENDER CURRENT USER PROFILE PAGE
module.exports.currentUserPage = (req, res) => {
  User.findById(req.user.id, function(err, currentUser) {
  if (err) {
    req.flash("error", "Something went wrong.");
    return res.redirect("/");
  }
  Hike.find().where("author").equals(currentUser._id).exec(function (err, hikes) {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
  Bookmark.find().where("user").equals(currentUser._id).exec(function (err, bookmarks) {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
  res.render("users/myprofile", { user: currentUser, hikes: hikes, bookmarks: bookmarks, title: "My Profile | Switzerland Explored", page_name: "myprofile" });
})
})
})
};



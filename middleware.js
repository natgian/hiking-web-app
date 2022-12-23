const { hikeSchema } = require("./schemas");
const { reviewSchema } = require("./schemas.js");
const ExpressError = require("./utilities/ExpressError");
const Hike = require("./models/hike");
const Review = require("./models/review");
const Bookmark = require("./models/bookmark");

// middleware to check if logged in:
module.exports.isLoggedIn = (req, res, next) => {
  // console.log("REQ.USER...", req.user);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // storing in the session the URL the user wanted to go to before login
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// middleware for JOI validation:
module.exports.validateHike = (req, res, next) => {
  // JOI validation schema for backend validation on the server side
  const { error } = hikeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",")
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// middleware to authorize user to edit/delete etc.:
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const hike = await Hike.findById(id);
  if (hike.author.equals(req.user._id) || req.user.isAdmin) {
    next();
  } else {
    req.flash("error", "Your are not authorized to do that.");
    return res.redirect(`/hikes/${id}`);
}};


// middleware to validate reviews
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",")
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// middleware to check if the user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (review.author.equals(req.user._id) || req.user.isAdmin) {
next();
  } else {
  req.flash("error", "Your are not authorized to do that.");
  return res.redirect(`/hikes/${id}`);
}};

// middleware to check returnTo
module.exports.checkReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};


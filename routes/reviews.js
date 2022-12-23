// Express
const express = require("express");
const router = express.Router({ mergeParams: true });

// Utilities
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");

// Models
const Hike = require("../models/hike");
const Review = require("../models/review");

// Controllers
const reviews = require("../controllers/reviews");

// Middleware
const { validateReview } = require("../middleware");
const { isLoggedIn } = require("../middleware");
const { isReviewAuthor } = require("../middleware");


//---------------------------------------------------------------------------------------

// ROUTES:

// CREATE A REVIEW
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE A REVIEW
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
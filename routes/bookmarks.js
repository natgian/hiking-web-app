// Express
const express = require("express");
const router = express.Router({ mergeParams: true });

// Utilities
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");

// Models
const Hike = require("../models/hike");
const Bookmark = require("../models/bookmark");

// Controllers
const bookmarks = require("../controllers/bookmarks");

// Middleware
const { isLoggedIn } = require("../middleware");


//---------------------------------------------------------------------------------------

// ROUTES:

// CREATE A BOOKMARK
router.post("/", isLoggedIn, catchAsync(bookmarks.addBookmark));

// DELETE A BOOKMARK
router.delete("/:bookmarkId", isLoggedIn, catchAsync(bookmarks.deleteBookmark));


module.exports = router;
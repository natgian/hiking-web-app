// Models
const Hike = require("../models/hike");
const Review = require("../models/review");

// --CREATE A NEW REVIEW
module.exports.createReview = async (req, res) => {
  const hike = await Hike.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  hike.reviews.push(review);
  await hike.save();
  await review.save();
  req.flash("success", "Your review has been posted!");
  res.redirect(`/hikes/${hike._id}`);
};

// -- DELETE A REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Hike.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/hikes/${id}`);
};
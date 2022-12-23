// Models
const Hike = require("../models/hike");
const User = require("../models/user");
const Bookmark = require("../models/bookmark");

// -- CREATE A BOOKMARK 
module.exports.addBookmark = async (req, res) => {
  const user = await User.findById(req.user.id);
  const hike = await Hike.findById(req.params.id);
  const bookmark = new Bookmark({
    title: `${hike.title}`,
    location: `${hike.location}`,
    hikeId: `${hike._id}`,
    user: `${user._id}`,
    bookmarked: true
  });
  await bookmark.save();
  await user.bookmarks.push(hike);
  await user.save();
  req.flash("success", "This trail has been added to your bookmarks!");
  res.redirect(`/hikes/${hike._id}`);
};

// -- REMOVE A BOOKMARK
module.exports.deleteBookmark = async (req, res) => {
  const {bookmarkId} = req.params;
  const bookmark = await Bookmark.findById(bookmarkId);
  const user = await User.findById(req.user.id);
  await User.findByIdAndUpdate(user.id, { $pull: { bookmarks: bookmark.hikeId } });
  await Bookmark.findByIdAndDelete(bookmarkId);
  req.flash("success", "Successfully removed bookmark!");
  res.redirect("/myprofile");
};


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
  title: String,
  location: String,
  hikeId: {
    type: Schema.Types.ObjectId,
    ref: "Hike"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  bookmarked: Boolean
});

module.exports = mongoose.model("Bookmark", bookmarkSchema);
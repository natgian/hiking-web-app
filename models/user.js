const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const { hikeSchema } = require("../schemas");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
 bookmarks: [{
    type: Schema.Types.ObjectId, ref: "Bookmark"
 }]
});
// this line is going to add on to the schema a unsername and it's going to add on a field for password, making sure they are unique and not duplicated. It's also giving some additional methods that you can use:
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);




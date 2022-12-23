const mongoose = require("mongoose");
const { cloudinary } = require("../cloudinary");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
});

// adding the width in the url of the image to create a thumbnail
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});

// this code is needed so the properties virtuals are added in the JSON:
const opts = { toJSON: { virtuals: true } };


const HikeSchema = new Schema({
  title: String,

  images: [ImageSchema],

  geometry: {
    type: {
      type: [String],
      enum: ["Point"], // must be "Point"!
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },

  distance: {
    type: Number
  },

  ascent: {
    type: Number,
    min: 1
  },

  descent: {
    type: Number,
    min: 1
  },

  duration: {
    type: Number
  },

  difficulty: String,

  description: String,

  location: String,

  finish: String,

  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]

}, opts);

//adding a virtual to be able to add properties to connect the dots on the Map on the Campgrounds Index Site
HikeSchema.virtual("properties.popUpMarkup").get(function () {
  return `

  <div class="row">
  
<strong class="mb-2"><a href="/hikes/${this._id}">${this.title}</a></strong>
  <img src="${this.images[0].url}" class"float-start" style="width:50%; height: 50%" crossorigin>
    <div class="col-12 mt-2">
        <p class="card-text">
          <small>${this.location}</small>
          <br>
          <small>&#11108; ${this.distance} km</small>&nbsp;&nbsp;
          <small>&#128337; ${this.duration} h</small>&nbsp;&nbsp;
          <small>&#9650; ${this.ascent} m</small>&nbsp;&nbsp;
          <small><i class="fa-solid fa-person-hiking"></i> ${this.difficulty.substring(0, 2)}</small>
        </p>
    </div>
  </div>`
});

// Mongoose middlweware for deleting all reviews and images associated to a campground that has been deleted
HikeSchema.post("findOneAndDelete", async function (hike) {
  if (hike.reviews) {
    await Review.deleteMany({
      _id: {
        $in: hike.reviews
      }
    });
  }
  if (hike.images) {
    for (let image of hike.images) {
      await cloudinary.uploader.destroy(image.filename);
    }
  }
});

module.exports = mongoose.model("Hike", HikeSchema);

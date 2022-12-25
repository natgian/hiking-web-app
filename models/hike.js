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
          <small><svg xmlns="http://www.w3.org/2000/svg" style="vertical-align: -0.125em;" width="0.75em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 384 512"><path fill="currentColor" d="M288 48c0 26.5-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48s48 21.5 48 48zm-44.7 182.7L224.2 307l49.7 49.7c9 9 14.1 21.2 14.1 33.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32v-82.7l-73.9-73.9c-15.8-15.8-22.2-38.6-16.9-60.3l20.4-84c8.3-34.1 42.7-54.9 76.7-46.4c19 4.8 35.6 16.4 46.4 32.7l28.4 42.6H336v-24c0-13.3 10.7-24 24-24s24 10.7 24 24v304c0 13.3-10.7 24-24 24s-24-10.7-24-24V272h-39.4c-16 0-31-8-39.9-21.4l-13.3-20zM81.1 471.9L117.3 334c3 4.2 6.4 8.2 10.1 11.9l41.9 41.9l-26.4 100.3c-4.5 17.1-22 27.3-39.1 22.8s-27.3-22-22.8-39.1zm55.5-346l-35.2 140.6c-3 12.1-14.9 19.9-27.2 17.9l-47.9-8c-14-2.3-22.9-16.3-19.2-30L31.9 155c9.5-34.8 41.1-59 77.2-59h4.2c15.6 0 27.1 14.7 23.3 29.8z"/></svg> ${this.difficulty.substring(0, 2)}</small>
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

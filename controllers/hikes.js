// Models
const Hike = require("../models/hike");
const { cloudinary } = require("../cloudinary");

// Mapbox - requiring an passing in the token
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

// RENDER INDEX PAGE
module.exports.index = async (req, res) => {
  if (req.query.search) {
    const hikes = await Hike.find(
      {
        "$or": [
          { title: { $regex: req.query.search, $options: "i" } },
          { location: { $regex: req.query.search, $options: "i" } },
          { finish: { $regex: req.query.search, $options: "i" } },
          { difficulty: { $regex: req.query.search, $options: "i" } }
        ]
      }
    );
    res.render("search", { hikes, title: "Explore | Switzerland Explored", page_name: "search" });
  }
  else {
    const hikes = await Hike.find({});
    // Ensure that each hike.images is an array with at least one element
    hikes.forEach((hike) => {
      hike.images = hike.images && hike.images.length > 0
        ? hike.images
        : [{ url: '/images/no-image.svg', filename: 'no-image' }];
    });    
    res.render("index", { hikes, title: "Switzerland Explored", page_name: "index" });
  }
};

// RENDER SEARCH PAGE
module.exports.search = async (req, res) => {
  const hikes = await Hike.find({});
  hikes.forEach((hike) => {
    hike.images = hike.images && hike.images.length > 0
      ? hike.images
      : [{ url: '/images/no-image.svg', filename: 'no-image' }];
  });
  res.render("search", { hikes, title: "Explore | Switzerland Explored", page_name: "search" });
};

// RENDER FORM FOR NEW HIKE
module.exports.renderNewForm = (req, res) => {
  res.render("hikes/new", { title: "Create a trail | Switzerland Explored", page_name: "new", formData: {}, error: null });
};

// CREATE NEW HIKE
module.exports.createHike = async (req, res, next) => {
  // Check if at least one image is uploaded
  if (!req.files || req.files.length === 0) {
    req.flash("error", "At least one image is required.");
    return res.render("hikes/new", { formData: req.body, error: "At least one image is required." });
  };

  const geoData = await geocoder.forwardGeocode({
    query: req.body.hike.location,
    limit: 1
  }).send();

  const hike = new Hike(req.body.hike);

  hike.geometry = geoData.body.features[0].geometry;
  hike.author = req.user._id;
  hike.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

  await hike.save();

  req.flash("success", "Successfully created a new hike!");
  res.redirect(`/hikes/${hike._id}`);
};

// RENDER SHOW PAGE FOR A HIKE
module.exports.showHike = async (req, res) => {
  const hike = await Hike.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  }).populate("author");

  if (!hike) {
    req.flash("error", "Hike not found!");
    return res.redirect("/");
  };

     // Ensure that hike.images is an array with at least one element
     hike.images = hike.images && hike.images.length > 0
     ? hike.images
     : [{ url: '/images/no-image.svg', filename: 'no-image' }];
     
  res.render("hikes/show", { hike, title: "Trail details | Switzerland Explored", page_name: "show" });
};

// RENDER PAGE TO EDIT A HIKE
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const hike = await Hike.findById(id);
  if (!hike) {
    req.flash("error", "Hike not found!");
    return res.redirect("/");
  }
  res.render("hikes/edit", { hike, title: "Edit | Switzerland Explored", page_name: "edit" });
};

// EDIT/UPDATE A HIKE
module.exports.updateHike = async (req, res, next) => {
  const { id } = req.params;

  const geoData = await geocoder.forwardGeocode({
    query: req.body.hike.location,
    limit: 1
  }).send();

  const hike = await Hike.findById(id);

  // Check if new images are uploaded
  const newImages = req.files ? req.files.map(f => ({ url: f.path, filename: f.filename })) : [];

  // Initialize hike.images if it's undefined
  hike.images = hike.images || [];

  // Update the hike document with the new information
  hike.set({ ...req.body.hike });

  // deleting selected images from MongoDB:
  if (req.body.deleteImages) {
    // deleting selected images from Cloudinary:
    console.log("Deleting images:", req.body.deleteImages);
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await hike.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  };

  // If new images are uploaded, push them to the images array
  if (newImages.length > 0) {
    hike.images = [...hike.images, ...newImages];
  };

  // Ensure hike.images is an array with at least one default image
  hike.images = hike.images && hike.images.length > 0 ? hike.images : [{ url: '/images/no-image.svg', filename: 'no-image' }];

  // Set the hike's geometry based on the obtained geoData
  hike.geometry = geoData.body.features[0].geometry;

  hike.save();

  req.flash("success", "Your changes have succesfully been saved.");
  res.redirect(`/hikes/${hike._id}`);
};

// DELETE A HIKE
module.exports.deleteHike = async (req, res) => {
  const { id } = req.params;
  await Hike.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the hike.");
  res.redirect("/");
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



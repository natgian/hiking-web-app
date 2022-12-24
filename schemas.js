const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// SANITIZING HTML WITH JOI - defining an extension on joy.string called escapeHTML:
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!"
  },
  rules: {
    escapeHTML: {
      // needs to have a function called "validate", JOI will call this automatically with whatever the value is that it receives
      validate(value, helpers) {
        //
        const clean = sanitizeHtml(value, {
          // here it's basically saying that nothing is allowed:
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error("string.escapeHTML", { value })
        return clean;
      }
    }
  }
});

// to add extension function, now Joi equals the old version, the base version of Joi, but extended with this new extension. This give now the possibility to use the function "escapeHTML".
const Joi = BaseJoi.extend(extension);

module.exports.hikeSchema = Joi.object({
  hike: Joi.object({
    title: Joi.string().required().escapeHTML(),
    distance: Joi.number().min(1).required(),
    location: Joi.string().required().escapeHTML(),
    finish: Joi.string().required().escapeHTML(),
    images: Joi.string(),
    duration: Joi.number().required(),
    difficulty: Joi.string().required().escapeHTML(),
    ascent: Joi.number().required(),
    descent: Joi.number().required(),
    description: Joi.string().required().escapeHTML()
  }).required(),
  deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML()
  }).required()
});




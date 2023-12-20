// If we are in developer mode require "dotenv", otherwise don't
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
};

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const nodemailer = require("nodemailer");
const User = require("./models/user");
const helmet = require("helmet");
const catchAsync = require("./utilities/catchAsync");
const hikes = require("./controllers/hikes");
const MongoStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/SwitzerlandExplored";

// MongoDB Sanitizer (for security)
const mongoSanitize = require("express-mongo-sanitize");

// Requiring the routes
const hikeRoutes = require("./routes/hikes");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const bookmarkRoutes = require("./routes/bookmarks");

// connecting to MongoDB
mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
  console.log("DATABASE CONNECTED!");
};

// setting up ejs-mate
app.engine("ejs", ejsMate);
// setting up ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// method that parses the incoming request with urlencoded payload
app.use(express.urlencoded({ extended: true }));

// add the override method so we can use PUT in form submits
app.use(methodOverride("_method"));

// telling express to serve the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// telling express to sanitize, to remove data using $ and . characters in req.body/req.params/req.query/req.headers
app.use(mongoSanitize({replaceWith: "_"}));

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

// setting up session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret
  }
});

store.on("error", function(e){
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // "secure: true" can only be used with https, otherwise it will break the code if you use it on localhost, so comment it out only when you deploy the project
    // secure: true;
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));

// setting up flash
app.use(flash());

// telling the app to use Helmet (security)
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://ka-f.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://res.cloudinary.com/natgian/",
  "https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js.map"
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://ka-f.fontawesome.com/",
  "https://res.cloudinary.com/natgian/",
  "https://cdn.jsdelivr.net/",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://cdnjs.cloudflare.com",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com/",
  "https://events.mapbox.com/",
  "https://res.cloudinary.com/natgian/",
  "https://images.unsplash.com/",
  "https://ka-f.fontawesome.com/",
  "https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js.map",
  "https://formspree.io/f/maykawwn"
];
const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://ka-f.fontawesome.com/",
];

app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/natgian/",
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
          manifestSrc: ["'self'"]       
      }
  })
);

// telling the app to use Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate())); // specifying the authentication method
passport.serializeUser(User.serializeUser()); // serialize users into the session
passport.deserializeUser(User.deserializeUser()); // getting a user out of that sessions

// middleware to have access to flash everywhere (on every file)
app.use((req, res, next) => {
  res.locals.loggedInUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// using the required routes
app.use("/hikes", hikeRoutes);
app.use("/", userRoutes);
app.use("/hikes/:id/reviews", reviewRoutes);
app.use("/hikes/:id/bookmarks", bookmarkRoutes);
app.use("/bookmarks", bookmarkRoutes);

// GENERAL ROUTES
// - Home -
app.get("/", catchAsync(hikes.index));

// - Explore - 
app.get("/search", catchAsync(hikes.search));

// - Info -
app.get("/information", (req, res) => {
  res.render("information", {title: "Hiking information | Switzerland Explored", page_name: "information"});
});

// - Contact -
app.get("/contact", (req, res) => {
  res.render("contact", {title: "Contact | Switzerland Explored", page_name: "contact"});
});
app.get("/message-sent", (req, res) => {
  res.render("messageSent", {title: "Contact | Switzerland Explored", page_name: "contact"});
});
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: "mail.infomaniak.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PW
    }
  });  

  const mailOptions = {
    from: "info@natgian.com",
    to: "info@natgian.com",
    subject: `SwitzerlandExplored - Nachricht von ${name}`,
    text: `Es wurde folgende Nachricht von ${email} über das Kontaktformular gesendet:\n\n ${subject}\n\n ${message}`
  };

  await transporter.sendMail(mailOptions);
  res.redirect("/message-sent");
});

// - Privacy Policy - 
app.get("/privacypolicy", (req, res) => {
  res.render("privacypolicy", {title: "Privacy Policy | Switzerland Explored", page_name: "privacypolicy"});
});

// 404 PAGE NOT FOUND HANDLER (all = for every request / * = for every path)
app.all("*", (req, res, next) => {
  // next(new ExpressError("Page Not Found", 404));
  res.render("pagenotfound", {title: "Page Not Found | Switzerland Explored", page_name: "pagenotfound"});
});

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.mesage = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`APP SERVING ON PORT ${port}!`);
});
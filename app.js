const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config();

const routes = require("./routes");
require("./passport");

const app = express();

// mongoose setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", routes.users);
app.use("/posts", routes.posts);
app.use("/comments", routes.comments);
app.use("/auth", routes.auth);

// Catch 404 errors
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
})

// Custom error handling: respond with errors as JSON, not HTML
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "development")
    console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
})

module.exports = app;

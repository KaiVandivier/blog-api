const express = require("express");
const router = express.Router();
const passport = require("passport");
const { param, body } = require("express-validator");

const Post = require("../models/post");
const {
  handleValidationResult,
  getResource,
  checkEditDeletePermissions,
} = require("../middlewares");

/* GET posts listing. */
router.get("/", function (req, res, next) {
  Post.find()
    .then((posts) => res.json({ posts }))
    .catch(next);
});

// POST: create new post
router.post(
  "/",
  // Authenticate
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize input
  body("title", "Title is required").trim().notEmpty().escape(),
  body("text", "Post content is required").trim().notEmpty().escape(),
  body("published").toBoolean(),
  handleValidationResult,
  // Handle the rest of the input
  (req, res, next) => {
    Post.create({
      title: req.body.title,
      text: req.body.text,
      user: req.user._id,
      published: req.body.published,
    })
      .then((post) => res.json(post))
      .catch(next);
  }
);

// GET: one post details
router.get(
  "/:id",
  // Validate ID
  param("id", "Invalid post ID").isMongoId(),
  handleValidationResult,
  // Get post and return
  getResource(Post),
  (req, res) => res.json({ post: req.resource })
);

// PUT: update one post
router.put(
  "/:id",
  // Authenticate
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize input
  body("title", "Title is required").trim().notEmpty().escape(),
  body("text", "Post content is required").trim().notEmpty().escape(),
  body("published").toBoolean(),
  handleValidationResult,
  // Find resource, check permissions
  getResource(Post),
  checkEditDeletePermissions,
  // Handle rest of request
  (req, res, next) => {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        title: req.body.title,
        text: req.body.text,
        user: req.user._id,
        published: req.body.published,
      },
      { new: true }
    )
      .then((post) => res.json({ post }))
      .catch(next);
  }
);

// DELETE: delete one post
router.delete(
  "/:id",
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate ID
  param("id", "Invalid ID").isMongoId(),
  handleValidationResult,
  // Get post and check permissions
  getResource(Post),
  checkEditDeletePermissions,
  // After verifying item and permissions, handle request
  (req, res, next) => {
    Post.findOneAndDelete({ _id: req.params.id })
      .then((post) => res.json({ post }))
      .catch(next);
  }
);

module.exports = router;

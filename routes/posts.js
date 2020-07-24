const express = require("express");
const router = express.Router();
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");

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
  // Handle the rest of the input
  (req, res, next) => {
    const errors = validationResult(req);

    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      user: req.user._id,
      published: req.body.published,
    });

    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ message: "Invalid form data", post, errors: errors.array() });

    post.save((err) => {
      if (err) return next(err);
      return res.json({ post });
    });
  }
);

// GET: one post details
router.get("/:id", (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => res.json({ post }))
    .catch(next);
});

// PUT: update one post
router.put(
  "/:id",
  // Authenticate
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize input
  body("title", "Title is required").trim().notEmpty().escape(),
  body("text", "Post content is required").trim().notEmpty().escape(),
  body("published").toBoolean(),
  // Handle rest of request
  (req, res, next) => {
    const errors = validationResult(req);

    const post = new Post({
      _id: req.params.id,
      title: req.body.title,
      text: req.body.text,
      user: req.user._id,
      published: req.body.published,
    });

    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ message: "Invalid form data", post, errors: errors.array() });

    Post.updateOne({ _id: req.params.id }, post, (err) => {
      if (err) return next(err);
      return res.json({ post });
    });
  }
);

// DELETE: delete one post
router.delete(
  "/:id",
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Handle request
  (req, res, next) => {
    Post.findOneAndDelete({ _id: req.params.id })
      .then((post) => res.json({ post }))
      .catch(next);
  }
);

module.exports = router;

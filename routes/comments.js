const express = require("express");
const router = express.Router();
const passport = require("passport");
const { param, body } = require("express-validator");

const Comment = require("../models/comment");
const {
  handleValidationResult,
  getResource,
  checkEditDeletePermissions,
} = require("../middlewares");

/* GET comments listing. */
router.get("/", function (req, res, next) {
  // Get comments based on query, e.g. `post=<id>`
  Comment.find({ ...req.query })
    .then((comments) => res.json({ comments }))
    .catch(next);
});

// POST: create new comment
router.post(
  "/",
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize input
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ max: 400 })
    .withMessage("Comment must be 400 characters or fewer"),
  body("post")
    .notEmpty()
    .withMessage("Post ID is required")
    .isMongoId()
    .withMessage("Post ID is invalid"),
  handleValidationResult,
  // Handle route
  (req, res, next) => {
    Comment.create({
      user: req.user._id,
      post: req.body.post,
      text: req.body.text,
    })
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

// GET: one comment details
router.get(
  "/:id",
  // Validate ID
  param("id", "Invalid ID").isMongoId(),
  // Handle validation
  handleValidationResult,
  // Do rest of route
  (req, res, next) => {
    Comment.findOne({ _id: req.params.id })
      .orFail(new Error("Comment not found"))
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

// PUT: update one comment
router.put(
  "/:id",
  // Authenticate
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize input and params
  param("id", "Invalid Comment ID").isMongoId(),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ max: 400 })
    .withMessage("Comment must be 400 characters or fewer"),
  // Handle validation result
  handleValidationResult,
  // Get comment and populate on req.resource, or return "Not found"
  getResource(Comment),
  // Check permissions
  checkEditDeletePermissions,
  // Handle request
  (req, res, next) => {
    Comment.findOneAndUpdate(
      { _id: req.params.id },
      { text: req.body.text },
      { new: true }
    )
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

// DELETE: delete one comment
router.delete(
  "/:id",
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate ID
  param("id", "Invalid ID").isMongoId(),
  handleValidationResult,
  getResource(Comment),
  checkEditDeletePermissions,
  // After verifying item and permissions, handle request
  (req, res, next) => {
    Comment.findOneAndDelete({ _id: req.params.id })
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { param, body, validationResult } = require("express-validator");

const Comment = require("../models/comment");

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
  // `post` should be an invisible input on form
  body("post", "Invalid Post ID").isMongoId(),
  // Handle route
  (req, res, next) => {
    const errors = validationResult(req);

    const comment = new Comment({
      user: req.user._id,
      post: req.body.post,
      text: req.body.text,
    });

    if (!errors.isEmpty())
      return res.status(400).json({
        message: "Oops! Invalid form data",
        errors: errors.array(),
        comment,
      });

    comment
      .save()
      .then(() => res.json({ comment }))
      .catch(next);
  }
);

// GET: one comment details
router.get(
  "/:id",
  // Validate ID
  param("id", "Invalid ID").isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    Comment.findOne({ _id: req.params.id })
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

// PUT: update one comment
// TODO: Check for admin or ownership
router.put(
  "/:id",
  // Authenticate
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize input, params
  param("id", "Invalid ID").isMongoId(),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ max: 400 })
    .withMessage("Comment must be 400 characters or fewer"),
  // Handle request
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

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
// TODO: Check for admin or ownership
router.delete(
  "/:id",
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate ID
  param("id", "Invalid ID").isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    Comment.findOneAndDelete({ _id: req.params.id })
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

module.exports = router;

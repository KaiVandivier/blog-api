const express = require("express");
const router = express.Router();
const passport = require("passport");
const { param, body, validationResult } = require("express-validator");

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
// TODO: Check for admin or ownership
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
    const comment = req.resource;
    console.log(comment);
    res.send("Hello!");

    // Comment.findOne({ _id: req.params.id })
    //   .orFail(new Error("Comment not found"))
    //   .then((comment) => {
    //     if (!editDeletePermissions(req.user, comment))
    //       return res
    //         .status(403)
    //         .json({ message: "You don't have permission to do that." });
    //     Comment.findOneAndUpdate(
    //       { _id: req.params.id },
    //       { text: req.body.text },
    //       { new: true }
    //     ).then((newComment) => res.json({ comment: newComment }));
    //   })
    //   .catch(next);
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

    Comment.find({ _id: req.params.id }).then((comment) => {
      // Check if comment exists
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });
      // Check for delete permissions (admin or ownership)
      const userOwnsComment = comment.user;
    });

    Comment.findOneAndDelete({ _id: req.params.id })
      .then((comment) => res.json({ comment }))
      .catch(next);
  }
);

module.exports = router;

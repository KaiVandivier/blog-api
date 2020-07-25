const express = require("express");
const router = express.Router();
const { param, body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const {
  handleValidationResult,
  getResource,
  checkEditDeletePermissions,
} = require("../middlewares");

/* GET users listing. */
router.get("/", function (req, res, next) {
  User.find({}, "name email")
    .then((users) => res.json({ users }))
    .catch(next);
});

// POST: create new user
router.post(
  "/",
  // Sanitization and validation
  body("email", "Must enter a valid email").trim().isEmail().normalizeEmail(),
  body("name", "Name is required").trim().notEmpty().escape(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation must match password"),
  handleValidationResult,
  // Handle rest of request
  (req, res, next) => {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => User.create({ ...req.body, password: hash }))
      .then((user) => {
        jwt.sign({ id: user._id }, process.env.JWT_SECRET, (err, token) => {
          if (err) return next(err);
          return res.json({ token });
        });
      })
      .catch(next);
  }
);

// GET "Me", the currently authenticated user
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { _id, name, email } = req.user;
    return res.json({ user: { _id, name, email } });
  }
);

// GET: one user details
router.get(
  "/:id",
  // Authenticate for this route
  passport.authenticate("jwt", { session: false }),
  // Confirm ID format
  param("id", "Invalid ID").isMongoId(),
  handleValidationResult,
  // Get user details from db
  (req, res, next) => {
    User.findOne({ _id: req.params.id }, "name email")
      .then((user) => res.json(user))
      .catch(next);
  }
);

// PUT: update one user
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  // Sanitization and validation
  body("email", "Must enter a valid email").trim().isEmail().normalizeEmail(),
  body("name", "Name is required").trim().notEmpty().escape(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation must match password"),
  handleValidationResult,
  // Get user and check permissions
  getResource(User),
  checkEditDeletePermissions,
  // Update user in db
  (req, res, next) => {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) =>
        User.findOneAndUpdate(
          { _id: req.params.id },
          { email: req.body.email, name: req.body.name, password: hash },
          { new: true }
        )
      )
      .then((user) => res.json({ user }))
      .catch(next);
  }
);

// DELETE: delete one user
router.delete(
  "/:id",
  // Authenticate
  passport.authenticate("jwt", { session: false }),
  // Validate ID
  param("id", "Invalid user ID").isMongoId(),
  handleValidationResult,
  // Get user and check edit/delete permissions
  getResource(User),
  checkEditDeletePermissions,
  // Handle request
  (req, res, next) => {
    User.findOneAndDelete({ _id: req.params.id })
      .then((user) => res.json(user))
      .catch(next);
  }
);

module.exports = router;

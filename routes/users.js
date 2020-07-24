const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  User.find({}, "name email")
    .then((users) => res.json({ users }))
    .catch(next);
});

// POST: create new user
router.post(
  "/",
  [
    // Sanitization and validation
    body("email", "Must enter a valid email").trim().isEmail().normalizeEmail(),
    body("password", "Password must be at least 8 characters").isLength({
      min: 8,
    }),
    body("name", "Name is required").trim().notEmpty().escape(),
  ],
  // Handle rest of request
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => User.create({ ...req.body, password: hash }))
      .then((user) => {
        jwt.sign({ id: user._id }, process.env.JWT_SECRET, (err, token) => {
          if (err) return next(err);
          return res.json({ token });
        })
      })
      .catch(next);
  }
);

// GET "Me", the currently authenticated user
router.get("/me", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  const { _id, name, email } = req.user;
  return res.json({ user: { _id, name, email } });
})

// GET: one user details
router.get("/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
  User.findOne({ _id: req.params.id }, "name email")
    .then(user => res.json(user))
    .catch(next);
});

// PUT: update one user
router.put("/:id",
  passport.authenticate("jwt", { session: false }),
  // TODO: Validate and sanitize input:
  // Would this be like an "update password" form? idk what to do in this handler
  (req, res, next) => {
    res.json({ message: "TODO: Update user (PUT)" })
  }
);

// DELETE: delete one user
router.delete("/:id");

module.exports = router;

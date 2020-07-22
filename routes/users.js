const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  User.find({}, "name")
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
    
    // TODO:
    // Log in
    // Sign JWT and send in response

    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => User.create({ ...req.body, password: hash }))
      .then((user) => res.json(user))
      .catch(next);
  }
);

// GET: one user details
router.get("/:id", async (req, res, next) => {
  // use .orFail()? Errors send an html response, which is not ideal for an API
  User.findOne({ _id: req.params.id })
    .then(user => res.json(user))
    .catch(next);
});

// PUT: update one user
router.put("/:id");

// DELETE: delete one user
router.delete("/:id");

module.exports = router;

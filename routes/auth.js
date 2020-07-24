const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// POST login endpoint
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  // Authentication is successful
  (req, res, next) => {
    // Generate jwt to send back to user
    jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, (err, token) => {
      if (err) return next(err);
      return res.json({ token });
    })
  }
);

module.exports = router;

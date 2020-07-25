const { validationResult } = require("express-validator");
const User = require("./models/user");

function handleValidationResult(req, res, next) {
  const errors = validationResult(req);

  // If there are validation errors, return result
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // If not, all good; continue to next middleware
  next();
}

function getResource(model) {
  // Receives a model (e.g. `User` or `Post`) and returns a middleware
  // The middleware populates req.resource or throws a "not found" error
  return (req, res, next) => {
    model
      .findOne({ _id: req.params.id })
      .then((resource) => {
        // If not found, return 404 response
        if (!resource) return res.status(404).json({ message: "Not found" });

        // Otherwise, populate req.resource, and on to the next one
        req.resource = resource;
        next();
      })
      .catch(next);
  };
}

function checkEditDeletePermissions(req, res, next) {
  // Note: this won't work for items that don't have a `user` prop
  if (!req.user) throw new Error("User not found");
  if (!req.resource) throw new Error("Resource not found");

  // Checks if req.user has admin privs or owns resource
  const admin = req.user.admin;
  const ownsResource =
    req.resource instanceof User
      ? req.user._id.toString() == req.resource._id.toString()
      : req.user._id.toString() == req.resource.user.toString();

  // If neither condition is met, return "403 unauthorized"
  if (!admin && !ownsResource)
    return res
      .status(403)
      .json({ message: "You don't have permission to do that." });

  // Otherwise, on to the next one
  next();
}

module.exports = {
  handleValidationResult,
  getResource,
  checkEditDeletePermissions,
};

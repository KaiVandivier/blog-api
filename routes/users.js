var express = require('express');
var router = express.Router();

const User = require("../models/user");

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.send('respond with a resource');
});

// POST: create new user
router.post("/");

// GET: one user details
router.get("/:id");

// PUT: update one user
router.put("/:id");

// DELETE: delete one user
router.delete("/:id");

module.exports = router;

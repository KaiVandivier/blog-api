var express = require("express");
var router = express.Router();

const Post = require("../models/post");

/* GET posts listing. */
router.get("/", async function (req, res, next) {
  res.send("respond with a resource");
});

// POST: create new post
router.post("/");

// GET: one post details
router.get("/:id");

// PUT: update one post
router.put("/:id");

// DELETE: delete one post
router.delete("/:id");

module.exports = router;

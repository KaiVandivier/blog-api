var express = require("express");
var router = express.Router();

const Comment = require("../models/comment");

/* GET comments listing. */
router.get("/", async function (req, res, next) {
  res.send("respond with a resource");
});

// POST: create new comment
router.post("/");

// GET: one comment details
router.get("/:id");

// PUT: update one comment
router.put("/:id");

// DELETE: delete one comment
router.delete("/:id");

module.exports = router;

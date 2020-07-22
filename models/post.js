const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: new Date() },
  published: { type: Boolean, default: false },
})

module.exports = model("Post", postSchema);

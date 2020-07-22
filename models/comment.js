const { model, Schema } = require("mongoose");

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: new Date() }
});

module.exports = model("Comment", commentSchema);

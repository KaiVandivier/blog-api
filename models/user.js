const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  email: { type: String /* ? */, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  admin: { type: Boolean, default: false },
});

module.exports = model("User", userSchema)

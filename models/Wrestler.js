const mongoose = require("mongoose");

const wrestlerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  weight: String,
  class: String,
  wins: Number,
  losses: Number
})

wrestlerSchema.virtual("record").get(function() {
  return `${this.wins || 0}-${this.losses || 0}`
})

module.exports = mongoose.model("Wrestler", wrestlerSchema)

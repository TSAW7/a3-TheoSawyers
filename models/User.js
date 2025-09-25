const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // store hashed password
});

// Method to check password
userSchema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password)
}

// Optional: hash password automatically before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

module.exports = mongoose.model("User", userSchema)

// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const User = require("./models/User");       
const Wrestler = require("./models/Wrestler");

const app = express();
const port = process.env.PORT || 3000;

// ---------- Connect to MongoDB ----------
mongoose.connect("mongodb://127.0.0.1:27017/wrestlerTracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// ---------- Middleware ----------
app.use(bodyParser.json());
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false
}));

// Serve static assets (CSS/JS/images)
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ---------- AUTH ROUTES ----------

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const match = await user.checkPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid username or password" });

    req.session.userId = user._id;
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});





// ---------- WRESTLER CRUD ROUTES ----------
app.get("/wrestlers", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  const wrestlers = await Wrestler.find({ user: req.session.userId });
  res.json(wrestlers);
});

app.post("/wrestlers", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  const wrestler = new Wrestler({ ...req.body, user: req.session.userId });
  await wrestler.save();
  const wrestlers = await Wrestler.find({ user: req.session.userId });
  res.json(wrestlers);
});

app.put("/wrestlers/:id", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  await Wrestler.updateOne({ _id: req.params.id, user: req.session.userId }, req.body);
  const wrestlers = await Wrestler.find({ user: req.session.userId });
  res.json(wrestlers);
});

app.delete("/wrestlers/:id", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  await Wrestler.deleteOne({ _id: req.params.id, user: req.session.userId });
  const wrestlers = await Wrestler.find({ user: req.session.userId });
  res.json(wrestlers);
});

// ---------- PAGE ROUTES ----------
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ---------- Start Server ----------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


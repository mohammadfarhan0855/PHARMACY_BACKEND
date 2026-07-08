/*  MONGO_URI=mongodb+srv://mohammadfarhan0855_db_user:6kz8YInarciBhoho@pharmacy.z52dbss.mongodb.net/ */



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Error:", err.message));


// ==========================================
// SCHEMAS & MODELS
// ==========================================

// Medicine Schema
const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  description: String,
  price: Number,
  image: String,
  stock: { type: Number, default: 100 }
});
const Medicine = mongoose.model('Medicine', medicineSchema);

// User Schema (Added so the login route has a collection to search)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);


// ==========================================
// ROUTES
// ==========================================

// --- MEDICINE ROUTES ---

// Get all medicines
app.get('/api/medicines', async (req, res) => {
  const medicines = await Medicine.find();
  res.json(medicines);
});

// Add new medicine
app.post('/api/medicines', async (req, res) => {
  const medicine = new Medicine(req.body);
  await medicine.save();
  res.json(medicine);
});

// Update medicine
app.put('/api/medicines/:id', async (req, res) => {
  const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete medicine
app.delete('/api/medicines/:id', async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ message: "Medicine deleted" });
});


// --- AUTHENTICATION ROUTES ---

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verify that the user sent both email and password
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    // 2. Search MongoDB for a user with that exact email
    const user = await User.findOne({ email });

    // 3. If no user is found with that email
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    // 4. Check if the password matches
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // 5. If everything is correct, send a success response
    res.status(200).json({ 
      message: "Login successful!", 
      user: { 
        id: user._id, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
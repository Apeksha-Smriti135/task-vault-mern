const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "my_offline_secret_key"; 

// 1. DATABASE CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/taskVault')
  .then(() => console.log("✅ OFFLINE DB CONNECTED"))
  .catch(err => console.log("❌ DB CONNECTION ERROR:", err));

// 2. MODELS
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 } 
});
const User = mongoose.model('User', UserSchema);

// --- SPECIFIC UPDATE: Storing an array of dates instead of a boolean ---
const TaskSchema = new mongoose.Schema({
  text: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedDates: [String] // Array to store dates like ["2026-03-19", "2026-03-20"]
});
const Task = mongoose.model('Task', TaskSchema);

// 3. AUTH ROUTES
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User Registered Successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists!" });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id, streak: user.streak }, SECRET_KEY);
    res.json({ token, streak: user.streak });
  } else {
    res.status(401).json({ error: "Invalid Credentials" });
  }
});

// 4. TASK ROUTES

app.get('/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch tasks" });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { text, userId } = req.body;
    const newTask = new Task({ text, userId, completedDates: [] }); // Initialize empty array
    await newTask.save();
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Could not save task" });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// --- SPECIFIC UPDATE: Toggle logic for dates (The Calendar Logic) ---
app.put('/tasks/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    if (task.completedDates.includes(today)) {
      // If already done today, remove it (Toggle OFF)
      task.completedDates = task.completedDates.filter(date => date !== today);
    } else {
      // If not done today, add today's date (Toggle ON)
      task.completedDates.push(today);
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Toggle failed" });
  }
});

app.put('/users/:userId/streak', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    user.streak += 1;
    await user.save();
    res.json({ streak: user.streak });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});

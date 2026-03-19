# 🚀 Task Vault (MERN)

A full-stack habit tracking web application built using the MERN stack.
Track daily habits, maintain streaks, and visualize your progress over time.

---

## ✨ Features

* 🔐 User Authentication (Register & Login)
* 📊 Habit Tracking System
* 🔥 Streak Counter
* 📅 Activity Visualization (7-day / yearly grid)
* 🔍 Search & Filter Habits
* ✅ Mark habits as completed
* 🚪 Logout functionality

---

## 🛠 Tech Stack

**Frontend**

* React (Vite)
* CSS (Custom UI + animations)

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB (Community Server - Local)

---

## 📁 Project Structure

task-vault-mern/
│
├── frontend/   # React app (Port: 5173)
├── backend/    # Express server (Port: 5000)
├── .gitignore
├── README.md

---

## ⚙️ Getting Started

### 1. Clone the repository

git clone https://github.com/Apeksha-Smriti135/task-vault-mern.git
cd task-vault-mern

---

### 2. Setup Backend

cd backend
npm install
npm start

Backend runs on:
http://localhost:5000

---

### 3. Setup Frontend

Open a new terminal:

cd frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vault
JWT_SECRET=your_secret_key

---

## 🧠 Important Notes

* This project uses **MongoDB Community Server (local database)**
* Make sure MongoDB is installed and running on your system
* Do NOT upload `.env` file to GitHub

---

## ⚠️ Limitations

* Not deployed (runs locally only)
* Requires local MongoDB setup
* No advanced error handling yet

---

## 🚀 Future Improvements

* 🌐 Deploy using Render / Vercel
* ☁️ Switch to MongoDB Atlas
* 📱 Improve mobile responsiveness
* 📊 Add analytics dashboard
* 🔔 Notifications / reminders

---

## 👩‍💻 Author

Spoorti Dyampur

---

## ⭐ Acknowledgment

Built as a learning + hackathon practice project using the MERN stack.

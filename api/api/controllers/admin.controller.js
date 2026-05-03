// src/api/controllers/admin.controller.js
const { db } = require('../../config/db.config');

exports.getPlatformStats = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const tradesSnapshot = await db.collection('trades').get();

    res.json({
      total_users: usersSnapshot.size,
      total_trades: tradesSnapshot.size
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch platform stats" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      // Never send password hashes to the frontend
      delete data.password_hash; 
      return { id: doc.id, ...data };
    });

    res.json(users);
  } catch (err) {
    console.error("Admin Users Error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: You could also delete all their trades/notes here to clean up space
    await userRef.delete();
    res.json({ message: "User permanently deleted." });
  } catch (err) {
    console.error("Admin Delete Error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
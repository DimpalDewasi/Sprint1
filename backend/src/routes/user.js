import { Router } from "express";
import { pool } from "../utils/db.js";
import bcrypt from "bcryptjs";
import { auth } from "../middleware/auth.js";

const router = Router();

// Get logged-in user details
router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, email, salary FROM users WHERE id=?",
      [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Change password
router.post("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const [rows] = await pool.query("SELECT password FROM users WHERE id=?", [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ error: "Wrong password" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=? WHERE id=?", [hash, req.user.id]);

    res.json({ ok: true, message: "Password changed" });
  } catch (err) {
    console.error("Error in /change-password:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

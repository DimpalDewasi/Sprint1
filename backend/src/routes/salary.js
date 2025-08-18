import { Router } from "express";
import { pool } from "../utils/db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM salary WHERE user_id=?", [req.user.id]);
  res.json(rows[0] || null);
});

router.post("/", auth, async (req, res) => {
  const { monthly_salary } = req.body;
  const [rows] = await pool.query("SELECT id FROM salary WHERE user_id=?", [req.user.id]);
  if (rows[0]) {
    await pool.query("UPDATE salary SET monthly_salary=? WHERE user_id=?", [monthly_salary, req.user.id]);
  } else {
    await pool.query("INSERT INTO salary (user_id, monthly_salary) VALUES (?,?)", [req.user.id, monthly_salary]);
  }
  res.json({ ok: true });
});

export default router;

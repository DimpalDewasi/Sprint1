import { Router } from "express";
import { pool } from "../utils/db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// helper to format JS date/ISO string into MySQL DATE (YYYY-MM-DD)
const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
};

router.post("/", auth, async (req, res) => {
  const { goal_name, goal_amount, description, end_date } = req.body;
  const endDate = formatDate(end_date);

  await pool.query(
    "INSERT INTO goals (user_id, goal_name, goal_amount, description, end_date) VALUES (?,?,?,?,?)",
    [req.user.id, goal_name, goal_amount, description || null, endDate]
  );

  res.json({ ok: true });
});

router.get("/", auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM goals WHERE user_id=? ORDER BY id DESC",
    [req.user.id]
  );

  // attach progress from 'savings' transactions linked to goal
  for (const g of rows) {
    const [sumRows] = await pool.query(
      "SELECT SUM(amount) as saved FROM transactions WHERE user_id=? AND goal_id=? AND category='savings'",
      [req.user.id, g.id]
    );
    g.saved = sumRows[0]?.saved || 0;

    const today = new Date().toISOString().slice(0, 10);
    const expired = today > g.end_date;

    if (!g.achieved && g.saved >= g.goal_amount) g.achieved = true;

    g.status = g.achieved ? "achieved" : expired ? "expired" : "active";
    g.remaining = Math.max(0, Number(g.goal_amount) - Number(g.saved));
  }

  res.json(rows);
});

router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { goal_name, goal_amount, description, end_date } = req.body;
  const endDate = formatDate(end_date);

  // Only allow editing if not achieved or expired
  const [rows] = await pool.query(
    "SELECT * FROM goals WHERE id=? AND user_id=?",
    [id, req.user.id]
  );
  const g = rows[0];
  if (!g) return res.status(404).json({ error: "Goal not found" });

  const today = new Date().toISOString().slice(0, 10);
  const expired = today > g.end_date;
  if (g.achieved || expired)
    return res.status(400).json({ error: "Cannot edit achieved/expired goal" });

  await pool.query(
    "UPDATE goals SET goal_name=?, goal_amount=?, description=?, end_date=? WHERE id=?",
    [goal_name, goal_amount, description || null, endDate, id]
  );

  res.json({ ok: true });
});

router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT * FROM goals WHERE id=? AND user_id=?",
    [id, req.user.id]
  );
  const g = rows[0];
  if (!g) return res.status(404).json({ error: "Goal not found" });

  const today = new Date().toISOString().slice(0, 10);
  const expired = today > g.end_date;
  if (g.achieved || expired)
    return res.status(400).json({ error: "Cannot delete achieved/expired goal" });

  await pool.query("DELETE FROM goals WHERE id=?", [id]);

  res.json({ ok: true });
});

// ✅ New: Add saved money to a goal
router.post("/:id/save", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // make sure goal exists
    const [rows] = await pool.query(
      "SELECT * FROM goals WHERE id=? AND user_id=?",
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Goal not found" });

    // insert into transactions (savings category)
    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, category, type, description, date) VALUES (?,?,?,?,?,?,?)",
      [
        req.user.id,
        id,
        amount,
        "savings",
        "income", // or "saving"
        "Goal saving",
        new Date().toISOString().slice(0, 10), // only DATE
      ]
    );

    res.json({ ok: true, message: "Money added to goal savings" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

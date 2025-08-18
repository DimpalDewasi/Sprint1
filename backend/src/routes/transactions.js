import { Router } from "express";
import { pool } from "../utils/db.js";
import { auth } from "../middleware/auth.js";
import ExcelJS from "exceljs";

const router = Router();

router.post("/", auth, async (req, res) => {
  const { amount, category, date, notes, goal_id } = req.body;
  await pool.query(
    "INSERT INTO transactions (user_id, amount, category, date, notes, goal_id) VALUES (?,?,?,?,?,?)",
    [req.user.id, amount, category, date, notes || null, goal_id || null]
  );
  res.json({ ok: true });
});

router.get("/", auth, async (req, res) => {
  const { category, sortBy, order } = req.query;
  const params = [req.user.id];
  let q =
    "SELECT t.*, g.goal_name FROM transactions t LEFT JOIN goals g ON t.goal_id = g.id WHERE t.user_id=?";
  if (category) {
    q += " AND t.category=?";
    params.push(category);
  }
  const validSorts = new Set(["amount", "date", "category"]);
  const sortCol = validSorts.has(sortBy) ? sortBy : "date";
  const dir = order === "asc" ? "ASC" : "DESC";
  q += ` ORDER BY t.${sortCol} ${dir}`;
  const [rows] = await pool.query(q, params);
  res.json(rows);
});

router.get("/summary", auth, async (req, res) => {
  const [salaryRows] = await pool.query(
    "SELECT monthly_salary FROM salary WHERE user_id=?",
    [req.user.id]
  );
  const salary = salaryRows[0]?.monthly_salary || 0;
  const [expRows] = await pool.query(
    "SELECT SUM(amount) as total FROM transactions WHERE user_id=? AND category<> 'savings'",
    [req.user.id]
  );
  const totalExpenses = expRows[0]?.total || 0;
  const currentBalance = Number(salary) - Number(totalExpenses);
  const [byCat] = await pool.query(
    "SELECT category, SUM(amount) as total FROM transactions WHERE user_id=? GROUP BY category",
    [req.user.id]
  );
  res.json({ salary, totalExpenses, currentBalance, byCategory: byCat });
});

router.get("/export", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.amount, t.category, t.date, t.notes, g.goal_name 
       FROM transactions t 
       LEFT JOIN goals g ON t.goal_id = g.id 
       WHERE t.user_id=? 
       ORDER BY t.date DESC`,
      [req.user.id]
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    worksheet.columns = [
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Goal", key: "goal_name", width: 20 },
    ];

    rows.forEach((r) => {
      worksheet.addRow({
        amount: r.amount,
        category: r.category,
        date: r.date instanceof Date
          ? r.date.toISOString().slice(0, 10)
          : (r.date || ""),
        notes: r.notes || "",
        goal_name: r.goal_name || "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export Excel" });
  }
});

export default router;

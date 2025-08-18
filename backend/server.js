import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";
import salaryRoutes from "./src/routes/salary.js";
import txRoutes from "./src/routes/transactions.js";
import goalsRoutes from "./src/routes/goals.js";
import { initDb } from "./src/utils/db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/", (req, res) => res.json({ ok: true, service: "BudgetMate API" }));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/salary", salaryRoutes);
app.use("/transactions", txRoutes);
app.use("/goals", goalsRoutes);

// Init DB and start
const PORT = process.env.PORT || 5000;
initDb().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}).catch(err => {
  console.error("DB init error:", err);
  process.exit(1);
});

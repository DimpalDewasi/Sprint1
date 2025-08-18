import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const QUOTES = [
  "A budget is telling your money where to go instead of wondering where it went.",
  "Do not save what is left after spending; instead spend what is left after saving.",
  "Beware of little expenses; a small leak will sink a great ship.",
  "The art is not in making money, but in keeping it."
];

// Soft theme-friendly colors
const COLORS = ["#4dabf7", "#94d82d", "#ffd43b", "#ff6b6b", "#9775fa"];

export default function Dashboard() {
  const [summary, setSummary] = useState({
    salary: 0,
    totalExpenses: 0,
    currentBalance: 0,
    byCategory: []
  });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const hasSalary = Number(summary.salary) > 0;

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 7000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    const res = await api.get("/transactions/summary");
    setSummary(res.data);
    if (!res.data.salary || Number(res.data.salary) === 0) setShowSalaryModal(true);
  };
  useEffect(() => {
    load();
  }, []);

  const pieData = useMemo(() => {
    const data = summary.byCategory.map((c) => ({
      name: c.category,
      value: Number(c.total)
    }));

    const expensesTotal = summary.totalExpenses || 0;
    const savings = Math.max(0, Number(summary.salary) - expensesTotal);

    // Ensure only ONE "savings" slice
    if (Number(summary.salary) > 0) {
      data.push({ name: "Savings", value: savings });
    }
    return data;
  }, [summary]);

  const saveSalary = async (e) => {
    e.preventDefault();
    const val = Number(e.target.salary.value || 0);
    await api.post("/salary", { monthly_salary: val });
    setShowSalaryModal(false);
    load();
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>Welcome to BudgetMate</h2>
        <p className="quote">{QUOTES[quoteIndex]}</p>

        <div className="row">
          <div className="card">
            <div className="flex" style={{ justifyContent: "space-between" }}>
              <h3>Monthly Salary</h3>
              <button onClick={() => setShowSalaryModal(true)}>
                {hasSalary ? "Edit" : "Add"}
              </button>
            </div>
            <h1>₹ {Number(summary.salary).toFixed(2)}</h1>
          </div>
          <div className="card">
            <h3>Total Expenses</h3>
            <h1>₹ {Number(summary.totalExpenses).toFixed(2)}</h1>
          </div>
          <div className="card">
            <h3>Current Balance</h3>
            <h1>₹ {Number(summary.currentBalance).toFixed(2)}</h1>
          </div>
        </div>

        <div className="card" style={{ height: 380, marginTop: 16 }}>
          <h3>Expenses vs Savings</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                label={({ name, value }) => `${name}: ₹${value}`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value}`}
                contentStyle={{ backgroundColor: "#1e1e2f", border: "none" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showSalaryModal && (
        <div className="modal">
          <div className="content">
            <h3>{hasSalary ? "Edit Monthly Salary" : "Enter Monthly Salary"}</h3>
            <form onSubmit={saveSalary}>
              <input
                name="salary"
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                defaultValue={summary.salary || ""}
              />
              <div className="flex" style={{ justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowSalaryModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

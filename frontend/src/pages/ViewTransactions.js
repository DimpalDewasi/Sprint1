import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

export default function ViewTransactions() {
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [category, setCategory] = useState("");

  // Load transactions
  const load = async () => {
    const res = await api.get("/transactions", {
      params: { sortBy, order, category: category || undefined },
    });
    setRows(res.data);
  };

  useEffect(() => {
    load();
  }, [sortBy, order, category]);

  // Toggle sorting
  const toggleSort = (col) => {
    if (sortBy === col) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  // Download report with auth token (XLSX)
  const download = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        (process.env.REACT_APP_API_URL || "http://localhost:5000") +
          "/transactions/export",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to download report");

      // Get file as blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions_report.xlsx"); // <-- XLSX filename
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error downloading report");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Transactions</h2>
          <div className="flex">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {[
                "food",
                "travel",
                "bills",
                "recharge",
                "rent",
                "loan",
                "donations",
                "savings",
                "other",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button onClick={download}>Download Reports</button>
          </div>
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort("amount")}>
                  Amount{" "}
                  {sortBy === "amount" ? (order === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => toggleSort("category")}>
                  Category{" "}
                  {sortBy === "category" ? (order === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => toggleSort("date")}>
                  Date {sortBy === "date" ? (order === "asc" ? "↑" : "↓") : ""}
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>₹ {Number(r.amount).toFixed(2)}</td>
                  <td>
                    {r.category}
                    {r.goal_name ? ` → ${r.goal_name}` : ""}
                  </td>
                  <td>{new Date(r.date).toISOString().slice(0, 10)}</td>
                  <td>{r.notes || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

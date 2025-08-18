import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const go = (path) => {
    setOpen(false); // auto close
    window.location.href = path;
  };
  return (
    <>
      <div className="header">
        <div className="brand">💸 BudgetMate</div>
        <button className="nav-toggle" onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <div className="navmenu">
          <button onClick={() => go("/dashboard")}>Dashboard</button>
          <button onClick={() => go("/add-transaction")}>Add Transaction</button>
          <button onClick={() => go("/view-transactions")}>View Transactions</button>
          <button onClick={() => go("/goals")}>Goals</button>
          <button onClick={() => go("/settings")}>Profile / Settings</button>
          <button onClick={() => go("/help")}>Help</button>
          <button onClick={() => { localStorage.removeItem("token"); window.location.href="/"; }}>Logout</button>
        </div>
      )}
    </>
  );
}

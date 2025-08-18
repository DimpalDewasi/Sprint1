import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "3rem",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)",
        }}
      >
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Welcome to{" "}
          <span style={{ color: "#38bdf8" }}>
            BudgetMate
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            color: "#cbd5e1",
          }}
        >
          Track your expenses, visualize your savings, and achieve your goals with ease.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <Link to="/signup">
            <button
              style={{
                padding: "0.8rem 2rem",
                fontSize: "1rem",
                borderRadius: "30px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#38bdf8",
                color: "#0f172a",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = "#0ea5e9")
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "#38bdf8")
              }
            >
              Get Started
            </button>
          </Link>

          <Link to="/login">
            <button
              style={{
                padding: "0.8rem 2rem",
                fontSize: "1rem",
                borderRadius: "30px",
                border: "2px solid #38bdf8",
                backgroundColor: "transparent",
                color: "#38bdf8",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#1e293b";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

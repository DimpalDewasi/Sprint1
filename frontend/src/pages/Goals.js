import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    goal_name: "",
    goal_amount: "",
    description: "",
    end_date: "",
  });

  const [editGoal, setEditGoal] = useState(null);
  const [saveGoal, setSaveGoal] = useState(null);
  const [saveAmount, setSaveAmount] = useState("");

  const load = async () => {
    const res = await api.get("/goals");
    setGoals(res.data);
  };
  useEffect(() => {
    load();
  }, []);

  // ---------- Add Goal ----------
  const add = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      goal_amount: Number(form.goal_amount),
      end_date: form.end_date || null,
    };
    await api.post("/goals", payload);
    setForm({ goal_name: "", goal_amount: "", description: "", end_date: "" });
    load();
  };

  // ---------- Delete Goal ----------
  const del = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Cannot delete");
    }
  };

  // ---------- Save Money ----------
  const saveMoney = async (id) => {
    try {
      await api.post(`/goals/${id}/save`, { amount: Number(saveAmount) });
      setSaveAmount("");
      setSaveGoal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Cannot save money");
    }
  };

  // ---------- Update Goal ----------
  const update = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/goals/${editGoal.id}`, {
        goal_name: editGoal.goal_name,
        goal_amount: Number(editGoal.goal_amount),
        description: editGoal.description,
        end_date: editGoal.end_date || null,
      });
      setEditGoal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Cannot edit");
    }
  };

  // ---------- Helper to format date ----------
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toISOString().split("T")[0]; // yyyy-mm-dd only
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Goals</h2>
          <form onSubmit={add} className="flex" style={{ flexDirection: "column" }}>
            <input
              placeholder="Goal Name"
              value={form.goal_name}
              onChange={(e) => setForm({ ...form, goal_name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount to Save"
              value={form.goal_amount}
              onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
            <button type="submit">Add Goal</button>
          </form>
        </div>

        {/* Goals list */}
        <div className="row" style={{ marginTop: 16 }}>
          {goals.map((g) => (
            <div key={g.id} className="card">
              <div className="flex" style={{ justifyContent: "space-between" }}>
                <h3>{g.goal_name}</h3>
                <span className={`badge ${g.status}`}>{g.status}</span>
              </div>
              <p>Target: ₹ {Number(g.goal_amount).toFixed(2)}</p>
              <p>Saved: ₹ {Number(g.saved).toFixed(2)}</p>
              <Progress
                value={Math.min(
                  100,
                  Math.round((Number(g.saved) / Number(g.goal_amount)) * 100)
                )}
              />
              <p>Remaining: ₹ {Number(g.remaining).toFixed(2)}</p>
              {/* ✅ Only show date part */}
              <p>Ends on: {formatDate(g.end_date)}</p>

              {g.status === "achieved" ? (
                <span className="badge">🏆 Achieved</span>
              ) : g.status === "expired" ? (
                <span>
                  Sorry, goal not achieved. Remaining ₹{" "}
                  {Number(g.remaining).toFixed(2)}
                </span>
              ) : (
                <div className="flex" style={{ gap: "8px" }}>
                  <button onClick={() => setEditGoal(g)}>Edit</button>
                  <button onClick={() => del(g.id)}>Delete</button>
                  <button onClick={() => setSaveGoal(g)}>Add Save Money</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Goal Modal */}
      {editGoal && (
        <div className="modal">
          <div className="card">
            <h3>Edit Goal</h3>
            <form onSubmit={update} className="flex" style={{ flexDirection: "column" }}>
              <input
                value={editGoal.goal_name}
                onChange={(e) => setEditGoal({ ...editGoal, goal_name: e.target.value })}
                required
              />
              <input
                type="number"
                value={editGoal.goal_amount}
                onChange={(e) => setEditGoal({ ...editGoal, goal_amount: e.target.value })}
                required
              />
              <textarea
                value={editGoal.description || ""}
                onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
              />
              <input
                type="date"
                value={editGoal.end_date || ""}
                onChange={(e) => setEditGoal({ ...editGoal, end_date: e.target.value })}
              />
              <div className="flex" style={{ gap: "8px" }}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditGoal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Money Modal */}
      {saveGoal && (
        <div className="modal">
          <div className="card">
            <h3>Add Money to {saveGoal.goal_name}</h3>
            <input
              type="number"
              placeholder="Amount"
              value={saveAmount}
              onChange={(e) => setSaveAmount(e.target.value)}
            />
            <div className="flex" style={{ gap: "8px" }}>
              <button onClick={() => saveMoney(saveGoal.id)}>Save</button>
              <button onClick={() => setSaveGoal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Progress({ value }) {
  return (
    <div style={{ height: 10, background: "#1f2937", borderRadius: 999 }}>
      <div
        style={{
          width: value + "%",
          height: 10,
          borderRadius: 999,
          background: "linear-gradient(90deg, #22c55e, #3b82f6)",
        }}
      ></div>
    </div>
  );
}

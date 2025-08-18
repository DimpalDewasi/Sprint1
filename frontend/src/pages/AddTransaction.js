import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const CATEGORIES = ["food","travel","bills","recharge","rent","loan","donations","savings","other"];

export default function AddTransaction() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ amount:"", category:"food", date:"", notes:"", goal_id:"" });

  useEffect(()=>{
    api.get("/goals").then(res => setGoals(res.data));
  },[]);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    await api.post("/transactions", {...form, amount: Number(form.amount), goal_id: form.category==="savings" && form.goal_id? Number(form.goal_id) : null });
    alert("Transaction added");
    setForm({ amount:"", category:"food", date:"", notes:"", goal_id:"" });
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Add Transaction</h2>
          <form onSubmit={submit} className="flex" style={{flexDirection:"column"}}>
            <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required/>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {form.category==="savings" && (
              <select name="goal_id" value={form.goal_id} onChange={handleChange}>
                <option value="">-- Select Goal (optional) --</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.goal_name}</option>)}
              </select>
            )}
            <input type="date" name="date" value={form.date} onChange={handleChange} required/>
            <textarea name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} />
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}

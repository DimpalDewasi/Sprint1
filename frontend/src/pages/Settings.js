import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

export default function Settings() {
  const [user, setUser] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(()=>{
    api.get("/user/me").then(res => setUser(res.data));
  },[]);

  const change = async (e) => {
    e.preventDefault();
    try {
      await api.post("/user/change-password", { oldPassword, newPassword });
      alert("Password changed");
      setOldPassword(""); setNewPassword("");
    } catch (e) {
      alert(e.response?.data?.error || "Failed to change password");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Profile / Settings</h2>
          <div className="row" style={{gridTemplateColumns:"1fr 1fr"}}>
            <div className="card">
              <h3>Basic Info</h3>
              <p>First Name: {user.first_name}</p>
              <p>Last Name: {user.last_name}</p>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone}</p>
            </div>
            <div className="card">
              <h3>Change Password</h3>
              <form onSubmit={change} className="flex" style={{flexDirection:"column"}}>
                <input type="password" placeholder="Current Password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} required/>
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required/>
                <button type="submit">Update Password</button>
              </form>
              <br/>
              <button onClick={()=>window.location.href="/help"}>Help</button>
              <button onClick={()=>{ localStorage.removeItem("token"); window.location.href="/"; }}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

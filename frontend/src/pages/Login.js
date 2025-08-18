import React, { useState } from "react";
import api from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [splash, setSplash] = useState({ show:false, name:"" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.ok) {
        localStorage.setItem("token", res.data.token);
        setSplash({ show:true, name: res.data.firstName });
        setTimeout(() => { window.location.href="/dashboard"; }, 3500);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container">
      {splash.show && <div className="splash"><h1>Welcome, {splash.name} 👋</h1></div>}
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="flex" style={{flexDirection:"column"}}>
          <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} required/>
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required/>
          <button type="submit">Login</button>
        </form>
        <br/>
        <ForgotPassword />
      </div>
    </div>
  );
}

function ForgotPassword(){
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");

  const send = async () => {
    await api.post("/auth/forgot/send-otp", { email });
    alert("OTP sent to email");
    setStep(2);
  };
  const reset = async () => {
    await api.post("/auth/forgot/reset", { email, code, newPassword });
    alert("Password reset successful. Please login.");
    window.location.href="/login";
  };

  return (
    <div className="card">
      <h3>Forgot Password?</h3>
      {step===1 && (<div className="flex"><input placeholder="Enter your email" onChange={(e)=>setEmail(e.target.value)} /><button onClick={send}>Send OTP</button></div>)}
      {step===2 && (<div className="flex" style={{flexDirection:"column"}}>
        <input placeholder="Enter OTP" onChange={(e)=>setCode(e.target.value)} />
        <input type="password" placeholder="New Password" onChange={(e)=>setNewPassword(e.target.value)} />
        <button onClick={reset}>Reset Password</button>
      </div>)}
    </div>
  );
}

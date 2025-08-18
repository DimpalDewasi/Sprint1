import React, { useState } from "react";
import api from "../utils/api";
import { emailRegex, passwordRegex } from "../utils/validations";

export default function Signup() {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"", confirmPassword:"", emailOtp:""});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  function push(msg){ setMessages(m => [...m, msg]); }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const sendEmailOtp = async () => {
    if (!emailRegex.test(form.email)) return push("Invalid email format");
    await api.post("/auth/send-email-otp", { email: form.email });
    push("Email OTP sent!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages([]);
    if (!emailRegex.test(form.email)) return push("Invalid email");
    if (!passwordRegex.test(form.password)) return push("Weak password");
    if (form.password !== form.confirmPassword) return push("Passwords do not match");
    setLoading(true);
    try{
      const res = await api.post("/auth/signup", form);
      if (res.data.ok) {
        alert("Signup successful! Redirecting to login...");
        window.location.href="/login";
      }
    }catch(err){
      push(err.response?.data?.error || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit} className="flex" style={{flexDirection:"column"}}>
          <div className="flex">
            <input name="firstName" placeholder="First Name" onChange={handleChange} required/>
            <input name="lastName" placeholder="Last Name" onChange={handleChange} required/>
          </div>
          <div className="flex">
            <input name="email" placeholder="Email" onChange={handleChange} required/>
            <button type="button" onClick={sendEmailOtp}>Send Email OTP</button>
          </div>
          <input name="emailOtp" placeholder="Enter Email OTP" onChange={handleChange} required/>
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required/>
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required/>
          <button type="submit" disabled={loading}>{loading? "Creating..." : "Sign Up"}</button>
        </form>
        <ul>{messages.map((m,i)=><li key={i}>{m}</li>)}</ul>
      </div>
    </div>
  );
}

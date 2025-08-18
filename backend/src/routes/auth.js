import { Router } from "express";
import { pool } from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getTransporter } from "../utils/mailer.js";

const router = Router();

/** ---------- helpers ---------- */
function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

async function saveOtp(type, target, code, minutes = 10) {
  const expires = new Date(Date.now() + minutes * 60000);
  await pool.query(
    "INSERT INTO otp_codes (type, target, code, expires_at) VALUES (?,?,?,?)",
    [type, target, code, expires]
  );
}

async function verifyOtp(type, target, code) {
  const [rows] = await pool.query(
    `SELECT * 
       FROM otp_codes 
      WHERE type=? AND target=? AND code=? AND verified=FALSE 
      ORDER BY id DESC 
      LIMIT 1`,
    [type, target, code]
  );
  const otp = rows[0];
  if (!otp) return false;
  if (new Date(otp.expires_at).getTime() < Date.now()) return false;
  await pool.query("UPDATE otp_codes SET verified=TRUE WHERE id=?", [otp.id]);
  return true;
}

/** ---------- send email OTP (signup / generic) ---------- */
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const code = genCode();
    await saveOtp("email", email, code);

    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your BudgetMate Email OTP",
      text: `Your OTP is ${code}. It expires in 10 minutes.`,
    });

    res.json({ ok: true, message: "OTP sent to email" });
  } catch (e) {
    console.error("send-email-otp error:", e);
    res.status(500).json({ error: "Failed to send email OTP" });
  }
});

/** ---------- signup (email-only, email OTP required) ---------- */
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, emailOtp } = req.body;

    if (!firstName || !lastName || !email || !password || !emailOtp) {
      return res.status(400).json({ error: "All fields + email OTP required" });
    }

    const emailOk = await verifyOtp("email", email, emailOtp);
    if (!emailOk) return res.status(400).json({ error: "OTP verification failed" });

    const [existing] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (existing.length) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)",
      [firstName, lastName, email, hash]
    );

    res.json({ ok: true, message: "Signup successful" });
  } catch (e) {
    console.error("signup error:", e);
    if (e && e.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Signup failed" });
  }
});

/** ---------- login (email + password) ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.first_name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ ok: true, token, firstName: user.first_name });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

/** ---------- forgot password: send OTP to email ---------- */
router.post("/forgot/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const [rows] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (!rows[0]) return res.status(400).json({ error: "No user with email" });

    const code = genCode();
    await saveOtp("email", email, code);

    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password OTP - BudgetMate",
      text: `Your OTP is ${code}. It expires in 10 minutes.`,
    });

    res.json({ ok: true, message: "Reset OTP sent" });
  } catch (e) {
    console.error("forgot/send-otp error:", e);
    res.status(500).json({ error: "Failed to send reset OTP" });
  }
});

/** ---------- forgot password: verify OTP & reset ---------- */
router.post("/forgot/reset", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const ok = await verifyOtp("email", email, code);
    if (!ok) return res.status(400).json({ error: "Invalid OTP" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=? WHERE email=?", [hash, email]);

    res.json({ ok: true, message: "Password reset successful" });
  } catch (e) {
    console.error("forgot/reset error:", e);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;

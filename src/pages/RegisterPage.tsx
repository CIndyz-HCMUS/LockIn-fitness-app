import React, { useState } from "react";
import "./RegisterPage.css";

interface RegisterProps {
  onSwitchToLogin: () => void;
  onGoNext: (cred: { username: string; password: string; email: string; age: string }) => void;
}

const RegisterPage: React.FC<RegisterProps> = ({
onSwitchToLogin,
onGoNext,
}) => {
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [email, setEmail] = useState("");
const [age, setAge] = useState("");
const [error, setError] = useState<string | null>(null);
 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
  setError("");

  // Trim tất cả để tránh lỗi có khoảng trắng
  const fn = firstName.trim();
  const ln = lastName.trim();
  const pw = password.trim();
  const cpw = confirmPassword.trim();
  const em = email.trim();
  const ag = age.trim();

  // --- Validation ---
  if (!fn || !ln || !pw || !cpw || !em || !ag) {
    setError("Please fill in all fields.");
    return;
  }

  if (pw.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  if (pw !== cpw) {
    setError("The confirmation password does not match.");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(em)) {
    setError("Please enter a valid email address.");
    return;
  }

  if (isNaN(Number(ag)) || Number(ag) <= 0) {
    setError("Please enter a valid age.");
    return;
  }
     onGoNext({ username: fn, password:pw, email: em, age:ag });
}
 
  return (
    <div className="page-bg">
      {/* Logo */}
      <div className="logo-text">LockIn</div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <button className="tab-btn inactive" onClick={onSwitchToLogin}>
          Sign In
        </button>
        <button className="tab-btn active">Sign Up</button>
      </div>

      {/* Card */}
      <div className="form-card">
        <h2 className="form-title">Join fitness community!</h2>

        <form onSubmit={handleSubmit}>

          {/* Two-column name */}
          <div className="row">
            <label className="input-group">
              <span>First Name</span>
              <input
                type="text"
                placeholder="Trang"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>

            <label className="input-group">
              <span>Last Name</span>
              <input
                type="text"
                placeholder="Vu"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </div>

          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

           <label className="input-group">
            <span>Confirm Password</span>
            <input
              type="confirmpassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Email</span>
            <input
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Age</span>
            <input
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>
          {error}

          <button type="submit" className="primary-btn">
            Sign Up
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="google-btn">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="google-icon"
          />
          CONTINUE WITH GOOGLE
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;

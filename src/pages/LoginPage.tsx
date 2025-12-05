import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

type Props = {
  onSwitchToRegister: () => void;
};

const LoginPage: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { setUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      if (!window.lockinAPI?.auth) {
        setMsg("Internal error: API not ready.");
        return;
      }

      const res = await window.lockinAPI.auth.login(username, password);
      if ("error" in res) {
        setMsg(res.error);
      } else {
        setUser({ id: res.user.id, username: res.user.username });
      }
    } catch (err) {
      setMsg("Login error.");
    }
  }

  return (
    <div className="page-bg">
      {/* Logo */}
      <div className="logo-text">LockIn</div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <button className="tab-btn active">Sign In</button>
        <button className="tab-btn inactive" onClick={onSwitchToRegister}>
          Sign Up
        </button>
      </div>

      {/* Form */}
      <div className="form-card">
        <div className="form-title">Welcome back!</div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <span>Username</span>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {msg && <p style={{ color: "red", marginTop: 4 }}>{msg}</p>}

          <button type="submit" className="primary-btn">
            Sign In
          </button>

          <div className="divider">OR</div>

          <button type="button" className="google-btn">
            <img
              className="google-icon"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            CONTINUE WITH GOOGLE
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

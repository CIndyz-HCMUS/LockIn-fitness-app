// src/pages/RegisterPage.tsx
import React, { useState } from "react";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onGoNext: (cred: { username: string; password: string }) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  onGoNext,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ username và mật khẩu.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    onGoNext({ username: username.trim(), password });
  };

  return (
    <div style={pageWrapperStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          LockIn Fitness – Đăng ký
        </h2>

        <Input
          label="Username"
          value={username}
          onChange={setUsername}
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <Input
          label="Nhập lại mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
        />

        {error && (
          <div style={{ color: "red", marginTop: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        <button type="submit" style={primaryButtonStyle}>
          Tiếp tục
        </button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          style={secondaryButtonStyle}
        >
          Đã có tài khoản? Đăng nhập
        </button>
      </form>
    </div>
  );
};

// ==== styles + small input ====

const pageWrapperStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to bottom, #6a89cc, #dcdde1)",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: 400,
  maxWidth: "100%",
  background: "#fff",
  padding: "28px 26px",
  borderRadius: 18,
  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#1976d2",
  color: "#fff",
  fontWeight: 600,
  width: "100%",
};

const secondaryButtonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "8px 10px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#eee",
  width: "100%",
};

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, type = "text", required }) => (
  <label style={{ display: "block", marginBottom: 10 }}>
    <div style={{ marginBottom: 4 }}>{label}</div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 14,
        boxSizing: "border-box",
      }}
    />
  </label>
);

export default RegisterPage;

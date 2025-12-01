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

    if (!window.lockinAPI || !window.lockinAPI.auth) {
      console.error("lockinAPI.auth is not available", window.lockinAPI);
      setMsg("Lỗi nội bộ: API chưa sẵn sàng.");
      return;
    }

    try {
      const res = await window.lockinAPI.auth.login(username, password);
      console.log("login result:", res);
      if ("error" in res) {
        setMsg(res.error);
      } else {
        setUser({ id: res.user.id, username: res.user.username });
      }
    } catch (err) {
      console.error("login error", err);
      setMsg("Có lỗi khi đăng nhập.");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: 240 }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: 240 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Đăng nhập</button>
          <button
            type="button"
            style={{ marginLeft: 8 }}
            onClick={onSwitchToRegister}
          >
            Đăng ký
          </button>
        </div>
      </form>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
};

export default LoginPage;

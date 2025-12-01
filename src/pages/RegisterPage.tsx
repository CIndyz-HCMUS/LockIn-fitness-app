import React, { useState } from "react";

type Props = {
  onSwitchToLogin: () => void;
};

const RegisterPage: React.FC<Props> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!window.lockinAPI || !window.lockinAPI.auth) {
      console.error("lockinAPI.auth is not available", window.lockinAPI);
      setMsg("Lỗi nội bộ: API chưa sẵn sàng.");
      return;
    }

    try {
      const res = await window.lockinAPI.auth.register(username, password);
      console.log("register result:", res);
      if ("error" in res) {
        setMsg(res.error);
      } else {
        setMsg("Tạo tài khoản thành công, hãy đăng nhập.");
      }
    } catch (err) {
      console.error("register error", err);
      setMsg("Có lỗi khi đăng ký.");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleRegister}>
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
          <button type="submit">Đăng ký</button>
          <button
            type="button"
            style={{ marginLeft: 8 }}
            onClick={onSwitchToLogin}
          >
            Về đăng nhập
          </button>
        </div>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default RegisterPage;

// electron/db/userRepo.js

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "users.json");

// Đảm bảo file tồn tại và ít nhất là "[]"
function ensureFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "[]", "utf8");
    return;
  }

  // Nếu file tồn tại nhưng rỗng -> ghi lại "[]"
  const raw = fs.readFileSync(dbPath, "utf8");
  if (!raw.trim()) {
    fs.writeFileSync(dbPath, "[]", "utf8");
  }
}

function loadUsers() {
  ensureFile();

  try {
    const raw = fs.readFileSync(dbPath, "utf8").trim();

    // Nếu vì lý do gì đó vẫn rỗng → trả về mảng rỗng
    if (!raw) return [];

    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      console.warn("users.json không phải mảng, reset về []");
      return [];
    }
    return data;
  } catch (err) {
    console.error("Failed to parse users.json, reset về []", err);
    // Nếu JSON bị hỏng → không cho app crash, trả mảng rỗng
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Failed to write users.json", err);
    return false;
  }
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function registerUser(username, password) {
  const users = loadUsers();

  const existing = users.find((u) => u.username === username);
  if (existing) {
    return { error: "Tên đăng nhập đã tồn tại" };
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };

  users.push(user);
  const ok = saveUsers(users);
  if (!ok) {
    return { error: "Không lưu được dữ liệu người dùng" };
  }

  // Trả về đúng format frontend đang mong đợi
  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

function loginUser(username, password) {
  const users = loadUsers();

  const passwordHash = hashPassword(password);
  const user = users.find(
    (u) => u.username === username && u.passwordHash === passwordHash
  );

  if (!user) {
    return { error: "Sai tên đăng nhập hoặc mật khẩu" };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

// Export cả hai tên phòng trường hợp main.js dùng tên khác
module.exports = {
  registerUser,
  loginUser,
  register: registerUser,
  login: loginUser,
};

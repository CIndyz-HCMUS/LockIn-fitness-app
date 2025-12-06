const fs = require("fs");
const path = require("path");

// ĐƯỜNG DẪN MỚI: data/user/users.json
const DATA_FILE = path.join(__dirname, "..", "data", "user", "users.json");

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readUsers() {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8") || "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function getNextId(list) {
  if (!list.length) return 1;
  return Math.max(...list.map(u => Number(u.id) || 0)) + 1;
}

// Tạo sẵn admin nếu chưa có
function ensureDefaultAdmin() {
  const users = readUsers();
  const hasAdmin = users.some(
    (u) => u.username === "admin" || u.role === "admin"
  );
  if (hasAdmin) return;

  const id = getNextId(users);
  const adminUser = {
    id,
    username: "admin",
    password: "admin123",
    role: "admin",
    locked: false,
    createdAt: new Date().toISOString(),
  };

  users.push(adminUser);
  writeUsers(users);
}

// GỌI 1 LẦN LÚC LOAD MODULE
ensureDefaultAdmin();

// =============== PUBLIC API ===============

function registerUser(username, password, bodyInfo = null) {
  const users = readUsers();

  const existed = users.find((u) => u.username === username);
  if (existed) {
    return { ok: false, error: "Username đã tồn tại" };
  }

  const id = getNextId(users);
  const newUser = {
    id,
    username,
    password,          // (có thể hash sau)
    role: "user",
    locked: false,
    bodyInfo: bodyInfo || null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  return { ok: true, user: newUser };
}

function loginUser(username, password) {
  const users = readUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { ok: false, error: "Sai username hoặc password" };
  }

  if (user.locked) {
    return { ok: false, error: "Tài khoản đã bị khóa" };
  }

  return { ok: true, user };
}

// ====== Dùng cho Admin ======

function getAllUsers() {
  return readUsers();
}

function getUserById(id) {
  const users = readUsers();
  return users.find((u) => String(u.id) === String(id)) || null;
}

function updateUserById(id, patch) {
  const users = readUsers();
  const idx = users.findIndex((u) => String(u.id) === String(id));
  if (idx === -1) return null;

  users[idx] = {
    ...users[idx],
    ...patch,
    id: users[idx].id,   // luôn giữ nguyên id
  };

  writeUsers(users);
  return users[idx];
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
};

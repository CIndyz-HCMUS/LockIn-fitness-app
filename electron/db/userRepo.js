// electron/db/userRepo.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "users.json");

function readJson() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeJson(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Tạo admin mặc định nếu chưa có
 */
function ensureDefaultAdmin() {
  const users = readJson();
  const hasAdmin = users.some(
    (u) => u.role === "admin" || u.username === "admin"
  );
  if (!hasAdmin) {
    const nextId =
      users.length > 0
        ? (Math.max(...users.map((u) => Number(u.id) || 0)) || 0) + 1
        : 1;

    users.push({
      id: nextId,
      username: "admin",
      password: "admin123", // demo, sau có thể đổi
      role: "admin",
      isLocked: false,
    });
    writeJson(users);
    console.log(
      "[userRepo] Created default admin account: admin / admin123"
    );
  }
}

/**
 * Đăng ký user mới
 */
function registerUser(username, password) {
  ensureDefaultAdmin();

  const users = readJson();
  if (users.find((u) => u.username === username)) {
    return { ok: false, error: "Username đã tồn tại" };
  }

  const nextId =
    users.length > 0
      ? (Math.max(...users.map((u) => Number(u.id) || 0)) || 0) + 1
      : 1;

  // đơn giản: nếu username là "admin" thì role = admin
  const role = username === "admin" ? "admin" : "user";

  const user = {
    id: nextId,
    username,
    password,
    role,
    isLocked: false,
  };
  users.push(user);
  writeJson(users);

  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      isLocked: user.isLocked,
    },
  };
}

/**
 * Đăng nhập
 */
function loginUser(username, password) {
  ensureDefaultAdmin();

  const users = readJson();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return { ok: false, error: "Sai username hoặc password" };
  }

  if (user.isLocked) {
    return { ok: false, error: "Tài khoản đã bị khoá bởi admin" };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role || "user",
      isLocked: !!user.isLocked,
    },
  };
}

/* =============== HÀM DÙNG CHO ADMIN =============== */

function getAllUsers() {
  ensureDefaultAdmin();
  const users = readJson();
  // Ẩn password khi trả ra
  return users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role || "user",
    isLocked: !!u.isLocked,
  }));
}

function getUserById(id) {
  ensureDefaultAdmin();
  const users = readJson();
  const user = users.find((u) => Number(u.id) === Number(id));
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role || "user",
    isLocked: !!user.isLocked,
  };
}

function updateUserById(id, patch) {
  ensureDefaultAdmin();
  const users = readJson();
  const idx = users.findIndex((u) => Number(u.id) === Number(id));
  if (idx === -1) return null;

  const allowed = {};
  if (patch.role) allowed.role = patch.role;
  if (typeof patch.isLocked !== "undefined") allowed.isLocked = patch.isLocked;

  users[idx] = {
    ...users[idx],
    ...allowed,
  };

  writeJson(users);

  const u = users[idx];
  return {
    id: u.id,
    username: u.username,
    role: u.role || "user",
    isLocked: !!u.isLocked,
  };
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
};

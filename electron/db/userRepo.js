const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "users.json");

// Tạo file nếu chưa tồn tại
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

function loadUsers() {
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

function saveUsers(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

module.exports = {
  registerUser(username, password) {
    const users = loadUsers();

    if (users.find((u) => u.username === username)) {
      return { error: "User already exists" };
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      passwordHash: hashPassword(password),
      createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsers(users);

    return { ok: true, user: newUser };
  },

  loginUser(username, password) {
    const users = loadUsers();
    const hash = hashPassword(password);

    const user = users.find(
      (u) => u.username === username && u.passwordHash === hash
    );

    if (!user) return { error: "Invalid username or password" };

    return { ok: true, user };
  },
};

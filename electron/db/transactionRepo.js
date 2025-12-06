// electron/db/transactionRepo.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "user",
  "transactions.json"
);

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readData() {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8") || "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((t) => Number(t.id) || 0)) + 1;
}

function addTransaction(payload) {
  const list = readData();
  const id = getNextId(list);

  const now = new Date();

  const tx = {
    id,
    userId: String(payload.userId),
    amount: Number(payload.amount) || 0,
    method: payload.method || "offline",
    status: payload.status || "success",
    description: payload.description || "",
    createdAt: payload.createdAt || now.toISOString(),
  };

  list.push(tx);
  writeData(list);
  return tx;
}

function getByUser(userId) {
  const list = readData();
  return list.filter((t) => String(t.userId) === String(userId));
}

module.exports = {
  addTransaction,
  getByUser,
};

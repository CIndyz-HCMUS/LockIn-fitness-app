const fs = require("fs");
const path = require("path");

const TX_FILE = path.join(__dirname, "transactions.json");

function readTx() {
  try {
    const raw = fs.readFileSync(TX_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeTx(data) {
  fs.writeFileSync(TX_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Thêm transaction
 * tx: { userId, amount, method, status, description, date }
 */
function addTransaction(tx) {
  const list = readTx();
  const nextId =
    list.length > 0
      ? (Math.max(...list.map((t) => Number(t.id) || 0)) || 0) + 1
      : 1;

  const now = new Date();
  const date = tx.date || now.toISOString();

  const record = {
    id: nextId,
    userId: String(tx.userId),
    amount: Number(tx.amount) || 0,
    method: tx.method || "offline",
    status: tx.status || "success",
    description: tx.description || "",
    date,
  };

  list.push(record);
  writeTx(list);
  return record;
}

function getByUser(userId) {
  const list = readTx();
  return list.filter((t) => String(t.userId) === String(userId));
}

module.exports = {
  addTransaction,
  getByUser,
};

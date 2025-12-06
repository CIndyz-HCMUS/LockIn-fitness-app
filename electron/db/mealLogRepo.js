const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "foods", "mealLogs.json");

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
  return Math.max(...items.map(l => Number(l.id) || 0)) + 1;
}

module.exports = {
  getAll() {
    return readData();
  },

  getById(id) {
    const logs = readData();
    return logs.find(l => String(l.id) === String(id)) || null;
  },

  getByUser(userId) {
    const logs = readData();
    return logs.filter(l => String(l.userId) === String(userId));
  },

  /** 
   * ⭐⭐ HÀM QUAN TRỌNG BỊ THIẾU — ĐÃ ĐƯỢC THÊM VÀO
   * Lấy log bữa ăn theo ngày + userId
   */
  getForDate(userId, date) {
    const logs = readData();
    return logs.filter(
      l => String(l.userId) === String(userId) && l.date === date
    );
  },

  create(payload) {
    const logs = readData();
    const id = getNextId(logs);
    const newLog = { id, ...payload };
    logs.push(newLog);
    writeData(logs);
    return newLog;
  },

  update(id, updates) {
    const logs = readData();
    const idx = logs.findIndex(l => String(l.id) === String(id));
    if (idx === -1) return null;

    logs[idx] = { ...logs[idx], ...updates };
    writeData(logs);
    return logs[idx];
  },

  remove(id) {
    const logs = readData();
    const filtered = logs.filter(l => String(l.id) !== String(id));
    const deleted = filtered.length !== logs.length;
    if (deleted) writeData(filtered);
    return deleted;
  }
};

const fs = require("fs");
const path = require("path");

// logs nằm ở: electron/data/activities/activityLogs.json
const DATA_FILE = path.join(  __dirname,  "..", "data", "activities", "activityLogs.json");

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

// ================== CÁC HÀM CHÍNH ==================

function getAll() {
  return readData();
}

function getById(id) {
  const logs = readData();
  return logs.find(l => String(l.id) === String(id)) || null;
}

function getByUser(userId) {
  const logs = readData();
  return logs.filter(l => String(l.userId) === String(userId));
}

/**
 * ⭐ Hàm mà main.js đang gọi:
 *   activityRepo.getLogsForDate(userId, date)
 *   (userId: number/string, date: 'YYYY-MM-DD')
 */
function getLogsForDate(userId, date) {
  const logs = readData();
  return logs.filter(
    l => String(l.userId) === String(userId) && l.date === date
  );
}

// alias cho đẹp, nếu sau này IPC muốn dùng tên getForDate
function getForDate(userId, date) {
  return getLogsForDate(userId, date);
}

function create(payload) {
  const logs = readData();
  const id = getNextId(logs);
  const newLog = { id, ...payload };
  logs.push(newLog);
  writeData(logs);
  return newLog;
}

function update(id, updates) {
  const logs = readData();
  const idx = logs.findIndex(l => String(l.id) === String(id));
  if (idx === -1) return null;

  logs[idx] = { ...logs[idx], ...updates };
  writeData(logs);
  return logs[idx];
}

function remove(id) {
  const logs = readData();
  const filtered = logs.filter(l => String(l.id) !== String(id));
  const deleted = filtered.length !== logs.length;
  if (deleted) writeData(filtered);
  return deleted;
}

module.exports = {
  getAll,
  getById,
  getByUser,
  getLogsForDate,
  getForDate,
  create,
  update,
  remove
};

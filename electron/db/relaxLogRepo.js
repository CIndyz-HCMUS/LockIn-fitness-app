const fs = require("fs");
const path = require("path");

// File JSON để lưu log thư giãn
const DATA_FILE = path.join(__dirname, "relaxLogs.json");

function readJson() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    // nếu file chưa tồn tại
    return [];
  }
}

function writeJson(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Thêm 1 log thư giãn
 * entry: { userId, date, activity, duration, note? }
 */
function addEntry(entry) {
  const logs = readJson();
  const id = logs.length ? logs[logs.length - 1].id + 1 : 1;

  const newEntry = {
    id,
    userId: entry.userId,
    date: entry.date,          // "YYYY-MM-DD"
    activity: entry.activity,  // tên hoạt động
    duration: entry.duration,  // phút
    note: entry.note || "",
  };

  logs.push(newEntry);
  writeJson(logs);
  return newEntry;
}

/**
 * Lấy log thư giãn theo user + ngày
 */
function getForDate(userId, date) {
  const logs = readJson();
  return logs.filter(
    (l) => String(l.userId) === String(userId) && l.date === date
  );
}

/**
 * Xoá 1 log theo id
 */
function deleteEntry(id) {
  const logs = readJson();
  const filtered = logs.filter((l) => l.id !== id);
  writeJson(filtered);
  return true;
}

module.exports = {
  addEntry,
  getForDate,
  deleteEntry,
};

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "dailyLogs.json");

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
 * Lấy log theo user + date (YYYY-MM-DD).
 * Nếu chưa có thì trả về giá trị mặc định.
 */
function getForDate(userId, date) {
  const logs = readJson();
  const found = logs.find(
    (l) => String(l.userId) === String(userId) && l.date === date
  );
  if (found) return found;

  return {
    userId: String(userId),
    date,
    waterMl: 0,
    steps: 0,
    weightKg: 0,
    mood: 3, // 1-5
    note: "",
  };
}

/**
 * Lưu / cập nhật log cho 1 ngày.
 * payload: { userId, date, waterMl, steps, weightKg, mood, note }
 */
function save(payload) {
  const logs = readJson();

  const idx = logs.findIndex(
    (l) =>
      String(l.userId) === String(payload.userId) &&
      l.date === payload.date
  );

  const normalized = {
    userId: String(payload.userId),
    date: payload.date,
    waterMl: Number(payload.waterMl) || 0,
    steps: Number(payload.steps) || 0,
    weightKg: Number(payload.weightKg) || 0,
    mood: Number(payload.mood) || 0,
    note: payload.note || "",
  };

  if (idx >= 0) {
    logs[idx] = normalized;
  } else {
    logs.push(normalized);
  }

  writeJson(logs);
  return normalized;
}

module.exports = {
  getForDate,
  save,
};

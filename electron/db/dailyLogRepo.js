// electron/db/dailyLogRepo.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "user", "dailyLogs.json");

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

// ================== PUBLIC API ==================

function getForDate(userId, date) {
  const logs = readData();
  return (
    logs.find(
      (l) => String(l.userId) === String(userId) && l.date === date
    ) || null
  );
}

/**
 * payload: { userId, date, waterMl, steps, weightKg, mood }
 * Nếu cùng user + date đã tồn tại → merge & overwrite.
 */
function save(payload) {
  const logs = readData();
  const idx = logs.findIndex(
    (l) => String(l.userId) === String(payload.userId) && l.date === payload.date
  );

  const normalized = {
    userId: String(payload.userId),
    date: payload.date,
    waterMl: Number(payload.waterMl) || 0,
    steps: Number(payload.steps) || 0,
    weightKg: payload.weightKg != null ? Number(payload.weightKg) : null,
    mood: payload.mood != null ? Number(payload.mood) : null,
  };

  if (idx >= 0) {
    logs[idx] = { ...logs[idx], ...normalized };
  } else {
    logs.push(normalized);
  }

  writeData(logs);
  return normalized;
}

module.exports = {
  getForDate,
  save,
};

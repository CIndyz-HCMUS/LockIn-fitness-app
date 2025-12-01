const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "mealLogs.json");

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

function loadLogs() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function saveLogs(logs) {
  fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));
}

function getIsoDate(date) {
  // date: string "YYYY-MM-DD" hoặc new Date()
  if (typeof date === "string") return date;
  return new Date(date).toISOString().slice(0, 10);
}
function deleteLog(id) {
  const logs = loadLogs();
  const filtered = logs.filter((l) => l.id !== id);
  saveLogs(filtered);
  return { ok: true };
}

module.exports = {
  addMealEntry({ userId, date, foodId, foodName, unit, quantity, calories }) {
    const logs = loadLogs();
    const entry = {
      id: crypto.randomUUID(),
      userId,
      date: getIsoDate(date),
      foodId,
      foodName,
      unit,
      quantity,
      calories
    };
    logs.push(entry);
    saveLogs(logs);
    return entry;
  },

  getMealsByDate(userId, date) {
    const logs = loadLogs();
    const target = getIsoDate(date);
    const items = logs.filter(
      (l) => l.userId === userId && l.date === target
    );
    const totalCalories = items.reduce((sum, it) => sum + it.calories, 0);
    return { items, totalCalories };
  }
};

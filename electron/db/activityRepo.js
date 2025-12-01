// electron/db/activityRepo.js
const fs = require("fs");
const path = require("path");

const activitiesPath = path.join(__dirname, "..", "data", "activities.json");
const logPath = path.join(__dirname, "..", "data", "activityLogs.json");

if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, JSON.stringify([]));
}

let activities = [];
try {
  if (fs.existsSync(activitiesPath)) {
    activities = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
    console.log("[activityRepo] Loaded", activities.length, "activities.");
  }
} catch (e) {
  console.error("[activityRepo] Failed to load activity list:", e);
}

function loadLogs() {
  return JSON.parse(fs.readFileSync(logPath, "utf8"));
}

function saveLogs(logs) {
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

function deleteLog(id) {
  const logs = loadLogs();
  const filtered = logs.filter((l) => l.id !== id);
  saveLogs(filtered);
  return { ok: true };
}

module.exports = {
  getActivities() {
    return activities;
  },

  addLog(entry) {
    const logs = loadLogs();
    logs.push({ id: Date.now(), ...entry });
    saveLogs(logs);
    return { ok: true };
  },

  getLogsForDate(userId, date) {
    const logs = loadLogs().filter(
      (l) => l.userId === userId && l.date === date
    );
    const total = logs.reduce((t, l) => t + l.calories, 0);
    return { items: logs, totalCalories: total };
  },

  deleteLog,
};

// electron/ipc/admin.ipc.js
const { ipcMain } = require("electron");
const userRepo = require("../db/userRepo");
const fs = require("fs");
const path = require("path");

function readJsonFile(relativePath) {
  try {
    const filePath = path.join(__dirname, "..", relativePath);
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/* =============== USERS =============== */

ipcMain.handle("admin:getUsers", () => {
  const users = userRepo.getAllUsers();
  return users;
});

ipcMain.handle("admin:updateUser", (_event, payload) => {
  // payload: { id, role?, isLocked? }
  const updated = userRepo.updateUserById(payload.id, {
    role: payload.role,
    isLocked: payload.isLocked,
  });
  return updated;
});

ipcMain.handle("admin:getUserById", (_event, id) => {
  const user = userRepo.getUserById(id);
  return user;
});

/* =============== STATS =============== */

ipcMain.handle("admin:getStats", () => {
  const users = userRepo.getAllUsers();

  // các file data theo cấu trúc dự án
  const activities = readJsonFile("data/activities.json");
  const foods = readJsonFile("data/foods.json");
  const activityLogs = readJsonFile("data/activityLogs.json");
  const relaxLogs = readJsonFile("data/relax.json");
  const mealLogs = readJsonFile("db/mealLogs.json");

  return {
    totalUsers: users.length,
    totalAdmins: users.filter((u) => u.role === "admin").length,
    totalLockedUsers: users.filter((u) => u.isLocked).length,
    totalActivities: activities.length,
    totalFoods: foods.length,
    totalActivityLogs: activityLogs.length,
    totalRelaxLogs: relaxLogs.length,
    totalMealLogs: mealLogs.length,
  };
});

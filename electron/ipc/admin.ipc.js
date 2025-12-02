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

function writeJsonFile(relativePath, data) {
  const filePath = path.join(__dirname, "..", relativePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

/* =============== USERS =============== */

ipcMain.handle("admin:getUsers", () => {
  const users = userRepo.getAllUsers();
  return users;
});

ipcMain.handle("admin:updateUser", (_event, payload) => {
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

/* =============== ACTIVITIES CRUD =============== */
// Làm việc trực tiếp với data/activities.json

function readActivities() {
  return readJsonFile("data/activities.json");
}

function writeActivities(list) {
  writeJsonFile("data/activities.json", list);
}

ipcMain.handle("admin:getActivities", () => {
  return readActivities();
});

ipcMain.handle("admin:createActivity", (_event, data) => {
  const list = readActivities();
  const nextId =
    list.length > 0
      ? (Math.max(...list.map((a) => Number(a.id) || 0)) || 0) + 1
      : 1;

  const newAct = {
    id: nextId,
    name: data.name || "",
    category: data.category || "",
    description: data.description || "",
    // giữ nguyên các field khác nếu sau này muốn mở rộng
    ...data,
    id: nextId, // đảm bảo id không bị override
  };

  list.push(newAct);
  writeActivities(list);
  return newAct;
});

ipcMain.handle("admin:updateActivity", (_event, id, patch) => {
  const list = readActivities();
  const idx = list.findIndex((a) => Number(a.id) === Number(id));
  if (idx === -1) return null;

  list[idx] = {
    ...list[idx],
    ...patch,
    id: list[idx].id,
  };

  writeActivities(list);
  return list[idx];
});

ipcMain.handle("admin:deleteActivity", (_event, id) => {
  const list = readActivities();
  const newList = list.filter((a) => Number(a.id) !== Number(id));
  const deleted = newList.length !== list.length;
  if (deleted) {
    writeActivities(newList);
  }
  return { ok: deleted };
});

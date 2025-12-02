const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const userRepo = require("./db/userRepo");
const foodRepo = require("./db/foodRepo");
const mealLogRepo = require("./db/mealLogRepo");
const activityRepo = require("./db/activityRepo");
const relaxLogRepo = require("./db/relaxLogRepo");
const sleepLogRepo = require("./db/sleepLogRepo");
const favoriteFoodRepo = require("./db/favoriteFoodRepo");
const dailyLogRepo = require("./db/dailyLogRepo");
const personalPlanRepo = require("./db/personalPlanRepo");
const transactionRepo = require("./db/transactionRepo");


const isDev = process.env.NODE_ENV === "development";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  console.log("[electron] app ready");
  createWindow();
});

// ==================== AUTH ====================
ipcMain.handle("auth:register", (_, username, password) => {
  return userRepo.registerUser(username, password);
});

ipcMain.handle("auth:login", (_, username, password) => {
  return userRepo.loginUser(username, password);
});

// ==================== MEALS ====================
ipcMain.handle("meals:searchFoods", (_, query) => {
  return foodRepo.searchFoods(query || "");
});
ipcMain.handle("foods:add", (_, payload) => {
  // payload: { name, unit, calories, preparation, carb?, protein?, fat?, fiber?, brand? }
  return foodRepo.addFood(payload);
});
ipcMain.handle("foods:delete", (_, foodId) => {
  return foodRepo.deleteFood(foodId);
});


ipcMain.handle("meals:addEntry", (_, data) => {
  return mealLogRepo.addEntry(data);
});

ipcMain.handle("meals:getForDate", (_, userId, date) => {
  return mealLogRepo.getForDate(userId, date);
});

ipcMain.handle("meals:deleteEntry", (_, id) => {
  return mealLogRepo.deleteEntry(id);
});

// ---- FAVORITES ----
ipcMain.handle("meals:getFavorites", (_, userId) => {
  console.log("[ipc] meals:getFavorites", userId);
  return favoriteFoodRepo.getFavorites(userId);
});

ipcMain.handle("meals:toggleFavorite", (_, userId, foodId) => {
  console.log("[ipc] meals:toggleFavorite", userId, foodId);
  return favoriteFoodRepo.toggleFavorite(userId, foodId);
});
// ------------ADD FOOD------------------



// ==================== ACTIVITY ====================
ipcMain.handle("activity:getList", () => {
  return activityRepo.getActivities();
});

ipcMain.handle("activity:add", (_, payload) => {
  return activityRepo.addLog(payload);
});

ipcMain.handle("activity:getForDate", (_, userId, date) => {
  return activityRepo.getLogsForDate(userId, date);
});

ipcMain.handle("activity:delete", (_, id) => {
  return activityRepo.deleteLog(id);
});

// ==================== RELAX ====================
ipcMain.handle("relax:add", (_, payload) => {
  // payload: { userId, date, activity, duration, note }
  return relaxLogRepo.addEntry(payload);
});

ipcMain.handle("relax:getForDate", (_, userId, date) => {
  return relaxLogRepo.getForDate(userId, date);
});

ipcMain.handle("relax:delete", (_, id) => {
  return relaxLogRepo.deleteEntry(id);
});

// ==================== SLEEP ====================
ipcMain.handle("sleep:add", (_, payload) => {
  // payload: { userId, date, bedtime, wakeTime, duration, quality, note }
  return sleepLogRepo.addEntry(payload);
});

ipcMain.handle("sleep:getForDate", (_, userId, date) => {
  return sleepLogRepo.getForDate(userId, date);
});

ipcMain.handle("sleep:delete", (_, id) => {
  return sleepLogRepo.deleteEntry(id);
});
ipcMain.handle("daily:getForDate", (_, userId, date) => {
  return dailyLogRepo.getForDate(userId, date);
});

ipcMain.handle("daily:save", (_, payload) => {
  return dailyLogRepo.save(payload);
});

// ==================== GOAL (inline) ====================

const GOALS_FILE = path.join(__dirname, "db", "goals.json");

function readGoals() {
  try {
    const raw = fs.readFileSync(GOALS_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeGoals(data) {
  fs.writeFileSync(GOALS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function getGoalForUser(userId) {
  const goals = readGoals();
  return goals.find((g) => String(g.userId) === String(userId)) || null;
}

function saveGoalForUser(goalData) {
  const goals = readGoals();
  const idx = goals.findIndex(
    (g) => String(g.userId) === String(goalData.userId)
  );

  const normalized = {
    userId: String(goalData.userId),
    dailyCalorieGoal: Number(goalData.dailyCalorieGoal) || 0,
    targetWeight: Number(goalData.targetWeight) || 0,
    waterGoal: Number(goalData.waterGoal) || 0,
    stepGoal: Number(goalData.stepGoal) || 0,
  };

  if (idx >= 0) {
    goals[idx] = normalized;
  } else {
    goals.push(normalized);
  }

  writeGoals(goals);
  return normalized;
}

ipcMain.handle("goal:getForUser", (_, userId) => {
  return getGoalForUser(userId);
});

ipcMain.handle("goal:save", (_, payload) => {
  return saveGoalForUser(payload);
});
// ==================== PERSONAL PLAN & TRANSACTION ====================

// ==================== PERSONAL PLAN ====================
ipcMain.handle("plan:getForUser", (_, userId) => {
  return personalPlanRepo.getCurrentPlan(userId);
});

ipcMain.handle("plan:purchase", (_, payload) => {
  const plan = personalPlanRepo.createPlan(payload);

  transactionRepo.addTransaction({
    userId: payload.userId,
    amount: payload.price,
    method: payload.paymentMethod || "offline",
    status: "success",
    description: `Purchase plan ${payload.planType} (${payload.durationMonths} months)`,
  });

  return plan;
});

ipcMain.handle("plan:updateProgress", (_, userId, progress) => {
  return personalPlanRepo.updateProgress(userId, progress);
});

// =========== TRANSACTIONS ===========
ipcMain.handle("transactions:getForUser", (_, userId) => {
  return transactionRepo.getByUser(userId);
});

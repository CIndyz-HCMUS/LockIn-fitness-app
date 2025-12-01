const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const userRepo = require("./db/userRepo");
const foodRepo = require("./db/foodRepo");
const mealLogRepo = require("./db/mealLogRepo");
const activityRepo = require("./db/activityRepo");

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

app.whenReady().then(createWindow);

// AUTH
ipcMain.handle("auth:register", (_, username, password) => {
  return userRepo.registerUser(username, password);
});

ipcMain.handle("auth:login", (_, username, password) => {
  return userRepo.loginUser(username, password);
});

// MEAL
ipcMain.handle("meals:searchFoods", (_, query) => {
  return foodRepo.searchFoods(query || "");
});

ipcMain.handle("meals:addEntry", (_, data) => {
  return mealLogRepo.addMealEntry(data);
});

ipcMain.handle("meals:getForDate", (_, userId, date) => {
  return mealLogRepo.getMealsByDate(userId, date);
});

// ACTIVITY
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
const { contextBridge, ipcRenderer } = require("electron");

const api = {
  // ---------- AUTH ----------
  auth: {
  register(username, password, body) {
    // body: { gender, heightCm, weightKg, birthYear }
    return ipcRenderer.invoke("auth:register", username, password, body);
  },
  login(username, password) {
    return ipcRenderer.invoke("auth:login", username, password);
  },
},


  // ---------- FOODS ----------
  foods: {
    add(data) {
      return ipcRenderer.invoke("foods:add", data);
    },
    delete(id) {
      return ipcRenderer.invoke("foods:delete", id);
    },
  },

  // ---------- MEALS ----------
  meals: {
    searchFoods(query) {
      return ipcRenderer.invoke("meals:searchFoods", query);
    },
    addEntry(data) {
      return ipcRenderer.invoke("meals:addEntry", data);
    },
    getForDate(userId, date) {
      return ipcRenderer.invoke("meals:getForDate", userId, date);
    },
    deleteEntry(id) {
      return ipcRenderer.invoke("meals:deleteEntry", id);
    },
    getFavorites(userId) {
      return ipcRenderer.invoke("meals:getFavorites", userId);
    },
    toggleFavorite(userId, foodId) {
      return ipcRenderer.invoke("meals:toggleFavorite", userId, foodId);
    },
  },

  // ---------- ACTIVITY ----------
  activity: {
    getList() {
      return ipcRenderer.invoke("activity:getList");
    },
    add(payload) {
      return ipcRenderer.invoke("activity:add", payload);
    },
    getForDate(userId, date) {
      return ipcRenderer.invoke("activity:getForDate", userId, date);
    },
    delete(id) {
      return ipcRenderer.invoke("activity:delete", id);
    },
  },

  // ---------- RELAX ----------
  relax: {
    add(entry) {
      // { userId, date, activity, duration, note }
      return ipcRenderer.invoke("relax:add", entry);
    },
    getForDate(userId, date) {
      return ipcRenderer.invoke("relax:getForDate", userId, date);
    },
    delete(id) {
      return ipcRenderer.invoke("relax:delete", id);
    },
  },

  // ---------- SLEEP ----------
  sleep: {
    add(entry) {
      // { userId, date, bedtime, wakeTime, duration, quality, note }
      return ipcRenderer.invoke("sleep:add", entry);
    },
    getForDate(userId, date) {
      return ipcRenderer.invoke("sleep:getForDate", userId, date);
    },
    delete(id) {
      return ipcRenderer.invoke("sleep:delete", id);
    },
  },

  // ---------- GOAL ----------
  goal: {
    getForUser(userId) {
      return ipcRenderer.invoke("goal:getForUser", userId);
    },
    save(payload) {
      // { userId, dailyCalorieGoal, targetWeight, waterGoal, stepGoal }
      return ipcRenderer.invoke("goal:save", payload);
    },
  },

  // ---------- DAILY ----------
  daily: {
    getForDate(userId, date) {
      return ipcRenderer.invoke("daily:getForDate", userId, date);
    },
    save(payload) {
      return ipcRenderer.invoke("daily:save", payload);
    },
  },

  // ---------- PLAN ----------
  plan: {
    getForUser(userId) {
      return ipcRenderer.invoke("plan:getForUser", userId);
    },
    purchase(payload) {
      return ipcRenderer.invoke("plan:purchase", payload);
    },
    updateProgress(userId, progress) {
      return ipcRenderer.invoke("plan:updateProgress", userId, progress);
    },
  },

  // ---------- TRANSACTIONS ----------
  transactions: {
    getForUser(userId) {
      return ipcRenderer.invoke("transactions:getForUser", userId);
    },
  },
};

// expose dưới cả 2 tên cho code cũ / mới
contextBridge.exposeInMainWorld("api", api);
contextBridge.exposeInMainWorld("lockinAPI", api);

// shortcut cho auth (dùng cho authService)
contextBridge.exposeInMainWorld("authAPI", api.auth);

// ADMIN API (dùng cho adminService / AdminPage)
// ADMIN API (dùng cho adminService / AdminPage)
contextBridge.exposeInMainWorld("adminAPI", {
  // Users & stats
  getStats: () => ipcRenderer.invoke("admin:getStats"),
  getUsers: () => ipcRenderer.invoke("admin:getUsers"),
  getUserById: (id) => ipcRenderer.invoke("admin:getUserById", id),
  updateUser: (payload) => ipcRenderer.invoke("admin:updateUser", payload),

  // 🔥 Activity CRUD cho admin
  getActivities: () => ipcRenderer.invoke("admin:getActivities"),
  createActivity: (data) => ipcRenderer.invoke("admin:createActivity", data),
  updateActivity: (id, data) =>
    ipcRenderer.invoke("admin:updateActivity", id, data),
  deleteActivity: (id) => ipcRenderer.invoke("admin:deleteActivity", id),
});


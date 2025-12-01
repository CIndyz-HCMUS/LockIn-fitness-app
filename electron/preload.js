// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

try {
  contextBridge.exposeInMainWorld("lockinAPI", {
    auth: {
      register: (u, p) => ipcRenderer.invoke("auth:register", u, p),
      login: (u, p) => ipcRenderer.invoke("auth:login", u, p),
    },

    meals: {
      searchFoods: (q) => ipcRenderer.invoke("meals:searchFoods", q),
      addEntry: (payload) => ipcRenderer.invoke("meals:addEntry", payload),
      getForDate: (userId, date) =>
        ipcRenderer.invoke("meals:getForDate", userId, date),
      deleteEntry: (id) => ipcRenderer.invoke("meals:deleteEntry", id),
    },

    activity: {
      getList: () => ipcRenderer.invoke("activity:getList"),
      getForDate: (userId, date) =>
        ipcRenderer.invoke("activity:getForDate", userId, date),
      add: (payload) => ipcRenderer.invoke("activity:add", payload),
      delete: (id) => ipcRenderer.invoke("activity:delete", id),
    },
  });
} catch (e) {
  console.error("Failed to expose lockinAPI:", e);
}

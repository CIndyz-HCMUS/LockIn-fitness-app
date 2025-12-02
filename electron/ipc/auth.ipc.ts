// electron/ipc/auth.ipc.ts
import { ipcMain } from "electron";
const userRepo = require("../db/userRepo");

/**
 * Đăng ký
 * payload: { username, password }
 */
ipcMain.handle(
  "auth:register",
  async (_event, payload: { username: string; password: string }) => {
    const result = userRepo.registerUser(payload.username, payload.password);
    return result;
  }
);

/**
 * Đăng nhập
 * payload: { username, password }
 */
ipcMain.handle(
  "auth:login",
  async (_event, payload: { username: string; password: string }) => {
    const result = userRepo.loginUser(payload.username, payload.password);
    return result;
  }
);

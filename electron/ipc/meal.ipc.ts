import { ipcMain } from "electron";

// Dùng require vì mealLogRepo là file .js (CommonJS)
const mealLogRepo = require("../db/mealLogRepo");

/**
 * Đăng ký toàn bộ IPC liên quan tới "meal logs"
 * Gọi hàm này trong main.js sau khi app sẵn sàng.
 */
export function registerMealIpc() {
  // Thêm 1 log bữa ăn
  // payload:
  // {
  //   userId: string,
  //   date: string (YYYY-MM-DD),
  //   foodId?: string,
  //   foodName: string,
  //   unit: string,
  //   quantity: number,
  //   calories: number
  // }
  ipcMain.handle("meals:addEntry", async (_event, payload) => {
    return mealLogRepo.addEntry(payload);
  });

  // Alias cho tên cũ nếu phía renderer đang dùng
  ipcMain.handle("meals:addMealEntry", async (_event, payload) => {
    return mealLogRepo.addMealEntry(payload);
  });

  // Lấy log bữa ăn theo ngày cho 1 user
  ipcMain.handle("meals:getForDate", async (_event, userId: string, date: string) => {
    return mealLogRepo.getForDate(userId, date);
  });

  // Alias cho tên cũ nếu renderer đang gọi
  ipcMain.handle("meals:getMealsByDate", async (_event, userId: string, date: string) => {
    return mealLogRepo.getMealsByDate(userId, date);
  });

  // Xoá một entry theo id
  ipcMain.handle("meals:deleteEntry", async (_event, id: number) => {
    return mealLogRepo.deleteEntry(id);
  });
}

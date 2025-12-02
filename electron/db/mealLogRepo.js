const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "mealLogs.json");

function readJson() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeJson(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Thêm 1 log bữa ăn
 * payload: {
 *   userId, date, foodId, foodName, unit, quantity, calories,
 *   carb?, protein?, fat?, fiber?
 * }
 */
function addEntry(payload) {
  const logs = readJson();
  const nextId =
    logs.length > 0
      ? (Math.max(...logs.map((l) => Number(l.id) || 0)) || 0) + 1
      : 1;

  const entry = {
    id: nextId,
    userId: String(payload.userId),
    date: payload.date, // YYYY-MM-DD
    foodId: payload.foodId,
    foodName: payload.foodName,
    unit: payload.unit,
    quantity: Number(payload.quantity) || 0,
    calories: Number(payload.calories) || 0,
    carb:
      payload.carb != null && payload.carb !== ""
        ? Number(payload.carb)
        : null,
    protein:
      payload.protein != null && payload.protein !== ""
        ? Number(payload.protein)
        : null,
    fat:
      payload.fat != null && payload.fat !== ""
        ? Number(payload.fat)
        : null,
    fiber:
      payload.fiber != null && payload.fiber !== ""
        ? Number(payload.fiber)
        : null,
  };

  logs.push(entry);
  writeJson(logs);
  return entry;
}

/**
 * Lấy log bữa ăn theo user + ngày, kèm tổng macro
 */
function getForDate(userId, date) {
  const logs = readJson().filter(
    (l) => String(l.userId) === String(userId) && l.date === date
  );

  const totals = logs.reduce(
    (acc, l) => {
      acc.totalCalories += l.calories || 0;
      acc.totalCarb += l.carb || 0;
      acc.totalProtein += l.protein || 0;
      acc.totalFat += l.fat || 0;
      acc.totalFiber += l.fiber || 0;
      return acc;
    },
    {
      totalCalories: 0,
      totalCarb: 0,
      totalProtein: 0,
      totalFat: 0,
      totalFiber: 0,
    }
  );

  return {
    ...totals,
    items: logs,
  };
}

/**
 * Xoá 1 log
 */
function deleteEntry(id) {
  const logs = readJson();
  const newLogs = logs.filter((l) => String(l.id) !== String(id));
  writeJson(newLogs);
  return { ok: true };
}

module.exports = {
  addEntry,
  getForDate,
  deleteEntry,
};

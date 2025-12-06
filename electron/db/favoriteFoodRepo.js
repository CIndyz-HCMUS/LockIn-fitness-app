// electron/db/favoriteFoodRepo.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "foods",
  "favoriteFoods.json"
);

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readData() {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8") || "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Mỗi record: { userId, foodId }
function getFavorites(userId) {
  const list = readData();
  return list.filter((x) => String(x.userId) === String(userId));
}

function toggleFavorite(userId, foodId) {
  const list = readData();
  const idx = list.findIndex(
    (x) =>
      String(x.userId) === String(userId) && String(x.foodId) === String(foodId)
  );

  if (idx >= 0) {
    // đang có → bỏ
    list.splice(idx, 1);
  } else {
    list.push({ userId: String(userId), foodId: String(foodId) });
  }

  writeData(list);
  return getFavorites(userId);
}

module.exports = {
  getFavorites,
  toggleFavorite,
};

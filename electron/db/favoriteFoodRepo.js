const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "favoriteFoods.json");

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
 * Lấy danh sách foodId ưa thích của 1 user
 */
function getFavorites(userId) {
  const all = readJson();
  const record = all.find((r) => String(r.userId) === String(userId));
  if (!record) return [];
  return record.foodIds || [];
}

/**
 * Toggle ưa thích: nếu đang có thì bỏ, chưa có thì thêm
 */
function toggleFavorite(userId, foodId) {
  const all = readJson();
  const uid = String(userId);
  const fid = String(foodId);

  let record = all.find((r) => String(r.userId) === uid);
  if (!record) {
    record = { userId: uid, foodIds: [] };
    all.push(record);
  }

  const idx = record.foodIds.findIndex((id) => String(id) === fid);
  if (idx >= 0) {
    // đang favorite -> bỏ
    record.foodIds.splice(idx, 1);
  } else {
    record.foodIds.push(fid);
  }

  writeJson(all);
  return record.foodIds;
}

module.exports = {
  getFavorites,
  toggleFavorite,
};

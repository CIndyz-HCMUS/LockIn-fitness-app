// electron/db/foodRepo.js
const fs = require("fs");
const path = require("path");

// Data chính nằm ở: electron/data/foods/foods.json
const DATA_FILE = path.join(__dirname, "..", "data", "foods", "foods.json");

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

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((f) => Number(f.id) || 0)) + 1;
}

// ================== HÀM CHÍNH ==================

function getAll() {
  return readData();
}

function getById(id) {
  const list = readData();
  return list.find((f) => String(f.id) === String(id)) || null;
}

/**
 * Tìm kiếm thức ăn theo tên / brand.
 * query rỗng => trả toàn bộ.
 */
function searchFoods(query) {
  const list = readData();
  const q = (query || "").trim().toLowerCase();
  if (!q) return list;

  return list.filter((f) => {
    const name = (f.name || "").toLowerCase();
    const brand = (f.brand || "").toLowerCase();
    return name.includes(q) || brand.includes(q);
  });
}

/**
 * Thêm một food mới.
 * payload: { name, unit, calories, preparation, carb?, protein?, fat?, fiber?, brand? }
 */
function addFood(payload) {
  const list = readData();
  const id = getNextId(list);

  const newFood = {
    id,
    name: payload.name,
    unit: payload.unit || "",
    calories: Number(payload.calories) || 0,
    preparation: payload.preparation || "",
    carb: payload.carb != null ? Number(payload.carb) : null,
    protein: payload.protein != null ? Number(payload.protein) : null,
    fat: payload.fat != null ? Number(payload.fat) : null,
    fiber: payload.fiber != null ? Number(payload.fiber) : null,
    brand: payload.brand || "",
  };

  list.push(newFood);
  writeData(list);
  return newFood;
}

function updateFood(id, updates) {
  const list = readData();
  const idx = list.findIndex((f) => String(f.id) === String(id));
  if (idx === -1) return null;

  list[idx] = {
    ...list[idx],
    ...updates,
    id: list[idx].id,
  };

  // chuẩn hoá lại số
  if (list[idx].calories != null)
    list[idx].calories = Number(list[idx].calories) || 0;
  ["carb", "protein", "fat", "fiber"].forEach((k) => {
    if (list[idx][k] != null) list[idx][k] = Number(list[idx][k]) || 0;
  });

  writeData(list);
  return list[idx];
}

function deleteFood(id) {
  const list = readData();
  const filtered = list.filter((f) => String(f.id) !== String(id));
  const deleted = filtered.length !== list.length;
  if (deleted) writeData(filtered);
  return deleted;
}

// alias CRUD
function create(payload) {
  return addFood(payload);
}

function remove(id) {
  return deleteFood(id);
}

module.exports = {
  getAll,
  getById,
  searchFoods,
  addFood,
  updateFood,
  deleteFood,
  create,
  remove,
};

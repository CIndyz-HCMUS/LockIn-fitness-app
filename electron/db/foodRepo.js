const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/foods.json");

function readJson() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function writeJson(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Tìm món ăn theo tên / brand
 */
function searchFoods(query = "") {
  const foods = readJson();
  if (!query.trim()) return foods;

  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);

  return foods.filter((item) =>
    keywords.every(
      (k) =>
        item.name.toLowerCase().includes(k) ||
        (item.brand && item.brand.toLowerCase().includes(k))
    )
  );
}

/**
 * Thêm món ăn mới (từ người dùng)
 * payload: { name, unit, calories, preparation, carb?, protein?, fat?, fiber?, brand? }
 */
function addFood(payload) {
  const foods = readJson();
  const nextId =
    foods.length > 0
      ? (Math.max(...foods.map((f) => Number(f.id) || 0)) || 0) + 1
      : 1;

  const newFood = {
    id: nextId,
    name: String(payload.name || "").trim(),
    unit: String(payload.unit || "100g"),
    calories: Number(payload.calories) || 0,
    preparation: payload.preparation || "cooked",
    brand: payload.brand || null,
    carb: payload.carb != null ? Number(payload.carb) : undefined,
    protein: payload.protein != null ? Number(payload.protein) : undefined,
    fat: payload.fat != null ? Number(payload.fat) : undefined,
    fiber: payload.fiber != null ? Number(payload.fiber) : undefined,
  };

  foods.push(newFood);
  writeJson(foods);
  return newFood;
}

/**
 * Xoá 1 món ăn khỏi database
 */
function deleteFood(id) {
  const foods = readJson();
  const newFoods = foods.filter((f) => String(f.id) !== String(id));
  writeJson(newFoods);
  return { ok: true };
}

module.exports = {
  searchFoods,
  addFood,
  deleteFood, // 🚨 quan trọng: export đúng tên
};

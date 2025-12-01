// electron/db/foodRepo.js
const path = require("path");
const fs = require("fs");

// __dirname = .../electron/db
// => .../electron/data/foods.json
const foodsPath = path.join(__dirname, "..", "data", "foods.json");

let foods = [];

try {
  if (fs.existsSync(foodsPath)) {
    const raw = fs.readFileSync(foodsPath, "utf8");
    foods = JSON.parse(raw);
    console.log("[foodRepo] Loaded", foods.length, "foods from", foodsPath);
  } else {
    console.warn("[foodRepo] foods.json NOT FOUND at", foodsPath);
  }
} catch (e) {
  console.error("[foodRepo] Failed to load foods.json:", e);
}

function searchFoods(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return foods;
  return foods.filter((f) => f.name.toLowerCase().includes(q));
}

module.exports = {
  getAllFoods() {
    return foods;
  },
  searchFoods
};

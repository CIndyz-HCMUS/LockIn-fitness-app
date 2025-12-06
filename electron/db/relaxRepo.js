// electron/db/relaxRepo.js
const fs = require("fs");
const path = require("path");

// relax master nằm trong electron/data/relax/relax.json
const DATA_FILE = path.join(__dirname, "..", "data", "relax", "relax.json");

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
  return Math.max(...items.map((r) => Number(r.id) || 0)) + 1;
}

// ============= PUBLIC API =============

function getAll() {
  return readData();
}

function getById(id) {
  const list = readData();
  return list.find((r) => String(r.id) === String(id)) || null;
}

function addRelaxType(payload) {
  const list = readData();
  const id = getNextId(list);

  const relax = {
    id,
    name: payload.name,
    description: payload.description || "",
  };

  list.push(relax);
  writeData(list);
  return relax;
}

function updateRelaxType(id, updates) {
  const list = readData();
  const idx = list.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return null;

  list[idx] = { ...list[idx], ...updates, id: list[idx].id };
  writeData(list);
  return list[idx];
}

function deleteRelaxType(id) {
  const list = readData();
  const filtered = list.filter((r) => String(r.id) !== String(id));
  const deleted = filtered.length !== list.length;
  if (deleted) writeData(filtered);
  return deleted;
}

module.exports = {
  getAll,
  getById,
  addRelaxType,
  updateRelaxType,
  deleteRelaxType,
};

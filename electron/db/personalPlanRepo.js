// electron/db/personalPlanRepo.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "user",
  "personalPlans.json"
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

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((p) => Number(p.id) || 0)) + 1;
}

function getCurrentPlan(userId) {
  const plans = readData();
  // đơn giản: lấy plan mới nhất của user
  const userPlans = plans
    .filter((p) => String(p.userId) === String(userId))
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return userPlans[0] || null;
}

function createPlan(payload) {
  const plans = readData();
  const id = getNextId(plans);

  const now = new Date();
  const startDate = payload.startDate || now.toISOString().slice(0, 10); // yyyy-mm-dd

  const plan = {
    id,
    userId: String(payload.userId),
    planType: payload.planType, // basic / premium / ...
    durationMonths: Number(payload.durationMonths) || 1,
    price: Number(payload.price) || 0,
    startDate,
    progress: Number(payload.progress) || 0,
    status: "active",
  };

  plans.push(plan);
  writeData(plans);
  return plan;
}

function updateProgress(userId, progress) {
  const plans = readData();
  const plan = getCurrentPlan(userId);
  if (!plan) return null;

  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx === -1) return null;

  plans[idx].progress = Number(progress) || 0;
  writeData(plans);
  return plans[idx];
}

module.exports = {
  getCurrentPlan,
  createPlan,
  updateProgress,
};

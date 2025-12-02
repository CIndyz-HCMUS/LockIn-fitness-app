const fs = require("fs");
const path = require("path");

const PLAN_FILE = path.join(__dirname, "personalPlans.json");

function readPlans() {
  try {
    const raw = fs.readFileSync(PLAN_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writePlans(data) {
  fs.writeFileSync(PLAN_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Lấy gói hiện tại của user (nếu có)
 */
function getCurrentPlan(userId) {
  const plans = readPlans();
  const found = plans.find(
    (p) => String(p.userId) === String(userId) && p.status === "active"
  );
  return found || null;
}

/**
 * Tạo / mua 1 gói mới cho user
 * payload: { userId, planType, durationMonths, price }
 */
function createPlan(payload) {
  const plans = readPlans();

  // Hủy kích hoạt các gói cũ
  for (const p of plans) {
    if (String(p.userId) === String(payload.userId) && p.status === "active") {
      p.status = "expired";
    }
  }

  const now = new Date();
  const purchaseDate = now.toISOString().slice(0, 10);

  const expire = new Date(now);
  expire.setMonth(expire.getMonth() + (payload.durationMonths || 1));
  const expirationDate = expire.toISOString().slice(0, 10);

  const nextId =
    plans.length > 0
      ? (Math.max(...plans.map((p) => Number(p.id) || 0)) || 0) + 1
      : 1;

  const plan = {
    id: nextId,
    userId: String(payload.userId),
    planType: payload.planType, // "weight_loss" | "muscle_gain" | "balanced"
    durationMonths: Number(payload.durationMonths) || 1,
    price: Number(payload.price) || 0,
    progress: 0,
    status: "active",
    purchaseDate,
    expirationDate,
  };

  plans.push(plan);
  writePlans(plans);
  return plan;
}

/**
 * Cập nhật tiến độ plan hiện tại
 */
function updateProgress(userId, progress) {
  const plans = readPlans();
  const p = plans.find(
    (pl) => String(pl.userId) === String(userId) && pl.status === "active"
  );
  if (!p) return null;
  p.progress = Math.min(100, Math.max(0, Number(progress) || 0));
  writePlans(plans);
  return p;
}

/**
 * Lấy tất cả plan của user (lịch sử)
 */
function getAllForUser(userId) {
  const plans = readPlans();
  return plans.filter((p) => String(p.userId) === String(userId));
}

module.exports = {
  getCurrentPlan,
  createPlan,
  updateProgress,
  getAllForUser,
};

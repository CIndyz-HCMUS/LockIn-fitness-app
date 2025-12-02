import React, { useEffect, useState } from "react";

interface DashboardPageProps {
  userId: string;
}

interface MealLog {
  id: number;
  calories?: number;
  carb?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
}

interface ActivityLog {
  id: number;
  calories?: number;
}

interface RelaxLog {
  id: number;
  duration?: number;
}

interface SleepLog {
  id: number;
  duration?: number;
  quality?: number;
}

interface DailyLog {
  waterMl: number;
  steps: number;
  weightKg: number;
  mood: number;
}

interface GoalData {
  dailyCalorieGoal: number;
  waterGoal: number;
  stepGoal: number;
  targetWeight: number;
}

interface PlanSummary {
  id: number;
  userId: string;
  planType: "weight_loss" | "muscle_gain" | "balanced";
  durationMonths: number;
  price: number;
  progress: number;
  status: "active" | "expired";
  purchaseDate: string;
  expirationDate: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userId }) => {
  const api = (window as any).lockinAPI || (window as any).api;
  const today = new Date().toISOString().slice(0, 10);

  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [relaxLogs, setRelaxLogs] = useState<RelaxLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [daily, setDaily] = useState<DailyLog | null>(null);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mealRes, actRes, relaxRes, sleepRes, dailyRes, goalRes] =
        await Promise.all([
          api.meals.getForDate(userId, today),
          api.activity.getForDate(userId, today),
          api.relax.getForDate(userId, today),
          api.sleep.getForDate(userId, today),
          api.daily.getForDate(userId, today),
          api.goal.getForUser(userId),
        ]);

      setMealLogs(mealRes.items || []);
      setActivityLogs(actRes.items || []);
      setRelaxLogs(relaxRes.items || []);
      setSleepLogs(sleepRes.items || []);
      setDaily(dailyRes || null);

      if (goalRes) {
        setGoal({
          dailyCalorieGoal: goalRes.dailyCalorieGoal,
          waterGoal: goalRes.waterGoal,
          stepGoal: goalRes.stepGoal,
          targetWeight: goalRes.targetWeight,
        });
      } else {
        setGoal(null);
      }

      // Tải plan nếu API có
      if (api.plan && api.plan.getForUser) {
        const planRes = await api.plan.getForUser(userId);
        setPlan(planRes || null);
      } else {
        setPlan(null);
      }
    } catch (e) {
      console.error("dashboard load error", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ======== CALCULATIONS ========
  const totalMealCalories = mealLogs.reduce(
    (s, m) => s + (m.calories || 0),
    0
  );
  const totalActivityCalories = activityLogs.reduce(
    (s, a) => s + (a.calories || 0),
    0
  );
  const netCalories = totalMealCalories - totalActivityCalories;

  const totalCarb = mealLogs.reduce((s, m) => s + (m.carb || 0), 0);
  const totalProtein = mealLogs.reduce((s, m) => s + (m.protein || 0), 0);
  const totalFat = mealLogs.reduce((s, m) => s + (m.fat || 0), 0);
  const totalFiber = mealLogs.reduce((s, m) => s + (m.fiber || 0), 0);

  const relaxMinutes = relaxLogs.reduce((s, r) => s + (r.duration || 0), 0);
  const sleepHours = sleepLogs.reduce((s, sl) => s + (sl.duration || 0), 0);
  const mood = daily?.mood || 3;
  const weight = daily?.weightKg || 0;
  const water = daily?.waterMl || 0;
  const steps = daily?.steps || 0;

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <h3>Ngày {today}</h3>

      {/* Tóm tắt gói cá nhân */}
      <section style={{ marginBottom: 16 }}>
        <h4>Gói cá nhân</h4>
        {plan ? (
          <p>
            Bạn đang sử dụng gói{" "}
            <b>
              {plan.planType === "weight_loss"
                ? "Giảm cân"
                : plan.planType === "muscle_gain"
                ? "Tăng cơ"
                : "Cân bằng"}
            </b>{" "}
            ({plan.durationMonths} tháng), hết hạn ngày{" "}
            <b>{plan.expirationDate}</b>, tiến độ hiện tại{" "}
            <b>{plan.progress}%</b>.
          </p>
        ) : (
          <p>
            Bạn chưa có gói hoạt động. Vào tab <b>Gói cá nhân</b> để đăng ký.
          </p>
        )}
      </section>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <>
          <hr />

          {/* CALORIES */}
          <h2>Năng lượng</h2>
          <p>
            Ăn vào: <b>{totalMealCalories}</b> kcal
          </p>
          <p>
            Đốt cháy: <b>{totalActivityCalories}</b> kcal
          </p>
          <p>
            Net:{" "}
            <b style={{ color: netCalories > 0 ? "red" : "green" }}>
              {netCalories} kcal
            </b>
          </p>

          {/* MACRO */}
          <h2>Macro hôm nay</h2>
          <p>
            Carb: <b>{totalCarb} g</b>
          </p>
          <p>
            Protein: <b>{totalProtein} g</b>
          </p>
          <p>
            Fat: <b>{totalFat} g</b>
          </p>
          <p>
            Fiber: <b>{totalFiber} g</b>
          </p>

          <hr />

          {/* WATER / STEPS / WEIGHT / MOOD */}
          <h2>Nhật ký ngày</h2>
          <p>
            Nước: <b>{water} ml</b> / Goal {goal?.waterGoal ?? 0} ml
          </p>
          <p>
            Bước chân: <b>{steps}</b> bước / Goal {goal?.stepGoal ?? 0}
          </p>
          <p>
            Cân nặng hôm nay: <b>{weight} kg</b>{" "}
            {goal ? `(Target ${goal.targetWeight} kg)` : ""}
          </p>
          <p>
            Tâm trạng: <b>{mood} / 5</b>
          </p>

          <hr />

          {/* RELAX */}
          <h2>Thư giãn</h2>
          <p>
            Tổng: <b>{relaxMinutes}</b> phút
          </p>

          {/* SLEEP */}
          <h2>Giấc ngủ</h2>
          <p>
            Tổng thời gian ngủ: <b>{sleepHours}</b> giờ
          </p>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

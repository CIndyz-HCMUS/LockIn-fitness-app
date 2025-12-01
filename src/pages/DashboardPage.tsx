import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
};

const DashboardPage: React.FC<Props> = ({ userId }) => {
  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const [mealTotal, setMealTotal] = useState(0);
  const [activityTotal, setActivityTotal] = useState(0);

  const net = mealTotal - activityTotal;

  async function loadData() {
    const [meals, acts] = await Promise.all([
      window.lockinAPI.meals.getForDate(userId, date),
      window.lockinAPI.activity.getForDate(userId, date),
    ]);

    setMealTotal(meals.totalCalories);
    setActivityTotal(acts.totalCalories);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getComment() {
    if (net < 0) return "Bạn đốt nhiều hơn ăn vào hôm nay. Nice!";
    if (net < 300) return "Net calories khá thấp, khá ổn để giữ cân.";
    if (net < 800)
      return "Net hơi cao, nếu muốn giảm cân thì bớt ăn hoặc tăng hoạt động nhẹ.";
    return "Net khá cao, cân nhắc giảm khẩu phần hoặc tập thêm nhé.";
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard hôm nay ({date})</h2>

      <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
        <div
          style={{
            border: "1px solid #ddd",
            padding: 16,
            borderRadius: 8,
            minWidth: 180,
          }}
        >
          <h3>Ăn vào</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{mealTotal} kcal</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: 16,
            borderRadius: 8,
            minWidth: 180,
          }}
        >
          <h3>Tiêu hao</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>
            {activityTotal} kcal
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: 16,
            borderRadius: 8,
            minWidth: 180,
          }}
        >
          <h3>Net</h3>
          <p
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: net > 0 ? "orange" : "green",
            }}
          >
            {net} kcal
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Nhận xét nhanh</h3>
        <p>{getComment()}</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={loadData}>Refresh</button>
      </div>
    </div>
  );
};

export default DashboardPage;

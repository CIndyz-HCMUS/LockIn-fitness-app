import React, { useEffect, useState } from "react";

interface WeeklyReportPageProps {
  userId: string;
}

interface DaySummary {
  date: string;
  mealCalories: number;
  activityCalories: number;
  netCalories: number;
  waterMl: number;
  steps: number;
  sleepHours: number;
  relaxMinutes: number;
  weightKg: number;
  mood: number;
}

const WeeklyReportPage: React.FC<WeeklyReportPageProps> = ({ userId }) => {
  const api = (window as any).lockinAPI || (window as any).api;
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  // tạo danh sách 7 ngày gần nhất (hôm nay lùi về 6 ngày trước)
  function buildLast7Dates(): string[] {
    const result: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().slice(0, 10));
    }

    return result;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const dates = buildLast7Dates();

      const allDays: DaySummary[] = [];

      for (const date of dates) {
        const [
          mealRes,
          actRes,
          relaxRes,
          sleepRes,
          dailyRes,
        ] = await Promise.all([
          api.meals.getForDate(userId, date),
          api.activity.getForDate(userId, date),
          api.relax.getForDate(userId, date),
          api.sleep.getForDate(userId, date),
          api.daily.getForDate(userId, date),
        ]);

        const meals = mealRes.items || [];
        const activities = actRes.items || [];
        const relaxes = relaxRes.items || [];
        const sleeps = sleepRes.items || [];

        const mealCalories = meals.reduce(
          (s: number, m: any) => s + (m.calories || 0),
          0
        );
        const activityCalories = activities.reduce(
          (s: number, a: any) => s + (a.calories || 0),
          0
        );
        const netCalories = mealCalories - activityCalories;
        const relaxMinutes = relaxes.reduce(
          (s: number, r: any) => s + (r.duration || 0),
          0
        );
        const sleepHours = sleeps.reduce(
          (s: number, sl: any) => s + (sl.duration || 0),
          0
        );

        const daily = dailyRes || {
          waterMl: 0,
          steps: 0,
          weightKg: 0,
          mood: 3,
        };

        allDays.push({
          date,
          mealCalories,
          activityCalories,
          netCalories,
          waterMl: daily.waterMl || 0,
          steps: daily.steps || 0,
          sleepHours,
          relaxMinutes,
          weightKg: daily.weightKg || 0,
          mood: daily.mood || 0,
        });
      }

      setDays(allDays);
    } catch (err) {
      console.error("load weekly report error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const total = days.reduce(
    (acc, d) => {
      acc.mealCalories += d.mealCalories;
      acc.activityCalories += d.activityCalories;
      acc.netCalories += d.netCalories;
      acc.waterMl += d.waterMl;
      acc.steps += d.steps;
      acc.sleepHours += d.sleepHours;
      acc.relaxMinutes += d.relaxMinutes;
      acc.weightKg += d.weightKg;
      acc.mood += d.mood;
      return acc;
    },
    {
      mealCalories: 0,
      activityCalories: 0,
      netCalories: 0,
      waterMl: 0,
      steps: 0,
      sleepHours: 0,
      relaxMinutes: 0,
      weightKg: 0,
      mood: 0,
    }
  );

  const n = days.length || 1;

  return (
    <div style={{ padding: 24 }}>
      <h2>Báo cáo 7 ngày gần nhất</h2>
      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: 16,
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>Ngày</th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Ăn vào (kcal)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Đốt cháy (kcal)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Net (kcal)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Nước (ml)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Bước chân
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Ngủ (giờ)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Thư giãn (phút)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Cân nặng (kg)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 4 }}>
                  Mood (1–5)
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date}>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.date}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.mealCalories}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.activityCalories}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: 4,
                      color: d.netCalories > 0 ? "red" : "green",
                    }}
                  >
                    {d.netCalories}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.waterMl}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.steps}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.sleepHours}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.relaxMinutes}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.weightKg.toFixed(1)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 4 }}>
                    {d.mood}
                  </td>
                </tr>
              ))}

              {/* Hàng tổng & trung bình */}
              <tr style={{ background: "#f5f5f5", fontWeight: "bold" }}>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  Tổng / TB
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.mealCalories} / {(total.mealCalories / n).toFixed(0)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.activityCalories} /{" "}
                  {(total.activityCalories / n).toFixed(0)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.netCalories} / {(total.netCalories / n).toFixed(0)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.waterMl} / {(total.waterMl / n).toFixed(0)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.steps} / {(total.steps / n).toFixed(0)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.sleepHours.toFixed(1)} /{" "}
                  {(total.sleepHours / n).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {total.relaxMinutes} /{" "}
                  {(total.relaxMinutes / n).toFixed(0)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {days.length
                    ? (total.weightKg / n).toFixed(1)
                    : "0.0"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                  {days.length
                    ? (total.mood / n).toFixed(1)
                    : "0.0"}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default WeeklyReportPage;

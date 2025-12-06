import React, { useEffect, useState } from "react";

type ActivityDef = {
  id: string;
  name: string;
  unit: string;
  caloriesPerUnit: number;
};

type Props = {
  userId: string;
};

export default function ActivityPage({ userId }: Props) {
  const [activities, setActivities] = useState<ActivityDef[]>([]);
  const [selected, setSelected] = useState<ActivityDef | null>(null);
  const [duration, setDuration] = useState(30);

  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // --- tải danh sách hoạt động ---
  async function loadList() {
    const res = await window.lockinAPI.activity.getList();
    setActivities(res);
  }

  // --- tải log ---
  // --- tải log ---
async function loadLogs() {
  const res = await window.lockinAPI.activity.getForDate(userId, date);

  if (Array.isArray(res)) {
    const arr = res as any[];
    setLogs(arr as any);
    const totalCalories = arr.reduce(
      (sum, it: any) => sum + (it.calories || 0),
      0
    );
    setTotal(totalCalories);
  } else {
    const items = (res && (res as any).items) || [];
    const totalCalories =
      (res && (res as any).totalCalories) ||
      items.reduce((sum: number, it: any) => sum + (it.calories || 0), 0);

    setLogs(items);
    setTotal(totalCalories);
  }
}


  // --- thêm log ---
  async function addActivity() {
    if (!selected) return;

    const calories = selected.caloriesPerUnit * duration;

    await window.lockinAPI.activity.add({
      userId,
      date,
      activityId: selected.id,
      name: selected.name,
      duration,
      calories,
    });

    setDuration(30);
    await loadLogs();
  }

  // --- xoá log ---
  async function handleDeleteActivity(id: number) {
    // tên hàm phải khớp với preload + main + global.d.ts
    await window.lockinAPI.activity.delete(id);
    await loadLogs();
  }

  useEffect(() => {
    loadList();
    loadLogs();
  }, []);

  // --- UI ---
  return (
    <div style={{ padding: 24 }}>
      <h2>Hoạt động ({date})</h2>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Danh sách hoạt động */}
        <div>
          <h3>Danh sách hoạt động</h3>
          <ul>
            {activities.map((a) => (
              <li
                key={a.id}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(a)}
              >
                {a.name} ({a.caloriesPerUnit} kcal / {a.unit})
              </li>
            ))}
          </ul>

          <h3>Chi tiết</h3>
          {selected ? (
            <>
              <p>
                <b>{selected.name}</b>
              </p>
              <p>
                {selected.caloriesPerUnit} kcal / {selected.unit}
              </p>

              <label>
                Số {selected.unit}:{" "}
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </label>

              <p>Tổng calo: {selected.caloriesPerUnit * duration}</p>

              <button onClick={addActivity}>Thêm</button>
            </>
          ) : (
            <p>Chọn một hoạt động.</p>
          )}
        </div>

        {/* Logs hôm nay */}
        <div>
          <h3>Logs hôm nay</h3>
          <p>
            <b>Tổng: {total} kcal</b>
          </p>

          <table border={1} cellPadding={6}>
            <thead>
              <tr>
                <th>Hoạt động</th>
                <th>Thời lượng</th>
                <th>Kcal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.duration}</td>
                  <td>{l.calories}</td>
                  <td>
                    <button onClick={() => handleDeleteActivity(l.id)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

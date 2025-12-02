import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    api: any;
  }
}

interface SleepLog {
  id: number;
  date: string;
  bedtime: string;   // "23:30"
  wakeTime: string;  // "06:30"
  duration: number;  // số giờ ngủ
  quality: number;   // 1-5
  note?: string;
}

interface SleepPageProps {
  userId: string;
}

const SleepPage: React.FC<SleepPageProps> = ({ userId }) => {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [quality, setQuality] = useState(4);
  const [note, setNote] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const loadData = async () => {
    try {
      const data: SleepLog[] = await window.api.sleep.getForDate(userId, today);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load sleep logs", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calcDurationHours = (bed: string, wake: string): number => {
    if (!bed || !wake) return 0;
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);

    if (
      Number.isNaN(bh) ||
      Number.isNaN(bm) ||
      Number.isNaN(wh) ||
      Number.isNaN(wm)
    ) {
      return 0;
    }

    let start = bh * 60 + bm;
    let end = wh * 60 + wm;

    // nếu giờ dậy nhỏ hơn giờ ngủ -> qua ngày hôm sau
    if (end <= start) {
      end += 24 * 60;
    }

    const diffMinutes = end - start;
    return Math.round((diffMinutes / 60) * 10) / 10; // làm tròn 1 chữ số thập phân
  };

  const currentDuration = calcDurationHours(bedtime, wakeTime);

  const handleAdd = async () => {
    if (currentDuration <= 0) return;

    try {
      await window.api.sleep.add({
        userId,
        date: today,
        bedtime,
        wakeTime,
        duration: currentDuration,
        quality,
        note: note.trim(),
      });

      setNote("");
      await loadData();
    } catch (err) {
      console.error("Failed to add sleep entry", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await window.api.sleep.delete(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete sleep entry", err);
    }
  };

  const avgDuration =
    logs.length === 0
      ? 0
      : Math.round(
          (logs.reduce((s, l) => s + (l.duration || 0), 0) / logs.length) * 10
        ) / 10;

  const avgQuality =
    logs.length === 0
      ? 0
      : Math.round(
          (logs.reduce((s, l) => s + (l.quality || 0), 0) / logs.length) * 10
        ) / 10;

  return (
    <div style={{ padding: 24 }}>
      <h1>Log giấc ngủ ({today})</h1>

      <section style={{ marginBottom: 24 }}>
        <h3>Thêm giấc ngủ</h3>
        <div style={{ marginBottom: 8 }}>
          <label>
            Giờ đi ngủ:{" "}
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            Giờ thức dậy:{" "}
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span>Thời lượng ước tính: </span>
          <b>{currentDuration} giờ</b>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            Chất lượng giấc ngủ (1–5):{" "}
            <input
              type="number"
              min={1}
              max={5}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value) || 1)}
              style={{ width: 60 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea
            placeholder="Ghi chú (mơ gì, cảm giác khi thức dậy...)"
            style={{ width: 360, height: 60 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button onClick={handleAdd}>Lưu giấc ngủ</button>
      </section>

      <section>
        <h3>Giấc ngủ hôm nay</h3>
        {logs.length === 0 ? (
          <p>Chưa có log giấc ngủ nào.</p>
        ) : (
          <>
            <p>
              Trung bình: <b>{avgDuration}</b> giờ, chất lượng{" "}
              <b>{avgQuality}</b>/5
            </p>
            <table style={{ borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                    Đi ngủ
                  </th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                    Thức dậy
                  </th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                    Thời lượng (giờ)
                  </th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                    Chất lượng
                  </th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                    Ghi chú
                  </th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 4 }}
                    >
                      {log.bedtime}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 4 }}
                    >
                      {log.wakeTime}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 4 }}
                    >
                      {log.duration}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 4 }}
                    >
                      {log.quality}/5
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 4 }}
                    >
                      {log.note}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 4 }}
                    >
                      <button onClick={() => handleDelete(log.id)}>Xoá</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
};

export default SleepPage;

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    api: any;
  }
}

interface RelaxLog {
  id: number;
  date: string;
  activity: string;
  duration: number;
  note?: string;
}

interface RelaxPageProps {
  userId: string;
}

const RelaxPage: React.FC<RelaxPageProps> = ({ userId }) => {
  const [logs, setLogs] = useState<RelaxLog[]>([]);
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [note, setNote] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const loadData = async () => {
    try {
      const data: RelaxLog[] = await window.api.relax.getForDate(
        userId,
        today
      );
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load relax logs", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!activity.trim()) return;

    try {
      await window.api.relax.add({
        userId,
        date: today,
        activity: activity.trim(),
        duration,
        note: note.trim(),
      });

      setActivity("");
      setNote("");
      setDuration(30);
      await loadData();
    } catch (err) {
      console.error("Failed to add relax entry", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await window.api.relax.delete(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete relax entry", err);
    }
  };

  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      <h1>Log thư giãn ({today})</h1>

      <section style={{ marginBottom: 24 }}>
        <h3>Thêm hoạt động thư giãn</h3>
        <div style={{ marginBottom: 8 }}>
          <input
            style={{ width: 260, marginRight: 8 }}
            placeholder="Ví dụ: Thiền, đọc sách, yoga..."
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
          <input
            type="number"
            min={5}
            step={5}
            style={{ width: 80, marginRight: 4 }}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 0)}
          />
          <span>phút</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea
            placeholder="Ghi chú (không bắt buộc)..."
            style={{ width: 360, height: 60 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button onClick={handleAdd}>Lưu thư giãn</button>
      </section>

      <section>
        <h3>Hoạt động thư giãn hôm nay</h3>
        <p>
          Tổng thời gian: <b>{totalMinutes}</b> phút
        </p>

        {logs.length === 0 ? (
          <p>Chưa có hoạt động nào.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                  Hoạt động
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 4 }}>
                  Thời lượng (phút)
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
                  <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                    {log.activity}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                    {log.duration}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                    {log.note}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                    <button onClick={() => handleDelete(log.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default RelaxPage;

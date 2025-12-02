import React, { useEffect, useState } from "react";

type DailyPageProps = {
  userId: string;
};

type DailyLog = {
  userId: string;
  date: string;
  waterMl: number;
  steps: number;
  weightKg: number;
  mood: number;
  note: string;
};

const DailyPage: React.FC<DailyPageProps> = ({ userId }) => {
  const api = (window as any).lockinAPI || (window as any).api;
  const [date] = useState(() => new Date().toISOString().slice(0, 10));

  const [waterMl, setWaterMl] = useState<string>("0");
  const [steps, setSteps] = useState<string>("0");
  const [weightKg, setWeightKg] = useState<string>("0");
  const [mood, setMood] = useState<number>(3);
  const [note, setNote] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  // load dữ liệu ngày hiện tại
  useEffect(() => {
    const load = async () => {
      try {
        if (!api?.daily?.getForDate) return;
        const log: DailyLog = await api.daily.getForDate(userId, date);

        setWaterMl(String(log.waterMl ?? 0));
        setSteps(String(log.steps ?? 0));
        setWeightKg(String(log.weightKg ?? 0));
        setMood(log.mood ?? 3);
        setNote(log.note ?? "");
      } catch (err) {
        console.error("load daily log error", err);
        setStatus("Không tải được nhật ký ngày.");
      }
    };

    load();
  }, [api, userId, date]);

  const handleSave = async () => {
    try {
      if (!api?.daily?.save) {
        alert("API daily chưa sẵn sàng.");
        return;
      }

      await api.daily.save({
        userId,
        date,
        waterMl: Number(waterMl) || 0,
        steps: Number(steps) || 0,
        weightKg: Number(weightKg) || 0,
        mood,
        note,
      });

      setStatus("Đã lưu nhật ký ngày.");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("save daily log error", err);
      alert("Lưu nhật ký thất bại.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Nhật ký hàng ngày ({date})</h2>

      {status && <p style={{ color: "green" }}>{status}</p>}

      <div style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Nước uống (ml) mỗi ngày:
            <input
              type="number"
              value={waterMl}
              onChange={(e) => setWaterMl(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Bước chân hôm nay:
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Cân nặng (kg):
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              style={{ width: "100%" }}
              step="0.1"
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Tâm trạng hôm nay:
            <select
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              style={{ width: "100%" }}
            >
              <option value={1}>1 - Rất tệ</option>
              <option value={2}>2 - Khá tệ</option>
              <option value={3}>3 - Bình thường</option>
              <option value={4}>4 - Khá tốt</option>
              <option value={5}>5 - Tuyệt vời</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Ghi chú:
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: "100%", height: 80 }}
            />
          </label>
        </div>

        <button onClick={handleSave}>Lưu nhật ký ngày</button>
      </div>
    </div>
  );
};

export default DailyPage;

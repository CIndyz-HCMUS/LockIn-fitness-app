import React, { useEffect, useState } from "react";

interface GoalPageProps {
  userId: string;
}

interface GoalData {
  dailyCalorieGoal: number;
  targetWeight: number;
  waterGoal: number;
  stepGoal: number;
}

const defaultGoal: GoalData = {
  dailyCalorieGoal: 2000,
  targetWeight: 60,
  waterGoal: 2000,
  stepGoal: 8000,
};

const GoalPage: React.FC<GoalPageProps> = ({ userId }) => {
  const [goal, setGoal] = useState<GoalData>(defaultGoal);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const api = (window as any).lockinAPI || (window as any).api;

  const loadGoal = async () => {
    if (!api?.goal) {
      setError("API goal chưa sẵn sàng");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.goal.getForUser(userId);
      if (res) {
        setGoal({
          dailyCalorieGoal: Number(res.dailyCalorieGoal) || 0,
          targetWeight: Number(res.targetWeight) || 0,
          waterGoal: Number(res.waterGoal) || 0,
          stepGoal: Number(res.stepGoal) || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load goal", err);
      setError("Không tải được mục tiêu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleChange = (field: keyof GoalData, value: string) => {
    setGoal((prev) => ({
      ...prev,
      [field]: Number(value) || 0,
    }));
  };

  const handleSave = async () => {
    if (!api?.goal) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await api.goal.save({
        userId,
        ...goal,
      });
      setMessage("Đã lưu mục tiêu!");
    } catch (err) {
      console.error("Failed to save goal", err);
      setError("Lưu mục tiêu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Mục tiêu cá nhân</h1>

      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {!loading && (
        <div style={{ maxWidth: 420 }}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Mục tiêu calo mỗi ngày (kcal):
              <br />
              <input
                type="number"
                value={goal.dailyCalorieGoal}
                onChange={(e) =>
                  handleChange("dailyCalorieGoal", e.target.value)
                }
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              Cân nặng mục tiêu (kg):
              <br />
              <input
                type="number"
                value={goal.targetWeight}
                onChange={(e) => handleChange("targetWeight", e.target.value)}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              Mục tiêu nước mỗi ngày (ml):
              <br />
              <input
                type="number"
                value={goal.waterGoal}
                onChange={(e) => handleChange("waterGoal", e.target.value)}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              Mục tiêu bước chân mỗi ngày (bước):
              <br />
              <input
                type="number"
                value={goal.stepGoal}
                onChange={(e) => handleChange("stepGoal", e.target.value)}
              />
            </label>
          </div>

          <button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu mục tiêu"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalPage;

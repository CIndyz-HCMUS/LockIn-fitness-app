import React, { useEffect, useState } from "react";

type PlanType = "weight_loss" | "muscle_gain" | "balanced";

interface Plan {
  id: number;
  userId: string;
  planType: PlanType;
  durationMonths: number;
  price: number;
  progress: number;
  status: "active" | "expired";
  purchaseDate: string;
  expirationDate: string;
}

interface PlanPageProps {
  userId: string;
}

const planLabels: Record<PlanType, string> = {
  weight_loss: "Giảm cân",
  muscle_gain: "Tăng cơ / sức mạnh",
  balanced: "Cân bằng & sức khoẻ",
};

const defaultPrices: Record<PlanType, number> = {
  weight_loss: 200000,
  muscle_gain: 250000,
  balanced: 220000,
};

const PlanPage: React.FC<PlanPageProps> = ({ userId }) => {
  const api = (window as any).lockinAPI || (window as any).api;

  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [planType, setPlanType] = useState<PlanType>("weight_loss");
  const [duration, setDuration] = useState<number>(1);
  const [price, setPrice] = useState<number>(defaultPrices["weight_loss"]);
  const [progressInput, setProgressInput] = useState<string>("0");
  const [txList, setTxList] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  const loadData = async () => {
    try {
      const [plan, tx] = await Promise.all([
        api.plan.getForUser(userId),
        api.transactions.getForUser(userId),
      ]);

      if (plan) {
        setCurrentPlan(plan);
        setProgressInput(String(plan.progress ?? 0));
      } else {
        setCurrentPlan(null);
        setProgressInput("0");
      }

      setTxList(tx || []);
    } catch (err) {
      console.error("load plan error", err);
    }
  };

  useEffect(() => {
    setPrice(defaultPrices[planType] * duration);
  }, [planType, duration]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handlePurchase = async () => {
    if (!confirm("Xác nhận mua gói này? (offline, demo)")) return;

    try {
      const payload = {
        userId,
        planType,
        durationMonths: duration,
        price,
        paymentMethod: "offline",
      };
      const plan = await api.plan.purchase(payload);
      setCurrentPlan(plan);
      setProgressInput(String(plan.progress ?? 0));
      await loadData();
      setStatus("Đã mua gói mới.");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("purchase plan error", err);
      alert("Mua gói thất bại.");
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const value = Number(progressInput);
      if (isNaN(value)) {
        alert("Tiến độ phải là số 0-100.");
        return;
      }
      const plan = await api.plan.updateProgress(userId, value);
      setCurrentPlan(plan);
      setStatus("Đã cập nhật tiến độ.");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("update progress error", err);
      alert("Cập nhật tiến độ thất bại.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Gói cá nhân</h2>
      {status && <p style={{ color: "green" }}>{status}</p>}

      {/* Current plan */}
      <section style={{ marginBottom: 24 }}>
        <h3>Gói hiện tại</h3>
        {currentPlan ? (
          <div>
            <p>
              Loại gói: <b>{planLabels[currentPlan.planType]}</b>
            </p>
            <p>
              Thời hạn:{" "}
              <b>
                {currentPlan.durationMonths} tháng (từ{" "}
                {currentPlan.purchaseDate} đến {currentPlan.expirationDate})
              </b>
            </p>
            <p>
              Giá gói: <b>{currentPlan.price.toLocaleString()} đ</b>
            </p>
            <p>
              Trạng thái: <b>{currentPlan.status}</b>
            </p>
            <p>
              Tiến độ hiện tại: <b>{currentPlan.progress}%</b>
            </p>

            <div style={{ marginTop: 8 }}>
              <label>
                Cập nhật tiến độ (%):
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  style={{ marginLeft: 8, width: 80 }}
                />
              </label>
              <button
                onClick={handleUpdateProgress}
                style={{ marginLeft: 8 }}
              >
                Lưu tiến độ
              </button>
            </div>
          </div>
        ) : (
          <p>Hiện tại bạn chưa có gói hoạt động.</p>
        )}
      </section>

      {/* Purchase new plan */}
      <section style={{ marginBottom: 24 }}>
        <h3>Đăng ký / đổi gói</h3>

        <div style={{ marginBottom: 8 }}>
          <span>Chọn loại gói: </span>
          <label style={{ marginRight: 8 }}>
            <input
              type="radio"
              name="planType"
              value="weight_loss"
              checked={planType === "weight_loss"}
              onChange={() => setPlanType("weight_loss")}
            />
            Giảm cân
          </label>
          <label style={{ marginRight: 8 }}>
            <input
              type="radio"
              name="planType"
              value="muscle_gain"
              checked={planType === "muscle_gain"}
              onChange={() => setPlanType("muscle_gain")}
            />
            Tăng cơ
          </label>
          <label>
            <input
              type="radio"
              name="planType"
              value="balanced"
              checked={planType === "balanced"}
              onChange={() => setPlanType("balanced")}
            />
            Cân bằng
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Thời hạn:
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            >
              <option value={1}>1 tháng</option>
              <option value={3}>3 tháng</option>
              <option value={6}>6 tháng</option>
            </select>
          </label>
        </div>

        <p>
          Đơn giá: <b>{defaultPrices[planType].toLocaleString()} đ / tháng</b>
        </p>
        <p>
          Thành tiền:{" "}
          <b>{price.toLocaleString()} đ</b> (thanh toán offline/demo)
        </p>

        <button onClick={handlePurchase}>Mua gói</button>
      </section>

      {/* Transactions history */}
      <section>
        <h3>Lịch sử thanh toán</h3>
        {txList.length === 0 ? (
          <p>Chưa có thanh toán nào.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {txList.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.date).toLocaleString()}</td>
                  <td>{tx.amount.toLocaleString()} đ</td>
                  <td>{tx.method}</td>
                  <td>{tx.status}</td>
                  <td>{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default PlanPage;

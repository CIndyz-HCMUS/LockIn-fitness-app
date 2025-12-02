import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MealsPage from "./pages/MealsPage";
import ActivityPage from "./pages/ActivityPage";
import DashboardPage from "./pages/DashboardPage";
import RelaxPage from "./pages/RelaxPage";
import SleepPage from "./pages/SleepPage";
import GoalPage from "./pages/GoalPage";
import DailyPage from "./pages/DailyPage";
import PlanPage from "./pages/PlanPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";


type Screen =
  | "login"
  | "register"
  | "dashboard"
  | "meals"
  | "activity"
  | "relax"
  | "sleep"
  | "goal"
  | "daily"
  | "plan"
  | "weekly"

const InnerApp: React.FC = () => {
  const { user, setUser } = useAuth();
  const [screen, setScreen] = useState<Screen>("login");

  // Khi user login xong thì nhảy sang Dashboard
  useEffect(() => {
    if (user) {
      setScreen("dashboard");
    }
  }, [user]);

  // Chưa đăng nhập -> chỉ cho Login / Register
  if (!user) {
    if (screen === "register") {
      return <RegisterPage onSwitchToLogin={() => setScreen("login")} />;
    }
    return <LoginPage onSwitchToRegister={() => setScreen("register")} />;
  }

  // Đã đăng nhập -> layout chính
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: 220,
          borderRight: "1px solid #ddd",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <h3>LockIn</h3>
        <p>
          Xin chào, <b>{user.username}</b>
        </p>

        <button onClick={() => setScreen("dashboard")}>Dashboard</button>
        <button onClick={() => setScreen("meals")}>Log bữa ăn</button>
        <button onClick={() => setScreen("activity")}>Log hoạt động</button>
        <button onClick={() => setScreen("relax")}>Log thư giãn</button>
        <button onClick={() => setScreen("sleep")}>Log giấc ngủ</button>
        <button onClick={() => setScreen("goal")}>Mục tiêu</button>
        <button onClick={() => setScreen("daily")}>Nhật ký ngày</button>
        <button onClick={() => setScreen("plan")}>Gói cá nhân</button> 
        <button onClick={() => setScreen("weekly")}>Báo cáo tuần</button>


        <hr />
        <button onClick={() => setUser(null)}>Đăng xuất</button>
      </div>

      <div style={{ flex: 1 }}>
        {screen === "dashboard" && <DashboardPage userId={user.id} />}
        {screen === "meals" && <MealsPage userId={user.id} />}
        {screen === "activity" && <ActivityPage userId={user.id} />}
        {screen === "relax" && <RelaxPage userId={user.id} />}
        {screen === "sleep" && <SleepPage userId={user.id} />}
        {screen === "goal" && <GoalPage userId={user.id} />}
        {screen === "daily" && <DailyPage userId={user.id} />} 
        {screen === "plan" && <PlanPage userId={user.id} />} 
        {screen === "weekly" && <WeeklyReportPage userId={user.id} />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
};

export default App;

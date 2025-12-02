import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MealsPage from "./pages/MealsPage";
import ActivityPage from "./pages/ActivityPage";
import RelaxPage from "./pages/RelaxPage";
import SleepPage from "./pages/SleepPage";
import GoalPage from "./pages/GoalPage";
import DailyPage from "./pages/DailyPage";
import PlanPage from "./pages/PlanPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import AdminPage from "./pages/AdminPage";
import OnboardingPage from "./pages/OnboardingPage";

type Screen =
  | "login"
  | "register"
  | "onboarding"
  | "dashboard"
  | "meals"
  | "activity"
  | "relax"
  | "sleep"
  | "goal"
  | "daily"
  | "plan"
  | "weekly"
  | "admin";

const InnerApp: React.FC = () => {
  const { user, setUser } = useAuth() as {
    user: any;
    setUser: (u: any) => void;
  };

  const [screen, setScreen] = useState<Screen>("login");

  // lưu tạm username + password từ bước đăng ký
  const [pendingCreds, setPendingCreds] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // Khi user login (user != null) thì nhảy sang dashboard
  useEffect(() => {
    if (user) {
      setScreen("dashboard");
    }
    // KHÔNG else setScreen("login") để tránh ép các màn register/onboarding về login
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setScreen("login");
  };

  // ================== HIỂN THỊ KHI CHƯA ĐĂNG NHẬP ==================

  // LOGIN
  if (!user && screen === "login") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #6a89cc, #dcdde1)",
        }}
      >
        <div
          style={{
            width: 420,
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 16 }}>
            LockIn Fitness – Đăng nhập
          </h2>
          <LoginPage onSwitchToRegister={() => setScreen("register")} />
        </div>
      </div>
    );
  }

  // REGISTER (BƯỚC 1 – chỉ tài khoản)
  if (!user && screen === "register") {
    return (
      <RegisterPage
        onSwitchToLogin={() => setScreen("login")}
        onGoNext={(cred) => {
          setPendingCreds(cred);
          setScreen("onboarding");
        }}
      />
    );
  }

  // ONBOARDING (BƯỚC 2 – Get Started như hình)
  if (!user && screen === "onboarding") {
    return (
      <OnboardingPage
        username={pendingCreds?.username || ""}
        password={pendingCreds?.password || ""}
        onDone={() => {
          // hoàn tất: quay lại login để user đăng nhập
          setScreen("login");
        }}
      />
    );
  }

  // Nếu chưa đăng nhập mà lại vào screen khác thì cho quay về login
  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p>Bạn chưa đăng nhập.</p>
        <button onClick={() => setScreen("login")}>Về trang đăng nhập</button>
      </div>
    );
  }

  // ================== SAU KHI ĐĂNG NHẬP ==================
  const isAdmin = user.role === "admin" || user.username === "admin";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Thanh top bar */}
      <header
        style={{
          height: 56,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1976d2",
          color: "#fff",
        }}
      >
        <div>
          <strong>LockIn Fitness App</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>
            Xin chào, <b>{user.username}</b>{" "}
            {isAdmin && (
              <span style={{ fontSize: 12, marginLeft: 4 }}>(Admin)</span>
            )}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Nội dung chính */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Sidebar */}
        <nav
          style={{
            width: 220,
            borderRight: "1px solid #ddd",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "#fafafa",
          }}
        >
          <button onClick={() => setScreen("dashboard")}>Dashboard</button>
          <button onClick={() => setScreen("meals")}>Log bữa ăn</button>
          <button onClick={() => setScreen("activity")}>Log hoạt động</button>
          <button onClick={() => setScreen("relax")}>Log thư giãn</button>
          <button onClick={() => setScreen("sleep")}>Log giấc ngủ</button>
          <button onClick={() => setScreen("goal")}>Mục tiêu</button>
          <button onClick={() => setScreen("daily")}>Nhật ký ngày</button>
          <button onClick={() => setScreen("plan")}>Gói cá nhân</button>
          <button onClick={() => setScreen("weekly")}>Báo cáo tuần</button>

          {isAdmin && (
            <>
              <hr />
              <button onClick={() => setScreen("admin")}>Admin</button>
            </>
          )}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {screen === "dashboard" && <DashboardPage userId={user.id} />}
          {screen === "meals" && <MealsPage userId={user.id} />}
          {screen === "activity" && <ActivityPage userId={user.id} />}
          {screen === "relax" && <RelaxPage userId={user.id} />}
          {screen === "sleep" && <SleepPage userId={user.id} />}
          {screen === "goal" && <GoalPage userId={user.id} />}
          {screen === "daily" && <DailyPage userId={user.id} />}
          {screen === "plan" && <PlanPage userId={user.id} />}
          {screen === "weekly" && <WeeklyReportPage userId={user.id} />}
          {screen === "admin" &&
            (isAdmin ? (
              <AdminPage userId={user.id} />
            ) : (
              <div style={{ padding: 24, color: "red" }}>
                Bạn không có quyền truy cập trang admin.
              </div>
            ))}
        </main>
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

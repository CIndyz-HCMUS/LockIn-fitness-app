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
    <LoginPage onSwitchToRegister={() => setScreen("register")} />
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
        <p>You are not logged in.</p>
        <button onClick={() => setScreen("login")}>Back to the login page</button>
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
            Hello, <b>{user.username}</b>{" "}
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
            Log out
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
          <button onClick={() => setScreen("dashboard")}>Home</button>
          <button onClick={() => setScreen("meals")}>Meal</button>
          <button onClick={() => setScreen("activity")}>Activity</button>
          <button onClick={() => setScreen("relax")}>Relaxation</button>
          <button onClick={() => setScreen("sleep")}>Sleep</button>
          <button onClick={() => setScreen("goal")}>Goal</button>
          <button onClick={() => setScreen("daily")}>Daily Diary</button>
          <button onClick={() => setScreen("plan")}>Personal plan</button>
          <button onClick={() => setScreen("weekly")}>Weekly Report</button>

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
                You do not have permission to access the admin page.
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

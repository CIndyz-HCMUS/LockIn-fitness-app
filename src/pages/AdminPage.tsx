// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

interface AdminPageProps {
  userId: number;
}

const AdminPage: React.FC<AdminPageProps> = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const s = await adminService.getStats();
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await adminService.getUsers();
      setUsers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  const toggleLock = async (u: any) => {
    await adminService.updateUser({
      id: u.id,
      isLocked: !u.isLocked,
    });
    await loadUsers();
  };

  const toggleRole = async (u: any) => {
    await adminService.updateUser({
      id: u.id,
      role: u.role === "admin" ? "user" : "admin",
    });
    await Promise.all([loadUsers(), loadStats()]);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Admin – Quản trị hệ thống
      </h2>

      {/* STATS */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Thống kê tổng quan</h3>
        {loadingStats && <div>Đang tải thống kê...</div>}
        {!loadingStats && stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            <StatCard label="Tổng user" value={stats.totalUsers} />
            <StatCard label="Tổng admin" value={stats.totalAdmins} />
            <StatCard label="User bị khoá" value={stats.totalLockedUsers} />
            <StatCard label="Activities" value={stats.totalActivities} />
            <StatCard label="Foods" value={stats.totalFoods} />
            <StatCard
              label="Activity logs"
              value={stats.totalActivityLogs ?? 0}
            />
            <StatCard label="Relax logs" value={stats.totalRelaxLogs ?? 0} />
            <StatCard label="Meal logs" value={stats.totalMealLogs ?? 0} />
          </div>
        )}
      </section>

      {/* USERS */}
      <section>
        <h3 style={{ marginBottom: 8 }}>Quản lý users</h3>
        {loadingUsers ? (
          <div>Đang tải danh sách users...</div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Locked</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={tdStyle}>{u.username}</td>
                    <td style={tdStyle}>{u.role}</td>
                    <td style={tdStyle}>{u.isLocked ? "Yes" : "No"}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => toggleRole(u)}
                        style={btnPrimary}
                      >
                        {u.role === "admin"
                          ? "Chuyển thành user"
                          : "Nâng lên admin"}
                      </button>
                      <button
                        onClick={() => toggleLock(u)}
                        style={{
                          ...btnDanger,
                          marginLeft: 8,
                        }}
                      >
                        {u.isLocked ? "Mở khoá" : "Khoá"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={5}>
                      Không có user nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontWeight: 600,
  borderBottom: "1px solid #ddd",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
};

const btnBase: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
  fontSize: 12,
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#1976d2",
  color: "#fff",
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "#d32f2f",
  color: "#fff",
};

const StatCard: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 8,
      padding: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    }}
  >
    <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
  </div>
);

export default AdminPage;

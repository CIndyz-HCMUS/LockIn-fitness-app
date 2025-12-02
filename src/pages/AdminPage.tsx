import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

interface AdminPageProps {
  userId: number;
}

// lấy API core (foods, meals...) từ preload
const coreApi: any =
  (window as any).api || (window as any).lockinAPI || (window as any).lockInAPI;

const AdminPage: React.FC<AdminPageProps> = () => {
  // ===== STATS & USERS =====
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // ===== FOODS =====
  const [foods, setFoods] = useState<any[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");
  const [addingFood, setAddingFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    unit: "",
    calories: "",
    preparation: "",
    carb: "",
    protein: "",
    fat: "",
    fiber: "",
    brand: "",
  });

  // ===== ACTIVITIES =====
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityForm, setActivityForm] = useState({
    id: null as number | null,
    name: "",
    category: "",
    description: "",
  });
  const [savingActivity, setSavingActivity] = useState(false);

  // ================= LOADERS =================

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const s = await adminService.getStats();
      setStats(s);
    } catch (e) {
      console.error("loadStats error", e);
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
      console.error("loadUsers error", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadFoods = async (query: string = "") => {
    if (!coreApi?.meals?.searchFoods) {
      console.warn("meals.searchFoods không tồn tại trong preload");
      setFoods([]);
      setLoadingFoods(false);
      return;
    }
    setLoadingFoods(true);
    try {
      const list = await coreApi.meals.searchFoods(query);
      setFoods(list || []);
    } catch (e) {
      console.error("loadFoods error", e);
    } finally {
      setLoadingFoods(false);
    }
  };

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const list = await adminService.getActivities();
      setActivities(list || []);
    } catch (e) {
      console.error("loadActivities error", e);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadFoods();
    loadActivities();
  }, []);

  // ================= USER ACTIONS =================

  const toggleLock = async (u: any) => {
    try {
      await adminService.updateUser({
        id: u.id,
        isLocked: !u.isLocked,
      });
      await loadUsers();
    } catch (e) {
      console.error("toggleLock error", e);
    }
  };

  const toggleRole = async (u: any) => {
    try {
      await adminService.updateUser({
        id: u.id,
        role: u.role === "admin" ? "user" : "admin",
      });
      await Promise.all([loadUsers(), loadStats()]);
    } catch (e) {
      console.error("toggleRole error", e);
    }
  };

  // ================= FOOD ACTIONS =================

  const handleSearchFoods = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadFoods(foodSearch.trim());
  };

  const handleChangeNewFood = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewFood((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreApi?.foods?.add) {
      alert("foods.add chưa được expose trong preload.");
      return;
    }
    if (!newFood.name.trim()) {
      alert("Tên món ăn không được để trống");
      return;
    }
    setAddingFood(true);
    try {
      const payload = {
        name: newFood.name.trim(),
        unit: newFood.unit.trim() || "phần",
        calories: Number(newFood.calories) || 0,
        preparation: newFood.preparation.trim(),
        carb: newFood.carb ? Number(newFood.carb) : undefined,
        protein: newFood.protein ? Number(newFood.protein) : undefined,
        fat: newFood.fat ? Number(newFood.fat) : undefined,
        fiber: newFood.fiber ? Number(newFood.fiber) : undefined,
        brand: newFood.brand.trim() || undefined,
      };

      await coreApi.foods.add(payload);
      setNewFood({
        name: "",
        unit: "",
        calories: "",
        preparation: "",
        carb: "",
        protein: "",
        fat: "",
        fiber: "",
        brand: "",
      });
      await loadFoods("");
      setFoodSearch("");
    } catch (err) {
      console.error("handleAddFood error", err);
      alert("Không thể thêm món ăn. Xem console để biết thêm chi tiết.");
    } finally {
      setAddingFood(false);
    }
  };

  const handleDeleteFood = async (food: any) => {
    if (!coreApi?.foods?.delete) {
      alert("foods.delete chưa được expose trong preload.");
      return;
    }
    if (!window.confirm(`Xoá món "${food.name}"?`)) return;

    try {
      await coreApi.foods.delete(food.id ?? food.foodId);
      await loadFoods(foodSearch.trim());
    } catch (err) {
      console.error("handleDeleteFood error", err);
      alert("Không thể xoá món ăn. Xem console để biết thêm chi tiết.");
    }
  };

  // ================= ACTIVITY ACTIONS =================

  const handleChangeActivityForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setActivityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditActivity = (act: any) => {
    setActivityForm({
      id: act.id,
      name: act.name ?? "",
      category: act.category ?? "",
      description: act.description ?? "",
    });
  };

  const handleResetActivityForm = () => {
    setActivityForm({
      id: null,
      name: "",
      category: "",
      description: "",
    });
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.name.trim()) {
      alert("Tên activity không được để trống");
      return;
    }
    setSavingActivity(true);
    try {
      const payload = {
        name: activityForm.name.trim(),
        category: activityForm.category.trim(),
        description: activityForm.description.trim(),
      };

      if (activityForm.id == null) {
        // create
        await adminService.createActivity(payload);
      } else {
        // update
        await adminService.updateActivity(activityForm.id, payload);
      }

      await loadActivities();
      handleResetActivityForm();
    } catch (err) {
      console.error("handleSaveActivity error", err);
      alert("Không thể lưu activity. Xem console để biết thêm chi tiết.");
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = async (act: any) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xoá activity "${act.name || act.title}"?`
      )
    )
      return;

    try {
      await adminService.deleteActivity(act.id);
      await loadActivities();
    } catch (err) {
      console.error("handleDeleteActivity error", err);
      alert("Không thể xoá activity. Xem console để biết thêm chi tiết.");
    }
  };

  // ================= RENDER =================

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Admin – Quản trị hệ thống
      </h2>

      {/* ====== STATS ====== */}
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

      {/* ====== USERS ====== */}
      <section style={{ marginBottom: 32 }}>
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
                      <button onClick={() => toggleRole(u)} style={btnPrimary}>
                        {u.role === "admin"
                          ? "Chuyển thành user"
                          : "Nâng lên admin"}
                      </button>
                      <button
                        onClick={() => toggleLock(u)}
                        style={{ ...btnDanger, marginLeft: 8 }}
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

      {/* ====== FOODS MANAGEMENT ====== */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 8 }}>Quản lý foods</h3>

        {/* Form tìm kiếm */}
        <form
          onSubmit={handleSearchFoods}
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm theo tên (để trống để xem tất cả)..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 13,
            }}
          />
          <button type="submit" style={btnPrimary}>
            Tìm
          </button>
        </form>

        {/* Form thêm món ăn */}
        <details
          style={{
            marginBottom: 12,
            background: "#fafafa",
            borderRadius: 6,
            padding: 8,
            border: "1px solid #eee",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            + Thêm món ăn mới
          </summary>
          <form onSubmit={handleAddFood} style={{ marginTop: 8 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: 8,
              }}
            >
              <input
                name="name"
                placeholder="Tên món *"
                value={newFood.name}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="unit"
                placeholder="Đơn vị (vd: phần, gr)"
                value={newFood.unit}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="calories"
                placeholder="Calories"
                value={newFood.calories}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="carb"
                placeholder="Carb (g)"
                value={newFood.carb}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="protein"
                placeholder="Protein (g)"
                value={newFood.protein}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="fat"
                placeholder="Fat (g)"
                value={newFood.fat}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="fiber"
                placeholder="Fiber (g)"
                value={newFood.fiber}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
              <input
                name="brand"
                placeholder="Thương hiệu"
                value={newFood.brand}
                onChange={handleChangeNewFood}
                style={inputStyle}
              />
            </div>
            <textarea
              name="preparation"
              placeholder="Cách chế biến / ghi chú"
              value={newFood.preparation}
              onChange={handleChangeNewFood}
              style={{
                ...inputStyle,
                marginTop: 8,
                width: "100%",
                minHeight: 60,
                resize: "vertical",
              }}
            />
            <div style={{ marginTop: 8, textAlign: "right" }}>
              <button type="submit" style={btnPrimary} disabled={addingFood}>
                {addingFood ? "Đang lưu..." : "Lưu món ăn"}
              </button>
            </div>
          </form>
        </details>

        {loadingFoods ? (
          <div>Đang tải danh sách foods...</div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              overflow: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Tên</th>
                  <th style={thStyle}>Đơn vị</th>
                  <th style={thStyle}>Calories</th>
                  <th style={thStyle}>Carb</th>
                  <th style={thStyle}>Protein</th>
                  <th style={thStyle}>Fat</th>
                  <th style={thStyle}>Fiber</th>
                  <th style={thStyle}>Brand</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f) => (
                  <tr
                    key={f.id ?? f.foodId ?? f.name}
                    style={{ borderTop: "1px solid #eee" }}
                  >
                    <td style={tdStyle}>{f.id ?? f.foodId}</td>
                    <td style={tdStyle}>{f.name}</td>
                    <td style={tdStyle}>{f.unit}</td>
                    <td style={tdStyle}>{f.calories}</td>
                    <td style={tdStyle}>{f.carb}</td>
                    <td style={tdStyle}>{f.protein}</td>
                    <td style={tdStyle}>{f.fat}</td>
                    <td style={tdStyle}>{f.fiber}</td>
                    <td style={tdStyle}>{f.brand}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <button
                        style={btnDanger}
                        onClick={() => handleDeleteFood(f)}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                {foods.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={10}>
                      Không có món nào khớp kết quả.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ====== ACTIVITIES CRUD ====== */}
      <section>
        <h3 style={{ marginBottom: 8 }}>Quản lý activities</h3>

        {/* Form add / edit */}
        <form onSubmit={handleSaveActivity} style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 8,
            }}
          >
            <input
              name="name"
              placeholder="Tên activity *"
              value={activityForm.name}
              onChange={handleChangeActivityForm}
              style={inputStyle}
            />
            <input
              name="category"
              placeholder="Nhóm (cardio, strength...)"
              value={activityForm.category}
              onChange={handleChangeActivityForm}
              style={inputStyle}
            />
          </div>
          <textarea
            name="description"
            placeholder="Mô tả / ghi chú"
            value={activityForm.description}
            onChange={handleChangeActivityForm}
            style={{
              ...inputStyle,
              marginTop: 8,
              width: "100%",
              minHeight: 60,
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button type="submit" style={btnPrimary} disabled={savingActivity}>
              {savingActivity
                ? "Đang lưu..."
                : activityForm.id == null
                ? "Thêm activity"
                : "Cập nhật activity"}
            </button>
            {activityForm.id != null && (
              <button
                type="button"
                style={btnBase}
                onClick={handleResetActivityForm}
              >
                Huỷ chỉnh sửa
              </button>
            )}
          </div>
        </form>

        {loadingActivities ? (
          <div>Đang tải activities...</div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              overflow: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Tên</th>
                  <th style={thStyle}>Nhóm</th>
                  <th style={thStyle}>Mô tả</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr
                    key={a.id ?? a.code ?? a.name}
                    style={{ borderTop: "1px solid #eee" }}
                  >
                    <td style={tdStyle}>{a.id ?? a.code}</td>
                    <td style={tdStyle}>{a.name ?? a.title}</td>
                    <td style={tdStyle}>{a.category ?? a.type}</td>
                    <td style={tdStyle}>{a.description}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <button
                        style={btnPrimary}
                        onClick={() => handleEditActivity(a)}
                      >
                        Sửa
                      </button>
                      <button
                        style={{ ...btnDanger, marginLeft: 6 }}
                        onClick={() => handleDeleteActivity(a)}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={5}>
                      Không có activity nào.
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

// ================= STYLES / SUB COMPONENTS =================

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontWeight: 600,
  borderBottom: "1px solid " + "#ddd",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
};

const btnBase: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid #ccc",
  cursor: "pointer",
  fontSize: 12,
  background: "#f5f5f5",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#1976d2",
  borderColor: "#1976d2",
  color: "#fff",
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "#d32f2f",
  borderColor: "#d32f2f",
  color: "#fff",
};

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 13,
  width: "100%",
  boxSizing: "border-box",
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

import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
};

type FoodItem = {
  id: string;
  name: string;
  unit: string;
  calories: number;
  preparation?: "raw" | "cooked" | string;

  carb?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
};

export default function MealsPage({ userId }: Props) {
  const [date] = useState(() => new Date().toISOString().slice(0, 10));

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [prepFilter, setPrepFilter] = useState<"all" | "raw" | "cooked">("all");

  // form thêm món mới
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("100g");
  const [newCalories, setNewCalories] = useState<string>("");
  const [newPrep, setNewPrep] = useState<"cooked" | "raw">("cooked");
  const [newCarb, setNewCarb] = useState<string>("");
  const [newProtein, setNewProtein] = useState<string>("");
  const [newFat, setNewFat] = useState<string>("");
  const [newFiber, setNewFiber] = useState<string>("");

  const api = (window as any).lockinAPI || (window as any).api;
  

  // =============== LOAD FOODS ==================
  async function loadFoods(q: string) {
    try {
      const res = await api.meals.searchFoods(q);
      setFoods(res || []);
    } catch (err) {
      console.error("loadFoods error:", err);
    }
  }

  // =============== LOAD FAVORITES ==============
  async function loadFavorites() {
    try {
      if (!api.meals.getFavorites) return;
      const res = await api.meals.getFavorites(userId);
      const ids = (res || []).map((id: any) => String(id));
      setFavorites(ids);
    } catch (err) {
      console.error("loadFavorites error:", err);
    }
  }

  async function handleToggleFavorite(foodId: string) {
    try {
      if (!api.meals.toggleFavorite) return;
      const res = await api.meals.toggleFavorite(userId, foodId);
      const ids = (res || []).map((id: any) => String(id));
      setFavorites(ids);
    } catch (err) {
      console.error("toggleFavorite error:", err);
    }
  }

  // =============== LOAD MEAL LOG ===============
  // =============== LOAD MEAL LOG ===============
async function loadMeals() {
  try {
    const res = await api.meals.getForDate(userId, date);

    // Nếu backend trả MẢNG
    if (Array.isArray(res)) {
      const arr = res as any[];
      setItems(arr as any);
      const totalCalories = arr.reduce(
        (sum, it: any) => sum + (it.calories || 0),
        0
      );
      setTotal(totalCalories);
    } else {
      // Nếu backend trả { items, totalCalories }
      const items = (res && (res as any).items) || [];
      const totalCalories =
        (res && (res as any).totalCalories) ||
        items.reduce((sum: number, it: any) => sum + (it.calories || 0), 0);

      setItems(items);
      setTotal(totalCalories);
    }
  } catch (err) {
    console.error("loadMeals error:", err);
  }
}


  useEffect(() => {
    loadFoods("");
    loadMeals();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =============== ADD / DELETE ENTRY ==========
  async function handleAdd() {
    if (!selected) return;

    const calories = selected.calories * quantity;

    await api.meals.addEntry({
        userId,
        date,
        foodId: selected.id,
        foodName: selected.name,
        unit: selected.unit,
        quantity,
        calories,
        // macros theo số lượng
        carb: (selected.carb || 0) * quantity,
        protein: (selected.protein || 0) * quantity,
        fat: (selected.fat || 0) * quantity,
        fiber: (selected.fiber || 0) * quantity,
    });

    setQuantity(1);
    await loadMeals();
  }

  async function handleDeleteMeal(id: number) {
    await api.meals.deleteEntry(id);
    await loadMeals();
  }

  // =============== ADD NEW FOOD ================
  async function handleAddFood() {
    if (!newName.trim()) {
      alert("Vui lòng nhập tên món.");
      return;
    }
    if (!newCalories.trim()) {
      alert("Vui lòng nhập calories.");
      return;
    }
    if (!api.foods || !api.foods.add) {
      alert("API thêm món chưa sẵn sàng.");
      return;
    }

    try {
      const payload = {
        name: newName.trim(),
        unit: newUnit.trim() || "100g",
        calories: Number(newCalories) || 0,
        preparation: newPrep,
        carb: newCarb ? Number(newCarb) : undefined,
        protein: newProtein ? Number(newProtein) : undefined,
        fat: newFat ? Number(newFat) : undefined,
        fiber: newFiber ? Number(newFiber) : undefined,
      };

      const created = await api.foods.add(payload);

      // reset form
      setNewName("");
      setNewCalories("");
      setNewCarb("");
      setNewProtein("");
      setNewFat("");
      setNewFiber("");

      // reload list, ưu tiên search rỗng để dễ thấy món mới
      await loadFoods(query || "");
      // chọn luôn món vừa tạo
      if (created) {
         const newFood: FoodItem = {
            id: String(created.id),
            name: created.name,
            unit: created.unit,
            calories: created.calories,
            preparation: created.preparation,
            carb: created.carb,
            protein: created.protein,
            fat: created.fat,
            fiber: created.fiber,
       };
              setSelected(newFood);
      }

      alert("Đã thêm món mới!");
    } catch (err) {
      console.error("handleAddFood error:", err);
      alert("Thêm món thất bại (xem console).");
    }
  }
  async function handleDeleteFood(foodId: string) {
  if (!api.foods || !api.foods.delete) {
    alert("API xoá món chưa sẵn sàng.");
    return;
  }
  const yes = confirm("Bạn có chắc muốn xoá món này khỏi danh sách đồ ăn?");
  if (!yes) return;

  await api.foods.delete(foodId);

  // nếu món đang được chọn thì bỏ chọn
  if (selected && String(selected.id) === String(foodId)) {
    setSelected(null);
  }

  // reload lại danh sách món & favorite
  await loadFoods(query || "");
  await loadFavorites();
}


  // =============== FILTER LIST ================
  const favoriteSet = new Set(favorites);

  const foodsByPrep = foods.filter((f) => {
    if (prepFilter === "all") return true;
    const prep = (f.preparation || "").toLowerCase();
    if (prepFilter === "cooked") return prep === "cooked";
    if (prepFilter === "raw") return prep === "raw";
    return true;
  });

  const favoriteFoods = foodsByPrep.filter((f) =>
    favoriteSet.has(String(f.id))
  );
  const otherFoods = foodsByPrep.filter(
    (f) => !favoriteSet.has(String(f.id))
  );

  // =============== RENDER ======================
  return (
    <div style={{ padding: 24 }}>
      <h2>Log bữa ăn ({date})</h2>

      <div style={{ display: "flex", gap: 24 }}>
        {/* LEFT: search, add food, list foods */}
        <div style={{ width: 360 }}>
          <h3>Tìm món ăn</h3>
          <input
            placeholder="Nhập tên món..."
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              loadFoods(q);
            }}
            style={{ width: "100%", marginBottom: 8 }}
          />

          {/* Filter cooked / raw */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ marginRight: 8 }}>Loại:</span>
            <button
              onClick={() => setPrepFilter("all")}
              style={{ marginRight: 4 }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setPrepFilter("cooked")}
              style={{ marginRight: 4 }}
            >
              Đã nấu chín
            </button>
            <button onClick={() => setPrepFilter("raw")}>Chưa nấu</button>
          </div>

          {/* ADD NEW FOOD */}
          <div
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
              marginBottom: 12,
            }}
          >
            <h4>Thêm món mới</h4>
            <div style={{ marginBottom: 4 }}>
              <input
                placeholder="Tên món (bắt buộc)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 4 }}>
              <input
                placeholder="Đơn vị (vd: 100g, 1 miếng)"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 4 }}>
              <input
                placeholder="Calories / đơn vị (bắt buộc)"
                type="number"
                value={newCalories}
                onChange={(e) => setNewCalories(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 4 }}>
              <span>Trạng thái: </span>
              <select
                value={newPrep}
                onChange={(e) =>
                  setNewPrep(e.target.value as "cooked" | "raw")
                }
              >
                <option value="cooked">Đã nấu chín</option>
                <option value="raw">Chưa nấu</option>
              </select>
            </div>
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              (Các trường dưới đây có thể bỏ trống)
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              <input
                placeholder="Carb (g)"
                type="number"
                value={newCarb}
                onChange={(e) => setNewCarb(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Protein (g)"
                type="number"
                value={newProtein}
                onChange={(e) => setNewProtein(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              <input
                placeholder="Fat (g)"
                type="number"
                value={newFat}
                onChange={(e) => setNewFat(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Fiber (g)"
                type="number"
                value={newFiber}
                onChange={(e) => setNewFiber(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <button onClick={handleAddFood}>Lưu món mới</button>
          </div>

          {/* Favorites */}
          <h4>Món ưa thích</h4>
          {favoriteFoods.length === 0 && (
            <p style={{ fontSize: 12 }}>Chưa có món ưa thích.</p>
          )}
          <ul
            style={{
              paddingLeft: 16,
              maxHeight: 110,
              overflowY: "auto",
              marginBottom: 8,
            }}
          >
            {favoriteFoods.map((f) => (
              <li
                key={`fav-${f.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <span
                  onClick={() => setSelected(f)}
                  style={{
                    fontWeight: selected?.id === f.id ? "bold" : "normal",
                  }}
                >
                  {f.name} – {f.calories} kcal / {f.unit}{" "}
                  {f.preparation &&
                    `(${f.preparation === "cooked" ? "đã nấu" : "chưa nấu"})`}
                </span>
                <button onClick={() => handleToggleFavorite(f.id)}>★</button>
              </li>
            ))}
          </ul>

          {/* All foods except favorites */}
          <h4>Tất cả món</h4>
          <ul
            style={{
              paddingLeft: 16,
              maxHeight: 140,
              overflowY: "auto",
            }}
          >
            {otherFoods.map((f) => (
              <li
                key={f.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: 4,
                }}
              >
                <span
                  onClick={() => setSelected(f)}
                  style={{
                    flex: 1,
                    fontWeight: selected?.id === f.id ? "bold" : "normal",
                  }}
                >
                  {f.name} – {f.calories} kcal / {f.unit}{" "}
                  {f.preparation &&
                    `(${f.preparation === "cooked" ? "đã nấu" : "chưa nấu"})`}
                </span>
                <button onClick={() => handleToggleFavorite(f.id)}>☆</button>
                <button onClick={() => handleDeleteFood(f.id)}>X</button>
              </li>
            ))}
          </ul>

        </div>

        {/* RIGHT: selected food detail */}
        <div>
          <h3>Chi tiết</h3>
          {selected ? (
            <>
              <p>
                <b>{selected.name}</b>
              </p>
              <p>
                {selected.calories} kcal / {selected.unit}
              </p>
              {selected.preparation && (
                <p>
                  Trạng thái:{" "}
                  {selected.preparation === "cooked"
                    ? "Đã nấu chín"
                    : "Chưa nấu"}
                </p>
              )}
              <label>
                Số lượng:{" "}
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value) || 1)
                  }
                />
              </label>
              <p>Tổng: {selected.calories * quantity} kcal</p>

              <button onClick={handleAdd}>Thêm vào log</button>
            </>
          ) : (
            <p>Chọn món bên trái.</p>
          )}
        </div>
      </div>

      {/* MEAL LOG TABLE */}
      <div style={{ marginTop: 32 }}>
        <h3>Bữa ăn hôm nay</h3>
        <p>
          Tổng: <b>{total} kcal</b>
        </p>

        <table>
          <thead>
            <tr>
              <th>Món</th>
              <th>SL</th>
              <th>Đơn vị</th>
              <th>Kcal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.foodName}</td>
                <td>{it.quantity}</td>
                <td>{it.unit}</td>
                <td>{it.calories}</td>
                <td>
                  <button onClick={() => handleDeleteMeal(it.id)}>
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
};

type FoodItem = {
  id: string;
  name: string;
  unit: string;
  calories: number;
};

export default function MealsPage({ userId }: Props) {
  // Lấy ngày dạng YYYY-MM-DD
  const [date] = useState(() => new Date().toISOString().slice(0, 10));

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // ============================
  // TẢI DANH SÁCH MÓN ĂN
  // ============================
  async function loadFoods(q: string) {
    try {
      const res = await window.lockinAPI.meals.searchFoods(q);
      setFoods(res);
    } catch (err) {
      console.error("loadFoods error:", err);
    }
  }

  // ============================
  // TẢI BỮA ĂN TRONG NGÀY
  // ============================
  async function loadMeals() {
    try {
      const res = await window.lockinAPI.meals.getForDate(userId, date);
      setItems(res.items);
      setTotal(res.totalCalories);
    } catch (err) {
      console.error("loadMeals error:", err);
    }
  }

  // Load lần đầu tiên
  useEffect(() => {
    loadFoods("");
    loadMeals();
  }, []);

  // ============================
  // THÊM MÓN ĂN VÀO LOG
  // ============================
  async function handleAdd() {
    if (!selected) return;

    const calories = selected.calories * quantity;

    await window.lockinAPI.meals.addEntry({
      userId,
      date,
      foodId: selected.id,
      foodName: selected.name,
      unit: selected.unit,
      quantity,
      calories
    });

    setQuantity(1);
    await loadMeals();
  }

  // ============================
  // XOÁ MÓN KHỎI LOG
  // ============================
  async function handleDeleteMeal(id: number) {
    await window.lockinAPI.meals.deleteEntry(id);
    await loadMeals();
  }

  // ============================
  // UI
  // ============================
  return (
    <div style={{ padding: 24 }}>
      <h2>Log bữa ăn ({date})</h2>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Cột trái: tìm món */}
        <div style={{ width: 300 }}>
          <h3>Tìm món ăn</h3>
          <input
            placeholder="Nhập tên món..."
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              loadFoods(q);
            }}
            style={{ width: "100%", marginBottom: 12 }}
          />

          <ul style={{ paddingLeft: 16, maxHeight: 250, overflowY: "auto" }}>
            {foods.map((f) => (
              <li
                key={f.id}
                onClick={() => setSelected(f)}
                style={{
                  cursor: "pointer",
                  fontWeight: selected?.id === f.id ? "bold" : "normal"
                }}
              >
                {f.name} – {f.calories} kcal / {f.unit}
              </li>
            ))}
          </ul>
        </div>

        {/* Cột phải: chi tiết món */}
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

      {/* Log bữa ăn */}
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

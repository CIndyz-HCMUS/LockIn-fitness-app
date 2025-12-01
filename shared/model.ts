// shared/models.ts

// User dùng sau này (nếu bạn chưa có)
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

// Món ăn trong database
export interface FoodItem {
  id: string;
  name: string;
  unit: string;           // "100g", "1 phần", ...
  calories: number;       // kcal cho 1 unit
}

// Một dòng log bữa ăn
export interface MealEntry {
  id: string;
  userId: string;
  date: string;           // "2025-11-23"
  foodId: string;
  foodName: string;
  unit: string;
  quantity: number;       // số unit
  calories: number;       // total = food.calories * quantity
}

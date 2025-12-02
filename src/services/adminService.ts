// src/services/adminService.ts

declare global {
  interface Window {
    adminAPI?: {
      getStats: () => Promise<any>;
      getUsers: () => Promise<any[]>;
      getUserById: (id: number) => Promise<any>;
      updateUser: (payload: {
        id: number;
        role?: "user" | "admin";
        isLocked?: boolean;
      }) => Promise<any>;
      getActivities: () => Promise<any[]>;
      createActivity: (data: any) => Promise<any>;
      updateActivity: (id: number, data: any) => Promise<any>;
      deleteActivity: (id: number) => Promise<any>;
      getFoods: () => Promise<any[]>;
      createFood: (data: any) => Promise<any>;
      updateFood: (id: number, data: any) => Promise<any>;
      deleteFood: (id: number) => Promise<any>;
    };
  }
}

const api = window.adminAPI!;

export const adminService = {
  getStats: () => api.getStats(),
  getUsers: () => api.getUsers(),
  getUserById: (id: number) => api.getUserById(id),
  updateUser: (payload: { id: number; role?: "user" | "admin"; isLocked?: boolean }) =>
    api.updateUser(payload),

  getActivities: () => api.getActivities(),
  createActivity: (data: any) => api.createActivity(data),
  updateActivity: (id: number, data: any) => api.updateActivity(id, data),
  deleteActivity: (id: number) => api.deleteActivity(id),

  getFoods: () => api.getFoods(),
  createFood: (data: any) => api.createFood(data),
  updateFood: (id: number, data: any) => api.updateFood(id, data),
  deleteFood: (id: number) => api.deleteFood(id),
};

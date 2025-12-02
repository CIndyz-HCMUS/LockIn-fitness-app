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

      // Activity CRUD
      getActivities: () => Promise<any[]>;
      createActivity: (data: any) => Promise<any>;
      updateActivity: (id: number, data: any) => Promise<any>;
      deleteActivity: (id: number) => Promise<any>;
    };
  }
}

const api = window.adminAPI!;

export const adminService = {
  getStats: () => api.getStats(),
  getUsers: () => api.getUsers(),
  getUserById: (id: number) => api.getUserById(id),
  updateUser: (payload: {
    id: number;
    role?: "user" | "admin";
    isLocked?: boolean;
  }) => api.updateUser(payload),

  // Activity CRUD
  getActivities: () => api.getActivities(),
  createActivity: (data: any) => api.createActivity(data),
  updateActivity: (id: number, data: any) => api.updateActivity(id, data),
  deleteActivity: (id: number) => api.deleteActivity(id),
};

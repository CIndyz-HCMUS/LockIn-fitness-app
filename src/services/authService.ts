// src/services/authService.ts

declare global {
  interface Window {
    authAPI?: {
      register: (
        username: string,
        password: string,
        body?: Record<string, any>
      ) => Promise<any>;
      login: (username: string, password: string) => Promise<any>;
    };
  }
}

// Helper lấy API, có check lỗi rõ ràng
const getApi = () => {
  const api = window.authAPI;
  if (!api) {
    throw new Error("authAPI is not available. Check preload.js");
  }
  return api;
};

export const authService = {
  register: (
    username: string,
    password: string,
    body?: Record<string, any>
  ) => getApi().register(username, password, body),

  login: (username: string, password: string) =>
    getApi().login(username, password),
};

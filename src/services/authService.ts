// src/services/authService.ts

declare global {
  interface Window {
    authAPI?: {
      register: (username: string, password: string) => Promise<any>;
      login: (username: string, password: string) => Promise<any>;
    };
  }
}

const api = window.authAPI!;

export const authService = {
  register: (username: string, password: string) =>
    api.register(username, password),
  login: (username: string, password: string) => api.login(username, password),
};

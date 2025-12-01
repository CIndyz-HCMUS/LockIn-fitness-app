export {};

type AuthResult =
  | { ok: true; user: { id: string; username: string } }
  | { error: string };

declare global {
  interface LockinAPI {
    auth: {
      register: (username: string, password: string) => Promise<AuthResult>;
      login: (username: string, password: string) => Promise<AuthResult>;
    };
    meals: {
      searchFoods: (query: string) => Promise<any[]>;
      addEntry: (payload: any) => Promise<any>;
      getForDate: (
        userId: string,
        date: string
      ) => Promise<{ items: any[]; totalCalories: number }>;
         deleteEntry: (id: number) => Promise<any>;
    };
    activity: {
      getList: () => Promise<any[]>;
      add: (payload: any) => Promise<any>;
      getForDate: (
        userId: string,
        date: string
      ) => Promise<{ items: any[]; totalCalories: number }>;
      delete: (id: number) => Promise<any>;
    };


  interface Window {
    lockinAPI: LockinAPI;
  }
}

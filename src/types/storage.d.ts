type GlobalStorage = {
  getAllKeys: () => Promise<readonly string[]>;
  deleteAll(keys: string[]): Promise<void>;
  getCurrentUser(): Promise<{ _id: string } | null>;
  setCurrentUser(user: { _id: string }): Promise<void>;
};

type UserStorage = {
  set: (key: string, value: unknown) => Promise<void>;
  get: <T>(key: string) => Promise<{ cachedAt: Date; data: T } | null>;
  clear: (key: string) => Promise<void>;
  deleteAll(): Promise<void>;
};

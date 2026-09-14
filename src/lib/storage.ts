import AsyncStorage from "@react-native-async-storage/async-storage";

function createStorage(): GlobalStorage;
function createStorage(userId?: string): UserStorage;

function createStorage(userId?: string) {
  if (!userId)
    return {
      async getCurrentUser(): Promise<{ _id: string } | null> {
        const value = await AsyncStorage.getItem("rehablens:user");

        if (value) return JSON.parse(value);
        return null;
      },

      async setCurrentUser(user: { _id: string }) {
        await AsyncStorage.setItem("rehablens:user", JSON.stringify(user));
      },

      getAllKeys() {
        return AsyncStorage.getAllKeys();
      },

      deleteAll(keys: string[]) {
        return AsyncStorage.multiRemove(keys);
      },
    };

  const PREFIX = `rehablens:${userId}:`;

  return {
    async set(key: string, value: unknown) {
      const info = {
        cachedAt: new Date(),
        data: value,
      };
      await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(info));
    },

    async get<T>(key: string): Promise<{ data: T; cachedAt: Date } | null> {
      const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
      if (value) return JSON.parse(value);
      else {
        return null;
      }
    },

    async clear(key: string) {
      return await AsyncStorage.removeItem(`${PREFIX}${key}`);
    },

    async deleteAll() {
      const keys = await AsyncStorage.getAllKeys();

      const userKeys = keys.filter((key) => key.startsWith(PREFIX));

      if (userKeys.length) {
        await AsyncStorage.multiRemove(userKeys);
      }
    },
  };
}

export default createStorage;

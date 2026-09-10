import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "rehablens:";

const storage = {
  async set(key: string, value: any) {
    await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  },

  async get(key: string) {
    const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
    if (value) return JSON.parse(value);
  },

  async clear(key: string) {
    return await AsyncStorage.removeItem(`${PREFIX}${key}`);
  },
};

export default storage;

import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export default {
  async getAccess() {
    return await SecureStore.getItemAsync(ACCESS_KEY);
  },
  async setAccess(value: string) {
    await SecureStore.setItemAsync(ACCESS_KEY, value);
  },
  async getRefresh() {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setRefresh(value: string) {
    await SecureStore.setItemAsync(REFRESH_KEY, value);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

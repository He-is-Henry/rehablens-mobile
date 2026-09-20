import { config } from "@/config";
import NetInfo from "@react-native-community/netinfo";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as Device from "expo-device";
import { router } from "expo-router";
import { Platform } from "react-native";
import token from "./token";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

let isRefreshing: boolean = false;
let queue: {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const getUserAgent = (): string => {
  const osName = Device.osName || (Platform.OS === "ios" ? "iOS" : "Android");
  const osVersion = Device.osVersion || Platform.Version;
  const model =
    Device.modelName || (Platform.OS === "ios" ? "iPhone" : "Android Device");
  const brand = Device.brand ? `${Device.brand} ` : "";

  const fullDevice = model.toLowerCase().startsWith(brand.toLowerCase().trim())
    ? model
    : `${brand}${model}`.trim();

  return `RehabLens/1.0 (${fullDevice}; ${osName} ${osVersion})`;
};

const processQueue = (error: unknown, accessToken?: string) => {
  queue.forEach((promise) => {
    if (error) promise.reject(error);
    else if (accessToken) promise.resolve(accessToken);
  });
  queue = [];
};

const isNetworkAvailable = async () => {
  const state = await NetInfo.fetch();

  return !!(state.isConnected && state.isInternetReachable !== false);
};

export const api: AxiosInstance = axios.create({
  baseURL: config.baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": getUserAgent(),
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const online = await isNetworkAvailable();

    if (!online) {
      return Promise.reject(
        new AxiosError("No internet connection", "ERR_NETWORK"),
      );
    }
    const accessToken = await token.getAccess();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("login")
    ) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (!error.response) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (accessToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await token.getRefresh();
        const res = await axios.post(`${config.baseUrl}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data;

        token.setAccess(accessToken);
        token.setRefresh(newRefresh);

        isRefreshing = false;

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        const refreshErr = refreshError as AxiosError;

        if (!refreshErr.response) {
          return Promise.reject(refreshErr);
        }

        await token.clear();
        router.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

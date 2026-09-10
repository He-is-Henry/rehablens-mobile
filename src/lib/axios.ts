import { config } from "@/config";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
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

const processQueue = (error: unknown, accessToken?: string) => {
  queue.forEach((promise) => {
    if (error) promise.reject(error);
    else if (accessToken) promise.resolve(accessToken);
  });
  queue = [];
};

export const api: AxiosInstance = axios.create({
  baseURL: config.baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
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
        console.log("Tokens cleared, redirecting...");
        router.replace("/login");
        console.log("Redirect fired");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

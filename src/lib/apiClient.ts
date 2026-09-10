import { AxiosError, AxiosRequestConfig } from "axios";
import { api } from "./axios";

const handle = async <T>(fn: () => Promise<{ data: T }>): Promise<T> => {
  try {
    const res = await fn();
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    handle<T>(() => api.get(url, config)),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handle<T>(() => api.post(url, data, config)),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handle<T>(() => api.patch(url, data, config)),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    handle<T>(() => api.delete(url, config)),
};

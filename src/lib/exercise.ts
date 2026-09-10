import { AxiosError } from "axios";
import { api } from "./axios";

export const getExercises = async () => {
  try {
    const res = await api.get("/exercise");
    const data: Exercise[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

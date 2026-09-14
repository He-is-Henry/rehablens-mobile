import { apiClient } from "./apiClient";

export const getExercises = async () => apiClient.get<Exercise[]>("/exercise");

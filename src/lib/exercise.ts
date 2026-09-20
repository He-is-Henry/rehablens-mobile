import { apiClient } from "./apiClient";

export const getExercises = async () => apiClient.get<Exercise[]>("/exercise");

export const getExerciseById = async (id: string) =>
  apiClient.get<Exercise>(`/exercise/${id}`);

export const createExercise = async (dto: CreateExercisePayload) =>
  apiClient.post<Exercise>("/exercise", dto);

export const updateExercise = async (
  id: string,
  dto: Partial<CreateExercisePayload>,
) => apiClient.patch<Exercise>(`/exercise/${id}`, dto);

export const deleteExercise = async (id: string) =>
  apiClient.delete<{ message: string }>(`/exercise/${id}`);

export const getDeletedExercises = async () =>
  apiClient.get<Exercise[]>("/exercise/deleted");

export const restoreExercise = async (id: string) =>
  apiClient.patch<Exercise>(`/exercise/${id}/restore`);

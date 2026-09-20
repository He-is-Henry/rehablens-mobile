import { useQuery } from "@/hooks/useQuery";
import { getDeletedExercises, getExercises } from "@/lib/exercise";

export const useExerciseQuery = {
  getExercises: () =>
    useQuery<Exercise[]>({
      key: "/exercise",
      fetcher: getExercises,
    }),

  getDeletedExercises: () =>
    useQuery<Exercise[]>({
      key: "/exercise/deleted",
      fetcher: getDeletedExercises,
    }),
};

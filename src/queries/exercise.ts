import { useQuery } from "@/hooks/useQuery";
import { getExercises } from "@/lib/exercise";

export const useExerciseQuery = {
  getExercises: () =>
    useQuery<Exercise[]>({
      key: "/exercise",
      fetcher: getExercises,
    }),
};

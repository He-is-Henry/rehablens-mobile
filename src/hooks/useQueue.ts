import { useAuth } from "@/context/auth.context";

interface QueueItem<T> {
  payload: T;
  queuedAt: number;
}

export function createQueue<T>(key: string) {
  return {
    useQueue: () => {
      const { requireStorage } = useAuth();

      const enqueue = async (payload: T) => {
        const storage = requireStorage();
        const existing = await storage.get<QueueItem<T>[]>(key);
        const queue = existing?.data ?? [];
        queue.push({ payload, queuedAt: Date.now() });
        await storage.set(key, queue);
      };

      const dequeue = async (): Promise<QueueItem<T>[]> => {
        const storage = requireStorage();
        const existing = await storage.get<QueueItem<T>[]>(key);
        return existing?.data ?? [];
      };

      const clear = async (remaining: QueueItem<T>[]) => {
        const storage = requireStorage();
        await storage.set(key, remaining);
      };

      return { enqueue, dequeue, clear };
    },
  };
}

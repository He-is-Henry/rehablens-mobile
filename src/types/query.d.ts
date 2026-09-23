type Key = string;

type Query<T> = {
  key: Key;
  fetcher: () => Promise<T>;
  pollInterval?: number;
  enabled?: boolean;
  revalidate?: boolean;
};

type NewData<T> = T | ((prev: T | null) => T);

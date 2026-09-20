type Key = string;

type Query<T> = {
  key: Key;
  fetcher: () => Promise<T>;
  pollInterval?: number;
};

type NewData<T> = T | ((prev: T | null) => T);

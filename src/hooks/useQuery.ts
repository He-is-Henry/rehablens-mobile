import { useAuth } from "@/context/auth.context";
import { useNetwork } from "@/context/network.context";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export function useQuery<T extends object>({
  key,
  fetcher,
  pollInterval,
  enabled = true,
  revalidate = true,
}: Query<T>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);

  const { requireStorage, user } = useAuth();
  const { isOnline } = useNetwork();

  const setCachedData = async (data: T) => {
    const storage = requireStorage();
    await storage.set(key, data);
  };

  const updateData = (newData: NewData<T>): T => {
    const newDataValue =
      typeof newData === "function"
        ? (newData as (prev: T | null) => T)(data)
        : newData;

    setData(newDataValue);
    setCachedData(newDataValue);
    return newDataValue;
  };

  const getCachedData = async (): Promise<T | null> => {
    if (!enabled) return null;
    try {
      const storage = requireStorage();
      const cachedData = await storage.get<T>(key);
      if (cachedData) {
        setData(cachedData.data);
        setLoading(false);
        return cachedData.data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const getFreshData = async (showError = false, cachedValue?: T | null) => {
    const hasData = cachedValue !== undefined ? cachedValue : data;

    if (!enabled || (!revalidate && hasData)) {
      setLoading(false);
      return;
    }
    if (!isOnline)
      return Toast.show({
        type: "error",
        text1: "No internet connection",
        text2: "Please try again when you're back online",
      });

    try {
      const resData = await fetcher();
      setData(resData);
      setCachedData(resData);
    } catch (e: any) {
      if (showError)
        Toast.show({
          type: "error",
          text1: "Couldn't load data",
          text2: e.message,
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const runQuery = async () => {
      const cached = await getCachedData();

      if (isOnline) {
        await getFreshData(true, cached);
      } else {
        setLoading(false);
      }
    };

    runQuery();
    if (pollInterval && isOnline) {
      const intervalId = setInterval(() => {
        getFreshData();
      }, pollInterval);
      return () => clearInterval(intervalId);
    }
  }, [key, isOnline, user, pollInterval, enabled, revalidate]);

  return {
    data,
    setData: updateData,
    loading,
    refreshData: getFreshData,
  };
}

import { useAuth } from "@/context/auth.context";
import { useNetwork } from "@/context/network.context";
import createStorage from "@/lib/storage";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export function useQuery<T extends object>({
  key,
  fetcher,
  pollInterval,
}: Query<T>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);

  const { requireStorage, user } = useAuth();
  const { isOnline } = useNetwork();

  const getCachedData = async () => {
    try {
      const storage = requireStorage();

      const cachedData = await storage.get<T>(key);

      if (cachedData) {
        setData(cachedData.data);
        // if cache is available, let app show data, and silently refresh
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const getFreshData = async (showError = false) => {
    if (!isOnline)
      return Toast.show({
        type: "error",
        text1: "No internet connection",
        text2: "Please try again when you're back online",
      }); // do not fetch is user is offline, the overhead and round trip is not needed
    // TODO: add a queue here later

    try {
      const resData = await fetcher(); // actual data of type T, returned

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
      const globalStorage = createStorage();
      setLoading(false);
      return;
    }

    const runQuery = async () => {
      await getCachedData();

      if (isOnline) {
        await getFreshData(true);
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
  }, [key, isOnline, user, pollInterval]);

  return {
    data,
    setData: updateData,
    loading,
    refreshData: getFreshData,
  };
}

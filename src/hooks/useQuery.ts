import { useAuth } from "@/context/auth.context";
import { useNetwork } from "@/context/network.context";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export function useQuery<T extends object>({ key, fetcher }: Query<T>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);

  const { requireStorage } = useAuth();
  const { isOnline } = useNetwork();

  const storage = requireStorage();

  const getCachedData = async () => {
    console.log("Getting cached data...");
    const cachedData = await storage.get<T>(key);

    if (cachedData) {
      setData(cachedData.data);
      // if cache is available, let app show data, and silently refresh
      setLoading(false);
    }
  };

  const setCachedData = async (data: T) => await storage.set(key, data);

  const updateData = (newData: NewData<T>): T => {
    console.log("Updating cache");

    const newDataValue =
      typeof newData === "function"
        ? (newData as (prev: T | null) => T)(data)
        : newData;

    setData(newDataValue);
    setCachedData(newDataValue);
    return newDataValue;
  };

  const getFreshData = async () => {
    console.log("Getting fresh data");
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
    getCachedData();
    getFreshData();
  }, [isOnline]);

  return {
    data,
    setData: updateData,
    loading,
    refreshData: getFreshData,
  };
}

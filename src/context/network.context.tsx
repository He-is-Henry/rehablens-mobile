import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

type NetworkContextType = {
  isOnline: boolean;
  isChecking: boolean;
  recheck: () => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOnlineRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setIsOnline(online);

        // don't notify on first load, only on actual changes
        if (!initializedRef.current) {
          initializedRef.current = true;
          prevOnlineRef.current = online;
          return;
        }

        if (online && !prevOnlineRef.current) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Back online',
              body: 'Your connection has been restored.',
            },
            trigger: null,
          });
        } else if (!online && prevOnlineRef.current) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'You\'re offline',
              body: 'Showing cached data. Changes will sync when you reconnect.',
            },
            trigger: null,
          });
        }

        prevOnlineRef.current = online;
      }, 3000); // 3 second debounce — ignores flaky connection blips
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const recheck = async () => {
    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <NetworkContext.Provider value={{ isOnline, isChecking, recheck }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};
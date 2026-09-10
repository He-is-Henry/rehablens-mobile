import NetInfo from '@react-native-community/netinfo';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type NetworkContextType = {
  isOnline: boolean;
  isChecking: boolean;
  recheck: () => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can be true while isInternetReachable is unknown/false —
      // treat "online" as actually reachable, not just connected to a network
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });

    return () => unsubscribe();
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
}; 3

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};
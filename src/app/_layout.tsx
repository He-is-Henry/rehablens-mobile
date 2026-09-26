import OfflineBanner from '@/components/offlineBanner';
import { OutdatedBanner } from '@/components/OutdatedBanner';
import { UpdateBanner } from '@/components/UpdateBanner';
import { AuthProvider } from '@/context/auth.context';
import { NetworkProvider, useNetwork } from '@/context/network.context';
import { useSessionQueue } from '@/hooks/useSessionQueue';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

function FlushOnReconnect() {

  const { flush } = useSessionQueue();
  const { isOnline } = useNetwork()

  useEffect(() => {
    flush();
  }, [isOnline]);

  return null;
}



export default function RootLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permissions denied.');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('general', {
          name: "General",
          importance: Notifications.AndroidImportance.HIGH,
        })

      }
    };

    setupNotifications();
  }, []);


  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <FlushOnReconnect />
          <StatusBar style="dark" />
          <OfflineBanner />
          <OutdatedBanner />
          <UpdateBanner />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
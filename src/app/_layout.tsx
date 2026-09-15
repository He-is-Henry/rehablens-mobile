import OfflineBanner from '@/components/offlineBanner';
import { UpdateBanner } from '@/components/UpdateBanner';
import { AuthProvider } from '@/context/auth.context';
import { NetworkProvider } from '@/context/network.context';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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

export default function RootLayout() {
  console.log('ROOT LAYOUT MOUNTED');

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
    };

    setupNotifications();
  }, []);


  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <OfflineBanner />
          <UpdateBanner />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
import OfflineBanner from '@/components/offlineBanner';
import { AuthProvider } from '@/context/auth.context';
import { NetworkProvider } from '@/context/network.context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';


export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
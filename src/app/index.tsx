import { colors } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { UserRoleValues } from '@/types/role';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }



    switch (user.role) {
      case UserRoleValues.HOSPITAL_ADMIN:
        router.replace(
          '/(hospital)/(tabs)/dashboard'
        );
        break;

      case UserRoleValues.STAFF:
        router.replace(
          '/(staff)/(tabs)/dashboard'
        );
        break;

      case UserRoleValues.PATIENT:
        router.replace(
          '/(patient)/(tabs)/dashboard'
        );
        break;

      case UserRoleValues.ADMIN:
        router.replace('/(admin)/(tabs)/dashboard');
        break;

      default:
        router.replace('/(auth)/login');
    }
  }, [user, loading]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator
        size="large"
        color={colors.primary}
      />
    </View>
  );
}
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { patchToken } from "./auth";

export async function getPushToken(
  requestIfMissing = true,
): Promise<string | undefined> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted" && requestIfMissing) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return undefined;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    console.log("Token retrieved: ", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("Failed to retrieve push token:", error);
    return undefined;
  }
}

export async function syncPushToken(currentSessionToken?: string | null) {
  try {
    const deviceToken = await getPushToken(false);

    if (deviceToken && deviceToken !== currentSessionToken) {
      console.log(
        "Token not matching",
        { deviceToken, currentSessionToken },
        "Syncing...",
      );
      await patchToken(deviceToken);
    }
  } catch (err) {
    console.error("PUSH TOKEN SYNC ERROR:", err);
  }
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

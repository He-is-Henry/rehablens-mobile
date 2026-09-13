import { api } from "@/lib/axios";
import createStorage from "@/lib/storage";
import token from "@/lib/token";
import { AxiosError } from "axios";
import { router, usePathname } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(
    null
  );

  const initialized = useRef(false);

  const pathname = usePathname();

  const globalStorage = createStorage();

  const userStorage = activeUserId
    ? createStorage(activeUserId)
    : null

  /**
   * Restore the active user ID from global storage.
   */
  useEffect(() => {

    const initState = async () => {
      try {

        const savedUser = await globalStorage.getCurrentUser();


        if (!savedUser?._id) {

          setLoading(false);
          return;
        }

        setActiveUserId(savedUser._id);
      } catch (err) {
        console.error(
          "AUTH INIT: failed:",
          err
        );

        setLoading(false);
      }
    };

    initState();
  }, []);

  /**
   * Redirect users who must change their initial password.
   */
  useEffect(() => {
    if (!user?.mustChangePassword) return;

    if (pathname === "/change-initial-password") return;

    router.replace("/(auth)/change-initial-password");
  }, [user?.mustChangePassword, pathname]);

  /**
   * Restore cached user/session data and fetch fresh profile data.
   */
  useEffect(() => {


    if (!activeUserId || !userStorage) {
      return;
    }

    if (initialized.current) {
      return;
    }

    initialized.current = true;


    const fetchCurrentUser = async () => {
      const cachedUser =
        await userStorage.get<User>("user");

      const cachedSessions =
        await userStorage.get<Session[]>("sessions");


      if (cachedUser) {
        setUser(cachedUser.data);
        setSessions(cachedSessions?.data ?? []);
        setLoading(false);
      }

      try {

        const res = await api.get("auth/profile");

        const profileRes: ProfileRes = res.data;

        setUser(profileRes.user);

        await userStorage.set(
          "user",
          profileRes.user
        );

        setSessions(profileRes.sessions);

        await userStorage.set(
          "sessions",
          profileRes.sessions
        );

      } catch (err) {
        console.error(
          "AUTH PROFILE: fetch failed:",
          err
        );
      } finally {
        if (!cachedUser) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();
  }, [activeUserId]);

  /**
   * Set authentication state after login.
   */
  const setAuth = async (
    accessToken: string,
    refreshToken: string,
    userData: User
  ) => {
    setLoading(true);
    token.setAccess(accessToken);
    token.setRefresh(refreshToken);

    setUser(userData);

    setActiveUserId(userData._id);

    await globalStorage.setCurrentUser({
      _id: userData._id,
    });

    await createStorage(userData._id).set(
      "user",
      userData
    );


    setLoading(false);

  };

  /**
   * Update sessions both in state and cache.
   */
  const setSessionsData = (sessionsData: Session[]) => {
    setSessions(sessionsData);

    if (userStorage) {
      userStorage.set("sessions", sessionsData);
    }
  };

  /**
   * Update user both in state and cache.
   */
  const setUserData = (userData: User) => {
    setUser(userData);

    if (userStorage) {
      userStorage.set("user", userData);
    }
  };

  /**
   * Clear authentication state and user cache.
   */
  const clearAuth = async () => {
    await token.clear();

    if (userStorage) {
      await userStorage.clear("user");
      await userStorage.clear("sessions");
    }

    await globalStorage.deleteAll([
      "rehablens:user",
    ]);

    setUser(null);
    setSessions([]);
    setActiveUserId(null);

    initialized.current = false;
  };

  /**
   * Update the authenticated user's profile.
   */
  const editProfile = async (
    payload: EditProfilePayload
  ): Promise<User> => {
    try {
      const res = await api.patch(
        "auth/profile",
        payload
      );

      const updatedUser: User =
        res.data.user ?? res.data;

      setUser(updatedUser);

      if (userStorage) {
        await userStorage.set(
          "user",
          updatedUser
        );
      }

      return updatedUser;
    } catch (e) {
      const err =
        e as AxiosError<{ message: string }>;

      console.error(
        "Edit profile failed:",
        err
      );

      throw new Error(
        err.response?.data?.message ??
        "Something went wrong"
      );
    }
  };

  const requireStorage = (): UserStorage => {
    if (!userStorage) {
      throw new Error(
        "User storage is not available"
      );
    }

    return userStorage;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessions,
        loading,
        setAuth,
        setUserData,
        setSessionsData,
        clearAuth,
        editProfile,
        requireStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used with its provider"
    );
  }

  return context;
};
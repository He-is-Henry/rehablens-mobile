import { api } from "@/lib/axios";
import storage from "@/lib/storage";
import token from "@/lib/token";
import { AxiosError } from "axios";
import { router, usePathname } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const initialized = useRef<boolean>(false);

  const pathname = usePathname();

  useEffect(() => {
    if (!user?.mustChangePassword) return;
    if (pathname === "/change-initial-password") return;
    router.replace("/(auth)/change-initial-password");
  }, [user?.mustChangePassword, pathname]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;




    const fetchCurrentUser = async () => {
      const cachedUser: User | null = await storage.get('user') ?? null;

      const cachedSessions: Session[] | null = await storage.get('sessions');
      if (cachedUser) {
        setUser(cachedUser);
        setSessions(cachedSessions ?? []);
        setLoading(false);
      }

      try {
        const res = await api.get('auth/profile');
        const profileRes: ProfileRes = res.data;

        setUser(profileRes.user);
        storage.set('user', profileRes.user);

        setSessions(profileRes.sessions);
        storage.set('sessions', profileRes.sessions)

      } catch (err) {
        console.log('Profile fetch failed:', err);
      } finally {
        if (!cachedUser) setLoading(false);
      }

    }

    fetchCurrentUser();
  }, [])


  const setAuth = (accessToken: string, refreshToken: string, userData: User) => {
    token.setAccess(accessToken);
    token.setRefresh(refreshToken);

    setUser(userData);
    storage.set('user', userData)
  }

  const setSessionsData = (sessionsData: Session[]) => {
    setSessions(sessionsData)
    storage.set('sessions', sessionsData)
  }

  const setUserData = (userData: User) => {
    setUser(userData);
    storage.set('user', userData)
  }

  const clearAuth = async () => {
    await token.clear();
    await storage.clear('user');
    await storage.clear('sessions');
    setUser(null);
  };

  const editProfile = async (payload: EditProfilePayload): Promise<User> => {
    try {
      const res = await api.patch("auth/profile", payload);
      const updatedUser: User = res.data.user ?? res.data;

      setUser(updatedUser);
      await storage.set("user", updatedUser);
      return updatedUser;
    } catch (e) {
      const err = e as AxiosError<{ message: string }>;
      console.error("Edit profile failed:", err);
      throw new Error(err.response?.data?.message ?? "Something went wrong");
    }
  };

  return <AuthContext.Provider value={{
    user,
    sessions,
    loading,
    setAuth,
    setUserData,
    setSessionsData,
    clearAuth,
    editProfile
  }}>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used with it's provider");

  return context
}
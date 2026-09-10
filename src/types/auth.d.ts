interface Session {
  _id: string;
  ipAddress: string;
  deviceInfo: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  currentDevice?: boolean;
}

interface RefreshResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  session: Session;
}

interface ProfileRes {
  user: User;
  sessionCount: number;
  sessions: Session[];
}

interface User {
  _id: string;
  email: string;
  name: string;
  customId: string;
  role: "admin" | "hospital_admin" | "staff" | "patient";
  hospitalId?: string;
  isActive: boolean;
  isPioneer: boolean;
  mustChangePassword: boolean;
}

type EditProfilePayload = {
  name?: string;
  email?: string;
};

interface AuthContextType {
  user: User | null;
  sessions: Session[];
  loading: boolean;
  setAuth: (accessToken: string, refreshToken: string, userData: User) => void;
  setUserData: (userData: User) => void;
  setSessionsData: (sessionsData: Session[]) => void;
  clearAuth: () => void;
  editProfile: (payload: EditProfilePayload) => Promise<User>;
}

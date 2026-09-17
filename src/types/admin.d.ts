type AdminStats = {
  totalHospitals: number;
  totalStaff: number;
  totalPatients: number;
  totalSessions: number;
  registeredToday: number;
  sessionsToday: number;
};

type AdminRequestStats = {
  totalRequests: number;
  avgDuration: number;
  errorCount: number;
  slowestEndpoints: {
    _id: { method: string; url: string };
    avgDuration: number;
    count: number;
  }[];
  errorProneEndpoints: {
    _id: { method: string; url: string };
    total: number;
    errors: number;
    errorRate: number;
  }[];
};

type DayCount = {
  _id: string; // 'YYYY-MM-DD'
  count: number;
};

interface Link {
  _id: string;
  patientId: User;
  hospitalId: User;
  staffId?: User;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Hospital {
  _id: string;
  customId: string;
  address: string;
  name: string;
  email: string;
}

interface Schedule {
  _id: string;
  patientId: string;
  assignmentId: Assignment;
  scheduledDate: string; // YYYY-MM-DD
  minSessions: number;
  maxSessions: number;
  completedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

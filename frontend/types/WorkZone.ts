export interface WorkZoneAssignedUser {
  id: string;
  matricula: string;
  fullName: string;
}

export interface WorkZone {
  id: string;
  name: string;
  createdAt: string;
  polygon: [number, number][] | null;
  scheduledStartAt: string | null;
  completedAt: string | null;
  forcedCompletion: boolean;
  completedByUserId: string | null;
  assignedUsers: { user: WorkZoneAssignedUser }[];
  _count: { spotHoles: number };
}

export type Role = "VIEWER" | "ADDER" | "REPAIRER" | "ADMIN";

export interface AuthUser {
  id: string;
  matricula: string;
  email: string | null;
  fullName: string;
  role: Role;
  imgUserPath: string | null;
}

export interface CollaboratorLocation {
  id: string;
  fullName: string;
  imgUserPath: string | null;
  lat: number;
  lng: number;
  status: "online" | "offline";
}

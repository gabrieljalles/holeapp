export interface HoleBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface ClusterPoint {
  lat: number;
  lng: number;
  count: number;
  status: string;
}

export type HolesResponse =
  | { type: "points"; points: Spot[] }
  | { type: "cluster"; points: ClusterPoint[] };

export interface Spot {
  id: string;
  lat: number;
  lng: number;
  status: string;
  number: string;
  vereador: boolean;
  simSystem: boolean;
  bigHole: boolean;
  observation: string;
  address: string;
  cep: string;
  createdAt: string;
  createdBy: string;
  district: string;
  fixedAt: string;
  fixedBy: string;
  imgAfterWorkPath: string;
  imgBeforeWorkPath: string;
  priority: string;
  size: string;
  trafficIntensity: string;
  zone: string;
  workZoneId?: string | null;
  createdByUser?: { matricula: string; fullName: string } | null;
  fixedByUser?: { matricula: string; fullName: string } | null;
}
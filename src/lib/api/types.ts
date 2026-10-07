export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
}

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Radiology {
  _id: string;
  name: string;
  category: Category | string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableRadiology {
  radiology: Radiology | string;
  price: number;
  salePrice: number;
}

export interface WorkScheduleEntry {
  weekday: number;
  openTime: number;
  closeTime: number;
}

export type ReservationState = "pending" | "complete" | "missed";

export interface Reservation {
  _id: string;
  state: ReservationState;
  date: string;
  notes?: string;
  client: Client | string;
  branch: Branch | string;
  radiologies: (Radiology | string)[];
  fromPartner: Partner | string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  _id: string;
  name: string;
  address: string;
  availableRadiology: AvailableRadiology[];
  workSchedule: WorkScheduleEntry[];
  reservations: (Reservation | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfitShare {
  _id?: string;
  category: Category | string;
  value: number;
}

export interface Partner {
  _id: string;
  name: string;
  clients: string[];
  profitShare: ProfitShare[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  name: string;
  age: number;
  phoneNumber: string;
  reservations: Reservation[];
}

export function isPopulatedCategory(
  value: Category | string,
): value is Category {
  return typeof value === "object" && value !== null && "_id" in value;
}

export function isPopulatedRadiology(
  value: Radiology | string,
): value is Radiology {
  return typeof value === "object" && value !== null && "_id" in value;
}

export function isPopulatedBranch(value: Branch | string): value is Branch {
  return typeof value === "object" && value !== null && "_id" in value;
}

export function isPopulatedPartner(value: Partner | string): value is Partner {
  return typeof value === "object" && value !== null && "_id" in value;
}

export function isPopulatedClient(value: Client | string): value is Client {
  return typeof value === "object" && value !== null && "_id" in value;
}

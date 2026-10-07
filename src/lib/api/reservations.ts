import { api } from "./axios";
import type { ApiResponse, Reservation, ReservationState } from "./types";

export interface ReservationPayload {
  date: string;
  notes?: string;
  branch: string;
  radiologies: string[];
  fromPartner: string;
  clientName: string;
  clientAge: number;
  clientPhone: string;
}

export async function getReservations(): Promise<Reservation[]> {
  const response = await api.get<ApiResponse<Reservation[]>>("/reservations");
  return response.data.data;
}

export async function createReservation(
  payload: ReservationPayload,
): Promise<Reservation> {
  const response = await api.post<ApiResponse<Reservation>>(
    "/reservations",
    payload,
  );
  return response.data.data;
}

export async function updateReservationState(
  id: string,
  state: ReservationState,
): Promise<Reservation> {
  const response = await api.patch<ApiResponse<Reservation>>(
    `/reservations/${id}/state`,
    { state },
  );
  return response.data.data;
}

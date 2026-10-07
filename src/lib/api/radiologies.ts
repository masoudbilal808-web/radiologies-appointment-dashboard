import { api } from "./axios";
import type { ApiResponse, Radiology } from "./types";

export async function getRadiologies(): Promise<Radiology[]> {
  const response = await api.get<ApiResponse<Radiology[]>>("/radiologies");
  return response.data.data;
}

export async function createRadiology(payload: {
  name: string;
  category: string;
}): Promise<Radiology> {
  const response = await api.post<ApiResponse<Radiology>>(
    "/radiologies",
    payload,
  );
  return response.data.data;
}

export async function updateRadiology(
  id: string,
  payload: { name?: string; category?: string },
): Promise<Radiology | null> {
  const response = await api.put<ApiResponse<Radiology | null>>(
    `/radiologies/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deleteRadiology(id: string): Promise<void> {
  await api.delete(`/radiologies/${id}`);
}

import { api } from "./axios";
import type {
  ApiResponse,
  AvailableRadiology,
  Branch,
  WorkScheduleEntry,
} from "./types";

export interface BranchPayload {
  name: string;
  address: string;
  availableRadiology?: {
    radiology: string;
    price: number;
    salePrice: number;
  }[];
  workSchedule?: WorkScheduleEntry[];
}

export async function getBranches(): Promise<Branch[]> {
  const response = await api.get<ApiResponse<Branch[]>>("/branches");
  return response.data.data;
}

export async function getBranch(id: string): Promise<Branch> {
  const response = await api.get<ApiResponse<Branch>>(`/branches/${id}`);
  return response.data.data;
}

export async function createBranch(payload: BranchPayload): Promise<Branch> {
  const response = await api.post<ApiResponse<Branch>>("/branches", payload);
  return response.data.data;
}

export async function updateBranch(
  id: string,
  payload: Partial<BranchPayload>,
): Promise<Branch | null> {
  const response = await api.put<ApiResponse<Branch | null>>(
    `/branches/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deleteBranch(id: string): Promise<void> {
  await api.delete(`/branches/${id}`);
}

export type { AvailableRadiology };

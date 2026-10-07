import { api } from "./axios";
import type { ApiResponse, Partner, ProfitShare } from "./types";

export interface PartnerPayload {
  name: string;
  profitShare: { category: string; value: number }[];
}

export async function getPartners(): Promise<Partner[]> {
  const response = await api.get<ApiResponse<Partner[]>>("/partners");
  return response.data.data;
}

export async function createPartner(payload: PartnerPayload): Promise<Partner> {
  const response = await api.post<ApiResponse<Partner>>("/partners", payload);
  return response.data.data;
}

export async function updatePartner(
  id: string,
  payload: Partial<PartnerPayload>,
): Promise<Partner | null> {
  const response = await api.put<ApiResponse<Partner | null>>(
    `/partners/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deletePartner(id: string): Promise<void> {
  await api.delete(`/partners/${id}`);
}

export type { ProfitShare };

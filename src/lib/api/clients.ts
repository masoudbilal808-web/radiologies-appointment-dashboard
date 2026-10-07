import { api } from "./axios";
import type { ApiResponse, Client } from "./types";

export async function getClients(): Promise<Client[]> {
  const response = await api.get<ApiResponse<Client[]>>("/clients");
  return response.data.data;
}

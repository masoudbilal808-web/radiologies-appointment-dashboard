import { api } from "./axios";
import type { ApiResponse, AuthResponse } from "./types";

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
    username,
    password,
  });
  return response.data.data;
}

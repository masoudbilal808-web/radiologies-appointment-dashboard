import { api } from "./axios";
import type { ApiResponse, Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>("/categories");
  return response.data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post<ApiResponse<Category>>("/categories", {
    name,
  });
  return response.data.data;
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<Category | null> {
  const response = await api.put<ApiResponse<Category | null>>(
    `/categories/${id}`,
    { name },
  );
  return response.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

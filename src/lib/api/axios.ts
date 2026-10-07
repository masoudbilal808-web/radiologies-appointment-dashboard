import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearSession, getToken } from "@/lib/auth/session";
import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

function getLocaleFromPath(): string {
  if (typeof window === "undefined") return "en";
  const first = window.location.pathname.split("/")[1];
  return first === "ar" ? "ar" : "en";
}

function handleUnauthorized(): void {
  clearSession();
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (!path.includes("/login")) {
    // Outside React tree (axios interceptor) — cannot use useRouter here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${getLocaleFromPath()}/login`);
  }
}

function toApiError(response: AxiosResponse): ApiError {
  const status = response.status;
  const data = response.data as Partial<ApiResponse<unknown>> | null | undefined;

  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    data.success === false
  ) {
    return new ApiError(
      data.message ?? "Unknown error",
      data.statusCode ?? status,
      data.errors,
    );
  }

  return new ApiError(`Request failed with status ${status}`, status);
}

api.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return {
        ...response,
        status: 204,
        data: {
          success: true,
          statusCode: 204,
          message: "No Content",
          data: null,
        },
      } as AxiosResponse<ApiResponse<null>>;
    }

    const body = response.data as
      | Partial<ApiResponse<unknown>>
      | null
      | undefined;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      body.success === false
    ) {
      return Promise.reject(toApiError(response));
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      if (error.response.status === 401) {
        handleUnauthorized();
      }
      return Promise.reject(toApiError(error.response));
    }

    return Promise.reject(new ApiError("Network Error", 0));
  },
);

export { api };

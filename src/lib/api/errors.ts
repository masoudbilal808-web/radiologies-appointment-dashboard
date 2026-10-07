export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors?: string[];

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const MESSAGE_KEYS: Record<string, string> = {
  "Access denied. No token provided.": "sessionExpired",
  "Invalid or expired token.": "sessionExpired",
  "Invalid credentials": "invalidCredentials",
  "Username is required & Password is required": "authFieldsRequired",
  "Username must be at least 3 characters": "usernameTooShort",
  "Password must be at least 6 characters": "passwordTooShort",
  "Username already exists": "usernameExists",
  "this category is already exist": "categoryExists",
  "this branch is already exist": "branchExists",
  "this Partner is already exist": "partnerExists",
  "category not found": "notFound",
  "Branch not found": "notFound",
  "radiology not found": "notFound",
  "partner not found": "notFound",
  "Reservation not found": "notFound",
  "invalid category id": "invalidId",
  "invalid radiology id": "invalidId",
  "invalid branch id": "invalidId",
  "invalid partner id": "invalidId",
  "Invalid partner id": "invalidId",
  "invalid reservation id": "invalidId",
  "invalid brunch id": "invalidId",
  "state must be complete, pending or missed": "invalidState",
  "route not defined": "notFound",
};

export function mapApiErrorToKey(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  return MESSAGE_KEYS[error.message] ?? null;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const key = MESSAGE_KEYS[error.message];
    if (key) return key;
    if (error.errors && error.errors.length > 0) {
      return error.errors.join(" • ");
    }
    return error.message;
  }
  if (error instanceof Error && error.message === "Network Error") {
    return "networkError";
  }
  return "genericError";
}

import "server-only";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function publicError(error: unknown) {
  if (error instanceof AppError)
    return { code: error.code, message: error.message, status: error.status };
  if (error instanceof ZodError)
    return {
      code: "INVALID_INPUT",
      message: "Please check the information provided.",
      status: 400,
    };
  // Deliberately omit Prisma messages, SQL, credentials and submitted customer data.
  return {
    code: "UNAVAILABLE",
    message:
      "This service is temporarily unavailable. Please try again or contact Florins.",
    status: 503,
  };
}

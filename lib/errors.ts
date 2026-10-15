import { ZodError } from "zod";

export class AppError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.message, code: error.code }, {
      status: error.status,
      headers: error.code === "RATE_LIMITED" ? { "Retry-After": "60" } : undefined,
    });
  }
  if (error instanceof ZodError) {
    return Response.json(
      { error: "The request payload is invalid", code: "INVALID_REQUEST" },
      { status: 400 },
    );
  }
  if (error instanceof SyntaxError) {
    return Response.json({ error: "The request payload is invalid", code: "INVALID_REQUEST" }, { status: 400 });
  }
  // Do not serialize unknown errors: Firebase and payment SDK errors can carry
  // credentials, request headers, or provider internals.
  return Response.json({ error: "Unexpected server error", code: "INTERNAL_ERROR" }, { status: 500 });
}

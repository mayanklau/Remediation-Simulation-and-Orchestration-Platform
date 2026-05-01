import { toErrorResponse } from "@/lib/errors";

export function apiHandler(handler: (request: Request, context?: unknown) => Promise<Response>) {
  return async (request: Request, context?: unknown) => {
    try {
      const response = await handler(request, context);
      response.headers.set("x-request-id", request.headers.get("x-request-id") ?? crypto.randomUUID());
      response.headers.set("x-correlation-id", request.headers.get("x-correlation-id") ?? response.headers.get("x-request-id") ?? crypto.randomUUID());
      return response;
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

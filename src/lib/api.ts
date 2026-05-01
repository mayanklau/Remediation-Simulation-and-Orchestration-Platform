import { toErrorResponse } from "@/lib/errors";

export function apiHandler(handler: (request: Request, context?: unknown) => Promise<Response>) {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

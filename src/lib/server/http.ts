import "server-only";
import { AppError, publicError } from "./errors";
export const privateHeaders = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AppError("CONTENT_TYPE", "Use application/json.", 415);
  if (Number(request.headers.get("content-length")) > 16_384)
    throw new AppError("TOO_LARGE", "Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader)
    throw new AppError("INVALID_INPUT", "A request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16_384) {
      await reader.cancel();
      throw new AppError("TOO_LARGE", "Request is too large.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new AppError("INVALID_INPUT", "Invalid JSON request.");
  }
}
export async function api(operation: () => Promise<unknown>) {
  try {
    return Response.json(
      { ok: true, data: await operation() },
      { headers: privateHeaders },
    );
  } catch (error) {
    const failure = publicError(error);
    return Response.json(
      { ok: false, error: { code: failure.code, message: failure.message } },
      {
        status: failure.status,
        headers: {
          ...privateHeaders,
          ...(failure.status === 429 ? { "Retry-After": "900" } : {}),
        },
      },
    );
  }
}

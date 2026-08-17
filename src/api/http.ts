/**
 * Transport-agnostic HTTP types. The Application API's request-handling logic is
 * written against these small shapes — not against any web framework — so it is pure,
 * unit-testable in-process (no network), and can be mounted behind Next.js route
 * handlers, a plain Node server, or Cloud Run without change. The framework is the
 * swappable edge; the handlers are the tested core.
 */
export interface HttpRequest {
  method: string;
  path: string;
  /** Path params captured by the router (e.g. { accountId } ). */
  params: Record<string, string>;
  /** Query-string params (e.g. { brand } ), parsed by the router. */
  query: Record<string, string>;
  /** Request headers, lower-cased keys (e.g. { authorization } ). */
  headers: Record<string, string>;
  /** Parsed JSON body, if any. */
  body?: unknown;
}

export const unauthorized = (message = 'authentication required'): HttpResponse => json(401, { error: message });
export const forbidden = (message = 'forbidden'): HttpResponse => json(403, { error: message });

export interface HttpResponse {
  status: number;
  body: unknown;
  /** Response headers; defaults to application/json when omitted. */
  headers?: Record<string, string>;
}

export type Handler = (req: HttpRequest) => Promise<HttpResponse>;

export const json = (status: number, body: unknown): HttpResponse => ({ status, body });
export const ok = (body: unknown): HttpResponse => json(200, body);
/** A non-JSON text response (e.g. a CSV export). Body is the raw string. */
export const text = (status: number, body: string, contentType = 'text/plain'): HttpResponse => ({
  status,
  body,
  headers: { 'content-type': contentType },
});
export const created = (body: unknown): HttpResponse => json(201, body);
export const badRequest = (message: string, extra: Record<string, unknown> = {}): HttpResponse =>
  json(400, { error: message, ...extra });
export const notFound = (message = 'not found'): HttpResponse => json(404, { error: message });
export const conflict = (message: string): HttpResponse => json(409, { error: message });

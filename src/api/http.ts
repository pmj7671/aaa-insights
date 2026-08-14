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
  /** Parsed JSON body, if any. */
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  body: unknown;
}

export type Handler = (req: HttpRequest) => Promise<HttpResponse>;

export const json = (status: number, body: unknown): HttpResponse => ({ status, body });
export const ok = (body: unknown): HttpResponse => json(200, body);
export const created = (body: unknown): HttpResponse => json(201, body);
export const badRequest = (message: string, extra: Record<string, unknown> = {}): HttpResponse =>
  json(400, { error: message, ...extra });
export const notFound = (message = 'not found'): HttpResponse => json(404, { error: message });
export const conflict = (message: string): HttpResponse => json(409, { error: message });

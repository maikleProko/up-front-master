import { beforeEach, expect, jest, test } from "@jest/globals";
import handler from "../../../../pages/api/chat";

let fetchMock: any;
beforeEach(() => { fetchMock = jest.fn(); global.fetch = fetchMock; });
const response = () => {
	const res: any = { headers: {}, statusCode: 200, data: null };
	res.setHeader = (key: string, value: string) => { res.headers[key] = value; };
	res.status = (code: number) => { res.statusCode = code; return res; };
	res.json = (data: any) => { res.data = data; return res; };
	return res;
};
const req = (overrides: object = {}) => ({ method: "POST", headers: { origin: "http://example.test", host: "example.test", "content-type": "application/json" }, socket: {}, cookies: {}, query: {}, body: { action: "start" }, ...overrides } as any);

test("stores bearer in HttpOnly site-specific cookie and never returns it to JavaScript", async () => {
	fetchMock.mockResolvedValue({ status: 201, json: async () => ({ token: "private-token", conversation: { id: "test" } }) });
	const res = response(); await handler(req(), res);
	expect(res.statusCode).toBe(201);
	expect(res.data.token).toBeUndefined();
	expect(res.headers["Set-Cookie"]).toContain("HttpOnly; SameSite=Lax; Max-Age=7776000");
	expect(res.headers["Set-Cookie"]).toContain("Path=/api/chat");
	expect(res.headers["Cache-Control"]).toBe("no-store, private");
});

test("rejects cross-origin requests before calling backend", async () => {
	const res = response(); await handler(req({ headers: { origin: "https://evil.test", host: "example.test", "content-type": "application/json" } }), res);
	expect(res.statusCode).toBe(403); expect(fetchMock).not.toHaveBeenCalled();
});

test("fixes site server-side and sets Secure cookie on HTTPS", async () => {
	fetchMock.mockResolvedValue({ status: 201, json: async () => ({ token: "private-token" }) });
	const res = response(); await handler(req({ query: { site: "Other site", before: "12" }, headers: { origin: "https://example.test", host: "example.test", "content-type": "application/json", "x-forwarded-proto": "https" } }), res);
	expect(res.headers["Set-Cookie"]).toContain("; Secure");
	const url = fetchMock.mock.calls[0][0] as URL;
	expect(url.searchParams.get("site")).toBe("United Parts");expect(url.searchParams.get("before")).toBe("12");
});

test("expired access clears cookie; network failures are recoverable", async () => {
	fetchMock.mockResolvedValueOnce({ status: 401, json: async () => ({ expired: true }) });
	const res = response(); await handler(req({ method: "GET" }), res);
	expect(res.statusCode).toBe(401);expect(res.headers["Set-Cookie"]).toContain("Max-Age=0");
	fetchMock.mockRejectedValueOnce(new Error("offline"));
	const retry = response();await handler(req(), retry);expect(retry.statusCode).toBe(503);
});

import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "node:crypto";

const site = process.env.PROJECT_PREFIX || "United Parts";
const cookieName = `up_chat_${createHash("sha256").update(site).digest("hex").slice(0, 12)}`;
const ttl = 90 * 24 * 60 * 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	res.setHeader("Cache-Control", "no-store, private");
	if (req.method !== "GET" && req.method !== "POST") {
		res.setHeader("Allow", "GET, POST");
		return res.status(405).json({ error: "Метод не поддерживается." });
	}

	if (req.method === "POST") {
		const origin = req.headers.origin;
		let sameOrigin = false;
		try { sameOrigin = !!origin && new URL(origin).host === req.headers.host; } catch { /* Invalid Origin. */ }
		if (!sameOrigin || req.headers["sec-fetch-site"] === "cross-site" || !req.headers["content-type"]?.startsWith("application/json")) {
			return res.status(403).json({ error: "Запрос должен быть отправлен с этого сайта." });
		}
	}
	const api = process.env.CHAT_API_URL || process.env.API_URL || "http://172.31.103.7:8008/api/v1";
	const url = new URL(`${api.replace(/\/$/, "")}/chat/`);
	url.searchParams.set("site", site);
	for (const key of ["after", "before"]) {
		const value = req.query[key];
		if (typeof value === "string" && /^\d{1,16}$/.test(value)) url.searchParams.set(key, value);
	}
	const token = req.cookies[cookieName];
	const forwardedProto = req.headers["x-forwarded-proto"];
	const secure = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(",")[0] === "https" || !!(req.socket as { encrypted?: boolean }).encrypted;
	const setCookie = (value: string, maxAge: number) => res.setHeader("Set-Cookie", `${cookieName}=${encodeURIComponent(value)}; Path=/api/chat; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`);
	try {
		const upstream = await fetch(url, {
			method: req.method, cache: "no-store", signal: AbortSignal.timeout(12000),
			headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
			body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
		});
		const data = await upstream.json();
		if (upstream.status === 401) setCookie("", 0);
		if (typeof data.token === "string") {
			setCookie(data.token, ttl);
			delete data.token;
		}
		return res.status(upstream.status).json(data);
	} catch {
		return res.status(503).json({ error: "Не удалось связаться с менеджером. Попробуйте ещё раз — текст сохранён." });
	}
}

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

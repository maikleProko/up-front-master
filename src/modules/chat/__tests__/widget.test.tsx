import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { ChatWidget } from "../ChatWidget";

let root: Root, container: HTMLDivElement, fetchMock: any;
const conversation = { id: "chat-1", status: "open" };
const message = { id: 1, sender: "manager", text: "Здравствуйте, поможем с подбором!", created_at: "2026-10-01T10:00:00Z", client_id: "m1" };
const snapshot = { conversation: null, messages: [], unread: 0, has_earlier: false };
const ok = (data: object) => ({ ok: true, json: async () => data });
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	jest.useFakeTimers(); container = document.createElement("div");document.body.append(container);root = createRoot(container);
	fetchMock = jest.fn().mockImplementation(async () => ok(snapshot));global.fetch = fetchMock;
});
afterEach(() => { act(() => root.unmount());container.remove();jest.useRealTimers(); });
const mount = async () => { await act(async () => root.render(<ChatWidget />)); };
const open = async () => { await act(async () => (container.querySelector('[aria-expanded]') as HTMLButtonElement).click()); };
const type = async (text: string) => { await act(async () => {
	const input = container.querySelector("textarea")!;
	Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(input, text);
	input.dispatchEvent(new Event("input", { bubbles: true }));
}); };
const submit = async () => { await act(async () => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))); };

test("restores history, shows unread count and supports Escape without creating a new chat", async () => {
	fetchMock.mockImplementation(async (_: string, opts: any) => ok(opts.body ? { ok: true } : { ...snapshot, conversation, messages: [message], unread: 1 }));
	await mount();
	expect(container.querySelector('[aria-expanded]')?.getAttribute("aria-label")).toContain("непрочитанных: 1");
	await open();expect(container.textContent).toContain(message.text);
	expect(document.activeElement).toBe(container.querySelector("textarea"));
	await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
	expect(container.querySelector('[role="dialog"]')?.getAttribute("aria-hidden")).toBe("true");
	expect(fetchMock.mock.calls.filter(([, opts]: any) => opts.body && JSON.parse(opts.body).action === "start")).toHaveLength(0);
});

test("failed send keeps draft and retry uses the same client id; concurrent manager reply is retained", async () => {
	let failed = false;const sent: any[] = [];
	fetchMock.mockImplementation(async (_: string, opts: any) => {
		if (!opts.body) return ok(snapshot);
		const body = JSON.parse(opts.body);
		if (body.action === "start") return ok({ ...snapshot, conversation });
		if (body.action === "send") {
			sent.push(body);
			if (!failed) { failed = true; throw new Error("Нет сети"); }
			const own = { ...message, id: 2, sender: "visitor", text: body.text, client_id: body.client_id };
			return ok({ ...snapshot, conversation, messages: [message, own], message: own });
		}
		return ok({ ok: true });
	});
	await mount();await open();await type("Нужен болт М8");await submit();
	expect(container.querySelector("textarea")!.value).toBe("Нужен болт М8");
	expect(container.querySelector('[role="alert"]')?.textContent).toContain("Нет сети");
	await submit();expect(sent).toHaveLength(2);expect(sent[0].client_id).toBe(sent[1].client_id);
	expect(container.querySelector("textarea")!.value).toBe("");
	expect(container.querySelector('[role="log"]')?.textContent).toContain(message.text);
	expect(container.querySelector('[role="log"]')?.textContent).toContain("Нужен болт М8");
});

test("messages are rendered as plain text, not HTML", async () => {
	fetchMock.mockImplementation(async () => ok({ ...snapshot, conversation, messages: [{ ...message, text: '<img src=x onerror="alert(1)">' }] }));
	await mount();await open();
	expect(container.querySelector('[role="log"] img')).toBeNull();
	expect(container.querySelector('[role="log"]')?.textContent).toContain("<img src=x");
});

test.each(["poll", "send"])("expired conversation from %s clears history, pagination and unread state", async (source) => {
	let expired = false;
	fetchMock.mockImplementation(async (_: string, opts: any) => {
		const action = opts.body ? JSON.parse(opts.body).action : undefined;
		if (expired && (source === "poll" ? !action : action === "send")) {
			return { ok: false, json: async () => ({ error: "Диалог истёк", expired: true }) };
		}
		return ok(action ? { ok: true } : { ...snapshot, conversation, messages: [message], unread: 1, has_earlier: true });
	});
	await mount();
	await open();
	expect(container.querySelector('[role="log"]')?.textContent).toContain(message.text);
	expired = true;
	if (source === "send") { await type("Новый вопрос"); await submit(); }
	else await act(async () => jest.advanceTimersByTime(3000));
	expect(container.querySelector('[role="log"]')?.textContent).toBe("");
	expect(container.textContent).not.toContain("Предыдущие сообщения");
	expect(container.querySelector('input[autocomplete="given-name"]')).not.toBeNull();
	expect(container.querySelector('[aria-expanded]')?.getAttribute("aria-label")).not.toContain("непрочитанных");
});

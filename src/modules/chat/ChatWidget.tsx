import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.scss";

type Message = { id: number; sender: "visitor" | "manager"; text: string; created_at: string; client_id: string };
type Conversation = { id: string; status: "open" | "closed" };
type Snapshot = { conversation: Conversation | null; messages: Message[]; unread: number; has_earlier: boolean };
const merge = (current: Message[], incoming: Message[]) => [...new Map([...current, ...incoming].map(m => [m.id, m])).values()].sort((a, b) => a.id - b.id);
const uuid = () => typeof crypto.randomUUID === "function" ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
async function request<T>(query = "", body?: object): Promise<T> {
	const r = await fetch(`/api/chat${query}`, { method: body ? "POST" : "GET", credentials: "same-origin", cache: "no-store", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
	const data = await r.json();
	if (!r.ok) throw Object.assign(new Error(data.error || "Не удалось отправить сообщение. Попробуйте ещё раз."), { expired: data.expired });
	return data;
}
const ChatIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2V11.5a9.5 9.5 0 0 1 19 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" transform="translate(1 -1)"/><path d="M7 9h9M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;

export const ChatWidget = () => {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [unread, setUnread] = useState(0);
	const [draft, setDraft] = useState("");
	const [name, setName] = useState("");
	const [sending, setSending] = useState(false);
	const [pendingText, setPendingText] = useState("");
	const [error, setError] = useState("");
	const [connected, setConnected] = useState(true);
	const [loading, setLoading] = useState(true);
	const [earlier, setEarlier] = useState(false);
	const [loadingEarlier, setLoadingEarlier] = useState(false);
	const area = useRef<HTMLDivElement>(null);
	const input = useRef<HTMLTextAreaElement>(null);
	const launcher = useRef<HTMLButtonElement>(null);
	const messagesRef = useRef(messages);
	const openRef = useRef(open);
	const conversationRef = useRef(conversation);
	const polling = useRef(false);
	const syncVersion = useRef(0);
	const retry = useRef<{ text: string; id: string } | null>(null);
	const readCursor = useRef(0);
	const sendingRef = useRef(false);
	const restoreScroll = useRef<{ height: number; top: number } | null>(null);
	const nearBottom = useRef(true);
	messagesRef.current = messages; openRef.current = open; conversationRef.current = conversation;
	const close = useCallback(() => { setOpen(false); launcher.current?.focus(); }, []);
	const resetConversation = useCallback(() => {
		conversationRef.current = null;
		messagesRef.current = [];
		readCursor.current = 0;
		setConversation(null);
		setMessages([]);
		setUnread(0);
		setEarlier(false);
	}, []);

	const markRead = useCallback(async (lastId: number) => {
		if (!lastId || lastId <= readCursor.current || document.hidden || !openRef.current) return;
		await request("", { action: "read", last_id: lastId });
		readCursor.current = lastId;
		setUnread(0);
	}, []);
	const sync = useCallback(async () => {
		if (polling.current || sendingRef.current || document.hidden) return;
		polling.current = true;
		const version = syncVersion.current;
		try {
			const last = messagesRef.current.at(-1)?.id;
			const data = await request<Snapshot>(last ? `?after=${last}` : "");
			if (version !== syncVersion.current) return;
			setConversation(data.conversation); setUnread(data.unread); setConnected(true);
			setMessages(current => merge(current, data.messages));
			if (!last) setEarlier(data.has_earlier);
			if (data.conversation && openRef.current && nearBottom.current) await markRead(data.messages.at(-1)?.id || last || 0);
		} catch (e) {
			if (version !== syncVersion.current) return;
			setConnected(false);
			if ((e as { expired?: boolean }).expired) { resetConversation(); setError("Прежний диалог больше недоступен. Следующее сообщение начнёт новый чат."); }
		} finally { polling.current = false; setLoading(false); }
	}, [markRead, resetConversation]);
	useEffect(() => {
		void sync();
		const timer = window.setInterval(() => void sync(), open ? 3000 : 15000);
		const resume = () => { if (!document.hidden) void sync(); };
		document.addEventListener("visibilitychange", resume);
		return () => { clearInterval(timer); document.removeEventListener("visibilitychange", resume); };
	}, [open, sync]);
	useEffect(() => {
		if (!open) return;
		nearBottom.current = true;
		input.current?.focus({ preventScroll: true });
		const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
		document.addEventListener("keydown", escape);
		return () => document.removeEventListener("keydown", escape);
	}, [open, close]);
	useEffect(() => {
		const node = area.current;
		if (!node) return;
		if (restoreScroll.current) { node.scrollTop = restoreScroll.current.top + node.scrollHeight - restoreScroll.current.height; restoreScroll.current = null; }
		else if (nearBottom.current || sending) node.scrollTop = node.scrollHeight;
	}, [messages, open, sending]);

	const send = async (event: React.FormEvent) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || sendingRef.current || loading) return;
		const client_id = retry.current?.text === text ? retry.current.id : uuid();
		retry.current = { text, id: client_id };
		syncVersion.current += 1;
		sendingRef.current = true; setSending(true); setPendingText(text); setError(""); nearBottom.current = true;
		try {
			if (!conversationRef.current) {
				const session = await request<Snapshot>("", { action: "start", name: name.trim(), page: window.location.pathname });
				conversationRef.current = session.conversation; setConversation(session.conversation);
			}
			const data = await request<Snapshot & { message: Message }>("", { action: "send", text, client_id });
			setMessages(current => merge(current, data.messages)); setConversation(data.conversation);
			setDraft(""); retry.current = null; setConnected(true);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Сообщение не отправлено. Повторите попытку.");
			if ((e as { expired?: boolean }).expired) resetConversation();
		} finally { sendingRef.current = false; setSending(false); setPendingText(""); input.current?.focus(); }
	};
	const loadEarlier = async () => {
		if (!messages.length || loadingEarlier) return;
		setLoadingEarlier(true);
		try {
			const data = await request<Snapshot>(`?before=${messages[0].id}`);
			if (area.current) restoreScroll.current = { height: area.current.scrollHeight, top: area.current.scrollTop };
			setMessages(current => merge(current, data.messages)); setEarlier(data.has_earlier);
		} catch { setError("Не удалось загрузить историю. Попробуйте ещё раз."); }
		finally { setLoadingEarlier(false); }
	};
	return <div className={styles.widget}>
		<section className={`${styles.panel} ${open ? styles.open : ""}`} role="dialog" aria-modal="false" aria-labelledby="chat-title" aria-hidden={!open} inert={!open}>
			<header className={styles.header}>
				<div className={styles.logo}><img src="/images/logo-mark.svg" alt="UP" /></div>
				<div><span className={styles.eyebrow}>UNITED PARTS / ПОДДЕРЖКА</span><h2 id="chat-title">Поддержка</h2><p><i />{connected ? "Менеджер ответит здесь" : "Восстанавливаем соединение…"}</p></div>
				<button type="button" className={styles.close} onClick={close} aria-label="Свернуть чат">×</button>
			</header>
			<div className={styles.history} ref={area} onScroll={() => {
				const node = area.current;
				nearBottom.current = !!node && node.scrollHeight - node.scrollTop - node.clientHeight < 60;
				if (nearBottom.current) void markRead(messages.at(-1)?.id || 0).catch(() => {});
			}}>
				<div className={styles.welcome}><span>ПОМОЖЕМ РАЗОБРАТЬСЯ</span><h3>Напишите свой вопрос<span>.</span></h3><p>Подскажите модель техники или артикул. Поможем подобрать запчасть и уточнить наличие.</p></div>
				{loading && <p className={styles.note} role="status">Загружаем переписку…</p>}
				{earlier && <button type="button" className={styles.earlier} onClick={() => void loadEarlier()} disabled={loadingEarlier}>{loadingEarlier ? "Загружаем…" : "Предыдущие сообщения ↑"}</button>}
				<div role="log" aria-live={open ? "polite" : "off"} aria-relevant="additions" aria-label="Переписка с менеджером">
					{messages.map(m => <div key={m.id} className={`${styles.bubble} ${m.sender === "visitor" ? styles.visitor : styles.manager}`}><p>{m.text}</p><span>{m.sender === "manager" ? "Менеджер · " : "Вы · "}{new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span></div>)}
				</div>
				{sending && <div className={`${styles.bubble} ${styles.visitor} ${styles.pending}`} role="status"><p>{pendingText}</p><span>Отправляем<span className={styles.dots}>…</span></span></div>}
				{conversation?.status === "closed" && <p className={styles.note}>Диалог завершён. Напишите снова, если нужна помощь.</p>}
			</div>
			{error && <div className={styles.error} role="alert">{error}<button type="button" onClick={() => setError("")} aria-label="Скрыть уведомление">×</button></div>}
			<form className={styles.compose} onSubmit={send}>
				{!conversation && <label className={styles.name}>Как к вам обращаться?<input value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder="Имя — по желанию" autoComplete="given-name" /></label>}
				<div className={styles.inputRow}><textarea ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000} rows={2} placeholder="Ваш вопрос или артикул…" aria-label="Сообщение менеджеру" disabled={sending} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} /><button type="submit" disabled={!draft.trim() || sending || loading} aria-label={sending ? "Сообщение отправляется" : "Отправить сообщение"}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 19 14-14M5 5h14v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
				<div className={styles.footnote}><span>История сохранится в этом браузере</span><span>{draft.length > 1800 ? `${draft.length}/2000` : "↵ отправить"}</span></div>
			</form>
		</section>
		<button type="button" ref={launcher} className={`${styles.launcher} ${open ? styles.launcherOpen : ""}`} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Свернуть чат с менеджером" : `Чат с менеджером${unread ? `, непрочитанных: ${unread}` : ""}`}>
			<span className={styles.launcherIcon}>{open ? <span className={styles.cross}>×</span> : <ChatIcon />}</span><span className={styles.launcherText}>{open ? "Свернуть" : "Обратная связь"}</span>{!open && unread > 0 && <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
		</button>
	</div>;
};

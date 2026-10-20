import { useCallback, useEffect, useState } from "react";
import { env } from "shared/lib/env";

export interface IProductSelectionState {
	ids: number[];
	isLoading: boolean;
	toggle: (id: number, productName?: string) => void;
	remove: (id: number) => void;
	clear: () => void;
	visit: (id: number) => void;
}

const parseIds = (saved: string | null): number[] => {
	try {
		const value: unknown = JSON.parse(saved ?? "[]");
		return Array.isArray(value) ? [...new Set(value.filter((id): id is number => Number.isSafeInteger(id) && id > 0))].slice(0, 20) : [];
	} catch { return []; }
};

export const useProductSelectionReducer = (name: string): IProductSelectionState => {
	const storageKey = `${env.projectPrefix}:${name}`;
	const [ids, setIds] = useState<number[]>([]);
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		try { setIds(parseIds(window.localStorage.getItem(storageKey))); } catch {  }
		setLoaded(true);
		const synchronize = (event: StorageEvent) => {
			if (event.key === storageKey || event.key === null) setIds(parseIds(event.newValue));
		};
		window.addEventListener("storage", synchronize);
		return () => window.removeEventListener("storage", synchronize);
	}, [storageKey]);
	useEffect(() => {
		if (!loaded) return;
		try { window.localStorage.setItem(storageKey, JSON.stringify(ids)); } catch {  }
	}, [ids, loaded, storageKey]);
	const toggle = useCallback((id: number) => setIds((current) => current.includes(id)
		? current.filter((value) => value !== id) : current.length < 20 ? [...current, id] : current), []);
	const remove = useCallback((id: number) => setIds((current) => current.filter((value) => value !== id)), []);
	const clear = useCallback(() => setIds([]), []);
	const visit = useCallback((id: number) => setIds((current) => current[0] === id
		? current : [id, ...current.filter((value) => value !== id)].slice(0, 20)), []);
	return { ids, isLoading: !loaded, toggle, remove, clear, visit };
};

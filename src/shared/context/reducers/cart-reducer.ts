import { useCallback, useEffect, useMemo, useState } from "react";

export interface ICartItem {
	id: number;
	name: string;
	code: string;
	price: number;
	image: string;
	quantity: number;
}

export interface ICartState {
	isLoading: boolean;
	items: ICartItem[];
	positionsCount: number;
	total: number;
	addItem: (item: Omit<ICartItem, "quantity">, quantity?: number) => void;
	setQuantity: (id: number, quantity: number) => void;
	removeItem: (id: number) => void;
	clear: () => void;
}

const storageKey = "united-parts-cart";

export const useCartReducer = (): ICartState => {
	const [items, setItems] = useState<ICartItem[]>([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(storageKey);
			if (saved) setItems(JSON.parse(saved));
		} catch {  }
		setLoaded(true);
	}, []);

	useEffect(() => {
		if (loaded) window.localStorage.setItem(storageKey, JSON.stringify(items));
	}, [items, loaded]);

	const addItem = useCallback((item: Omit<ICartItem, "quantity">, quantity = 1) => {
		const amount = Math.max(1, Math.floor(quantity));
		setItems((current) => {
			const existing = current.find((entry) => entry.id === item.id);
			return existing
				? current.map((entry) => entry.id === item.id ? { ...entry, ...item, quantity: entry.quantity + amount } : entry)
				: [...current, { ...item, quantity: amount }];
		});
	}, []);
	const setQuantity = useCallback((id: number, quantity: number) => {
		const amount = Math.max(1, Math.floor(quantity || 1));
		setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: amount } : item));
	}, []);
	const removeItem = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
	const clear = useCallback(() => setItems([]), []);
	const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

	return { isLoading: !loaded, items, positionsCount: items.length, total, addItem, setQuantity, removeItem, clear };
};

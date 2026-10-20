import { beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { List } from "shared/ui/list";
import { ContentImage } from "./Skeleton";
import { useCartReducer } from "shared/context/reducers/cart-reducer";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});
afterEach(() => {
	act(() => root.unmount());
	container.remove();
	localStorage.clear();
});

test("list replaces loading with content, empty state or error", () => {
	const render = (data: any) =>
		act(() =>
			root.render(<List data={data} renderItem={(item: string) => <p key={item}>{item}</p>} emptyText="Пусто" />),
		);
	render({ isLoading: true });
	expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
	expect(container.textContent).not.toContain("Пусто");
	render({ data: { data: ["Болт"] }, isValidating: true });
	expect(container.textContent).toBe("Болт");
	expect(container.querySelector('[aria-busy="true"]')).toBeNull();
	render({ data: { data: [] } });
	expect(container.textContent).toContain("Пусто");
	render({ error: new Error("network") });
	expect(container.textContent).toContain("Не удалось загрузить данные");
});

test("images finish loading on success and failure and restart for a new source", () => {
	const onLoad = jest.fn();
	act(() => root.render(<ContentImage src="/first.png" onLoad={onLoad} />));
	const image = container.querySelector("img")!;
	expect(image.className).toContain("imageLoading");
	act(() => image.dispatchEvent(new Event("load")));
	expect(onLoad).toHaveBeenCalledTimes(1);
	expect(image.className).not.toContain("imageLoading");
	act(() => root.render(<ContentImage src="/second.png" />));
	expect(image.className).toContain("imageLoading");
	act(() => image.dispatchEvent(new Event("error")));
	expect(image.className).not.toContain("imageLoading");
});

test.each([false, true])("cart exposes loading until storage is restored (corrupt: %s)", (corrupt) => {
	const snapshots: { loading: boolean; count: number }[] = [];
	localStorage.setItem(
		"united-parts-cart",
		corrupt
			? "broken JSON"
			: JSON.stringify([{ id: 8, name: "Болт", code: "8", price: 20, image: "", quantity: 2 }]),
	);
	function Probe() {
		const cart = useCartReducer();
		snapshots.push({ loading: cart.isLoading, count: cart.positionsCount });
		return <span>{cart.isLoading ? "Загрузка" : cart.total}</span>;
	}
	act(() => root.render(<Probe />));
	expect(snapshots[0]).toEqual({ loading: true, count: 0 });
	expect(snapshots.at(-1)).toEqual({ loading: false, count: corrupt ? 0 : 1 });
	expect(container.textContent).toBe(corrupt ? "0" : "40");
});

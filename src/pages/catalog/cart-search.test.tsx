import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";

jest.mock("@ant-design/icons", () => ({ LoadingOutlined: () => null }));
jest.mock("next/router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("modules/catalog/shared", () => ({ CatalogBackground: () => null }));
jest.mock("modules/catalog/shared/api/hooks", () => ({ useCatalogCategory: jest.fn() }));
jest.mock("shared/context/app-context.provider", () => {
	const React = require("react");
	const { useCartReducer } = require("shared/context/reducers/cart-reducer");
	const Context = React.createContext(null);
	return {
		useAppContext: () => React.useContext(Context),
		AppContextProvider: ({ children }: any) => React.createElement(Context.Provider, { value: {
			cart: useCartReducer(), comparison: { ids: [], isLoading: false, toggle: jest.fn() },
		} }, children),
	};
});

const { CartPage } = require("./cart.page") as typeof import("./cart.page");
const { AppContextProvider } = require("shared/context/app-context.provider") as typeof import("shared/context/app-context.provider");
const { useCatalogCategory } = require("modules/catalog/shared/api/hooks") as typeof import("modules/catalog/shared/api/hooks");

const product = { id: 8, name: "Болт М8", code: "M8", default_price: "190", image: "", status: "NEW", brand: null, characteristics: [] };
let container: HTMLDivElement;
let root: Root;
const request = jest.mocked(useCatalogCategory);
const retry = jest.fn();
const input = () => container.querySelector<HTMLInputElement>('input[aria-label="Поиск запчасти"]')!;
const type = (value: string) => act(() => {
	Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input(), value);
	input().dispatchEvent(new Event("input", { bubbles: true }));
});
const click = (element: Element) => act(() => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	jest.useFakeTimers();
	localStorage.clear();
	request.mockReset();
	request.mockReturnValue({ data: { data: { products: [product] } }, isLoading: false, mutate: retry } as any);
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
	act(() => root.render(<AppContextProvider><CartPage /></AppContextProvider>));
});
afterEach(() => { act(() => root.unmount()); container.remove(); jest.useRealTimers(); });

test("live search stays in cart; adding and removing a result updates the empty state and preserves results", () => {
	expect(container.textContent).toContain("Корзина пуста");
	expect(container.querySelector("#cart-search-title")).toBeNull();
	type("Болт");
	expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
	act(() => jest.advanceTimersByTime(300));
	expect(request).toHaveBeenLastCalledWith({ slug: "search", search: "Болт" });
	const results = container.querySelector('[aria-labelledby="cart-search-title"]')!;
	const add = Array.from(results.querySelectorAll("button")).find(b => b.textContent?.includes("В корзину"))!;
	click(add);
	expect(container.textContent).not.toContain("Корзина пуста");
	expect(container.textContent).toContain("Оформление корзины");
	expect(container.querySelector('[aria-labelledby="cart-search-title"]')).toBe(results);
	click(results.querySelector('[aria-label="Увеличить количество Болт М8"]')!);
	expect(JSON.parse(localStorage.getItem("united-parts-cart")!)[0].quantity).toBe(2);
	click(container.querySelector('[aria-label="Удалить Болт М8"]')!);
	expect(container.textContent).toContain("Корзина пуста");
	expect(results.textContent).toContain("В корзину");
	type("");
	expect(container.querySelector("#cart-search-title")).toBeNull();
});

test("submit searches immediately; edited query hides stale products until debounce completes", () => {
	type("Болт");
	act(() => input().closest("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
	expect(request).toHaveBeenLastCalledWith({ slug: "search", search: "Болт" });
	expect(container.querySelector('[aria-labelledby="cart-search-title"] article')).not.toBeNull();
	type("Гайка");
	expect(container.querySelector('[aria-labelledby="cart-search-title"] article')).toBeNull();
	act(() => jest.advanceTimersByTime(300));
	expect(request).toHaveBeenLastCalledWith({ slug: "search", search: "Гайка" });
});

test("empty and failed searches offer useful feedback and retry", () => {
	request.mockReturnValue({ data: { data: { products: [] } }, isLoading: false, mutate: retry } as any);
	type("нет"); act(() => jest.advanceTimersByTime(300));
	expect(container.textContent).toContain("ничего не найдено");
	request.mockReturnValue({ error: new Error("network"), isLoading: false, mutate: retry } as any);
	type("болт"); act(() => jest.advanceTimersByTime(300));
	expect(container.querySelector('[role="alert"]')).not.toBeNull();
	click(Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Повторить поиск")!);
	expect(retry).toHaveBeenCalled();
});

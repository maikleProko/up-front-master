import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { HomeNewProducts } from "./HomeContent";

jest.mock("antd", () => ({ Modal: () => null }));
jest.mock("shared/context/app-context.provider", () => ({ useAppContext: () => ({
	cart: { items: [] }, comparison: { ids: [], isLoading: false },
}) }));
let root: Root;
let container: HTMLDivElement;
beforeEach(() => { (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement("div"); root = createRoot(container); });
afterEach(() => act(() => root.unmount()));

test("new-products section and catalog link persist while the skeleton becomes content", () => {
	act(() => root.render(<HomeNewProducts products={[]} isLoading />));
	const section = container.querySelector("#new-products");
	expect(section).not.toBeNull();
	expect(container.querySelector('[aria-label="Загрузка новинок"]')).not.toBeNull();
	expect(container.textContent).toContain("Новые детали.");
	expect(container.textContent).toContain("Подобрать запчасть");
	const product = { id: 8, name: "Болт", code: "M8", files: [], default_price: "190" } as any;
	act(() => root.render(<HomeNewProducts products={[product]} />));
	expect(container.querySelector("#new-products")).toBe(section);
	expect(container.querySelector('[aria-busy="true"]')).toBeNull();
	expect(container.textContent).toContain("Болт");
});

test("empty and error responses keep the section and offer retry on failure", () => {
	const retry = jest.fn();
	act(() => root.render(<HomeNewProducts products={[]} />));
	expect(container.textContent).toContain("Новые товары скоро появятся");
	act(() => root.render(<HomeNewProducts products={[]} error onRetry={retry} />));
	expect(container.textContent).toContain("Не удалось загрузить новинки");
	act(() => container.querySelector("button")!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
	expect(retry).toHaveBeenCalledTimes(1);
});

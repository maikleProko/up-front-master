import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { env } from "shared/lib/env";
import { IProductSelectionState, useProductSelectionReducer } from "./product-selection-reducer";

let root: Root;
let container: HTMLDivElement;
let state: IProductSelectionState;
const key = `${env.projectPrefix}:comparison`;

const Probe = () => {
	state = useProductSelectionReducer("comparison");
	return <span>{state.ids.join(",")}</span>;
};

beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	container = document.createElement("div");
	root = createRoot(container);
});
afterEach(() => {
	act(() => root.unmount());
	localStorage.clear();
	jest.restoreAllMocks();
});

test("restores valid unique IDs, keeps selection across remount and synchronizes tabs", () => {
	localStorage.setItem(key, JSON.stringify([8, 8, "2", -1, null, 2]));
	act(() => root.render(<Probe />));
	expect(state.ids).toEqual([8, 2]);
	act(() => state.toggle(3));
	expect(JSON.parse(localStorage.getItem(key)!)).toEqual([8, 2, 3]);
	act(() => root.render(null));
	act(() => root.render(<Probe />));
	expect(state.ids).toEqual([8, 2, 3]);
	act(() => window.dispatchEvent(new StorageEvent("storage", { key, newValue: "[4,5]" })));
	expect(state.ids).toEqual([4, 5]);
	act(() => state.remove(4));
	expect(state.ids).toEqual([5]);
	act(() => state.clear());
	expect(localStorage.getItem(key)).toBe("[]");
});

test.each(["broken", "null", "{}"])("invalid storage %s does not break the page", (saved) => {
	localStorage.setItem(key, saved);
	act(() => root.render(<Probe />));
	expect(state.ids).toEqual([]);
	expect(state.isLoading).toBe(false);
});

test("limits comparison to 20 and history keeps the latest unique visits first", () => {
	act(() => root.render(<Probe />));
	act(() => { for (let id = 1; id <= 21; id++) state.toggle(id); });
	expect(state.ids).toHaveLength(20);
	expect(state.ids).not.toContain(21);
	act(() => state.visit(21));
	expect(state.ids[0]).toBe(21);
	expect(state.ids).toHaveLength(20);
	act(() => state.visit(5));
	expect(state.ids[0]).toBe(5);
	expect(state.ids.filter((id) => id === 5)).toHaveLength(1);
});

test("unavailable storage still permits an in-memory selection", () => {
	jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("disabled"); });
	jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("disabled"); });
	act(() => root.render(<Probe />));
	act(() => state.toggle(8));
	expect(state.ids).toEqual([8]);
});

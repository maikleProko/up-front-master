import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";

const listeners = new Map<string, Set<() => void>>();
const events = {
	on: (event: string, callback: () => void) => {
		if (!listeners.has(event)) listeners.set(event, new Set());
		listeners.get(event)!.add(callback);
	},
	off: (event: string, callback: () => void) => listeners.get(event)?.delete(callback),
};
jest.mock("next/router", () => ({ useRouter: () => ({ events }) }));
const { useMenuState } = require("./use-menu-state") as typeof import("./use-menu-state");
let root: Root, container: HTMLDivElement;
const Menu = ({ enabled = true }: { enabled?: boolean }) => {
	const { expanded, setOpen, trigger } = useMenuState(enabled);
	return (
		<button ref={trigger} aria-expanded={expanded} onClick={() => setOpen((value) => !value)}>
			Меню
		</button>
	);
};
const button = () => container.querySelector("button")!;
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	listeners.clear();
	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
	act(() => root.render(<Menu />));
});
afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

test("navigation and Escape close menus; Escape returns focus to the trigger", () => {
	for (const event of ["routeChangeStart", "hashChangeStart"]) {
		act(() => button().click());
		expect(button().getAttribute("aria-expanded")).toBe("true");
		act(() => listeners.get(event)!.forEach((callback) => callback()));
		expect(button().getAttribute("aria-expanded")).toBe("false");
	}
	act(() => button().click());
	act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
	expect(button().getAttribute("aria-expanded")).toBe("false");
	expect(document.activeElement).toBe(button());
});

test("disabling a menu closes it permanently and unmount removes router listeners", () => {
	act(() => button().click());
	act(() => root.render(<Menu enabled={false} />));
	act(() => root.render(<Menu enabled />));
	expect(button().getAttribute("aria-expanded")).toBe("false");
	act(() => root.render(null));
	expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
});

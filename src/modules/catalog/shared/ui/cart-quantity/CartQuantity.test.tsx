import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { ICartState, useCartReducer } from "shared/context/reducers/cart-reducer";

let cart: ICartState;
jest.mock("shared/context/app-context.provider", () => ({ useAppContext: () => ({ cart }) }));
const { CartQuantity } = require("./CartQuantity") as typeof import("./CartQuantity");
const product = { id: 8, name: "Болт М8", code: "M8", price: 190, image: "" };
let root: Root, container: HTMLDivElement;
const Harness = ({ min = 0 }: { min?: 0 | 1 }) => {
	cart = useCartReducer();
	return (
		<>
			{cart.items.map((item) => (
				<React.Fragment key={item.id}>
					<CartQuantity item={item} min={min} />
					<CartQuantity item={item} min={min} />
				</React.Fragment>
			))}
		</>
	);
};
const click = (label: string) =>
	act(() => container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click());
const enter = (value: string) =>
	act(() => {
		const input = container.querySelector("input")!;
		Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	localStorage.clear();
	container = document.createElement("div");
	root = createRoot(container);
	act(() => root.render(<Harness />));
	act(() => cart.addItem(product));
});
afterEach(() => act(() => root.unmount()));

test("controls share cart state and persist changes; decrementing the last item removes it", () => {
	click("Увеличить количество Болт М8");
	expect(Array.from(container.querySelectorAll("input"), (input) => input.value)).toEqual(["2", "2"]);
	expect(JSON.parse(localStorage.getItem("united-parts-cart")!)[0].quantity).toBe(2);
	click("Уменьшить количество Болт М8");
	click("Уменьшить количество Болт М8");
	expect(cart.items).toEqual([]);
	expect(container.querySelector("input")).toBeNull();
});

test("catalog controls remove zero and empty quantities", () => {
	enter("0");
	expect(cart.items).toEqual([]);
	act(() => cart.addItem(product));
	enter("");
	expect(cart.items).toEqual([]);
});

test("cart-page input keeps a minimum of one and normalizes fractional quantities", () => {
	act(() => root.render(<Harness min={1} />));
	enter("0");
	expect(cart.items[0].quantity).toBe(1);
	enter("3.7");
	expect(cart.items[0].quantity).toBe(3);
	enter("");
	expect(cart.items[0].quantity).toBe(1);
});

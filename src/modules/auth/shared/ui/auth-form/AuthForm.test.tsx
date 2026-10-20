import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { useForm } from "react-hook-form";
import { TextField } from "shared/ui/form-inputs/text/TextField";
import { PasswordField } from "shared/ui/form-inputs/password/PasswordField";

const login = jest.fn(async (_values: unknown) => ({ id: "user", name: "Анна", email: "anna@example.com" }));
const signUp = jest.fn(async (_values: unknown) => ({ id: "user", name: "Анна", email: "anna@example.com" }));
const acceptUser = jest.fn();
const push = jest.fn();
jest.mock("modules/auth/shared/api", () => ({ login, signUp }));
jest.mock("shared/context/app-context.provider", () => ({ useAppContext: () => ({ auth: { login: acceptUser } }) }));
jest.mock("next/router", () => ({ __esModule: true, default: { push } }));
const { AuthForm } = require("./AuthForm") as typeof import("./AuthForm");
let root: Root, container: HTMLDivElement;
const type = async (name: string, value: string) =>
	act(async () => {
		const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
		Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
const submit = async () =>
	act(async () => {
		container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
	});
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	jest.clearAllMocks();
	container = document.createElement("div");
	root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));

test.each(["login", "sign-up"] as const)("%s submits the correct fields and signs in once", async (mode) => {
	await act(async () => root.render(<AuthForm mode={mode} />));
	await type("email", "anna@example.com");
	await type("password", "secret123");
	if (mode === "sign-up") await type("name", "Анна");
	else expect(container.querySelector('input[name="name"]')).toBeNull();
	await submit();
	const handler = mode === "sign-up" ? signUp : login;
	expect(handler).toHaveBeenCalledTimes(1);
	expect(handler).toHaveBeenCalledWith({
		email: "anna@example.com",
		password: "secret123",
		...(mode === "sign-up" ? { name: "Анна" } : {}),
	});
	expect(acceptUser).toHaveBeenCalledTimes(1);
	expect(push).toHaveBeenCalledWith("/");
});

test("registration still rejects short passwords", async () => {
	await act(async () => root.render(<AuthForm mode="sign-up" />));
	await type("name", "Анна");
	await type("email", "anna@example.com");
	await type("password", "123");
	await submit();
	expect(signUp).not.toHaveBeenCalled();
});

test("text and password fields preserve controller default values", async () => {
	const Fields = () => {
		const { control } = useForm<{ email: string; password: string }>();
		return (
			<>
				<TextField name="email" control={control} defaultValue="anna@example.com" />
				<PasswordField name="password" control={control} defaultValue="secret123" />
			</>
		);
	};
	await act(async () => root.render(<Fields />));
	expect(container.querySelector<HTMLInputElement>('input[name="email"]')?.value).toBe("anna@example.com");
	expect(container.querySelector<HTMLInputElement>('input[name="password"]')?.value).toBe("secret123");
	expect(container.querySelector('input[name="password"]')?.getAttribute("type")).toBe("password");
});

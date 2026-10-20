import React from "react";
import Link from "next/link";
import { Form } from "antd";
import { Button } from "shared/ui/atoms";
import { TextField, PasswordField } from "shared/ui/form-inputs";
import { useAppForm } from "shared/lib/forms";
import { useAppContext } from "shared/context/app-context.provider";
import { ICurrentUser } from "shared/context/reducers/auth-reducer";
import { login, signUp, ISignUpFormValues } from "modules/auth/shared/api";
import AppRouter from "pages/router";

export const AuthForm = ({ mode }: { mode: "login" | "sign-up" }) => {
	const registration = mode === "sign-up";
	const { auth } = useAppContext();

	const form = useAppForm<ISignUpFormValues, ICurrentUser>({
		onSubmit: registration ? signUp : login,
		onSuccess: (user) => {
			auth.login(user);
			AppRouter.index.open();
		},
	});

	return (
		<Form onFinish={form.onSubmit} layout="vertical">
			<h1>{registration ? "Регистрация" : "Войти"}</h1>

			<div style={{ margin: "0 0 20px" }}>
				{registration ? (
					<>
						Уже есть аккаунт? <Link {...AppRouter.auth.login.link}>Войти</Link>
					</>
				) : (
					<>
						Первый раз тут? <Link {...AppRouter.auth.signUp.link}>Зарегистрироваться</Link>
					</>
				)}
			</div>

			{registration && <TextField label="Имя" placeholder="Имя" {...form.regField("name")} />}
			<TextField label="E-mail" placeholder="E-mail" type="email" {...form.regField("email")} />
			<PasswordField
				label="Пароль"
				placeholder="Пароль"
				{...form.regField("password", registration ? { minLength: 6 } : undefined)}
			/>

			{form.globalError && <p style={{ color: "red" }}>{form.globalError}</p>}

			<Button htmlType="submit" block {...form.submitProps} style={{ marginTop: 10 }}>
				{registration ? "Зарегистрироваться" : "Войти"}
			</Button>
		</Form>
	);
};

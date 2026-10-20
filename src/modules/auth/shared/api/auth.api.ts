import { ICurrentUser } from "shared/context/reducers/auth-reducer";

const delay = <T>(value: T, ms = 300) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export interface ILoginFormValues {
	email: string;
	password: string;
}

export interface ISignUpFormValues {
	name: string;
	email: string;
	password: string;
}

export const login = (values: ILoginFormValues): Promise<ICurrentUser> => {
	return delay({ id: "stub-user", name: values.email.split("@")[0], email: values.email });
};

export const signUp = (values: ISignUpFormValues): Promise<ICurrentUser> => {
	return delay({ id: "stub-user", name: values.name, email: values.email });
};

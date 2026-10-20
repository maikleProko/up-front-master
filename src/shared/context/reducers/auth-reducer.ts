import { useState } from "react";

export interface ICurrentUser {
	id: string;
	name: string;
	email: string;
}

export interface IAuthState {
	currentUser?: ICurrentUser;
	login: (user: ICurrentUser) => void;
	logout: () => void;
}

export const useAuthReducer = (): IAuthState => {
	const [currentUser, setCurrentUser] = useState<ICurrentUser>();

	return {
		currentUser,
		login: (user) => setCurrentUser(user),
		logout: () => setCurrentUser(undefined),
	};
};

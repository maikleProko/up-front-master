import { useEffect } from "react";
import Router from "next/router";

export const redirect = (href: string) => {
	const RedirectPage = () => {
		useEffect(() => {
			Router.replace(href);
		}, []);

		return null;
	};

	return RedirectPage;
};

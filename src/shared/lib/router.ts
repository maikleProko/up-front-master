import Router from "next/router";

export interface IRouterLink {
	href: string;
	as?: string;
}

export interface IRouterPage {
	link: IRouterLink;
	open: () => void;
}

export interface IRouterPageablePage extends IRouterPage {
	page: (page: number) => IRouterPage;
}

export const page = (href: string, as?: string): IRouterPage => ({
	link: { href, as },
	open: () => Router.push(as ?? href),
});

export const pageablePage = (href: string, as?: string): IRouterPageablePage => {
	const createPage = page;

	return {
		...createPage(href, as),
		page: (page: number = 1) => {
			if (page === 1) return createPage(href, as);
			return createPage(`${href}?page=${page}`, as?.concat(`?page=${page}`));
		},
	};
};

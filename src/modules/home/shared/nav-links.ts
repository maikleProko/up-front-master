import AppRouter from "pages/router";
import { IRouterPage } from "shared/lib/router";

export interface INavItem {
	label: string;
	mobileLabel: string;
	page?: IRouterPage;
}

export const homeNavLinks: INavItem[] = [
	{ label: "КАТАЛОГ", mobileLabel: "Каталог", page: AppRouter.catalog },
	{ label: "НОВОСТИ", mobileLabel: "Новости", page: AppRouter.news },
	{ label: "ДИЛЕРАМ", mobileLabel: "Дилерам", page: AppRouter.partnership },
	{ label: "О БРЕНДЕ", mobileLabel: "О бренде", page: AppRouter.about },
];

export const contactPhone = "+7 999 999 99 99";

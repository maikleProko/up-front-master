import React from "react";
import type { NextRouter } from "next/router";
import { MainLayout } from "shared/ui/layouts";

export interface IAppLayout {
	children?: React.ReactNode;
	router: NextRouter;
}

const hasOwnLayout = (pathname: string) => pathname === "/" || pathname.startsWith("/auth");
const hasStickyCatalogTopbar = (pathname: string) =>
	pathname === "/catalog" || pathname === "/catalog/categories/[slug]" || pathname === "/catalog/[id]" || pathname === "/catalog/order" || pathname === "/catalog/comparison";

export const AppLayout = (props: IAppLayout) => {
	if (hasOwnLayout(props.router.pathname)) return <>{props.children}</>;

	return <MainLayout stickyTopbar={hasStickyCatalogTopbar(props.router.pathname)}>{props.children}</MainLayout>;
};

import React from "react";
import Link from "next/link";
import AppRouter from "pages/router";
import { IRouterLink } from "shared/lib/router";
import styles from "./Breadcrumbs.module.scss";

export interface BreadcrumbItem {
	label: string;
	link?: IRouterLink;
}

export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
	<nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
		<Link {...AppRouter.index.link}>
			<img src="/images/bc-home.svg" alt="" />
			Главная страница
		</Link>
		{items.map((item, index) => (
			<span className={styles.breadcrumbItem} key={`${index}:${item.label}`}>
				<img src="/images/bc-next.svg" alt="" />
				{item.link ? (
					<Link {...item.link}>{item.label}</Link>
				) : (
					<span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>
				)}
			</span>
		))}
	</nav>
);

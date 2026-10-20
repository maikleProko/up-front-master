import React, { useEffect, useId } from "react";
import Link from "next/link";
import { useMenuState } from "modules/home/shared/lib/use-menu-state";
import { useMobile } from "shared/lib/use-mobile";
import { homeNavLinks } from "modules/home/shared/nav-links";
import AppRouter from "pages/router";
import styles from "./MobileMenu.module.scss";

const links = [
	...homeNavLinks.flatMap(({ mobileLabel, page }) => page ? [{ label: mobileLabel, href: page.link.href }] : []),
	{ label: "Корзина", href: AppRouter.catalog.cart.link.href },
	{ label: "Сравнение товаров", href: AppRouter.catalog.comparison.link.href },
];

export const MobileMenu = ({ light, enabled = true, onOpenChange }: {
	light?: boolean;
	enabled?: boolean;
	onOpenChange?: (open: boolean) => void;
}) => {
	const mobile = useMobile();
	const id = useId();
	const { expanded, setOpen, trigger: button } = useMenuState(mobile && enabled);

	useEffect(() => { onOpenChange?.(expanded); }, [expanded, onOpenChange]);

	return <div className={`${styles.mobileMenu} ${light ? styles.light : ""} ${expanded ? styles.open : ""}`}>
		<button ref={button} type="button" className={styles.toggle}
			aria-label={expanded ? "Закрыть меню" : "Открыть меню"}
			aria-expanded={expanded} aria-controls={id} disabled={!enabled}
			onClick={() => setOpen((value) => !value)}>
			<span className={styles.icon} aria-hidden="true" />
		</button>
		<nav id={id} className={styles.panel} aria-label="Мобильная навигация" inert={!expanded}>
			<ul>{links.map(({ label, href }) => <li key={href}>
				<Link href={href} onClick={() => setOpen(false)}>{label.slice(0, -1)}<span>{label.slice(-1)}</span></Link>
			</li>)}</ul>
		</nav>
	</div>;
};

import { ComparisonIcon } from "shared/ui/atoms/icon/ComparisonIcon";
import React from "react";
import classNames from "classnames";
import Link from "next/link";
import { LogoMark, PhoneLink, StubLink } from "shared/ui/atoms";
import AppRouter from "pages/router";
import { contactPhone, homeNavLinks } from "modules/home/shared/nav-links";
import { useAppContext } from "shared/context/app-context.provider";
import styles from "./TeaserTopbar.module.scss";
import { CatalogMenu } from "../catalog-menu/CatalogMenu";
import { MobileMenu } from "./MobileMenu";

export interface ITeaserTopbar {
	dark?: boolean;
	mobileMenuEnabled?: boolean;
	onMobileMenuChange?: (open: boolean) => void;
}

export const TeaserTopbar = (props: ITeaserTopbar) => {
	const { cart, comparison } = useAppContext();
	return (
	<>
	<div className={styles.topbar}>
		<Link {...AppRouter.index.link} className={styles.logo}>
			<LogoMark dark={props.dark} className={styles.logoMark} />
		</Link>

		<nav className={styles.menu}>
			<div className={styles.menuItems}>
				{homeNavLinks.map((item) =>
					item.page === AppRouter.catalog ? (
						<CatalogMenu key={item.label} light={props.dark} enabled={props.mobileMenuEnabled} />
					) : item.page ? (
						<Link
							key={item.label}
							{...item.page.link}
							className={classNames(styles.menuItem, props.dark && styles.menuItemDark)}
						>
							{item.label}
						</Link>
					) : (
						<StubLink
							key={item.label}
							className={classNames(styles.menuItem, props.dark && styles.menuItemDark)}
						>
							{item.label}
						</StubLink>
					),
				)}
			</div>
		</nav>

		{props.dark ? <div className={styles.actions}>
			<Link {...AppRouter.catalog.comparison.link} className={styles.cartLink} aria-label={`Сравнение товаров, выбрано: ${comparison.ids.length}`} title="Сравнение товаров">
				<ComparisonIcon />
				{comparison.ids.length > 0 && <span className={styles.cartBadge}>{comparison.ids.length}</span>}
			</Link>
			<Link {...AppRouter.catalog.cart.link} className={styles.cartLink} aria-label={`Корзина, позиций: ${cart.positionsCount}`}>
				<span className={`${styles.actionIcon} ${styles.cartIcon}`} aria-hidden="true" />
				{cart.positionsCount > 0 && <span className={styles.cartBadge}>{cart.positionsCount > 99 ? "99+" : cart.positionsCount}</span>}
			</Link>
			<Link {...AppRouter.auth.login.link} className={styles.userLink} aria-label="Личный кабинет">
				<span className={`${styles.actionIcon} ${styles.userIcon}`} aria-hidden="true" />
			</Link>
		</div> : <PhoneLink phone={contactPhone} variant="accent" className={styles.phone} />}
	</div>
	<MobileMenu light={props.dark} enabled={props.mobileMenuEnabled} onOpenChange={props.onMobileMenuChange} />
	</>
);};

import React from "react";
import Link from "next/link";
import { LogoMark, PhoneLink } from "shared/ui/atoms";
import { contactPhone } from "modules/home/shared/nav-links";
import styles from "./HomeFooter.module.scss";

export const HomeFooter = () => (
	<footer id="contacts" className={styles.footer}>
		<div className={styles.grass} aria-hidden="true" />
		<div className={styles.content}>
			<div className={styles.topline}>
				<span>UNITED PARTS / НА СВЯЗИ</span>
				<a href="#" aria-label="Вернуться к началу страницы">
					Наверх <span aria-hidden="true">↑</span>
				</a>
			</div>
			<div className={styles.main}>
				<div className={styles.brandBlock}>
					<LogoMark className={styles.logo} />
					<p className={styles.description}>
						От детали — до результата.
						<br />
						Запчасти для техники, которая работает.
					</p>
				</div>
				<nav className={styles.navigation} aria-label="Навигация в подвале">
					<span className={styles.label}>НАВИГАЦИЯ</span>
					<Link href="/catalog">
						Каталог запчастей <span aria-hidden="true">↗</span>
					</Link>
					<Link href="/about">О бренде</Link>
					<Link href="/news">Новости</Link>
					
				</nav>
				<nav className={styles.navigation} aria-label="Покупателям">
					<span className={styles.label}>ПОКУПАТЕЛЯМ</span>
					<Link href="/warranty">Гарантия</Link>
					<Link href="/delivery">Доставка</Link>
					<Link href="/instructions">Инструкции и деталировки</Link>
					<Link href="/shops">Магазины и сервисы</Link>
				</nav>
				<div className={styles.contacts}>
					<span className={styles.label}>ДИЛЕРАМ</span>
					<PhoneLink phone={contactPhone} variant="light" className={styles.phone} />
					<Link href="/partnership" className={styles.dealerLink}>
						Стать дилером <span aria-hidden="true">↗</span>
					</Link>
				</div>
			</div>
			<div className={styles.bottom}>
				<span>© {new Date().getFullYear()} United Parts</span>
				<span>Точность в каждой детали.</span>
			</div>
		</div>
	</footer>
);

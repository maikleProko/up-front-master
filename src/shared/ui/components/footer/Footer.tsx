import React from "react";
import { Logo } from "shared/ui/atoms";
import styles from "./Footer.module.scss";

export const Footer = () => (
	<footer className={styles.footer}>
		<div className="common-content">
			<div className={styles.inner}>
				<Logo />
				<div className={styles.copy}>© {new Date().getFullYear()} United Parts. Все права защищены</div>
			</div>
		</div>
	</footer>
);

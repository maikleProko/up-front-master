import React from "react";
import Link from "next/link";
import { Logo } from "shared/ui/atoms";
import AppRouter from "pages/router";
import styles from "./AuthLayout.module.scss";

export interface IAuthLayout {
	children?: React.ReactNode;
}

export const AuthLayout = (props: IAuthLayout) => (
	<div className={styles.layout}>
		<div className={styles.card}>
			<Link {...AppRouter.index.link}>
				<Logo />
			</Link>
			<div style={{ marginTop: 20 }}>{props.children}</div>
		</div>
	</div>
);

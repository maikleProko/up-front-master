import React from "react";
import Link from "next/link";
import { Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Logo } from "shared/ui/atoms";
import { useAppContext } from "shared/context/app-context.provider";
import AppRouter from "pages/router";
import styles from "./Header.module.scss";

export const Header = () => {
	const { auth } = useAppContext();

	return (
		<header className={styles.header}>
			<div className="common-content">
				<div className={styles.inner}>
					<Link {...AppRouter.index.link}><Logo /></Link>
					<nav className={styles.nav}>
						<Link {...AppRouter.index.link} className={styles.navLink}>Главная</Link>
						<Link {...AppRouter.catalog.link} className={styles.navLink}>Каталог</Link>
					</nav>
					<div className={styles.actions}>
						{auth.currentUser ? (
							<Button icon={<UserOutlined />} onClick={auth.logout}>{auth.currentUser.name}</Button>
						) : (
							<Link {...AppRouter.auth.login.link}><Button icon={<UserOutlined />}>Войти</Button></Link>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

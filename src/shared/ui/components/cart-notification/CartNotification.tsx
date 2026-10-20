import React from "react";
import styles from "./CartNotification.module.scss";

interface ICartNotification {
	productName: string;
	title?: string;
	onClose: () => void;
}

export const CartNotificationStack = ({ children }: { children: React.ReactNode }) => (
	<div className={styles.stack}>{children}</div>
);

export const CartNotification = ({ productName, title = "Товар добавлен", onClose }: ICartNotification) => (
	<div
		className={styles.notification}
		role="status"
		aria-live="polite"
		aria-atomic="true"
		onAnimationEnd={(event) => {
			if (event.target === event.currentTarget) onClose();
		}}
	>
		<span className={styles.icon} aria-hidden="true">
			<svg viewBox="0 0 24 24">
				<path d="m6.5 12.5 3.5 3.5 7.5-8" />
			</svg>
		</span>
		<div className={styles.body}>
			<strong>{title}</strong>
			<p>{productName}</p>
		</div>
		<button className={styles.close} type="button" aria-label="Закрыть уведомление" onClick={onClose}>
			×
		</button>
	</div>
);

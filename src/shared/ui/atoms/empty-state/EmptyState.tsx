import React from "react";
import styles from "./EmptyState.module.scss";

export interface IEmptyState {
	title?: React.ReactNode;
	description?: React.ReactNode;
	icon?: "search" | "cart" | "comparison" | "not-found";
	action?: React.ReactNode;
	className?: string;
}

export const EmptyState = (props: IEmptyState) => (
	<div className={`${styles.emptyState} ${props.className ?? ""}`}>
		<span className={styles.icon} aria-hidden="true"><StateIcon type={props.icon ?? "search"} /></span>
		<h2>{props.title ?? "Ничего не найдено"}</h2>
		{props.description && <p>{props.description}</p>}
		{props.action && <div className={styles.action}>{props.action}</div>}
	</div>
);

const StateIcon = ({ type }: { type: NonNullable<IEmptyState["icon"]> }) => {
	if (type === "cart") return <svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
	if (type === "comparison") return <svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20V7" /></svg>;
	if (type === "not-found") return <svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>;
	return <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>;
};

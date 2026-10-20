import React from "react";
import classNames from "classnames";
import { Icon } from "shared/ui/atoms/icon";
import styles from "./PhoneLink.module.scss";

export interface IPhoneLink {
	phone: string;
	variant?: "accent" | "light";
	className?: string;
}

export const PhoneLink = (props: IPhoneLink) => {
	const colorClass = props.variant === "light" ? styles.light : styles.accent;

	return (
		<a
			className={classNames(styles.link, colorClass, props.className)}
			href={`tel:${props.phone.replace(/\s/g, "")}`}
		>
			<Icon name="phone" className={styles.icon} />
			<span className={styles.text}>{props.phone}</span>
		</a>
	);
};

import React from "react";
import classNames from "classnames";
import styles from "./Logo.module.scss";

export interface ILogo {
	className?: string;
}

export const Logo = (props: ILogo) => (
	<span className={classNames(styles.logo, props.className)}>
		u<span className={styles.mark}>P</span>
		<span className={styles.wordmark}>United Parts</span>
	</span>
);

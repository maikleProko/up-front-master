import React from "react";
import classNames from "classnames";
import styles from "./LogoMark.module.scss";

export interface ILogoMark {
	className?: string;
	dark?: boolean;
}

export const LogoMark = (props: ILogoMark) => (
	<img
		src="/images/logo-mark.svg"
		alt="United Parts"
		className={classNames(styles.mark, props.dark && styles.dark, props.className)}
	/>
);

import { formatPrice } from "shared/lib/price";
import React from "react";
import classNames from "classnames";
import styles from "./Price.module.scss";

export interface IPrice {
	value: number;
	currency?: string;
	className?: string;
}

export { formatPrice } from "shared/lib/price";

export const Price = (props: IPrice) => (
	<span className={classNames(styles.price, props.className)}>
		{formatPrice(props.value)} {props.currency ?? "₽"}
	</span>
);

Price.defaultProps = {};

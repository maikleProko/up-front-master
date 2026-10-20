import React, { ButtonHTMLAttributes } from "react";
import classNames from "classnames";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "./Button.module.scss";

export interface IButton extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
	htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
	block?: boolean;
	loading?: boolean;
}

export const Button = (props: IButton) => {
	const { htmlType, block, loading, disabled, className, children, ...rest } = props;

	return (
		<button
			type={htmlType ?? "button"}
			disabled={disabled || loading}
			className={classNames(styles.button, block && styles.block, className)}
			{...rest}
		>
			{loading && <LoadingOutlined />}
			{children}
		</button>
	);
};

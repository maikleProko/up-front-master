import React, { ButtonHTMLAttributes } from "react";
import classNames from "classnames";
import { notifyStub } from "shared/lib/stub";
import styles from "./StubLink.module.scss";

export interface IStubLink extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type"> {
	message?: string;
}

export const StubLink = (props: IStubLink) => {
	const { message, className, ...rest } = props;

	return (
		<button
			type="button"
			className={classNames(styles.link, className)}
			onClick={() => notifyStub(message)}
			{...rest}
		/>
	);
};

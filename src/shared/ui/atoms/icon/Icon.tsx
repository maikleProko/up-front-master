import React, { ComponentType, CSSProperties, SVGProps } from "react";
import classNames from "classnames";
import PhoneIcon from "./svg/phone.svg";
import styles from "./icon.module.scss";

export type IconName = "phone";

const icons: Record<IconName, ComponentType<SVGProps<SVGSVGElement>>> = {
	phone: PhoneIcon,
};

export interface IIcon {
	name: IconName;
	className?: string;
	style?: CSSProperties;
}

export const Icon = (props: IIcon) => {
	const Component = icons[props.name];

	return <Component className={classNames(styles.icon, props.className)} style={props.style} />;
};

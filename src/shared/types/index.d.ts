declare module "*.module.scss" {
	const classes: { [key: string]: string };
	export default classes;
}

declare module "*.svg" {
	import type { FC, SVGProps } from "react";
	const Component: FC<SVGProps<SVGSVGElement>>;
	export default Component;
}

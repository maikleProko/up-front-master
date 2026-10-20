import React from "react";
import { HomeFooter, TeaserTopbar } from "modules/home/shared";
import teaserStyles from "modules/home/shared/ui/teaser/Teaser.module.scss";
import styles from "./MainLayout.module.scss";

export interface IMainLayout {
	children?: React.ReactNode;
	stickyTopbar?: boolean;
}

export const MainLayout = (props: IMainLayout) => (
	<div className={styles.layout}>
		<div className={`${styles.topbarOuter} ${props.stickyTopbar ? styles.stickyTopbar : ""}`}>
			<div className={teaserStyles.content}>
				<TeaserTopbar dark />
			</div>
		</div>
		<div className={`common-content ${styles.content}`}>{props.children}</div>
		<HomeFooter />
	</div>
);

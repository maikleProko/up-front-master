import React from "react";
import styles from "modules/catalog/shared/ui/catalog-background/CatalogBackground.module.scss";

export const CatalogBackground = () => (
	<div className={styles.background} aria-hidden="true">
		<img className={styles.leftShade} src="/images/catalog-index-left-shade.svg" alt="" />
		<div className={styles.rightShade}>
			<img src="/images/catalog-index-right-shade.svg" alt="" />
			<img className={styles.rightShadeInner} src="/images/catalog-index-right-shade-inner.svg" alt="" />
		</div>
	</div>
);

import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { TeaserTopbar } from "./TeaserTopbar";
import teaserStyles from "./Teaser.module.scss";
import styles from "./StickyTopbar.module.scss";

const SHOW_THRESHOLD = 100;

export const StickyTopbar = () => {
	const [visible, setVisible] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => setVisible(window.scrollY > SHOW_THRESHOLD);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
		<div className={classNames(styles.fixedElements, visible && styles.visible)}>
			<div className={styles.topbarOuter}>
				<div className={teaserStyles.content}>
					<TeaserTopbar dark mobileMenuEnabled={visible} onMobileMenuChange={setMenuOpen} />
				</div>
			</div>
		</div>
		<div className={`${styles.menuSpacer} ${visible && menuOpen ? styles.menuSpacerOpen : ""}`} aria-hidden="true" />
		</>
	);
};

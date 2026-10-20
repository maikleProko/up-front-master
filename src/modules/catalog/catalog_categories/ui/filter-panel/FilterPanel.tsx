import React, { useId, useState } from "react";
import styles from "../catalog-categories/CatalogCategories.module.scss";

export const FilterPanel = ({ title, children }: { title: string; children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const id = useId();
	return (
		<div className={styles.filterSection}>
			<button
				className={`${styles.filterSummary} ${isOpen ? styles.filterSummaryOpen : ""}`}
				type="button"
				aria-expanded={isOpen}
				aria-controls={id}
				onClick={() => setIsOpen((value) => !value)}
			>
				<span>{title}</span>
			</button>
			<div
				id={id}
				className={`${styles.filterContent} ${isOpen ? styles.filterContentOpen : ""}`}
				inert={!isOpen}
			>
				<div>{children}</div>
			</div>
		</div>
	);
};

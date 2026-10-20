import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SparePartSearch } from "shared/ui/components";
import AppRouter from "pages/router";
import styles from "./TeaserBody.module.scss";

export const TeaserBody = () => {
	const [search, setSearch] = useState("");
	const router = useRouter();

	return (
		<div className={styles.body}>
			<div className={styles.title}>
				ОТ ДЕТАЛИ <br /> ДО РЕЗУЛЬТАТА
			</div>
			<div className={styles.description}>
				Мы производим качественные запчасти, которые будут надёжны при любых условиях
			</div>
			<SparePartSearch
				value={search}
				onChange={setSearch}
				onSearch={(value) => router.push(AppRouter.catalog.search(value).link.href)}
				className={styles.search}
			/>
			<div className={styles.mobileActions}>
				<Link {...AppRouter.catalog.link} className={styles.catalogButton}>Каталог</Link>
				<button type="button" className={styles.dealerButton} disabled>Стать дилером</button>
			</div>
		</div>
	);
};

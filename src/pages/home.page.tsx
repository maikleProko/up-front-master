import React from "react";
import { Teaser, StickyTopbar, About, AboutAdvantages, HomeFooter } from "modules/home/shared";
import { useHomeContent } from "modules/home/shared/api/home.api";
import { HomeNewProducts, HomeNews, HomeShops } from "modules/home/shared/ui/home-content/HomeContent";
import styles from "./home.page.module.scss";

export const HomePage = () => {
	const { data, error, isLoading, mutate } = useHomeContent();
	const content = data?.data;
	return (
		<div className={styles.page}>
			<StickyTopbar />
			<Teaser />
			<main className={styles.content}>
				<AboutAdvantages />
				<HomeNewProducts
					products={content?.new_products ?? []}
					isLoading={isLoading}
					error={Boolean(error)}
					onRetry={() => void mutate()}
				/>
				<About />
				{error ? (
					<div className={styles.status} role="status">
						<p>Не удалось загрузить новости и адреса магазинов.</p>
						<button type="button" onClick={() => void mutate()}>
							Повторить
						</button>
					</div>
				) : isLoading ? (
					<p className={styles.status} role="status">
						Загружаем новости и магазины…
					</p>
				) : (
					<>
						<HomeNews news={content?.news ?? []} />
						<HomeShops shops={content?.shops ?? []} cities={content?.shop_cities} />
					</>
				)}
			</main>
			<HomeFooter />
		</div>
	);
};

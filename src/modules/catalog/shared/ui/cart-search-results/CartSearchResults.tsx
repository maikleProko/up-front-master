import React from "react";
import { useCatalogCategory } from "modules/catalog/shared/api/hooks";
import { CatalogProductCard } from "../catalog-product-card/CatalogProductCard";
import { CartRowsSkeleton } from "../catalog-skeleton/CatalogSkeleton";
import styles from "./CartSearchResults.module.scss";

export const CartSearchResults = ({ query, pending }: { query: string; pending: boolean }) => {
	const { data, error, isLoading, mutate } = useCatalogCategory({ slug: "search", search: query });
	const loading = pending || isLoading;
	const products = data?.data.products ?? [];
	return (
		<section className={styles.results} aria-labelledby="cart-search-title" aria-busy={loading}>
			<div className={styles.heading}>
				<h2 id="cart-search-title">Результаты поиска</h2>
				<span role="status">
					{loading ? "Ищем товары…" : error ? "Поиск недоступен" : `Найдено: ${products.length}`}
				</span>
			</div>
			{loading ? (
				<CartRowsSkeleton />
			) : error ? (
				<div className={styles.message} role="alert">
					<p>Не удалось загрузить товары. Попробуйте ещё раз.</p>
					<button type="button" onClick={() => void mutate()}>
						Повторить поиск
					</button>
				</div>
			) : products.length ? (
				<div className={styles.list}>
					{products.map((product) => (
						<CatalogProductCard key={product.id} product={product} layout="row" />
					))}
				</div>
			) : (
				<p className={styles.message}>
					По запросу «{query}» ничего не найдено. Попробуйте другое название или артикул.
				</p>
			)}
		</section>
	);
};

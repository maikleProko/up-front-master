import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import { formatMoney as money } from "shared/lib/price";
import { CartQuantity } from "modules/catalog/shared/ui/cart-quantity/CartQuantity";
import { CartRowsSkeleton, SummarySkeleton } from "modules/catalog/shared/ui/catalog-skeleton/CatalogSkeleton";
import { ContentImage } from "shared/ui/skeleton";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AppRouter from "pages/router";
import { useAppContext } from "shared/context/app-context.provider";
import { SparePartSearch } from "shared/ui/components/spare-part-search/SparePartSearch";
import { EmptyState } from "shared/ui/atoms";
import { CatalogBackground } from "modules/catalog/shared";
import catalogStyles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";
import styles from "./cart.page.module.scss";

import { CartSearchResults } from "modules/catalog/shared/ui/cart-search-results/CartSearchResults";


export const CartPage = () => {
	const router = useRouter();
	const { cart } = useAppContext();
	const [search, setSearch] = useState("");
	const [query, setQuery] = useState("");
	useEffect(() => {
		const timer = window.setTimeout(() => setQuery(search.trim()), 300);
		return () => window.clearTimeout(timer);
	}, [search]);
	const checkout = () => {
		if (!cart.items.length) return;
		void router.push(AppRouter.catalog.order.link.href);
	};

	return (
		<section className={styles.page}>
			<CatalogBackground />
			<div className={styles.content}>
				<Breadcrumbs items={[{ label: "Корзина" }]} />
				<h1>Корзина</h1>
				<div className={catalogStyles.searchRow}>
					<Link
						className={catalogStyles.backButton}
						aria-label="Вернуться в каталог"
						{...AppRouter.catalog.link}
					>
						<img src="/images/catalog-back-button.svg" alt="" />
					</Link>
					<SparePartSearch
						value={search}
						onChange={setSearch}
						onSearch={setQuery}
						className={catalogStyles.search}
					/>
				</div>
				{!cart.isLoading && !cart.items.length ? (
					<EmptyState
						className={styles.emptyState}
						icon="cart"
						title="Корзина пуста"
						description="Добавьте товары из каталога, и они появятся здесь."
						action={<Link {...AppRouter.catalog.link}>Перейти в каталог</Link>}
					/>
				) : (
					<div className={styles.cartLayout}>
						<div className={styles.cartBox}>
							{cart.isLoading ? (
								<CartRowsSkeleton />
							) : (
								<>
									<div className={styles.header}>
										<span>ТОВАР</span>
										<span>ЦЕНА</span>
										<span>КОЛИЧЕСТВО</span>
										<span>ВСЕГО</span>
										<span />
									</div>
									{cart.items.map((item) => (
										<div className={styles.row} key={item.id}>
											<Link
												className={styles.product}
												{...AppRouter.catalog.product(String(item.id)).link}
											>
												<ContentImage
													src={item.image || "/images/product-no-photo.png"}
													alt=""
												/>
												<div>
													<strong>{item.name}</strong>
													<small>Арт. {item.code}</small>
												</div>
											</Link>
											<div>{money(item.price)}</div>
											<CartQuantity item={item} className={styles.quantity} min={1} />
											<strong>{money(item.price * item.quantity)}</strong>
											<button
												className={styles.remove}
												type="button"
												onClick={() => cart.removeItem(item.id)}
												aria-label={`Удалить ${item.name}`}
											>
												×
											</button>
										</div>
									))}
									<div className={styles.cartFooter}>
										<Link {...AppRouter.catalog.link}>Вернуться</Link>
										<button type="button" onClick={cart.clear}>
											Очистить корзину
										</button>
									</div>
								</>
							)}
						</div>
						<aside className={styles.summary}>
							<div className={styles.summaryTitle}>Оформление корзины</div>
							{cart.isLoading ? (
								<SummarySkeleton />
							) : (
								<>
									<div>
										<span>Всего:</span>
										<strong>{money(cart.total)}</strong>
									</div>
									<div>
										<span>Доставка:</span>
										<strong>Бесплатно</strong>
									</div>
									<div className={styles.summaryTotal}>
										<span>Итог:</span>
										<strong>{money(cart.total)}</strong>
									</div>
									<button type="button" onClick={checkout} disabled={!cart.items.length}>
										Оформить корзину
									</button>
								</>
							)}
						</aside>
					</div>
				)}
				{search.trim() && <CartSearchResults query={query} pending={query !== search.trim()} />}
			</div>
		</section>
	);
};

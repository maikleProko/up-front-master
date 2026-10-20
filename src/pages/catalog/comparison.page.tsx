import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import { CartQuantity } from "modules/catalog/shared/ui/cart-quantity/CartQuantity";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Alert } from "antd";
import { CatalogBackground, useProductSelection } from "modules/catalog/shared";
import { formatProductPrice, productPrice, productImage, toCartItem } from "modules/catalog/shared/lib/product";
import { useAppContext } from "shared/context/app-context.provider";
import { ContentImage } from "shared/ui/skeleton";
import { EmptyState } from "shared/ui/atoms";
import AppRouter from "pages/router";
import catalogStyles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";
import styles from "./comparison.page.module.scss";

export const ComparisonPage = () => {
	const { cart, comparison } = useAppContext();
	const request = useProductSelection(comparison.ids);
	const [differencesOnly, setDifferencesOnly] = useState(false);
	const [categoryId, setCategoryId] = useState("all");
	const comparisonWrapRef = useRef<HTMLDivElement>(null);
	const productsControlRef = useRef<HTMLTableCellElement>(null);
	const [columnWidth, setColumnWidth] = useState<number>();
	const allProducts = request.data?.data ?? [];
	const categories = Array.from(new Map(allProducts.flatMap((product) => (product.categories ?? []).map((category) => [category.id, category] as const))).values())
		.sort((a, b) => a.name.localeCompare(b.name, "ru"));
	const products = categoryId === "all" ? allProducts : allProducts.filter((product) => product.categories?.some((category) => category.id === Number(categoryId)));
	const unavailableIds = comparison.ids.filter((id) => !allProducts.some((item) => item.id === id));
	const characteristics = Array.from(new Map(products.flatMap((product) => product.characteristics.map((item) => [item.id, item] as const))).values())
		.sort((a, b) => a.sort_position - b.sort_position || a.id - b.id);
	const rows = [
		{ id: "brand", name: "Бренд", values: products.map((product) => product.brand?.name ?? "—") },
		{ id: "stock", name: "Наличие", values: products.map((product) => product.stock_quantity > 0 ? "В наличии" : "Под заказ") },
		...characteristics.map((characteristic) => ({
			id: `characteristic-${characteristic.id}`,
			name: `${characteristic.name}${characteristic.unit ? `, ${characteristic.unit}` : ""}`,
			values: products.map((product) => product.characteristics.find((item) => item.id === characteristic.id)?.value ?? "—"),
		})),
	].filter((row) => !differencesOnly || new Set(row.values).size > 1);
	const loading = comparison.isLoading || request.isLoading;
	useEffect(() => {
		const wrapper = comparisonWrapRef.current;
		const header = productsControlRef.current;
		if (!wrapper || !header || !products.length) return;
		const updateWidth = () => {
			const availableWidth = wrapper.clientWidth - header.getBoundingClientRect().width;
			setColumnWidth(Math.max(1, availableWidth / Math.min(products.length, 3)));
		};
		updateWidth();
		const observer = new ResizeObserver(updateWidth);
		observer.observe(wrapper);
		observer.observe(header);
		return () => observer.disconnect();
	}, [loading, products.length]);
	useEffect(() => {
		const wrapper = comparisonWrapRef.current;
		if (!wrapper || loading || request.error || products.length <= 3) return;
		const scrollProducts = (event: WheelEvent) => {
			if (event.ctrlKey || wrapper.scrollWidth <= wrapper.clientWidth) return;
			const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
			if (!delta) return;
			event.preventDefault();
			const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
				: event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? wrapper.clientWidth : 1;
			wrapper.scrollLeft += delta * unit;
		};
		wrapper.addEventListener("wheel", scrollProducts, { passive: false });
		return () => wrapper.removeEventListener("wheel", scrollProducts);
	}, [loading, request.error, products.length]);

	return <section className={styles.page}>
		<CatalogBackground />
		<div className={styles.inner}>
			<Breadcrumbs items={[{ label: "Каталог", link: AppRouter.catalog.link }, { label: "Сравнение товаров" }]} />
			<div className={styles.heading}>
				<div><h1>Сравнение товаров</h1>{allProducts.length > 0 && <p>{allProducts.length} {productWord(allProducts.length)} в сравнении</p>}</div>
				{comparison.ids.length > 0 && <button className={styles.clear} type="button" onClick={comparison.clear}>Очистить список</button>}
			</div>
			{loading ? <p className={styles.state} role="status">Загрузка товаров…</p>
				: request.error ? <Alert type="error" title="Не удалось загрузить товары" action={<button className={styles.retry} type="button" onClick={() => void request.mutate()}>Повторить</button>} />
					: comparison.ids.length === 0 ? <EmptyState
						icon="comparison"
						title="Список сравнения пуст"
						description="Добавьте товары из каталога, чтобы сопоставить цены и характеристики."
						action={<Link {...AppRouter.catalog.link}>Перейти в каталог</Link>}
					/> : <>
						{unavailableIds.length > 0 && <div className={styles.unavailable}>
							<span>Некоторые товары больше недоступны на этом сайте.</span>
							<button type="button" onClick={() => unavailableIds.forEach(comparison.remove)}>Убрать недоступные ({unavailableIds.length})</button>
						</div>}
						<div className={styles.controls}>
							<label className={styles.switch}><input type="checkbox" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} /><span aria-hidden="true" />Показывать только различия</label>
							{products.length > 1 && <small>Таблицу можно прокручивать по горизонтали</small>}
						</div>
						{products.length > 0 && <div className={styles.comparisonWrap} ref={comparisonWrapRef}>
							<table className={styles.comparison} style={{ "--product-count": products.length, "--product-width": columnWidth === undefined ? undefined : `${columnWidth}px` } as React.CSSProperties}>
								<caption>Сравнение выбранных товаров</caption>
								<thead><tr><th scope="col" ref={productsControlRef} className={`${styles.labelCell} ${styles.productsControl}`}>
									<strong>Товары</strong>
									<label htmlFor="comparison-category">Категория</label>
									<select id="comparison-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
										<option value="all">Все категории</option>
										{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
									</select>
									<small>Показано: {products.length}</small>
								</th>{products.map((product) => {
									const image = productImage(product);
									const price = productPrice(product);
									const cartItem = cart.items.find((item) => item.id === product.id);
									return <th scope="col" key={product.id} className={styles.productCell}>
										<button className={styles.remove} type="button" onClick={() => comparison.remove(product.id)} aria-label={`Убрать ${product.name} из сравнения`}>×</button>
										<Link className={styles.imageLink} {...AppRouter.catalog.product(String(product.id)).link}><ContentImage src={image} alt={product.name} /></Link>
										<small>Артикул: {product.code}</small>
										<Link className={styles.productName} {...AppRouter.catalog.product(String(product.id)).link}>{product.name}</Link>
										<strong>{formatProductPrice(price)}</strong>
										{cartItem ? <CartQuantity item={cartItem} className={`${catalogStyles.productQuantity} ${styles.quantity}`} />
											: <button className={styles.buy} type="button" onClick={() => cart.addItem(toCartItem(product))}>В корзину</button>}
									</th>;
								})}</tr></thead>
								<tbody>
									{rows.map((row) => <tr key={row.id}><th scope="row" className={styles.labelCell}>{row.name}</th>{row.values.map((value, index) => <td key={products[index].id}>{value}</td>)}</tr>)}
								</tbody>
							</table>
						</div>}
						{products.length === 1 && <p className={styles.note}>Добавьте ещё хотя бы один товар, чтобы сравнение стало нагляднее.</p>}
						{products.length > 1 && differencesOnly && rows.length === 0 && <p className={styles.note}>Различий в заполненных характеристиках нет.</p>}
					</>}
		</div>
	</section>;
};

const productWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "товар" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? "товара" : "товаров";

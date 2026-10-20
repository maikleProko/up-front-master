import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import { CategorySkeleton } from "modules/catalog/shared/ui/catalog-skeleton/CatalogSkeleton";
import { Skeleton, ContentImage } from "shared/ui/skeleton";
import React, { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { EmptyState } from "shared/ui/atoms";
import { SparePartSearch } from "shared/ui/components";
import { useMobile } from "shared/lib/use-mobile";
import { resolveCatalogImage as resolveImageUrl } from "modules/catalog/shared/lib/product";
import { CatalogProductCard } from "modules/catalog/shared/ui/catalog-product-card/CatalogProductCard";
import { CatalogBackground, useCatalogCategory } from "modules/catalog/shared";
import { CatalogRange, getCharacteristicFilters, parseNumericValue } from "modules/catalog/catalog_categories/model";
import { FilterSection } from "modules/catalog/catalog_categories/ui/filter-section";
import { RangeFilterSection } from "modules/catalog/catalog_categories/ui/range-filter-section";
import AppRouter from "pages/router";
import styles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";
import { ComparisonLink } from "modules/catalog/shared/ui/comparison-button/ComparisonButton";

export interface ICatalogCategories {
	slug: string;
}

export const CatalogCategories = (props: ICatalogCategories) => {
	const router = useRouter();
	const routeSearch = typeof router.query.search === "string" ? router.query.search : "";
	const [search, setSearch] = useState(routeSearch);
	const [query, setQuery] = useState(routeSearch);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const mobile = useMobile();
	const filtersId = useId();
	const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
	const [newOnly, setNewOnly] = useState(false);
	const [ranges, setRanges] = useState<Record<number, CatalogRange>>({});
	const [selectedCharacteristicValues, setSelectedCharacteristicValues] = useState<Record<number, string[]>>({});
	const categoryRequest = useCatalogCategory({ slug: props.slug, search: query });
	const loading = categoryRequest.isLoading;
	const category = categoryRequest.data?.data.category;
	const breadcrumbs = categoryRequest.data?.data.breadcrumbs ?? [];
	const subcategories = categoryRequest.data?.data.children ?? [];
	const products = categoryRequest.data?.data.products ?? [];
	const characteristics = categoryRequest.data?.data.characteristics ?? [];
	const title = category?.name ?? (props.slug === "search" ? "Результаты поиска" : "Каталог");
	const parentBreadcrumb = breadcrumbs.at(-2);
	const backLink = parentBreadcrumb ? AppRouter.catalog.category(parentBreadcrumb.slug).link : AppRouter.catalog.link;
	useEffect(() => {
		setSearch(routeSearch);
		setQuery(routeSearch);
	}, [routeSearch]);
	useEffect(() => {
		setSelectedBrands([]);
		setNewOnly(false);
		setRanges({});
		setSelectedCharacteristicValues({});
	}, [props.slug]);
	const brands = useMemo(
		() =>
			Array.from(
				new Map(
					products.flatMap((product) => (product.brand ? [[product.brand.id, product.brand] as const] : [])),
				).values(),
			),
		[products],
	);
	const characteristicFilters = useMemo(
		() => getCharacteristicFilters(characteristics, products),
		[characteristics, products],
	);
	const newProductsCount = products.filter((product) => product.status === "NEW").length;
	const showBrandFilter = brands.length > 1;
	const showStatusFilter = newProductsCount > 0;
	const hasFilters = showBrandFilter || showStatusFilter || characteristicFilters.length > 0;
	const visibleProducts = useMemo(
		() =>
			products.filter((product) => {
				if (
					showBrandFilter &&
					selectedBrands.length &&
					(!product.brand || !selectedBrands.includes(product.brand.id))
				)
					return false;
				if (showStatusFilter && newOnly && product.status !== "NEW") return false;
				return characteristicFilters.every((filter) => {
					const characteristic = product.characteristics.find((item) => item.characteristic_id === filter.id);
					if ("min" in filter) {
						const selectedRange = ranges[filter.id];
						if (!selectedRange) return true;
						const value = characteristic ? parseNumericValue(characteristic.value) : null;
						return value !== null && value >= selectedRange[0] && value <= selectedRange[1];
					}
					const selectedValues = selectedCharacteristicValues[filter.id] ?? [];
					return (
						!selectedValues.length ||
						Boolean(characteristic && selectedValues.includes(characteristic.value))
					);
				});
			}),
		[
			characteristicFilters,
			newOnly,
			products,
			ranges,
			selectedBrands,
			selectedCharacteristicValues,
			showBrandFilter,
			showStatusFilter,
		],
	);
	const toggleBrand = (brandValue: string | number) => {
		const brand = Number(brandValue);
		setSelectedBrands((values) =>
			values.includes(brand) ? values.filter((value) => value !== brand) : [...values, brand],
		);
	};
	const handleSearch = (value: string) => {
		setSelectedBrands([]);
		setNewOnly(false);
		setRanges({});
		setSelectedCharacteristicValues({});
		setQuery(value);
		void router.push(
			{
				pathname: router.pathname,
				query: { slug: props.slug, search: value || undefined },
			},
			undefined,
			{ shallow: true },
		);
	};
	const filterSidebar = (
		<div className={styles.sidebar}>
			<button
				className={styles.filterToggle}
				type="button"
				aria-expanded={filtersOpen}
				aria-controls={filtersId}
				onClick={() => setFiltersOpen((value) => !value)}
			>
				Фильтры <span>{filtersOpen ? "−" : "+"}</span>
			</button>

			<div
				id={filtersId}
				className={`${styles.filtersReveal} ${filtersOpen ? styles.filtersRevealOpen : ""}`}
				inert={mobile && !filtersOpen}
			>
				<div className={styles.filtersClip}>
					<aside className={styles.filters}>
						{showBrandFilter && (
							<FilterSection
								title="Бренд"
								options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
								selected={selectedBrands}
								onToggle={toggleBrand}
							/>
						)}
						{showStatusFilter && (
							<FilterSection
								title="Отметки"
								options={[{ value: "NEW", label: "Новинка", count: newProductsCount }]}
								selected={newOnly ? ["NEW"] : []}
								onToggle={() => setNewOnly((value) => !value)}
							/>
						)}
						{characteristicFilters.map((filter) =>
							"min" in filter ? (
								<RangeFilterSection
									key={filter.id}
									filter={filter}
									value={ranges[filter.id] ?? [filter.min, filter.max]}
									onChange={(value) => setRanges((current) => ({ ...current, [filter.id]: value }))}
								/>
							) : (
								<FilterSection
									key={filter.id}
									title={filter.title}
									options={filter.options.map((option) => ({ value: option, label: option }))}
									selected={selectedCharacteristicValues[filter.id] ?? []}
									onToggle={(option) =>
										setSelectedCharacteristicValues((current) => {
											const values = current[filter.id] ?? [];
											return {
												...current,
												[filter.id]: values.includes(option as string)
													? values.filter((value) => value !== option)
													: [...values, option as string],
											};
										})
									}
								/>
							),
						)}
					</aside>
				</div>
			</div>
		</div>
	);
	const renderResults = (results: React.ReactNode) => {
		if (!hasFilters) return results;
		return (
			<div className={`${styles.catalogBody} ${!subcategories.length ? styles.withoutSubcategories : ""}`}>
				{filterSidebar}
				{results}
			</div>
		);
	};

	return (
		<section className={styles.catalog}>
			<Head><title>{`${title} — United Parts`}</title></Head>
			<CatalogBackground />
			<div className={styles.content}>
				<Breadcrumbs items={[{ label: "Каталог", link: AppRouter.catalog.link }, ...(breadcrumbs.length ? breadcrumbs.map((item, index) => ({ label: item.name, link: index === breadcrumbs.length - 1 ? undefined : AppRouter.catalog.category(item.slug).link })) : [{ label: title }])]} />

				<h1>{loading ? <Skeleton width="45%" height="1.2em" /> : title}</h1>
				<div className={styles.searchRow}>
					<Link className={styles.backButton} aria-label="Вернуться на уровень выше" {...backLink}>
						<img src="/images/catalog-back-button.svg" alt="" />
					</Link>
					<SparePartSearch
						value={search}
						onChange={setSearch}
						onSearch={handleSearch}
						className={styles.search}
					/>
				</div>

				{loading ? (
					<CategorySkeleton />
				) : (
					renderResults(
						<div
							className={`${styles.results} ${!subcategories.length ? styles.withoutSubcategories : ""}`}
						>
							<div
								className={`${styles.subcategories} ${!subcategories.length ? styles.subcategoriesEmpty : ""}`}
							>
								{subcategories.map((subcategory) => (
									<Link
										className={styles.subcategory}
										key={subcategory.id}
										{...AppRouter.catalog.category(subcategory.slug).link}
									>
										<ContentImage
											src={resolveImageUrl(subcategory.image, "/images/category-no-photo.png")}
											alt=""
										/>
										<span>{subcategory.name}</span>
									</Link>
								))}
							</div>

							<div className={styles.categoriesDivider}></div>

							<div
								id="products"
								className={`${styles.products} ${!hasFilters ? styles.productsWithoutCharacteristics : ""}`}
							>
								<div className={styles.productsToolbar}>
									<ComparisonLink />
								</div>

								{categoryRequest.error && (
									<p className={styles.empty}>Не удалось загрузить категорию</p>
								)}
								{!categoryRequest.isLoading &&
									!categoryRequest.error &&
									visibleProducts.map((product) => (
										<CatalogProductCard key={product.id} product={product} />
									))}
								{!categoryRequest.isLoading && !categoryRequest.error && !visibleProducts.length && (
									<EmptyState
										title="Товары не найдены"
										description="Попробуйте изменить запрос или сбросить выбранные фильтры."
									/>
								)}
							</div>
						</div>,
					)
				)}
			</div>
		</section>
	);
};

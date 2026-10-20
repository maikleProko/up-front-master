import React from "react";
import { Skeleton, SkeletonLines, SkeletonRegion } from "shared/ui/skeleton";
import { CatalogBackground } from "../catalog-background";
import category from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";
import pointer from "modules/catalog/catalog_pointer/ui/catalog-pointer/CatalogPointer.module.scss";
import product from "pages/catalog/product.page.module.scss";
import styles from "./CatalogSkeleton.module.scss";

export const CatalogIndexSkeleton = () => (
	<SkeletonRegion label="Загрузка категорий">
		{Array.from({ length: 3 }, (_, i) => (
			<div className={pointer.group} key={i}>
				<div className={styles.groupTitle}>
					<Skeleton width={42} height={36} />
				</div>
				<div className={pointer.items}>
					{Array.from({ length: 12 }, (_, j) => (
						<Skeleton key={j} width={`${70 + (j % 3) * 10}%`} />
					))}
				</div>
			</div>
		))}
	</SkeletonRegion>
);

export const ProductCardSkeleton = () => (
	<div className={`${category.product} ${styles.card}`}>
		<Skeleton height={160} />
		<SkeletonLines count={3} />
		<Skeleton width="48%" height={26} />
		<Skeleton height={40} />
	</div>
);

export const CategorySkeleton = () => (
	<SkeletonRegion label="Загрузка категории и товаров">
		<div className={category.catalogBody}>
			<div className={category.sidebar}>
				<div className={styles.mobileFilter}>
					<Skeleton height={48} />
				</div>
				<div className={category.filters}>
					{[0, 1, 2].map((i) => (
						<div className={category.filterSection} key={i}>
							<SkeletonLines count={5} />
						</div>
					))}
				</div>
			</div>
			<div className={category.results}>
				<div className={category.subcategories}>
					{[0, 1, 2].map((i) => (
						<div className={`${category.subcategory} ${styles.card}`} key={i}>
							<Skeleton height={100} />
							<Skeleton width="80%" />
						</div>
					))}
				</div>
				<div className={category.categoriesDivider} />
				<div className={category.products}>
					{Array.from({ length: 6 }, (_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			</div>
		</div>
	</SkeletonRegion>
);

export const ProductPageSkeleton = () => (
	<section className={product.page}>
		<CatalogBackground />
		<SkeletonRegion className={product.inner} label="Загрузка товара">
			<Skeleton width="45%" height={20} />
			<div className={product.product}>
				<div className={`${product.gallery} ${styles.gallery}`}>
					<div className={`${product.thumbnailRail} ${product.compactThumbnailRail} ${styles.thumbnails}`}>
						{[0, 1, 2, 3].map((i) => (
							<Skeleton key={i} width={80} height={90} />
						))}
					</div>
					<Skeleton className={styles.hero} height={440} />
				</div>
				<div className={`${product.info} ${styles.info}`}>
					<Skeleton height={32} width="85%" />
					<Skeleton width="65%" />
					<Skeleton height={30} width="38%" />
					<div className={product.rule} />
					<Skeleton height={56} width="50%" />
					<SkeletonLines count={3} />
					<Skeleton height={52} />
					<Skeleton width="60%" />
				</div>
			</div>
			<div className={product.details}>
				{[0, 1].map((i) => (
					<div key={i}>
						<div className={styles.groupTitle}>
							<Skeleton width="55%" height={28} />
						</div>
						<SkeletonLines count={5} />
					</div>
				))}
			</div>
		</SkeletonRegion>
	</section>
);

export const CartRowsSkeleton = () => (
	<SkeletonRegion label="Загрузка корзины">
		<div className={styles.rows}>
			{[0, 1, 2].map((i) => (
				<div className={styles.row} key={i}>
					<Skeleton width={72} height={72} />
					<SkeletonLines count={2} />
					<Skeleton width="20%" height={24} />
				</div>
			))}
		</div>
	</SkeletonRegion>
);

export const SummarySkeleton = () => (
	<SkeletonRegion label="Загрузка суммы заказа">
		<div className={styles.info}>
			<SkeletonLines count={3} />
			<Skeleton height={48} />
		</div>
	</SkeletonRegion>
);

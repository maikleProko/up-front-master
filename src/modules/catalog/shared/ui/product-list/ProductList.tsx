import { ProductCardSkeleton } from "modules/catalog/shared/ui/catalog-skeleton/CatalogSkeleton";
import { SkeletonRegion } from "shared/ui/skeleton";
import React from "react";
import type { SWRResponse } from "swr";
import { List } from "shared/ui/list";
import { IApiListResponse } from "shared/api";
import { IProduct } from "modules/catalog/shared/model";
import { ProductCard } from "modules/catalog/shared/ui/product-card";
import styles from "modules/catalog/shared/ui/product-list/ProductList.module.scss";

export interface IProductList {
	data: SWRResponse<IApiListResponse<IProduct>>;
}

export const ProductList = (props: IProductList) => (
	<div className={styles.grid}>
		<List
			data={props.data}
			loadingContent={Array.from({ length: 6 }, (_, i) => (
				<SkeletonRegion key={i} label="Загрузка товара">
					<ProductCardSkeleton />
				</SkeletonRegion>
			))}
			renderItem={(product) => <ProductCard key={product.id} data={product} />}
			emptyText="Товары не найдены"
		/>
	</div>
);

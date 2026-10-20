import { productPrice, productImage } from "modules/catalog/shared/lib/product";
import { ContentImage } from "shared/ui/skeleton";
import React from "react";
import Link from "next/link";
import { Card } from "antd";
import { Price } from "shared/ui/atoms";
import { IProduct } from "modules/catalog/shared/model";
import { BuyButton } from "modules/catalog/shared/ui/buy-button";
import AppRouter from "pages/router";
import styles from "modules/catalog/shared/ui/product-card/ProductCard.module.scss";
import { ComparisonButton } from "modules/catalog/shared/ui/comparison-button/ComparisonButton";

export interface IProductCard {
	data: IProduct;
}

export const ProductCard = (props: IProductCard) => {
	const { data } = props;

	return (
		<Card className={styles.card}>
			<div className={styles.image}><ContentImage src={productImage(data)} alt={data.name} /></div>
			<div className={styles.category}>{data.category?.name}</div>

			<Link {...AppRouter.catalog.product(String(data.id)).link}>
				<div className={styles.title}>{data.name}</div>
			</Link>

			<div className={styles.description}>{data.default_description}</div>

			<div className={styles.footer}>
				<Price value={Number(productPrice(data))} />
				<BuyButton product={data} />
			</div>
			<ComparisonButton id={data.id} productName={data.name} />
		</Card>
	);
};

import React from "react";
import Link from "next/link";
import { IProductSparePart } from "modules/catalog/shared/model";
import { formatProductPrice, resolveCatalogImage } from "modules/catalog/shared/lib/product";
import { ComparisonButton } from "modules/catalog/shared/ui/comparison-button/ComparisonButton";
import { ContentImage } from "shared/ui/skeleton";
import { useAppContext } from "shared/context/app-context.provider";
import AppRouter from "pages/router";
import styles from "./RelatedProducts.module.scss";

export const RelatedProducts = ({ items, showComparison = true }: { items: IProductSparePart[]; showComparison?: boolean }) => {
	const { cart } = useAppContext();
	return <div className={styles.products}>{items.map((item) => {
		const image = resolveCatalogImage(item.image);
		const inCart = cart.items.some((entry) => entry.id === item.id);
		return <article className={styles.product} key={item.id}>
			<Link className={styles.productLink} {...AppRouter.catalog.product(String(item.id)).link}>
				<ContentImage src={image} alt={item.name} />
				<span>{item.name}</span>
			</Link>
			<small>Артикул: {item.code}</small>
			<strong>{formatProductPrice(item.price)}</strong>
			{inCart ? <Link className={styles.buy} {...AppRouter.catalog.cart.link}>В корзине</Link>
				: <button className={styles.buy} type="button" onClick={() => cart.addItem({ ...item, price: Number(item.price), image })}>В корзину</button>}
			{showComparison && <ComparisonButton id={item.id} productName={item.name} />}
		</article>;
	})}</div>;
};

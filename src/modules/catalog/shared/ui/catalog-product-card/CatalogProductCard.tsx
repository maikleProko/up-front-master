import { CartQuantity } from "modules/catalog/shared/ui/cart-quantity/CartQuantity";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AppRouter from "pages/router";
import { Button } from "shared/ui/atoms";
import { ContentImage } from "shared/ui/skeleton";
import { useAppContext } from "shared/context/app-context.provider";
import { ICatalogCategoryProduct } from "modules/catalog/shared/model";
import { resolveCatalogImage as resolveImageUrl, formatProductPrice as formatPrice } from "modules/catalog/shared/lib/product";
import { ComparisonButton } from "../comparison-button/ComparisonButton";
import styles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";

export const CatalogProductCard = ({
	product,
	layout = "grid",
}: {
	product: ICatalogCategoryProduct;
	layout?: "grid" | "row";
}) => {
	const router = useRouter();
	const { cart } = useAppContext();
	const openProduct = (id: number) => {
		void router.push(AppRouter.catalog.product(String(id)).link.href);
	};
	const handleProductClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
		const target = event.target as HTMLElement;
		if (target.closest("a, button, input, label, [data-card-navigation='false']")) return;
		openProduct(id);
	};

	return (
		<article
			className={`${styles.product} ${layout === "row" ? styles.productRow : ""}`}
			key={product.id}
			role="link"
			tabIndex={0}
			onClick={(event) => handleProductClick(event, product.id)}
			onKeyDown={(event) => {
				if (event.key === "Enter" && event.target === event.currentTarget) openProduct(product.id);
			}}
		>
			<div className={styles.productActions}>
				<ComparisonButton id={product.id} productName={product.name} variant="icon" />
				<button className={styles.favorite} type="button" aria-label="Добавить в избранное">
					<img src="/images/catalog-favorite.svg" alt="" />
				</button>
			</div>
			<ContentImage
				className={styles.productImage}
				src={resolveImageUrl(product.image, "/images/product-no-photo.png")}
				alt={product.name}
			/>
			<div className={styles.productText}>
				<Link {...AppRouter.catalog.product(String(product.id)).link}>{product.name}</Link>
				<span data-card-navigation="false">Артикул: {product.code}</span>
			</div>
			<div className={styles.productMeta}>
				<div className={styles.price} data-card-navigation="false">
					<strong>{formatPrice(product.default_price)}</strong>
				</div>
				<div className={styles.stock}>
					<b>В наличии</b>
					<span>в магазинах</span>
				</div>
			</div>
			{(() => {
				const cartItem = cart.items.find((item) => item.id === product.id);
				return cartItem ? (
					<CartQuantity item={cartItem} className={styles.productQuantity} />
				) : (
					<Button
						className={styles.buyButton}
						block
						onClick={() =>
							cart.addItem({
								id: product.id,
								name: product.name,
								code: product.code,
								price: Number(product.default_price),
								image: resolveImageUrl(product.image, "/images/product-no-photo.png"),
							})
						}
					>
						<img src="/images/catalog-cart.svg" alt="" />В корзину
					</Button>
				);
			})()}
		</article>
	);
};

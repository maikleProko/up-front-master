import { CartQuantity } from "modules/catalog/shared/ui/cart-quantity/CartQuantity";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Modal, Select } from "antd";
import { IProduct } from "modules/catalog/shared/model";
import { formatProductPrice, productPrice, productImage, toCartItem, resolveProductFileUrl } from "modules/catalog/shared/lib/product";
import { ComparisonButton } from "modules/catalog/shared/ui/comparison-button/ComparisonButton";
import { ContentImage, Skeleton } from "shared/ui/skeleton";
import { useAppContext } from "shared/context/app-context.provider";
import { IHomeNews, IHomeShop, IShopCity } from "../../api/home.api";
import { nearestShopCity } from "../../lib/shop-city";
import AppRouter from "pages/router";
import catalogStyles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";
import styles from "./HomeContent.module.scss";

const ShopsMap = dynamic(() => import("../shops-map/ShopsMap").then((module) => module.ShopsMap), {
	ssr: false,
	loading: () => <p role="status">Загружаем карту…</p>,
});

const newsPhotos: Record<string, string> = {
	"Готовим технику к новому сезону": "/images/news/season-maintenance.webp",
	"Новые детали — новые возможности": "/images/news/new-spare-parts.webp",
	"Как найти нужную запчасть": "/images/news/part-selection.webp",
	"Ближе к вашей мастерской": "/images/news/parts-shop.webp",
};
const newsPhoto = (news: IHomeNews) =>
	newsPhotos[news.title] || resolveProductFileUrl(news.image ?? "") || "/images/spares.png";

const Arrow = () => <span aria-hidden="true">↗</span>;
const date = (value: string) =>
	new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "Europe/Moscow",
	}).format(new Date(value));

export const HomeNewProducts = ({
	products,
	isLoading = false,
	error = false,
	onRetry,
}: {
	products: IProduct[];
	isLoading?: boolean;
	error?: boolean;
	onRetry?: () => void;
}) => {
	const { cart } = useAppContext();
	const pending = isLoading && !products.length;
	const productColumns = Math.max(1, Math.min(products.length, 4));
	return (
		<section id="new-products" className={`${styles.section} ${styles.productsSection}`}>
			<div className={styles.container}>
				<div className={styles.heading}>
					<div>
						<span className={styles.eyebrow}>01 / ОБНОВЛЕНИЕ АССОРТИМЕНТА</span>
						<h2>
							Новые детали.
							<br />
							<span>Новые возможности.</span>
						</h2>
					</div>
					<Link className={styles.textLink} {...AppRouter.catalog.link}>
						Весь каталог <Arrow />
					</Link>
				</div>
				<div
					className={`${styles.productGrid} ${products.length <= 1 ? styles.sparseProducts : ""}`}
					style={{ "--product-columns": productColumns } as React.CSSProperties}
				>
					{pending && (
						<article
							className={`${styles.product} ${styles.productSkeleton}`}
							role="status"
							aria-label="Загрузка новинок"
							aria-busy="true"
						>
							<div className={styles.productTop}>
								<Skeleton width={100} height={30} />
								<Skeleton width={32} height={32} />
							</div>
							<div className={styles.productImage}>
								<Skeleton height={200} />
							</div>
							<div className={styles.productDetails}>
								<Skeleton width="60%" height={14} />
								<div className={styles.productName}>
									<Skeleton height={20} />
									<Skeleton width="80%" height={20} />
								</div>
								<div className={styles.price}>
									<Skeleton width="50%" height={28} />
								</div>
								<div className={styles.purchaseControl}>
									<Skeleton height={62} />
								</div>
							</div>
						</article>
					)}
					{!pending && !products.length && (
						<div className={styles.product} role="status">
							<p className={styles.empty}>
								{error
									? "Не удалось загрузить новинки."
									: "Новые товары скоро появятся. Посмотрите весь ассортимент в каталоге."}
							</p>
							{error && onRetry && (
								<button type="button" className={styles.buy} onClick={onRetry}>
									Повторить
								</button>
							)}
						</div>
					)}
					{products.map((product) => {
						const image = productImage(product);
						const price = productPrice(product);
						const item = cart.items.find((entry) => entry.id === product.id);
						return (
							<article className={styles.product} key={product.id}>
								<div className={styles.productTop}>
									<span className={styles.badge}>НОВИНКА</span>
									<ComparisonButton id={product.id} productName={product.name} variant="icon" />
								</div>
								<Link
									className={styles.productImage}
									{...AppRouter.catalog.product(String(product.id)).link}
								>
									<ContentImage src={image} alt={product.name} />
								</Link>
								<div className={styles.productDetails}>
									<small>Артикул: {product.code}</small>
									<Link
										className={styles.productName}
										{...AppRouter.catalog.product(String(product.id)).link}
									>
										{product.name}
									</Link>
									<strong className={styles.price}>{formatProductPrice(price)}</strong>
									<div className={styles.purchaseControl}>
										{item ? (
											<CartQuantity item={item} className={`${catalogStyles.productQuantity} ${styles.quantity}`} />
										) : (
											<button
												type="button"
												className={styles.buy}
												onClick={() =>
													cart.addItem(toCartItem(product))
												}
											>
												В корзину <span aria-hidden="true">+</span>
											</button>
										)}
									</div>
								</div>
							</article>
						);
					})}
					<Link {...AppRouter.catalog.link} className={styles.catalogCard}>
						<span className={styles.catalogMark} aria-hidden="true" />
						<span className={styles.catalogLabel}>КАТАЛОГ UNITED PARTS</span>
						<div>
							<h3>
								Найдётся
								<br />
								та самая деталь.
							</h3>
							<p>
								По артикулу, бренду или категории.
								<br />
								Всё для возвращения техники в строй.
							</p>
						</div>
						<span className={styles.catalogAction}>
							Подобрать запчасть <Arrow />
						</span>
					</Link>
				</div>
			</div>
		</section>
	);
};

export const HomeNews = ({ news }: { news: IHomeNews[] }) => (
	<section id="news" className={`${styles.section} ${styles.newsSection}`}>
		<div className={styles.container}>
			<div className={styles.heading}>
				<div>
					<span className={styles.eyebrow}>03 / ЖУРНАЛ UNITED PARTS</span>
					<h2>
						Новости<span>.</span>
					</h2>
				</div>
				<p>
					Всё, что помогает вашей
					<br />
					технике работать дольше.
				</p>
			</div>
			<NewsContent news={news.slice(0, 4)} />
			<Link {...AppRouter.news.link} className={styles.allNews}>
				<span>Посмотреть все</span> <Arrow />
			</Link>
		</div>
	</section>
);

export const NewsContent = ({ news, layout = "grid" }: { news: IHomeNews[]; layout?: "grid" | "list" }) => {
	const [selected, setSelected] = useState<IHomeNews | null>(null);
	const Title = layout === "list" ? "h2" : "h3";
	return (
		<>
			{news.length ? (
				<div className={layout === "list" ? styles.newsList : styles.newsGrid}>
					{news.map((item, index) => (
						<button
							type="button"
							data-content-card
							className={`${styles.newsCard} ${layout === "grid" && index === 0 ? styles.featured : ""}`}
							key={item.id}
							onClick={() => setSelected(item)}
						>
							<div className={styles.newsImage}>
								<ContentImage src={newsPhoto(item)} alt="" />
								<span className={styles.newsArrow}>
									<Arrow />
								</span>
							</div>
							<div className={styles.newsText}>
								<time dateTime={item.published_at}>{date(item.published_at)}</time>
								<Title className={styles.newsTitle}>{item.title}</Title>
								<p>{item.excerpt}</p>
							</div>
						</button>
					))}
				</div>
			) : (
				<p className={styles.empty}>
					Скоро здесь появятся новости и полезные материалы о запчастях и уходе за техникой.
				</p>
			)}
			<Modal
				open={Boolean(selected)}
				onCancel={() => setSelected(null)}
				footer={null}
				title={selected?.title}
				width={760}
			>
				{selected && (
					<article className={styles.newsDetail}>
						<time dateTime={selected.published_at}>{date(selected.published_at)}</time>
						<ContentImage src={newsPhoto(selected)} alt="" />
						<p>{selected.text}</p>
						{selected.video && (
							<video
								key={selected.id}
								controls
								playsInline
								preload="metadata"
								src={resolveProductFileUrl(selected.video)}
							>
								Ваш браузер не поддерживает видео.{" "}
								<a href={resolveProductFileUrl(selected.video)}>Скачать видео</a>
							</video>
						)}
					</article>
				)}
			</Modal>
		</>
	);
};

const emptyCities: IShopCity[] = [];

export const HomeShops = ({ shops, cities = emptyCities, standalone = false, embedded = false }: { shops: IHomeShop[]; cities?: IShopCity[]; standalone?: boolean; embedded?: boolean }) => {
	const searchId = useId();
	const layout = useRef<HTMLDivElement>(null);
	const manualCity = useRef(false);
	const [cityName, setCityName] = useState("");
	const [shopType, setShopType] = useState<IHomeShop["type"]>("SHOP");
	const city = cities.find((item) => item.name_city === cityName) ?? cities.find((item) => item.name_city === "Санкт-Петербург") ?? cities[0];
	useEffect(() => {
		if (!cities.length || manualCity.current || !navigator.geolocation) return;
		let active = true;
		navigator.geolocation.getCurrentPosition(({ coords }) => {
			if (!active || manualCity.current) return;
			const nearest = nearestShopCity(cities, coords.latitude, coords.longitude);
			if (nearest) { setCityName(nearest.name_city); setSelectedId(null); }
		}, () => {}, { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 });
		return () => { active = false; };
	}, [cities]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [selectionVersion, setSelectionVersion] = useState(0);
	const selectShop = useCallback((id: number) => {
		setSelectedId(id);
		setSelectionVersion((value) => value + 1);
	}, []);
	const filtered = useMemo(() => shops.filter((shop) =>
		Boolean(city) && shop.city?.trim() === city?.name_city && shop.type === shopType,
	), [shops, city, shopType]);
	const selected = filtered.find((shop) => shop.id === selectedId);
	return (
		<section id={embedded ? undefined : "where-to-buy"} className={`${styles.section} ${styles.shopsSection} ${standalone ? styles.standalone : ""} ${embedded ? styles.embedded : styles.wideShops}`}>
			<div className={styles.container}>
				{!embedded && <div className={styles.heading}>
					<div>
						<span className={styles.eyebrow}>04 / НАШИ ПАРТНЁРЫ</span>
						<h2>
							Всегда рядом<span>.</span>
						</h2>
					</div>
					<p>
						Найдите магазин рядом с вами.
						<br />С выбором запчастей помогут на месте.
					</p>
				</div>}
				<div className={styles.mapLayout} ref={layout}>
					<aside className={styles.shopPanel}>
						<label className={styles.searchLabel} htmlFor={searchId}>Ваш город</label>
						<Select
							id={searchId}
							className={styles.citySelect}
							showSearch
							optionFilterProp="label"
							getPopupContainer={(trigger) => trigger.parentElement!}
							placeholder="Выберите город"
							value={city?.name_city}
							options={cities.map((item) => ({ value: item.name_city, label: item.name_city }))}
							notFoundContent="Город не найден"
							onChange={(value) => { manualCity.current = true; setCityName(value); setSelectedId(null); }}
						/>
						<div className={styles.shopTabs} role="group" aria-label="Тип организации">
							{([['SHOP', 'Магазин'], ['SERVICE_CENTER', 'СЦ']] as const).map(([value, label]) =>
								<button key={value} type="button" aria-pressed={shopType === value} onClick={() => { setShopType(value); setSelectedId(null); }}>{label}</button>,
							)}
						</div>
						<p className={styles.resultsCount} role="status">
							{shopType === "SHOP" ? "Магазинов" : "Сервисных центров"}: {filtered.length}
						</p>
						<div className={styles.shopList}>
							{filtered.map((shop) => (
								<button
									type="button"
									data-content-card
									className={`${styles.shop} ${selected?.id === shop.id ? styles.selectedShop : ""}`}
									key={shop.id}
									aria-pressed={selected?.id === shop.id}
									onClick={() => selectShop(shop.id)}
								>
									<small>{shop.city}</small>
									<strong>{shop.name}</strong>
									<span>{shop.address}</span>
									{shop.phone && <span>{shop.phone}</span>}
									{shop.working_hours && <span className={styles.hours}>{shop.working_hours}</span>}
								</button>
							))}
						</div>
						{!filtered.length && (
							<div className={styles.empty}>
								<p>{city ? "В этом городе пока нет адресов выбранного типа. Выберите другой город или тип организации." : "Адреса партнёров скоро появятся здесь."}</p>
							</div>
						)}
					</aside>
					<div className={styles.map}>
						<ShopsMap city={city} interactionBounds={embedded ? undefined : layout} shops={filtered} selectedId={selected?.id ?? null} selectionVersion={selectionVersion} onSelect={selectShop} />
					</div>
				</div>
				<div className={styles.mapFooter}>
					<p className={styles.mapNote}>Наличие запчастей и часы работы уточняйте в выбранном магазине.</p>
				</div>
			</div>
		</section>
	);
};

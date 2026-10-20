import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import { CartQuantity } from "modules/catalog/shared/ui/cart-quantity/CartQuantity";
import { ProductPageSkeleton } from "modules/catalog/shared/ui/catalog-skeleton/CatalogSkeleton";
import { ContentImage } from "shared/ui/skeleton";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { Alert } from "antd";
import { EmptyState } from "shared/ui/atoms";
import AppRouter from "pages/router";
import { useAppContext } from "shared/context/app-context.provider";
import { CatalogBackground, useProduct, useProductSelection } from "modules/catalog/shared";
import { ComparisonButton } from "modules/catalog/shared/ui/comparison-button/ComparisonButton";
import { RelatedProducts } from "modules/catalog/shared/ui/related-products/RelatedProducts";
import { HomeShops } from "modules/home/shared/ui/home-content/HomeContent";
import { useHomeContent } from "modules/home/shared/api/home.api";
import { ProductDocuments } from "modules/catalog/shared/ui/product-documents/ProductDocuments";
import { formatProductPrice as money, resolveProductFileUrl as resolveImageUrl, toRelatedProduct, productPrice, toCartItem } from "modules/catalog/shared/lib/product";
import { useMobile } from "shared/lib/use-mobile";
import styles from "./product.page.module.scss";

export interface IProductPage { id: string; }

export const ProductPage = ({ id }: IProductPage) => {
	const { data, error, isLoading } = useProduct(id);
	const { cart, comparison, recentlyViewed } = useAppContext();
	const product = data?.data;
	const shopsRequest = useHomeContent();
	const recentIds = recentlyViewed.ids.filter((value) => value !== Number(id)).slice(0, 8);
	const recentRequest = useProductSelection(recentIds);
	useEffect(() => {
		if (product && !recentlyViewed.isLoading) recentlyViewed.visit(product.id);
	}, [product, recentlyViewed.isLoading, recentlyViewed.visit]);
	const [activeImage, setActiveImage] = useState(0);
	const [thumbnailStart, setThumbnailStart] = useState(0);
	const [mobileThumbnailEdges, setMobileThumbnailEdges] = useState({ start: true, end: false });
	const mobile = useMobile();
	const thumbsViewportRef = useRef<HTMLDivElement>(null);
	const galleryRef = useRef<HTMLDivElement>(null);
	const images = useMemo(() => product?.files.filter((file) => ["IMAGE", "VIDEO"].includes(file.type) && file.path) ?? [], [product]);
	useEffect(() => {
		const viewport = thumbsViewportRef.current;
		if (!viewport || !mobile) return;
		const updateEdges = () => setMobileThumbnailEdges({
			start: viewport.scrollLeft <= 1,
			end: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1,
		});
		updateEdges();
		const observer = new ResizeObserver(updateEdges);
		observer.observe(viewport);
		const handleWheel = (event: WheelEvent) => {
			if (viewport.scrollWidth <= viewport.clientWidth) return;
			const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
			if ((delta < 0 && viewport.scrollLeft > 0) || (delta > 0 && viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1)) {
				event.preventDefault();
				viewport.scrollLeft += delta;
			}
		};
		viewport.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			observer.disconnect();
			viewport.removeEventListener("wheel", handleWheel);
		};
	}, [mobile, images]);
	useEffect(() => {
		setActiveImage(0);
		setThumbnailStart(0);
		if (thumbsViewportRef.current) thumbsViewportRef.current.scrollLeft = 0;
	}, [id]);
	useEffect(() => {
		const galleryElement = galleryRef.current;
		if (!galleryElement || !images.length) return;
		let disposed = false;
		let lightbox: { init: () => void; destroy: () => void } | undefined;
		void import("photoswipe/lightbox").then(({ default: PhotoSwipeLightbox }) => {
			if (disposed) return;
			const instance = new PhotoSwipeLightbox({
				gallery: galleryElement,
				children: "a",
				showHideAnimationType: "zoom",
				bgOpacity: 0.92,
				secondaryZoomLevel: ({ fit }) => Math.min(1, fit * 3) * 1.5,
				maxZoomLevel: ({ fit }) => Math.max(1, fit * 4) * 1.5,
				pswpModule: () => import("photoswipe"),
			});
			instance.on("change", () => {
				if (instance.pswp) {
					const photos = images.filter((file) => file.type === "IMAGE");
					setActiveImage(images.findIndex((file) => file.id === photos[instance.pswp!.currIndex]?.id));
				}
			});
			instance.init();
			lightbox = instance;
		});
		return () => {
			disposed = true;
			lightbox?.destroy();
		};
	}, [images]);

	if (!id || isLoading) return <ProductPageSkeleton />;
	if (error) return <Alert type="error" title="Не удалось загрузить товар" />;
	if (!product) return <EmptyState
		icon="not-found"
		title="Товар не найден"
		description="Возможно, товар был удалён или больше недоступен."
		action={<Link {...AppRouter.catalog.link}>Перейти в каталог</Link>}
	/>;

	const currentPrice = productPrice(product);
	const oldPrice = product.discount_price ? (product.retail_price ?? product.default_price) : null;
	const discount = oldPrice && Number(oldPrice) > Number(currentPrice)
		? Math.round((1 - Number(currentPrice) / Number(oldPrice)) * 100) : 0;
	const compatibleItems = product.compatible_items ?? [];
	const characteristics = product.characteristics.filter((item) => item.value.trim()).sort((a, b) => (a.sort_position ?? 0) - (b.sort_position ?? 0) || a.id - b.id);
	const advantages = characteristics.filter((item) => item.is_advantage);
	const hasDescription = Boolean(product.default_description?.trim() || product.additional_description?.trim());
	const hasCharacteristics = Boolean(characteristics.length || product.characteristic_description?.trim());
	const hasEquipment = Boolean(product.equipment_description?.trim());
	const recentProducts = recentRequest.data?.data ?? [];
	const sectionLinks = [
		{ id: "description", label: "Описание", visible: hasDescription },
		{ id: "advantages", label: "Преимущества", visible: advantages.length > 0 },
		{ id: "characteristics", label: "Все характеристики", visible: hasCharacteristics },
		{ id: "equipment", label: "Комплектация", visible: hasEquipment },
		{ id: "compatibility", label: "К чему подходит", visible: compatibleItems.length > 0 },
		{ id: "spare-parts", label: "Запчасти", visible: Boolean(product.spare_parts?.length) },
		{ id: "similar", label: "Похожие товары", visible: Boolean(product.similar_items?.length) },
		{ id: "accessories", label: "Аксессуары", visible: Boolean(product.accessories?.length) },
		{ id: "where-to-buy", label: "Где купить", visible: true },
		{ id: "recent", label: "Вы смотрели ранее", visible: recentProducts.length > 0 },
	].filter((section) => section.visible);
	const galleryImages = images.length ? images : [{ id: -1, type: "IMAGE", path: "/images/product-no-photo.png", alt: "Нет фото", title: null }];
	const galleryImageUrl = (path: string) => images.length ? resolveImageUrl(path) : path;
	const selectImage = (index: number) => {
		if (index === activeImage) return;
		setActiveImage(index);
	};
	const maxThumbnailStart = Math.max(0, galleryImages.length - 4);
	const scrollThumbnailsUp = () => mobile
		? thumbsViewportRef.current?.scrollBy({ left: -78, behavior: "smooth" })
		: setThumbnailStart((start) => Math.max(0, start - 1));
	const scrollThumbnailsDown = () => mobile
		? thumbsViewportRef.current?.scrollBy({ left: 78, behavior: "smooth" })
		: setThumbnailStart((start) => Math.min(maxThumbnailStart, start + 1));
	const cartItem = cart.items.find((item) => item.id === product.id);
	const addToCart = () => cart.addItem(toCartItem(product));

	return <section className={styles.page}>
		<Head>
			<title>{`${product.name} — United Parts`}</title>
			<meta name="description" content={product.default_description?.trim() || `${product.name}. Артикул ${product.code}. Каталог запчастей United Parts.`} />
		</Head>
		<CatalogBackground />
		<div className={styles.inner}>
			<Breadcrumbs items={[{ label: "Каталог", link: AppRouter.catalog.link }, ...product.breadcrumbs.map((item, index) => ({ label: item.name, link: index === product.breadcrumbs.length - 1 ? undefined : AppRouter.catalog.category(item.slug).link }))]} />
			<div className={styles.product}>
				<div className={styles.gallery}>
					<div className={`${styles.thumbnailRail} ${galleryImages.length < 5 ? styles.compactThumbnailRail : ""}`}>
						{galleryImages.length > 4 && <button className={`${styles.galleryArrow} ${styles.galleryArrowUp}`} type="button" onClick={scrollThumbnailsUp} disabled={mobile ? mobileThumbnailEdges.start : thumbnailStart === 0} aria-label="Прокрутить галерею вверх"><img src="/images/product-gallery-chevron.svg" alt="" /></button>}
						<div ref={thumbsViewportRef} className={styles.thumbsViewport}
							onScroll={() => {
								const viewport = thumbsViewportRef.current;
								if (viewport && mobile) setMobileThumbnailEdges({ start: viewport.scrollLeft <= 1, end: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1 });
							}}>
							<div className={styles.thumbs} style={{ "--thumbnail-offset": `${-thumbnailStart * 102}px` } as React.CSSProperties}>{galleryImages.map((image, index) =>
								<button type="button" className={index === activeImage ? styles.activeThumb : ""} onClick={() => selectImage(index)} key={image.id} aria-label={`${image.type === "VIDEO" ? "Видео" : "Изображение"} ${index + 1}`} aria-pressed={index === activeImage}>{image.type === "VIDEO" ? <span className={styles.videoThumb}>▶<small>Видео</small></span> : <ContentImage src={galleryImageUrl(image.path)} alt="" />}</button>)}
							</div>
						</div>
						{galleryImages.length > 4 && <button className={styles.galleryArrow} type="button" onClick={scrollThumbnailsDown} disabled={mobile ? mobileThumbnailEdges.end : thumbnailStart === maxThumbnailStart} aria-label="Прокрутить галерею вниз"><img src="/images/product-gallery-chevron.svg" alt="" /></button>}
					</div>
					{images.length ? (
						<div className={styles.heroGallery} ref={galleryRef}>
							{images.map((image, index) => {
								const src = resolveImageUrl(image.path);
								if (image.type === "VIDEO") return index === activeImage ? <video key={image.id} className={styles.heroVideo} src={src} controls playsInline preload="metadata" aria-label={image.title || `Обзор: ${product.name}`} /> : null;
								return (
									<a
									className={`${styles.heroButton} ${index === activeImage ? styles.activeHero : ""}`}
										href={src}
										data-pswp-width="1600"
										data-pswp-height="1200"
										data-cropped="true"
										target="_blank"
										rel="noreferrer"
										aria-label={`Открыть изображение ${index + 1} из ${images.length}`}
										key={image.id}
									>
										<ContentImage
											className={styles.heroImage}
											src={src}
											alt={image.alt ?? product.name}
											onLoad={(event) => {
												const link = event.currentTarget.closest("a");
												if (!link) return;
												link.dataset.pswpWidth = String(event.currentTarget.naturalWidth);
												link.dataset.pswpHeight = String(event.currentTarget.naturalHeight);
											}}
										/>
										<img className={styles.expandOverlay} src="/images/product-expand.svg" alt="" />
									</a>
								);
							})}
						</div>
					) : (
						<ContentImage className={`${styles.heroImage} ${styles.noPhoto}`} src={galleryImages[0].path} alt="Нет фото" />
					)}
				</div>
				<div className={styles.info}>
					<div className={styles.titleLine}><h1 className={styles.productTitle}>{product.name}</h1><span className={product.stock_quantity > 0 ? styles.inStock : styles.outStock}>{product.stock_quantity > 0 ? "В наличии" : "Под заказ"}</span></div>
					<div className={styles.rating}><span><strong>Артикул:</strong> {product.code}</span></div>
					<div className={styles.price}>{oldPrice && <del>{money(oldPrice)}</del>}<strong>{money(currentPrice)}</strong>{discount > 0 && <span>{discount}% скидка</span>}</div><div className={styles.rule} />
					<div className={styles.brandShare}><div className={styles.brand}>Бренд: <span>{product.brand?.name === "Makita" ? <img src="/images/product-brand-makita.png" alt="Makita" /> : product.brand?.name ?? "—"}</span></div><div className={styles.share}>Поделиться:{["facebook", "twitter", "pinterest", "instagram"].map((name) => <button type="button" key={name} aria-label={`Поделиться: ${name}`}><img src={`/images/product-social-${name}.svg`} alt="" /></button>)}</div></div>
					{comparison.ids.includes(product.id) && <p className={styles.comparisonHint} role="status">
						Товар добавлен в сравнение. <Link {...AppRouter.catalog.comparison.link}>Перейти к сравнению</Link>
					</p>}
					<div className={styles.cta}>
						{cartItem ? (
							<CartQuantity item={cartItem} className={`${styles.quantity} ${styles.cartQuantity}`} />
						) : (
							<button className={styles.cart} type="button" onClick={addToCart}>Добавить в корзину <img src="/images/product-cart-white.svg" alt="" /></button>
						)}
						<button className={styles.favorite} type="button" aria-label="В избранное"><img src="/images/product-heart.svg" alt="" /></button>
						<ComparisonButton id={product.id} productName={product.name} variant="circle" />
					</div>
					<ProductDocuments key={product.id} files={product.files} />
					{compatibleItems.length > 0 && <div className={styles.smallDetails}><p><strong>Совместимые модели:</strong> {compatibleItems.map((item) => item.code).join(", ")}</p></div>}
				</div>
			</div>
			{sectionLinks.length > 0 && <nav className={styles.sectionNav} aria-label="Разделы товара">
				{sectionLinks.map((section) => <a href={`#${section.id}`} key={section.id}>{section.label}</a>)}
			</nav>}
			<div className={styles.sections}>
				{hasDescription && <section id="description"><h2 className={styles.sectionTitle}>Описание</h2>
					{product.default_description?.trim() && <p className={styles.text}>{product.default_description}</p>}
					{product.additional_description?.trim() && <p className={styles.text}>{product.additional_description}</p>}
				</section>}
				{advantages.length > 0 && <section id="advantages"><h2 className={styles.sectionTitle}>Преимущества</h2>
					<div className={styles.advantages}>{advantages.map((item, index) => <article key={item.id}>
						<span>{String(index + 1).padStart(2, "0")}</span><h3>{item.name}</h3><p>{item.value}{item.unit ? ` ${item.unit}` : ""}</p>
					</article>)}</div>
				</section>}
				{hasCharacteristics && <section id="characteristics"><h2 className={styles.sectionTitle}>Все характеристики</h2>
					{characteristics.length > 0 && <dl className={styles.characteristics}>{characteristics.map((item) => <div key={item.id}><dt>{item.name}{item.unit ? `, ${item.unit}` : ""}</dt><dd>{item.value}</dd></div>)}</dl>}
					{product.characteristic_description?.trim() && <p className={styles.text}>{product.characteristic_description}</p>}
				</section>}
				{hasEquipment && <section id="equipment"><h2 className={styles.sectionTitle}>Комплектация</h2><p className={styles.text}>{product.equipment_description}</p></section>}
				{compatibleItems.length > 0 && <section id="compatibility"><h2 className={styles.sectionTitle}>К чему подходит</h2>
					<div className={styles.tableWrap}><table><thead><tr><th>№</th><th>Арт.</th><th>Название</th></tr></thead><tbody>{compatibleItems.map((item, index) => <tr key={item.id}><td>{index + 1}.</td><td>{item.code}</td><td><Link {...AppRouter.catalog.product(String(item.id)).link}>{item.name}</Link></td></tr>)}</tbody></table></div>
				</section>}
				{Boolean(product.spare_parts?.length) && <section id="spare-parts"><h2 className={styles.sectionTitle}>Запчасти</h2><RelatedProducts items={product.spare_parts} /></section>}
				{Boolean(product.similar_items?.length) && <section id="similar"><h2 className={styles.sectionTitle}>Похожие товары</h2><RelatedProducts items={product.similar_items} /></section>}
				{Boolean(product.accessories?.length) && <section id="accessories"><h2 className={styles.sectionTitle}>Аксессуары</h2><RelatedProducts items={product.accessories} /></section>}
				<section id="where-to-buy"><h2 className={styles.sectionTitle}>Где купить</h2>
					{shopsRequest.error ? <Alert type="error" title="Не удалось загрузить партнёров" action={<button type="button" onClick={() => void shopsRequest.mutate()}>Повторить</button>} />
						: shopsRequest.isLoading ? <p role="status">Загружаем магазины и сервисы…</p>
							: <HomeShops shops={shopsRequest.data?.data.shops ?? []} cities={shopsRequest.data?.data.shop_cities} embedded />}
				</section>
				{recentProducts.length > 0 && <section id="recent"><h2 className={styles.sectionTitle}>Вы смотрели ранее</h2>
					<RelatedProducts items={recentProducts.map(toRelatedProduct)} />
				</section>}
			</div>
		</div>
	</section>;
};

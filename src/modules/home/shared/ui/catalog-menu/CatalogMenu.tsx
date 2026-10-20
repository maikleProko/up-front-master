import React, { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { useMenuState } from "modules/home/shared/lib/use-menu-state";
import { useCategoryList } from "modules/catalog/shared/api";
import AppRouter from "pages/router";
import styles from "./CatalogMenu.module.scss";

export const CatalogMenu = ({ light = false, enabled = true }: { light?: boolean; enabled?: boolean }) => {
	const { expanded, setOpen, trigger } = useMenuState(enabled);
	const { data, error, isLoading, mutate } = useCategoryList();
	const id = useId();
	const container = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!expanded) return;
		const outside = (event: PointerEvent) => {
			if (!container.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", outside);
		return () => {
			document.removeEventListener("pointerdown", outside);
		};
	}, [expanded]);

	return <div ref={container} className={`${styles.menu} ${light ? styles.light : ""} ${expanded ? styles.open : ""}`}
		onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
		onPointerLeave={(event) => { if (event.pointerType === "mouse") setOpen(false); }}
		onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
		<div className={styles.trigger}>
			<Link {...AppRouter.catalog.link}>КАТАЛОГ</Link>
			<button ref={trigger} type="button" aria-label="Категории каталога" aria-expanded={expanded}
				aria-controls={id} onClick={() => setOpen((value) => !value)} disabled={!enabled}>
				<svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.5" /></svg>
			</button>
		</div>
		<div id={id} className={styles.panel} inert={!expanded}>
			<div className={styles.inner}>
				<div className={styles.heading}><Link {...AppRouter.catalog.link}>Весь каталог ↗</Link></div>
				{isLoading && <p role="status">Загружаем категории…</p>}
				{error && <p role="status">Не удалось загрузить категории. <button type="button" onClick={() => void mutate()}>Повторить</button></p>}
				{!isLoading && !error && !data?.data.length && <p>Категории скоро появятся.</p>}
				<div className={styles.categories}>
					{data?.data.map((category) => <Link key={category.id} {...AppRouter.catalog.category(category.slug).link} onClick={() => setOpen(false)}>
						<span>{category.name}</span><span aria-hidden="true">↗</span>
					</Link>)}
				</div>
			</div>
		</div>
	</div>;
};

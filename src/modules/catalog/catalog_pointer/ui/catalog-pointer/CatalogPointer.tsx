import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import { CatalogIndexSkeleton } from "modules/catalog/shared/ui/catalog-skeleton/CatalogSkeleton";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { SparePartSearch } from "shared/ui/components";
import { EmptyState } from "shared/ui/atoms";
import AppRouter from "pages/router";
import { ICategory } from "modules/catalog/shared/model";
import { useCategoryList } from "modules/catalog/shared/api";
import { CatalogBackground } from "modules/catalog/shared/ui";
import styles from "modules/catalog/catalog_pointer/ui/catalog-pointer/CatalogPointer.module.scss";

const alphabet = [
	"#",
	"А",
	"Б",
	"В",
	"Г",
	"Д",
	"З",
	"К",
	"М",
	"Н",
	"О",
	"П",
	"Р",
	"С",
	"Т",
	"У",
	"Ф",
	"Х",
	"Ц",
	"Ч",
	"Ш",
	"Щ",
	"Э",
	"Ю",
	"Я",
];

export const CatalogPointer = () => {
	const [search, setSearch] = useState("");
	const router = useRouter();
	const categoryList = useCategoryList();
	const categories = categoryList.data?.data ?? [];
	const groups = useMemo(
		() =>
			Object.entries(
				categories.reduce<Record<string, ICategory[]>>((result, category) => {
					const letter = category.name[0]?.toLocaleUpperCase("ru-RU") ?? "#";
					(result[letter] ??= []).push(category);
					return result;
				}, {}),
			),
		[categories],
	);

	return (
		<section className={styles.catalog}>
			<Head><title>Каталог запчастей — United Parts</title></Head>
			<CatalogBackground />
			<div className={styles.content}>
				<Breadcrumbs items={[{ label: "Каталог" }]} />

				<h1>Каталог</h1>

				<SparePartSearch
					value={search}
					onChange={setSearch}
					onSearch={(value) => router.push(AppRouter.catalog.search(value).link.href)}
					className={styles.search}
				/>

				<nav className={styles.alphabet} aria-label="Алфавитный указатель">
					{alphabet.map((letter) => (
						<a key={letter} href={letter === "#" ? "#catalog-list" : `#letter-${letter}`}>
							{letter}
						</a>
					))}
				</nav>

				<div id="catalog-list" className={styles.groups}>
					{categoryList.isLoading && <CatalogIndexSkeleton />}
					{categoryList.error && <p className={styles.status}>Не удалось загрузить категории</p>}
					{!categoryList.isLoading && !categoryList.error && groups.length
						? groups.map(([letter, categories]) => (
								<section key={letter} id={`letter-${letter}`} className={styles.group}>
									<h2>{letter}</h2>
									<div className={styles.items}>
										{categories.map((category) => (
											<Link key={category.id} {...AppRouter.catalog.category(category.slug).link}>
												{category.name}
											</Link>
										))}
									</div>
								</section>
							))
						: null}
					{!categoryList.isLoading && !categoryList.error && !groups.length && (
						<EmptyState
							title="Категории не найдены"
							description="Попробуйте изменить поисковый запрос."
						/>
					)}
				</div>
			</div>
		</section>
	);
};

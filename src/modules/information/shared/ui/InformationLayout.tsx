import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import React from "react";
import Head from "next/head";
import { CatalogBackground } from "modules/catalog/shared";
import styles from "./Information.module.scss";

export const InformationLayout = ({ title, description, children, partners = false }: {
	partners?: boolean;
	title: string;
	description?: string;
	children: React.ReactNode;
}) => <main className={`${styles.page} ${partners ? styles.partnersPage : ""}`}>
	<Head><title>{`${title} — United Parts`}</title>{description && <meta name="description" content={description} />}</Head>
	{!partners && <CatalogBackground />}
	<div className={styles.content}>
		<Breadcrumbs items={[{ label: title }]} />
		<h1>{title}</h1>
		{children}
	</div>
</main>;

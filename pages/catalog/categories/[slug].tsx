import type { GetServerSideProps } from "next";
import { SWRConfig } from "swr";
import { CatalogCategoriesPage } from "pages/catalog/catalog-categories.page";
import { getCatalogCategory } from "modules/catalog/shared/api/catalog.api";
import { serverPrefetch } from "shared/api/server-prefetch";

export default function CatalogCategoriesRoute({ slug, fallback }: { slug: string; fallback: Record<string, unknown> }) {
	return <SWRConfig value={{ fallback, revalidateIfStale: false }}><CatalogCategoriesPage slug={slug} /></SWRConfig>;
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
	const slug = String(params?.slug ?? "");
	const search = typeof query.search === "string" ? query.search : "";
	const request = { slug, search };
	return { props: { slug, fallback: await serverPrefetch(["catalog:category", request], () => getCatalogCategory(request)) } };
};

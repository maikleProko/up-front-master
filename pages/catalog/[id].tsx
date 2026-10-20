import type { GetServerSideProps } from "next";
import { SWRConfig } from "swr";
import { ProductPage } from "pages/catalog/product.page";
import { getProduct } from "modules/catalog/shared/api/catalog.api";
import { getHomeContent } from "modules/home/shared/api/home.api";
import { env } from "shared/lib/env";
import { serverPrefetch } from "shared/api/server-prefetch";

export default function CatalogProductRoute({ id, fallback }: { id: string; fallback: Record<string, unknown> }) {
	return <SWRConfig value={{ fallback, revalidateIfStale: false }}><ProductPage id={id} /></SWRConfig>;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const id = String(params?.id ?? "");
	const [product, home] = await Promise.all([
		serverPrefetch(["catalog:product", id], () => getProduct(id)),
		serverPrefetch(["home:content", env.projectPrefix], getHomeContent),
	]);
	return { props: { id, fallback: { ...product, ...home } } };
};

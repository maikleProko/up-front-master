import type { GetServerSideProps } from "next";
import { SWRConfig } from "swr";
import { CatalogPage } from "pages/catalog/catalog.page";
import { getCategoryList } from "modules/catalog/shared/api/catalog.api";
import { serverPrefetch } from "shared/api/server-prefetch";

export default function CatalogRoute({ fallback }: { fallback: Record<string, unknown> }) {
	return <SWRConfig value={{ fallback, revalidateIfStale: false }}><CatalogPage /></SWRConfig>;
}

export const getServerSideProps: GetServerSideProps = async () => ({
	props: { fallback: await serverPrefetch(["catalog:category-list", {}], () => getCategoryList()) },
});

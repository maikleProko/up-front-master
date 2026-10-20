import type { GetServerSideProps } from "next";
import { SWRConfig } from "swr";
import { ShopsPage } from "pages/information/content.page";
import { getHomeContent } from "modules/home/shared/api/home.api";
import { env } from "shared/lib/env";
import { serverPrefetch } from "shared/api/server-prefetch";

export default function ShopsRoute({ fallback }: { fallback: Record<string, unknown> }) {
	return <SWRConfig value={{ fallback, revalidateIfStale: false }}><ShopsPage /></SWRConfig>;
}

export const getServerSideProps: GetServerSideProps = async () => ({
	props: { fallback: await serverPrefetch(["home:content", env.projectPrefix], getHomeContent) },
});

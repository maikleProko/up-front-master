import type { GetServerSideProps } from "next";
import { SWRConfig } from "swr";
import { NewsPage } from "pages/information/content.page";
import { getNewsContent } from "modules/home/shared/api/home.api";
import { env } from "shared/lib/env";
import { serverPrefetch } from "shared/api/server-prefetch";

export default function NewsRoute({ fallback }: { fallback: Record<string, unknown> }) {
	return <SWRConfig value={{ fallback, revalidateIfStale: false }}><NewsPage /></SWRConfig>;
}

export const getServerSideProps: GetServerSideProps = async () => ({
	props: { fallback: await serverPrefetch(["news:content", env.projectPrefix], getNewsContent) },
});

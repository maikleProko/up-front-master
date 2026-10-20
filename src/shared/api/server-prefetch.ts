import { unstable_serialize } from "swr";

export const serverPrefetch = async <T>(key: readonly unknown[], fetcher: () => Promise<T>) => {
	try {
		return { [unstable_serialize(key)]: await fetcher() };
	} catch {
		return {};
	}
};

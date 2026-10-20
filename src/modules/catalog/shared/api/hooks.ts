import useSWR from "swr";
import {
	getCatalogCategory,
	getCategoryList,
	getProduct,
	getProductSelection,
	IGetCatalogCategoryParams,
	IGetCategoryListParams,
} from "./catalog.api";

export const useCategoryList = (params: IGetCategoryListParams = {}) => {
	return useSWR(["catalog:category-list", params], () => getCategoryList(params));
};

export const useCatalogCategory = (params: IGetCatalogCategoryParams) => {
	const canLoad = params.slug && (params.slug !== "search" || Boolean(params.search));
	return useSWR(canLoad ? ["catalog:category", params] : null, () => getCatalogCategory(params));
};

export const useProduct = (id: string | undefined) => {
	return useSWR(id ? ["catalog:product", id] : null, () => getProduct(id as string));
};

export const useProductSelection = (ids: number[]) => {
	return useSWR(ids.length ? ["catalog:selection", ids] : null, () => getProductSelection(ids));
};

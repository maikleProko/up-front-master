import { client, IApiResponse } from "shared/api";
import { env } from "shared/lib/env";
import { ICatalogCategoryDetail, ICategory, IProduct } from "modules/catalog/shared/model";
export const getProduct = async (id: string): Promise<IApiResponse<IProduct>> => {
	const response = await client.get<IApiResponse<IProduct>>(`/items/${id}/catalog-detail`, { params: { site: env.projectPrefix } });
	return response.data;
};

export const getProductSelection = async (ids: number[]): Promise<IApiResponse<IProduct[]>> => {
	const response = await client.get<IApiResponse<IProduct[]>>("/items/catalog-selection", {
		params: { site: env.projectPrefix, ids: ids.join(",") },
	});
	return response.data;
};

export interface IGetCategoryListParams {
	search?: string;
}

export const getCategoryList = async (params: IGetCategoryListParams = {}): Promise<IApiResponse<ICategory[]>> => {
	const response = await client.get<IApiResponse<ICategory[]>>("/categories/catalog-index", {
		params: {
			site: env.projectPrefix,
			search: params.search || undefined,
		},
	});
	return response.data;
};

export interface IGetCatalogCategoryParams {
	slug: string;
	search?: string;
}

export const getCatalogCategory = async (
	params: IGetCatalogCategoryParams,
): Promise<IApiResponse<ICatalogCategoryDetail>> => {
	const endpoint = params.slug === "search" ? "/categories/catalog-search" : "/categories/catalog-category";
	const response = await client.get<IApiResponse<ICatalogCategoryDetail>>(endpoint, {
		params: {
			site: env.projectPrefix,
			slug: params.slug === "search" ? undefined : params.slug,
			search: params.search || undefined,
		},
	});
	return response.data;
};

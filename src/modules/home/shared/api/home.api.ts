import useSWR from "swr";
import { cleanHomeText } from "./home-content-text";
import { client, IApiResponse } from "shared/api";
import { env } from "shared/lib/env";
import { IProduct } from "modules/catalog/shared/model";

export interface IHomeNews {
	id: number;
	title: string;
	excerpt: string;
	text: string;
	image: string | null;
	video?: string | null;
	published_at: string;
}

export interface IShopCity {
	name_city: string;
	longitude: number | null;
	latitude: number | null;
}

export interface IHomeShop {
	type: "SHOP" | "SERVICE_CENTER";
	email: string | null;
	url: string | null;
	id: number;
	name: string;
	city: string | null;
	address: string | null;
	phone: string | null;
	working_hours: string | null;
	x: number | null;
	y: number | null;
}

interface IHomeContent {
	new_products: IProduct[];
	news: IHomeNews[];
	shops: IHomeShop[];
	shop_cities: IShopCity[];
}

const normalizeNews = (news: IHomeNews): IHomeNews => ({
	...news,
	title: cleanHomeText(news.title),
	excerpt: cleanHomeText(news.excerpt),
	text: cleanHomeText(news.text) || cleanHomeText(news.excerpt),
});

export const getNewsContent = async (): Promise<IApiResponse<IHomeNews[]>> => {
	const response = await client.get<IApiResponse<IHomeNews[]>>("/common/news", {
		params: { site: env.projectPrefix },
	});
	return { ...response.data, data: response.data.data.map(normalizeNews) };
};

export const useNewsContent = () => useSWR(["news:content", env.projectPrefix], getNewsContent);

export const getHomeContent = async (): Promise<IApiResponse<IHomeContent>> => {
	const response = await client.get<IApiResponse<IHomeContent>>("/common/home", {
		params: { site: env.projectPrefix },
	});
	const result = response.data;
	return {
		...result,
		data: {
			...result.data,
			news: result.data.news.map(normalizeNews),
			shops: result.data.shops.map((shop) => ({
				...shop,
				name: cleanHomeText(shop.name),
				address: shop.address === null ? null : cleanHomeText(shop.address),
				working_hours: shop.working_hours === null ? null : cleanHomeText(shop.working_hours),
			})),
		},
	};
};

export const useHomeContent = () => useSWR(["home:content", env.projectPrefix], getHomeContent);

import { IShopCity } from "../api/home.api";

export const nearestShopCity = (cities: IShopCity[], latitude: number, longitude: number) => {
	const radians = (value: number) => value * Math.PI / 180;
	let nearest: IShopCity | undefined;
	let distance = Infinity;
	cities.forEach((city) => {
		if (city.longitude == null || city.latitude == null || !Number.isFinite(city.longitude) || !Number.isFinite(city.latitude)) return;
		const value = Math.sin(radians(city.latitude - latitude) / 2) ** 2
			+ Math.cos(radians(latitude)) * Math.cos(radians(city.latitude))
			* Math.sin(radians(city.longitude - longitude) / 2) ** 2;
		if (value < distance) { nearest = city; distance = value; }
	});
	return nearest;
};

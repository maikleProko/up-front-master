import { expect, test } from "@jest/globals";
import { nearestShopCity } from "./shop-city";

const cities = [
	{ name_city: "Москва", latitude: 55.75, longitude: 37.62 },
	{ name_city: "Санкт-Петербург", latitude: 59.94, longitude: 30.32 },
	{ name_city: "Без координат", latitude: null, longitude: null },
];

test("chooses the nearest available city and ignores missing coordinates", () => {
	expect(nearestShopCity(cities, 59.8, 30.5)?.name_city).toBe("Санкт-Петербург");
	expect(nearestShopCity(cities, 55.6, 37.4)?.name_city).toBe("Москва");
	expect(nearestShopCity([cities[2]], 55.6, 37.4)).toBeUndefined();
});

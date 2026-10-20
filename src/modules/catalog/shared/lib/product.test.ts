import { expect, test } from "@jest/globals";
import { IProduct } from "modules/catalog/shared/model";
import { env } from "shared/lib/env";
import { formatMoney, formatProductPrice } from "shared/lib/price";
import { productPrice, productImage, resolveCatalogImage, toCartItem, toRelatedProduct } from "./product";

const product = {
	id: 8,
	name: "Болт",
	code: "M8",
	default_price: "190",
	retail_price: "180",
	discount_price: "150",
	files: [
		{ type: "VIDEO", path: "/video.mp4" },
		{ type: "IMAGE", path: "" },
		{ type: "IMAGE", path: "/bolt.png" },
	],
} as IProduct;

test("every product representation uses the same price priority and skips non-images", () => {
	expect(toCartItem(product)).toEqual({
		id: 8,
		name: "Болт",
		code: "M8",
		price: 150,
		image: `${env.imageBaseUrl}/bolt.png`,
	});
	expect(toRelatedProduct(product)).toMatchObject({ price: "150", image: "/bolt.png" });
	expect(productPrice({ ...product, discount_price: null })).toBe("180");
	expect(productPrice({ ...product, discount_price: null, retail_price: null })).toBe("190");
	expect(productPrice({ ...product, discount_price: "0" })).toBe("0");
});

test("image resolution keeps remote files, rewrites backend localhost, and preserves local fallbacks", () => {
	expect(resolveCatalogImage("https://cdn.example.com/bolt.png")).toBe("https://cdn.example.com/bolt.png");
	expect(resolveCatalogImage("http://localhost:8008/bolt.png?v=2")).toBe(`${env.imageBaseUrl}/bolt.png?v=2`);
	expect(resolveCatalogImage("javascript:alert(1)", "/images/category-no-photo.png")).toBe(
		"/images/category-no-photo.png",
	);
	expect(productImage({ ...product, files: [] })).toBe("/images/product-no-photo.png");
});

test("price displays retain catalog and checkout precision and distinguish zero from missing", () => {
	expect(formatProductPrice("190")).toBe("190 ₽");
	expect(formatMoney(190)).toBe("190,00 ₽");
	expect(formatProductPrice("0")).toBe("0 ₽");
	expect(formatProductPrice(null)).toBe("—");
});

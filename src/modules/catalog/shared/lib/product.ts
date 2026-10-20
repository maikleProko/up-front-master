import { env } from "shared/lib/env";
import { IProduct, IProductSparePart } from "modules/catalog/shared/model";
import { ICartItem } from "shared/context/reducers/cart-reducer";

export { formatProductPrice } from "shared/lib/price";

export const resolveProductFileUrl = (path: string) => {
	if (!path) return "";
	if (path.startsWith("/")) return `${env.imageBaseUrl}${path}`;
	try {
		const url = new URL(path);
		if (!["http:", "https:"].includes(url.protocol)) return "";
		return ["localhost", "127.0.0.1"].includes(url.hostname) ? `${env.imageBaseUrl}${url.pathname}${url.search}` : path;
	} catch { return ""; }
};

export const productPrice = (product: IProduct) => product.discount_price ?? product.retail_price ?? product.default_price;
export const resolveCatalogImage = (image: string | null | undefined, fallback = "/images/product-no-photo.png") =>
	resolveProductFileUrl(image ?? "") || fallback;
export const productImagePath = (product: IProduct) =>
	product.files.find((file) => file.type === "IMAGE" && file.path)?.path ?? "";
export const productImage = (product: IProduct) => resolveCatalogImage(productImagePath(product));
export const toCartItem = (product: IProduct): Omit<ICartItem, "quantity"> => ({
	id: product.id, name: product.name, code: product.code,
	price: Number(productPrice(product)), image: productImage(product),
});

export const toRelatedProduct = (product: IProduct): IProductSparePart => ({
	id: product.id, name: product.name, code: product.code, price: productPrice(product),
	image: productImagePath(product),
});

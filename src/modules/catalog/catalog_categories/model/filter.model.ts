import { ICatalogCategoryCharacteristic, ICatalogCategoryProduct } from "modules/catalog/shared/model";

export interface INumericFilter {
	id: number;
	title: string;
	min: number;
	max: number;
}

export interface IOptionFilter {
	id: number;
	title: string;
	options: string[];
}

export type CatalogFilter = INumericFilter | IOptionFilter;
export type CatalogRange = [number, number];

export const getCharacteristicFilters = (
	characteristics: ICatalogCategoryCharacteristic[],
	products: ICatalogCategoryProduct[],
): CatalogFilter[] => {
	return characteristics.flatMap<CatalogFilter>((characteristic) => {
		const values = Array.from(
			new Set(
				products.flatMap((product) =>
					product.characteristics
						.filter((it) => it.characteristic_id === characteristic.id)
						.map((it) => it.value.trim())
						.filter(Boolean),
				),
			),
		);

		if (values.length < 2) return [];

		const numericValues = values.map(parseNumericValue);
		const title = getCharacteristicTitle(characteristic.name, characteristic.unit);

		if (values.length && numericValues.every((value) => value !== null)) {
			const numbers = numericValues as number[];
			return [
				{
					id: characteristic.id,
					title,
					min: Math.min(...numbers),
					max: Math.max(...numbers),
				},
			];
		}

		return [{ id: characteristic.id, title, options: values }];
	});
};

export const parseNumericValue = (value: string) => {
	const normalized = value.trim().replace(",", ".");
	return /^-?\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : null;
};

const getCharacteristicTitle = (name: string, unit: string | null) => {
	if (!unit || name.toLocaleLowerCase().endsWith(unit.toLocaleLowerCase())) return name;
	return `${name}, ${unit}`;
};

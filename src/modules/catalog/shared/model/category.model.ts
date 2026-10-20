export interface ICategory {
	id: number;
	name: string;
	slug: string;
	image?: string;
}

export interface ICatalogCategoryProduct {
	id: number;
	name: string;
	code: string;
	default_price: string;
	status: "NEW" | "DEFAULT" | "MARK_DELETED";
	image: string;
	brand: {
		id: number;
		name: string;
	} | null;
	characteristics: Array<{
		characteristic_id: number;
		value: string;
	}>;
}

export interface ICatalogCategoryCharacteristic {
	id: number;
	name: string;
	unit: string | null;
}

export interface ICatalogCategoryDetail {
	category: ICategory;
	breadcrumbs: ICategory[];
	children: ICategory[];
	characteristics: ICatalogCategoryCharacteristic[];
	products: ICatalogCategoryProduct[];
}

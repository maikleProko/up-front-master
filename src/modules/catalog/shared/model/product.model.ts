export interface IProductFile { id: number; type: string; path: string; alt: string | null; title: string | null; }
export interface IProductCharacteristic { id: number; name: string; unit: string | null; value: string; sort_position: number; is_main: boolean; is_advantage: boolean; }
export interface IProductSparePart { id: number; name: string; code: string; price: string; image: string; }
export interface ICompatibleProduct { id: number; name: string; code: string; }

export interface IProduct {
	id: number;
	name: string;
	short_name: string | null;
	code: string;
	status: string;
	default_price: string;
	retail_price: string | null;
	discount_price: string | null;
	default_description: string | null;
	additional_description: string | null;
	equipment_description: string | null;
	characteristic_description: string | null;
	brand: { id: number; name: string } | null;
	categories: Array<{ id: number; name: string }>;
	category: { id: number; name: string; slug: string } | null;
	breadcrumbs: Array<{ id: number; name: string; slug: string }>;
	files: IProductFile[];
	characteristics: IProductCharacteristic[];
	spare_parts: IProductSparePart[];
	accessories: IProductSparePart[];
	similar_items: IProductSparePart[];
	compatible_items: ICompatibleProduct[];
	stock_quantity: number;
}

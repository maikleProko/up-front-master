import React from "react";
import { CatalogCategories } from "modules/catalog/catalog_categories";

interface ICatalogCategoriesPage {
	slug: string;
}

export const CatalogCategoriesPage = ({ slug }: ICatalogCategoriesPage) => <CatalogCategories slug={slug} />;

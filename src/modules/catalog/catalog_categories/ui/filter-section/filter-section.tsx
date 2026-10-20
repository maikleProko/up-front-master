import { FilterPanel } from "../filter-panel/FilterPanel";
import React from "react";
import styles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";

export interface IFilterOption {
	value: string | number;
	label: string;
	count?: number;
}

export interface IFilterSection {
	title: string;
	options?: IFilterOption[];
	selected?: Array<string | number>;
	onToggle?: (option: string | number) => void;
}

export const FilterSection = (props: IFilterSection) => {
	return (
		<FilterPanel title={props.title}>
			{props.options && (
				<div className={styles.filterOptions}>
					{props.options.map((option) => (
						<label key={option.value}>
							<input
								type="checkbox"
								checked={props.selected?.includes(option.value)}
								onChange={() => props.onToggle?.(option.value)}
							/>
							<span>{option.label}</span>
							{option.count !== undefined && <b>{option.count}</b>}
						</label>
					))}
				</div>
			)}
		</FilterPanel>
	);
};

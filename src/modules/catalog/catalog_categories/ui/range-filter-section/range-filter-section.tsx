import { FilterPanel } from "../filter-panel/FilterPanel";
import React, { useRef } from "react";
import { CatalogRange, INumericFilter } from "modules/catalog/catalog_categories/model";
import styles from "modules/catalog/catalog_categories/ui/catalog-categories/CatalogCategories.module.scss";

export interface IRangeFilterSection {
	filter: INumericFilter;
	value: CatalogRange;
	onChange: (value: CatalogRange) => void;
}

export const RangeFilterSection = (props: IRangeFilterSection) => {
	const activeThumb = useRef<0 | 1>(0);
	const step = Number.isInteger(props.filter.min) && Number.isInteger(props.filter.max) ? 1 : 0.1;
	const onUpdate = (index: 0 | 1, value: number) => {
		const next: CatalogRange = [...props.value];
		const boundedValue = Math.max(props.filter.min, Math.min(props.filter.max, value));
		next[index] = index === 0 ? Math.min(boundedValue, props.value[1]) : Math.max(boundedValue, props.value[0]);
		props.onChange(next);
	};
	const getValue = (event: React.PointerEvent<HTMLDivElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
		const value = props.filter.min + position * (props.filter.max - props.filter.min);
		return Math.max(props.filter.min, Math.min(props.filter.max, Math.round(value / step) * step));
	};
	const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		const value = getValue(event);
		const target = event.target as HTMLElement;
		const index = target.dataset.index;
		activeThumb.current =
			index === undefined
				? Math.abs(value - props.value[0]) <= Math.abs(value - props.value[1])
					? 0
					: 1
				: (Number(index) as 0 | 1);
		event.currentTarget.setPointerCapture(event.pointerId);
		onUpdate(activeThumb.current, value);
	};
	const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
		onUpdate(activeThumb.current, getValue(event));
	};
	const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: 0 | 1) => {
		let value = props.value[index];
		if (event.key === "ArrowLeft" || event.key === "ArrowDown") value -= step;
		else if (event.key === "ArrowRight" || event.key === "ArrowUp") value += step;
		else if (event.key === "Home") value = props.filter.min;
		else if (event.key === "End") value = props.filter.max;
		else return;
		event.preventDefault();
		onUpdate(index, value);
	};
	const getPosition = (value: number) => {
		if (props.filter.min === props.filter.max) return 0;
		return ((value - props.filter.min) / (props.filter.max - props.filter.min)) * 100;
	};
	const start = getPosition(props.value[0]);
	const end = getPosition(props.value[1]);

	return (
		<FilterPanel title={props.filter.title}>
			<div className={styles.rangeFields}>
				<label>
					<span>От</span>
					<input
						type="number"
						step={step}
						min={props.filter.min}
						max={props.value[1]}
						value={props.value[0]}
						onChange={(event) => onUpdate(0, Number(event.target.value))}
					/>
				</label>
				<label>
					<span>До</span>
					<input
						type="number"
						step={step}
						min={props.value[0]}
						max={props.filter.max}
						value={props.value[1]}
						onChange={(event) => onUpdate(1, Number(event.target.value))}
					/>
				</label>
			</div>
			<div className={styles.rangeSlider} onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
				<span className={styles.rangeSelection} style={{ left: `${start}%`, right: `${100 - end}%` }} />
				{props.value.map((value, index) => (
					<button
						key={index}
						className={styles.rangeThumb}
						style={{ left: `${getPosition(value)}%` }}
						type="button"
						data-index={index}
						aria-label={`${props.filter.title}: ${index === 0 ? "от" : "до"}`}
						aria-valuemin={props.filter.min}
						aria-valuemax={props.filter.max}
						aria-valuenow={value}
						onKeyDown={(event) => onKeyDown(event, index as 0 | 1)}
					/>
				))}
			</div>
		</FilterPanel>
	);
};

import { ComparisonIcon } from "shared/ui/atoms/icon/ComparisonIcon";
import React from "react";
import Link from "next/link";
import { useAppContext } from "shared/context/app-context.provider";
import AppRouter from "pages/router";
import styles from "./ComparisonButton.module.scss";

export const ComparisonButton = ({ id, productName, variant = "text" }: { id: number; productName?: string; variant?: "text" | "icon" | "circle" }) => {
	const { comparison } = useAppContext();
	const selected = comparison.ids.includes(id);
	const full = !selected && comparison.ids.length >= 20;
	const label = selected ? "Убрать из сравнения" : "Добавить в сравнение";
	return <button type="button" className={`${styles.button} ${variant !== "text" ? styles[variant] : ""}`} aria-pressed={selected}
		aria-label={variant !== "text" ? label : undefined}
		disabled={comparison.isLoading || full} title={full ? "Можно сравнить до 20 товаров" : label}
		onClick={() => comparison.toggle(id, productName)}>{variant === "text" ? (selected ? "✓ В сравнении" : "В сравнение")
			: <ComparisonIcon />}</button>;
};

export const ComparisonLink = () => {
	const { comparison } = useAppContext();
	return <Link className={styles.link} {...AppRouter.catalog.comparison.link}>Сравнение товаров ({comparison.ids.length})</Link>;
};

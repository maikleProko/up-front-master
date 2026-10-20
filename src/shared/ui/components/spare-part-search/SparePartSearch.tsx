import React, { FormEvent } from "react";
import classNames from "classnames";
import { Button } from "shared/ui/atoms";
import { useMobile } from "shared/lib/use-mobile";
import styles from "./SparePartSearch.module.scss";

export interface ISparePartSearch {
	value: string;
	onChange: (value: string) => void;
	onSearch: (value: string) => void;
	className?: string;
}

export const SparePartSearch = (props: ISparePartSearch) => {
	const mobile = useMobile();
	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		props.onSearch(props.value.trim());
	};

	return (
		<form className={classNames(styles.search, props.className)} onSubmit={handleSubmit}>
			<img className={styles.icon} src="/images/teaser-search.svg" alt="" />
			<input
				className={styles.input}
				value={props.value}
				onChange={(event) => props.onChange(event.target.value)}
				placeholder={mobile ? "Поиск" : "Поиск запчасти"}
				aria-label="Поиск запчасти"
			/>
			<Button className={styles.button} htmlType="submit">НАЙТИ</Button>
		</form>
	);
};

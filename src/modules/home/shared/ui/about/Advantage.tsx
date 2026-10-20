import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "shared/ui/atoms";
import styles from "./Advantage.module.scss";

export interface IAdvantage {
	title: string;
	description: string;
	image: string;
	url: string;
}

export const Advantage = (props: IAdvantage) => {
	const router = useRouter();

	return (
		<div className={styles.advantage}>
			<div className={styles.fakeBackground} />
			<Link href={props.url} className={styles.mobileLink} aria-label={props.title} />

			<div className={styles.imageOuter}>
				<img className={styles.image} src={props.image} alt="" />
			</div>
			<div className={styles.title}>{props.title}</div>
			<div className={styles.descriptionOuter}>
				<div className={styles.description}>{props.description}</div>
			</div>

			<Button className={styles.cardButton} onClick={() => router.push(props.url)}>
				ПЕРЕЙТИ
			</Button>
		</div>
	);
};

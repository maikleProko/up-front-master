import React, { Fragment } from "react";
import Link from "next/link";
import { Advantage } from "./Advantage";
import styles from "./About.module.scss";

const advantages = [
	{
		title: "РАЗНООБРАЗИЕ ЗАПЧАСТЕЙ",
		description: "Расширенный выбор деталей по категориям, брендам и артикулам.",
		image: "/images/drill.svg",
		url: "/catalog",
	},
	{
		title: "ПОДБЕРЁМ ЗАПЧАСТЬ",
		description: "Введите артикул инструмента — покажем его запчасти автоматически",
		image: "/images/research.svg",
		url: "/catalog",
	},
	{
		title: "ВЫГОДНЫЕ УСЛОВИЯ",
		description: "Выгодные условия для СТО, магазинов и оптовых покупателей.",
		image: "/images/cooperation.svg",
		url: "/catalog",
	},
	{
		title: "УДОБНЫЙ ЗАКАЗ ПО СПИСКУ",
		description: "Используйте наш каталог для закупки. Мы проверим и подготовим расчёт.",
		image: "/images/download-catalog.svg",
		url: "/catalog",
	},
];

export const AboutAdvantages = () => (
	<div className={styles.teaserAdvantages}>
		<div className={styles.content}>
			<div className={styles.advantagesBlock}>
				<div className={styles.advantages}>
					{advantages.map((advantage, index) => (
						<Fragment key={index}>
							{index > 0 && <div className={styles.divider} />}
							<Advantage
								title={advantage.title}
								description={advantage.description}
								image={advantage.image}
								url={advantage.url}
							/>
						</Fragment>
					))}
				</div>
			</div>
		</div>
	</div>
);

export const AboutContent = ({ plain = false, heading }: { plain?: boolean; heading?: React.ReactNode }) => (
	<section id="about" className={`${styles.about} ${plain ? styles.plain : ""}`}>
		<div className={styles.content}>
			<div className={styles.foreground}>
				<div className={styles.foregroundLeft}>
					{heading}
					<p className={styles.description}>
						А нужная запчасть — быть под рукой. С 2010 года мы производим детали для ручного инструмента,
						садовой техники и специализированного оборудования.
					</p>
					<p className={styles.description}>
						Знаем, какую нагрузку выдерживает ваша техника. Поэтому уделяем внимание материалам, точности
						производства и качеству каждой детали.
					</p>
					<Link className={styles.button} href="/catalog">
						Найти свою деталь <span aria-hidden="true">↗</span>
					</Link>
				</div>
				<div className={styles.foregroundRight}>
					<span className={styles.imageCaption}>ТОЧНОСТЬ В КАЖДОЙ ДЕТАЛИ</span>
					<div className={styles.imageStage}>
						<img
							className={styles.image}
							src="/images/spares.png"
							alt="Запчасти United Parts для инструмента и садовой техники"
						/>
					</div>
					<div className={styles.imageFooter}>
						<div>
							<strong>2010</strong>
							<span>ГОД НАЧАЛА РАБОТЫ</span>
						</div>
						<img
							className={styles.brand}
							src="/images/logo-mark.svg"
							alt="United Parts"
							width={92}
							height={66}
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
);

export const About = () => (
	<AboutContent
		heading={
			<>
				<span className={styles.eyebrow}>02 / О КОМПАНИИ</span>
				<h2 className={styles.title}>
					Техника должна
					<br />
					<span>работать.</span>
				</h2>
			</>
		}
	/>
);

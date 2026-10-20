import React from "react";
import Link from "next/link";
import { AboutContent } from "modules/home/shared";
import { useHomeContent, useNewsContent } from "modules/home/shared/api/home.api";
import { NewsContent, HomeShops } from "modules/home/shared/ui/home-content/HomeContent";
import { InformationLayout } from "modules/information/shared/ui/InformationLayout";
import styles from "modules/information/shared/ui/Information.module.scss";

const HomeContentPage = ({ kind, request, children }: {
	kind: "news" | "shops";
	request: { isLoading: boolean; error?: unknown; mutate: () => unknown };
	children: React.ReactNode;
}) => {
	const { isLoading, error, mutate } = request;
	const title = kind === "news" ? "Новости" : "Магазины и сервисы";
	return <InformationLayout title={title} partners={kind === "shops"}>
		{error ? <div className={styles.status} role="alert"><p>Не удалось загрузить {kind === "news" ? "новости" : "адреса партнёров"}.</p><button className={styles.action} type="button" onClick={() => void mutate()}>Повторить</button></div>
			: isLoading ? <p className={styles.status} role="status">Загружаем {kind === "news" ? "новости" : "адреса партнёров"}…</p>
				: children}
	</InformationLayout>;
};

export const NewsPage = () => {
	const request = useNewsContent();
	return <HomeContentPage kind="news" request={request}><NewsContent news={request.data?.data ?? []} layout="list" /></HomeContentPage>;
};
export const ShopsPage = () => {
	const request = useHomeContent();
	return <HomeContentPage kind="shops" request={request}><HomeShops shops={request.data?.data.shops ?? []} cities={request.data?.data.shop_cities} standalone /></HomeContentPage>;
};
export const AboutPage = () => <InformationLayout title="О бренде" description="United Parts — запчасти для инструмента, садовой техники и специализированного оборудования."><AboutContent plain /></InformationLayout>;
export const InstructionsPage = () => <InformationLayout title="Инструкции и деталировки">
	<div className={styles.placeholder}>
		<span className={styles.eyebrow}>ДОКУМЕНТАЦИЯ UNITED PARTS</span>
		<h2>Всё о вашей технике.<br />Скоро здесь.</h2>
		<p>Готовим раздел с инструкциями и деталировками. Здесь можно будет подобрать документацию по модели инструмента и найти нужную деталь на схеме.</p>
		<Link href="/catalog" className={styles.action}>Перейти в каталог <span aria-hidden="true">↗</span></Link>
	</div>
</InformationLayout>;

const warranty = [
	["Гарантия на детали", "Информация о гарантийном сроке и условиях обслуживания указывается в документации к товару. Сохраните документ о покупке, артикул и упаковку с маркировкой: они помогут быстрее определить деталь и разобраться в обращении."],
	["Если возникла неисправность", "Прекратите использование неисправной детали. Подготовьте описание проблемы, фотографии изделия и маркировки, сведения о модели техники и дате покупки. Обратитесь в магазин, в котором приобретён товар, для согласования проверки и дальнейших действий."],
	["Проверка и обслуживание", "Передайте изделие на проверку по согласованию с продавцом. Специалист определит причину неисправности и возможный способ решения. Порядок ремонта, замены или возврата зависит от результата проверки и условий, применимых к товару."],
	["После окончания гарантии", "Для платного ремонта и подбора запасных частей обратитесь к партнёрам. Стоимость работ, наличие деталей и сроки согласуются до начала обслуживания. Для точного подбора сообщите модель оборудования и артикул нужной детали."],
];
const delivery = [
	["Выберите товары", "Добавьте нужные детали в корзину. Перед оформлением проверьте артикулы, количество и совместимость с вашей техникой. Укажите контактный телефон и электронную почту, чтобы можно было уточнить заказ."],
	["Укажите адрес", "Заполните город, улицу, номер дома и индекс. Если у места получения есть особенности проезда или ограничения по времени, укажите их в комментарии. Доступный способ доставки зависит от адреса и состава заказа."],
	["Согласуйте условия", "Стоимость и срок доставки уточняются при подтверждении заказа с учётом региона, габаритов и веса отправления. Возможность самовывоза и адрес выдачи согласуются отдельно. Перед отправкой проверьте данные получателя."],
	["Получите заказ", "При получении осмотрите упаковку и сверьте состав заказа с документами. При обнаружении повреждения или расхождения зафиксируйте его и свяжитесь с продавцом. Сохраните упаковку и сопроводительные документы до решения вопроса."],
];

const ServicePage = ({ kind }: { kind: "warranty" | "delivery" }) => <InformationLayout title={kind === "warranty" ? "Гарантия" : "Доставка"}>
	<p className={styles.intro}>{kind === "warranty" ? "Поможем разобраться с обслуживанием и вернуть технику в работу. Ниже — порядок обращения по гарантии и после её окончания." : "От нужной детали до готового результата. Рассказываем, как подготовить заказ к отправке и на что обратить внимание при получении."}</p>
	<article className={styles.article}>
		{(kind === "warranty" ? warranty : delivery).map(([title, text], index) => <section key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}
		<section><span>↗</span><div><h2>Нужна помощь на месте?</h2><p>Найдите ближайшего партнёра и уточните условия покупки, доставки или обслуживания.</p><Link href="/shops">Магазины и сервисы →</Link></div></section>
	</article>
</InformationLayout>;
export const WarrantyPage = () => <ServicePage kind="warranty" />;
export const DeliveryPage = () => <ServicePage kind="delivery" />;

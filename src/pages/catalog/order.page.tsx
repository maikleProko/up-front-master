import { Breadcrumbs } from "shared/ui/components/breadcrumbs/Breadcrumbs";
import { formatMoney as money } from "shared/lib/price";
import { CartRowsSkeleton, SummarySkeleton } from "modules/catalog/shared/ui/catalog-skeleton/CatalogSkeleton";
import { ContentImage } from "shared/ui/skeleton";
import React, { FormEvent, useState } from "react";
import { message } from "antd";
import AppRouter from "pages/router";
import { useAppContext } from "shared/context/app-context.provider";
import { CatalogBackground } from "modules/catalog/shared";
import styles from "./order.page.module.scss";


const paymentMethods = ["СБП", "Банковская карта", "Картой курьеру", "Наличными курьеру"];

export const OrderPage = () => {
	const { cart } = useAppContext();
	const [payment, setPayment] = useState(paymentMethods[0]);
	const [anotherAddress, setAnotherAddress] = useState(false);

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!cart.items.length) return;
		void message.success("Заказ сформирован");
	};

	return <section className={styles.page}>
		<CatalogBackground />
		<div className={styles.content}>
			<Breadcrumbs items={[{ label: "Корзина", link: AppRouter.catalog.cart.link }, { label: "Заказ" }]} />
			<h1>Заказ</h1>

			<form className={styles.orderLayout} onSubmit={submit}>
				<div className={styles.formColumn}>
					<div className={styles.fields}>
						<label><span>Имя</span><input name="firstName" placeholder="Ваше имя" required /></label>
						<label><span>Фамилия</span><input name="lastName" placeholder="Ваша фамилия" required /></label>
						<label><span>Отчество</span><input name="middleName" placeholder="Ваше отчество" /></label>
						<label className={styles.fullField}><span>Адрес</span><input name="address" placeholder="Адрес доставки" required /></label>
						<label><span>ИНН</span><input name="taxId" inputMode="numeric" placeholder="ИНН" /></label>
						<label className={styles.postcode}><span>Индекс</span><input name="postcode" inputMode="numeric" placeholder="Индекс" /></label>
						<label><span>Электронная почта</span><input name="email" type="email" placeholder="Email" required /></label>
						<label><span>Телефон</span><input name="phone" type="tel" placeholder="Номер телефона" required /></label>
					</div>
					<label className={styles.checkbox}><input type="checkbox" checked={anotherAddress} onChange={(event) => setAnotherAddress(event.target.checked)} /><span>Прислать на другой адрес</span></label>
					{anotherAddress && <label className={styles.alternateAddress}><span>Другой адрес</span><input name="alternateAddress" placeholder="Адрес доставки" required /></label>}
					<div className={styles.additional}>
						<h2>Дополнительная информация</h2>
						<label><span>Примечания к заказу (необязательно)</span><textarea name="notes" placeholder="Примечания к заказу, например особые пожелания по доставке" /></label>
					</div>
				</div>

				<aside className={styles.summary}>
					<h2>Оформить заказ</h2>
					{cart.isLoading ? <><CartRowsSkeleton /><SummarySkeleton /></> : <>
					<div className={styles.orderItems}>
						{cart.items.map((item) => <div className={styles.orderItem} key={item.id}>
							<div className={styles.itemInfo}><ContentImage src={item.image || "/images/product-no-photo.png"} alt="" /><span title={item.name}>{item.name}</span><small>×{item.quantity}</small></div>
							<strong>{money(item.price * item.quantity)}</strong>
						</div>)}
						{!cart.items.length && <p className={styles.empty}>Корзина пуста</p>}
					</div>
					<div className={styles.totals}>
						<div><span>Всего:</span><strong>{money(cart.total)}</strong></div>
						<div><span>Доставка:</span><strong>Бесплатно</strong></div>
						<div className={styles.grandTotal}><span>Итог с доставкой:</span><strong>{money(cart.total)}</strong></div>
					</div>
					</>}
					<fieldset className={styles.payment}>
						<legend>Способ оплаты</legend>
						{paymentMethods.map((method) => <label key={method}><input type="radio" name="payment" value={method} checked={payment === method} onChange={() => setPayment(method)} /><span>{method}</span></label>)}
					</fieldset>
					<button className={styles.submit} type="submit" disabled={cart.isLoading || !cart.items.length}>Оформить заказ</button>
				</aside>
			</form>
		</div>
	</section>;
};

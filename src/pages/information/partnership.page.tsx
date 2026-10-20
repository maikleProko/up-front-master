import React, { FormEvent, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { InformationLayout } from "modules/information/shared/ui/InformationLayout";
import { sendCooperationProposal } from "modules/information/shared/api/cooperation.api";
import styles from "modules/information/shared/ui/Information.module.scss";

export const PartnershipPage = () => {
	const [pending, setPending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");
	const submitting = useRef(false);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting.current) return;
		const form = event.currentTarget;
		const data = new FormData(form);
		const value = (name: string) => String(data.get(name) ?? "").trim();
		submitting.current = true;
		setPending(true);
		setError("");
		try {
			await sendCooperationProposal({
				sender_fullname: value("company"),
				sender_contact: value("contact"),
				sender_activity_type: value("activity"),
				sender_phone: value("phone"),
				sender_email: value("email"),
				sender_comment: `Город: ${value("city")}\nАдрес: ${value("address")}\n\n${value("comment")}`,
				question: "Заявка на дилерское сотрудничество",
				consent: data.get("consent") === "on",
			});
			setSent(true);
		} catch (cause) {
			const details = isAxiosError(cause) ? cause.response?.data?.errors : null;
			setError(Array.isArray(details) && details.length
				? details.map((item: { detail: string }) => item.detail).join(" ")
				: "Не удалось отправить анкету. Данные сохранены в форме — попробуйте ещё раз.");
		} finally {
			submitting.current = false;
			setPending(false);
		}
	};

	return <InformationLayout title="Дилерам" description="Сотрудничество с United Parts. Заполните анкету дилера, чтобы обсудить поставки запчастей.">
		<div className={styles.split}>
			<aside className={styles.aside}>
				<span className={styles.eyebrow}>ПАРТНЁРСТВО UNITED PARTS</span>
				<h2>Предлагаем сотрудничество</h2>
				<p>Приглашаем к сотрудничеству магазины, сервисные центры и оптовых покупателей. Вместе поможем технике ваших клиентов работать дольше.</p>
				<p>Расскажите о компании и задачах: обсудим ассортимент, объёмы поставок и условия работы.</p>
				<ol className={styles.steps}><li>Заполните короткую анкету компании.</li><li>Обсудим ваши задачи и формат сотрудничества.</li><li>Подберём ассортимент и согласуем условия поставки.</li></ol>
			</aside>
			{sent ? <div className={styles.success} role="status"><span className={styles.eyebrow}>АНКЕТА ПОЛУЧЕНА</span><h2>Спасибо за интерес к United Parts.</h2><p>Заявка отправлена. Свяжемся с вами по указанным контактам, чтобы обсудить сотрудничество.</p><button type="button" className={styles.action} onClick={() => setSent(false)}>Отправить другую анкету</button></div>
				: <form className={styles.form} onSubmit={submit} aria-busy={pending}>
					<h2>Стать дилером</h2><p>Поля со звёздочкой обязательны для заполнения.</p>
					<div className={styles.fields}>
						<label className={styles.fullField}><span>Наименование компании *</span><input name="company" autoComplete="organization" placeholder="Название компании или ИП" maxLength={256} required /></label>
						<label><span>Город *</span><input name="city" autoComplete="address-level2" placeholder="Ваш город" maxLength={256} required /></label>
						<label><span>Вид деятельности *</span><select name="activity" defaultValue="" required><option value="" disabled>Выберите из списка</option><option>Магазин</option><option>Сервисный центр</option></select></label>
						<label className={styles.fullField}><span>Адрес *</span><input name="address" autoComplete="street-address" placeholder="Улица, дом, офис" maxLength={512} required /></label>
						<label className={styles.fullField}><span>Контактное лицо *</span><input name="contact" autoComplete="name" placeholder="Как к вам обращаться" maxLength={256} required /></label>
						<label><span>Телефон *</span><input name="phone" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" pattern={String.raw`[+0-9\(\) .\-]{7,32}`} maxLength={32} title="Укажите телефон: от 7 до 32 символов, цифры, пробелы, +, скобки и дефисы" required /></label>
						<label><span>Электронная почта *</span><input name="email" type="email" autoComplete="email" placeholder="mail@company.ru" maxLength={254} required /></label>
						<label className={styles.fullField}><span>Комментарий</span><textarea name="comment" placeholder="Какие товары вас интересуют? Расскажите о компании и планируемых объёмах закупки." maxLength={5000} /></label>
					</div>
					<label className={styles.consent}><input name="consent" type="checkbox" required /><span>Согласен на обработку указанных в анкете данных для рассмотрения заявки и связи со мной по вопросу сотрудничества. *</span></label>
					{error && <p className={styles.error} role="alert">{error}</p>}
					<button className={styles.action} type="submit" disabled={pending}>{pending ? "Отправляем…" : "Отправить анкету"}<span aria-hidden="true">↗</span></button>
				</form>}
		</div>
	</InformationLayout>;
};

const numberFormat = new Intl.NumberFormat("ru-RU");
const moneyFormat = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPrice = (value: number) => numberFormat.format(value);
export const formatMoney = (value: number) => `${moneyFormat.format(value)} ₽`;
export const formatProductPrice = (value: string | number | null | undefined) =>
	value == null ? "—" : `${formatPrice(Number(value))} ₽`;

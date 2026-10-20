import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { IHomeShop, IShopCity } from "../../api/home.api";
import styles from "./ShopsMap.module.scss";

export const hasShopCoordinates = (shop: IHomeShop): shop is IHomeShop & { x: number; y: number } =>
	shop.x != null && shop.y != null && Number.isFinite(shop.x) && Number.isFinite(shop.y)
	&& Math.abs(shop.x) <= 180 && Math.abs(shop.y) <= 90;

const shopPopup = (shop: IHomeShop) => {
	const content = document.createElement("div");
	content.className = styles.details;
	const add = (tag: string, text: string | null, className?: string) => {
		if (!text) return;
		const element = document.createElement(tag);
		element.textContent = text;
		if (className) element.className = className;
		content.append(element);
	};
	add("small", shop.city);
	add("strong", shop.name);
	add("span", shop.address);
	const link = (text: string | null, href: string) => {
		if (!text) return;
		const element = document.createElement("a");
		element.textContent = text;
		element.href = href;
		if (/^https?:/.test(href)) { element.target = "_blank"; element.rel = "noopener noreferrer"; }
		content.append(element);
	};
	link(shop.phone, `tel:${shop.phone?.replace(/[^+\d]/g, "")}`);
	link(shop.email, `mailto:${shop.email}`);
	if (shop.url && /^https?:\/\//i.test(shop.url)) link(shop.url, shop.url);
	add("span", shop.working_hours);
	add("p", "Уточняйте наличие запчастей и часы работы", styles.notice);
	return content;
};

interface IShopsMap {
	city?: IShopCity;
	interactionBounds?: React.RefObject<HTMLDivElement | null>;
	shops: IHomeShop[];
	selectedId: number | null;
	selectionVersion: number;
	onSelect: (id: number) => void;
}

export const ShopsMap = ({ shops, city, interactionBounds, selectedId, selectionVersion, onSelect }: IShopsMap) => {
	const container = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const markers = useRef(new Map<number, L.Marker>());
	const [tileError, setTileError] = useState(false);
	const selected = shops.find((shop) => shop.id === selectedId);

	useEffect(() => {
		if (!container.current) return;
		const map = L.map(container.current, {
			scrollWheelZoom: true,
			wheelPxPerZoomLevel: 90,
			attributionControl: false,
		}).setView([59.9391, 30.3158], 10);
		mapRef.current = map;
		const updateWheel = (event: MouseEvent) => {
			const bounds = interactionBounds?.current?.getBoundingClientRect();
			if (!bounds || (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom)) map.scrollWheelZoom.enable();
			else map.scrollWheelZoom.disable();
		};
		const element = container.current;
		element.addEventListener("mousemove", updateWheel);
		element.addEventListener("wheel", updateWheel, { capture: true, passive: true });
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
		}).on("tileerror", () => setTileError(true)).on("tileload", () => setTileError(false)).addTo(map);
		const observer = new ResizeObserver(() => {
			map.invalidateSize({ pan: false });
			markers.current.forEach((marker) => {
				const popup = marker.getPopup();
				if (!popup) return;
				popup.options.maxWidth = Math.max(120, Math.min(280, map.getSize().x - 100));
				popup.update();
			});
		});
		observer.observe(container.current);
		return () => {
			element.removeEventListener("mousemove", updateWheel);
			element.removeEventListener("wheel", updateWheel, true);
			observer.disconnect();
			map.remove();
			mapRef.current = null;
		};
	}, [interactionBounds]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const group = L.featureGroup().addTo(map);
		markers.current.clear();
		shops.filter(hasShopCoordinates).forEach((shop) => {
			const marker = L.marker([shop.y, shop.x], {
				icon: L.icon({ className: styles.marker, iconUrl: "/images/map-marker-up.svg", iconSize: [48, 60], iconAnchor: [24, 58], popupAnchor: [0, -52] }),
				title: shop.name,
				alt: shop.name,
			}).bindPopup(shopPopup(shop), { className: styles.popup, maxWidth: Math.max(120, Math.min(280, map.getSize().x - 100)), minWidth: 120, maxHeight: 280, autoPanPadding: [12, 20] })
				.on("click", () => onSelect(shop.id)).addTo(group);
			markers.current.set(shop.id, marker);
		});
		if (group.getLayers().length) {
			const panel = interactionBounds?.current?.querySelector("aside")?.getBoundingClientRect();
			const canvas = map.getContainer().getBoundingClientRect();
			const leftPadding = panel && panel.bottom > canvas.top ? Math.max(48, panel.right - canvas.left + 40) : 48;
			map.fitBounds(group.getBounds(), { paddingTopLeft: [leftPadding, 48], paddingBottomRight: [48, 48], maxZoom: 14 });
		} else if (city?.longitude != null && city?.latitude != null) map.setView([city.latitude, city.longitude], 12);
		return () => { group.remove(); markers.current.clear(); };
	}, [shops, city, onSelect, interactionBounds]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		markers.current.forEach((marker, id) => {
			marker.getElement()?.classList.toggle(styles.selected, id === selectedId);
			marker.setZIndexOffset(id === selectedId ? 1000 : 0);
		});
		const marker = selectedId == null ? undefined : markers.current.get(selectedId);
		if (!marker) { map.closePopup(); return; }
		map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14), { animate: false });
		const panel = interactionBounds?.current?.querySelector("aside")?.getBoundingClientRect();
		const canvas = map.getContainer().getBoundingClientRect();
		if (panel && panel.bottom > canvas.top) map.panBy([-Math.max(0, panel.right - canvas.left) / 2, 0], { animate: false });
		marker.openPopup();
	}, [selectedId, selectionVersion, shops, interactionBounds]);

	return <div className={styles.map}>
		<div ref={container} className={styles.canvas} aria-label="Карта магазинов и сервисов" />
		{selected && !hasShopCoordinates(selected) && <div className={styles.missing} role="status">
			<strong>{selected.name}</strong>
			<p>Точное расположение пока не указано.</p>
			<a href={`https://yandex.ru/maps/?text=${encodeURIComponent(`${selected.city ?? ""} ${selected.address ?? selected.name}`)}`} target="_blank" rel="noreferrer">Найти по адресу ↗</a>
		</div>}
		{tileError && <p className={styles.error} role="status">Не удалось загрузить фон карты. Адреса партнёров доступны в списке.</p>}
	</div>;
};

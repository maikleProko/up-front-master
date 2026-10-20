import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export const useMenuState = (enabled: boolean) => {
	const [open, setOpen] = useState(false);
	const trigger = useRef<HTMLButtonElement>(null);
	const router = useRouter();
	const expanded = enabled && open;

	useEffect(() => {
		if (!enabled) setOpen(false);
	}, [enabled]);
	useEffect(() => {
		const close = () => setOpen(false);
		router.events.on("routeChangeStart", close);
		router.events.on("hashChangeStart", close);
		return () => {
			router.events.off("routeChangeStart", close);
			router.events.off("hashChangeStart", close);
		};
	}, [router.events]);
	useEffect(() => {
		if (!expanded) return;
		const escape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				trigger.current?.focus();
			}
		};
		document.addEventListener("keydown", escape);
		return () => document.removeEventListener("keydown", escape);
	}, [expanded]);

	return { expanded, setOpen, trigger };
};

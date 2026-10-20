import React from "react";
import Head from "next/head";
import Link from "next/link";
import AppRouter from "pages/router";
import { EmptyState } from "shared/ui/atoms";

export default function NotFoundPage() {
	return <>
		<Head><title>Страница не найдена — United Parts</title></Head>
		<EmptyState
			icon="not-found"
			title="Страница не найдена"
			description="Возможно, адрес изменился или страница была удалена."
			action={<Link {...AppRouter.index.link}>Вернуться на главную</Link>}
		/>
	</>;
}

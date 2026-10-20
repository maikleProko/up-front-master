import React from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import Head from "next/head";
import "shared/ui/styles/app.scss";
import "photoswipe/style.css";
import "leaflet/dist/leaflet.css";
import { AppLayout } from "core/layout/app-layout";
import { AppContextProvider } from "shared/context/app-context.provider";
import { themeConfig } from "shared/ui/ant";
import { ChatWidget } from "modules/chat/ChatWidget";

const MyApp = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();

	return (
		<>
			<Head>
				<title>United Parts — запчасти для инструмента и садовой техники</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<ConfigProvider locale={ruRU} theme={themeConfig}>
				<AppContextProvider>
					<AppLayout router={router}>
						<Component {...pageProps} />
					</AppLayout>
					<ChatWidget />
				</AppContextProvider>
			</ConfigProvider>
		</>
	);
};

export default MyApp;

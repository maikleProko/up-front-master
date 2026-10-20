import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";

const news = Array.from({ length: 15 }, (_, index) => ({
	id: index + 1, title: `Материал ${index + 1}`, excerpt: `Анонс ${index + 1}`,
	text: `Полный текст ${index + 1}`, published_at: "2026-10-01T12:00:00Z", image: null,
}));
const archive = jest.fn(() => ({ data: { data: news }, isLoading: false, mutate: jest.fn() }));
jest.mock("modules/home/shared/api/home.api", () => ({
	useNewsContent: archive,
	useHomeContent: () => ({ data: { data: { news: news.slice(0, 12), shops: [] } }, isLoading: false, mutate: jest.fn() }),
}));
const { NewsPage, AboutPage } = require("./content.page") as typeof import("./content.page");
const { HomeNews } = require("modules/home/shared/ui/home-content/HomeContent") as typeof import("modules/home/shared/ui/home-content/HomeContent");
let root: Root, container: HTMLDivElement;
beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	container = document.createElement("div"); root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));

test("news page has one section title and includes the complete archive as rows", () => {
	act(() => root.render(<NewsPage />));
	expect(container.querySelectorAll("h1")).toHaveLength(1);
	expect(container.querySelector("h1")?.textContent).toBe("Новости");
	expect(Array.from(container.querySelectorAll("h2, h3")).some((heading) => heading.textContent?.startsWith("Новости"))).toBe(false);
	expect(container.querySelectorAll("[data-content-card]")).toHaveLength(15);
	expect(container.querySelector('[class*="newsList"]')).not.toBeNull();
	expect(container.textContent).not.toContain("Свернуть новости");
});

test("home preview retains its heading and links to all news instead of expanding in place", () => {
	act(() => root.render(<HomeNews news={news} />));
	expect(container.querySelector("h2")?.textContent).toBe("Новости.");
	expect(container.querySelectorAll("[data-content-card]")).toHaveLength(4);
	expect(container.querySelector('a[href="/news"] span')?.textContent).toBe("Посмотреть все");
	act(() => root.render(<HomeNews news={news.slice(0, 1)} />));
	expect(container.querySelector('a[href="/news"]')).not.toBeNull();
});

test("about page reuses body content without the home section heading", () => {
	act(() => root.render(<AboutPage />));
	expect(container.querySelectorAll("h1")).toHaveLength(1);
	expect(container.querySelector("h1")?.textContent).toBe("О бренде");
	expect(container.querySelector("h2")).toBeNull();
	expect(container.textContent).not.toContain("02 / О КОМПАНИИ");
	expect(container.textContent).toContain("С 2010 года мы производим детали");
});

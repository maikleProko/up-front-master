// JSDOM has no layout engine; default responsive components to desktop.
if (typeof window !== "undefined" && !window.matchMedia) {
	window.matchMedia = (media) => ({
		matches: false,
		media,
		onchange: null,
		addListener() {},
		removeListener() {},
		addEventListener() {},
		removeEventListener() {},
		dispatchEvent: () => false,
	});
}

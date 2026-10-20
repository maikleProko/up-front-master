import { page } from "shared/lib/router";

const AppRouter = {
	index: page("/"),
	news: page("/news"),
	partnership: page("/partnership"),
	about: page("/about"),
	warranty: page("/warranty"),
	delivery: page("/delivery"),
	instructions: page("/instructions"),
	shops: page("/shops"),

	catalog: {
		...page("/catalog"),
		search: (query: string) => page(`/catalog/categories/search?search=${encodeURIComponent(query)}`),
		category: (slug: string) => page(`/catalog/categories/${slug}`),
		product: (id: string) => page(`/catalog/${id}`),
		cart: page("/catalog/cart"),
		comparison: page("/catalog/comparison"),
		order: page("/catalog/order"),
	},

	auth: {
		login: page("/auth/login"),
		signUp: page("/auth/sign-up"),
	},
};

export default AppRouter;

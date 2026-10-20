import React, { useCallback, useContext, useRef, useState } from "react";
import { IAuthState, useAuthReducer } from "shared/context/reducers/auth-reducer";
import { ICartItem, ICartState, useCartReducer } from "shared/context/reducers/cart-reducer";
import { CartNotification, CartNotificationStack } from "shared/ui/components/cart-notification";
import { IProductSelectionState, useProductSelectionReducer } from "shared/context/reducers/product-selection-reducer";

interface IState {
	auth: IAuthState;
	cart: ICartState;
	comparison: IProductSelectionState;
	recentlyViewed: IProductSelectionState;
}

const initialState: IState = {
	comparison: { ids: [], isLoading: true, toggle: () => {}, remove: () => {}, clear: () => {}, visit: () => {} },
	recentlyViewed: { ids: [], isLoading: true, toggle: () => {}, remove: () => {}, clear: () => {}, visit: () => {} },
	auth: {
		currentUser: undefined,
		login: () => {},
		logout: () => {},
	},
	cart: { isLoading: true, items: [], positionsCount: 0, total: 0, addItem: () => {}, setQuantity: () => {}, removeItem: () => {}, clear: () => {} },
};

const AppContext = React.createContext(initialState);

export const useAppContext = () => {
	return useContext(AppContext);
};

export const AppContextProvider = (props: { children: React.ReactNode }) => {
	const authState = useAuthReducer();
	const cartState = useCartReducer();
	const comparisonState = useProductSelectionReducer("comparison");
	const recentlyViewed = useProductSelectionReducer("recently-viewed");
	const [notifications, setNotifications] = useState<Array<{ id: number; productName: string; title?: string }>>([]);
	const notificationId = useRef(0);
	const notify = useCallback((productName: string, title?: string) => {
		notificationId.current += 1;
		const notification = { id: notificationId.current, productName, title };
		setNotifications((current) => [...current, notification]);
	}, []);
	const addItem = useCallback((item: Omit<ICartItem, "quantity">, quantity?: number) => {
		cartState.addItem(item, quantity);
		notify(item.name);
	}, [cartState.addItem, notify]);
	const cart = { ...cartState, addItem };
	const toggleComparison = useCallback((id: number, productName?: string) => {
		const adding = !comparisonState.ids.includes(id);
		comparisonState.toggle(id);
		if (!adding || !productName) return;
		notify(productName, "Добавлено в сравнение");
	}, [comparisonState.ids, comparisonState.toggle, notify]);
	const comparison = { ...comparisonState, toggle: toggleComparison };

	return (
		<AppContext.Provider value={{ auth: authState, cart, comparison, recentlyViewed }}>
			{props.children}
			{notifications.length > 0 && (
				<CartNotificationStack>
					{notifications.map((notification) => (
						<CartNotification
							key={notification.id}
							productName={notification.productName}
							title={notification.title}
							onClose={() => setNotifications((current) => current.filter(({ id }) => id !== notification.id))}
						/>
					))}
				</CartNotificationStack>
			)}
		</AppContext.Provider>
	);
};

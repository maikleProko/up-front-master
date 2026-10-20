import React from "react";
import { useAppContext } from "shared/context/app-context.provider";
import { ICartItem } from "shared/context/reducers/cart-reducer";

export const CartQuantity = ({ item, className, min = 0 }: { item: ICartItem; className?: string; min?: 0 | 1 }) => {
	const { cart } = useAppContext();
	return (
		<div className={className} data-card-navigation="false">
			<button
				type="button"
				data-quantity-control
				aria-label={`Уменьшить количество ${item.name}`}
				onClick={() =>
					item.quantity === 1 ? cart.removeItem(item.id) : cart.setQuantity(item.id, item.quantity - 1)
				}
			>
				−
			</button>
			<input
				type="number"
				min={min}
				step="1"
				value={item.quantity}
				aria-label={`Количество ${item.name}`}
				onChange={(event) => {
					const quantity = Number(event.target.value);
					if (min === 0 && quantity <= 0) cart.removeItem(item.id);
					else cart.setQuantity(item.id, quantity);
				}}
			/>
			<button
				type="button"
				data-quantity-control
				aria-label={`Увеличить количество ${item.name}`}
				onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
			>
				+
			</button>
		</div>
	);
};

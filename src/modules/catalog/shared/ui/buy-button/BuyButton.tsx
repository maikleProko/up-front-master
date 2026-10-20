import { toCartItem } from "modules/catalog/shared/lib/product";
import React from "react";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button } from "shared/ui/atoms";
import { IProduct } from "modules/catalog/shared/model";
import { useAppContext } from "shared/context/app-context.provider";

export interface IBuyButton {
	product: IProduct;
}

export const BuyButton = (props: IBuyButton) => {
	const { cart } = useAppContext();
	const handleClick = () => cart.addItem(toCartItem(props.product));

	return (
		<Button disabled={props.product.stock_quantity <= 0} onClick={handleClick}>
			<ShoppingCartOutlined />
			{props.product.stock_quantity > 0 ? "Купить" : "Нет в наличии"}
		</Button>
	);
};

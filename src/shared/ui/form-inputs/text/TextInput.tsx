import React from "react";
import { Form, Input } from "antd";
import type { PasswordProps } from "antd/es/input";

export interface ITextInput extends PasswordProps {
	label?: React.ReactNode;
	error?: string;
	password?: boolean;
}

export const TextInput = (props: ITextInput) => {
	const { label, error, password, ...rest } = props;
	const Component = password ? Input.Password : Input;

	return (
		<Form.Item label={label} validateStatus={error ? "error" : undefined} help={error}>
			<Component {...rest} />
		</Form.Item>
	);
};

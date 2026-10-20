import React from "react";
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { ITextInput, TextInput } from "./TextInput";

export interface ITextField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
	extends Omit<ControllerProps<TFieldValues, TName>, "render">, Omit<ITextInput, "name" | "defaultValue"> {}

export const TextField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: ITextField<TFieldValues, TName>,
) => {
	const { name, control, rules, shouldUnregister, defaultValue, ...rest } = props;

	return (
		<Controller
			name={name}
			control={control}
			rules={rules}
			shouldUnregister={shouldUnregister}
			defaultValue={defaultValue}
			render={({ field, fieldState }) => <TextInput {...rest} {...field} error={fieldState.error?.message} />}
		/>
	);
};

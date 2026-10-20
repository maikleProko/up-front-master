import React from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { ITextField, TextField } from "../text/TextField";

export type IPasswordField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ITextField<TFieldValues, TName>, "password">;

export const PasswordField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: IPasswordField<TFieldValues, TName>,
) => <TextField {...props} password />;

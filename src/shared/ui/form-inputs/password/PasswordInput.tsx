import React from "react";
import { ITextInput, TextInput } from "../text/TextInput";

export type IPasswordInput = Omit<ITextInput, "password">;
export const PasswordInput = (props: IPasswordInput) => <TextInput {...props} password />;

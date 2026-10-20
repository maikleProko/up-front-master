import { FieldPath, FieldValues, UseControllerProps, useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { BaseSyntheticEvent, useEffect, useState } from "react";

export interface IUseAppFormProps<
	TFieldValues extends FieldValues = FieldValues,
	TResponse = void,
> extends UseFormProps<TFieldValues> {
	onSubmit: (value: TFieldValues) => Promise<TResponse> | TResponse;
	onSuccess?: (resp: TResponse, values: TFieldValues) => void;
}

export interface IUseAppForm<TFieldValues extends FieldValues = FieldValues> extends UseFormReturn<TFieldValues> {
	onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
	globalError?: string;
	setGlobalError: (message?: string) => void;
	cleanGlobalError: () => void;
	submitProps: { loading: boolean; disabled: boolean };
	regField: <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
		name: TFieldName,
		rules?: UseControllerProps<TFieldValues, TFieldName>["rules"],
	) => UseControllerProps<TFieldValues, TFieldName>;
}

export const useAppForm = <TFieldValues extends FieldValues = FieldValues, TResponse = void>(
	props: IUseAppFormProps<TFieldValues, TResponse>,
): IUseAppForm<TFieldValues> => {
	const form = useForm<TFieldValues>({ mode: "all", ...props });

	const [globalError, setGlobalError] = useState<string>();
	const cleanGlobalError = () => setGlobalError(undefined);

	useEffect(() => {
		form.trigger();
	}, []);

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			const resp = await props.onSubmit(values);
			props.onSuccess?.(resp as TResponse, values);
			cleanGlobalError();
		} catch (e) {
			setGlobalError(e instanceof Error ? e.message : "Что-то пошло не так, попробуйте ещё раз");
		}
	});

	const submitProps = {
		loading: form.formState.isSubmitting,
		disabled: !form.formState.isValid,
	};

	const regField = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
		name: TFieldName,
		rules?: UseControllerProps<TFieldValues, TFieldName>["rules"],
	): UseControllerProps<TFieldValues, TFieldName> => ({
		name,
		control: form.control,
		rules: { required: true, ...rules },
	});

	return {
		...form,
		onSubmit,
		globalError,
		setGlobalError,
		cleanGlobalError,
		submitProps,
		regField,
	};
};

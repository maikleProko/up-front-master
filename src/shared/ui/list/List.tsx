import { SkeletonRegion, SkeletonLines } from "shared/ui/skeleton";
import React from "react";
import { Alert } from "antd";
import { EmptyState } from "shared/ui/atoms/empty-state";

export interface IListData<TItem> {
	data?: { data: TItem[] };
	error?: unknown;
	isLoading?: boolean;
}

export interface IList<TItem> {
	data: IListData<TItem>;
	renderItem: (item: TItem) => React.ReactNode;
	emptyText?: React.ReactNode;
	loadingContent?: React.ReactNode;
}

export const List = <TItem,>(props: IList<TItem>) => {
	const { data, error, isLoading } = props.data;

	if (isLoading)
		return (
			<>
				{props.loadingContent ?? (
					<SkeletonRegion>
						<SkeletonLines count={6} />
					</SkeletonRegion>
				)}
			</>
		);
	if (error) return <Alert type="error" message="Не удалось загрузить данные" />;

	const items = data?.data ?? [];

	if (!items.length) return <EmptyState title={props.emptyText} />;

	return <>{items.map(props.renderItem)}</>;
};

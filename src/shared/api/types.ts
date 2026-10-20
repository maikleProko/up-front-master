export interface IApiListResponse<T> {
	data: T[];
	total: number;
}

export interface IApiResponse<T> {
	data: T;
}

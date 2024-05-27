type ApiResponse<T> = {
	data: T | null;
	message?: string;
};

export function JsonResponse<T>(
	data: T | null,
	message?: string,
): ApiResponse<T> {
	return {
		data,
		message,
	};
}

type ApiResponse<T> = {
    data: T | null;
    message?: string;
};

export function MakeResponse<T>(
    data: T | null,
    message: string = '',
): ApiResponse<T> {
    return {
        data,
        message,
    };
}

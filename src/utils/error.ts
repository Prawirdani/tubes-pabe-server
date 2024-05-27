export class ApiError extends Error {
    public status: number;
    public details?: any;
    constructor(message: string, status: number = 500, details?: any) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
export const ErrBadRequest = (msg: string, details?: any) => new ApiError(msg, 400, details);
export const ErrUnauthorized = (msg: string) => new ApiError(msg, 401);
export const ErrNotFound = (msg: string) => new ApiError(msg, 404);
export const ErrConflict = (msg: string) => new ApiError(msg, 409);
export const ErrInternalServer = () => new ApiError('Internal Server Error', 500);

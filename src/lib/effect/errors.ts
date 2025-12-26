import { Data } from "effect";

/**
 * 应用错误类型定义
 * 使用 Effect 的 Data.Error 来创建类型安全的错误
 */

// 数据库错误
export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

// 文件存储错误（R2）
export class StorageError extends Data.TaggedError("StorageError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

// 验证错误
export class ValidationError extends Data.TaggedError("ValidationError")<{
	readonly message: string;
	readonly field?: string;
}> {}

// 认证错误
export class AuthenticationError extends Data.TaggedError(
	"AuthenticationError",
)<{
	readonly message: string;
}> {}

// 权限错误
export class PermissionError extends Data.TaggedError("PermissionError")<{
	readonly message: string;
}> {}

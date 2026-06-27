// repo 通用返回类型
export type Result<TData, TError = Error> = {
    data: TData | null;
    error: TError | null;
};

const CREDIT_RPC_ERRORS = {
    CREDIT_BALANCE_NOT_ENOUGH: {
        code: "U0001",
        name: "CreditBalanceNotEnoughError",
        message: "not enough credit",
    },
    CREDIT_FROZEN_NOT_ENOUGH: {
        code: "U0002",
        name: "CreditFrozenNotEnoughToCaptureError",
        message: "not enough frozen credit",
    },
    CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND: {
        code: "U0003",
        name: "CreditFrozenNotEnoughToRefundError",
        message: "not enough frozen credit to refund",
    },
    INVALID_RETRY_COUNT: {
        code: "P0001",
        name: "InvalidRetryCountError",
        message: "invalid retry_count",
    },
    IMAGE_NOT_FOUND: {
        code: "P0002",
        name: "ImageNotFoundError",
        message: "image not found",
    },
} as const;

export const CREDIT_BALANCE_NOT_ENOUGH_NAME = CREDIT_RPC_ERRORS.CREDIT_BALANCE_NOT_ENOUGH.name;
export const CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE_NAME = CREDIT_RPC_ERRORS.CREDIT_FROZEN_NOT_ENOUGH.name;
export const CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND_NAME = CREDIT_RPC_ERRORS.CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND.name;
export const INVALID_RETRY_COUNT_NAME = CREDIT_RPC_ERRORS.INVALID_RETRY_COUNT.name;
export const IMAGE_NOT_FOUND_NAME = CREDIT_RPC_ERRORS.IMAGE_NOT_FOUND.name;

export const RPC_ERROR_BY_CODE = Object.fromEntries(
    Object.values(CREDIT_RPC_ERRORS).map((def) => [def.code, def])
) as Record<string, (typeof CREDIT_RPC_ERRORS)[keyof typeof CREDIT_RPC_ERRORS]>;

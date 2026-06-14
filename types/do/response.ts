// repo 通用返回类型
export type Result<TData, TError = Error> = {
    data: TData | null;
    error: TError | null;
};

enum RequestMethodsType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS"
}


interface RetryConfig {
    retries?: number;
    retryDelay?: number;
}

interface FetchifyConfig {
    baseURL?: string
    timeout?: number;
    headers?: Record<string, string>
    method?: RequestMethodsType
    body?: any;
    params?: Record<string, any>;
    allowCrossOriginCookies?: boolean;
    retry?: RetryConfig
}

interface MutationType<TBody> {
    url: string,
    body?: TBody,
    config: FetchifyConfig;
    method: RequestMethodsType
}

interface DispatchRequestType {
    url: string;
    config: FetchifyConfig;
}

interface RequestInterceptorType {
    successFn: (req: DispatchRequestType) =>
        DispatchRequestType | Promise<DispatchRequestType>;
    errorFn?: (err: unknown) => Promise<never>;
}


interface ResponseInterceptorType<T = Response> {
    successFn: (response: T) => T | Promise<T>;
    errorFn?: (err: unknown) => Promise<never>;
}

// Export all types
export {
    FetchifyConfig,
    MutationType,
    RequestMethodsType,
    RequestInterceptorType,
    ResponseInterceptorType,
    DispatchRequestType,
    RetryConfig
}
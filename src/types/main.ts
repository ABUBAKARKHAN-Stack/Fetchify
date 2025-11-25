/**
 * RequestMethodsType
 * Enum representing all supported HTTP methods.
 */
enum RequestMethodsType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS"
}

/**
 * Config
 * Configuration interface for Fetchify requests.
 *
 * @property baseURL - Base URL prepended to request URLs
 * @property timeout - Request timeout in milliseconds
 * @property headers - HTTP headers as key-value pairs
 * @property method - HTTP method for the request
 * @property body - Request body for mutation requests
 * @property params - Query parameters as key-value pairs
 * @property allowCrossOriginCookies - If true, sends cookies for cross-origin requests
 */
interface Config {
    baseURL?: string
    timeout?: number;
    headers?: Record<string, string>
    method?: RequestMethodsType
    body?: any;
    params?: Record<string,any>;
    allowCrossOriginCookies?: boolean
}

/**
 * MutationType
 * Interface for mutation requests (POST, PUT, PATCH, DELETE)
 *
 * @template TBody - Type of request body
 * @property url - Endpoint URL
 * @property body - Optional request body
 * @property config - Request configuration
 * @property method - HTTP method
 */
interface MutationType<TBody> {
    url: string,
    body?: TBody,
    config: Config;
    method: RequestMethodsType
}

/**
 * DispatchRequestType
 * Interface for a fully prepared request
 *
 * @property url - Final URL including baseURL and query params
 * @property config - Request configuration
 */
interface DispatchRequestType {
    url: string;
    config: Config;
}

/**
 * RequestInterceptorType
 * Interface for request interceptors
 *
 * @property successFn - Function called before request is sent, can modify request
 * @property errorFn - Optional function to handle errors in the interceptor
 */
interface RequestInterceptorType {
    successFn: (req: DispatchRequestType) =>
        DispatchRequestType | Promise<DispatchRequestType>;
    errorFn?: (err: unknown) => Promise<never>;
}

/**
 * ResponseInterceptorType
 * Interface for response interceptors
 *
 * @template T - Type of the response (default: Response)
 * @property successFn - Function called after response is received, can modify response
 * @property errorFn - Optional function to handle errors in the interceptor
 */
interface ResponseInterceptorType<T = Response> {
    successFn: (response: T) => T | Promise<T>;
    errorFn?: (err: unknown) => Promise<never>;
}

// Export all types
export {
    Config,
    MutationType,
    RequestMethodsType,
    RequestInterceptorType,
    ResponseInterceptorType,
    DispatchRequestType
}
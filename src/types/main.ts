enum RequestMethodsType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS"
}



interface Config {
    baseURL?: string
    timeout?: number
    headers?: Record<string, string>
    method?: RequestMethodsType
    body?: any;
    params?: Record<string,any>;
    allowCrossOriginCookies?:boolean

}

interface MutationType<TBody> {
    url: string,
    body?: TBody,
    config: Config;
    method?: RequestMethodsType
}

interface DispatchRequestType {
    url: string;
    config: Config;
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



export {
    Config,
    MutationType,
    RequestMethodsType,
    RequestInterceptorType,
    ResponseInterceptorType,
    DispatchRequestType
}
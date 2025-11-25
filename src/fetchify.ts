import {
    FetchifyConfig,
    RequestInterceptorType,
    ResponseInterceptorType,
    MutationType,
    RequestMethodsType,
    DispatchRequestType
} from "./types/main.js"

class Fetchify {

    //* Default Configuration
    private defaultConfig: FetchifyConfig = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 1000,
        retry: {
            retries: 1,
            retryDelay: 1000
        }
    }

    //* Request Interceptors Array
    requestInterceptors: RequestInterceptorType[] = []

    //* Response Interceptors Array
    responseInterceptors: ResponseInterceptorType[] = []

    constructor(public config: FetchifyConfig) {
        this.config = this.mergeConfig({
            ...this.defaultConfig,
            ...config,
        })
    }


    //* Add Request Interceptors (can be multiple that's why requestInterceptors is an array)
    addRequestInterceptors(
        {
            successFn,
            errorFn
        }: RequestInterceptorType
    ) {
        this.requestInterceptors.push({
            successFn,
            errorFn
        })
    }

    //* Add Response Interceptors (can be multiple that's why responseInterceptors is an array)
    addResponseInterceptors(
        {
            errorFn,
            successFn
        }: ResponseInterceptorType
    ) {

        this.responseInterceptors.push({
            successFn,
            errorFn
        })
    }

    //* Http Request Methods
    async get(url: string, config?: FetchifyConfig) {
        return this.request({
            url,
            config: {
                ...config,
                method: RequestMethodsType.GET,
                headers: {
                    ...(config?.headers || {}),

                }
            }
        })
    }

    async post<TBody>(url: string, body: TBody, config?: FetchifyConfig) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.POST,
            config: config || {}
        })
    }

    async put<TBody>(url: string, body: TBody, config?: FetchifyConfig) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.PUT,
            config: config || {}
        })
    }

    async patch<TBody>(url: string, body: TBody, config?: FetchifyConfig) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.PATCH,
            config: config || {}
        })
    }

    async delete(url: string, config?: FetchifyConfig) {
        return this.mutation({
            url,
            config: config || {},
            method: RequestMethodsType.DELETE
        })
    }

    //* Private Methods

    private mergeConfig(config: FetchifyConfig): FetchifyConfig {
        return {
            ...this.defaultConfig,
            ...this.config,
            ...config,
            headers: {
                ...(this.defaultConfig.headers || {}),
                ...(this.config.headers) || {},
                ...(config?.headers) || {},
            },
            retry: {
                ...(this.defaultConfig.retry || {}),
                ...(this.config.retry) || {},
                ...(config?.retry) || {},
            }

        }
    }

    private async dispatchRequest({ url, config }: DispatchRequestType) {
        const abortController = new AbortController()
        const finalConfig = config ? this.mergeConfig(config) : this.config
        const {
            timeout,
            baseURL,
            ...fetchOpts
        } = finalConfig
        let timeoutRef: number | undefined;


        if (timeout) {
            timeoutRef = setTimeout(() => abortController.abort(), timeout)
        }

        let finalUrl: string = "";

        if (this.config.baseURL?.endsWith("/") && url.startsWith("/")) {
            finalUrl = `${this.config.baseURL}${url.slice(1)}`
        } else if (this.config.baseURL?.endsWith("/") && !url.startsWith("/")) {
            finalUrl = `${this.config.baseURL}${url}`
        } else if (!this.config.baseURL?.endsWith("/") && url.startsWith("/")) {
            finalUrl = `${this.config.baseURL}${url}`
        } else if (!this.config.baseURL?.endsWith("/") && !url.startsWith("/")) {
            finalUrl = `${this.config.baseURL}/${url}`
        }


        try {
            const response = await fetch(finalUrl, {
                ...fetchOpts,
                signal: abortController.signal,
                credentials: fetchOpts.allowCrossOriginCookies ? "include" : undefined
            })
            return response
        } finally {
            if (timeoutRef) clearTimeout(timeoutRef);
        }
    }

    private async mutation<TBody>({ body, url, config, method }: MutationType<TBody>) {
        return this.request({
            url,
            config: {
                ...config,
                body: JSON.stringify(body),
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(config?.headers || {})
                }
            }
        })
    }


    private async request({ url, config }: DispatchRequestType) {
        const finalConfig = this.mergeConfig(config)

        if (!finalConfig.retry?.retries) throw new Error("Retries should be atleast 1")

        const retries = finalConfig.retry.retries
        const retryDelay = finalConfig.retry.retryDelay!


        //! MANUAL  LOGIC 
        // let paramsParts: string[] = [];

        // if (config?.params) {
        //     const params = Object.entries(config.params).map(([key, value]) => ({ key, value }))
        //     console.log(``);
        //     paramsParts.unshift(`?${params[0].key}=${params[0].value}`)

        //     params.slice(1).forEach((param) => {
        //         paramsParts.push(`&${param.key}=${param.value}`)
        //     })
        // }
        // let finalUrl: string = `${url}${paramsParts.join("")}`;

        const query = new URLSearchParams(config.params || {}).toString()
        let finalUrl: string = query ? `${url}?${query}` : url;
        let finalRequest: DispatchRequestType = { url: finalUrl, config: this.mergeConfig(config!) }

        //* Request Interceptor

        for (const interceptor of this.requestInterceptors) {
            try {
                finalRequest = await interceptor.successFn(finalRequest)
            } catch (err) {
                if (interceptor.errorFn) {
                    return interceptor.errorFn(err)
                }
                return Promise.reject(err)
            }
        }

        //* Last Error
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await this.dispatchRequest(finalRequest)
                return await this.runResponseInterceptors(response)
            } catch (error) {
                lastError = error
                if (attempt < retries) {
                    console.log(`Retry ${attempt}/${retries} failed. Waiting ${retryDelay}ms...`)
                    await new Promise(res => setTimeout(res, retryDelay))
                }
            }
        }
        throw lastError

    }

    private async runResponseInterceptors(response: Response) {
        for (const interceptor of this.responseInterceptors) {
            try {
                response = await interceptor.successFn(response)
            } catch (err) {
                if (interceptor.errorFn) {
                    return interceptor.errorFn(err)
                }
                return Promise.reject(err)
            }
        }
        return response
    }

}


function create(config: FetchifyConfig) {
    return new Fetchify(config)
}

export default {
    create
}
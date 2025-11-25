import { Config, RequestInterceptorType, ResponseInterceptorType, MutationType, RequestMethodsType, DispatchRequestType } from "./types/main.js"

class Fetchify {

    //* Default Configuration
    private defaultConfig: Config = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 1000
    }

    //* Request Interceptors Array
    requestInterceptors: RequestInterceptorType[] = []

    //* Response Interceptors Array
    responseInterceptors: ResponseInterceptorType[] = []

    constructor(public config: Config) {
        this.config = this.mergeConfig({
            ...this.defaultConfig,
            ...config,
        })
    }


    //* Add Request Interceptors (can be multiple that's why requestInterceptors is an array)
    async addRequestInterceptors(
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
    async addResponseInterceptors(
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
    async get(url: string, config?: Config) {
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

    async post<TBody>(url: string, body: TBody, config?: Config) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.POST,
            config: config || {}
        })
    }

    async put<TBody>(url: string, body: TBody, config?: Config) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.PUT,
            config: config || {}
        })
    }

    async patch<TBody>(url: string, body: TBody, config?: Config) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.PATCH,
            config: config || {}
        })
    }

    async delete(url: string, config?: Config,) {
        return this.mutation({
            url,
            config: config || {}
        })
    }

    //* Private Methods

    private mergeConfig(config: Config) {
        return {
            ...this.defaultConfig,
            ...this.config,
            ...config,
            headers: {
                ...(this.defaultConfig.headers || {}),
                ...(this.config.headers) || {},
                ...(config?.headers) || {},
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

        const query = new URLSearchParams(config.params).toString()
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

        //* Dispatch Request

        let response: Response;

        try {
            response = await this.dispatchRequest(finalRequest)
        } catch (err) {
            return Promise.reject(err)
        }

        //* Run Response Interceptor
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


function create(config: Config) {
    return new Fetchify(config)
}

export default {
    create
}
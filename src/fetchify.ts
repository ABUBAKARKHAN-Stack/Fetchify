import {
    FetchifyConfig,
    RequestInterceptorType,
    ResponseInterceptorType,
    MutationType,
    DispatchRequestType,
    RetryConfig
} from "./types/main.js"

import {
    RequestMethodsType,
} from './types/main.js'

/**
 //* Fetchify
 * A lightweight TypeScript HTTP client for making HTTP requests.
 * Supports GET, POST, PUT, PATCH, DELETE, OPTIONS methods,
 * request/response interceptors, query params, JSON body, timeout, and baseURL.
 */
class Fetchify {

    //* -----------------------------
    //* Default Configuration
    //* -----------------------------

    /**
     * @private
     * Default client configuration with JSON headers and timeout
     */
    private defaultConfig: FetchifyConfig = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 1000,
        retry: {
            retries: 1,
            retryDelay: 1000
        }
    }

    //* -----------------------------
    //* Interceptors
    //* -----------------------------

    /**
     * @private
     * Request interceptors array.
     * Each interceptor can modify request or handle errors before sending.
     */
    private requestInterceptors: RequestInterceptorType[] = []

    /**
     * @private
     * Response interceptors array.
     * Each interceptor can modify response or handle errors after receiving.
     */
    private responseInterceptors: ResponseInterceptorType[] = []

    /**
     * Constructor
     * @param config - User-defined configuration object
     */
    constructor(public config: FetchifyConfig) {
        this.config = this.mergeConfig({
            ...this.defaultConfig,
            ...config,
        })
    }

    //* -----------------------------
    //* Interceptor Methods
    //* -----------------------------

    /**
     * Add a request interceptor
     * @param {RequestInterceptorType} interceptor - Interceptor with successFn and errorFn if error occurs
     */
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

    /**
     * Add a response interceptor
     * @param {ResponseInterceptorType} interceptor - Interceptor with successFn and errorFn if error occurs
     */
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

    //* -----------------------------
    //* HTTP Methods
    //* -----------------------------

    /**
     * Send a GET request
     * @param url - Endpoint URL
     * @param config - Optional configuration overrides
     */
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

    /**
     * Send a POST request
     * @param url - Endpoint URL
     * @param body - Request body
     * @param config - Optional configuration overrides
     */
    async post<TBody>(url: string, body: TBody, config?: FetchifyConfig) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.POST,
            config: config || {}
        })
    }

    /**
     * Send a PUT request
     * @param url - Endpoint URL
     * @param body - Request body
     * @param config - Optional configuration overrides
     */
    async put<TBody>(url: string, body: TBody, config?: FetchifyConfig) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.PUT,
            config: config || {}
        })
    }


    /**
     * Send a PATCH request
     * @param url - Endpoint URL
     * @param body - Request body
     * @param config - Optional configuration overrides
     */
    async patch<TBody>(url: string, body: TBody, config?: FetchifyConfig) {
        return this.mutation({
            body,
            url,
            method: RequestMethodsType.PATCH,
            config: config || {}
        })
    }

    /**
     * Send a DELETE request
     * @param url - Endpoint URL
     * @param config - Optional configuration overrides
     */
    async delete(url: string, config?: FetchifyConfig) {
        return this.mutation({
            url,
            config: config || {},
            method: RequestMethodsType.DELETE
        })
    }

    /**
     * Send a OPTIONS request
     * @param url - Endpoint URL
     * @param config - Optional configuration overrides
     */
    async options(url: string, config?: FetchifyConfig) {
        return this.request({
            url,
            config: {
                ...config,
                method: RequestMethodsType.OPTIONS
            }
        });
    }


    //* -----------------------------
    //* Private Methods
    //* -----------------------------

    /**
     * Merge user config, default config, and request config
     * @private
     */
    private mergeConfig(config: FetchifyConfig) {
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

    /**
     * Dispatch actual HTTP request using fetch
     * Handles timeout and baseURL logic
     * @private
     */
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

        // Compose final URL based on baseURL and url
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
                credentials: fetchOpts.allowCrossOriginCookies ? "include" : "same-origin"
            })
            return response
        } finally {
            if (timeoutRef) clearTimeout(timeoutRef);
        }
    }

    /**
     * Handle mutation requests (POST, PUT, PATCH, DELETE)
     * @private
     */
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

    /**
     * Core request function that handle retires, runs interceptors and dispatches fetch
     * @private
     */
    private async request({ url, config }: DispatchRequestType) {
        const finalConfig = this.mergeConfig(config)

        if (!finalConfig.retry?.retries) throw new Error("Retries should be atleast 1")

        const retries = finalConfig.retry.retries
        const retryDelay = finalConfig.retry.retryDelay!

        const query = new URLSearchParams(config.params || {}).toString()
        let finalUrl: string = query ? `${url}?${query}` : url;
        let finalRequest: DispatchRequestType = { url: finalUrl, config: this.mergeConfig(config!) }

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

        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await this.dispatchRequest(finalRequest)
                return await this.runResponseInterceptors(response)
            } catch (error) {
                lastError = error
                if (attempt <= retries) {
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

/**
 * Factory function to create Fetchify instance
 * @param config - Configuration for Fetchify instance
 */
function create(config: FetchifyConfig) {
    return new Fetchify(config)
}

export type {
    FetchifyConfig,
    DispatchRequestType,
    MutationType,
    RequestInterceptorType,
    ResponseInterceptorType,
    RetryConfig
}

export {
    RequestMethodsType
}

export default {
    create
}


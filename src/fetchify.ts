import { Config } from "./types/main.js"

class Fetchify {
    private defaultConfig: Config = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 1000
    }
    constructor(public config: Config) {
        this.config = this.mergeConfig({
            ...this.defaultConfig,
            ...config,
        })
    }

    async dispatchRequest({ url, config }: { url: string, config?: Config }) {
        const abortController = new AbortController()
        const finalConfig = config ? this.mergeConfig(config) : this.config
        const timeout = finalConfig.timeout || 0
        let timeoutRef: number | undefined;

        if (timeout) {
            timeoutRef = setTimeout(() => abortController.abort(), timeout)
        }

        console.log(finalConfig);
        

        

        try {
            const response = await fetch(`${this.config.baseURL}/${url}`, {
                ...finalConfig,
                signal: abortController.signal
            })
            return response
        } finally {
            if (timeoutRef) clearTimeout(timeoutRef);
        }
    }

    async get(url: string, config?: Config) {
        return this.dispatchRequest({
            url,
            config: { ...config, method: "GET" }
        })
    }

    async post<TBody>(url: string, body: TBody, config?: Config) {
        return this.dispatchRequest({
            url,
            config: {
                ...config,
                body: JSON.stringify(body),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }

            }
        })
    }

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
}


function create(config: Config) {
    return new Fetchify(config)
}

export default {
    create
}
import { Config } from "./types/main.js"

class Fetchify {
    constructor(public config: Config) {
        this.config = this.megreConfig({
            ...config,
            headers: { 'Content-Type': 'application/json' },
            timeout: 1000
        })
    }

    async get(url: string, config?: Config) {
        const finalConfig = config ? this.megreConfig(config) : this.config
        return fetch(`${this.config.baseURL}/${url}`, finalConfig)
    }

    private megreConfig(config: Config) {
        return {
            ...this.config,
            ...config,
            headers: {
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
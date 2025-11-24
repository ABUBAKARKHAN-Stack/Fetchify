interface Config {
    baseURL?: string
    timeout?: number
    headers?: Record<string, string>
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"
    body?: any
}

export {
    type Config
}
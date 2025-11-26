# Fetchify

A lightweight TypeScript HTTP client inspired by Axios.
Supports GET, POST, PUT, PATCH, DELETE, OPTIONS requests, request/response interceptors, query params, timeout, baseURL, and retry support.

---

## Features

* Fully typed with TypeScript
* Supports all HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
* Request & Response interceptors
* Timeout handling
* Base URL support
* Query parameter support
* Retry failed requests with configurable attempts and delays
* Cross-origin cookie support

---

## Installation

```bash
# If you are using npm
npm install fetchify

# Or using yarn
yarn add fetchify
```

---

## Usage Example

```ts
import fetchify, { RequestMethodsType, FetchifyConfig } from "./fetchify";

// Create a Fetchify instance
const api = fetchify.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000,
  retry: { retries: 2, retryDelay: 1500 }
});

// Add request interceptor
api.addRequestInterceptors({
  successFn: (config) => {
    console.log("Intercepting the request...", config);
    return config;
  },
  errorFn: (err) => Promise.reject(err)
});

// Add response interceptor
api.addResponseInterceptors({
  successFn: (response) => {
    console.log('Response received:', response.url, response.status);
    return response;
  },
  errorFn: (err) => Promise.reject(err),
});

// Example GET request with query params
async function main() {
  const resp = await api.get("/todos/", {
    params: { _page: 3, _limit: 3 },
    timeout: 5000
  });
  console.log(await resp.json());
}

// Example POST request with typed body
interface Todo {
  title: string;
  completed: boolean;
  userId: number;
}

async function createTodo() {
  const newTodo: Todo = { title: "Learn Fetchify", completed: false, userId: 1 };
  const resp = await api.post<Todo>("/todos", newTodo);
  console.log(await resp.json());
}

main();
createTodo();
```

---

## API Reference

### `create(config: FetchifyConfig)`

Creates a new Fetchify instance.

**Config options:**

| Property                  | Type                     | Description                            |
| ------------------------- | ------------------------ | -------------------------------------- |
| `baseURL`                 | `string`                 | Base URL prepended to all request URLs |
| `timeout`                 | `number`                 | Request timeout in milliseconds        |
| `headers`                 | `Record<string, string>` | HTTP headers                           |
| `method`                  | `RequestMethodsType`     | HTTP method for the request            |
| `body`                    | `any`                    | Request body for mutation requests     |
| `params`                  | `Record<string, any>`    | Query parameters                       |
| `allowCrossOriginCookies` | `boolean`                | Send cookies for cross-origin requests |
| `retry`                   | `RetryConfig`            | Retry behavior for failed requests     |

---

### HTTP Methods

* `get(url: string, config?: FetchifyConfig)`
* `post<TBody>(url: string, body: TBody, config?: FetchifyConfig)`
* `put<TBody>(url: string, body: TBody, config?: FetchifyConfig)`
* `patch<TBody>(url: string, body: TBody, config?: FetchifyConfig)`
* `delete(url: string, config?: FetchifyConfig)`
* `options(url: string, config?: FetchifyConfig)`

> Each method returns a `Response` object like the native fetch API. Mutation methods support generic typing for request bodies.

---

### Interceptors

#### `addRequestInterceptors({ successFn, errorFn })`

* Runs before the request is sent.
* Can modify the request configuration or handle errors.

#### `addResponseInterceptors({ successFn, errorFn })`

* Runs after the response is received.
* Can transform or handle response data.

**Example:**

```ts
api.addRequestInterceptors({
  successFn: (config) => {
    console.log("Request intercepted:", config.url);
    return config;
  },
  errorFn: (err) => Promise.reject(err)
});

api.addResponseInterceptors({
  successFn: (response) => {
    console.log("Response intercepted:", response.status);
    return response;
  },
  errorFn: (err) => Promise.reject(err)
});
```

---


## Author & Repository

**Author:** Abubakar Aijaz  
**Email:** abubakar123456654123@gmail.com  
**GitHub Repository:** [https://github.com/ABUBAKARKHAN-Stack/Fetchify](https://github.com/ABUBAKARKHAN-Stack/Fetchify)  
**NPM Package:** [https://www.npmjs.com/package/fetchify-client](https://www.npmjs.com/package/fetchify-client)

--- 

## License

MIT License

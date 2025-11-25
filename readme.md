# Fetchify

A lightweight TypeScript HTTP client inspired by Axios.
Supports GET, POST, PUT, PATCH, DELETE, OPTIONS requests, request/response interceptors, query params, timeout, and baseURL handling.

---

## Features

* Fully typed with TypeScript
* Supports all HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
* Request & Response interceptors
* Timeout handling
* Base URL support
* Query parameter support
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
import fetchify from "./fetchify";

// Create a Fetchify instance
const api = fetchify.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000
});

// Add request interceptor
api.addRequestInterceptors({
  successFn: (config) => {
    console.log("Intercepting the request...", config);
    return config;
  },
  errorFn: (err) => {
    return Promise.reject(err);
  }
});

// Add response interceptor
api.addResponseInterceptors({
  successFn: (response) => {
    console.log('Response received:', response.url, response.status);
    return response;
  },
  errorFn: (err) => {
    return Promise.reject(err);
  },
});

// Example function using GET request with query params
async function main() {
  const resp = await api.get("/todos/", {
    params: {
      _page: 3,
      _limit: 3
    },
    timeout: 5000
  });
  
  console.log(await resp.json());
}

main();
```

---

## API Reference

### `create(config: Config)`

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

---

### HTTP Methods

* `get(url: string, config?: Config)`
* `post<TBody>(url: string, body: TBody, config?: Config)`
* `put<TBody>(url: string, body: TBody, config?: Config)`
* `patch<TBody>(url: string, body: TBody, config?: Config)`
* `delete(url: string, config?: Config)`
* `options(url: string, config?: Config)`

> Each method returns a `Response` object like the native fetch API.

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

## License

MIT License

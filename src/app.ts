import fetchify from "./fetchify";
import axios from 'axios'
const api = fetchify.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000,
  retry: {
    retries: 4
  }
});

const api2 = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000,

})


api.addRequestInterceptors({
  successFn: (config) => {
    console.log("Intercepting the response...", config);
    return config
  },
  errorFn: (err) => {
    return Promise.reject(err)
  }
})

api.addResponseInterceptors({
  successFn: (response) => {
    console.log('Response Received', response.url);
    return response
  },
  errorFn: (err) => {
    return Promise.reject(err)
  },
})

async function main() {
  const resp = await api.get("/todos/", {
    params: {
      _page:3,
      category: ["gfd",  "fg"],
      _limit:3
    },
    timeout: 5000,
 
  })

  
}
main()
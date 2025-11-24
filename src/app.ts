import fetchify from "./fetchify";

const api = fetchify.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000
});

async function main() {
  const resp = await api.get("/todos/1")
  api.post("/todos",{a:"d"},{headers: {Authorization: "Bearer ABC" },timeout:5000 })
  const data = await resp.json()
  // console.log(data);
}
main()
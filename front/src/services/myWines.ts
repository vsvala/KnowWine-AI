//Axios is a Promise-based HTTP client for browsers and Node.js used 
// to make HTTP requests (GET/POST/PUT/DELETE, etc.) works with server-side code and APIs.
import axios from 'axios'

const baseUrl = '/api/data'
//'http://localhost:3001/api/data'
type ItemInput = {
  name: string
  description: string
}

const getAll = () => {
 const request = axios.get(baseUrl)
 return request.then(response => response.data)
}

const create = (newObject: ItemInput) => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id: number, newObject: ItemInput) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

const deleteItem = (id: number) => {
 return  axios.delete(`${baseUrl}/${id}`)
}

export default {
  getAll,
  create,
  update,
  deleteItem,
}

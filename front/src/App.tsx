import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
//import Note from './components/Note'

const baseUrl = 'http://localhost:3001/api/data'

type Item = {
  id: number
  name: string
  description: string
}

const App = () => {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')



  useEffect(() => {
  console.log('effect')
    axios
      .get<Item[]>(baseUrl)
      .then(response => {
        console.log('promise fulfilled')
        setItems(response.data)
      })
      .catch(() => setError('Unable to load items'))
  }, [])
    console.log('render', items.length, 'items')


  // const addItem = async (event: React.FormEvent) => {
  //   event.preventDefault()
  //   setError('')

  //   try {
  //     const response = await axios.post<Item>(baseUrl, {
  //       name,
  //       description,
  //     })
  //     setItems(prev => [...prev, response.data])
  //     setName('')
  //     setDescription('')
  //   } catch (err: unknown) {
  //     if (axios.isAxiosError(err) && err.response?.data) {
  //       setError((err.response.data as { error: string }).error || 'Error saving item')
  //     } else {
  //       setError('Error saving item')
  //     }
  //   }
  // }

  // const deleteItem = async (id: number) => {
  //   setError('')
  //   try {
  //     await axios.delete(`${baseUrl}/${id}`)
  //     setItems(prev => prev.filter(item => item.id !== id))
  //   } catch {
  //     setError('Error deleting item')
  //   }
  // }

  return (
    <div className="App">
      <header>
        <h1>KnowWine AI</h1>
      </header>

      {error && <div className="error">{error}</div>}

      {/* <form onSubmit={addItem} className="item-form">
        <div>
          <label>
            Name
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Description
            <input value={description} onChange={e => setDescription(e.target.value)} />
          </label>
        </div>
        <button type="submit">Add item</button>
      </form> */}

      <h2>Items</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong>: {item.description}{' '}
            {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App

import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import './App.css'
import Footer from './components/Footer'
import myWineService from './services/myWines'
//import Note from './components/Note'

// TODO aDD to favourotes list (wine) after search... changing importannce  2
// TODO revent the user from being able to add same wine multiple

type Item = {
  id: number
  name: string
  description: string
}

const App = () => {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [searched, setSearched] = useState('')
  const [error, setError] = useState('')



  // useEffect: runs after the first render to perform side-effects.
  // Here it fetches the items from the backend API and sets state.
  // Runs once because the dependency array is empty (`[]`).
  useEffect(() => {
  console.log('effect')
    myWineService.getAll()
      .then(initialItems => {
        setItems(initialItems)
      })
      .catch(() => setError('Unable to load items')) 
      console.error('Error loading item')         
  }, [])
// console.log('render', items.length, 'items')



  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearched(e.target.value)
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  const filteredItems = searched.trim() === ''
    ? []
    : items.filter(item => {
        const lowerSearch = searched.toLowerCase().trim()
        return (
          item.name.toLowerCase().includes(lowerSearch) ||
          item.description.toLowerCase().includes(lowerSearch)
        )
      })


  const addItem = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('button clicked', event.target)
    const newItemObject: Item = {
      id: items.length +1, // This is just a placeholder. In a real app, the backend would assign the ID.
      name: name,
      description: description,
    }
     myWineService
     .create(newItemObject)
      .then(returnedItem => {
        console.log('item added', returnedItem)
        setItems(prev => prev.concat(returnedItem))     //creates a new copy of the array with the new item added to the end
        setName('')  
        setDescription('') 
  })
      .catch(() => {
        setError('Error adding item')
         console.error('Error adding item')
    })
  }
  

const deleteItem = (id: number) => {
  const itemToDelete = items.find(item => item.id === id)
  console.log('delete item with id', id, itemToDelete)

  myWineService
    .deleteItem(id)
    .then(() => {
      console.log('item deleted', id)
      setItems(prev => prev.filter(item => item.id !== id))
    })
    .catch(() => {
      setError('Error deleting item')
    })
}
//   const toggleImportanceOf = id => {
//   const url = `http://localhost:3001/notes/${id}`
//   const note = notes.find(n => n.id === id)
//   const changedNote = { ...note, important: !note.important }

//   axios.put(url, changedNote).then(response => {
//     setNotes(notes.map(note => note.id === id ? response.data : note))
//   })
// }

  return (
    <div className="App">
      <header>
        <h1>KnowWine AI</h1>
      </header>
      {error && <div className="error">{error}</div>}

      <h2>Search wines</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search.."
          value={searched}
          onChange={handleSearch}
        />
      </div>

      <div className="search-container">
      <h2>Search Results</h2>
      <ul>

        {filteredItems.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong>: {item.description}{' '}
            {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
          </li>
        ))}
      </ul>
      {searched.trim() !== '' && filteredItems.length === 0 && (
        <p>No matching wines found.</p>
      )}
    </div>

          <div className="search-container">
      <h2>My favourites</h2>
      <ul>
        {items.map(item => (
          <li className="favourite-item"
          key={item.id}>
            <strong>{item.name}</strong>: {item.description}{' '}
           <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>

      <h2>Add your wines</h2>
    <form onSubmit={addItem} className="item-form">
        <div>
          <label>
            Name
            <input 
                value={name} 
                placeholder="wine name"
                onChange={handleNameChange} required />
          </label>
        </div>
        <div>
          <label>
            Description
            <input 
                value={description} 
                onChange={handleDescriptionChange} />
          </label>
        </div>
        <button type="submit">Save</button>
      </form> 
           <br />
        <Footer/>
    </div>
  )
}

export default App

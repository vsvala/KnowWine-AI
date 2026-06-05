const express = require ('express')
 const cors =require('cors')

 const app = express();

app.use(cors());
app.use(express.json())//for parsing application/json POST requests
app.use(express.static('dist'))

let testdata = [
    { id: 1, name: 'Item 1', description: 'This is item 1' },
    { id: 2, name: 'Item 2', description: 'This is item 2' },
    { id: 3, name: 'Item 3', description: 'This is item 3' },
];

const path = require('path')
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})


app.get('/api/data', (req, res) => {
   res.json(testdata)
});
app.get('/api/data/:id', (req, res) => {
   const id = parseInt(req.params.id);
   const item = testdata.find(data => data.id === id);
   if (item) {
      res.json(item);
    } else {
       return res.status(404).json({ error: 'Item not found' });
   }
});
//http://localhost:3001/api/notes/1 

app.delete('/api/data/:id', (request, response) => {
  const id = Number(request.params.id)
  const initialLength = testdata.length
  testdata = testdata.filter(item => item.id !== id)

  if (testdata.length === initialLength) {
    return response.status(404).json({ error: 'Item not found' })
  }

  response.status(204).end()
})

const generateId = () => {
  const maxId = testdata.length > 0
    ? Math.max(...testdata.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/data', (req, res) => {
  const data = req.body;
  
  if (!data.name) {
    return res.status(400).json({ 
      error: 'name is required' 
    })
  }
  
  if (testdata.some(item => item.name === data.name)) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  
  const item = {
    id: testdata.length > 0 ? Math.max(...testdata.map(d => d.id)) + 1 : 1,
    name: data.name,
    description: data.description || ''
  }

  testdata = testdata.concat(item);
  res.status(201).json(item);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
// console.log("Hello from the backend!");
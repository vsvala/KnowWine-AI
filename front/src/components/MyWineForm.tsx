import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';

type Wine = {
  id: number;
  name: string;
  description: string;
};

interface MyWineFormProps {
  addWine: (wine: Wine) => void;
}

const MyWineForm = ({ addWine }: MyWineFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const submitWine = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('button clicked', e.target);
    const newWineObject: Wine = {
      id: 1 + 1, // This is just a placeholder. In a real app, the backend would assign the ID.
      name: name,
      description: description,
    };
    addWine(newWineObject);
    setName('');
    setDescription('');
    navigate('/mywines');
  };

  return (
    <div className="wine-form-container">
      <h2>Add your wines</h2>
      <form onSubmit={submitWine} className="wine-form">
        <div>
          <label>
            Name
            <input value={name} placeholder="wine name" onChange={handleNameChange} required />
          </label>
        </div>
        <div>
          <TextField
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            sx={{
              '& .MuiInputBase-root': { backgroundColor: '#333' },
              '& .MuiInputLabel-root': { color: '#aaa' },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
          />
          {/* <label>
            Description
            <input value={description} onChange={handleDescriptionChange} />
          </label> */}
        </div>
        <Button
          type="submit"
          variant="contained"
          style={{ marginTop: 10, backgroundColor: '#c947d0' }}
        >
          Save
        </Button>
      </form>
    </div>
  );
};
export default MyWineForm;

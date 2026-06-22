import { useState } from 'react';

type Item = {
  id: number;
  name: string;
  description: string;
};

interface MyWineFormProps {
  addWine: (item: Item) => void;
}

const MyWineForm = ({ addWine }: MyWineFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const submitWine = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('button clicked', e.target);
    const newWineObject: Item = {
      id: 1 + 1, // This is just a placeholder. In a real app, the backend would assign the ID.
      name: name,
      description: description,
    };
    addWine(newWineObject);
    setName('');
    setDescription('');
  };

  return (
    <div>
      <h2>Add your wines</h2>

      <form onSubmit={submitWine} className="item-form">
        <div>
          <label>
            Name
            <input value={name} placeholder="wine name" onChange={handleNameChange} required />
          </label>
        </div>
        <div>
          <label>
            Description
            <input value={description} onChange={handleDescriptionChange} />
          </label>
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};
export default MyWineForm;
